import * as THREE from 'three';
import { CreatureModel } from './CreatureModel.js';

/**
 * AR Scene Manager using WebXR
 * Handles AR session, plane detection, and creature placement
 */
export class ARScene {
  constructor(container, creatureData) {
    this.container = container;
    this.creatureData = creatureData;
    this.creature = null;
    this.isARSupported = false;
    this.isARActive = false;
    this.isFallbackMode = false;
    this.hitTestSource = null;
    this.reticle = null;
    this.isCreaturePlaced = false;
    
    this.onCreaturePlaced = null;
    this.onARStarted = null;
    this.onARError = null;
    
    this.init();
  }

  async init() {
    // Setup renderer
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.xr.enabled = true;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    this.container.appendChild(this.renderer.domElement);

    // Setup scene
    this.scene = new THREE.Scene();

    // Setup camera
    this.camera = new THREE.PerspectiveCamera(
      70, 
      window.innerWidth / window.innerHeight, 
      0.01, 
      20
    );

    // Lighting
    this.setupLighting();

    // Create reticle for placement
    this.createReticle();

    // Create creature
    this.creature = new CreatureModel(this.creatureData);

    // Check AR support
    await this.checkARSupport();

    // Handle resize
    window.addEventListener('resize', () => this.onResize());

    // Clock for animations
    this.clock = new THREE.Clock();
  }

  setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // Main directional light (sun)
    this.mainLight = new THREE.DirectionalLight(0xffffff, 1);
    this.mainLight.position.set(5, 10, 5);
    this.mainLight.castShadow = true;
    this.mainLight.shadow.mapSize.width = 1024;
    this.mainLight.shadow.mapSize.height = 1024;
    this.mainLight.shadow.camera.near = 0.1;
    this.mainLight.shadow.camera.far = 20;
    this.mainLight.shadow.camera.left = -2;
    this.mainLight.shadow.camera.right = 2;
    this.mainLight.shadow.camera.top = 2;
    this.mainLight.shadow.camera.bottom = -2;
    this.scene.add(this.mainLight);

    // Fill light
    const fillLight = new THREE.DirectionalLight(0x88ccff, 0.3);
    fillLight.position.set(-5, 5, -5);
    this.scene.add(fillLight);

    // Rim light
    const rimLight = new THREE.DirectionalLight(0xffaa88, 0.2);
    rimLight.position.set(0, 5, -10);
    this.scene.add(rimLight);

    // Hemisphere light for ambient
    const hemiLight = new THREE.HemisphereLight(0x88ccff, 0x444422, 0.4);
    this.scene.add(hemiLight);
  }

  createReticle() {
    // Ring reticle
    const ringGeom = new THREE.RingGeometry(0.1, 0.12, 32);
    ringGeom.rotateX(-Math.PI / 2);
    
    const ringMat = new THREE.MeshBasicMaterial({ 
      color: 0xFF6B9D,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });
    
    this.reticle = new THREE.Mesh(ringGeom, ringMat);
    this.reticle.visible = false;
    this.reticle.matrixAutoUpdate = false;
    this.scene.add(this.reticle);

    // Animated inner circle
    const innerGeom = new THREE.CircleGeometry(0.08, 32);
    innerGeom.rotateX(-Math.PI / 2);
    
    const innerMat = new THREE.MeshBasicMaterial({ 
      color: 0xFF6B9D,
      transparent: true,
      opacity: 0.3
    });
    
    this.reticleInner = new THREE.Mesh(innerGeom, innerMat);
    this.reticle.add(this.reticleInner);
  }

  async checkARSupport() {
    if ('xr' in navigator) {
      try {
        this.isARSupported = await navigator.xr.isSessionSupported('immersive-ar');
      } catch (e) {
        console.log('XR support check failed:', e);
        this.isARSupported = false;
      }
    }
    
    if (!this.isARSupported) {
      console.log('WebXR AR not supported, will use fallback mode');
    }
    
    return this.isARSupported;
  }

  async startAR() {
    if (this.isARSupported) {
      try {
        await this.startWebXR();
      } catch (error) {
        console.error('WebXR start failed:', error);
        this.startFallbackMode();
      }
    } else {
      this.startFallbackMode();
    }
  }

  async startWebXR() {
    const sessionInit = {
      requiredFeatures: ['hit-test'],
      optionalFeatures: ['dom-overlay', 'light-estimation'],
      domOverlay: { root: document.body }
    };

    try {
      const session = await navigator.xr.requestSession('immersive-ar', sessionInit);
      
      this.renderer.xr.setReferenceSpaceType('local');
      await this.renderer.xr.setSession(session);
      
      this.xrSession = session;
      this.isARActive = true;

      // Get reference space
      const referenceSpace = await session.requestReferenceSpace('local');
      const viewerSpace = await session.requestReferenceSpace('viewer');

      // Request hit test source
      this.hitTestSource = await session.requestHitTestSource({ space: viewerSpace });

      session.addEventListener('end', () => {
        this.isARActive = false;
        this.hitTestSource = null;
      });

      // Start render loop
      this.renderer.setAnimationLoop((time, frame) => this.renderXR(time, frame));

      if (this.onARStarted) this.onARStarted(false);
      
    } catch (error) {
      throw error;
    }
  }

  startFallbackMode() {
    this.isFallbackMode = true;
    this.isARActive = true;

    // Setup camera for fallback mode
    this.camera.position.set(0, 0.5, 1.5);
    this.camera.lookAt(0, 0.2, 0);

    // Add ground plane
    const groundGeom = new THREE.PlaneGeometry(10, 10);
    const groundMat = new THREE.MeshStandardMaterial({ 
      color: 0x88aa88,
      roughness: 0.8,
      metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeom, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Add grid helper
    const grid = new THREE.GridHelper(10, 20, 0x666666, 0x444444);
    grid.position.y = 0.001;
    this.scene.add(grid);

    // Add sky gradient
    this.scene.background = new THREE.Color(0x87CEEB);

    // Place creature immediately in fallback mode
    this.placeCreature(new THREE.Vector3(0, 0, 0));

    // Setup orbit controls simulation
    this.setupFallbackControls();

    // Start render loop
    this.renderer.setAnimationLoop((time) => this.renderFallback(time));

    if (this.onARStarted) this.onARStarted(true);
  }

  setupFallbackControls() {
    let isDragging = false;
    let previousX = 0;
    let previousY = 0;
    let rotationY = 0;
    let rotationX = 0.3;
    let distance = 1.5;

    const updateCamera = () => {
      this.camera.position.x = Math.sin(rotationY) * Math.cos(rotationX) * distance;
      this.camera.position.y = Math.sin(rotationX) * distance + 0.3;
      this.camera.position.z = Math.cos(rotationY) * Math.cos(rotationX) * distance;
      this.camera.lookAt(0, 0.2, 0);
    };

    const onPointerDown = (e) => {
      // Ignore if clicking on UI
      if (e.target.closest('.bottom-bar') || e.target.closest('.top-bar')) return;
      
      isDragging = true;
      previousX = e.clientX || e.touches?.[0]?.clientX || 0;
      previousY = e.clientY || e.touches?.[0]?.clientY || 0;
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      
      const currentX = e.clientX || e.touches?.[0]?.clientX || 0;
      const currentY = e.clientY || e.touches?.[0]?.clientY || 0;
      
      const deltaX = currentX - previousX;
      const deltaY = currentY - previousY;
      
      rotationY += deltaX * 0.01;
      rotationX = Math.max(0.1, Math.min(1.2, rotationX + deltaY * 0.01));
      
      previousX = currentX;
      previousY = currentY;
      
      updateCamera();
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const onWheel = (e) => {
      distance = Math.max(0.5, Math.min(5, distance + e.deltaY * 0.001));
      updateCamera();
    };

    this.container.addEventListener('mousedown', onPointerDown);
    this.container.addEventListener('mousemove', onPointerMove);
    this.container.addEventListener('mouseup', onPointerUp);
    this.container.addEventListener('touchstart', onPointerDown);
    this.container.addEventListener('touchmove', onPointerMove);
    this.container.addEventListener('touchend', onPointerUp);
    this.container.addEventListener('wheel', onWheel);

    updateCamera();
  }

  placeCreature(position) {
    if (this.isCreaturePlaced) return;

    const creatureObj = this.creature.getObject();
    creatureObj.position.copy(position);
    creatureObj.position.y = 0;
    this.scene.add(creatureObj);
    
    this.isCreaturePlaced = true;
    this.reticle.visible = false;

    // Entrance animation
    creatureObj.scale.set(0, 0, 0);
    this.animateScale(creatureObj, 1, 500);

    if (this.onCreaturePlaced) this.onCreaturePlaced();
  }

  animateScale(object, targetScale, duration) {
    const startTime = performance.now();
    const startScale = object.scale.x;
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Elastic easing
      const elastic = progress === 1 
        ? 1 
        : Math.pow(2, -10 * progress) * Math.sin((progress * 10 - 0.75) * (2 * Math.PI) / 3) + 1;
      
      const scale = startScale + (targetScale - startScale) * elastic;
      object.scale.setScalar(scale);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }

  renderXR(time, frame) {
    const deltaTime = this.clock.getDelta();

    // Hit test for reticle placement
    if (!this.isCreaturePlaced && this.hitTestSource && frame) {
      const hitTestResults = frame.getHitTestResults(this.hitTestSource);
      
      if (hitTestResults.length > 0) {
        const hit = hitTestResults[0];
        const referenceSpace = this.renderer.xr.getReferenceSpace();
        const pose = hit.getPose(referenceSpace);
        
        if (pose) {
          this.reticle.visible = true;
          this.reticle.matrix.fromArray(pose.transform.matrix);
          
          // Animate reticle
          const scale = 1 + Math.sin(time * 0.003) * 0.1;
          this.reticleInner.scale.setScalar(scale);
        }
      } else {
        this.reticle.visible = false;
      }
    }

    // Update creature
    if (this.creature && this.isCreaturePlaced) {
      this.creature.update(deltaTime);
      
      // Make creature look at camera
      const cameraPos = new THREE.Vector3();
      this.camera.getWorldPosition(cameraPos);
      this.creature.lookAt(cameraPos);
    }

    this.renderer.render(this.scene, this.camera);
  }

  renderFallback(time) {
    const deltaTime = this.clock.getDelta();

    // Update creature
    if (this.creature && this.isCreaturePlaced) {
      this.creature.update(deltaTime);
    }

    this.renderer.render(this.scene, this.camera);
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // Tap to place in AR mode
  handleTap(x, y) {
    if (this.isFallbackMode) return;
    
    if (!this.isCreaturePlaced && this.reticle.visible) {
      const position = new THREE.Vector3();
      position.setFromMatrixPosition(this.reticle.matrix);
      this.placeCreature(position);
    }
  }

  // Interaction methods
  feedCreature() {
    if (this.creature) {
      this.creature.playHappy();
      return this.creatureData.sounds.feed[
        Math.floor(Math.random() * this.creatureData.sounds.feed.length)
      ];
    }
  }

  petCreature() {
    if (this.creature) {
      this.creature.playHappy();
      return this.creatureData.sounds.pet[
        Math.floor(Math.random() * this.creatureData.sounds.pet.length)
      ];
    }
  }

  playWithCreature() {
    if (this.creature) {
      this.creature.playHappy();
      return this.creatureData.sounds.happy[
        Math.floor(Math.random() * this.creatureData.sounds.happy.length)
      ];
    }
  }

  dispose() {
    if (this.xrSession) {
      this.xrSession.end();
    }
    this.renderer.setAnimationLoop(null);
    this.renderer.dispose();
  }
}
