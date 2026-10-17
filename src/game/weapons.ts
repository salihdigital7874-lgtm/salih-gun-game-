import { WeaponDef, WeaponType } from '../types/game';

export const WEAPON_TIERS: Record<number, WeaponDef> = {
  1: {
    id: 'pistol',
    tier: 1,
    name: 'Tactical P-20',
    category: 'Sidearm',
    damage: 28,
    fireRate: 4.5,
    automatic: false,
    magSize: 12,
    reloadTime: 1.2,
    spread: 0.018,
    range: 60,
    recoilVertical: 0.04,
    recoilHorizontal: 0.015,
    zoomFov: 62,
    accentColor: '#38bdf8', // Sky blue
    description: 'Crisp semi-automatic pistol. 3-4 hits to eliminate.',
  },
  2: {
    id: 'revolver',
    tier: 2,
    name: 'Python Magnum .44',
    category: 'Heavy Handcannon',
    damage: 64,
    fireRate: 2.2,
    automatic: false,
    magSize: 6,
    reloadTime: 1.8,
    spread: 0.012,
    range: 85,
    recoilVertical: 0.09,
    recoilHorizontal: 0.03,
    zoomFov: 58,
    accentColor: '#f97316', // Orange
    description: 'Devastating close-to-medium hand cannon. 2-shot kill.',
  },
  3: {
    id: 'smg',
    tier: 3,
    name: 'Viper-9 Submachine Gun',
    category: 'SMG',
    damage: 18,
    fireRate: 14.0,
    automatic: true,
    magSize: 32,
    reloadTime: 1.4,
    spread: 0.032,
    range: 50,
    recoilVertical: 0.03,
    recoilHorizontal: 0.02,
    zoomFov: 64,
    accentColor: '#a855f7', // Purple
    description: 'Blistering fire rate. Melts opponents in tight corridors.',
  },
  4: {
    id: 'shotgun',
    tier: 4,
    name: 'Breacher-12 Pump Shotgun',
    category: 'Shotgun',
    damage: 12, // per pellet
    pellets: 8, // total 96 max damage
    fireRate: 1.3,
    automatic: false,
    magSize: 6,
    reloadTime: 2.0,
    spread: 0.075,
    range: 35,
    recoilVertical: 0.12,
    recoilHorizontal: 0.04,
    zoomFov: 65,
    accentColor: '#ef4444', // Red
    description: 'High-spread buckshot. Point-blank single pump destruction.',
  },
  5: {
    id: 'rifle',
    tier: 5,
    name: "Salih's Cyber Carbine",
    category: 'Assault Rifle',
    damage: 34,
    fireRate: 9.5,
    automatic: true,
    magSize: 30,
    reloadTime: 1.5,
    spread: 0.02,
    range: 95,
    recoilVertical: 0.04,
    recoilHorizontal: 0.02,
    zoomFov: 55,
    accentColor: '#38bdf8', // Electric Blue LED
    description: "Salih's signature tactical carbine with glowing electric blue LED rails and illuminated combat optics.",
  },
  6: {
    id: 'sniper',
    tier: 6,
    name: 'Vanguard .50 Bolt Sniper',
    category: 'Sniper Rifle',
    damage: 105,
    fireRate: 0.9,
    automatic: false,
    magSize: 5,
    reloadTime: 2.2,
    spread: 0.003,
    range: 160,
    recoilVertical: 0.16,
    recoilHorizontal: 0.03,
    zoomFov: 28, // High magnification ADS
    accentColor: '#06b6d4', // Cyan
    description: 'High-caliber precision rifle. 1-shot torso or headshot kill.',
  },
  7: {
    id: 'plasma',
    tier: 7,
    name: 'Helios Plasma Launcher',
    category: 'Heavy Energy',
    damage: 85,
    fireRate: 1.4,
    automatic: false,
    magSize: 4,
    reloadTime: 2.1,
    spread: 0.015,
    range: 75,
    recoilVertical: 0.08,
    recoilHorizontal: 0.025,
    bulletSpeed: 55, // Arcing / projectile speed
    zoomFov: 60,
    accentColor: '#ec4899', // Pink
    description: 'Launches glowing plasma spheres that detonate on impact.',
  },
  8: {
    id: 'knife',
    tier: 8,
    name: 'Golden Vanguard Blade',
    category: 'Melee Finisher',
    damage: 100,
    fireRate: 2.0,
    automatic: false,
    magSize: 1,
    reloadTime: 0.1,
    spread: 0.0,
    range: 3.5, // Melee reach
    recoilVertical: 0.02,
    recoilHorizontal: 0.08,
    zoomFov: 70,
    accentColor: '#eab308', // Gold
    description: 'The Final Tier. Eliminate any enemy with this blade to WIN THE MATCH!',
  },
};

export const MAX_TIER = 8;

export function getWeaponByTier(tier: number): WeaponDef {
  const clamped = Math.max(1, Math.min(MAX_TIER, tier));
  return WEAPON_TIERS[clamped];
}
