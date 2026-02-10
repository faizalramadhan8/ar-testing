import * as THREE from 'three';
import { CreatureModel } from './CreatureModel.js';

export class ARScene {
  constructor(container, creatureData, callbacks = {}) {
    this.container = container;
    this.creatureData = creatureData;
    this.callbacks = callbacks;
    
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.creatureModel = null;
    
    this.xrSession = null;
    this.xrRefSpace = null;
    this.hitTestSource = null;
    
    this.isFallbackMode = false;
    this.isCreaturePlaced = false;
    
    this.reticle = null;
    this.clock = new THREE.Clock();
    
    // Touch controls for fallback
    this.touchState = {
      isDragging: false,
      lastX: 0,
      lastY: 0,
      rotationX: 0,
      rotationY: 0,
      zoom: 1
    };
  }

  async init() {
    this.createScene();
    this.createLighting();
    this.createReticle();
    
    // Check WebXR support
    const xrSupported = await this.checkXRSupport();
    
    if (xrSupported) {
      await this.startXRSession();
    } else {
      await this.startFallbackMode();
    }
    
    this.animate();
  }

  createScene() {
    // Scene
    this.scene = new THREE.Scene();
    
    // Camera
    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.01,
      100
    );
    this.camera.position.set(0, 0.5, 1);
    
    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.xr.enabled = true;
    this.renderer.setClearColor(0x000000, 0);
    
    this.container.appendChild(this.renderer.domElement);
    
    // Handle resize
    window.addEventListener('resize', () => this.onResize());
  }

  createLighting() {
    // Ambient light
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambient);
    
    // Main directional light (sun)
    const sun = new THREE.DirectionalLight(0xffffff, 1.0);
    sun.position.set(5, 10, 5);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 1024;
    sun.shadow.mapSize.height = 1024;
    this.scene.add(sun);
    
    // Fill light
    const fill = new THREE.DirectionalLight(0x9090ff, 0.3);
    fill.position.set(-5, 3, -5);
    this.scene.add(fill);
    
    // Rim light
    const rim = new THREE.DirectionalLight(0xffffcc, 0.4);
    rim.position.set(0, 5, -10);
    this.scene.add(rim);
    
    // Hemisphere light for natural feel
    const hemi = new THREE.HemisphereLight(0x87CEEB, 0x98D98E, 0.4);
    this.scene.add(hemi);
  }

  createReticle() {
    // Placement reticle
    const geometry = new THREE.RingGeometry(0.08, 0.1, 32);
    geometry.rotateX(-Math.PI / 2);
    
    const material = new THREE.MeshBasicMaterial({
      color: 0x4ECDC4,
      transparent: true,
      opacity: 0.8
    });
    
    this.reticle = new THREE.Mesh(geometry, material);
    this.reticle.visible = false;
    this.reticle.matrixAutoUpdate = false;
    this.scene.add(this.reticle);
  }

  async checkXRSupport() {
    if (!navigator.xr) return false;
    
    try {
      const supported = await navigator.xr.isSessionSupported('immersive-ar');
      return supported;
    } catch (e) {
      return false;
    }
  }

  async startXRSession() {
    try {
      const session = await navigator.xr.requestSession('immersive-ar', {
        requiredFeatures: ['local'],
        optionalFeatures: ['hit-test', 'dom-overlay'],
        domOverlay: { root: document.body }
      });
      
      this.xrSession = session;
      this.renderer.xr.setSession(session);
      
      session.addEventListener('end', () => this.onSessionEnd());
      
      // Setup hit testing
      const viewerSpace = await session.requestReferenceSpace('viewer');
      this.xrRefSpace = await session.requestReferenceSpace('local');
      
      try {
        this.hitTestSource = await session.requestHitTestSource({ space: viewerSpace });
      } catch (e) {
        console.log('Hit test not available');
      }
      
      // Setup tap to place
      session.addEventListener('select', () => this.onSelect());
      
    } catch (error) {
      console.error('XR session failed:', error);
      await this.startFallbackMode();
    }
  }

  async startFallbackMode() {
    this.isFallbackMode = true;
    
    // Set background color
    this.renderer.setClearColor(0x1A1D2E, 1);
    
    // Try to get camera
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      // Create video element
      const video = document.createElement('video');
      video.srcObject = stream;
      video.playsInline = true;
      video.autoplay = true;
      video.muted = true;
      
      video.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        z-index: -1;
      `;
      
      this.container.insertBefore(video, this.renderer.domElement);
      
      await video.play();
      
      // Make renderer transparent
      this.renderer.setClearColor(0x000000, 0);
      
    } catch (e) {
      console.log('Camera not available, using solid background');
      
      // Add gradient background
      this.addGradientBackground();
    }
    
    // Adjust camera for fallback
    this.camera.position.set(0, 0.3, 0.8);
    this.camera.lookAt(0, 0.15, 0);
    
    // Place creature immediately
    this.placeCreature(new THREE.Vector3(0, 0, 0));
    
    // Setup touch controls
    this.setupTouchControls();
    
    // Notify callback
    if (this.callbacks.onError) {
      this.callbacks.onError(new Error('Fallback mode'));
    }
  }

  addGradientBackground() {
    // Create a gradient plane behind the scene
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    const gradient = ctx.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, '#2D1B4E');
    gradient.addColorStop(0.5, '#1A1D2E');
    gradient.addColorStop(1, '#0D1117');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
    
    const texture = new THREE.CanvasTexture(canvas);
    const bgGeom = new THREE.PlaneGeometry(5, 5);
    const bgMat = new THREE.MeshBasicMaterial({ map: texture });
    const bgMesh = new THREE.Mesh(bgGeom, bgMat);
    bgMesh.position.z = -2;
    this.scene.add(bgMesh);
    
    // Add floor
    const floorGeom = new THREE.CircleGeometry(1, 64);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x2A2D3E,
      roughness: 0.8,
      metalness: 0.1
    });
    const floor = new THREE.Mesh(floorGeom, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.001;
    floor.receiveShadow = true;
    this.scene.add(floor);
  }

  setupTouchControls() {
    const el = this.renderer.domElement;
    
    el.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.touchState.isDragging = true;
        this.touchState.lastX = e.touches[0].clientX;
        this.touchState.lastY = e.touches[0].clientY;
      }
    });
    
    el.addEventListener('touchmove', (e) => {
      if (!this.touchState.isDragging || !this.creatureModel) return;
      
      if (e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - this.touchState.lastX;
        const deltaY = e.touches[0].clientY - this.touchState.lastY;
        
        // Rotate creature
        this.touchState.rotationY += deltaX * 0.01;
        
        this.touchState.lastX = e.touches[0].clientX;
        this.touchState.lastY = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        // Pinch to zoom
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        
        if (this.touchState.lastPinchDist) {
          const delta = dist - this.touchState.lastPinchDist;
          this.touchState.zoom = Math.max(0.5, Math.min(2, this.touchState.zoom + delta * 0.005));
          this.camera.position.z = 0.8 / this.touchState.zoom;
        }
        
        this.touchState.lastPinchDist = dist;
      }
    });
    
    el.addEventListener('touchend', () => {
      this.touchState.isDragging = false;
      this.touchState.lastPinchDist = null;
    });
    
    // Mouse controls for desktop
    el.addEventListener('mousedown', (e) => {
      this.touchState.isDragging = true;
      this.touchState.lastX = e.clientX;
      this.touchState.lastY = e.clientY;
    });
    
    el.addEventListener('mousemove', (e) => {
      if (!this.touchState.isDragging || !this.creatureModel) return;
      
      const deltaX = e.clientX - this.touchState.lastX;
      this.touchState.rotationY += deltaX * 0.01;
      
      this.touchState.lastX = e.clientX;
      this.touchState.lastY = e.clientY;
    });
    
    el.addEventListener('mouseup', () => {
      this.touchState.isDragging = false;
    });
    
    el.addEventListener('wheel', (e) => {
      this.touchState.zoom = Math.max(0.5, Math.min(2, this.touchState.zoom - e.deltaY * 0.001));
      this.camera.position.z = 0.8 / this.touchState.zoom;
    });
  }

  onSelect() {
    if (this.isCreaturePlaced) return;
    if (!this.reticle.visible) return;
    
    const position = new THREE.Vector3();
    position.setFromMatrixPosition(this.reticle.matrix);
    
    this.placeCreature(position);
  }

  placeCreature(position) {
    if (this.isCreaturePlaced) return;
    
    // Create creature model
    this.creatureModel = new CreatureModel(this.creatureData);
    this.creatureModel.setScale(1.5);
    
    const obj = this.creatureModel.getObject();
    obj.position.copy(position);
    this.scene.add(obj);
    
    this.isCreaturePlaced = true;
    this.reticle.visible = false;
    
    // Callback
    if (this.callbacks.onPlaced) {
      this.callbacks.onPlaced();
    }
  }

  onSessionEnd() {
    this.xrSession = null;
    this.hitTestSource = null;
  }

  onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    
    this.renderer.setSize(width, height);
  }

  animate() {
    this.renderer.setAnimationLoop((time, frame) => {
      this.update(frame);
      this.render();
    });
  }

  update(frame) {
    const deltaTime = this.clock.getDelta();
    
    // Update creature
    if (this.creatureModel) {
      this.creatureModel.update(deltaTime);
      
      // Apply touch rotation in fallback mode
      if (this.isFallbackMode) {
        const obj = this.creatureModel.getObject();
        obj.rotation.y = this.touchState.rotationY;
      }
    }
    
    // Update hit test in XR mode
    if (frame && this.hitTestSource && !this.isCreaturePlaced) {
      const hitTestResults = frame.getHitTestResults(this.hitTestSource);
      
      if (hitTestResults.length > 0) {
        const hit = hitTestResults[0];
        const pose = hit.getPose(this.xrRefSpace);
        
        if (pose) {
          this.reticle.visible = true;
          this.reticle.matrix.fromArray(pose.transform.matrix);
        }
      } else {
        this.reticle.visible = false;
      }
    }
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}