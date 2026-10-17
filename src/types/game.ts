import * as THREE from 'three';

export type WeaponType = 
  | 'pistol'
  | 'revolver'
  | 'smg'
  | 'shotgun'
  | 'rifle'
  | 'sniper'
  | 'plasma'
  | 'knife';

export interface WeaponDef {
  id: WeaponType;
  tier: number;
  name: string;
  category: string;
  damage: number;
  pellets?: number;
  fireRate: number; // shots per sec
  automatic: boolean;
  magSize: number;
  reloadTime: number; // in seconds
  spread: number;
  range: number;
  recoilVertical: number;
  recoilHorizontal: number;
  bulletSpeed?: number; // 0 for hitscan, >0 for projectile
  zoomFov?: number;
  accentColor: string;
  description: string;
}

export interface PlayerStats {
  kills: number;
  deaths: number;
  headshots: number;
  shotsFired: number;
  shotsHit: number;
  score: number;
  currentTier: number; // 1 to 8
}

export interface KillFeedItem {
  id: string;
  killerName: string;
  victimName: string;
  weaponName: string;
  isHeadshot: boolean;
  isPlayerKiller: boolean;
  isPlayerVictim: boolean;
  timestamp: number;
}

export interface DamageNumber {
  id: string;
  damage: number;
  isHeadshot: boolean;
  x: number;
  y: number;
  opacity: number;
  createdAt: number;
}

export interface BotEntity {
  id: string;
  name: string;
  currentTier: number;
  health: number;
  maxHealth: number;
  mesh: THREE.Group;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  targetPosition: THREE.Vector3;
  state: 'patrol' | 'chase' | 'attack' | 'flee' | 'dead';
  stateTimer: number;
  shootCooldown: number;
  kills: number;
  deaths: number;
  color: string;
  weaponMesh?: THREE.Group;
  respawnTimer: number;
  isGrounded: boolean;
}

export interface ExplosiveBarrel {
  mesh: THREE.Mesh;
  position: THREE.Vector3;
  health: number;
  exploded: boolean;
  respawnTimer: number;
}

export interface JumpPad {
  mesh: THREE.Group;
  position: THREE.Vector3;
  radius: number;
  force: number;
}

export interface HealthStation {
  mesh: THREE.Group;
  position: THREE.Vector3;
  active: boolean;
  respawnTimer: number;
}

export interface GameSettings {
  mouseSensitivity: number;
  fov: number;
  soundVolume: number;
  musicVolume: number;
  botCount: number;
  botDifficulty: 'recruit' | 'veteran' | 'apex';
  crosshairStyle: 'dot' | 'cross' | 'circle';
  autoFire: boolean;
  aimAssist: boolean;
  touchControls: boolean;
}

export type MatchState = 'menu' | 'playing' | 'paused' | 'victory' | 'defeat';
