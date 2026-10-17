import * as THREE from 'three';

// Procedural texture for Salih's face based on user photo
function createSalihFaceTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Skin tone base (Warm Indian/South Asian golden skin tone)
  ctx.fillStyle = '#e5ab82';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle skin gradient & shading
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, 'rgba(255, 230, 210, 0.2)');
  grad.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
  grad.addColorStop(1, 'rgba(160, 90, 50, 0.25)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Cheeks subtle warmth
  ctx.fillStyle = 'rgba(225, 120, 100, 0.15)';
  ctx.beginPath();
  ctx.ellipse(150, 290, 50, 35, 0, 0, Math.PI * 2);
  ctx.ellipse(362, 290, 50, 35, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyebrows (Thick, dark, expressive)
  ctx.fillStyle = '#1c1917';
  // Left eyebrow
  ctx.beginPath();
  ctx.moveTo(110, 205);
  ctx.quadraticCurveTo(170, 185, 230, 205);
  ctx.quadraticCurveTo(170, 195, 110, 212);
  ctx.fill();

  // Right eyebrow
  ctx.beginPath();
  ctx.moveTo(402, 205);
  ctx.quadraticCurveTo(342, 185, 282, 205);
  ctx.quadraticCurveTo(342, 195, 402, 212);
  ctx.fill();

  // Eyes (Warm dark brown/black almond eyes with confident shine)
  // Left eye
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(175, 235, 36, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#291e17';
  ctx.beginPath();
  ctx.arc(175, 235, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(175, 235, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(170, 230, 4, 0, Math.PI * 2);
  ctx.fill();

  // Right eye
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(337, 235, 36, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#291e17';
  ctx.beginPath();
  ctx.arc(337, 235, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(337, 235, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(332, 230, 4, 0, Math.PI * 2);
  ctx.fill();

  // Nose bridge & nostrils
  ctx.strokeStyle = '#c48b64';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(256, 210);
  ctx.lineTo(252, 285);
  ctx.lineTo(240, 305);
  ctx.lineTo(272, 305);
  ctx.stroke();

  // Confident, friendly warm smile with white teeth!
  ctx.fillStyle = '#a84e3e';
  ctx.beginPath();
  ctx.moveTo(180, 360);
  ctx.quadraticCurveTo(256, 415, 332, 360);
  ctx.quadraticCurveTo(256, 385, 180, 360);
  ctx.fill();

  // Teeth
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(195, 362);
  ctx.quadraticCurveTo(256, 382, 317, 362);
  ctx.quadraticCurveTo(256, 372, 195, 362);
  ctx.fill();

  // Neatly trimmed mustache above upper lip
  ctx.fillStyle = 'rgba(28, 25, 23, 0.88)';
  ctx.beginPath();
  ctx.moveTo(195, 345);
  ctx.quadraticCurveTo(256, 332, 317, 345);
  ctx.quadraticCurveTo(256, 355, 195, 345);
  ctx.fill();

  // Trimmed beard along jawline and chin (as in the photo)
  ctx.fillStyle = 'rgba(28, 25, 23, 0.75)';
  // Chin beard
  ctx.beginPath();
  ctx.ellipse(256, 440, 60, 40, 0, 0, Math.PI);
  ctx.fill();
  // Jawline stubble
  ctx.lineWidth = 28;
  ctx.strokeStyle = 'rgba(28, 25, 23, 0.65)';
  ctx.beginPath();
  ctx.moveTo(100, 310);
  ctx.quadraticCurveTo(150, 450, 256, 475);
  ctx.quadraticCurveTo(362, 450, 412, 310);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Procedural texture for the Maroon / Burgundy button-up shirt
function createMaroonShirtTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Deep maroon / burgundy base
  ctx.fillStyle = '#881337'; // rich burgundy
  ctx.fillRect(0, 0, 512, 512);

  // Subtle fabric texture
  ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
  for (let y = 0; y < 512; y += 4) {
    ctx.fillRect(0, y, 512, 2);
  }

  // Center button placket stripe
  ctx.fillStyle = '#6b0f2b';
  ctx.fillRect(236, 0, 40, 512);

  // White shirt buttons with dark thread holes
  for (let y = 90; y < 512; y += 95) {
    // Outer white button
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(256, y, 11, 0, Math.PI * 2);
    ctx.fill();

    // Button rim
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Thread dots
    ctx.fillStyle = '#475569';
    ctx.fillRect(253, y - 3, 2, 2);
    ctx.fillRect(257, y - 3, 2, 2);
    ctx.fillRect(253, y + 2, 2, 2);
    ctx.fillRect(257, y + 2, 2, 2);
  }

  // Chest pockets with flap
  ctx.fillStyle = '#781030';
  ctx.fillRect(80, 200, 110, 120);
  ctx.fillRect(322, 200, 110, 120);
  ctx.strokeStyle = '#5a0c24';
  ctx.lineWidth = 3;
  ctx.strokeRect(80, 200, 110, 120);
  ctx.strokeRect(322, 200, 110, 120);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createSalihCharacterMesh(): THREE.Group {
  const root = new THREE.Group();
  root.name = 'salih_character';

  // 1. Materials matching the photo
  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xe5ab82,
    roughness: 0.6,
    metalness: 0.05,
  });

  const faceTex = createSalihFaceTexture();
  const faceMat = new THREE.MeshStandardMaterial({
    map: faceTex,
    roughness: 0.55,
    metalness: 0.05,
  });

  const hairMat = new THREE.MeshStandardMaterial({
    color: 0x18181b, // Jet black hair
    roughness: 0.85,
    metalness: 0.1,
  });

  const shirtTex = createMaroonShirtTexture();
  const maroonShirtMat = new THREE.MeshStandardMaterial({
    map: shirtTex,
    roughness: 0.75,
    metalness: 0.1,
  });

  const tacticalBlackMat = new THREE.MeshStandardMaterial({
    color: 0x1e222b,
    roughness: 0.5,
    metalness: 0.35,
  });

  const cargoPantsMat = new THREE.MeshStandardMaterial({
    color: 0x272b36, // Dark tactical cargo grey/black
    roughness: 0.8,
    metalness: 0.15,
  });

  const blueGlowMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8, // Electric blue LED glow on weapon
  });

  // 2. Torso: Maroon Button-up Shirt (Height: 0.68, Width: 0.52, Depth: 0.32)
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.68, 0.32), maroonShirtMat);
  torso.position.y = 1.08;
  torso.castShadow = true;
  torso.receiveShadow = true;
  root.add(torso);

  // Shirt Collar flaps around neck
  const collarLeft = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.14), maroonShirtMat);
  collarLeft.position.set(-0.13, 1.44, 0.13);
  collarLeft.rotation.set(-0.25, 0.3, -0.2);
  root.add(collarLeft);

  const collarRight = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.14), maroonShirtMat);
  collarRight.position.set(0.13, 1.44, 0.13);
  collarRight.rotation.set(-0.25, -0.3, 0.2);
  root.add(collarRight);

  // 3. Tactical Backpack & Harness Straps (Black tactical webbing from photo)
  // Shoulder straps
  const strapLeft = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.65, 0.03), tacticalBlackMat);
  strapLeft.position.set(-0.16, 1.1, 0.165);
  root.add(strapLeft);

  const strapRight = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.65, 0.03), tacticalBlackMat);
  strapRight.position.set(0.16, 1.1, 0.165);
  root.add(strapRight);

  // Backpack on back
  const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.55, 0.2), tacticalBlackMat);
  backpack.position.set(0, 1.12, -0.24);
  backpack.castShadow = true;
  root.add(backpack);

  // Tactical Duty Belt with ammo pouch
  const belt = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.08, 0.34), tacticalBlackMat);
  belt.position.set(0, 0.74, 0);
  root.add(belt);

  const pouch = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.08), tacticalBlackMat);
  pouch.position.set(-0.27, 0.74, 0.05);
  root.add(pouch);

  // 4. Head, Face & Styled Dark Hair
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.14, 16), skinMat);
  neck.position.y = 1.46;
  root.add(neck);

  // Head block
  const headGeo = new THREE.BoxGeometry(0.3, 0.32, 0.28);
  // Assign face material to front face (+Z = index 4)
  const headMats = [
    skinMat, skinMat, skinMat, skinMat, faceMat, hairMat
  ];
  const head = new THREE.Mesh(headGeo, headMats);
  head.position.set(0, 1.64, 0.02);
  head.castShadow = true;
  root.add(head);

  // Styled Dark Quiff Hair on top (voluminous, side-tapered as in image)
  const hairTop = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.14, 0.31), hairMat);
  hairTop.position.set(0, 1.82, 0.02);
  root.add(hairTop);

  // Front styled quiff wave
  const hairFringe = new THREE.Mesh(new THREE.BoxGeometry(0.31, 0.1, 0.1), hairMat);
  hairFringe.position.set(-0.02, 1.8, 0.16);
  hairFringe.rotation.x = -0.3;
  hairFringe.rotation.z = -0.1;
  root.add(hairFringe);

  // 5. Arms with Rolled-up Maroon Sleeves & Skin Forearms
  // Left Upper Arm (Rolled Maroon Sleeve)
  const leftUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.08, 0.28, 16), maroonShirtMat);
  leftUpperArm.position.set(-0.35, 1.2, 0.05);
  leftUpperArm.rotation.x = -0.25;
  root.add(leftUpperArm);

  // Left Forearm (Skin tone + tactical wristband)
  const leftForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.065, 0.32, 16), skinMat);
  leftForearm.position.set(-0.34, 0.94, 0.18);
  leftForearm.rotation.x = -0.65;
  root.add(leftForearm);

  const leftWristband = new THREE.Mesh(new THREE.CylinderGeometry(0.076, 0.076, 0.06, 16), tacticalBlackMat);
  leftWristband.position.set(-0.34, 0.86, 0.23);
  leftWristband.rotation.x = -0.65;
  root.add(leftWristband);

  // Right Upper Arm (Rolled Maroon Sleeve)
  const rightUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.08, 0.28, 16), maroonShirtMat);
  rightUpperArm.position.set(0.35, 1.2, 0.05);
  rightUpperArm.rotation.x = -0.3;
  root.add(rightUpperArm);

  // Right Forearm (Skin tone)
  const rightForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.065, 0.32, 16), skinMat);
  rightForearm.position.set(0.34, 0.94, 0.18);
  rightForearm.rotation.x = -0.7;
  root.add(rightForearm);

  // 6. Tactical Dark Cargo Pants & Combat Boots
  const hips = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.2, 0.3), cargoPantsMat);
  hips.position.y = 0.65;
  root.add(hips);

  // Left Leg (Cargo pants with side pocket)
  const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.58, 0.22), cargoPantsMat);
  leftLeg.position.set(-0.14, 0.36, 0);
  leftLeg.castShadow = true;
  root.add(leftLeg);

  const leftPocket = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.16, 0.12), cargoPantsMat);
  leftPocket.position.set(-0.24, 0.36, 0);
  root.add(leftPocket);

  // Left Combat Boot
  const leftBoot = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.16, 0.26), tacticalBlackMat);
  leftBoot.position.set(-0.14, 0.08, 0.03);
  leftBoot.castShadow = true;
  root.add(leftBoot);

  // Right Leg (Cargo pants with side pocket)
  const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.58, 0.22), cargoPantsMat);
  rightLeg.position.set(0.14, 0.36, 0);
  rightLeg.castShadow = true;
  root.add(rightLeg);

  const rightPocket = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.16, 0.12), cargoPantsMat);
  rightPocket.position.set(0.24, 0.36, 0);
  root.add(rightPocket);

  // Right Combat Boot
  const rightBoot = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.16, 0.26), tacticalBlackMat);
  rightBoot.position.set(0.14, 0.08, 0.03);
  rightBoot.castShadow = true;
  root.add(rightBoot);

  // 7. Salih's Signature Cyber Blue LED Assault Rifle in Hands (From photo!)
  const weaponGroup = new THREE.Group();
  weaponGroup.name = 'salih_signature_rifle';

  // Rifle receiver & barrel
  const rifleBody = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.11, 0.68), tacticalBlackMat);
  weaponGroup.add(rifleBody);

  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.45, 16), tacticalBlackMat);
  barrel.rotation.x = Math.PI / 2;
  barrel.position.set(0, 0.02, -0.5);
  weaponGroup.add(barrel);

  // Electric Blue LED Glowing Energy Strips (Signature feature from user's image)
  const blueLedLeft = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.03, 0.42), blueGlowMat);
  blueLedLeft.position.set(-0.04, 0.03, -0.15);
  weaponGroup.add(blueLedLeft);

  const blueLedRight = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.03, 0.42), blueGlowMat);
  blueLedRight.position.set(0.04, 0.03, -0.15);
  weaponGroup.add(blueLedRight);

  const blueLedBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.08, 16), blueGlowMat);
  blueLedBarrel.rotation.x = Math.PI / 2;
  blueLedBarrel.position.set(0, 0.02, -0.68);
  weaponGroup.add(blueLedBarrel);

  // Tactical Optic Scope with glowing blue lens
  const scope = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.045, 0.22, 16), tacticalBlackMat);
  scope.rotation.x = Math.PI / 2;
  scope.position.set(0, 0.12, -0.05);
  weaponGroup.add(scope);

  const scopeLens = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.02, 16), blueGlowMat);
  scopeLens.rotation.x = Math.PI / 2;
  scopeLens.position.set(0, 0.12, -0.16);
  weaponGroup.add(scopeLens);

  // Position weapon held across chest like in the user's photo!
  weaponGroup.scale.set(0.85, 0.85, 0.85);
  weaponGroup.position.set(0.05, 1.0, 0.32);
  weaponGroup.rotation.set(-0.25, 0.45, -0.1);
  root.add(weaponGroup);

  return root;
}

export function createSalihFirstPersonArms(): THREE.Group {
  const armsGroup = new THREE.Group();
  armsGroup.name = 'salih_fp_arms';

  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xe5ab82,
    roughness: 0.6,
    metalness: 0.05,
  });

  const maroonMat = new THREE.MeshStandardMaterial({
    color: 0x881337, // Maroon shirt sleeve
    roughness: 0.75,
    metalness: 0.1,
  });

  const blackMat = new THREE.MeshStandardMaterial({
    color: 0x1e222b,
    roughness: 0.5,
    metalness: 0.3,
  });

  // Right Arm (Trigger hand)
  const rightUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.06, 0.3, 16), maroonMat);
  rightUpperArm.position.set(0.28, -0.28, 0.1);
  rightUpperArm.rotation.set(-0.4, 0.2, 0.3);
  armsGroup.add(rightUpperArm);

  const rightForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.045, 0.35, 16), skinMat);
  rightForearm.position.set(0.24, -0.25, -0.16);
  rightForearm.rotation.set(-1.1, 0.15, 0.25);
  armsGroup.add(rightForearm);

  const rightHand = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.1), skinMat);
  rightHand.position.set(0.24, -0.24, -0.32);
  rightHand.rotation.set(-0.3, 0.1, 0);
  armsGroup.add(rightHand);

  // Left Arm (Fore-end support hand with tactical black wristband)
  const leftUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.06, 0.3, 16), maroonMat);
  leftUpperArm.position.set(-0.24, -0.3, 0.12);
  leftUpperArm.rotation.set(-0.4, -0.2, -0.3);
  armsGroup.add(leftUpperArm);

  const leftForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.045, 0.38, 16), skinMat);
  leftForearm.position.set(-0.06, -0.28, -0.18);
  leftForearm.rotation.set(-0.9, -0.5, -0.6);
  armsGroup.add(leftForearm);

  // Tactical black wristband from photo
  const wristband = new THREE.Mesh(new THREE.CylinderGeometry(0.056, 0.056, 0.06, 16), blackMat);
  wristband.position.set(-0.02, -0.26, -0.28);
  wristband.rotation.set(-0.9, -0.5, -0.6);
  armsGroup.add(wristband);

  const leftHand = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.075, 0.09), skinMat);
  leftHand.position.set(0.12, -0.23, -0.44);
  leftHand.rotation.set(-0.2, -0.4, -0.1);
  armsGroup.add(leftHand);

  return armsGroup;
}

