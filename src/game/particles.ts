import * as THREE from 'three';

export interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  color: THREE.Color;
  size: number;
  life: number;
  maxLife: number;
  decay: number;
}

export interface BulletTracer {
  line: THREE.Line;
  startTime: number;
  duration: number;
}

export interface PlasmaProjectile {
  mesh: THREE.Mesh;
  glowMesh: THREE.Mesh;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  damage: number;
  isPlayer: boolean;
  ownerId: string;
  life: number;
}

export class ParticleSystem {
  private scene: THREE.Scene;
  private particles: Particle[] = [];
  private pointsMesh: THREE.Points;
  private geometry: THREE.BufferGeometry;
  private maxParticles = 600;
  private positions: Float32Array;
  private colors: Float32Array;
  private tracers: BulletTracer[] = [];
  public plasmaProjectiles: PlasmaProjectile[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.positions = new Float32Array(this.maxParticles * 3);
    this.colors = new Float32Array(this.maxParticles * 3);

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.pointsMesh = new THREE.Points(this.geometry, material);
    this.pointsMesh.frustumCulled = false;
    this.scene.add(this.pointsMesh);
  }

  public spawnSpark(pos: THREE.Vector3, dir: THREE.Vector3, colorHex: number, count = 8, speed = 6) {
    const col = new THREE.Color(colorHex);
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const v = dir.clone().add(new THREE.Vector3(
        (Math.random() - 0.5) * 1.5,
        (Math.random() - 0.5) * 1.5,
        (Math.random() - 0.5) * 1.5
      )).normalize().multiplyScalar(speed * (0.4 + Math.random() * 0.8));

      this.particles.push({
        position: pos.clone(),
        velocity: v,
        color: col,
        size: 0.12 + Math.random() * 0.1,
        life: 0,
        maxLife: 0.25 + Math.random() * 0.35,
        decay: 1.0,
      });
    }
  }

  public spawnExplosion(pos: THREE.Vector3, radius = 4) {
    const colors = [0xffffff, 0xfacc15, 0xf97316, 0xef4444];
    for (let i = 0; i < 48; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const col = new THREE.Color(colors[Math.floor(Math.random() * colors.length)]);
      const v = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        Math.random() * 1.8 + 0.2,
        (Math.random() - 0.5) * 2
      ).normalize().multiplyScalar(radius * (3 + Math.random() * 4));

      this.particles.push({
        position: pos.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.5, Math.random() * 0.5, (Math.random() - 0.5) * 0.5)),
        velocity: v,
        color: col,
        size: 0.25 + Math.random() * 0.25,
        life: 0,
        maxLife: 0.45 + Math.random() * 0.45,
        decay: 0.9,
      });
    }
  }

  public addTracer(start: THREE.Vector3, end: THREE.Vector3, colorHex: number = 0xffe066) {
    const geo = new THREE.BufferGeometry().setFromPoints([start, end]);
    const mat = new THREE.LineBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.85,
      linewidth: 2,
    });
    const line = new THREE.Line(geo, mat);
    this.scene.add(line);
    this.tracers.push({
      line,
      startTime: performance.now(),
      duration: 65, // ms
    });
  }

  public spawnPlasma(pos: THREE.Vector3, dir: THREE.Vector3, damage: number, isPlayer: boolean, ownerId: string) {
    const sphereGeo = new THREE.SphereGeometry(0.24, 16, 16);
    const sphereMat = new THREE.MeshBasicMaterial({ color: 0xec4899 });
    const mesh = new THREE.Mesh(sphereGeo, sphereMat);
    mesh.position.copy(pos);

    const glowGeo = new THREE.SphereGeometry(0.42, 12, 12);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xf472b6,
      transparent: true,
      opacity: 0.45,
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    glowMesh.position.copy(pos);

    this.scene.add(mesh);
    this.scene.add(glowMesh);

    this.plasmaProjectiles.push({
      mesh,
      glowMesh,
      position: pos.clone(),
      velocity: dir.clone().multiplyScalar(42),
      damage,
      isPlayer,
      ownerId,
      life: 0,
    });
  }

  public update(delta: number) {
    // 1. Update points particles
    const gravity = new THREE.Vector3(0, -9.8, 0);
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += delta;
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }
      p.velocity.addScaledVector(gravity, delta * 0.4);
      p.position.addScaledVector(p.velocity, delta);
    }

    // Populate buffers
    const pCount = Math.min(this.particles.length, this.maxParticles);
    for (let i = 0; i < pCount; i++) {
      const p = this.particles[i];
      const i3 = i * 3;
      this.positions[i3] = p.position.x;
      this.positions[i3 + 1] = p.position.y;
      this.positions[i3 + 2] = p.position.z;

      const alpha = 1 - p.life / p.maxLife;
      this.colors[i3] = p.color.r * alpha;
      this.colors[i3 + 1] = p.color.g * alpha;
      this.colors[i3 + 2] = p.color.b * alpha;
    }

    // Zero out remaining
    for (let i = pCount; i < this.maxParticles; i++) {
      const i3 = i * 3;
      this.positions[i3] = 0;
      this.positions[i3 + 1] = -9999;
      this.positions[i3 + 2] = 0;
    }

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.color.needsUpdate = true;

    // 2. Update tracers
    const now = performance.now();
    for (let i = this.tracers.length - 1; i >= 0; i--) {
      const t = this.tracers[i];
      if (now - t.startTime > t.duration) {
        this.scene.remove(t.line);
        t.line.geometry.dispose();
        (t.line.material as THREE.Material).dispose();
        this.tracers.splice(i, 1);
      }
    }

    // 3. Update plasma projectiles
    for (let i = this.plasmaProjectiles.length - 1; i >= 0; i--) {
      const proj = this.plasmaProjectiles[i];
      proj.life += delta;
      proj.position.addScaledVector(proj.velocity, delta);
      proj.mesh.position.copy(proj.position);
      proj.glowMesh.position.copy(proj.position);

      // Trail sparks
      if (Math.random() > 0.4) {
        this.spawnSpark(proj.position, proj.velocity.clone().negate(), 0xec4899, 2, 2);
      }

      if (proj.life > 3.0) {
        this.destroyPlasma(i);
      }
    }
  }

  public destroyPlasma(index: number) {
    if (index >= 0 && index < this.plasmaProjectiles.length) {
      const proj = this.plasmaProjectiles[index];
      this.scene.remove(proj.mesh);
      this.scene.remove(proj.glowMesh);
      proj.mesh.geometry.dispose();
      (proj.mesh.material as THREE.Material).dispose();
      proj.glowMesh.geometry.dispose();
      (proj.glowMesh.material as THREE.Material).dispose();
      this.plasmaProjectiles.splice(index, 1);
    }
  }

  public dispose() {
    this.scene.remove(this.pointsMesh);
    this.geometry.dispose();
    (this.pointsMesh.material as THREE.Material).dispose();
    this.tracers.forEach((t) => {
      this.scene.remove(t.line);
      t.line.geometry.dispose();
      (t.line.material as THREE.Material).dispose();
    });
    this.plasmaProjectiles.forEach((p) => {
      this.scene.remove(p.mesh);
      this.scene.remove(p.glowMesh);
    });
  }
}
