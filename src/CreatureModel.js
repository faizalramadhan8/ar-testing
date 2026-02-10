import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/**
 * High-Quality Creature Model Loader
 * Supports GLB/GLTF models for professional quality characters
 */
export class CreatureModel {
  constructor(creatureData) {
    this.data = creatureData;
    this.group = new THREE.Group();
    this.mixer = null;
    this.animations = {};
    this.animationTime = 0;
    this.clock = new THREE.Clock();
    
    // State
    this.state = 'idle';
    this.isMoving = false;
    this.walkTarget = new THREE.Vector3();
    this.walkSpeed = 0.08;
    this.walkRadius = 0.35;
    this.isModelLoaded = false;
    
    // Parts for animation
    this.parts = {};
    this.model = null;
    
    // Model URLs - using free CC0 models from various sources
    this.modelUrls = {
      fluffox: 'https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/fox/model.gltf',
      bubbird: 'https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/duck/model.gltf',
      leafling: 'https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/tree-spruce/model.gltf',
      sparkitty: 'https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/cat/model.gltf',
      aquapup: 'https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/dog/model.gltf',
      stardust: 'https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/rabbit/model.gltf'
    };
    
    this.init();
  }

  async init() {
    // Try to load GLB model first
    const modelUrl = this.modelUrls[this.data.id];
    
    if (modelUrl) {
      try {
        await this.loadGLBModel(modelUrl);
      } catch (error) {
        console.log('GLB load failed, using procedural fallback:', error);
        this.buildProceduralCreature();
      }
    } else {
      this.buildProceduralCreature();
    }
    
    this.addShadow();
    this.scheduleNextAction();
    
    // Random start position
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * 0.15;
    this.group.position.x = Math.cos(angle) * dist;
    this.group.position.z = Math.sin(angle) * dist;
  }

  async loadGLBModel(url) {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();
      
      loader.load(
        url,
        (gltf) => {
          this.model = gltf.scene;
          
          // Scale and position the model
          const box = new THREE.Box3().setFromObject(this.model);
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = 0.25 / maxDim;
          this.model.scale.setScalar(scale);
          
          // Center the model
          const center = box.getCenter(new THREE.Vector3());
          this.model.position.sub(center.multiplyScalar(scale));
          this.model.position.y = 0;
          
          // Enable shadows
          this.model.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              
              // Apply toon-like material
              if (child.material) {
                const oldMat = child.material;
                child.material = new THREE.MeshToonMaterial({
                  color: oldMat.color || new THREE.Color(this.data.colors.primary),
                  map: oldMat.map || null,
                });
              }
            }
          });
          
          // Setup animations if available
          if (gltf.animations && gltf.animations.length > 0) {
            this.mixer = new THREE.AnimationMixer(this.model);
            gltf.animations.forEach((clip) => {
              this.animations[clip.name.toLowerCase()] = this.mixer.clipAction(clip);
            });
            
            // Play idle animation if available
            if (this.animations['idle']) {
              this.animations['idle'].play();
            }
          }
          
          this.group.add(this.model);
          this.isModelLoaded = true;
          resolve();
        },
        (progress) => {
          // Loading progress
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  buildProceduralCreature() {
    // Enhanced procedural fallback with better quality
    const { primary, secondary, accent } = this.data.colors;
    
    // Create toon gradient
    const canvas = document.createElement('canvas');
    canvas.width = 4;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#444';
    ctx.fillRect(0, 0, 1, 1);
    ctx.fillStyle = '#777';
    ctx.fillRect(1, 0, 1, 1);
    ctx.fillStyle = '#aaa';
    ctx.fillRect(2, 0, 1, 1);
    ctx.fillStyle = '#fff';
    ctx.fillRect(3, 0, 1, 1);
    
    const toonGradient = new THREE.CanvasTexture(canvas);
    toonGradient.minFilter = THREE.NearestFilter;
    toonGradient.magFilter = THREE.NearestFilter;
    
    const createMat = (color) => new THREE.MeshToonMaterial({ 
      color, 
      gradientMap: toonGradient 
    });

    // Root
    this.root = new THREE.Group();
    this.group.add(this.root);

    // Body
    const bodyGeo = new THREE.SphereGeometry(0.1, 48, 48);
    bodyGeo.scale(1.1, 0.95, 1.0);
    this.body = new THREE.Mesh(bodyGeo, createMat(primary));
    this.body.position.y = 0.1;
    this.body.castShadow = true;
    this.parts.body = this.body;
    this.root.add(this.body);

    // Belly
    const bellyGeo = new THREE.SphereGeometry(0.07, 32, 32);
    bellyGeo.scale(0.9, 0.85, 0.45);
    const belly = new THREE.Mesh(bellyGeo, createMat(accent));
    belly.position.set(0, -0.01, 0.06);
    this.body.add(belly);

    // Head
    const headGeo = new THREE.SphereGeometry(0.12, 48, 48);
    this.head = new THREE.Mesh(headGeo, createMat(primary));
    this.head.position.set(0, 0.14, 0.02);
    this.head.castShadow = true;
    this.parts.head = this.head;
    this.body.add(this.head);

    // Face
    this.buildFace(primary, secondary, accent, createMat);
    
    // Ears
    this.buildEars(createMat, primary, secondary);
    
    // Limbs
    this.buildLimbs(createMat, primary, accent);
    
    // Tail
    this.buildTail(createMat, primary, secondary);
    
    // Outline
    this.addOutline(this.body);
    this.addOutline(this.head);
    
    this.isModelLoaded = true;
  }

  buildFace(primary, secondary, accent, createMat) {
    const face = new THREE.Group();
    face.position.set(0, 0, 0.08);
    this.head.add(face);
    
    // Eyes
    [-0.04, 0.04].forEach((x, i) => {
      const eyeGroup = new THREE.Group();
      eyeGroup.position.set(x, 0.015, 0);
      
      // White
      const whiteGeo = new THREE.SphereGeometry(0.028, 32, 32);
      whiteGeo.scale(1, 1.15, 0.7);
      const white = new THREE.Mesh(whiteGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }));
      eyeGroup.add(white);
      
      // Iris
      const irisGeo = new THREE.SphereGeometry(0.018, 24, 24);
      const iris = new THREE.Mesh(irisGeo, new THREE.MeshBasicMaterial({ color: 0x3D2B22 }));
      iris.position.z = 0.015;
      white.add(iris);
      
      // Pupil
      const pupilGeo = new THREE.SphereGeometry(0.01, 16, 16);
      const pupil = new THREE.Mesh(pupilGeo, new THREE.MeshBasicMaterial({ color: 0x000000 }));
      pupil.position.z = 0.008;
      iris.add(pupil);
      
      // Shine
      const shineGeo = new THREE.SphereGeometry(0.006, 12, 12);
      const shine = new THREE.Mesh(shineGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }));
      shine.position.set(0.005, 0.007, 0.016);
      iris.add(shine);
      
      const shine2 = new THREE.Mesh(new THREE.SphereGeometry(0.003, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      shine2.position.set(-0.003, -0.004, 0.016);
      iris.add(shine2);
      
      // Eyelid
      const lidGeo = new THREE.SphereGeometry(0.03, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.5);
      const lid = new THREE.Mesh(lidGeo, createMat(primary));
      lid.rotation.x = Math.PI;
      lid.scale.y = 0.01;
      eyeGroup.add(lid);
      eyeGroup.userData.lid = lid;
      
      face.add(eyeGroup);
      if (i === 0) this.parts.leftEye = eyeGroup;
      else this.parts.rightEye = eyeGroup;
    });
    
    // Nose
    const noseGeo = new THREE.SphereGeometry(0.012, 16, 16);
    noseGeo.scale(1.1, 0.8, 0.7);
    const nose = new THREE.Mesh(noseGeo, createMat(0x4A3728));
    nose.position.set(0, -0.025, 0.065);
    face.add(nose);
    
    // Mouth
    this.mouthGroup = new THREE.Group();
    this.mouthGroup.position.set(0, -0.05, 0.055);
    face.add(this.mouthGroup);
    
    const smileCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.025, 0, 0),
      new THREE.Vector3(0, -0.012, 0.005),
      new THREE.Vector3(0.025, 0, 0)
    );
    const smileGeo = new THREE.TubeGeometry(smileCurve, 16, 0.004, 8, false);
    this.smile = new THREE.Mesh(smileGeo, new THREE.MeshBasicMaterial({ color: 0x4A3728 }));
    this.mouthGroup.add(this.smile);
    
    const openGeo = new THREE.SphereGeometry(0.02, 16, 16);
    openGeo.scale(1.2, 0.9, 0.7);
    this.openMouth = new THREE.Mesh(openGeo, createMat(0x8B4557));
    this.openMouth.visible = false;
    this.mouthGroup.add(this.openMouth);
    
    // Blush
    const blushMat = new THREE.MeshBasicMaterial({ color: 0xFF8FAB, transparent: true, opacity: 0.5 });
    const blushGeo = new THREE.CircleGeometry(0.018, 24);
    
    this.leftBlush = new THREE.Mesh(blushGeo, blushMat);
    this.leftBlush.position.set(-0.065, -0.015, 0.04);
    this.leftBlush.rotation.y = 0.35;
    face.add(this.leftBlush);
    
    this.rightBlush = new THREE.Mesh(blushGeo, blushMat.clone());
    this.rightBlush.position.set(0.065, -0.015, 0.04);
    this.rightBlush.rotation.y = -0.35;
    face.add(this.rightBlush);
  }

  buildEars(createMat, primary, secondary) {
    this.ears = new THREE.Group();
    const type = this.data.id;
    
    [-0.06, 0.06].forEach((x, i) => {
      const earGroup = new THREE.Group();
      
      if (type === 'aquapup') {
        // Floppy ears
        const earGeo = new THREE.SphereGeometry(0.035, 24, 24);
        earGeo.scale(0.5, 1.3, 0.35);
        const ear = new THREE.Mesh(earGeo, createMat(primary));
        ear.castShadow = true;
        earGroup.add(ear);
        
        earGroup.position.set(x, 0.06, -0.01);
        earGroup.rotation.z = x > 0 ? -0.85 : 0.85;
        earGroup.rotation.x = 0.3;
      } else if (type === 'stardust') {
        // Long bunny ears
        const earGeo = new THREE.SphereGeometry(0.025, 24, 24);
        earGeo.scale(0.6, 2.5, 0.5);
        const ear = new THREE.Mesh(earGeo, createMat(primary));
        ear.position.y = 0.05;
        ear.castShadow = true;
        earGroup.add(ear);
        
        const innerGeo = new THREE.SphereGeometry(0.015, 16, 16);
        innerGeo.scale(0.5, 2, 0.3);
        const inner = new THREE.Mesh(innerGeo, createMat(secondary));
        inner.position.set(0, 0.05, 0.008);
        earGroup.add(inner);
        
        earGroup.position.set(x * 0.5, 0.1, -0.01);
        earGroup.rotation.z = x > 0 ? -0.15 : 0.15;
      } else {
        // Pointy ears
        const earGeo = new THREE.ConeGeometry(0.028, 0.07, 12);
        const ear = new THREE.Mesh(earGeo, createMat(primary));
        ear.rotation.x = -0.2;
        ear.castShadow = true;
        earGroup.add(ear);
        
        const innerGeo = new THREE.ConeGeometry(0.016, 0.045, 12);
        const inner = new THREE.Mesh(innerGeo, createMat(secondary));
        inner.position.set(0, -0.008, 0.01);
        inner.rotation.x = -0.2;
        earGroup.add(inner);
        
        earGroup.position.set(x, 0.1, 0);
        earGroup.rotation.z = x > 0 ? -0.2 : 0.2;
      }
      
      this.ears.add(earGroup);
      if (i === 0) this.parts.leftEar = earGroup;
      else this.parts.rightEar = earGroup;
    });
    
    this.head.add(this.ears);
  }

  buildLimbs(createMat, primary, accent) {
    // Arms
    [-0.09, 0.09].forEach((x, i) => {
      const armGroup = new THREE.Group();
      
      const armGeo = new THREE.SphereGeometry(0.022, 16, 16);
      armGeo.scale(0.8, 1.3, 0.9);
      const arm = new THREE.Mesh(armGeo, createMat(primary));
      arm.castShadow = true;
      armGroup.add(arm);
      
      const pawGeo = new THREE.SphereGeometry(0.018, 16, 16);
      const paw = new THREE.Mesh(pawGeo, createMat(accent));
      paw.position.y = -0.03;
      armGroup.add(paw);
      
      armGroup.position.set(x, 0.02, 0.02);
      armGroup.rotation.z = x > 0 ? -0.5 : 0.5;
      
      this.body.add(armGroup);
      if (i === 0) this.parts.leftArm = armGroup;
      else this.parts.rightArm = armGroup;
    });
    
    // Legs
    [-0.04, 0.04].forEach((x, i) => {
      const legGroup = new THREE.Group();
      
      const footGeo = new THREE.SphereGeometry(0.025, 16, 16);
      footGeo.scale(1.1, 0.6, 1.3);
      const foot = new THREE.Mesh(footGeo, createMat(accent));
      foot.castShadow = true;
      legGroup.add(foot);
      
      legGroup.position.set(x, -0.08, 0.01);
      
      this.body.add(legGroup);
      if (i === 0) this.parts.leftLeg = legGroup;
      else this.parts.rightLeg = legGroup;
    });
  }

  buildTail(createMat, primary, secondary) {
    this.tailGroup = new THREE.Group();
    const type = this.data.id;
    
    if (type === 'fluffox') {
      const tailGeo = new THREE.SphereGeometry(0.055, 24, 24);
      tailGeo.scale(0.6, 0.6, 1.4);
      const tail = new THREE.Mesh(tailGeo, createMat(secondary));
      tail.position.z = -0.04;
      tail.rotation.x = -0.3;
      tail.castShadow = true;
      this.tailGroup.add(tail);
      
      const tipGeo = new THREE.SphereGeometry(0.03, 16, 16);
      const tip = new THREE.Mesh(tipGeo, createMat(0xFFFFFF));
      tip.position.z = -0.06;
      this.tailGroup.add(tip);
    } else {
      const tailGeo = new THREE.SphereGeometry(0.03, 16, 16);
      const tail = new THREE.Mesh(tailGeo, createMat(secondary));
      tail.castShadow = true;
      this.tailGroup.add(tail);
    }
    
    this.tailGroup.position.set(0, 0, -0.08);
    this.body.add(this.tailGroup);
    this.parts.tail = this.tailGroup;
  }

  addOutline(mesh) {
    const outlineMat = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide });
    const outlineGeo = mesh.geometry.clone();
    const outline = new THREE.Mesh(outlineGeo, outlineMat);
    outline.scale.multiplyScalar(1.04);
    mesh.add(outline);
  }

  addShadow() {
    const shadowGeo = new THREE.CircleGeometry(0.12, 32);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.2,
      depthWrite: false
    });
    this.shadow = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadow.rotation.x = -Math.PI / 2;
    this.shadow.position.y = 0.002;
    this.group.add(this.shadow);
  }

  // === ANIMATIONS ===
  
  scheduleNextAction() {
    const delay = 2500 + Math.random() * 3500;
    setTimeout(() => {
      if (this.state === 'idle') {
        if (Math.random() < 0.4) {
          this.startWalking();
        } else {
          this.playIdleAnim();
        }
      }
      this.scheduleNextAction();
    }, delay);
  }

  startWalking() {
    if (this.state !== 'idle') return;
    this.state = 'walking';
    this.isMoving = true;
    
    // Play walk animation if available
    if (this.animations['walk']) {
      this.animations['idle']?.stop();
      this.animations['walk'].play();
    }
    
    const angle = Math.random() * Math.PI * 2;
    const dist = 0.1 + Math.random() * (this.walkRadius - 0.1);
    this.walkTarget.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
    
    const target = this.root || this.group;
    const dir = this.walkTarget.clone().sub(target.position);
    if (dir.length() > 0.01) {
      target.rotation.y = Math.atan2(dir.x, dir.z);
    }
  }

  playIdleAnim() {
    const r = Math.random();
    if (r < 0.35) this.blink();
    else if (r < 0.6) this.wiggleEars();
    else if (r < 0.8) this.lookAround();
    else this.tailWag();
  }

  blink() {
    if (!this.parts.leftEye || !this.parts.rightEye) return;
    const dur = 120;
    const start = performance.now();
    const anim = () => {
      const t = (performance.now() - start) / dur;
      const s = t < 0.5 ? t * 2 : 2 - t * 2;
      [this.parts.leftEye, this.parts.rightEye].forEach(eye => {
        if (eye?.userData?.lid) eye.userData.lid.scale.y = 0.01 + s * 1.1;
      });
      if (t < 1) requestAnimationFrame(anim);
    };
    requestAnimationFrame(anim);
  }

  wiggleEars() {
    if (!this.parts.leftEar || !this.parts.rightEar) return;
    const dur = 350;
    const start = performance.now();
    const initL = this.parts.leftEar.rotation.z;
    const initR = this.parts.rightEar.rotation.z;
    const anim = () => {
      const t = (performance.now() - start) / dur;
      const w = Math.sin(t * Math.PI * 4) * 0.12 * (1 - t);
      this.parts.leftEar.rotation.z = initL + w;
      this.parts.rightEar.rotation.z = initR - w;
      if (t < 1) requestAnimationFrame(anim);
    };
    requestAnimationFrame(anim);
  }

  lookAround() {
    if (!this.head && !this.model) return;
    const target = (Math.random() - 0.5) * 0.6;
    const obj = this.head || this.model;
    const start = obj.rotation.y;
    const dur = 400;
    const startT = performance.now();
    const anim = () => {
      const t = Math.min((performance.now() - startT) / dur, 1);
      const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      obj.rotation.y = start + (target - start) * e;
      if (t < 1) requestAnimationFrame(anim);
      else setTimeout(() => { obj.rotation.y = 0; }, 600);
    };
    requestAnimationFrame(anim);
  }

  tailWag() {
    if (!this.parts.tail) return;
    const dur = 500;
    const start = performance.now();
    const anim = () => {
      const t = (performance.now() - start) / dur;
      this.parts.tail.rotation.y = Math.sin(t * Math.PI * 6) * 0.3 * (1 - t);
      if (t < 1) requestAnimationFrame(anim);
    };
    requestAnimationFrame(anim);
  }

  // === INTERACTION ANIMATIONS ===
  
  playEatingAnimation() {
    if (this.state !== 'idle') return;
    this.state = 'eating';
    this.isMoving = false;
    
    if (this.smile) this.smile.visible = false;
    if (this.openMouth) this.openMouth.visible = true;
    
    this.spawnFoodParticles();
    
    const dur = 1400;
    const start = performance.now();
    const anim = () => {
      const elapsed = performance.now() - start;
      const t = elapsed / dur;
      const chompPhase = (elapsed / 350) % 1;
      const chomp = Math.sin(chompPhase * Math.PI);
      
      if (this.head) {
        this.head.position.y = 0.14 - chomp * 0.025;
      }
      if (this.openMouth) {
        this.openMouth.scale.y = 0.5 + chomp * 0.5;
      }
      
      if (this.body) {
        const squish = 1 + Math.sin(elapsed * 0.02) * 0.04;
        this.body.scale.set(squish, 1 / squish, squish);
      }
      
      if (t < 1) requestAnimationFrame(anim);
      else this.finishEating();
    };
    requestAnimationFrame(anim);
  }

  finishEating() {
    if (this.openMouth) this.openMouth.visible = false;
    if (this.smile) this.smile.visible = true;
    if (this.body) this.body.scale.set(1, 1, 1);
    if (this.head) this.head.position.y = 0.14;
    this.playHappyBounce();
    setTimeout(() => { this.state = 'idle'; }, 400);
  }

  spawnFoodParticles() {
    const colors = [0xFF6B6B, 0x4CAF50, 0xFFEB3B, 0xFF9800];
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const geo = new THREE.SphereGeometry(0.008, 8, 8);
        const mat = new THREE.MeshBasicMaterial({ 
          color: colors[Math.floor(Math.random() * colors.length)] 
        });
        const p = new THREE.Mesh(geo, mat);
        
        const base = this.root || this.group;
        const sx = base.position.x + (Math.random() - 0.5) * 0.08;
        const sy = 0.25;
        const sz = base.position.z + 0.08;
        p.position.set(sx, sy, sz);
        this.group.add(p);
        
        const dur = 500;
        const pStart = performance.now();
        const spread = { x: (Math.random() - 0.5) * 0.12, z: (Math.random() - 0.5) * 0.08 };
        
        const anim = () => {
          const t = Math.min((performance.now() - pStart) / dur, 1);
          p.position.y = sy + (0.05 - sy) * t * t;
          p.position.x = sx + spread.x * t;
          p.position.z = sz + spread.z * t;
          p.scale.setScalar(1 - t * 0.6);
          if (t < 1) requestAnimationFrame(anim);
          else { this.group.remove(p); geo.dispose(); mat.dispose(); }
        };
        requestAnimationFrame(anim);
      }, i * 80);
    }
  }

  playLoveAnimation() {
    if (this.state !== 'idle') return;
    this.state = 'happy';
    
    if (this.leftBlush) this.leftBlush.material.opacity = 0.85;
    if (this.rightBlush) this.rightBlush.material.opacity = 0.85;
    
    this.spawnHearts();
    
    const dur = 1100;
    const start = performance.now();
    const base = this.root || this.group;
    const anim = () => {
      const elapsed = performance.now() - start;
      const t = elapsed / dur;
      
      base.rotation.z = Math.sin(elapsed * 0.008) * 0.08;
      
      [this.parts.leftEye, this.parts.rightEye].forEach(eye => {
        if (eye?.userData?.lid) eye.userData.lid.scale.y = 0.35;
      });
      
      if (this.parts.tail) {
        this.parts.tail.rotation.y = Math.sin(elapsed * 0.015) * 0.45;
      }
      
      if (t < 1) requestAnimationFrame(anim);
      else this.finishLove();
    };
    requestAnimationFrame(anim);
  }

  finishLove() {
    const base = this.root || this.group;
    base.rotation.z = 0;
    [this.parts.leftEye, this.parts.rightEye].forEach(eye => {
      if (eye?.userData?.lid) eye.userData.lid.scale.y = 0.01;
    });
    if (this.leftBlush) this.leftBlush.material.opacity = 0.5;
    if (this.rightBlush) this.rightBlush.material.opacity = 0.5;
    this.state = 'idle';
  }

  spawnHearts() {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => this.createHeart(), i * 180);
    }
  }

  createHeart() {
    const shape = new THREE.Shape();
    const s = 0.012;
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0, -s * 0.4, -s * 0.8, -s * 0.8, -s * 0.8, 0);
    shape.bezierCurveTo(-s * 0.8, s * 0.5, 0, s, 0, s * 1.5);
    shape.bezierCurveTo(0, s, s * 0.8, s * 0.5, s * 0.8, 0);
    shape.bezierCurveTo(s * 0.8, -s * 0.8, 0, -s * 0.4, 0, 0);
    
    const geo = new THREE.ShapeGeometry(shape);
    const mat = new THREE.MeshBasicMaterial({ 
      color: 0xFF6B9D, side: THREE.DoubleSide, transparent: true 
    });
    const heart = new THREE.Mesh(geo, mat);
    
    const base = this.root || this.group;
    const sx = base.position.x + (Math.random() - 0.5) * 0.12;
    heart.position.set(sx, 0.22, base.position.z + 0.08);
    heart.scale.setScalar(1.4);
    this.group.add(heart);
    
    const dur = 1300;
    const start = performance.now();
    const wobble = Math.random() * Math.PI * 2;
    
    const anim = () => {
      const t = Math.min((performance.now() - start) / dur, 1);
      heart.position.y = 0.22 + t * 0.22;
      heart.position.x = sx + Math.sin((performance.now() - start) * 0.005 + wobble) * 0.025;
      heart.rotation.z = Math.sin((performance.now() - start) * 0.003) * 0.15;
      heart.material.opacity = 1 - t;
      heart.scale.setScalar(1.4 + t * 0.4);
      if (t < 1) requestAnimationFrame(anim);
      else { this.group.remove(heart); geo.dispose(); mat.dispose(); }
    };
    requestAnimationFrame(anim);
  }

  playPlayAnimation() {
    if (this.state !== 'idle') return;
    this.state = 'playing';
    
    if (this.smile) this.smile.visible = false;
    if (this.openMouth) this.openMouth.visible = true;
    
    this.spawnStars();
    
    let jumpCount = 0;
    const maxJumps = 3;
    const base = this.root || this.group;
    
    const doJump = () => {
      const start = performance.now();
      const jumpDur = 350;
      
      const anim = () => {
        const t = Math.min((performance.now() - start) / jumpDur, 1);
        const jp = Math.sin(t * Math.PI);
        
        base.position.y = jp * 0.07;
        if (this.body) {
          this.body.scale.set(1 - jp * 0.15, 1 + jp * 0.25, 1 - jp * 0.15);
        }
        base.rotation.y += 0.04;
        
        if (this.parts.leftArm) {
          const arm = Math.sin((performance.now() - start) * 0.02) * 0.4;
          this.parts.leftArm.rotation.z = 0.5 + arm;
          this.parts.rightArm.rotation.z = -0.5 - arm;
        }
        
        if (t < 1) requestAnimationFrame(anim);
        else {
          jumpCount++;
          if (jumpCount < maxJumps) setTimeout(doJump, 80);
          else this.finishPlay();
        }
      };
      requestAnimationFrame(anim);
    };
    doJump();
  }

  finishPlay() {
    const base = this.root || this.group;
    if (this.body) this.body.scale.set(1, 1, 1);
    base.position.y = 0;
    if (this.parts.leftArm) {
      this.parts.leftArm.rotation.z = 0.5;
      this.parts.rightArm.rotation.z = -0.5;
    }
    if (this.openMouth) this.openMouth.visible = false;
    if (this.smile) this.smile.visible = true;
    this.playHappyBounce();
    setTimeout(() => { this.state = 'idle'; }, 400);
  }

  spawnStars() {
    for (let i = 0; i < 7; i++) {
      setTimeout(() => this.createStar(), i * 130);
    }
  }

  createStar() {
    const geo = new THREE.OctahedronGeometry(0.014, 0);
    const colors = [0xFFD93D, 0xFF6B9D, 0x7C5CFF, 0x6BCB77];
    const mat = new THREE.MeshBasicMaterial({
      color: colors[Math.floor(Math.random() * colors.length)],
      transparent: true
    });
    const star = new THREE.Mesh(geo, mat);
    
    const base = this.root || this.group;
    const angle = Math.random() * Math.PI * 2;
    const dist = 0.05 + Math.random() * 0.08;
    const sx = base.position.x + Math.cos(angle) * dist;
    const sz = base.position.z + Math.sin(angle) * dist;
    star.position.set(sx, 0.15, sz);
    this.group.add(star);
    
    const dur = 900;
    const start = performance.now();
    
    const anim = () => {
      const elapsed = performance.now() - start;
      const t = Math.min(elapsed / dur, 1);
      star.position.y = 0.15 + t * 0.18;
      star.rotation.y = elapsed * 0.01;
      star.rotation.x = elapsed * 0.008;
      star.material.opacity = 1 - t;
      star.scale.setScalar(1 + t * 0.8);
      if (t < 1) requestAnimationFrame(anim);
      else { this.group.remove(star); geo.dispose(); mat.dispose(); }
    };
    requestAnimationFrame(anim);
  }

  playHappyBounce() {
    const dur = 450;
    const start = performance.now();
    const base = this.root || this.group;
    const anim = () => {
      const t = Math.min((performance.now() - start) / dur, 1);
      base.position.y = Math.sin(t * Math.PI * 2) * (1 - t) * 0.025;
      if (t < 1) requestAnimationFrame(anim);
    };
    requestAnimationFrame(anim);
  }

  // === MAIN UPDATE ===
  
  update(deltaTime) {
    this.animationTime += deltaTime;
    
    // Update animation mixer for GLB models
    if (this.mixer) {
      this.mixer.update(deltaTime);
    }
    
    if (this.state === 'walking' && this.isMoving) {
      this.updateWalking(deltaTime);
    }
    
    this.updateIdle(deltaTime);
    
    if (this.shadow) {
      const base = this.root || this.group;
      this.shadow.position.x = base.position.x;
      this.shadow.position.z = base.position.z;
      const s = 0.9 + Math.sin(this.animationTime * 2) * 0.08;
      this.shadow.scale.setScalar(s);
    }
  }

  updateWalking(deltaTime) {
    const base = this.root || this.group;
    const dir = this.walkTarget.clone().sub(base.position);
    const dist = dir.length();
    
    if (dist < 0.015) {
      this.isMoving = false;
      this.state = 'idle';
      
      // Switch back to idle animation
      if (this.animations['walk']) {
        this.animations['walk'].stop();
        this.animations['idle']?.play();
      }
      return;
    }
    
    dir.normalize();
    base.position.x += dir.x * this.walkSpeed * deltaTime;
    base.position.z += dir.z * this.walkSpeed * deltaTime;
    
    // Procedural walk animation for fallback model
    if (!this.mixer) {
      const cycle = this.animationTime * 10;
      base.position.y = Math.abs(Math.sin(cycle)) * 0.012;
      
      if (this.parts.leftLeg && this.parts.rightLeg) {
        this.parts.leftLeg.rotation.x = Math.sin(cycle) * 0.25;
        this.parts.rightLeg.rotation.x = Math.sin(cycle + Math.PI) * 0.25;
      }
      
      if (this.parts.leftArm && this.parts.rightArm) {
        this.parts.leftArm.rotation.x = Math.sin(cycle + Math.PI) * 0.15;
        this.parts.rightArm.rotation.x = Math.sin(cycle) * 0.15;
      }
      
      if (this.body) {
        this.body.rotation.z = Math.sin(cycle) * 0.04;
      }
      
      if (this.parts.leftEar && this.parts.rightEar) {
        const eb = Math.sin(cycle * 2) * 0.08;
        const baseL = this.data.id === 'aquapup' ? 0.85 : 0.2;
        const baseR = this.data.id === 'aquapup' ? -0.85 : -0.2;
        this.parts.leftEar.rotation.z = baseL + eb;
        this.parts.rightEar.rotation.z = baseR - eb;
      }
    }
  }

  updateIdle(deltaTime) {
    if (this.mixer) return; // GLB model handles its own idle animation
    
    const breathe = Math.sin(this.animationTime * 1.8) * 0.012;
    if (this.state === 'idle' && this.body) {
      this.body.scale.set(1 + breathe * 0.25, 1 + breathe, 1 + breathe * 0.25);
    }
    
    const base = this.root || this.group;
    if (this.state === 'idle' && !this.isMoving) {
      base.position.y = Math.sin(this.animationTime * 1.4) * 0.006;
    }
    
    if (this.parts.tail && this.state !== 'playing') {
      const ws = this.state === 'happy' ? 7 : 3.5;
      const wa = this.state === 'happy' ? 0.35 : 0.18;
      this.parts.tail.rotation.y = Math.sin(this.animationTime * ws) * wa;
    }
    
    if (Math.random() < 0.002 && this.state === 'idle') this.blink();
  }

  getObject() { return this.group; }
  setScale(scale) { this.group.scale.setScalar(scale); }
}