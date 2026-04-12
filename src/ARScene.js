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
    this.shootCooldown = 0;
    this.shootCooldownTime = 400;
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

  shoot() {
    if (!this.ghostModel || this.ghostModel.isDead) return { hit: false };
    if (this.shootCooldown > 0) return { hit: false };

    this.shootCooldown = this.shootCooldownTime;

    this.raycaster.setFromCamera(this.screenCenter, this.camera);
    const hit = this.ghostModel.isHit(this.raycaster);

    if (hit) {
      const dead = this.ghostModel.takeDamage(this.damagePerShot);
      return {
        hit: true,
        hp: this.ghostModel.hp,
        maxHp: this.ghostModel.maxHp,
        dead
      };
    }

    return { hit: false };
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

    if (this.shootCooldown > 0) {
      this.shootCooldown -= delta * 1000;
    }

    if (this.ghostModel) {
      this.ghostModel.update(delta);
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

    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }

    this.renderer.dispose();
  }
}
