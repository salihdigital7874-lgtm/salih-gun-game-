import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  GameSettings,
  MatchState,
  PlayerStats,
  WeaponDef,
  KillFeedItem,
  DamageNumber,
  BotEntity,
} from '../types/game';
import { getWeaponByTier, MAX_TIER } from './weapons';
import { createWeaponMesh } from './weaponModels';
import { buildArena, ArenaData } from './arena';
import { ParticleSystem } from './particles';
import { BotManager } from './botManager';
import { soundManager } from '../audio/soundManager';
import { createSalihFirstPersonArms } from './salihCharacter';

export interface GameEngineCallbacks {
  onStatsChange: (stats: PlayerStats) => void;
  onHealthChange: (hp: number, maxHp: number, shield: number) => void;
  onAmmoChange: (current: number, max: number, isReloading: boolean) => void;
  onWeaponChange: (weapon: WeaponDef) => void;
  onKillFeed: (item: KillFeedItem) => void;
  onDamageNumber: (num: DamageNumber) => void;
  onHitmarker: (isHeadshot: boolean) => void;
  onMatchStateChange: (state: MatchState) => void;
  onLeaderboardUpdate: (leaderboard: { name: string; tier: number; kills: number; isPlayer: boolean }[]) => void;
}

export class GameEngine {
  private container: HTMLElement;
  private callbacks: GameEngineCallbacks;
  public settings: GameSettings;

  // Three.js Core
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private clock = new THREE.Clock();
  private animationFrameId: number | null = null;

  // Subsystems
  private arenaData!: ArenaData;
  private particles!: ParticleSystem;
  private botManager!: BotManager;

  // Player State
  public matchState: MatchState = 'menu';
  private playerHealth = 100;
  private playerMaxHealth = 100;
  private playerShield = 50;
  private playerMaxShield = 50;
  private currentTier = 1;
  private currentAmmo = 12;
  private isReloading = false;
  private reloadTimer = 0;
  private lastShootTime = 0;
  private isMouseDown = false;
  private isAimingDownSights = false;
  private matchTime = 0;

  private stats: PlayerStats = {
    kills: 0,
    deaths: 0,
    headshots: 0,
    shotsFired: 0,
    shotsHit: 0,
    score: 0,
    currentTier: 1,
  };

  // Player Physics & Controls
  private playerPos = new THREE.Vector3(0, 1.7, 0);
  private playerVel = new THREE.Vector3();
  private isGrounded = false;
  private cameraYaw = 0;
  private cameraPitch = 0;
  private keys: Record<string, boolean> = {};

  // First-Person Weapon Rig
  private weaponHolder!: THREE.Group;
  private currentWeaponMesh: THREE.Group | null = null;
  private weaponSwayTime = 0;
  private recoilPitch = 0;
  private recoilYaw = 0;

  // Touch & Mobile Controls State
  private touchMove = { x: 0, y: 0 };
  private isTouchFiring = false;
  private isTouchAiming = false;
  private autoFireCooldown = 0;

  // Raycasting
  private raycaster = new THREE.Raycaster();

  constructor(container: HTMLElement, settings: GameSettings, callbacks: GameEngineCallbacks) {
    this.container = container;
    this.settings = settings;
    this.callbacks = callbacks;

    this.initThree();
    this.initPlayer();
    this.initEvents();
  }

  private initThree() {
    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0f1d);
    this.scene.fog = new THREE.FogExp2(0x0a0f1d, 0.015);

    // 2. Camera
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(this.settings.fov, aspect, 0.05, 300);
    this.camera.position.set(0, 1.7, 0);

    // 3. Renderer with physical studio pipeline
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);

    // 4. Procedural Studio Environment Reflection
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 5. Lighting Rig (Warm Key + Cool Fill + Rim)
    const keyLight = new THREE.DirectionalLight(0xfff1dc, 2.4);
    keyLight.position.set(35, 45, 25);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 10;
    keyLight.shadow.camera.far = 130;
    keyLight.shadow.camera.left = -50;
    keyLight.shadow.camera.right = 50;
    keyLight.shadow.camera.top = 50;
    keyLight.shadow.camera.bottom = -50;
    keyLight.shadow.bias = -0.0004;
    keyLight.shadow.normalBias = 0.02;
    this.scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x0f172a, 1.2);
    this.scene.add(hemiLight);

    // Arena sub-systems
    this.arenaData = buildArena(this.scene);
    this.particles = new ParticleSystem(this.scene);
    this.botManager = new BotManager(this.scene, this.arenaData.spawnPoints);
  }

  private initPlayer() {
    // Weapon holder attached to camera for first-person view
    this.weaponHolder = new THREE.Group();
    const salihArms = createSalihFirstPersonArms();
    this.weaponHolder.add(salihArms);
    this.camera.add(this.weaponHolder);

    this.spawnPlayer();
    this.setWeaponTier(1);
  }

  public spawnPlayer() {
    const sp = this.arenaData.spawnPoints[0];
    this.playerPos.set(sp.x, 1.7, sp.z);
    this.playerVel.set(0, 0, 0);
    this.camera.position.copy(this.playerPos);
    this.playerHealth = 100;
    this.playerShield = 50;
    this.callbacks.onHealthChange(this.playerHealth, this.playerMaxHealth, this.playerShield);
  }

  public setWeaponTier(tier: number) {
    this.currentTier = Math.max(1, Math.min(MAX_TIER, tier));
    this.stats.currentTier = this.currentTier;
    const weaponDef = getWeaponByTier(this.currentTier);
    this.currentAmmo = weaponDef.magSize;
    this.isReloading = false;

    // Replace 3D weapon mesh in player view
    if (this.currentWeaponMesh) {
      this.weaponHolder.remove(this.currentWeaponMesh);
      this.currentWeaponMesh.traverse((c) => {
        if (c instanceof THREE.Mesh) {
          c.geometry.dispose();
          if (Array.isArray(c.material)) c.material.forEach((m) => m.dispose());
          else c.material.dispose();
        }
      });
    }

    const newMesh = createWeaponMesh(weaponDef.id);
    newMesh.position.set(0.24, -0.22, -0.45);
    newMesh.rotation.set(0, 0, 0);
    this.weaponHolder.add(newMesh);
    this.currentWeaponMesh = newMesh;

    this.callbacks.onWeaponChange(weaponDef);
    this.callbacks.onAmmoChange(this.currentAmmo, weaponDef.magSize, this.isReloading);
    this.callbacks.onStatsChange({ ...this.stats });
  }

  private initEvents() {
    window.addEventListener('resize', this.onResize);
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private onResize = () => {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private onKeyDown = (e: KeyboardEvent) => {
    this.keys[e.code] = true;

    if (e.code === 'KeyR' && !this.isReloading) {
      this.reload();
    }
    if (e.code === 'Escape' && this.matchState === 'playing') {
      this.setMatchState('paused');
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.keys[e.code] = false;
  };

  private onMouseDown = (e: MouseEvent) => {
    if (this.matchState !== 'playing') return;

    if (e.button === 0) {
      // Left click shoot
      this.isMouseDown = true;
      const weapon = getWeaponByTier(this.currentTier);
      if (!weapon.automatic) {
        this.shoot();
      }
    } else if (e.button === 2) {
      // Right click ADS
      this.isAimingDownSights = true;
    }
  };

  private onMouseUp = (e: MouseEvent) => {
    if (e.button === 0) {
      this.isMouseDown = false;
    } else if (e.button === 2) {
      this.isAimingDownSights = false;
    }
  };

  private onMouseMove = (e: MouseEvent) => {
    if (document.pointerLockElement !== this.container && document.pointerLockElement !== this.renderer.domElement) {
      return;
    }
    if (this.matchState !== 'playing') return;

    const sens = this.settings.mouseSensitivity * 0.0022;
    this.cameraYaw -= e.movementX * sens;
    this.cameraPitch -= e.movementY * sens;

    // Clamp pitch between straight down and straight up
    const maxPitch = Math.PI / 2 - 0.05;
    this.cameraPitch = Math.max(-maxPitch, Math.min(maxPitch, this.cameraPitch));
  };

  public requestPointerLock() {
    this.container.requestPointerLock?.();
  }

  public exitPointerLock() {
    if (document.exitPointerLock) {
      document.exitPointerLock();
    }
  }

  // Mobile & Touch Input Handlers
  public setTouchMovement(x: number, y: number) {
    this.touchMove.x = Math.max(-1, Math.min(1, x));
    this.touchMove.y = Math.max(-1, Math.min(1, y));
  }

  public addTouchLook(deltaX: number, deltaY: number) {
    if (this.matchState !== 'playing') return;
    const sens = this.settings.mouseSensitivity * 0.0035;
    this.cameraYaw -= deltaX * sens;
    this.cameraPitch -= deltaY * sens;
    const maxPitch = Math.PI / 2 - 0.05;
    this.cameraPitch = Math.max(-maxPitch, Math.min(maxPitch, this.cameraPitch));
  }

  public setTouchFiring(firing: boolean) {
    this.isTouchFiring = firing;
    if (firing && this.matchState === 'playing') {
      const weapon = getWeaponByTier(this.currentTier);
      if (!weapon.automatic) {
        this.shoot();
      }
    }
  }

  public setTouchAiming(aiming: boolean) {
    this.isTouchAiming = aiming;
    this.isAimingDownSights = aiming;
  }

  public triggerJump() {
    if (this.isGrounded && this.matchState === 'playing') {
      this.playerVel.y = 11.5;
      this.isGrounded = false;
      soundManager.playJump();
    }
  }

  public triggerReload() {
    if (!this.isReloading && this.matchState === 'playing') {
      this.reload();
    }
  }

  public startMatch() {
    this.matchState = 'playing';
    this.matchTime = 0;
    this.stats = {
      kills: 0,
      deaths: 0,
      headshots: 0,
      shotsFired: 0,
      shotsHit: 0,
      score: 0,
      currentTier: 1,
    };
    this.setWeaponTier(1);
    this.spawnPlayer();
    this.botManager.initBots(this.settings);
    soundManager.startAmbientLoop();
    this.callbacks.onMatchStateChange('playing');
    const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    if (!isTouch) {
      this.requestPointerLock();
    }
  }

  public setMatchState(state: MatchState) {
    this.matchState = state;
    this.callbacks.onMatchStateChange(state);
    if (state === 'victory') {
      soundManager.playVictory();
      this.exitPointerLock();
    } else if (state === 'defeat') {
      soundManager.playDefeat();
      this.exitPointerLock();
    }
  }

  public reload() {
    const weapon = getWeaponByTier(this.currentTier);
    if (this.isReloading || this.currentAmmo >= weapon.magSize) return;

    this.isReloading = true;
    this.reloadTimer = weapon.reloadTime;
    soundManager.playReload();
    this.callbacks.onAmmoChange(this.currentAmmo, weapon.magSize, true);
  }

  public shoot() {
    if (this.matchState !== 'playing' || this.isReloading) return;

    const weapon = getWeaponByTier(this.currentTier);
    const now = performance.now();
    const interval = 1000 / weapon.fireRate;

    if (now - this.lastShootTime < interval) return;
    if (this.currentAmmo <= 0) {
      this.reload();
      return;
    }

    this.lastShootTime = now;
    this.currentAmmo--;
    this.stats.shotsFired++;
    this.callbacks.onAmmoChange(this.currentAmmo, weapon.magSize, false);

    // Audio
    soundManager.playShoot(weapon.id);

    // Recoil kick impulse
    this.recoilPitch += weapon.recoilVertical;
    this.recoilYaw += (Math.random() - 0.5) * weapon.recoilHorizontal;

    // Muzzle position in world
    const muzzlePos = new THREE.Vector3(0.24, -0.15, -0.7)
      .applyQuaternion(this.camera.quaternion)
      .add(this.camera.position);

    // Plasma projectile launcher
    if (weapon.id === 'plasma') {
      const shootDir = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
      this.particles.spawnPlasma(muzzlePos, shootDir, weapon.damage, true, 'player');
      return;
    }

    // Hitscan & multi-pellet shotgun
    const pellets = weapon.pellets || 1;
    let hitAny = false;

    for (let p = 0; p < pellets; p++) {
      // Calculate spread ray
      const spreadX = (Math.random() - 0.5) * (this.isAimingDownSights ? weapon.spread * 0.4 : weapon.spread);
      const spreadY = (Math.random() - 0.5) * (this.isAimingDownSights ? weapon.spread * 0.4 : weapon.spread);

      const shootDir = new THREE.Vector3(spreadX, spreadY, -1)
        .normalize()
        .applyQuaternion(this.camera.quaternion);

      this.raycaster.set(this.camera.position, shootDir);
      this.raycaster.far = weapon.range;

      // Raycast against Bots
      const botMeshes: THREE.Object3D[] = [];
      const botMeshMap = new Map<THREE.Object3D, BotEntity>();
      this.botManager.bots.forEach((b) => {
        if (b.state !== 'dead') {
          b.mesh.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              botMeshes.push(child);
              botMeshMap.set(child, b);
            }
          });
        }
      });

      const botIntersects = this.raycaster.intersectObjects(botMeshes, false);
      let targetHitPoint = muzzlePos.clone().addScaledVector(shootDir, weapon.range);

      if (botIntersects.length > 0) {
        const hit = botIntersects[0];
        targetHitPoint = hit.point;
        const targetBot = botMeshMap.get(hit.object);

        if (targetBot) {
          hitAny = true;
          // Check if headshot: hit height relative to bot feet
          const relY = hit.point.y - targetBot.mesh.position.y;
          const isHeadshot = relY > 1.38;
          const finalDmg = isHeadshot ? weapon.damage * 2 : weapon.damage;

          targetBot.health -= finalDmg;
          this.stats.shotsHit++;
          if (isHeadshot) this.stats.headshots++;

          soundManager.playHitmark(isHeadshot);
          this.callbacks.onHitmarker(isHeadshot);

          // Damage floating number
          this.callbacks.onDamageNumber({
            id: `dmg_${Date.now()}_${Math.random()}`,
            damage: Math.round(finalDmg),
            isHeadshot,
            x: window.innerWidth / 2 + (Math.random() - 0.5) * 60,
            y: window.innerHeight / 2 - 30 + (Math.random() - 0.5) * 40,
            opacity: 1,
            createdAt: Date.now(),
          });

          // Blood / hit spark puff
          this.particles.spawnSpark(hit.point, hit.face?.normal || new THREE.Vector3(0, 1, 0), 0xef4444, 10, 5);

          // Check Bot Elimination
          if (targetBot.health <= 0 && targetBot.state !== 'dead') {
            this.handleBotKilledByPlayer(targetBot, weapon, isHeadshot);
          }
        }
      } else {
        // Raycast against arena colliders & barrels
        const barrelMeshes = this.arenaData.explosiveBarrels.map((b) => b.mesh);
        const barrelHits = this.raycaster.intersectObjects(barrelMeshes, false);

        if (barrelHits.length > 0) {
          const bHit = barrelHits[0];
          targetHitPoint = bHit.point;
          const barrel = this.arenaData.explosiveBarrels.find((b) => b.mesh === bHit.object);
          if (barrel && !barrel.exploded) {
            barrel.health -= weapon.damage;
            this.particles.spawnSpark(bHit.point, bHit.face?.normal || new THREE.Vector3(0, 1, 0), 0xfacc15, 6, 4);
            if (barrel.health <= 0) {
              this.explodeBarrel(barrel);
            }
          }
        } else {
          // Wall spark
          this.particles.spawnSpark(targetHitPoint, new THREE.Vector3(0, 1, 0), 0xffe066, 4, 3);
        }
      }

      // Add visual bullet tracer
      this.particles.addTracer(muzzlePos, targetHitPoint, weapon.id === 'knife' ? 0xeab308 : 0x38bdf8);
    }

    if (hitAny) {
      this.stats.score += 25;
      this.callbacks.onStatsChange({ ...this.stats });
    }

    // Auto reload if empty
    if (this.currentAmmo === 0) {
      this.reload();
    }
  }

  private handleBotKilledByPlayer(bot: BotEntity, weapon: WeaponDef, isHeadshot: boolean) {
    bot.state = 'dead';
    bot.mesh.visible = false;
    bot.deaths++;
    bot.respawnTimer = 3.5;

    this.stats.kills++;
    this.stats.score += 100 + (isHeadshot ? 50 : 0);
    this.callbacks.onStatsChange({ ...this.stats });

    // Killfeed item
    this.callbacks.onKillFeed({
      id: `kf_${Date.now()}_${Math.random()}`,
      killerName: 'YOU',
      victimName: bot.name,
      weaponName: weapon.name,
      isHeadshot,
      isPlayerKiller: true,
      isPlayerVictim: false,
      timestamp: Date.now(),
    });

    // Check Victory (Tier 8 Golden Knife kill!)
    if (this.currentTier === MAX_TIER) {
      this.setMatchState('victory');
      return;
    }

    // GUN GAME TIER UP!
    soundManager.playTierUp();
    this.setWeaponTier(this.currentTier + 1);
  }

  private explodeBarrel(barrel: typeof this.arenaData.explosiveBarrels[0]) {
    barrel.exploded = true;
    barrel.mesh.visible = false;
    barrel.respawnTimer = 20.0;

    soundManager.playExplosion();
    this.particles.spawnExplosion(barrel.position, 6);

    const radius = 7.5;
    // Damage player if in range
    const distPlayer = barrel.position.distanceTo(this.playerPos);
    if (distPlayer < radius) {
      const dmg = Math.round((1 - distPlayer / radius) * 80);
      this.damagePlayer(dmg, 'Hazard Barrel');
    }

    // Damage bots in range
    this.botManager.bots.forEach((bot) => {
      if (bot.state !== 'dead') {
        const d = barrel.position.distanceTo(bot.position);
        if (d < radius) {
          const dmg = Math.round((1 - d / radius) * 90);
          bot.health -= dmg;
          if (bot.health <= 0) {
            bot.state = 'dead';
            bot.mesh.visible = false;
            bot.respawnTimer = 3.5;
            this.callbacks.onKillFeed({
              id: `kf_${Date.now()}_${Math.random()}`,
              killerName: 'Explosion',
              victimName: bot.name,
              weaponName: 'Hazard Barrel',
              isHeadshot: false,
              isPlayerKiller: false,
              isPlayerVictim: false,
              timestamp: Date.now(),
            });
          }
        }
      }
    });
  }

  public damagePlayer(amount: number, source: string) {
    if (this.matchState !== 'playing') return;

    // Shield absorbs first
    if (this.playerShield > 0) {
      if (this.playerShield >= amount) {
        this.playerShield -= amount;
      } else {
        const remaining = amount - this.playerShield;
        this.playerShield = 0;
        this.playerHealth -= remaining;
      }
    } else {
      this.playerHealth -= amount;
    }

    this.playerHealth = Math.max(0, this.playerHealth);
    this.callbacks.onHealthChange(this.playerHealth, this.playerMaxHealth, this.playerShield);

    // Audio flinch
    soundManager.playFootstep();

    if (this.playerHealth <= 0) {
      this.handlePlayerDeath(source);
    }
  }

  private handlePlayerDeath(killerName: string) {
    this.stats.deaths++;
    this.callbacks.onStatsChange({ ...this.stats });

    this.callbacks.onKillFeed({
      id: `kf_${Date.now()}_${Math.random()}`,
      killerName,
      victimName: 'YOU',
      weaponName: 'Assault',
      isHeadshot: false,
      isPlayerKiller: false,
      isPlayerVictim: true,
      timestamp: Date.now(),
    });

    // Respawn after short moment
    setTimeout(() => {
      this.spawnPlayer();
    }, 1500);
  }

  public update() {
    const delta = Math.min(this.clock.getDelta(), 0.1);
    this.matchTime += delta;

    // Automatic fire trigger (mouse hold or touch button)
    if ((this.isMouseDown || this.isTouchFiring) && this.matchState === 'playing') {
      const weapon = getWeaponByTier(this.currentTier);
      if (weapon.automatic) {
        this.shoot();
      }
    }

    // Auto-fire when crosshair is on target (ideal for mobile!)
    if (this.settings.autoFire && this.matchState === 'playing' && !this.isReloading) {
      this.checkAutoFire(delta);
    }

    // Aim assist magnetism
    if (this.settings.aimAssist && this.matchState === 'playing') {
      this.applyAimAssist(delta);
    }

    // Reload progress
    if (this.isReloading) {
      this.reloadTimer -= delta;
      if (this.reloadTimer <= 0) {
        const weapon = getWeaponByTier(this.currentTier);
        this.isReloading = false;
        this.currentAmmo = weapon.magSize;
        this.callbacks.onAmmoChange(this.currentAmmo, weapon.magSize, false);
      }
    }

    // 1. Update Player Movement & Physics
    this.updatePlayerMovement(delta);

    // 2. Update First-Person Weapon Sway & ADS
    this.updateWeaponSway(delta);

    // 3. Update Bots AI
    this.updateBots(delta);

    // 4. Update Hazard Barrels & Health Stations
    this.updateInteractiveProps(delta);

    // 5. Update Particles & Projectiles
    this.particles.update(delta);
    this.updatePlasmaProjectiles();

    // 6. Update Leaderboard
    if (Math.floor(this.matchTime * 2) % 2 === 0) {
      this.refreshLeaderboard();
    }

    // Render Scene
    this.renderer.render(this.scene, this.camera);
  }

  private checkAutoFire(delta: number) {
    this.autoFireCooldown -= delta;
    if (this.autoFireCooldown > 0) return;

    const weapon = getWeaponByTier(this.currentTier);
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
    this.raycaster.set(this.camera.position, forward);
    this.raycaster.far = Math.min(weapon.range, 42);

    const botMeshes: THREE.Object3D[] = [];
    this.botManager.bots.forEach((b) => {
      if (b.state !== 'dead') {
        b.mesh.traverse((c) => {
          if (c instanceof THREE.Mesh) botMeshes.push(c);
        });
      }
    });

    const intersects = this.raycaster.intersectObjects(botMeshes, false);
    if (intersects.length > 0) {
      this.shoot();
      this.autoFireCooldown = 1.0 / weapon.fireRate;
    }
  }

  private applyAimAssist(delta: number) {
    let closestAngle = 0.22; // ~12 degrees cone
    let targetBot: BotEntity | null = null;
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);

    for (const bot of this.botManager.bots) {
      if (bot.state === 'dead') continue;
      const chestPos = bot.position.clone().add(new THREE.Vector3(0, 1.1, 0));
      const toBot = chestPos.sub(this.camera.position);
      const dist = toBot.length();
      if (dist < 40 && dist > 1.5) {
        toBot.normalize();
        const angle = forward.angleTo(toBot);
        if (angle < closestAngle) {
          closestAngle = angle;
          targetBot = bot;
        }
      }
    }

    if (targetBot) {
      const chestPos = targetBot.position.clone().add(new THREE.Vector3(0, 1.1, 0));
      const toBot = chestPos.sub(this.camera.position).normalize();
      const targetYaw = Math.atan2(-toBot.x, -toBot.z);
      const targetPitch = Math.asin(toBot.y);

      this.cameraYaw = THREE.MathUtils.damp(this.cameraYaw, targetYaw, 3.2, delta);
      this.cameraPitch = THREE.MathUtils.damp(this.cameraPitch, targetPitch, 3.2, delta);
    }
  }

  private updatePlayerMovement(delta: number) {
    if (this.matchState !== 'playing') return;

    // Camera rotation
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this.cameraYaw + this.recoilYaw;
    this.camera.rotation.x = this.cameraPitch + this.recoilPitch;

    // Damp recoil back to zero
    this.recoilPitch = THREE.MathUtils.damp(this.recoilPitch, 0, 12, delta);
    this.recoilYaw = THREE.MathUtils.damp(this.recoilYaw, 0, 12, delta);

    // Input direction: Combine keyboard and mobile touch joystick
    let inputX = 0;
    let inputZ = 0;
    if (this.keys['KeyW']) inputZ -= 1;
    if (this.keys['KeyS']) inputZ += 1;
    if (this.keys['KeyA']) inputX -= 1;
    if (this.keys['KeyD']) inputX += 1;

    // Add mobile joystick input
    if (Math.abs(this.touchMove.x) > 0.05 || Math.abs(this.touchMove.y) > 0.05) {
      inputX += this.touchMove.x;
      inputZ -= this.touchMove.y; // forward is positive Y
    }

    const moveDir = new THREE.Vector3(inputX, 0, inputZ);
    if (moveDir.length() > 1.0) moveDir.normalize();

    // Speed modifiers
    const isSprinting = this.keys['ShiftLeft'] || this.keys['ShiftRight'];
    const isCrouching = this.keys['KeyC'];
    let speed = 9.0;
    if (isSprinting && !this.isAimingDownSights) speed = 14.5;
    if (isCrouching) speed = 5.0;
    if (this.isAimingDownSights) speed = 6.0;

    // Convert to camera yaw space
    moveDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.cameraYaw);

    this.playerVel.x = THREE.MathUtils.damp(this.playerVel.x, moveDir.x * speed, 14, delta);
    this.playerVel.z = THREE.MathUtils.damp(this.playerVel.z, moveDir.z * speed, 14, delta);

    // Gravity
    this.playerVel.y -= 28.0 * delta;

    // Jump
    if (this.keys['Space'] && this.isGrounded) {
      this.playerVel.y = 11.5;
      this.isGrounded = false;
      soundManager.playJump();
    }

    // Integrate position
    const nextPos = this.playerPos.clone().addScaledVector(this.playerVel, delta);

    // Collision with arena floor and colliders
    let groundedThisFrame = false;
    const playerRadius = 0.55;
    const playerHeight = isCrouching ? 1.2 : 1.7;

    // Ground check (Floor at Y = 0)
    if (nextPos.y <= playerHeight) {
      nextPos.y = playerHeight;
      this.playerVel.y = 0;
      groundedThisFrame = true;
    }

    // Check jump pads
    this.arenaData.jumpPads.forEach((pad) => {
      const d = new THREE.Vector2(nextPos.x - pad.position.x, nextPos.z - pad.position.z).length();
      if (d < pad.radius && Math.abs(nextPos.y - playerHeight) < 0.6) {
        this.playerVel.y = pad.force;
        groundedThisFrame = false;
        soundManager.playJump();
        this.particles.spawnSpark(pad.position, new THREE.Vector3(0, 1, 0), 0x38bdf8, 16, 6);
      }
    });

    // Box colliders check
    const playerBox = new THREE.Box3(
      new THREE.Vector3(nextPos.x - playerRadius, nextPos.y - playerHeight, nextPos.z - playerRadius),
      new THREE.Vector3(nextPos.x + playerRadius, nextPos.y + 0.2, nextPos.z + playerRadius)
    );

    for (const col of this.arenaData.colliders) {
      if (col.intersectsBox(playerBox)) {
        // Simple step-up or horizontal bounce
        if (this.playerPos.y - playerHeight >= col.max.y - 0.4 && this.playerVel.y <= 0) {
          nextPos.y = col.max.y + playerHeight;
          this.playerVel.y = 0;
          groundedThisFrame = true;
        } else {
          // Push away horizontally
          nextPos.x = this.playerPos.x;
          nextPos.z = this.playerPos.z;
          this.playerVel.x = 0;
          this.playerVel.z = 0;
        }
      }
    }

    this.isGrounded = groundedThisFrame;
    this.playerPos.copy(nextPos);
    this.camera.position.copy(this.playerPos);

    // Footstep audio trigger
    const hSpeed = Math.sqrt(this.playerVel.x * this.playerVel.x + this.playerVel.z * this.playerVel.z);
    if (this.isGrounded && hSpeed > 2.0) {
      this.weaponSwayTime += delta * hSpeed;
      if (Math.sin(this.weaponSwayTime * 1.5) > 0.98) {
        soundManager.playFootstep();
      }
    }
  }

  private updateWeaponSway(delta: number) {
    if (!this.currentWeaponMesh) return;

    const weapon = getWeaponByTier(this.currentTier);
    const targetFov = this.isAimingDownSights ? (weapon.zoomFov || 55) : this.settings.fov;
    this.camera.fov = THREE.MathUtils.damp(this.camera.fov, targetFov, 14, delta);
    this.camera.updateProjectionMatrix();

    // Weapon local offset
    let targetX = 0.24;
    let targetY = -0.22;
    let targetZ = -0.45;

    // ADS centering
    if (this.isAimingDownSights) {
      targetX = 0.0;
      targetY = -0.15;
      targetZ = -0.38;
    } else {
      // Walking bobbing
      const bobX = Math.cos(this.weaponSwayTime * 1.5) * 0.015;
      const bobY = Math.sin(this.weaponSwayTime * 3.0) * 0.012;
      targetX += bobX;
      targetY += bobY;
    }

    this.currentWeaponMesh.position.x = THREE.MathUtils.damp(this.currentWeaponMesh.position.x, targetX, 16, delta);
    this.currentWeaponMesh.position.y = THREE.MathUtils.damp(this.currentWeaponMesh.position.y, targetY, 16, delta);
    this.currentWeaponMesh.position.z = THREE.MathUtils.damp(this.currentWeaponMesh.position.z, targetZ, 16, delta);
  }

  private updateBots(delta: number) {
    if (this.matchState !== 'playing') return;

    const botSpeed = this.settings.botDifficulty === 'apex' ? 8.5 : this.settings.botDifficulty === 'veteran' ? 6.5 : 4.5;
    const shootDist = 45;

    this.botManager.bots.forEach((bot) => {
      if (bot.state === 'dead') {
        bot.respawnTimer -= delta;
        if (bot.respawnTimer <= 0) {
          this.botManager.respawnBot(bot);
        }
        return;
      }

      bot.stateTimer += delta;
      bot.shootCooldown -= delta;

      // Distance to player
      const distToPlayer = bot.position.distanceTo(this.playerPos);

      // Simple AI state machine
      if (distToPlayer < shootDist && bot.health > 25) {
        bot.state = 'attack';
      } else if (bot.health <= 25) {
        bot.state = 'flee';
      } else if (bot.stateTimer > 4.0) {
        bot.state = 'patrol';
        bot.stateTimer = 0;
        // Pick new random arena position
        const targetSp = this.arenaData.spawnPoints[Math.floor(Math.random() * this.arenaData.spawnPoints.length)];
        bot.targetPosition.copy(targetSp).add(new THREE.Vector3((Math.random() - 0.5) * 12, 0, (Math.random() - 0.5) * 12));
      }

      // Movement target
      let targetGoal = bot.targetPosition;
      if (bot.state === 'attack') {
        targetGoal = this.playerPos;
      } else if (bot.state === 'flee') {
        // Run towards closest health station
        let closestSt = this.arenaData.healthStations[0];
        let minDist = 999;
        this.arenaData.healthStations.forEach((hs) => {
          if (hs.active) {
            const d = bot.position.distanceTo(hs.position);
            if (d < minDist) {
              minDist = d;
              closestSt = hs;
            }
          }
        });
        targetGoal = closestSt.position;
      }

      // Direction vector
      const dir = new THREE.Vector3().subVectors(targetGoal, bot.position);
      dir.y = 0;
      if (dir.length() > 2.0) {
        dir.normalize();
        bot.velocity.x = dir.x * botSpeed;
        bot.velocity.z = dir.z * botSpeed;
      } else {
        bot.velocity.x = 0;
        bot.velocity.z = 0;
      }

      // Rotate towards target or movement
      const lookTarget = bot.state === 'attack' ? this.playerPos : bot.position.clone().add(bot.velocity);
      bot.mesh.lookAt(lookTarget.x, bot.mesh.position.y, lookTarget.z);

      // Apply movement
      bot.position.addScaledVector(bot.velocity, delta);
      bot.mesh.position.copy(bot.position);

      // Bot jump pad check
      this.arenaData.jumpPads.forEach((pad) => {
        const d = new THREE.Vector2(bot.position.x - pad.position.x, bot.position.z - pad.position.z).length();
        if (d < pad.radius && bot.isGrounded) {
          bot.velocity.y = pad.force;
          this.particles.spawnSpark(pad.position, new THREE.Vector3(0, 1, 0), 0x38bdf8, 8, 4);
        }
      });

      // Bot Shooting
      if (bot.state === 'attack' && bot.shootCooldown <= 0 && distToPlayer < shootDist) {
        this.botShoot(bot, distToPlayer);
      }
    });
  }

  private botShoot(bot: BotEntity, distToPlayer: number) {
    const weapon = getWeaponByTier(bot.currentTier);
    bot.shootCooldown = 1.0 / weapon.fireRate + Math.random() * 0.4;

    const botMuzzle = bot.position.clone().add(new THREE.Vector3(0, 1.1, 0));

    // Accuracy calculation
    const accuracy = this.settings.botDifficulty === 'apex' ? 0.75 : this.settings.botDifficulty === 'veteran' ? 0.5 : 0.3;
    const doesHit = Math.random() < accuracy;

    if (doesHit) {
      const dmg = Math.round(weapon.damage * 0.65);
      this.damagePlayer(dmg, bot.name);
      this.particles.addTracer(botMuzzle, this.playerPos, 0xef4444);
      this.particles.spawnSpark(this.playerPos, new THREE.Vector3(0, 1, 0), 0xef4444, 4, 3);
    } else {
      // Miss shot around player
      const missPos = this.playerPos.clone().add(new THREE.Vector3(
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 5
      ));
      this.particles.addTracer(botMuzzle, missPos, 0xf97316);
    }

    soundManager.playShoot(weapon.id);
  }

  private updateInteractiveProps(delta: number) {
    // Health stations rotation and collection
    this.arenaData.healthStations.forEach((hs) => {
      const cross = hs.mesh.getObjectByName('health_cross');
      if (cross) {
        cross.rotation.y += delta * 2.0;
      }

      if (!hs.active) {
        hs.respawnTimer -= delta;
        if (hs.respawnTimer <= 0) {
          hs.active = true;
          hs.mesh.visible = true;
        }
      } else {
        // Check player pickup
        if (this.playerPos.distanceTo(hs.position) < 2.2 && this.playerHealth < this.playerMaxHealth) {
          this.playerHealth = Math.min(this.playerMaxHealth, this.playerHealth + 35);
          this.callbacks.onHealthChange(this.playerHealth, this.playerMaxHealth, this.playerShield);
          hs.active = false;
          hs.mesh.visible = false;
          hs.respawnTimer = 15.0;
          this.particles.spawnSpark(hs.position, new THREE.Vector3(0, 1, 0), 0x10b981, 14, 5);
        }
      }
    });

    // Barrel respawns
    this.arenaData.explosiveBarrels.forEach((barrel) => {
      if (barrel.exploded) {
        barrel.respawnTimer -= delta;
        if (barrel.respawnTimer <= 0) {
          barrel.exploded = false;
          barrel.health = 40;
          barrel.mesh.visible = true;
        }
      }
    });
  }

  private updatePlasmaProjectiles() {
    for (let i = this.particles.plasmaProjectiles.length - 1; i >= 0; i--) {
      const proj = this.particles.plasmaProjectiles[i];

      // Check collision with bots
      let hit = false;
      this.botManager.bots.forEach((bot) => {
        if (!hit && bot.state !== 'dead') {
          if (proj.position.distanceTo(bot.position.clone().add(new THREE.Vector3(0, 1, 0))) < 1.4) {
            hit = true;
            bot.health -= proj.damage;
            soundManager.playHitmark(false);
            this.callbacks.onHitmarker(false);
            this.particles.spawnExplosion(proj.position, 4);

            if (bot.health <= 0) {
              const weapon = getWeaponByTier(this.currentTier);
              this.handleBotKilledByPlayer(bot, weapon, false);
            }
          }
        }
      });

      // Ground or wall collision (y <= 0.2 or arena bounds)
      if (hit || proj.position.y <= 0.2 || Math.abs(proj.position.x) > 44 || Math.abs(proj.position.z) > 44) {
        this.particles.spawnExplosion(proj.position, 3.5);
        soundManager.playExplosion();
        this.particles.destroyPlasma(i);
      }
    }
  }

  private refreshLeaderboard() {
    const list = [
      { name: 'YOU', tier: this.currentTier, kills: this.stats.kills, isPlayer: true },
      ...this.botManager.bots.map((b) => ({
        name: b.name,
        tier: b.currentTier,
        kills: b.kills,
        isPlayer: false,
      })),
    ];
    list.sort((a, b) => (b.tier !== a.tier ? b.tier - a.tier : b.kills - a.kills));
    this.callbacks.onLeaderboardUpdate(list);
  }

  public startLoop() {
    const loop = () => {
      this.update();
      this.animationFrameId = requestAnimationFrame(loop);
    };
    this.clock.start();
    loop();
  }

  public stopLoop() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  public updateSettings(newSettings: GameSettings) {
    this.settings = newSettings;
    soundManager.setVolumes(newSettings.soundVolume, newSettings.musicVolume);
    if (this.camera) {
      this.camera.fov = newSettings.fov;
      this.camera.updateProjectionMatrix();
    }
  }

  public dispose() {
    this.stopLoop();
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('mousemove', this.onMouseMove);

    soundManager.stopAmbientLoop();
    this.arenaData?.cleanup();
    this.particles?.dispose();
    this.botManager?.clearBots();
    this.renderer?.dispose();

    if (this.renderer?.domElement?.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
