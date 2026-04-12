import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class GhostModel {
  constructor(ghostData) {
    this.data = ghostData;
    this.group = new THREE.Group();
    this.mixer = null;
    this.animations = {};
    this.animationTime = 0;
    this.clock = new THREE.Clock();

    this.state = 'idle';
    this.hp = ghostData.hp;
    this.maxHp = ghostData.hp;
    this.isModelLoaded = false;
    this.isDead = false;

    this.parts = {};
    this.model = null;
    this.root = null;

    this.dodgeTimer = 0;
    this.dodgeInterval = 3000 / ghostData.difficulty;
    this.dodgeTarget = new THREE.Vector3();
    this.isDodging = false;
    this.dodgeSpeed = 0.02 * ghostData.difficulty;
    this.dodgeBounds = 0.4;

    this.modelUrls = {
      kuntilanak: '/models/kuntilanak.glb',
    };

    this.init();
  }

  async init() {
    const modelUrl = this.modelUrls[this.data.id];

    if (modelUrl) {
      try {
        await this.loadGLBModel(modelUrl);
      } catch (error) {
        console.log('GLB load failed, using procedural:', error);
        this.buildProceduralGhost();
      }
    } else {
      this.buildProceduralGhost();
    }

    this.addShadow();
    this.isModelLoaded = true;
  }

  async loadGLBModel(url) {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();
      loader.load(
        url,
        (gltf) => {
          this.model = gltf.scene;

          const box = new THREE.Box3().setFromObject(this.model);
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = 0.3 / maxDim;
          this.model.scale.setScalar(scale);

          const center = box.getCenter(new THREE.Vector3());
          this.model.position.sub(center.multiplyScalar(scale));
          this.model.position.y = 0;

          this.model.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              if (child.material) {
                const oldMat = child.material;
                child.material = new THREE.MeshStandardMaterial({
                  color: oldMat.color || new THREE.Color(this.data.colors.primary),
                  map: oldMat.map || null,
                  transparent: true,
                  opacity: 0.85,
                  emissive: new THREE.Color(this.data.colors.accent),
                  emissiveIntensity: 0.15,
                });
              }
            }
          });

          if (gltf.animations && gltf.animations.length > 0) {
            this.mixer = new THREE.AnimationMixer(this.model);
            gltf.animations.forEach((clip) => {
              this.animations[clip.name.toLowerCase()] = this.mixer.clipAction(clip);
            });
            if (this.animations['idle']) this.animations['idle'].play();
          }

          this.group.add(this.model);
          resolve();
        },
        undefined,
        reject
      );
    });
  }

  buildProceduralGhost() {
    const { primary, secondary, accent } = this.data.colors;
    const type = this.data.id;

    const toonGradient = this.createToonGradient();
    const createMat = (color, opts = {}) => new THREE.MeshToonMaterial({
      color,
      gradientMap: toonGradient,
      transparent: opts.transparent || false,
      opacity: opts.opacity ?? 1,
    });

    const ghostMat = (color) => new THREE.MeshStandardMaterial({
      color,
      transparent: true,
      opacity: 0.8,
      emissive: new THREE.Color(accent),
      emissiveIntensity: 0.2,
      side: THREE.DoubleSide,
    });

    this.root = new THREE.Group();
    this.group.add(this.root);

    if (type === 'pocong') {
      this.buildPocong(ghostMat, primary, secondary);
    } else if (type === 'tuyul') {
      this.buildTuyul(createMat, ghostMat, primary, secondary, accent);
    } else if (type === 'genderuwo') {
      this.buildGenderuwo(createMat, ghostMat, primary, secondary, accent);
    } else if (type === 'sundel_bolong') {
      this.buildSundelBolong(ghostMat, primary, secondary, accent);
    } else if (type === 'wewe_gombel') {
      this.buildWeweGombel(ghostMat, primary, secondary, accent);
    } else {
      this.buildKuntilanak(ghostMat, primary, secondary, accent);
    }
  }

  createToonGradient() {
    const canvas = document.createElement('canvas');
    canvas.width = 4;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#444'; ctx.fillRect(0, 0, 1, 1);
    ctx.fillStyle = '#777'; ctx.fillRect(1, 0, 1, 1);
    ctx.fillStyle = '#aaa'; ctx.fillRect(2, 0, 1, 1);
    ctx.fillStyle = '#fff'; ctx.fillRect(3, 0, 1, 1);
    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.NearestFilter;
    tex.magFilter = THREE.NearestFilter;
    return tex;
  }

  buildKuntilanak(ghostMat, primary, secondary, accent) {
    const body = new THREE.Group();
    body.position.y = 0.1;
    this.root.add(body);
    this.parts.body = body;

    const dressGeo = new THREE.ConeGeometry(0.08, 0.22, 16, 1, true);
    const dress = new THREE.Mesh(dressGeo, ghostMat(primary));
    dress.position.y = -0.02;
    body.add(dress);

    const headGeo = new THREE.SphereGeometry(0.06, 32, 32);
    const head = new THREE.Mesh(headGeo, ghostMat(primary));
    head.position.y = 0.1;
    body.add(head);
    this.parts.head = head;

    const hairMat = ghostMat(secondary);
    hairMat.opacity = 0.9;
    for (let i = -1; i <= 1; i += 0.5) {
      const hairGeo = new THREE.PlaneGeometry(0.04, 0.2);
      const hair = new THREE.Mesh(hairGeo, hairMat);
      hair.position.set(i * 0.03, 0.02, -0.03);
      hair.rotation.x = 0.2;
      head.add(hair);
    }

    this.addGhostEyes(head, accent);
  }

  buildPocong(ghostMat, primary, secondary) {
    const body = new THREE.Group();
    body.position.y = 0.1;
    this.root.add(body);
    this.parts.body = body;

    const wrapGeo = new THREE.CapsuleGeometry(0.06, 0.16, 16, 16);
    const wrap = new THREE.Mesh(wrapGeo, ghostMat(primary));
    body.add(wrap);

    const faceGeo = new THREE.SphereGeometry(0.055, 32, 32);
    const face = new THREE.Mesh(faceGeo, ghostMat(0xD4D4CC));
    face.position.y = 0.1;
    face.scale.set(0.9, 1, 0.8);
    body.add(face);
    this.parts.head = face;

    this.addGhostEyes(face, 0x1A1A1A, true);
  }

  buildTuyul(createMat, ghostMat, primary, secondary, accent) {
    const body = new THREE.Group();
    body.position.y = 0.06;
    this.root.add(body);
    this.parts.body = body;

    const torsoGeo = new THREE.SphereGeometry(0.05, 24, 24);
    const torso = new THREE.Mesh(torsoGeo, ghostMat(primary));
    body.add(torso);

    const headGeo = new THREE.SphereGeometry(0.06, 32, 32);
    headGeo.scale(1, 0.9, 1);
    const head = new THREE.Mesh(headGeo, ghostMat(primary));
    head.position.y = 0.08;
    body.add(head);
    this.parts.head = head;

    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x1A1A1A });
    [-0.025, 0.025].forEach(x => {
      const eyeGeo = new THREE.SphereGeometry(0.012, 16, 16);
      const eye = new THREE.Mesh(eyeGeo, eyeMat);
      eye.position.set(x, 0, 0.05);
      head.add(eye);

      const shine = new THREE.Mesh(
        new THREE.SphereGeometry(0.004, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      shine.position.set(0.004, 0.004, 0.005);
      eye.add(shine);
    });

    const smileCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.02, 0, 0),
      new THREE.Vector3(0, -0.01, 0.005),
      new THREE.Vector3(0.02, 0, 0)
    );
    const smileGeo = new THREE.TubeGeometry(smileCurve, 12, 0.003, 6, false);
    const smile = new THREE.Mesh(smileGeo, new THREE.MeshBasicMaterial({ color: accent }));
    smile.position.set(0, -0.02, 0.04);
    head.add(smile);
  }

  buildGenderuwo(createMat, ghostMat, primary, secondary, accent) {
    const body = new THREE.Group();
    body.position.y = 0.12;
    this.root.add(body);
    this.parts.body = body;

    const torsoGeo = new THREE.SphereGeometry(0.1, 32, 32);
    torsoGeo.scale(1.2, 1, 1);
    const torso = new THREE.Mesh(torsoGeo, ghostMat(primary));
    body.add(torso);

    const headGeo = new THREE.SphereGeometry(0.07, 32, 32);
    const head = new THREE.Mesh(headGeo, ghostMat(primary));
    head.position.y = 0.12;
    body.add(head);
    this.parts.head = head;

    const furMat = ghostMat(secondary);
    furMat.opacity = 0.6;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const tuft = new THREE.Mesh(
        new THREE.SphereGeometry(0.015, 8, 8),
        furMat
      );
      tuft.position.set(Math.cos(angle) * 0.09, Math.random() * 0.05 - 0.02, Math.sin(angle) * 0.09);
      torso.add(tuft);
    }

    [-0.04, 0.04].forEach(x => {
      const armGeo = new THREE.CapsuleGeometry(0.025, 0.1, 8, 8);
      const arm = new THREE.Mesh(armGeo, ghostMat(primary));
      arm.position.set(x * 2.8, -0.02, 0);
      arm.rotation.z = x > 0 ? -0.4 : 0.4;
      body.add(arm);
    });

    this.addGhostEyes(head, accent, false, 0.04);
  }

  buildSundelBolong(ghostMat, primary, secondary, accent) {
    const body = new THREE.Group();
    body.position.y = 0.1;
    this.root.add(body);
    this.parts.body = body;

    const dressGeo = new THREE.ConeGeometry(0.07, 0.2, 16, 1, true);
    const dress = new THREE.Mesh(dressGeo, ghostMat(primary));
    dress.position.y = -0.02;
    body.add(dress);

    const headGeo = new THREE.SphereGeometry(0.055, 32, 32);
    const head = new THREE.Mesh(headGeo, ghostMat(primary));
    head.position.y = 0.1;
    body.add(head);
    this.parts.head = head;

    const hairMat = ghostMat(secondary);
    hairMat.opacity = 0.9;
    for (let i = -1; i <= 1; i += 0.5) {
      const hairGeo = new THREE.PlaneGeometry(0.035, 0.18);
      const hair = new THREE.Mesh(hairGeo, hairMat);
      hair.position.set(i * 0.025, 0.01, -0.025);
      hair.rotation.x = 0.15;
      head.add(hair);
    }

    const holeGeo = new THREE.CircleGeometry(0.04, 24);
    const holeMat = new THREE.MeshBasicMaterial({
      color: 0x0A0B14,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    });
    const hole = new THREE.Mesh(holeGeo, holeMat);
    hole.position.set(0, 0, -0.065);
    hole.rotation.y = Math.PI;
    body.add(hole);

    this.addGhostEyes(head, accent);
  }

  buildWeweGombel(ghostMat, primary, secondary, accent) {
    const body = new THREE.Group();
    body.position.y = 0.1;
    this.root.add(body);
    this.parts.body = body;

    const robeGeo = new THREE.ConeGeometry(0.09, 0.24, 16, 1, true);
    const robe = new THREE.Mesh(robeGeo, ghostMat(primary));
    robe.position.y = -0.02;
    body.add(robe);

    const headGeo = new THREE.SphereGeometry(0.06, 32, 32);
    const head = new THREE.Mesh(headGeo, ghostMat(secondary));
    head.position.y = 0.11;
    body.add(head);
    this.parts.head = head;

    const hairMat = ghostMat(secondary);
    for (let i = -2; i <= 2; i++) {
      const hairGeo = new THREE.PlaneGeometry(0.03, 0.15 + Math.random() * 0.05);
      const hair = new THREE.Mesh(hairGeo, hairMat);
      hair.position.set(i * 0.02, 0, -0.03);
      hair.rotation.x = 0.25 + Math.random() * 0.1;
      head.add(hair);
    }

    this.addGhostEyes(head, accent, false, 0.035);
  }

  addGhostEyes(head, color, hollow = false, spacing = 0.03) {
    [-spacing, spacing].forEach(x => {
      const eyeGeo = new THREE.SphereGeometry(hollow ? 0.015 : 0.01, 16, 16);
      const eyeMat = new THREE.MeshBasicMaterial({ color: hollow ? 0x1A1A1A : color });
      const eye = new THREE.Mesh(eyeGeo, eyeMat);
      eye.position.set(x, 0.01, 0.05);
      head.add(eye);

      if (!hollow) {
        const glow = new THREE.PointLight(color, 0.3, 0.15);
        glow.position.copy(eye.position);
        head.add(glow);
      }
    });
  }

  addShadow() {
    const shadowGeo = new THREE.CircleGeometry(0.1, 32);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.15,
      depthWrite: false
    });
    this.shadow = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadow.rotation.x = -Math.PI / 2;
    this.shadow.position.y = 0.002;
    this.group.add(this.shadow);
  }

  // === GHOST ANIMATIONS ===

  playHitAnimation() {
    if (this.isDead) return;
    const prevState = this.state;
    this.state = 'hit';

    // --- RED FLASH: turn ghost red then flicker opacity ---
    const meshes = [];
    this.group.traverse(child => {
      if (child.isMesh && child.material) {
        meshes.push({
          mesh: child,
          origEmissive: child.material.emissive.clone(),
          origEmissiveIntensity: child.material.emissiveIntensity || 0,
          origOpacity: child.material.opacity
        });
        // Immediately flash red
        child.material.emissive = new THREE.Color(0xff0000);
        child.material.emissiveIntensity = 2.0;
      }
    });

    // Flicker opacity rapidly for 400ms
    const flickerDur = 400;
    const flickerStart = performance.now();
    const flickerInterval = 40; // ms per flicker step
    let lastFlicker = flickerStart;
    let flickerHigh = false;

    const flickerAnim = () => {
      const now = performance.now();
      const elapsed = now - flickerStart;
      if (elapsed >= flickerDur || this.isDead) {
        // Restore originals
        meshes.forEach(m => {
          m.mesh.material.emissive.copy(m.origEmissive);
          m.mesh.material.emissiveIntensity = m.origEmissiveIntensity;
          m.mesh.material.opacity = m.origOpacity;
        });
        return;
      }

      if (now - lastFlicker >= flickerInterval) {
        lastFlicker = now;
        flickerHigh = !flickerHigh;
        meshes.forEach(m => {
          m.mesh.material.opacity = flickerHigh ? 0.3 : 0.8;
          // Fade red back toward original over time
          const t = elapsed / flickerDur;
          m.mesh.material.emissiveIntensity = 2.0 * (1 - t) + m.origEmissiveIntensity * t;
        });
      }
      requestAnimationFrame(flickerAnim);
    };
    requestAnimationFrame(flickerAnim);

    // --- BIGGER KNOCKBACK ---
    const base = this.root || this.group;
    const startPos = base.position.clone();
    const knockDir = new THREE.Vector3(
      (Math.random() - 0.5) * 0.15,
      0.04,
      (Math.random() - 0.5) * 0.15
    );

    const dur = 400;
    const start = performance.now();
    const anim = () => {
      const t = Math.min((performance.now() - start) / dur, 1);
      // Sharp in, slow out
      const ease = t < 0.2 ? t / 0.2 : 1 - Math.pow((t - 0.2) / 0.8, 2);
      base.position.x = startPos.x + knockDir.x * ease;
      base.position.y = startPos.y + knockDir.y * ease;
      base.position.z = startPos.z + knockDir.z * ease;
      if (t < 1) requestAnimationFrame(anim);
      else {
        base.position.copy(startPos);
        this.state = prevState;
      }
    };
    requestAnimationFrame(anim);
  }

  playCaptureAnimation(onComplete) {
    this.isDead = true;
    this.state = 'captured';

    const base = this.root || this.group;
    const dur = 1200;
    const start = performance.now();

    const anim = () => {
      const t = Math.min((performance.now() - start) / dur, 1);
      const scale = 1 - t;
      base.scale.setScalar(Math.max(0.01, scale));
      base.rotation.y += 0.15;
      base.position.y += 0.002;

      this.group.traverse(child => {
        if (child.isMesh && child.material && child.material.transparent) {
          child.material.opacity = Math.max(0, (1 - t) * 0.8);
        }
      });

      if (this.shadow) {
        this.shadow.material.opacity = Math.max(0, (1 - t) * 0.15);
      }

      if (t < 1) requestAnimationFrame(anim);
      else if (onComplete) onComplete();
    };
    requestAnimationFrame(anim);
  }

  startDodge() {
    if (this.isDodging || this.isDead || this.state === 'hit') return;
    this.isDodging = true;

    const base = this.root || this.group;
    const angle = Math.random() * Math.PI * 2;
    const dist = 0.1 + Math.random() * 0.2;
    this.dodgeTarget.set(
      Math.cos(angle) * dist,
      base.position.y,
      Math.sin(angle) * dist
    );

    this.dodgeTarget.x = Math.max(-this.dodgeBounds, Math.min(this.dodgeBounds, this.dodgeTarget.x));
    this.dodgeTarget.z = Math.max(-this.dodgeBounds, Math.min(this.dodgeBounds, this.dodgeTarget.z));
  }

  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
    this.playHitAnimation();
    return this.hp <= 0;
  }

  // === MAIN UPDATE ===

  update(deltaTime) {
    if (this.isDead) return;

    this.animationTime += deltaTime;

    if (this.mixer) {
      this.mixer.update(deltaTime);
    }

    const base = this.root || this.group;

    // Ghostly floating
    if (this.state !== 'hit') {
      const floatY = Math.sin(this.animationTime * 1.5) * 0.02;
      const floatX = Math.sin(this.animationTime * 0.8) * 0.005;
      base.position.y = 0.05 + floatY;
      if (!this.isDodging) {
        base.position.x += floatX * deltaTime;
      }
    }

    // Head bob
    if (this.parts.head && this.state !== 'hit') {
      this.parts.head.rotation.z = Math.sin(this.animationTime * 1.2) * 0.05;
      this.parts.head.rotation.x = Math.sin(this.animationTime * 0.9) * 0.03;
    }

    // Dodge movement
    this.dodgeTimer += deltaTime * 1000;
    if (this.dodgeTimer >= this.dodgeInterval) {
      this.dodgeTimer = 0;
      this.startDodge();
    }

    if (this.isDodging) {
      const dir = this.dodgeTarget.clone().sub(base.position);
      const dist = dir.length();
      if (dist < 0.02) {
        this.isDodging = false;
      } else {
        dir.normalize();
        base.position.x += dir.x * this.dodgeSpeed * deltaTime * 60;
        base.position.z += dir.z * this.dodgeSpeed * deltaTime * 60;
      }
    }

    // Shadow follows
    if (this.shadow) {
      this.shadow.position.x = base.position.x;
      this.shadow.position.z = base.position.z;
      const s = 0.8 + Math.sin(this.animationTime * 2) * 0.1;
      this.shadow.scale.setScalar(s);
    }
  }

  getObject() { return this.group; }
  setScale(scale) { this.group.scale.setScalar(scale); }

  /** Returns a bounding sphere in world space for reliable hit detection */
  getHitBox() {
    const box = new THREE.Box3().setFromObject(this.group);
    const sphere = new THREE.Sphere();
    box.getBoundingSphere(sphere);
    // Slightly enlarge for forgiving hit detection
    sphere.radius *= 1.2;
    return sphere;
  }

  /** Get the world position of the ghost center */
  getWorldPosition() {
    const pos = new THREE.Vector3();
    this.group.getWorldPosition(pos);
    // Offset up to center (ghosts hover above origin)
    const base = this.root || this.group;
    pos.y += base.position.y;
    return pos;
  }

  isHit(raycaster) {
    // Try bounding sphere first (more reliable for small meshes)
    const sphere = this.getHitBox();
    if (raycaster.ray.intersectsSphere(sphere)) {
      return true;
    }
    // Fallback to mesh intersection
    const intersects = raycaster.intersectObjects(this.group.children, true);
    return intersects.length > 0;
  }
}
