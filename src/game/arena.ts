import * as THREE from 'three';
import { ExplosiveBarrel, JumpPad, HealthStation } from '../types/game';

// Procedural texture generators
function createConcreteTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Base slate concrete
  ctx.fillStyle = '#1e2430';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle tile grid
  ctx.strokeStyle = '#151922';
  ctx.lineWidth = 4;
  for (let x = 0; x <= 512; x += 128) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }
  for (let y = 0; y <= 512; y += 128) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  // Noise specks
  for (let i = 0; i < 6000; i++) {
    const nx = Math.random() * 512;
    const ny = Math.random() * 512;
    const val = Math.floor(Math.random() * 30);
    ctx.fillStyle = `rgba(${val + 20}, ${val + 25}, ${val + 35}, 0.15)`;
    ctx.fillRect(nx, ny, 2, 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(16, 16);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createContainerTexture(color: string, accentColor: string, label: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 512, 256);

  // Corrugation stripes
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  for (let x = 0; x < 512; x += 32) {
    ctx.fillRect(x, 0, 16, 256);
  }

  // Accent stripe
  ctx.fillStyle = accentColor;
  ctx.fillRect(0, 100, 512, 20);

  // Industrial typography
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px monospace';
  ctx.fillText(label, 40, 145);
  ctx.font = '16px monospace';
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fillText('GUN-GAME TACTICAL LOGISTICS // SECTOR-07', 40, 180);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createHazardTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#dc2626'; // Red barrel
  ctx.fillRect(0, 0, 256, 256);

  // Hazard warning chevron yellow/black
  ctx.fillStyle = '#facc15';
  ctx.fillRect(0, 90, 256, 70);

  ctx.fillStyle = '#000000';
  for (let x = -50; x < 350; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 90);
    ctx.lineTo(x + 20, 90);
    ctx.lineTo(x - 10, 160);
    ctx.lineTo(x - 30, 160);
    ctx.fill();
  }

  ctx.font = 'bold 22px sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('EXPLOSIVE', 60, 50);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export interface ArenaData {
  scene: THREE.Scene;
  colliders: THREE.Box3[];
  jumpPads: JumpPad[];
  healthStations: HealthStation[];
  explosiveBarrels: ExplosiveBarrel[];
  spawnPoints: THREE.Vector3[];
  cleanup: () => void;
}

export function buildArena(scene: THREE.Scene): ArenaData {
  const colliders: THREE.Box3[] = [];
  const jumpPads: JumpPad[] = [];
  const healthStations: HealthStation[] = [];
  const explosiveBarrels: ExplosiveBarrel[] = [];
  const disposables: (THREE.BufferGeometry | THREE.Material | THREE.Texture)[] = [];

  // 1. Materials
  const floorTex = createConcreteTexture();
  disposables.push(floorTex);

  const floorMat = new THREE.MeshStandardMaterial({
    map: floorTex,
    roughness: 0.8,
    metalness: 0.2,
  });
  disposables.push(floorMat);

  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.7,
    metalness: 0.3,
  });
  disposables.push(wallMat);

  const catwalkMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.4,
    metalness: 0.8,
  });
  disposables.push(catwalkMat);

  const railingMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.3,
    metalness: 0.7,
  });
  disposables.push(railingMat);

  const crateMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    roughness: 0.6,
    metalness: 0.4,
  });
  disposables.push(crateMat);

  // 2. Floor Plane (Large tactical arena 90 x 90)
  const floorGeo = new THREE.PlaneGeometry(90, 90);
  floorGeo.rotateX(-Math.PI / 2);
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.receiveShadow = true;
  scene.add(floor);
  disposables.push(floorGeo);

  // Helper to register static box colliders
  function addStaticBox(
    geo: THREE.BoxGeometry,
    mat: THREE.Material,
    pos: THREE.Vector3,
    rotY = 0,
    cast = true,
    receive = true
  ): THREE.Mesh {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(pos);
    mesh.rotation.y = rotY;
    mesh.castShadow = cast;
    mesh.receiveShadow = receive;
    scene.add(mesh);
    disposables.push(geo);

    // Compute oriented bounding box as AABB
    mesh.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(mesh);
    colliders.push(box);
    return mesh;
  }

  // 3. Perimeter Walls & Outer Fortress Boundary
  const arenaHalf = 45;
  const wallHeight = 7.5;
  const wallThickness = 2;

  // North wall
  addStaticBox(new THREE.BoxGeometry(90, wallHeight, wallThickness), wallMat, new THREE.Vector3(0, wallHeight / 2, -arenaHalf));
  // South wall
  addStaticBox(new THREE.BoxGeometry(90, wallHeight, wallThickness), wallMat, new THREE.Vector3(0, wallHeight / 2, arenaHalf));
  // West wall
  addStaticBox(new THREE.BoxGeometry(wallThickness, wallHeight, 90), wallMat, new THREE.Vector3(-arenaHalf, wallHeight / 2, 0));
  // East wall
  addStaticBox(new THREE.BoxGeometry(wallThickness, wallHeight, 90), wallMat, new THREE.Vector3(arenaHalf, wallHeight / 2, 0));

  // 4. Tactical Shipping Containers (Cover & Vertical vantage points)
  const containerTex1 = createContainerTexture('#0284c7', '#38bdf8', 'APEX-01');
  const containerMat1 = new THREE.MeshStandardMaterial({ map: containerTex1, roughness: 0.5, metalness: 0.6 });
  disposables.push(containerTex1, containerMat1);

  const containerTex2 = createContainerTexture('#ea580c', '#fb923c', 'FIRE-02');
  const containerMat2 = new THREE.MeshStandardMaterial({ map: containerTex2, roughness: 0.5, metalness: 0.6 });
  disposables.push(containerTex2, containerMat2);

  const containerTex3 = createContainerTexture('#16a34a', '#4ade80', 'BIO-03');
  const containerMat3 = new THREE.MeshStandardMaterial({ map: containerTex3, roughness: 0.5, metalness: 0.6 });
  disposables.push(containerTex3, containerMat3);

  // Containers layout (length: 10, height: 3.2, width: 3.5)
  addStaticBox(new THREE.BoxGeometry(10, 3.2, 3.5), containerMat1, new THREE.Vector3(-18, 1.6, -15), 0.3);
  addStaticBox(new THREE.BoxGeometry(10, 3.2, 3.5), containerMat2, new THREE.Vector3(18, 1.6, -18), -0.4);
  addStaticBox(new THREE.BoxGeometry(10, 3.2, 3.5), containerMat3, new THREE.Vector3(-16, 1.6, 20), -0.2);
  addStaticBox(new THREE.BoxGeometry(10, 3.2, 3.5), containerMat1, new THREE.Vector3(20, 1.6, 16), 0.5);

  // Stacked container for sniper position
  addStaticBox(new THREE.BoxGeometry(10, 3.2, 3.5), containerMat2, new THREE.Vector3(-18, 4.8, -15), 0.3);

  // 5. Elevated Catwalks & Central Bridge System
  // Central high bridge (Height 4.0m)
  addStaticBox(new THREE.BoxGeometry(6, 0.4, 28), catwalkMat, new THREE.Vector3(0, 4.0, 0));

  // Catwalk support pillars
  const pillarMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.8 });
  disposables.push(pillarMat);
  addStaticBox(new THREE.BoxGeometry(1.2, 4.0, 1.2), pillarMat, new THREE.Vector3(-2, 2.0, -10));
  addStaticBox(new THREE.BoxGeometry(1.2, 4.0, 1.2), pillarMat, new THREE.Vector3(2, 2.0, -10));
  addStaticBox(new THREE.BoxGeometry(1.2, 4.0, 1.2), pillarMat, new THREE.Vector3(-2, 2.0, 10));
  addStaticBox(new THREE.BoxGeometry(1.2, 4.0, 1.2), pillarMat, new THREE.Vector3(2, 2.0, 10));

  // Ramps connecting ground to catwalk (North & South)
  const rampGeo = new THREE.BoxGeometry(5.8, 0.4, 12);
  disposables.push(rampGeo);
  // North Ramp
  const northRamp = new THREE.Mesh(rampGeo, catwalkMat);
  northRamp.position.set(0, 2.0, -19.5);
  northRamp.rotation.x = 0.34;
  northRamp.castShadow = true;
  northRamp.receiveShadow = true;
  scene.add(northRamp);
  northRamp.updateMatrixWorld(true);
  colliders.push(new THREE.Box3().setFromObject(northRamp));

  // South Ramp
  const southRamp = new THREE.Mesh(rampGeo, catwalkMat);
  southRamp.position.set(0, 2.0, 19.5);
  southRamp.rotation.x = -0.34;
  southRamp.castShadow = true;
  southRamp.receiveShadow = true;
  scene.add(southRamp);
  southRamp.updateMatrixWorld(true);
  colliders.push(new THREE.Box3().setFromObject(southRamp));

  // Catwalk Railings
  const railGeo = new THREE.BoxGeometry(0.15, 1.1, 28);
  disposables.push(railGeo);
  addStaticBox(railGeo, railingMat, new THREE.Vector3(-2.9, 4.75, 0));
  addStaticBox(railGeo, railingMat, new THREE.Vector3(2.9, 4.75, 0));

  // 6. Tactical Cover Crates & Concrete Barricades
  const cratePositions = [
    { pos: new THREE.Vector3(-6, 1.1, -6), size: [2.2, 2.2, 2.2] },
    { pos: new THREE.Vector3(7, 1.1, -5), size: [2.2, 2.2, 2.2] },
    { pos: new THREE.Vector3(-8, 1.1, 8), size: [2.2, 2.2, 2.2] },
    { pos: new THREE.Vector3(6, 1.1, 9), size: [2.2, 2.2, 2.2] },
    { pos: new THREE.Vector3(-28, 1.3, 0), size: [3.5, 2.6, 1.2] },
    { pos: new THREE.Vector3(28, 1.3, 0), size: [3.5, 2.6, 1.2] },
    { pos: new THREE.Vector3(-32, 1.0, -26), size: [2.0, 2.0, 2.0] },
    { pos: new THREE.Vector3(32, 1.0, 26), size: [2.0, 2.0, 2.0] },
    { pos: new THREE.Vector3(28, 1.0, -28), size: [2.0, 2.0, 2.0] },
    { pos: new THREE.Vector3(-28, 1.0, 28), size: [2.0, 2.0, 2.0] },
  ];

  cratePositions.forEach((cp) => {
    addStaticBox(
      new THREE.BoxGeometry(cp.size[0], cp.size[1], cp.size[2]),
      crateMat,
      cp.pos
    );
  });

  // 7. Explosive Hazard Barrels
  const hazardTex = createHazardTexture();
  disposables.push(hazardTex);
  const barrelMat = new THREE.MeshStandardMaterial({
    map: hazardTex,
    roughness: 0.4,
    metalness: 0.6,
  });
  disposables.push(barrelMat);

  const barrelPositions = [
    new THREE.Vector3(-10, 1.0, -14),
    new THREE.Vector3(12, 1.0, -12),
    new THREE.Vector3(-12, 1.0, 14),
    new THREE.Vector3(14, 1.0, 10),
    new THREE.Vector3(-26, 1.0, 2),
    new THREE.Vector3(25, 1.0, -2),
  ];

  barrelPositions.forEach((bPos) => {
    const barrelGeo = new THREE.CylinderGeometry(0.65, 0.65, 2.0, 16);
    disposables.push(barrelGeo);
    const barrelMesh = new THREE.Mesh(barrelGeo, barrelMat);
    barrelMesh.position.copy(bPos);
    barrelMesh.castShadow = true;
    barrelMesh.receiveShadow = true;
    scene.add(barrelMesh);

    barrelMesh.updateMatrixWorld(true);
    colliders.push(new THREE.Box3().setFromObject(barrelMesh));

    explosiveBarrels.push({
      mesh: barrelMesh,
      position: bPos.clone(),
      health: 40,
      exploded: false,
      respawnTimer: 0,
    });
  });

  // 8. Jump Pads (Launch players & bots vertically onto high ground!)
  const padMat = new THREE.MeshStandardMaterial({
    color: 0x0ea5e9,
    roughness: 0.3,
    metalness: 0.8,
  });
  const glowRingMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
  });
  disposables.push(padMat, glowRingMat);

  const jumpPadLocations = [
    new THREE.Vector3(-12, 0.1, 0),
    new THREE.Vector3(12, 0.1, 0),
    new THREE.Vector3(0, 0.1, -28),
    new THREE.Vector3(0, 0.1, 28),
  ];

  jumpPadLocations.forEach((loc) => {
    const padGroup = new THREE.Group();
    padGroup.position.copy(loc);

    const baseGeo = new THREE.CylinderGeometry(2.2, 2.4, 0.2, 24);
    const baseMesh = new THREE.Mesh(baseGeo, padMat);
    baseMesh.receiveShadow = true;
    padGroup.add(baseMesh);

    const ringGeo = new THREE.TorusGeometry(1.5, 0.15, 12, 32);
    ringGeo.rotateX(Math.PI / 2);
    const ringMesh = new THREE.Mesh(ringGeo, glowRingMat);
    ringMesh.position.y = 0.12;
    padGroup.add(ringMesh);

    scene.add(padGroup);
    jumpPads.push({
      mesh: padGroup,
      position: loc.clone(),
      radius: 2.2,
      force: 16.0,
    });
  });

  // 9. Health Stations (+35 HP pickup with rotating holographic cross)
  const healthMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
  disposables.push(healthMat);

  const healthStationLocations = [
    new THREE.Vector3(-34, 0.2, -34),
    new THREE.Vector3(34, 0.2, -34),
    new THREE.Vector3(-34, 0.2, 34),
    new THREE.Vector3(34, 0.2, 34),
    new THREE.Vector3(0, 4.3, 0), // Atop catwalk center!
  ];

  healthStationLocations.forEach((loc) => {
    const stGroup = new THREE.Group();
    stGroup.position.copy(loc);

    // Base pad
    const baseGeo = new THREE.CylinderGeometry(1.2, 1.4, 0.15, 16);
    const baseMesh = new THREE.Mesh(baseGeo, crateMat);
    stGroup.add(baseMesh);

    // Floating Green Cross
    const crossGroup = new THREE.Group();
    crossGroup.name = 'health_cross';
    crossGroup.position.y = 1.2;

    const bar1 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.9, 0.15), healthMat);
    const bar2 = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.3, 0.15), healthMat);
    crossGroup.add(bar1);
    crossGroup.add(bar2);
    stGroup.add(crossGroup);

    scene.add(stGroup);
    healthStations.push({
      mesh: stGroup,
      position: loc.clone(),
      active: true,
      respawnTimer: 0,
    });
  });

  // 10. Spawn Points (8 well-spread tactical positions)
  const spawnPoints: THREE.Vector3[] = [
    new THREE.Vector3(-35, 1.0, -35),
    new THREE.Vector3(35, 1.0, -35),
    new THREE.Vector3(-35, 1.0, 35),
    new THREE.Vector3(35, 1.0, 35),
    new THREE.Vector3(0, 1.0, -38),
    new THREE.Vector3(0, 1.0, 38),
    new THREE.Vector3(-38, 1.0, 0),
    new THREE.Vector3(38, 1.0, 0),
  ];

  return {
    scene,
    colliders,
    jumpPads,
    healthStations,
    explosiveBarrels,
    spawnPoints,
    cleanup: () => {
      disposables.forEach((item) => item.dispose());
    },
  };
}
