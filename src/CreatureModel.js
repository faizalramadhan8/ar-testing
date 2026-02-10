import * as THREE from 'three';

/**
 * Pokemon-Style 3D Creature Model
 * Features: Toon shading, outlines, chibi proportions, expressive features
 */
export class CreatureModel {
  constructor(creatureData) {
    this.data = creatureData;
    this.group = new THREE.Group();
    this.animationTime = 0;
    
    // State
    this.state = 'idle';
    this.isMoving = false;
    this.walkTarget = new THREE.Vector3();
    this.walkSpeed = 0.08;
    this.walkRadius = 0.35;
    
    // Parts for animation
    this.parts = {};
    
    // Create gradient textures for toon shading
    this.toonGradient = this.createToonGradient();
    
    this.buildCreature();
    this.scheduleNextAction();
  }

  createToonGradient() {
    const canvas = document.createElement('canvas');
    canvas.width = 4;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    
    // 4-step toon gradient
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, 1, 1);
    ctx.fillStyle = '#666';
    ctx.fillRect(1, 0, 1, 1);
    ctx.fillStyle = '#999';
    ctx.fillRect(2, 0, 1, 1);
    ctx.fillStyle = '#fff';
    ctx.fillRect(3, 0, 1, 1);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    return texture;
  }

  createToonMaterial(color, options = {}) {
    return new THREE.MeshToonMaterial({
      color: color,
      gradientMap: this.toonGradient,
      ...options
    });
  }

  buildCreature() {
    const { primary, secondary, accent } = this.data.colors;
    
    // Root for transforms
    this.root = new THREE.Group();
    this.group.add(this.root);

    // === BODY (Chibi proportions: small round body) ===
    this.buildBody(primary, secondary, accent);
    
    // === HEAD (Big cute head - 60% of total height) ===
    this.buildHead(primary, secondary, accent);
    
    // === LIMBS ===
    this.buildLimbs(primary, accent);
    
    // === TAIL ===
    this.buildTail(primary, secondary);
    
    // === OUTLINE EFFECT ===
    this.addOutlines();
    
    // === SHADOW ===
    this.addShadow();
    
    // Random start position
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * 0.15;
    this.root.position.x = Math.cos(angle) * dist;
    this.root.position.z = Math.sin(angle) * dist;
  }

  buildBody(primary, secondary, accent) {
    // Main body - rounded and cute
    const bodyGeo = this.createSmoothSphere(0.09, 32);
    bodyGeo.scale(1.1, 0.9, 1.0);
    
    const bodyMat = this.createToonMaterial(primary);
    this.body = new THREE.Mesh(bodyGeo, bodyMat);
    this.body.position.y = 0.09;
    this.body.castShadow = true;
    this.parts.body = this.body;
    this.root.add(this.body);
    
    // Belly patch - lighter colored oval
    const bellyGeo = this.createSmoothSphere(0.065, 24);
    bellyGeo.scale(0.9, 0.85, 0.4);
    const bellyMat = this.createToonMaterial(accent);
    this.belly = new THREE.Mesh(bellyGeo, bellyMat);
    this.belly.position.set(0, -0.01, 0.055);
    this.body.add(this.belly);
  }

  buildHead(primary, secondary, accent) {
    // Big round head (chibi style)
    const headGeo = this.createSmoothSphere(0.12, 48);
    headGeo.scale(1.0, 0.95, 0.95);
    
    const headMat = this.createToonMaterial(primary);
    this.head = new THREE.Mesh(headGeo, headMat);
    this.head.position.set(0, 0.13, 0.02);
    this.head.castShadow = true;
    this.parts.head = this.head;
    this.body.add(this.head);
    
    // Face container
    this.face = new THREE.Group();
    this.face.position.set(0, 0, 0.08);
    this.head.add(this.face);
    
    // Build facial features
    this.buildEyes(primary);
    this.buildNose();
    this.buildMouth();
    this.buildCheeks();
    this.buildEars(primary, secondary);
  }

  buildEyes(primary) {
    const eyeGroup = new THREE.Group();
    eyeGroup.position.y = 0.015;
    
    [-0.04, 0.04].forEach((x, i) => {
      const eye = this.createEye(x, primary);
      eyeGroup.add(eye);
      if (i === 0) this.parts.leftEye = eye;
      else this.parts.rightEye = eye;
    });
    
    this.face.add(eyeGroup);
  }

  createEye(xPos, primaryColor) {
    const eyeContainer = new THREE.Group();
    eyeContainer.position.x = xPos;
    
    // White of eye (big and round like Pokemon)
    const whiteGeo = this.createSmoothSphere(0.028, 32);
    whiteGeo.scale(1, 1.15, 0.75);
    const whiteMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
    const white = new THREE.Mesh(whiteGeo, whiteMat);
    eyeContainer.add(white);
    
    // Iris (colored part)
    const irisGeo = this.createSmoothSphere(0.018, 24);
    const irisMat = new THREE.MeshBasicMaterial({ color: 0x3D2B22 });
    const iris = new THREE.Mesh(irisGeo, irisMat);
    iris.position.z = 0.015;
    white.add(iris);
    eyeContainer.userData.iris = iris;
    
    // Pupil (black center)
    const pupilGeo = this.createSmoothSphere(0.01, 16);
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const pupil = new THREE.Mesh(pupilGeo, pupilMat);
    pupil.position.z = 0.008;
    iris.add(pupil);
    
    // Big shine (top-right) - signature Pokemon look
    const shine1Geo = this.createSmoothSphere(0.007, 12);
    const shineMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
    const shine1 = new THREE.Mesh(shine1Geo, shineMat);
    shine1.position.set(0.005, 0.008, 0.018);
    iris.add(shine1);
    
    // Small shine (bottom-left)
    const shine2Geo = this.createSmoothSphere(0.004, 8);
    const shine2 = new THREE.Mesh(shine2Geo, shineMat);
    shine2.position.set(-0.004, -0.005, 0.018);
    iris.add(shine2);
    
    // Eyelid for blinking
    const lidGeo = this.createSmoothSphere(0.03, 24, Math.PI);
    const lidMat = this.createToonMaterial(primaryColor);
    const lid = new THREE.Mesh(lidGeo, lidMat);
    lid.rotation.x = Math.PI;
    lid.position.z = 0.002;
    lid.scale.y = 0.01; // Start open
    eyeContainer.add(lid);
    eyeContainer.userData.lid = lid;
    
    return eyeContainer;
  }

  buildNose() {
    // Small cute nose
    const noseGeo = this.createSmoothSphere(0.012, 16);
    noseGeo.scale(1.1, 0.8, 0.7);
    const noseMat = this.createToonMaterial(0x4A3728);
    this.nose = new THREE.Mesh(noseGeo, noseMat);
    this.nose.position.set(0, -0.025, 0.06);
    this.face.add(this.nose);
    
    // Nose highlight
    const hlGeo = this.createSmoothSphere(0.004, 8);
    const hlMat = new THREE.MeshBasicMaterial({ 
      color: 0xFFFFFF, transparent: true, opacity: 0.5 
    });
    const hl = new THREE.Mesh(hlGeo, hlMat);
    hl.position.set(0.003, 0.003, 0.006);
    this.nose.add(hl);
  }

  buildMouth() {
    this.mouthGroup = new THREE.Group();
    this.mouthGroup.position.set(0, -0.05, 0.05);
    this.face.add(this.mouthGroup);
    
    // Smile line (curved tube)
    const smileCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.025, 0, 0),
      new THREE.Vector3(0, -0.012, 0.005),
      new THREE.Vector3(0.025, 0, 0)
    );
    const smileGeo = new THREE.TubeGeometry(smileCurve, 16, 0.004, 8, false);
    const smileMat = new THREE.MeshBasicMaterial({ color: 0x4A3728 });
    this.smile = new THREE.Mesh(smileGeo, smileMat);
    this.mouthGroup.add(this.smile);
    
    // Open mouth (for eating/playing)
    const openGeo = this.createSmoothSphere(0.02, 16);
    openGeo.scale(1.2, 0.9, 0.7);
    const openMat = this.createToonMaterial(0x8B4557);
    this.openMouth = new THREE.Mesh(openGeo, openMat);
    this.openMouth.visible = false;
    this.mouthGroup.add(this.openMouth);
    
    // Tongue
    const tongueGeo = this.createSmoothSphere(0.01, 12);
    tongueGeo.scale(1.2, 0.5, 1);
    const tongueMat = this.createToonMaterial(0xFF8FAB);
    this.tongue = new THREE.Mesh(tongueGeo, tongueMat);
    this.tongue.position.set(0, -0.008, 0.008);
    this.tongue.visible = false;
    this.mouthGroup.add(this.tongue);
  }

  buildCheeks() {
    // Blush circles (signature Pokemon feature)
    const blushGeo = new THREE.CircleGeometry(0.018, 24);
    const blushMat = new THREE.MeshBasicMaterial({ 
      color: 0xFF8FAB, transparent: true, opacity: 0.6, depthWrite: false 
    });
    
    this.leftBlush = new THREE.Mesh(blushGeo, blushMat);
    this.leftBlush.position.set(-0.065, -0.015, 0.04);
    this.leftBlush.rotation.y = 0.35;
    this.face.add(this.leftBlush);
    
    this.rightBlush = new THREE.Mesh(blushGeo, blushMat.clone());
    this.rightBlush.position.set(0.065, -0.015, 0.04);
    this.rightBlush.rotation.y = -0.35;
    this.face.add(this.rightBlush);
  }

  buildEars(primary, secondary) {
    this.ears = new THREE.Group();
    const type = this.data.id;
    
    if (type === 'bubbird') {
      this.buildCrest(primary, secondary);
    } else if (type === 'aquapup') {
      this.buildFloppyEars(primary, secondary);
    } else if (type === 'stardust') {
      this.buildBunnyEars(primary, secondary);
    } else {
      this.buildPointyEars(primary, secondary);
    }
    
    this.head.add(this.ears);
  }

  buildPointyEars(primary, secondary) {
    [-0.065, 0.065].forEach((x, i) => {
      const earGroup = new THREE.Group();
      
      // Outer ear - triangular with rounded edges
      const earShape = new THREE.Shape();
      earShape.moveTo(0, 0);
      earShape.lineTo(-0.025, 0.07);
      earShape.quadraticCurveTo(0, 0.085, 0.025, 0.07);
      earShape.lineTo(0, 0);
      
      const earGeo = new THREE.ExtrudeGeometry(earShape, {
        depth: 0.02,
        bevelEnabled: true,
        bevelThickness: 0.008,
        bevelSize: 0.008,
        bevelSegments: 4
      });
      
      const earMat = this.createToonMaterial(primary);
      const ear = new THREE.Mesh(earGeo, earMat);
      ear.rotation.x = -0.25;
      ear.position.z = -0.01;
      ear.castShadow = true;
      earGroup.add(ear);
      
      // Inner ear
      const innerShape = new THREE.Shape();
      innerShape.moveTo(0, 0.01);
      innerShape.lineTo(-0.012, 0.045);
      innerShape.quadraticCurveTo(0, 0.055, 0.012, 0.045);
      innerShape.lineTo(0, 0.01);
      
      const innerGeo = new THREE.ShapeGeometry(innerShape);
      const innerMat = this.createToonMaterial(secondary);
      const inner = new THREE.Mesh(innerGeo, innerMat);
      inner.position.set(0, 0.005, 0.025);
      inner.rotation.x = -0.25;
      earGroup.add(inner);
      
      earGroup.position.set(x, 0.1, 0);
      earGroup.rotation.z = x > 0 ? -0.2 : 0.2;
      
      this.ears.add(earGroup);
      if (i === 0) this.parts.leftEar = earGroup;
      else this.parts.rightEar = earGroup;
    });
  }

  buildFloppyEars(primary, secondary) {
    [-0.08, 0.08].forEach((x, i) => {
      const earGroup = new THREE.Group();
      
      const earGeo = this.createSmoothSphere(0.035, 24);
      earGeo.scale(0.5, 1.4, 0.35);
      const earMat = this.createToonMaterial(primary);
      const ear = new THREE.Mesh(earGeo, earMat);
      ear.castShadow = true;
      earGroup.add(ear);
      
      // Inner ear
      const innerGeo = this.createSmoothSphere(0.025, 16);
      innerGeo.scale(0.4, 1.1, 0.25);
      const innerMat = this.createToonMaterial(secondary);
      const inner = new THREE.Mesh(innerGeo, innerMat);
      inner.position.z = 0.008;
      earGroup.add(inner);
      
      earGroup.position.set(x, 0.06, -0.01);
      earGroup.rotation.z = x > 0 ? -0.9 : 0.9;
      earGroup.rotation.x = 0.3;
      
      this.ears.add(earGroup);
      if (i === 0) this.parts.leftEar = earGroup;
      else this.parts.rightEar = earGroup;
    });
  }

  buildBunnyEars(primary, secondary) {
    [-0.03, 0.03].forEach((x, i) => {
      const earGroup = new THREE.Group();
      
      // Long bunny ear
      const earGeo = this.createSmoothSphere(0.025, 24);
      earGeo.scale(0.6, 2.5, 0.5);
      const earMat = this.createToonMaterial(primary);
      const ear = new THREE.Mesh(earGeo, earMat);
      ear.position.y = 0.05;
      ear.castShadow = true;
      earGroup.add(ear);
      
      // Inner ear
      const innerGeo = this.createSmoothSphere(0.015, 16);
      innerGeo.scale(0.5, 2, 0.3);
      const innerMat = this.createToonMaterial(secondary);
      const inner = new THREE.Mesh(innerGeo, innerMat);
      inner.position.set(0, 0.05, 0.008);
      earGroup.add(inner);
      
      earGroup.position.set(x, 0.1, -0.01);
      earGroup.rotation.z = x > 0 ? -0.15 : 0.15;
      earGroup.rotation.x = -0.1;
      
      this.ears.add(earGroup);
      if (i === 0) this.parts.leftEar = earGroup;
      else this.parts.rightEar = earGroup;
    });
  }

  buildCrest(primary, secondary) {
    // Bird crest feathers
    const colors = [secondary, primary, secondary];
    [-0.015, 0, 0.015].forEach((zOff, i) => {
      const featherGeo = new THREE.ConeGeometry(0.015, 0.055 - Math.abs(i - 1) * 0.01, 8);
      const featherMat = this.createToonMaterial(colors[i]);
      const feather = new THREE.Mesh(featherGeo, featherMat);
      feather.position.set(0, 0.12, -0.02 + zOff);
      feather.rotation.x = -0.2 - i * 0.1;
      feather.castShadow = true;
      this.ears.add(feather);
    });
  }

  buildLimbs(primary, accent) {
    // Arms (small and stubby - chibi style)
    [-0.09, 0.09].forEach((x, i) => {
      const armGroup = new THREE.Group();
      
      // Arm
      const armGeo = this.createSmoothSphere(0.022, 16);
      armGeo.scale(0.8, 1.3, 0.9);
      const armMat = this.createToonMaterial(primary);
      const arm = new THREE.Mesh(armGeo, armMat);
      arm.castShadow = true;
      armGroup.add(arm);
      
      // Paw
      const pawGeo = this.createSmoothSphere(0.018, 16);
      const pawMat = this.createToonMaterial(accent);
      const paw = new THREE.Mesh(pawGeo, pawMat);
      paw.position.y = -0.03;
      armGroup.add(paw);
      
      armGroup.position.set(x, 0.02, 0.02);
      armGroup.rotation.z = x > 0 ? -0.5 : 0.5;
      
      this.body.add(armGroup);
      if (i === 0) this.parts.leftArm = armGroup;
      else this.parts.rightArm = armGroup;
    });
    
    // Legs (small feet)
    [-0.04, 0.04].forEach((x, i) => {
      const legGroup = new THREE.Group();
      
      // Foot
      const footGeo = this.createSmoothSphere(0.025, 16);
      footGeo.scale(1.1, 0.6, 1.3);
      const footMat = this.createToonMaterial(accent);
      const foot = new THREE.Mesh(footGeo, footMat);
      foot.castShadow = true;
      legGroup.add(foot);
      
      legGroup.position.set(x, -0.08, 0.01);
      
      this.body.add(legGroup);
      if (i === 0) this.parts.leftLeg = legGroup;
      else this.parts.rightLeg = legGroup;
    });
  }

  buildTail(primary, secondary) {
    this.tailGroup = new THREE.Group();
    const type = this.data.id;
    
    if (type === 'fluffox') {
      // Fluffy fox tail
      const tailGeo = this.createSmoothSphere(0.055, 24);
      tailGeo.scale(0.6, 0.6, 1.4);
      const tailMat = this.createToonMaterial(secondary);
      const tail = new THREE.Mesh(tailGeo, tailMat);
      tail.position.z = -0.04;
      tail.rotation.x = -0.3;
      tail.castShadow = true;
      this.tailGroup.add(tail);
      
      // White tip
      const tipGeo = this.createSmoothSphere(0.03, 16);
      const tipMat = this.createToonMaterial(0xFFFFFF);
      const tip = new THREE.Mesh(tipGeo, tipMat);
      tip.position.z = -0.06;
      this.tailGroup.add(tip);
      
    } else if (type === 'bubbird') {
      // Tail feathers
      [-0.02, 0, 0.02].forEach((x, i) => {
        const featherGeo = new THREE.BoxGeometry(0.015, 0.004, 0.05);
        const featherMat = this.createToonMaterial(i === 1 ? primary : secondary);
        const feather = new THREE.Mesh(featherGeo, featherMat);
        feather.position.set(x, 0, -0.02);
        feather.rotation.x = 0.4;
        this.tailGroup.add(feather);
      });
    } else if (type === 'stardust') {
      // Bunny puff tail
      const tailGeo = this.createSmoothSphere(0.03, 16);
      const tailMat = this.createToonMaterial(secondary);
      const tail = new THREE.Mesh(tailGeo, tailMat);
      this.tailGroup.add(tail);
    } else {
      // Round tail
      const tailGeo = this.createSmoothSphere(0.03, 16);
      const tailMat = this.createToonMaterial(secondary);
      const tail = new THREE.Mesh(tailGeo, tailMat);
      tail.castShadow = true;
      this.tailGroup.add(tail);
    }
    
    this.tailGroup.position.set(0, 0, -0.08);
    this.body.add(this.tailGroup);
    this.parts.tail = this.tailGroup;
    
    // Add special effects
    this.addSpecialEffects();
  }

  addSpecialEffects() {
    const id = this.data.id;
    
    if (id === 'sparkitty') {
      // Lightning bolt cheek marks
      this.addLightningMarks();
    } else if (id === 'stardust') {
      // Floating stars
      this.addFloatingStars();
    } else if (id === 'leafling') {
      // Flower accessory
      this.addFlower();
    } else if (id === 'aquapup') {
      // Water droplet
      this.addWaterDroplet();
    } else if (id === 'bubbird') {
      // Wings
      this.addWings();
    }
  }

  addLightningMarks() {
    const boltShape = new THREE.Shape();
    boltShape.moveTo(0, 0.015);
    boltShape.lineTo(0.008, 0.008);
    boltShape.lineTo(0.003, 0.008);
    boltShape.lineTo(0.01, 0);
    boltShape.lineTo(0.002, 0.006);
    boltShape.lineTo(0.007, 0.006);
    boltShape.lineTo(0, 0.015);
    
    const boltGeo = new THREE.ShapeGeometry(boltShape);
    const boltMat = new THREE.MeshBasicMaterial({ color: 0xFFD700 });
    
    const leftBolt = new THREE.Mesh(boltGeo, boltMat);
    leftBolt.position.set(-0.075, -0.02, 0.055);
    leftBolt.rotation.y = 0.4;
    leftBolt.rotation.z = 0.2;
    this.face.add(leftBolt);
    
    const rightBolt = new THREE.Mesh(boltGeo, boltMat);
    rightBolt.position.set(0.065, -0.02, 0.055);
    rightBolt.rotation.y = -0.4;
    rightBolt.rotation.z = -0.2;
    rightBolt.scale.x = -1;
    this.face.add(rightBolt);
  }

  addFloatingStars() {
    this.stars = [];
    const starMat = new THREE.MeshBasicMaterial({ color: 0xFFE082 });
    
    for (let i = 0; i < 5; i++) {
      const starGeo = new THREE.OctahedronGeometry(0.012, 0);
      const star = new THREE.Mesh(starGeo, starMat);
      star.userData = {
        angle: (i / 5) * Math.PI * 2,
        radius: 0.18,
        speed: 0.4 + Math.random() * 0.2,
        yOffset: (Math.random() - 0.5) * 0.1
      };
      this.root.add(star);
      this.stars.push(star);
    }
  }

  addFlower() {
    const flowerGroup = new THREE.Group();
    
    // Petals
    const petalMat = this.createToonMaterial(0xFFB7C5);
    for (let i = 0; i < 5; i++) {
      const petalGeo = this.createSmoothSphere(0.015, 12);
      petalGeo.scale(0.6, 1, 0.3);
      const petal = new THREE.Mesh(petalGeo, petalMat);
      const angle = (i / 5) * Math.PI * 2;
      petal.position.set(Math.cos(angle) * 0.012, Math.sin(angle) * 0.012, 0);
      petal.rotation.z = angle;
      flowerGroup.add(petal);
    }
    
    // Center
    const centerGeo = this.createSmoothSphere(0.008, 12);
    const centerMat = this.createToonMaterial(0xFFEB3B);
    const center = new THREE.Mesh(centerGeo, centerMat);
    center.position.z = 0.008;
    flowerGroup.add(center);
    
    flowerGroup.position.set(0.05, 0.11, 0.04);
    flowerGroup.rotation.x = -0.5;
    this.head.add(flowerGroup);
  }

  addWaterDroplet() {
    const dropGeo = this.createSmoothSphere(0.015, 16);
    dropGeo.scale(0.8, 1.2, 0.8);
    const dropMat = new THREE.MeshPhysicalMaterial({
      color: 0x88DDFF,
      transparent: true,
      opacity: 0.7,
      roughness: 0,
      metalness: 0.1
    });
    const drop = new THREE.Mesh(dropGeo, dropMat);
    drop.position.set(0, 0.13, 0.05);
    this.head.add(drop);
  }

  addWings() {
    const wingMat = this.createToonMaterial(this.data.colors.secondary);
    
    [-0.08, 0.08].forEach((x, i) => {
      const wingShape = new THREE.Shape();
      wingShape.moveTo(0, 0);
      wingShape.quadraticCurveTo(0.06, 0.04, 0.09, 0);
      wingShape.quadraticCurveTo(0.07, -0.02, 0, 0);
      
      const wingGeo = new THREE.ShapeGeometry(wingShape);
      const wing = new THREE.Mesh(wingGeo, wingMat);
      wing.scale.x = x > 0 ? 1 : -1;
      wing.position.set(x, 0.07, -0.02);
      wing.rotation.y = x > 0 ? -0.4 : 0.4;
      this.body.add(wing);
      
      if (i === 0) this.parts.leftWing = wing;
      else this.parts.rightWing = wing;
    });
  }

  addOutlines() {
    // Add outline effect to main meshes
    const outlineMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      side: THREE.BackSide
    });
    
    // Body outline
    const bodyOutlineGeo = this.body.geometry.clone();
    const bodyOutline = new THREE.Mesh(bodyOutlineGeo, outlineMat);
    bodyOutline.scale.multiplyScalar(1.05);
    this.body.add(bodyOutline);
    
    // Head outline
    const headOutlineGeo = this.head.geometry.clone();
    const headOutline = new THREE.Mesh(headOutlineGeo, outlineMat);
    headOutline.scale.multiplyScalar(1.04);
    this.head.add(headOutline);
  }

  addShadow() {
    const shadowGeo = new THREE.CircleGeometry(0.1, 32);
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

  createSmoothSphere(radius, segments, phiLength = Math.PI * 2) {
    return new THREE.SphereGeometry(radius, segments, segments, 0, phiLength);
  }

  // === ANIMATION METHODS ===
  
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
    if (r < 0.35) this.blink();
    else if (r < 0.6) this.wiggleEars();
    else if (r < 0.8) this.lookAround();
    else this.tailWag();
  }

  blink() {
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
    const target = (Math.random() - 0.5) * 0.6;
    const start = this.head.rotation.y;
    const dur = 400;
    const startT = performance.now();
    const anim = () => {
      const t = Math.min((performance.now() - startT) / dur, 1);
      const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      this.head.rotation.y = start + (target - start) * e;
      if (t < 1) requestAnimationFrame(anim);
      else setTimeout(() => { this.head.rotation.y = 0; }, 600);
    };
    requestAnimationFrame(anim);
  }

  tailWag() {
    const dur = 500;
    const start = performance.now();
    const anim = () => {
      const t = (performance.now() - start) / dur;
      if (this.parts.tail) {
        this.parts.tail.rotation.y = Math.sin(t * Math.PI * 6) * 0.3 * (1 - t);
      }
      if (t < 1) requestAnimationFrame(anim);
    };
    requestAnimationFrame(anim);
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
    
    const dur = 1400;
    const start = performance.now();
    const anim = () => {
      const elapsed = performance.now() - start;
      const t = elapsed / dur;
      const chompPhase = (elapsed / 350) % 1;
      const chomp = Math.sin(chompPhase * Math.PI);
      
      this.head.position.y = 0.13 - chomp * 0.025;
      this.openMouth.scale.y = 0.5 + chomp * 0.5;
      
      const squish = 1 + Math.sin(elapsed * 0.02) * 0.04;
      this.body.scale.set(squish, 1 / squish, squish);
      
      if (t < 1) requestAnimationFrame(anim);
      else this.finishEating();
    };
    requestAnimationFrame(anim);
  }

  finishEating() {
    this.openMouth.visible = false;
    this.tongue.visible = false;
    this.smile.visible = true;
    this.body.scale.set(1, 1, 1);
    this.head.position.y = 0.13;
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
        
        const sx = this.root.position.x + (Math.random() - 0.5) * 0.08;
        const sy = 0.25;
        const sz = this.root.position.z + 0.08;
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
    
    this.leftBlush.material.opacity = 0.85;
    this.rightBlush.material.opacity = 0.85;
    
    this.spawnHearts();
    
    const dur = 1100;
    const start = performance.now();
    const anim = () => {
      const elapsed = performance.now() - start;
      const t = elapsed / dur;
      
      this.root.rotation.z = Math.sin(elapsed * 0.008) * 0.08;
      
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
    this.root.rotation.z = 0;
    [this.parts.leftEye, this.parts.rightEye].forEach(eye => {
      if (eye?.userData?.lid) eye.userData.lid.scale.y = 0.01;
    });
    this.leftBlush.material.opacity = 0.6;
    this.rightBlush.material.opacity = 0.6;
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
    
    const sx = this.root.position.x + (Math.random() - 0.5) * 0.12;
    heart.position.set(sx, 0.22, this.root.position.z + 0.08);
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
    
    this.smile.visible = false;
    this.openMouth.visible = true;
    
    this.spawnStars();
    
    let jumpCount = 0;
    const maxJumps = 3;
    
    const doJump = () => {
      const start = performance.now();
      const jumpDur = 350;
      
      const anim = () => {
        const t = Math.min((performance.now() - start) / jumpDur, 1);
        const jp = Math.sin(t * Math.PI);
        
        this.root.position.y = jp * 0.07;
        this.body.scale.set(1 - jp * 0.15, 1 + jp * 0.25, 1 - jp * 0.15);
        this.root.rotation.y += 0.04;
        
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
    this.body.scale.set(1, 1, 1);
    this.root.position.y = 0;
    if (this.parts.leftArm) {
      this.parts.leftArm.rotation.z = 0.5;
      this.parts.rightArm.rotation.z = -0.5;
    }
    this.openMouth.visible = false;
    this.smile.visible = true;
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
    
    const angle = Math.random() * Math.PI * 2;
    const dist = 0.05 + Math.random() * 0.08;
    const sx = this.root.position.x + Math.cos(angle) * dist;
    const sz = this.root.position.z + Math.sin(angle) * dist;
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
    const anim = () => {
      const t = Math.min((performance.now() - start) / dur, 1);
      this.root.position.y = Math.sin(t * Math.PI * 2) * (1 - t) * 0.025;
      if (t < 1) requestAnimationFrame(anim);
    };
    requestAnimationFrame(anim);
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
      const s = 0.9 + Math.sin(this.animationTime * 2) * 0.08;
      this.shadow.scale.setScalar(s);
    }
  }

  updateWalking(deltaTime) {
    const dir = this.walkTarget.clone().sub(this.root.position);
    const dist = dir.length();
    
    if (dist < 0.015) {
      this.isMoving = false;
      this.state = 'idle';
      return;
    }
    
    dir.normalize();
    this.root.position.x += dir.x * this.walkSpeed * deltaTime;
    this.root.position.z += dir.z * this.walkSpeed * deltaTime;
    
    const cycle = this.animationTime * 10;
    this.root.position.y = Math.abs(Math.sin(cycle)) * 0.012;
    
    if (this.parts.leftLeg && this.parts.rightLeg) {
      this.parts.leftLeg.rotation.x = Math.sin(cycle) * 0.25;
      this.parts.rightLeg.rotation.x = Math.sin(cycle + Math.PI) * 0.25;
    }
    
    if (this.parts.leftArm && this.parts.rightArm) {
      this.parts.leftArm.rotation.x = Math.sin(cycle + Math.PI) * 0.15;
      this.parts.rightArm.rotation.x = Math.sin(cycle) * 0.15;
    }
    
    this.body.rotation.z = Math.sin(cycle) * 0.04;
    
    if (this.parts.leftEar && this.parts.rightEar) {
      const eb = Math.sin(cycle * 2) * 0.08;
      const baseL = this.data.id === 'aquapup' ? 0.9 : 0.2;
      const baseR = this.data.id === 'aquapup' ? -0.9 : -0.2;
      this.parts.leftEar.rotation.z = baseL + eb;
      this.parts.rightEar.rotation.z = baseR - eb;
    }
  }

  updateIdle(deltaTime) {
    const breathe = Math.sin(this.animationTime * 1.8) * 0.012;
    if (this.state === 'idle') {
      this.body.scale.set(1 + breathe * 0.25, 1 + breathe, 1 + breathe * 0.25);
    }
    
    if (this.state === 'idle' && !this.isMoving) {
      this.root.position.y = Math.sin(this.animationTime * 1.4) * 0.006;
    }
    
    if (this.parts.tail && this.state !== 'playing') {
      const ws = this.state === 'happy' ? 7 : 3.5;
      const wa = this.state === 'happy' ? 0.35 : 0.18;
      this.parts.tail.rotation.y = Math.sin(this.animationTime * ws) * wa;
    }
    
    if (Math.random() < 0.002 && this.state === 'idle') this.blink();
    
    if (this.parts.leftWing && this.parts.rightWing) {
      const fs = this.state === 'playing' ? 18 : 5;
      const fa = this.state === 'playing' ? 0.5 : 0.15;
      const flap = Math.sin(this.animationTime * fs) * fa;
      this.parts.leftWing.rotation.z = -flap - 0.2;
      this.parts.rightWing.rotation.z = flap + 0.2;
    }
  }

  updateSpecialFx(deltaTime) {
    if (this.stars) {
      this.stars.forEach(star => {
        star.userData.angle += deltaTime * star.userData.speed;
        star.position.x = this.root.position.x + Math.cos(star.userData.angle) * star.userData.radius;
        star.position.z = this.root.position.z + Math.sin(star.userData.angle) * star.userData.radius;
        star.position.y = 0.24 + Math.sin(this.animationTime * 2.5 + star.userData.yOffset) * 0.025;
        star.rotation.y = this.animationTime * 2.5;
      });
    }
  }

  getObject() { return this.group; }
  setScale(scale) { this.group.scale.setScalar(scale); }
}