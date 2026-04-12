import * as THREE from 'three';
import { GhostModel } from './GhostModel.js';

export class ARScene {
  constructor(container, ghostData, callbacks = {}) {
    this.container = container;
    this.ghostData = ghostData;
    this.callbacks = callbacks;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.ghostModel = null;

    this.xrSession = null;
    this.xrRefSpace = null;

    this.isFallbackMode = false;
    this.isGhostSpawned = false;

    this.clock = new THREE.Clock();
    this.raycaster = new THREE.Raycaster();
    this.screenCenter = new THREE.Vector2(0, 0);

    this.damagePerShot = 15;
    // Timestamp-based cooldown (not frame-dependent)
    this.lastShotTime = 0;
    this.shootCooldownMs = 500; // minimum ms between shots

    // Screen shake state
    this._shakeOffset = new THREE.Vector3();
    this._shakeIntensity = 0;
    this._shakeDecay = 0;
    this._originalCamPos = null;

    // Hit flash particles
    this._hitParticles = [];
  }

  async init() {
    this.createScene();
    this.createLighting();

    const xrSupported = await this.checkXRSupport();

    if (xrSupported) {
      await this.startXRSession();
    } else {
      await this.startFallbackMode();
    }

    this.animate();
  }

  createScene() {
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.01,
      100
    );
    this.camera.position.set(0, 0.5, 1);
    this._originalCamPos = this.camera.position.clone();

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
    window.addEventListener('resize', () => this.onResize());
  }

  createLighting() {
    const ambient = new THREE.AmbientLight(0x8888aa, 0.4);
    this.scene.add(ambient);

    const moon = new THREE.DirectionalLight(0xaabbff, 0.8);
    moon.position.set(3, 8, 5);
    moon.castShadow = true;
    moon.shadow.mapSize.width = 1024;
    moon.shadow.mapSize.height = 1024;
    this.scene.add(moon);

    const fill = new THREE.DirectionalLight(0x443366, 0.3);
    fill.position.set(-5, 3, -5);
    this.scene.add(fill);

    const hemi = new THREE.HemisphereLight(0x222244, 0x111122, 0.3);
    this.scene.add(hemi);
  }

  async checkXRSupport() {
    if (!navigator.xr) return false;
    try {
      return await navigator.xr.isSessionSupported('immersive-ar');
    } catch {
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

      this.xrRefSpace = await session.requestReferenceSpace('local');

      this.spawnGhost();

    } catch (error) {
      console.error('XR session failed:', error);
      await this.startFallbackMode();
    }
  }

  async startFallbackMode() {
    this.isFallbackMode = true;
    this.renderer.setClearColor(0x0A0B14, 1);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });

      const video = document.createElement('video');
      video.srcObject = stream;
      video.playsInline = true;
      video.autoplay = true;
      video.muted = true;
      video.style.cssText = `
        position: fixed; top: 0; left: 0;
        width: 100%; height: 100%;
        object-fit: cover; z-index: -1;
      `;
      this.container.insertBefore(video, this.renderer.domElement);
      await video.play();
      this.renderer.setClearColor(0x000000, 0);

    } catch {
      this.addDarkBackground();
    }

    this.camera.position.set(0, 0.3, 0.8);
    this.camera.lookAt(0, 0.15, 0);
    this._originalCamPos = this.camera.position.clone();

    this.spawnGhost();

    if (this.callbacks.onFallback) {
      this.callbacks.onFallback();
    }
  }

  addDarkBackground() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, '#1A0F2E');
    gradient.addColorStop(0.5, '#0A0B14');
    gradient.addColorStop(1, '#050510');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);

    const texture = new THREE.CanvasTexture(canvas);
    const bgMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(5, 5),
      new THREE.MeshBasicMaterial({ map: texture })
    );
    bgMesh.position.z = -2;
    this.scene.add(bgMesh);

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(1, 64),
      new THREE.MeshStandardMaterial({ color: 0x151520, roughness: 0.9, metalness: 0.05 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.001;
    floor.receiveShadow = true;
    this.scene.add(floor);
  }

  spawnGhost() {
    if (this.isGhostSpawned) return;

    this.ghostModel = new GhostModel(this.ghostData);
    this.ghostModel.setScale(1.5);

    const obj = this.ghostModel.getObject();

    if (this.isFallbackMode) {
      obj.position.set(0, 0, 0);
    } else {
      obj.position.set(0, 0, -2);
    }

    this.scene.add(obj);
    this.isGhostSpawned = true;

    if (this.callbacks.onGhostSpawned) {
      this.callbacks.onGhostSpawned();
    }
  }

  /**
   * Check if ghost is near screen center using projection instead of raycast.
   * This is more reliable than raycasting on small procedural meshes.
   */
  _isGhostNearCrosshair() {
    if (!this.ghostModel) return false;

    const ghostPos = this.ghostModel.getWorldPosition();
    // Project ghost world position to normalized device coordinates
    const projected = ghostPos.clone().project(this.camera);

    // Distance from screen center (0,0) in NDC
    const dist = Math.sqrt(projected.x * projected.x + projected.y * projected.y);

    // Check ghost is in front of camera
    if (projected.z > 1) return false;

    // Forgiving hit radius: ~15% of screen from center
    return dist < 0.3;
  }

  shoot() {
    if (!this.ghostModel || this.ghostModel.isDead) return { hit: false };

    // Timestamp-based cooldown - immune to frame rate issues
    const now = Date.now();
    if (now - this.lastShotTime < this.shootCooldownMs) return { hit: false, cooldown: true };
    this.lastShotTime = now;

    // Use both: screen-space proximity AND raycast for best results
    const screenHit = this._isGhostNearCrosshair();
    let rayHit = false;
    if (!screenHit) {
      this.raycaster.setFromCamera(this.screenCenter, this.camera);
      rayHit = this.ghostModel.isHit(this.raycaster);
    }

    const hit = screenHit || rayHit;

    if (hit) {
      const dead = this.ghostModel.takeDamage(this.damagePerShot);

      // Spawn a hit flash particle at ghost position
      this._spawnHitFlash();

      // Screen shake
      this._triggerShake(0.012);

      return {
        hit: true,
        damage: this.damagePerShot,
        hp: this.ghostModel.hp,
        maxHp: this.ghostModel.maxHp,
        dead
      };
    }

    return { hit: false };
  }

  /** Spawn a brief flash sprite at the ghost's position */
  _spawnHitFlash() {
    if (!this.ghostModel) return;
    const ghostPos = this.ghostModel.getWorldPosition();

    const spriteMat = new THREE.SpriteMaterial({
      color: 0xffaa00,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
      depthTest: false,
    });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.position.copy(ghostPos);
    sprite.scale.setScalar(0.15);
    this.scene.add(sprite);

    this._hitParticles.push({
      sprite,
      born: performance.now(),
      life: 250, // ms
    });
  }

  /** Trigger camera shake */
  _triggerShake(intensity) {
    this._shakeIntensity = intensity;
    this._shakeDecay = intensity;
  }

  captureGhost(onComplete) {
    if (!this.ghostModel) return;
    this.ghostModel.playCaptureAnimation(onComplete);
  }

  onSessionEnd() {
    this.xrSession = null;
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    this.renderer.setAnimationLoop((time, frame) => {
      this.update(frame);
      this.render();
    });
  }

  update(frame) {
    const delta = this.clock.getDelta();

    // Update ghost
    if (this.ghostModel) {
      this.ghostModel.update(delta);
    }

    // Update hit particles
    const now = performance.now();
    for (let i = this._hitParticles.length - 1; i >= 0; i--) {
      const p = this._hitParticles[i];
      const age = now - p.born;
      if (age >= p.life) {
        this.scene.remove(p.sprite);
        p.sprite.material.dispose();
        this._hitParticles.splice(i, 1);
      } else {
        const t = age / p.life;
        p.sprite.material.opacity = 1 - t;
        p.sprite.scale.setScalar(0.15 + t * 0.2);
      }
    }

    // Camera shake
    if (this._shakeDecay > 0.0005) {
      this._shakeOffset.set(
        (Math.random() - 0.5) * this._shakeDecay * 2,
        (Math.random() - 0.5) * this._shakeDecay * 2,
        0
      );
      this.camera.position.copy(this._originalCamPos).add(this._shakeOffset);
      this._shakeDecay *= 0.85; // exponential decay per frame
    } else if (this._shakeDecay > 0) {
      this._shakeDecay = 0;
      this.camera.position.copy(this._originalCamPos);
    }
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.renderer.setAnimationLoop(null);

    if (this.xrSession) {
      this.xrSession.end().catch(() => {});
    }

    const video = this.container.querySelector('video');
    if (video) {
      video.srcObject?.getTracks().forEach(t => t.stop());
      video.remove();
    }

    // Clean up hit particles
    this._hitParticles.forEach(p => {
      this.scene.remove(p.sprite);
      p.sprite.material.dispose();
    });
    this._hitParticles = [];

    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }

    this.renderer.dispose();
  }
}
