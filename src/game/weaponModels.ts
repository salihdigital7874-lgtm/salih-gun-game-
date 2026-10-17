import * as THREE from 'three';
import { WeaponType } from '../types/game';

// Shared reusable materials
const darkMetalMat = new THREE.MeshStandardMaterial({
  color: 0x181a20,
  roughness: 0.28,
  metalness: 0.85,
});

const brushedSteelMat = new THREE.MeshStandardMaterial({
  color: 0x7c8594,
  roughness: 0.18,
  metalness: 0.95,
});

const polymerGripMat = new THREE.MeshStandardMaterial({
  color: 0x111317,
  roughness: 0.65,
  metalness: 0.1,
});

const goldFinishMat = new THREE.MeshStandardMaterial({
  color: 0xffb703,
  roughness: 0.2,
  metalness: 0.92,
});

const rubyRedMat = new THREE.MeshStandardMaterial({
  color: 0xef4444,
  roughness: 0.35,
  metalness: 0.5,
});

const opticGlassMat = new THREE.MeshPhysicalMaterial({
  color: 0x06b6d4,
  transmission: 0.8,
  opacity: 0.85,
  transparent: true,
  roughness: 0.05,
  ior: 1.5,
  thickness: 0.4,
});

function createGlowMat(colorHex: number): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({
    color: colorHex,
  });
}

export function createWeaponMesh(type: WeaponType): THREE.Group {
  const root = new THREE.Group();
  root.name = `weapon_${type}`;

  switch (type) {
    case 'pistol': {
      // 1. Receiver / Slide
      const slide = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.09, 0.44), brushedSteelMat);
      slide.position.set(0, 0.045, 0);
      root.add(slide);

      // 2. Barrel core
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.22, 16), darkMetalMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.05, -0.25);
      root.add(barrel);

      // 3. Lower frame
      const frame = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.32), darkMetalMat);
      frame.position.set(0, -0.01, 0.02);
      root.add(frame);

      // 4. Ergonomic Grip
      const grip = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.26, 0.11), polymerGripMat);
      grip.position.set(0, -0.14, 0.12);
      grip.rotation.x = 0.25;
      root.add(grip);

      // 5. Magazine plate
      const magBase = new THREE.Mesh(new THREE.BoxGeometry(0.078, 0.03, 0.12), brushedSteelMat);
      magBase.position.set(0, -0.27, 0.15);
      magBase.rotation.x = 0.25;
      root.add(magBase);

      // 6. Trigger guard
      const guard = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.008, 8, 16, Math.PI), darkMetalMat);
      guard.position.set(0, -0.07, 0.05);
      guard.rotation.y = Math.PI / 2;
      root.add(guard);

      // 7. Tactical Under-barrel Laser / Glow
      const laserBox = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.03, 0.14), polymerGripMat);
      laserBox.position.set(0, -0.05, -0.12);
      root.add(laserBox);

      const laserEmitter = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.02, 8), createGlowMat(0x38bdf8));
      laserEmitter.rotation.x = Math.PI / 2;
      laserEmitter.position.set(0, -0.05, -0.19);
      root.add(laserEmitter);

      // 8. Front sight post
      const frontSight = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.02, 0.02), createGlowMat(0x38bdf8));
      frontSight.position.set(0, 0.1, -0.2);
      root.add(frontSight);
      break;
    }

    case 'revolver': {
      // 1. Heavy Frame
      const frame = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.12, 0.36), brushedSteelMat);
      frame.position.set(0, 0.02, 0.02);
      root.add(frame);

      // 2. Revolver Cylinder (fluted)
      const cylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.16, 12), darkMetalMat);
      cylinder.rotation.x = Math.PI / 2;
      cylinder.position.set(0, 0.04, 0.04);
      root.add(cylinder);

      // 3. Heavy Octagonal Barrel
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.045, 0.38, 8), brushedSteelMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.06, -0.28);
      root.add(barrel);

      // 4. Barrel Top Rib / Heat Vents
      const rib = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.02, 0.36), darkMetalMat);
      rib.position.set(0, 0.11, -0.28);
      root.add(rib);

      // 5. Wooden / Tactical Textured Grip
      const gripMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.5, metalness: 0.1 });
      const grip = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.28, 0.14), gripMat);
      grip.position.set(0, -0.15, 0.18);
      grip.rotation.x = 0.35;
      root.add(grip);

      // 6. Hammer
      const hammer = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.06, 0.05), brushedSteelMat);
      hammer.position.set(0, 0.1, 0.18);
      hammer.rotation.x = -0.3;
      root.add(hammer);

      // 7. Orange Glow Accent
      const glowBar = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.015, 0.12), createGlowMat(0xf97316));
      glowBar.position.set(0, 0.125, -0.25);
      root.add(glowBar);
      break;
    }

    case 'smg': {
      // 1. Upper Receiver
      const upper = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.1, 0.55), darkMetalMat);
      upper.position.set(0, 0.06, -0.05);
      root.add(upper);

      // 2. Lower Receiver
      const lower = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.08, 0.42), polymerGripMat);
      lower.position.set(0, -0.02, 0.02);
      root.add(lower);

      // 3. Compact Shrouded Barrel & Suppressor
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.28, 16), brushedSteelMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.06, -0.42);
      root.add(barrel);

      // 4. Extended Stick Magazine (slanted)
      const mag = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.35, 0.08), polymerGripMat);
      mag.position.set(0, -0.18, -0.08);
      mag.rotation.x = -0.2;
      root.add(mag);

      // 5. Pistol Grip
      const grip = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.24, 0.09), polymerGripMat);
      grip.position.set(0, -0.14, 0.15);
      grip.rotation.x = 0.25;
      root.add(grip);

      // 6. Tactical Stock (wireframe folding)
      const stockArm = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.3), darkMetalMat);
      stockArm.position.set(0, 0.02, 0.35);
      root.add(stockArm);

      const stockPad = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.16, 0.04), polymerGripMat);
      stockPad.position.set(0, -0.02, 0.49);
      root.add(stockPad);

      // 7. Holographic Reflex Sight
      const sightBase = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.05, 0.12), darkMetalMat);
      sightBase.position.set(0, 0.13, -0.05);
      root.add(sightBase);

      const sightGlass = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.01), opticGlassMat);
      sightGlass.position.set(0, 0.15, -0.05);
      root.add(sightGlass);

      // 8. Purple Cyber Glow trim
      const trim = new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.015, 0.35), createGlowMat(0xa855f7));
      trim.position.set(0, 0.08, -0.1);
      root.add(trim);
      break;
    }

    case 'shotgun': {
      // 1. Heavy Receiver
      const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.11, 0.5), darkMetalMat);
      receiver.position.set(0, 0.04, 0.05);
      root.add(receiver);

      // 2. Twin Heavy Barrels (Main + Mag Tube)
      const mainBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.65, 16), brushedSteelMat);
      mainBarrel.rotation.x = Math.PI / 2;
      mainBarrel.position.set(0, 0.07, -0.5);
      root.add(mainBarrel);

      const magTube = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.55, 16), darkMetalMat);
      magTube.rotation.x = Math.PI / 2;
      magTube.position.set(0, 0.01, -0.45);
      root.add(magTube);

      // 3. Pump Slide (ribbed fore-end)
      const pump = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.22, 12), polymerGripMat);
      pump.rotation.x = Math.PI / 2;
      pump.position.set(0, 0.02, -0.42);
      root.add(pump);

      // 4. Solid Tactical Stock
      const stock = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.14, 0.42), polymerGripMat);
      stock.position.set(0, -0.02, 0.45);
      stock.rotation.x = -0.1;
      root.add(stock);

      // 5. Pistol Grip
      const grip = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.24, 0.09), polymerGripMat);
      grip.position.set(0, -0.15, 0.18);
      grip.rotation.x = 0.3;
      root.add(grip);

      // 6. Red Shell Holder on Receiver
      const shellHolder = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 0.18), darkMetalMat);
      shellHolder.position.set(0.04, 0.05, 0.05);
      root.add(shellHolder);

      for (let i = 0; i < 3; i++) {
        const shell = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.08, 8), rubyRedMat);
        shell.position.set(0.105, 0.05, -0.02 + i * 0.06);
        root.add(shell);
      }

      // 7. Muzzle Heat Shield
      const heatShield = new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.046, 0.3, 12, 1, true), darkMetalMat);
      heatShield.rotation.x = Math.PI / 2;
      heatShield.position.set(0, 0.07, -0.5);
      root.add(heatShield);
      break;
    }

    case 'rifle': {
      // 1. Modern Assault Receiver (Upper & Lower)
      const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.12, 0.58), darkMetalMat);
      receiver.position.set(0, 0.05, 0.05);
      root.add(receiver);

      // 2. Free-floating M-LOK Handguard / Rail
      const handguard = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.09, 0.5), darkMetalMat);
      handguard.position.set(0, 0.06, -0.42);
      root.add(handguard);

      // 3. Extended Rifled Barrel with Muzzle Brake
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.35, 16), brushedSteelMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.06, -0.78);
      root.add(barrel);

      const brake = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.08), brushedSteelMat);
      brake.position.set(0, 0.06, -0.96);
      root.add(brake);

      // 4. Curved Banana Mag (30 rounds)
      const mag = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.38, 0.14), polymerGripMat);
      mag.position.set(0, -0.18, -0.1);
      mag.rotation.x = -0.25;
      root.add(mag);

      // 5. Ergonomic Rifle Grip
      const grip = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.25, 0.09), polymerGripMat);
      grip.position.set(0, -0.15, 0.15);
      grip.rotation.x = 0.28;
      root.add(grip);

      // 6. Adjustable Crane Stock
      const bufferTube = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.3, 16), brushedSteelMat);
      bufferTube.rotation.x = Math.PI / 2;
      bufferTube.position.set(0, 0.04, 0.45);
      root.add(bufferTube);

      const stock = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.18, 0.26), polymerGripMat);
      stock.position.set(0, 0.01, 0.52);
      root.add(stock);

      // 7. Tactical Illuminated Scope (Blue LED glowing scope from photo)
      const scopeBody = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.045, 0.25, 16), darkMetalMat);
      scopeBody.rotation.x = Math.PI / 2;
      scopeBody.position.set(0, 0.16, -0.02);
      root.add(scopeBody);

      const scopeLens = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.02, 16), createGlowMat(0x38bdf8));
      scopeLens.rotation.x = Math.PI / 2;
      scopeLens.position.set(0, 0.16, -0.15);
      root.add(scopeLens);

      // 8. Salih's Signature Cyber Blue LED Energy Rails (From uploaded photo!)
      const blueRailLeft = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.025, 0.5), createGlowMat(0x38bdf8));
      blueRailLeft.position.set(-0.048, 0.06, -0.38);
      root.add(blueRailLeft);

      const blueRailRight = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.025, 0.5), createGlowMat(0x38bdf8));
      blueRailRight.position.set(0.048, 0.06, -0.38);
      root.add(blueRailRight);

      const stockLed = new THREE.Mesh(new THREE.BoxGeometry(0.082, 0.02, 0.18), createGlowMat(0x38bdf8));
      stockLed.position.set(0, 0.02, 0.48);
      root.add(stockLed);

      const magLed = new THREE.Mesh(new THREE.BoxGeometry(0.068, 0.18, 0.015), createGlowMat(0x38bdf8));
      magLed.position.set(0, -0.18, -0.03);
      magLed.rotation.x = -0.25;
      root.add(magLed);
      break;
    }

    case 'sniper': {
      // 1. Heavy Anti-Material Receiver
      const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.14, 0.72), darkMetalMat);
      receiver.position.set(0, 0.05, 0.1);
      root.add(receiver);

      // 2. Long Fluted Heavy Bull Barrel
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 1.1, 16), brushedSteelMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.07, -0.75);
      root.add(barrel);

      // 3. Arrowhead Muzzle Brake
      const brake = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.07, 0.16), darkMetalMat);
      brake.position.set(0, 0.07, -1.35);
      root.add(brake);

      // 4. Massive Long-Range High Magnification Scope
      const scopeTube = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 0.45, 16), darkMetalMat);
      scopeTube.rotation.x = Math.PI / 2;
      scopeTube.position.set(0, 0.19, -0.05);
      root.add(scopeTube);

      const scopeLens = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 16), opticGlassMat);
      scopeLens.rotation.x = Math.PI / 2;
      scopeLens.position.set(0, 0.19, -0.28);
      root.add(scopeLens);

      // Scope mount rings
      const ring1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.04), brushedSteelMat);
      ring1.position.set(0, 0.15, 0.08);
      root.add(ring1);
      const ring2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.04), brushedSteelMat);
      ring2.position.set(0, 0.15, -0.18);
      root.add(ring2);

      // 5. Heavy Stock with Adjustable Cheek Rest
      const stock = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.22, 0.52), polymerGripMat);
      stock.position.set(0, -0.01, 0.65);
      root.add(stock);

      // 6. Tactical Folded Bipod under barrel
      const bipodMount = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.08), darkMetalMat);
      bipodMount.position.set(0, 0.01, -0.7);
      root.add(bipodMount);

      // 7. Cyan Precision Laser Accent
      const laser = new THREE.Mesh(new THREE.BoxGeometry(0.115, 0.015, 0.45), createGlowMat(0x06b6d4));
      laser.position.set(0, 0.09, -0.15);
      root.add(laser);
      break;
    }

    case 'plasma': {
      // 1. Futuristic Toroid Reactor Core & Chassis
      const core = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.04, 16, 24), darkMetalMat);
      core.position.set(0, 0.04, 0.15);
      root.add(core);

      const reactorGlow = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 16), createGlowMat(0xec4899));
      reactorGlow.position.set(0, 0.04, 0.15);
      root.add(reactorGlow);

      // 2. Triple Rail Projector Barrel
      const mainChamber = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.6, 8), darkMetalMat);
      mainChamber.rotation.x = Math.PI / 2;
      mainChamber.position.set(0, 0.04, -0.2);
      root.add(mainChamber);

      // 3 Accelerator Rails
      for (let i = 0; i < 3; i++) {
        const angle = (i * Math.PI * 2) / 3;
        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.65), brushedSteelMat);
        rail.position.set(Math.cos(angle) * 0.1, Math.sin(angle) * 0.1 + 0.04, -0.5);
        root.add(rail);

        const coilGlow = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.035, 0.12), createGlowMat(0xec4899));
        coilGlow.position.set(Math.cos(angle) * 0.1, Math.sin(angle) * 0.1 + 0.04, -0.45 + i * 0.1);
        root.add(coilGlow);
      }

      // 3. Ergonomic Dual Grip Heavy Chassis
      const rearGrip = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.25, 0.1), polymerGripMat);
      rearGrip.position.set(0, -0.16, 0.22);
      rearGrip.rotation.x = 0.2;
      root.add(rearGrip);

      const forwardGrip = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.2, 0.08), polymerGripMat);
      forwardGrip.position.set(0, -0.12, -0.15);
      root.add(forwardGrip);

      // 4. Holographic Ammo Projection Ring
      const holoRing = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.008, 8, 24), createGlowMat(0xec4899));
      holoRing.position.set(0, 0.16, 0.0);
      root.add(holoRing);
      break;
    }

    case 'knife': {
      // 1. Curved Golden Blade (Karambit / Tactical Trench Knife)
      const bladeShape = new THREE.Shape();
      bladeShape.moveTo(0, 0);
      bladeShape.lineTo(0.03, 0.08);
      bladeShape.lineTo(0.05, 0.25);
      bladeShape.quadraticCurveTo(0.03, 0.38, -0.04, 0.46); // Hook tip
      bladeShape.quadraticCurveTo(-0.01, 0.32, -0.01, 0.1);
      bladeShape.lineTo(0, 0);

      const extrudeSettings = {
        depth: 0.012,
        bevelEnabled: true,
        bevelSegments: 3,
        steps: 1,
        bevelSize: 0.004,
        bevelThickness: 0.004,
      };

      const bladeGeo = new THREE.ExtrudeGeometry(bladeShape, extrudeSettings);
      bladeGeo.center();
      const bladeMesh = new THREE.Mesh(bladeGeo, goldFinishMat);
      bladeMesh.rotation.z = Math.PI;
      bladeMesh.rotation.y = Math.PI / 2;
      bladeMesh.position.set(0, 0.05, -0.22);
      root.add(bladeMesh);

      // 2. Tactical Guard with finger ring
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.012, 12, 24), darkMetalMat);
      ring.position.set(0, -0.16, 0.04);
      ring.rotation.y = Math.PI / 2;
      root.add(ring);

      // 3. Ergonomic Textured Carbon Handle
      const handle = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.22, 0.08), polymerGripMat);
      handle.position.set(0, -0.05, -0.02);
      handle.rotation.x = -0.15;
      root.add(handle);

      // 4. Gold Inlay Details & Pommel Skull Crusher
      const pommel = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.05, 8), goldFinishMat);
      pommel.rotation.x = -Math.PI;
      pommel.position.set(0, -0.22, 0.06);
      root.add(pommel);

      const goldTrim = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.015, 0.085), goldFinishMat);
      goldTrim.position.set(0, 0.06, -0.05);
      root.add(goldTrim);
      break;
    }
  }

  // Optimize shadow casting for all parts
  root.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = false;
    }
  });

  return root;
}
