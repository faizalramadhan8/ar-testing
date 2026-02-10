import * as THREE from 'three';

/**
 * Advanced 3D Creature Model with Walking, Expressions & Interactions
 * Professional quality procedural character generation
 */
export class CreatureModel {
  constructor(creatureData) {
    this.data = creatureData;
    this.group = new THREE.Group();
    this.animationTime = 0;
    
    // State machine
    this.state = 'idle';
    this.stateTimer = 0;
    
    // Walking behavior
    this.walkTarget = new THREE.Vector3();
    this.walkSpeed = 0.12;
    this.walkRadius = 0.4;
    this.isMoving = false;
    
    // Body parts for animation
    this.bodyParts = {};
    
    this.buildCreature();
    this.scheduleNextAction();
  }

  buildCreature() {
    const { primary, secondary, accent } = this.data.colors;
    
    // Advanced materials
    const primaryMat = new THREE.MeshStandardMaterial({ 
      color: primary, roughness: 0.7, metalness: 0.1
    });
    const secondaryMat = new THREE.MeshStandardMaterial({ 
      color: secondary, roughness: 0.8, metalness: 0.05
    });
    const accentMat = new THREE.MeshStandardMaterial({ 
      color: accent, roughness: 0.6, metalness: 0.0
    });

    // Root transform
    this.root = new THREE.Group();
    this.group.add(this.root);

    // === BODY ===
    const bodyGeom = new THREE.SphereGeometry(0.12, 32, 32);
    bodyGeom.scale(1.1, 0.95, 1.0);
    this.body = new THREE.Mesh(bodyGeom, primaryMat);
    this.body.position.y = 0.12;
    this.body.castShadow = true;
    this.bodyParts.body = this.body;
    this.root.add(this.body);

    // Belly
    const bellyGeom = new THREE.SphereGeometry(0.08, 24, 24);
    bellyGeom.scale(1, 0.85, 0.5);
    this.belly = new THREE.Mesh(bellyGeom, accentMat);
    this.belly.position.set(0, -0.01, 0.07);
    this.body.add(this.belly);

    // === HEAD ===
    const headGeom = new THREE.SphereGeometry(0.1, 32, 32);
    headGeom.scale(1.05, 1, 1);
    this.head = new THREE.Mesh(headGeom, primaryMat);
    this.head.position.set(0, 0.15, 0.02);
    this.head.castShadow = true;
    this.bodyParts.head = this.head;
    this.body.add(this.head);

    // Face
    this.face = new THREE.Group();
    this.face.position.set(0, 0, 0.06);
    this.head.add(this.face);

    this.createEyes();
    this.createNose();
    this.createMouth();
    this.createBlush();
    this.createEars(primaryMat, secondaryMat);
    this.createArms(primaryMat, accentMat);
    this.createLegs(primaryMat, accentMat);
    this.createTail(primaryMat, secondaryMat);
    this.addSpecialFeatures();

    // Shadow
    const shadowGeom = new THREE.CircleGeometry(0.12, 32);
    const shadowMat = new THREE.MeshBasicMaterial({ 
      color: 0x000000, transparent: true, opacity: 0.25, depthWrite: false
    });
    this.shadow = new THREE.Mesh(shadowGeom, shadowMat);
    this.shadow.rotation.x = -Math.PI / 2;
    this.shadow.position.y = 0.002;
    this.group.add(this.shadow);

    // Random start position
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * this.walkRadius * 0.3;
    this.root.position.x = Math.cos(angle) * dist;
    this.root.position.z = Math.sin(angle) * dist;
  }

  createEyes() {
    const eyeGroup = new THREE.Group();
    
    [-0.035, 0.035].forEach((xPos, i) => {
      const eye = new THREE.Group();
      eye.position.x = xPos;
      
      // Sclera
      const scleraGeom = new THREE.SphereGeometry(0.022, 24, 24);
      scleraGeom.scale(1, 1.1, 0.8);
      const sclera = new THREE.Mesh(scleraGeom, new THREE.MeshStandardMaterial({ 
        color: 0xFFFFFF, roughness: 0.3
      }));
      eye.add(sclera);
      
      // Iris
      const irisGeom = new THREE.SphereGeometry(0.014, 20, 20);
      const iris = new THREE.Mesh(irisGeom, new THREE.MeshStandardMaterial({ 
        color: 0x4A3728, roughness: 0.4
      }));
      iris.position.z = 0.012;
      sclera.add(iris);
      eye.userData.iris = iris;
      
      // Pupil
      const pupilGeom = new THREE.SphereGeometry(0.008, 16, 16);
      const pupil = new THREE.Mesh(pupilGeom, new THREE.MeshBasicMaterial({ color: 0x111111 }));
      pupil.position.z = 0.006;
      iris.add(pupil);
      
      // Shine
      const shineGeom = new THREE.SphereGeometry(0.005, 12, 12);
      const shine = new THREE.Mesh(shineGeom, new THREE.MeshBasicMaterial({ color: 0xFFFFFF }));
      shine.position.set(0.004, 0.006, 0.015);
      iris.add(shine);
      
      // Eyelid
      const eyelidGeom = new THREE.SphereGeometry(0.024, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.5);
      const eyelid = new THREE.Mesh(eyelidGeom, new THREE.MeshStandardMaterial({ 
        color: this.data.colors.primary, side: THREE.DoubleSide
      }));
      eyelid.rotation.x = Math.PI;
      eyelid.position.z = 0.001;
      eyelid.scale.y = 0.01;
      eye.add(eyelid);
      eye.userData.eyelid = eyelid;
      
      eyeGroup.add(eye);
      if (i === 0) this.leftEye = eye;
      else this.rightEye = eye;
    });
    
    eyeGroup.position.set(0, 0.015, 0);
    this.face.add(eyeGroup);
  }

  createNose() {
    const noseGeom = new THREE.SphereGeometry(0.012, 16, 16);
    noseGeom.scale(1.2, 0.9, 0.8);
    this.nose = new THREE.Mesh(noseGeom, new THREE.MeshStandardMaterial({ 
      color: 0x3D2B22, roughness: 0.6
    }));
    this.nose.position.set(0, -0.015, 0.065);
    this.face.add(this.nose);
    
    // Highlight
    const hlGeom = new THREE.SphereGeometry(0.004, 8, 8);
    const hl = new THREE.Mesh(hlGeom, new THREE.MeshBasicMaterial({ 
      color: 0xFFFFFF, transparent: true, opacity: 0.4
    }));
    hl.position.set(0.003, 0.003, 0.006);
    this.nose.add(hl);
  }

  createMouth() {
    this.mouthGroup = new THREE.Group();
    this.mouthGroup.position.set(0, -0.04, 0.055);
    this.face.add(this.mouthGroup);
    
    // Smile curve
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.02, 0, 0),
      new THREE.Vector3(0, -0.01, 0.005),
      new THREE.Vector3(0.02, 0, 0)
    );
    const tubeGeom = new THREE.TubeGeometry(curve, 20, 0.003, 8, false);
    this.smile = new THREE.Mesh(tubeGeom, new THREE.MeshBasicMaterial({ color: 0x3D2B22 }));
    this.mouthGroup.add(this.smile);
    
    // Open mouth (hidden initially)
    const openGeom = new THREE.SphereGeometry(0.015, 16, 16);
    openGeom.scale(1.3, 1, 0.8);
    this.openMouth = new THREE.Mesh(openGeom, new THREE.MeshStandardMaterial({ color: 0x8B4557 }));
    this.openMouth.visible = false;
    this.mouthGroup.add(this.openMouth);
    
    // Tongue
    const tongueGeom = new THREE.SphereGeometry(0.008, 12, 12);
    tongueGeom.scale(1.2, 0.6, 1);
    this.tongue = new THREE.Mesh(tongueGeom, new THREE.MeshStandardMaterial({ color: 0xFF6B8A }));
    this.tongue.position.set(0, -0.005, 0.005);
    this.tongue.visible = false;
    this.mouthGroup.add(this.tongue);
  }

  createBlush() {
    const blushMat = new THREE.MeshBasicMaterial({ 
      color: 0xFF8FAB, transparent: true, opacity: 0.5, depthWrite: false
    });
    const blushGeom = new THREE.CircleGeometry(0.015, 16);
    
    this.leftBlush = new THREE.Mesh(blushGeom, blushMat);
    this.leftBlush.position.set(-0.055, -0.01, 0.045);
    this.leftBlush.rotation.y = 0.3;
    this.face.add(this.leftBlush);
    
    this.rightBlush = new THREE.Mesh(blushGeom, blushMat.clone());
    this.rightBlush.position.set(0.055, -0.01, 0.045);
    this.rightBlush.rotation.y = -0.3;
    this.face.add(this.rightBlush);
  }

  createEars(primaryMat, secondaryMat) {
    this.ears = new THREE.Group();
    const id = this.data.id;
    
    if (id === 'bubbird') {
      // Bird crest
      for (let i = 0; i < 3; i++) {
        const featherGeom = new THREE.ConeGeometry(0.012, 0.05 - i * 0.01, 8);
        const feather = new THREE.Mesh(featherGeom, i === 1 ? secondaryMat : primaryMat);
        feather.position.set(0, 0.08, -0.02 - i * 0.015);
        feather.rotation.x = -0.3 - i * 0.1;
        this.ears.add(feather);
      }
    } else if (id === 'aquapup') {
      // Floppy ears
      [-0.07, 0.07].forEach((xPos, i) => {
        const earGeom = new THREE.SphereGeometry(0.03, 16, 16);
        earGeom.scale(0.6, 1.2, 0.4);
        const ear = new THREE.Mesh(earGeom, primaryMat);
        ear.position.set(xPos, 0.04, -0.01);
        ear.rotation.z = xPos > 0 ? -0.8 : 0.8;
        ear.rotation.x = 0.3;
        this.ears.add(ear);
        if (i === 0) this.bodyParts.leftEar = ear;
        else this.bodyParts.rightEar = ear;
      });
    } else {
      // Pointy ears
      [-0.055, 0.055].forEach((xPos, i) => {
        const earGroup = new THREE.Group();
        const earGeom = new THREE.ConeGeometry(0.025, 0.06, 12);
        const ear = new THREE.Mesh(earGeom, primaryMat);
        ear.rotation.x = -0.2;
        earGroup.add(ear);
        
        const innerGeom = new THREE.ConeGeometry(0.015, 0.04, 12);
        const inner = new THREE.Mesh(innerGeom, secondaryMat);
        inner.position.set(0, -0.005, 0.01);
        inner.rotation.x = -0.2;
        earGroup.add(inner);
        
        earGroup.position.set(xPos, 0.1, 0);
        earGroup.rotation.z = xPos > 0 ? -0.25 : 0.25;
        this.ears.add(earGroup);
        if (i === 0) this.bodyParts.leftEar = earGroup;
        else this.bodyParts.rightEar = earGroup;
      });
    }
    
    this.head.add(this.ears);
  }

  createArms(primaryMat, accentMat) {
    [-0.1, 0.1].forEach((xPos, i) => {
      const armGroup = new THREE.Group();
      
      const upperGeom = new THREE.CapsuleGeometry(0.018, 0.03, 8, 16);
      const upper = new THREE.Mesh(upperGeom, primaryMat);
      upper.castShadow = true;
      armGroup.add(upper);
      
      const pawGeom = new THREE.SphereGeometry(0.022, 16, 16);
      pawGeom.scale(1, 0.9, 1.1);
      const paw = new THREE.Mesh(pawGeom, accentMat);
      paw.position.y = -0.035;
      armGroup.add(paw);
      
      // Paw pads
      const padMat = new THREE.MeshStandardMaterial({ color: 0xFFB6C1 });
      for (let j = 0; j < 3; j++) {
        const padGeom = new THREE.SphereGeometry(0.005, 8, 8);
        const pad = new THREE.Mesh(padGeom, padMat);
        pad.position.set((j - 1) * 0.008, -0.04, 0.015);
        armGroup.add(pad);
      }
      
      armGroup.position.set(xPos, 0.02, 0.03);
      armGroup.rotation.z = xPos > 0 ? -0.4 : 0.4;
      this.body.add(armGroup);
      
      if (i === 0) this.bodyParts.leftArm = armGroup;
      else this.bodyParts.rightArm = armGroup;
    });
  }

  createLegs(primaryMat, accentMat) {
    [-0.045, 0.045].forEach((xPos, i) => {
      const legGroup = new THREE.Group();
      
      const thighGeom = new THREE.CapsuleGeometry(0.022, 0.02, 8, 16);
      const thigh = new THREE.Mesh(thighGeom, primaryMat);
      thigh.castShadow = true;
      legGroup.add(thigh);
      
      const footGeom = new THREE.SphereGeometry(0.025, 16, 16);
      footGeom.scale(1.1, 0.6, 1.3);
      const foot = new THREE.Mesh(footGeom, accentMat);
      foot.position.set(0, -0.03, 0.01);
      legGroup.add(foot);
      
      legGroup.position.set(xPos, -0.1, 0);
      this.body.add(legGroup);
      
      if (i === 0) this.bodyParts.leftLeg = legGroup;
      else this.bodyParts.rightLeg = legGroup;
    });
  }

  createTail(primaryMat, secondaryMat) {
    this.tailGroup = new THREE.Group();
    const id = this.data.id;
    
    if (id === 'fluffox') {
      const tailGeom = new THREE.SphereGeometry(0.05, 16, 16);
      tailGeom.scale(0.7, 0.7, 1.3);
      const tail = new THREE.Mesh(tailGeom, secondaryMat);
      tail.position.z = -0.04;
      this.tailGroup.add(tail);
      
      const tipGeom = new THREE.SphereGeometry(0.025, 12, 12);
      const tip = new THREE.Mesh(tipGeom, new THREE.MeshStandardMaterial({ color: 0xFFFFFF }));
      tip.position.z = -0.05;
      this.tailGroup.add(tip);
    } else if (id === 'bubbird') {
      for (let i = 0; i < 3; i++) {
        const featherGeom = new THREE.BoxGeometry(0.015, 0.003, 0.05);
        const feather = new THREE.Mesh(featherGeom, i === 1 ? primaryMat : secondaryMat);
        feather.position.set((i - 1) * 0.02, 0, -0.02);
        feather.rotation.x = 0.3;
        this.tailGroup.add(feather);
      }
    } else {
      const tailGeom = new THREE.SphereGeometry(0.035, 16, 16);
      const tail = new THREE.Mesh(tailGeom, secondaryMat);
      this.tailGroup.add(tail);
    }
    
    this.tailGroup.position.set(0, 0, -0.1);
    this.body.add(this.tailGroup);
    this.bodyParts.tail = this.tailGroup;
  }

  addSpecialFeatures() {
    const id = this.data.id;
    
    if (id === 'sparkitty') {
      this.electricBolts = [];
      const boltMat = new THREE.MeshBasicMaterial({ color: 0xFFFF44, transparent: true, opacity: 0.9 });
      for (let i = 0; i < 4; i++) {
        const boltGeom = new THREE.BoxGeometry(0.004, 0.03, 0.004);
        const bolt = new THREE.Mesh(boltGeom, boltMat);
        bolt.visible = false;
        this.root.add(bolt);
        this.electricBolts.push(bolt);
      }
    } else if (id === 'stardust') {
      this.stars = [];
      const starMat = new THREE.MeshBasicMaterial({ color: 0xFFE082 });
      for (let i = 0; i < 6; i++) {
        const starGeom = new THREE.OctahedronGeometry(0.012, 0);
        const star = new THREE.Mesh(starGeom, starMat);
        star.userData = { angle: (i / 6) * Math.PI * 2, radius: 0.18, speed: 0.5 + Math.random() * 0.3 };
        this.root.add(star);
        this.stars.push(star);
      }
    } else if (id === 'leafling') {
      const flowerGroup = new THREE.Group();
      const petalMat = new THREE.MeshStandardMaterial({ color: 0xFFB7C5, side: THREE.DoubleSide });
      for (let i = 0; i < 5; i++) {
        const petalGeom = new THREE.CircleGeometry(0.015, 12);
        const petal = new THREE.Mesh(petalGeom, petalMat);
        const angle = (i / 5) * Math.PI * 2;
        petal.position.set(Math.cos(angle) * 0.012, Math.sin(angle) * 0.012, 0);
        flowerGroup.add(petal);
      }
      const centerGeom = new THREE.SphereGeometry(0.008, 12, 12);
      const center = new THREE.Mesh(centerGeom, new THREE.MeshStandardMaterial({ color: 0xFFEB3B }));
      center.position.z = 0.005;
      flowerGroup.add(center);
      flowerGroup.position.set(0.03, 0.1, 0.03);
      flowerGroup.rotation.x = -0.5;
      this.head.add(flowerGroup);
    } else if (id === 'aquapup') {
      this.bubbles = [];
      const bubbleMat = new THREE.MeshPhysicalMaterial({ color: 0x88DDFF, transparent: true, opacity: 0.4 });
      for (let i = 0; i < 5; i++) {
        const bubbleGeom = new THREE.SphereGeometry(0.01 + Math.random() * 0.015, 12, 12);
        const bubble = new THREE.Mesh(bubbleGeom, bubbleMat.clone());
        bubble.userData = { offset: Math.random() * Math.PI * 2, speed: 1 + Math.random() * 0.5 };
        bubble.visible = false;
        this.root.add(bubble);
        this.bubbles.push(bubble);
      }
    } else if (id === 'fluffox') {
      this.flames = [];
      for (let i = 0; i < 3; i++) {
        const flameGroup = new THREE.Group();
        const flame1 = new THREE.Mesh(
          new THREE.SphereGeometry(0.015, 12, 12).scale(1, 1.5, 1),
          new THREE.MeshBasicMaterial({ color: 0xFF6600, transparent: true, opacity: 0.8 })
        );
        flameGroup.add(flame1);
        flameGroup.userData = { angle: (i / 3) * Math.PI * 2, baseY: 0.2 };
        flameGroup.visible = false;
        this.root.add(flameGroup);
        this.flames.push(flameGroup);
      }
    } else if (id === 'bubbird') {
      const wingMat = new THREE.MeshStandardMaterial({ color: this.data.colors.secondary, side: THREE.DoubleSide });
      [-0.08, 0.08].forEach((xPos, i) => {
        const wingShape = new THREE.Shape();
        wingShape.moveTo(0, 0);
        wingShape.quadraticCurveTo(0.05, 0.04, 0.08, 0);
        wingShape.quadraticCurveTo(0.06, -0.02, 0, 0);
        const wingGeom = new THREE.ShapeGeometry(wingShape);
        const wing = new THREE.Mesh(wingGeom, wingMat);
        wing.scale.x = xPos > 0 ? 1 : -1;
        wing.position.set(xPos, 0.08, -0.03);
        wing.rotation.y = xPos > 0 ? -0.3 : 0.3;
        this.body.add(wing);
        if (i === 0) this.bodyParts.leftWing = wing;
        else this.bodyParts.rightWing = wing;
      });
    }
  }

  // === BEHAVIOR ===
  
  scheduleNextAction() {
    const delay = 2000 + Math.random() * 4000;
    setTimeout(() => {
      if (this.state === 'idle') {
        if (Math.random() < 0.5) {
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
    
    const angle = Math.random() * Math.PI * 2;
    const dist = 0.1 + Math.random() * (this.walkRadius - 0.1);
    this.walkTarget.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
    
    const dir = this.walkTarget.clone().sub(this.root.position);
    if (dir.length() > 0.01) {
      this.root.rotation.y = Math.atan2(dir.x, dir.z);
    }
  }

  playIdleAnim() {
    const r = Math.random();
    if (r < 0.4) this.blink();
    else if (r < 0.7) this.wiggleEars();
    else this.lookAround();
  }

  blink() {
    const duration = 150;
    const start = performance.now();
    const animate = () => {
      const t = (performance.now() - start) / duration;
      const lidScale = t < 0.5 ? t * 2 : 2 - t * 2;
      [this.leftEye, this.rightEye].forEach(eye => {
        if (eye?.userData?.eyelid) eye.userData.eyelid.scale.y = 0.01 + lidScale * 1.1;
      });
      if (t < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }

  wiggleEars() {
    if (!this.bodyParts.leftEar || !this.bodyParts.rightEar) return;
    const duration = 400;
    const start = performance.now();
    const animate = () => {
      const t = (performance.now() - start) / duration;
      const wiggle = Math.sin(t * Math.PI * 4) * 0.15;
      this.bodyParts.leftEar.rotation.z = 0.25 + wiggle;
      this.bodyParts.rightEar.rotation.z = -0.25 - wiggle;
      if (t < 1) requestAnimationFrame(animate);
      else {
        this.bodyParts.leftEar.rotation.z = 0.25;
        this.bodyParts.rightEar.rotation.z = -0.25;
      }
    };
    requestAnimationFrame(animate);
  }

  lookAround() {
    const targetRot = (Math.random() - 0.5) * 0.8;
    const startRot = this.head.rotation.y;
    const duration = 500;
    const start = performance.now();
    const animate = () => {
      const t = Math.min((performance.now() - start) / duration, 1);
      this.head.rotation.y = startRot + (targetRot - startRot) * this.easeInOut(t);
      if (t < 1) requestAnimationFrame(animate);
      else setTimeout(() => this.head.rotation.y = 0, 800);
    };
    requestAnimationFrame(animate);
  }

  // === INTERACTION ANIMATIONS ===
  
  playEatingAnimation() {
    if (this.state !== 'idle') return;
    this.state = 'eating';
    this.isMoving = false;
    
    this.smile.visible = false;
    this.openMouth.visible = true;
    this.tongue.visible = true;
    
    this.spawnFoodParticles();
    
    const duration = 1500;
    const start = performance.now();
    const animate = () => {
      const elapsed = performance.now() - start;
      const t = elapsed / duration;
      const chompPhase = (elapsed / 375) % 1;
      const chomp = Math.sin(chompPhase * Math.PI) * 0.03;
      
      this.head.position.y = 0.15 - chomp;
      this.openMouth.scale.y = 0.5 + Math.sin(chompPhase * Math.PI) * 0.5;
      
      if (this.bodyParts.leftEar) {
        this.bodyParts.leftEar.rotation.z = 0.15;
        this.bodyParts.rightEar.rotation.z = -0.15;
      }
      
      const squish = 1 + Math.sin(elapsed * 0.02) * 0.05;
      this.body.scale.set(squish, 1 / squish, squish);
      
      if (t < 1) requestAnimationFrame(animate);
      else this.finishEating();
    };
    requestAnimationFrame(animate);
  }

  finishEating() {
    this.openMouth.visible = false;
    this.tongue.visible = false;
    this.smile.visible = true;
    this.playHappyBounce();
    setTimeout(() => { this.state = 'idle'; }, 500);
  }

  spawnFoodParticles() {
    const colors = [0xFF6B6B, 0x4CAF50, 0xFFEB3B, 0xFF9800];
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        const geom = new THREE.SphereGeometry(0.008, 8, 8);
        const mat = new THREE.MeshBasicMaterial({ color: colors[Math.floor(Math.random() * colors.length)] });
        const p = new THREE.Mesh(geom, mat);
        
        const startX = this.root.position.x + (Math.random() - 0.5) * 0.1;
        const startY = 0.25;
        const startZ = this.root.position.z + 0.08;
        p.position.set(startX, startY, startZ);
        this.group.add(p);
        
        const duration = 600;
        const pStart = performance.now();
        const spread = { x: (Math.random() - 0.5) * 0.15, z: (Math.random() - 0.5) * 0.1 };
        
        const anim = () => {
          const t = Math.min((performance.now() - pStart) / duration, 1);
          p.position.y = startY + (0.05 - startY) * t * t;
          p.position.x = startX + spread.x * t;
          p.position.z = startZ + spread.z * t;
          p.scale.setScalar(1 - t * 0.5);
          if (t < 1) requestAnimationFrame(anim);
          else { this.group.remove(p); geom.dispose(); mat.dispose(); }
        };
        requestAnimationFrame(anim);
      }, i * 100);
    }
  }

  playLoveAnimation() {
    if (this.state !== 'idle') return;
    this.state = 'happy';
    
    this.leftBlush.material.opacity = 0.8;
    this.rightBlush.material.opacity = 0.8;
    
    this.spawnHearts();
    
    const duration = 1200;
    const start = performance.now();
    const animate = () => {
      const elapsed = performance.now() - start;
      const t = elapsed / duration;
      
      this.root.rotation.z = Math.sin(elapsed * 0.008) * 0.1;
      
      [this.leftEye, this.rightEye].forEach(eye => {
        if (eye?.userData?.eyelid) eye.userData.eyelid.scale.y = 0.4;
      });
      
      if (this.tailGroup) this.tailGroup.rotation.y = Math.sin(elapsed * 0.015) * 0.5;
      
      if (t < 1) requestAnimationFrame(animate);
      else this.finishLove();
    };
    requestAnimationFrame(animate);
  }

  finishLove() {
    this.root.rotation.z = 0;
    [this.leftEye, this.rightEye].forEach(eye => {
      if (eye?.userData?.eyelid) eye.userData.eyelid.scale.y = 0.01;
    });
    this.leftBlush.material.opacity = 0.5;
    this.rightBlush.material.opacity = 0.5;
    this.state = 'idle';
  }

  spawnHearts() {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => this.createHeart(), i * 200);
    }
  }

  createHeart() {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0, -0.005, -0.008, -0.008, -0.008, 0);
    shape.bezierCurveTo(-0.008, 0.005, 0, 0.01, 0, 0.015);
    shape.bezierCurveTo(0, 0.01, 0.008, 0.005, 0.008, 0);
    shape.bezierCurveTo(0.008, -0.008, 0, -0.005, 0, 0);
    
    const geom = new THREE.ShapeGeometry(shape);
    const mat = new THREE.MeshBasicMaterial({ color: 0xFF6B9D, side: THREE.DoubleSide, transparent: true });
    const heart = new THREE.Mesh(geom, mat);
    
    const startX = this.root.position.x + (Math.random() - 0.5) * 0.15;
    heart.position.set(startX, 0.2, this.root.position.z + 0.1);
    heart.scale.setScalar(1.5);
    this.group.add(heart);
    
    const duration = 1500;
    const start = performance.now();
    const wobble = Math.random() * Math.PI * 2;
    
    const animate = () => {
      const t = Math.min((performance.now() - start) / duration, 1);
      heart.position.y = 0.2 + t * 0.25;
      heart.position.x = startX + Math.sin((performance.now() - start) * 0.005 + wobble) * 0.03;
      heart.rotation.z = Math.sin((performance.now() - start) * 0.003) * 0.2;
      heart.material.opacity = 1 - t;
      heart.scale.setScalar(1.5 + t * 0.5);
      if (t < 1) requestAnimationFrame(animate);
      else { this.group.remove(heart); geom.dispose(); mat.dispose(); }
    };
    requestAnimationFrame(animate);
  }

  playPlayAnimation() {
    if (this.state !== 'idle') return;
    this.state = 'playing';
    
    this.smile.visible = false;
    this.openMouth.visible = true;
    
    this.spawnStars();
    
    let jumpCount = 0;
    const maxJumps = 3;
    
    const doJump = () => {
      const start = performance.now();
      const jumpDur = 400;
      
      const animate = () => {
        const t = Math.min((performance.now() - start) / jumpDur, 1);
        const jumpProgress = Math.sin(t * Math.PI);
        
        this.root.position.y = jumpProgress * 0.08;
        this.body.scale.set(1 - jumpProgress * 0.2, 1 + jumpProgress * 0.3, 1 - jumpProgress * 0.2);
        this.root.rotation.y += 0.05;
        
        if (this.bodyParts.leftArm) {
          const armAngle = Math.sin((performance.now() - start) * 0.02) * 0.5;
          this.bodyParts.leftArm.rotation.z = 0.4 + armAngle;
          this.bodyParts.rightArm.rotation.z = -0.4 - armAngle;
        }
        
        if (t < 1) requestAnimationFrame(animate);
        else {
          jumpCount++;
          if (jumpCount < maxJumps) setTimeout(doJump, 100);
          else this.finishPlay();
        }
      };
      requestAnimationFrame(animate);
    };
    doJump();
  }

  finishPlay() {
    this.body.scale.set(1, 1, 1);
    if (this.bodyParts.leftArm) {
      this.bodyParts.leftArm.rotation.z = 0.4;
      this.bodyParts.rightArm.rotation.z = -0.4;
    }
    this.openMouth.visible = false;
    this.smile.visible = true;
    this.playHappyBounce();
    setTimeout(() => { this.state = 'idle'; }, 500);
  }

  spawnStars() {
    for (let i = 0; i < 8; i++) {
      setTimeout(() => this.createStar(), i * 150);
    }
  }

  createStar() {
    const geom = new THREE.OctahedronGeometry(0.015, 0);
    const colors = [0xFFD93D, 0xFF6B9D, 0x7C5CFF, 0x6BCB77];
    const mat = new THREE.MeshBasicMaterial({ 
      color: colors[Math.floor(Math.random() * colors.length)], transparent: true 
    });
    const star = new THREE.Mesh(geom, mat);
    
    const angle = Math.random() * Math.PI * 2;
    const dist = 0.05 + Math.random() * 0.1;
    const startX = this.root.position.x + Math.cos(angle) * dist;
    const startZ = this.root.position.z + Math.sin(angle) * dist;
    star.position.set(startX, 0.15, startZ);
    this.group.add(star);
    
    const duration = 1000;
    const start = performance.now();
    
    const animate = () => {
      const elapsed = performance.now() - start;
      const t = Math.min(elapsed / duration, 1);
      star.position.y = 0.15 + t * 0.2;
      star.rotation.y = elapsed * 0.01;
      star.rotation.x = elapsed * 0.008;
      star.material.opacity = 1 - t;
      star.scale.setScalar(1 + t);
      if (t < 1) requestAnimationFrame(animate);
      else { this.group.remove(star); geom.dispose(); mat.dispose(); }
    };
    requestAnimationFrame(animate);
  }

  playHappyBounce() {
    const duration = 500;
    const start = performance.now();
    const animate = () => {
      const t = Math.min((performance.now() - start) / duration, 1);
      this.root.position.y = Math.sin(t * Math.PI * 2) * (1 - t) * 0.03;
      if (t < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }

  // === MAIN UPDATE ===
  
  update(deltaTime) {
    this.animationTime += deltaTime;
    
    if (this.state === 'walking' && this.isMoving) {
      this.updateWalking(deltaTime);
    }
    
    this.updateIdle(deltaTime);
    this.updateSpecialFx(deltaTime);
    
    if (this.shadow) {
      this.shadow.position.x = this.root.position.x;
      this.shadow.position.z = this.root.position.z;
      this.shadow.scale.setScalar(0.8 + Math.sin(this.animationTime * 2) * 0.1);
    }
  }

  updateWalking(deltaTime) {
    const dir = this.walkTarget.clone().sub(this.root.position);
    const dist = dir.length();
    
    if (dist < 0.02) {
      this.isMoving = false;
      this.state = 'idle';
      return;
    }
    
    dir.normalize();
    this.root.position.x += dir.x * this.walkSpeed * deltaTime;
    this.root.position.z += dir.z * this.walkSpeed * deltaTime;
    
    const cycle = this.animationTime * 8;
    this.root.position.y = Math.abs(Math.sin(cycle)) * 0.015;
    
    if (this.bodyParts.leftLeg && this.bodyParts.rightLeg) {
      this.bodyParts.leftLeg.rotation.x = Math.sin(cycle) * 0.3;
      this.bodyParts.rightLeg.rotation.x = Math.sin(cycle + Math.PI) * 0.3;
    }
    
    if (this.bodyParts.leftArm && this.bodyParts.rightArm) {
      this.bodyParts.leftArm.rotation.x = Math.sin(cycle + Math.PI) * 0.2;
      this.bodyParts.rightArm.rotation.x = Math.sin(cycle) * 0.2;
    }
    
    this.body.rotation.z = Math.sin(cycle) * 0.05;
    
    if (this.bodyParts.leftEar && this.bodyParts.rightEar) {
      const earBounce = Math.sin(cycle * 2) * 0.1;
      this.bodyParts.leftEar.rotation.z = 0.25 + earBounce;
      this.bodyParts.rightEar.rotation.z = -0.25 - earBounce;
    }
  }

  updateIdle(deltaTime) {
    const breathe = Math.sin(this.animationTime * 1.5) * 0.015;
    if (this.state === 'idle') {
      this.body.scale.set(1 + breathe * 0.3, 1 + breathe, 1 + breathe * 0.3);
    }
    
    if (this.state === 'idle' && !this.isMoving) {
      this.root.position.y = Math.sin(this.animationTime * 1.2) * 0.008;
    }
    
    if (this.tailGroup && this.state !== 'playing') {
      const wagSpeed = this.state === 'happy' ? 6 : 3;
      const wagAmount = this.state === 'happy' ? 0.4 : 0.2;
      this.tailGroup.rotation.y = Math.sin(this.animationTime * wagSpeed) * wagAmount;
    }
    
    if (Math.random() < 0.002 && this.state === 'idle') this.blink();
    
    if (this.bodyParts.leftWing && this.bodyParts.rightWing) {
      const flapSpeed = this.state === 'playing' ? 15 : 4;
      const flap = Math.sin(this.animationTime * flapSpeed) * (this.state === 'playing' ? 0.6 : 0.2);
      this.bodyParts.leftWing.rotation.z = -flap - 0.3;
      this.bodyParts.rightWing.rotation.z = flap + 0.3;
    }
  }

  updateSpecialFx(deltaTime) {
    if (this.stars) {
      this.stars.forEach(star => {
        star.userData.angle += deltaTime * star.userData.speed;
        star.position.x = this.root.position.x + Math.cos(star.userData.angle) * star.userData.radius;
        star.position.z = this.root.position.z + Math.sin(star.userData.angle) * star.userData.radius;
        star.position.y = 0.25 + Math.sin(this.animationTime * 2) * 0.03;
        star.rotation.y = this.animationTime * 2;
      });
    }
    
    if (this.electricBolts && Math.random() < 0.02) {
      const bolt = this.electricBolts[Math.floor(Math.random() * this.electricBolts.length)];
      bolt.visible = true;
      bolt.position.set(
        this.root.position.x + (Math.random() - 0.5) * 0.2,
        0.15 + Math.random() * 0.1,
        this.root.position.z + (Math.random() - 0.5) * 0.2
      );
      bolt.rotation.z = Math.random() * Math.PI;
      setTimeout(() => bolt.visible = false, 100);
    }
    
    if (this.bubbles) {
      this.bubbles.forEach(bubble => {
        if (Math.random() < 0.01 && !bubble.visible) {
          bubble.visible = true;
          bubble.position.set(this.root.position.x + (Math.random() - 0.5) * 0.1, 0.1, this.root.position.z + 0.05);
          bubble.userData.startTime = this.animationTime;
        }
        if (bubble.visible) {
          const age = this.animationTime - bubble.userData.startTime;
          bubble.position.y = 0.1 + age * 0.1;
          bubble.position.x += Math.sin(age * 3) * 0.001;
          if (age > 2) bubble.visible = false;
        }
      });
    }
    
    if (this.flames) {
      this.flames.forEach((flame, i) => {
        if (this.state === 'happy' || this.state === 'playing') {
          flame.visible = true;
          flame.userData.angle += deltaTime * 2;
          flame.position.x = this.root.position.x + Math.cos(flame.userData.angle + i * 2) * 0.15;
          flame.position.z = this.root.position.z + Math.sin(flame.userData.angle + i * 2) * 0.15;
          flame.position.y = flame.userData.baseY + Math.sin(this.animationTime * 5 + i) * 0.02;
          flame.scale.setScalar(0.8 + Math.sin(this.animationTime * 8 + i) * 0.3);
        } else {
          flame.visible = false;
        }
      });
    }
  }

  easeInOut(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  lookAt(target) {
    if (this.state === 'walking') return;
    const dir = target.clone().sub(this.root.position);
    dir.y = 0;
    if (dir.length() > 0.1) {
      const angle = Math.atan2(dir.x, dir.z);
      const headTurn = (angle - this.root.rotation.y) * 0.1;
      this.head.rotation.y = THREE.MathUtils.clamp(headTurn, -0.4, 0.4);
    }
  }

  getObject() { return this.group; }
  setScale(scale) { this.group.scale.setScalar(scale); }
}