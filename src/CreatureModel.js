import * as THREE from 'three';

/**
 * Creates a cute 3D creature model procedurally using Three.js
 * Inspired by Palworld/Pokemon style characters
 */
export class CreatureModel {
  constructor(creatureData) {
    this.data = creatureData;
    this.group = new THREE.Group();
    this.animations = {};
    this.currentAnimation = null;
    this.animationTime = 0;
    this.isExcited = false;
    
    this.buildCreature();
  }

  buildCreature() {
    const { primary, secondary, accent } = this.data.colors;
    
    // Materials with cartoon-like appearance
    const primaryMat = new THREE.MeshToonMaterial({ 
      color: primary,
      emissive: primary,
      emissiveIntensity: 0.1
    });
    
    const secondaryMat = new THREE.MeshToonMaterial({ 
      color: secondary,
      emissive: secondary,
      emissiveIntensity: 0.1
    });
    
    const accentMat = new THREE.MeshToonMaterial({ 
      color: accent,
      emissive: accent,
      emissiveIntensity: 0.05
    });
    
    const eyeWhiteMat = new THREE.MeshToonMaterial({ color: 0xFFFFFF });
    const eyeBlackMat = new THREE.MeshToonMaterial({ color: 0x222222 });
    const noseMat = new THREE.MeshToonMaterial({ color: 0xFF6B6B });

    // Body - round and cute
    const bodyGeom = new THREE.SphereGeometry(0.15, 32, 32);
    bodyGeom.scale(1, 0.9, 0.85);
    this.body = new THREE.Mesh(bodyGeom, primaryMat);
    this.body.position.y = 0.15;
    this.body.castShadow = true;
    this.group.add(this.body);

    // Belly patch
    const bellyGeom = new THREE.SphereGeometry(0.1, 32, 32);
    bellyGeom.scale(1, 0.9, 0.5);
    this.belly = new THREE.Mesh(bellyGeom, accentMat);
    this.belly.position.set(0, 0.12, 0.08);
    this.body.add(this.belly);

    // Head
    const headGeom = new THREE.SphereGeometry(0.12, 32, 32);
    this.head = new THREE.Mesh(headGeom, primaryMat);
    this.head.position.y = 0.22;
    this.head.castShadow = true;
    this.body.add(this.head);

    // Face container
    this.face = new THREE.Group();
    this.head.add(this.face);
    this.face.position.z = 0.06;

    // Eyes
    this.leftEye = this.createEye(eyeWhiteMat, eyeBlackMat);
    this.leftEye.position.set(-0.04, 0.02, 0.04);
    this.face.add(this.leftEye);

    this.rightEye = this.createEye(eyeWhiteMat, eyeBlackMat);
    this.rightEye.position.set(0.04, 0.02, 0.04);
    this.face.add(this.rightEye);

    // Cheek blushes
    const blushGeom = new THREE.CircleGeometry(0.02, 16);
    const blushMat = new THREE.MeshToonMaterial({ 
      color: 0xFF9999, 
      transparent: true, 
      opacity: 0.6 
    });
    
    this.leftBlush = new THREE.Mesh(blushGeom, blushMat);
    this.leftBlush.position.set(-0.07, -0.01, 0.055);
    this.face.add(this.leftBlush);

    this.rightBlush = new THREE.Mesh(blushGeom, blushMat);
    this.rightBlush.position.set(0.07, -0.01, 0.055);
    this.face.add(this.rightBlush);

    // Nose
    const noseGeom = new THREE.SphereGeometry(0.015, 16, 16);
    this.nose = new THREE.Mesh(noseGeom, noseMat);
    this.nose.position.set(0, -0.01, 0.08);
    this.face.add(this.nose);

    // Mouth (smile curve)
    this.mouth = this.createMouth();
    this.mouth.position.set(0, -0.035, 0.07);
    this.face.add(this.mouth);

    // Ears based on creature type
    this.createEars(primaryMat, secondaryMat);

    // Arms
    this.leftArm = this.createArm(primaryMat);
    this.leftArm.position.set(-0.14, 0.05, 0);
    this.leftArm.rotation.z = 0.3;
    this.body.add(this.leftArm);

    this.rightArm = this.createArm(primaryMat);
    this.rightArm.position.set(0.14, 0.05, 0);
    this.rightArm.rotation.z = -0.3;
    this.body.add(this.rightArm);

    // Legs
    this.leftLeg = this.createLeg(primaryMat);
    this.leftLeg.position.set(-0.06, -0.12, 0);
    this.body.add(this.leftLeg);

    this.rightLeg = this.createLeg(primaryMat);
    this.rightLeg.position.set(0.06, -0.12, 0);
    this.body.add(this.rightLeg);

    // Tail
    this.tail = this.createTail(primaryMat, secondaryMat);
    this.tail.position.set(0, 0, -0.12);
    this.body.add(this.tail);

    // Special features based on creature
    this.addSpecialFeatures(primaryMat, secondaryMat, accentMat);

    // Shadow
    const shadowGeom = new THREE.CircleGeometry(0.15, 32);
    const shadowMat = new THREE.MeshBasicMaterial({ 
      color: 0x000000, 
      transparent: true, 
      opacity: 0.3 
    });
    this.shadow = new THREE.Mesh(shadowGeom, shadowMat);
    this.shadow.rotation.x = -Math.PI / 2;
    this.shadow.position.y = 0.001;
    this.group.add(this.shadow);
  }

  createEye(whiteMat, blackMat) {
    const eyeGroup = new THREE.Group();
    
    // Eye white
    const whiteGeom = new THREE.SphereGeometry(0.025, 16, 16);
    const white = new THREE.Mesh(whiteGeom, whiteMat);
    eyeGroup.add(white);
    
    // Pupil
    const pupilGeom = new THREE.SphereGeometry(0.015, 16, 16);
    const pupil = new THREE.Mesh(pupilGeom, blackMat);
    pupil.position.z = 0.015;
    white.add(pupil);
    
    // Sparkle
    const sparkleGeom = new THREE.SphereGeometry(0.005, 8, 8);
    const sparkleMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
    const sparkle = new THREE.Mesh(sparkleGeom, sparkleMat);
    sparkle.position.set(0.005, 0.005, 0.025);
    white.add(sparkle);
    
    eyeGroup.userData.pupil = pupil;
    return eyeGroup;
  }

  createMouth() {
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.02, 0, 0),
      new THREE.Vector3(0, -0.015, 0),
      new THREE.Vector3(0.02, 0, 0)
    );
    
    const points = curve.getPoints(20);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0x222222, linewidth: 2 });
    
    return new THREE.Line(geometry, material);
  }

  createEars(primaryMat, secondaryMat) {
    const earGroup = new THREE.Group();
    
    // Pointy ears
    const earGeom = new THREE.ConeGeometry(0.04, 0.08, 16);
    
    const leftEar = new THREE.Mesh(earGeom, primaryMat);
    leftEar.position.set(-0.07, 0.1, 0);
    leftEar.rotation.z = 0.3;
    earGroup.add(leftEar);
    
    const rightEar = new THREE.Mesh(earGeom, primaryMat);
    rightEar.position.set(0.07, 0.1, 0);
    rightEar.rotation.z = -0.3;
    earGroup.add(rightEar);
    
    // Inner ears
    const innerGeom = new THREE.ConeGeometry(0.025, 0.05, 16);
    
    const leftInner = new THREE.Mesh(innerGeom, secondaryMat);
    leftInner.position.set(0, -0.01, 0.015);
    leftEar.add(leftInner);
    
    const rightInner = new THREE.Mesh(innerGeom, secondaryMat);
    rightInner.position.set(0, -0.01, 0.015);
    rightEar.add(rightInner);
    
    this.ears = earGroup;
    this.head.add(earGroup);
  }

  createArm(material) {
    const armGroup = new THREE.Group();
    
    const armGeom = new THREE.CapsuleGeometry(0.025, 0.06, 8, 16);
    const arm = new THREE.Mesh(armGeom, material);
    arm.castShadow = true;
    armGroup.add(arm);
    
    // Paw
    const pawGeom = new THREE.SphereGeometry(0.03, 16, 16);
    const paw = new THREE.Mesh(pawGeom, material);
    paw.position.y = -0.05;
    armGroup.add(paw);
    
    return armGroup;
  }

  createLeg(material) {
    const legGroup = new THREE.Group();
    
    const legGeom = new THREE.CapsuleGeometry(0.03, 0.04, 8, 16);
    const leg = new THREE.Mesh(legGeom, material);
    leg.castShadow = true;
    legGroup.add(leg);
    
    // Foot
    const footGeom = new THREE.SphereGeometry(0.035, 16, 16);
    footGeom.scale(1.2, 0.6, 1.3);
    const foot = new THREE.Mesh(footGeom, material);
    foot.position.y = -0.04;
    foot.position.z = 0.01;
    legGroup.add(foot);
    
    return legGroup;
  }

  createTail(primaryMat, secondaryMat) {
    const tailGroup = new THREE.Group();
    
    // Fluffy tail
    const tailGeom = new THREE.SphereGeometry(0.06, 16, 16);
    tailGeom.scale(0.8, 0.8, 1);
    const tail = new THREE.Mesh(tailGeom, secondaryMat);
    tail.castShadow = true;
    tailGroup.add(tail);
    
    return tailGroup;
  }

  addSpecialFeatures(primaryMat, secondaryMat, accentMat) {
    const id = this.data.id;
    
    if (id === 'sparkitty') {
      // Lightning bolt patterns
      this.addLightningBolts();
    } else if (id === 'stardust') {
      // Floating stars
      this.addStars();
    } else if (id === 'leafling') {
      // Leaf on head
      this.addLeaf();
    } else if (id === 'aquapup') {
      // Bubble effects
      this.addBubbles();
    } else if (id === 'fluffox') {
      // Fire wisps
      this.addFireWisps();
    } else if (id === 'bubbird') {
      // Wings
      this.addWings(primaryMat, secondaryMat);
    }
  }

  addLightningBolts() {
    const boltMat = new THREE.MeshBasicMaterial({ 
      color: 0xFFFF00,
      emissive: 0xFFFF00,
      emissiveIntensity: 1
    });
    
    const boltGeom = new THREE.ConeGeometry(0.02, 0.05, 4);
    
    for (let i = 0; i < 3; i++) {
      const bolt = new THREE.Mesh(boltGeom, boltMat);
      const angle = (i / 3) * Math.PI * 2;
      bolt.position.set(
        Math.cos(angle) * 0.2,
        0.3 + Math.sin(i) * 0.05,
        Math.sin(angle) * 0.2
      );
      bolt.rotation.z = Math.random() * 0.5;
      this.group.add(bolt);
    }
  }

  addStars() {
    const starMat = new THREE.MeshBasicMaterial({ color: 0xFFE082 });
    
    for (let i = 0; i < 5; i++) {
      const starGeom = new THREE.OctahedronGeometry(0.015, 0);
      const star = new THREE.Mesh(starGeom, starMat);
      const angle = (i / 5) * Math.PI * 2;
      star.position.set(
        Math.cos(angle) * 0.25,
        0.35 + Math.sin(i * 2) * 0.05,
        Math.sin(angle) * 0.25
      );
      star.userData.orbitAngle = angle;
      star.userData.orbitSpeed = 0.5 + Math.random() * 0.5;
      this.group.add(star);
    }
  }

  addLeaf() {
    const leafMat = new THREE.MeshToonMaterial({ color: 0x4CAF50 });
    const leafGeom = new THREE.ConeGeometry(0.03, 0.06, 4);
    
    const leaf = new THREE.Mesh(leafGeom, leafMat);
    leaf.position.set(0, 0.14, 0);
    leaf.rotation.x = 0.3;
    this.head.add(leaf);
    
    // Flower
    const flowerMat = new THREE.MeshToonMaterial({ color: 0xFF9999 });
    const flowerGeom = new THREE.SphereGeometry(0.015, 8, 8);
    const flower = new THREE.Mesh(flowerGeom, flowerMat);
    flower.position.set(0.02, 0.05, 0);
    leaf.add(flower);
  }

  addBubbles() {
    const bubbleMat = new THREE.MeshPhysicalMaterial({ 
      color: 0x88DDFF,
      transparent: true,
      opacity: 0.4,
      roughness: 0,
      metalness: 0.1
    });
    
    this.bubbles = [];
    for (let i = 0; i < 4; i++) {
      const size = 0.015 + Math.random() * 0.02;
      const bubbleGeom = new THREE.SphereGeometry(size, 16, 16);
      const bubble = new THREE.Mesh(bubbleGeom, bubbleMat);
      bubble.position.set(
        (Math.random() - 0.5) * 0.3,
        0.2 + Math.random() * 0.2,
        (Math.random() - 0.5) * 0.3
      );
      bubble.userData.floatOffset = Math.random() * Math.PI * 2;
      this.bubbles.push(bubble);
      this.group.add(bubble);
    }
  }

  addFireWisps() {
    const wispMat = new THREE.MeshBasicMaterial({ 
      color: 0xFF6600,
      transparent: true,
      opacity: 0.8
    });
    
    this.wisps = [];
    for (let i = 0; i < 3; i++) {
      const wispGeom = new THREE.SphereGeometry(0.02, 8, 8);
      const wisp = new THREE.Mesh(wispGeom, wispMat);
      wisp.userData.angle = (i / 3) * Math.PI * 2;
      wisp.userData.speed = 2 + Math.random();
      this.wisps.push(wisp);
      this.group.add(wisp);
    }
  }

  addWings(primaryMat, secondaryMat) {
    const wingGeom = new THREE.SphereGeometry(0.08, 16, 16);
    wingGeom.scale(0.3, 1, 0.8);
    
    this.leftWing = new THREE.Mesh(wingGeom, secondaryMat);
    this.leftWing.position.set(-0.12, 0.1, -0.02);
    this.leftWing.rotation.z = 0.5;
    this.body.add(this.leftWing);
    
    this.rightWing = new THREE.Mesh(wingGeom, secondaryMat);
    this.rightWing.position.set(0.12, 0.1, -0.02);
    this.rightWing.rotation.z = -0.5;
    this.body.add(this.rightWing);
  }

  // Animation methods
  update(deltaTime) {
    this.animationTime += deltaTime;
    
    // Idle breathing animation
    const breathe = Math.sin(this.animationTime * 2) * 0.02;
    this.body.scale.set(1 + breathe * 0.5, 1 + breathe, 1 + breathe * 0.5);
    
    // Gentle hover
    this.group.position.y = Math.sin(this.animationTime * 1.5) * 0.01;
    
    // Ear wiggle
    if (this.ears) {
      const earWiggle = Math.sin(this.animationTime * 3) * 0.05;
      this.ears.children[0].rotation.z = 0.3 + earWiggle;
      this.ears.children[1].rotation.z = -0.3 - earWiggle;
    }
    
    // Tail wag
    if (this.tail) {
      this.tail.rotation.y = Math.sin(this.animationTime * 4) * 0.3;
      this.tail.rotation.x = Math.sin(this.animationTime * 3) * 0.1;
    }
    
    // Wing flap for bubbird
    if (this.leftWing && this.rightWing) {
      const flapSpeed = this.isExcited ? 12 : 4;
      const flapAmount = this.isExcited ? 0.5 : 0.2;
      const flap = Math.sin(this.animationTime * flapSpeed) * flapAmount;
      this.leftWing.rotation.z = 0.5 + flap;
      this.rightWing.rotation.z = -0.5 - flap;
    }
    
    // Bubble float
    if (this.bubbles) {
      this.bubbles.forEach((bubble, i) => {
        bubble.position.y = 0.25 + Math.sin(this.animationTime * 2 + bubble.userData.floatOffset) * 0.05;
        bubble.position.x += Math.sin(this.animationTime + i) * 0.0005;
      });
    }
    
    // Fire wisps
    if (this.wisps) {
      this.wisps.forEach((wisp) => {
        wisp.userData.angle += deltaTime * wisp.userData.speed;
        const radius = 0.2;
        wisp.position.set(
          Math.cos(wisp.userData.angle) * radius,
          0.25 + Math.sin(this.animationTime * 3 + wisp.userData.angle) * 0.05,
          Math.sin(wisp.userData.angle) * radius
        );
        wisp.scale.setScalar(0.8 + Math.sin(this.animationTime * 5) * 0.3);
      });
    }
    
    // Excited animation
    if (this.isExcited) {
      const jump = Math.abs(Math.sin(this.animationTime * 8)) * 0.05;
      this.group.position.y += jump;
      
      // Happy squish
      const squish = Math.sin(this.animationTime * 8);
      this.body.scale.x = 1 + squish * 0.1;
      this.body.scale.z = 1 + squish * 0.1;
    }
  }

  playHappy() {
    this.isExcited = true;
    setTimeout(() => {
      this.isExcited = false;
    }, 2000);
  }

  lookAt(target) {
    // Make eyes follow target
    if (this.leftEye && this.rightEye) {
      const lookDir = target.clone().sub(this.head.position).normalize();
      
      const leftPupil = this.leftEye.userData.pupil;
      const rightPupil = this.rightEye.userData.pupil;
      
      if (leftPupil && rightPupil) {
        leftPupil.position.x = lookDir.x * 0.005;
        leftPupil.position.y = lookDir.y * 0.005;
        rightPupil.position.x = lookDir.x * 0.005;
        rightPupil.position.y = lookDir.y * 0.005;
      }
    }
  }

  getObject() {
    return this.group;
  }

  setPosition(x, y, z) {
    this.group.position.set(x, y, z);
  }

  setScale(scale) {
    this.group.scale.setScalar(scale);
  }
}
