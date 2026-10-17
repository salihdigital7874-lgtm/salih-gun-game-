import React from 'react';
import { WeaponDef, PlayerStats, KillFeedItem, DamageNumber } from '../types/game';
import { MAX_TIER } from '../game/weapons';
import { Shield, Heart, Crosshair as AimIcon, Maximize2 } from 'lucide-react';

interface HUDProps {
  weapon: WeaponDef | null;
  ammo: { current: number; max: number; isReloading: boolean };
  health: { hp: number; maxHp: number; shield: number };
  stats: PlayerStats;
  killFeed: KillFeedItem[];
  damageNumbers: DamageNumber[];
  hitmarker: boolean;
  isHeadshotHit: boolean;
  crosshairStyle: 'dot' | 'cross' | 'circle';
}

export const HUD: React.FC<HUDProps> = ({
  weapon,
  ammo,
  health,
  stats,
  killFeed,
  damageNumbers,
  hitmarker,
  isHeadshotHit,
  crosshairStyle,
}) => {
  const hpPercent = Math.max(0, Math.min(100, (health.hp / health.maxHp) * 100));
  const shieldPercent = Math.max(0, Math.min(100, (health.shield / 50) * 100));

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      if (screen.orientation && 'lock' in screen.orientation) {
        // @ts-expect-error orientation lock standard
        screen.orientation.lock('landscape').catch(() => {});
      }
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="pointer-events-none absolute inset-0 select-none overflow-hidden font-sans">
      {/* 1. TOP BAR: Gun Game Weapon Progression Ladder & Fullscreen Button */}
      <div className="absolute top-2.5 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
        <div className="flex flex-col items-center gap-1">
          <div className="text-[10px] sm:text-[11px] font-bold tracking-widest uppercase text-slate-400 bg-slate-900/80 px-2.5 py-0.5 rounded-full border border-slate-700/60 shadow-lg">
            SALIH GUN <span className="text-amber-400 font-mono ml-1">TIER {stats.currentTier} / {MAX_TIER}</span>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-950/85 backdrop-blur-md px-2 py-1.5 sm:px-3 sm:py-2 rounded-xl border border-slate-800 shadow-2xl">
            {Array.from({ length: MAX_TIER }).map((_, idx) => {
              const tierNum = idx + 1;
              const isCompleted = tierNum < stats.currentTier;
              const isCurrent = tierNum === stats.currentTier;

              return (
                <div
                  key={tierNum}
                  className={`relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg font-bold text-[10px] sm:text-xs transition-all ${
                    isCurrent
                      ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300 scale-110 shadow-lg shadow-amber-500/50'
                      : isCompleted
                      ? 'bg-emerald-600/80 text-white'
                      : 'bg-slate-800/80 text-slate-500'
                  }`}
                >
                  {tierNum === MAX_TIER ? '★' : tierNum}
                  {isCurrent && (
                    <span className="absolute -bottom-1 w-1 h-1 bg-amber-400 rounded-full" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Fullscreen Landscape Toggle */}
        <button
          onClick={toggleFullscreen}
          className="pointer-events-auto p-2 bg-slate-900/85 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-700/80 shadow-lg active:scale-95 transition-all cursor-pointer mt-3"
          title="Toggle Fullscreen Landscape"
        >
          <Maximize2 className="w-4 h-4 text-amber-400" />
        </button>
      </div>

      {/* 2. TOP RIGHT: Kill Feed */}
      <div className="absolute top-20 right-3 sm:top-5 sm:right-5 flex flex-col gap-1.5 max-w-[240px] sm:max-w-sm z-20 pointer-events-none">
        {killFeed.slice(-4).map((item) => (
          <div
            key={item.id}
            className={`flex items-center gap-2 px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-semibold backdrop-blur-md border transition-all ${
              item.isPlayerKiller
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                : item.isPlayerVictim
                ? 'bg-red-950/80 border-red-500/50 text-red-200'
                : 'bg-slate-900/80 border-slate-800 text-slate-300'
            }`}
          >
            <span className={item.isPlayerKiller ? 'text-amber-300 font-bold' : ''}>
              {item.killerName}
            </span>
            <span className="text-[9px] bg-slate-800 px-1 py-0.5 rounded text-slate-400 font-mono">
              {item.weaponName}
            </span>
            <span className={item.isPlayerVictim ? 'text-red-400 font-bold' : ''}>
              {item.victimName}
            </span>
          </div>
        ))}
      </div>

      {/* 3. CENTER: Dynamic Crosshair & Hitmarker */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        {/* Hitmarker X */}
        {hitmarker && (
          <div className="absolute w-7 h-7 pointer-events-none flex items-center justify-center">
            <div
              className={`w-6 h-6 border-2 transform rotate-45 transition-transform ${
                isHeadshotHit ? 'border-red-500 scale-125' : 'border-amber-400'
              }`}
              style={{
                borderTopColor: 'transparent',
                borderBottomColor: 'transparent',
              }}
            />
          </div>
        )}

        {/* Floating Damage Numbers */}
        {damageNumbers.map((dmg) => (
          <div
            key={dmg.id}
            className={`absolute font-black text-sm pointer-events-none animate-float-up ${
              dmg.isHeadshot ? 'text-red-400 text-base scale-110 drop-shadow-[0_2px_4px_rgba(239,68,68,0.8)]' : 'text-amber-300'
            }`}
            style={{
              left: `${dmg.x}px`,
              top: `${dmg.y}px`,
            }}
          >
            {dmg.damage}
          </div>
        ))}

        {/* Main Reticle */}
        {crosshairStyle === 'dot' && (
          <div className="w-2 h-2 bg-white/90 rounded-full shadow-[0_0_4px_rgba(255,255,255,0.8)]" />
        )}
        {crosshairStyle === 'cross' && (
          <div className="relative w-6 h-6 flex items-center justify-center">
            <div className="absolute w-4 h-[2px] bg-white/80" />
            <div className="absolute h-4 w-[2px] bg-white/80" />
            <div className="w-1 h-1 bg-amber-400 rounded-full" />
          </div>
        )}
        {crosshairStyle === 'circle' && (
          <div className="w-6 h-6 rounded-full border border-white/70 flex items-center justify-center">
            <div className="w-1 h-1 bg-white rounded-full" />
          </div>
        )}
      </div>

      {/* 4. HEALTH & SHIELDS: Top-Left on Mobile, Bottom-Left on PC */}
      <div className="absolute top-3 left-3 sm:top-auto sm:bottom-6 sm:left-6 flex flex-col gap-1.5 z-20 pointer-events-none">
        {/* Armor Bar */}
        <div className="flex items-center gap-2 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border border-sky-950/60 shadow-xl min-w-[170px] sm:min-w-[210px]">
          <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400 shrink-0" />
          <div className="flex-1">
            <div className="flex justify-between text-[10px] sm:text-[11px] font-semibold text-sky-300 mb-0.5 sm:mb-1">
              <span>SHIELD</span>
              <span>{Math.round(health.shield)} / 50</span>
            </div>
            <div className="w-full h-1.5 sm:h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all duration-200"
                style={{ width: `${shieldPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Health Bar */}
        <div className="flex items-center gap-2 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 sm:px-3.5 sm:py-2.5 rounded-xl border border-rose-950/60 shadow-xl min-w-[170px] sm:min-w-[210px]">
          <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500 shrink-0" />
          <div className="flex-1">
            <div className="flex justify-between text-[10px] sm:text-[11px] font-semibold text-rose-300 mb-0.5 sm:mb-1">
              <span>HEALTH</span>
              <span className={health.hp < 30 ? 'text-rose-400 animate-pulse font-black' : ''}>
                {Math.round(health.hp)} / {health.maxHp}
              </span>
            </div>
            <div className="w-full h-2 sm:h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-200 ${
                  health.hp < 30
                    ? 'bg-rose-600'
                    : 'bg-gradient-to-r from-rose-500 to-amber-500'
                }`}
                style={{ width: `${hpPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 5. WEAPON & AMMO: Top-Right on Mobile, Bottom-Right on PC */}
      {weapon && (
        <div className="absolute top-3 right-3 sm:top-auto sm:bottom-6 sm:right-6 flex items-center gap-3 sm:gap-4 bg-slate-950/85 backdrop-blur-md px-3.5 py-2 sm:px-5 sm:py-3 rounded-2xl border border-slate-800 shadow-2xl z-20 pointer-events-none">
          <div className="text-right">
            <div className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
              {weapon.category}
            </div>
            <div className="text-sm font-bold text-white tracking-wide">
              {weapon.name}
            </div>
            {ammo.isReloading ? (
              <div className="text-xs font-mono text-amber-400 tracking-wider animate-pulse font-bold mt-0.5">
                RELOADING...
              </div>
            ) : (
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                SEMI/AUTO • TIER {weapon.tier}
              </div>
            )}
          </div>

          <div className="h-10 w-[1px] bg-slate-800" />

          {/* Ammo Digital Display */}
          <div className="flex flex-col items-center">
            {weapon.id === 'knife' ? (
              <div className="text-2xl font-black text-amber-400 font-mono">
                MELEE
              </div>
            ) : (
              <div className="flex items-baseline gap-1 font-mono">
                <span
                  className={`text-3xl font-black ${
                    ammo.current <= 3 ? 'text-red-500 animate-pulse' : 'text-white'
                  }`}
                >
                  {ammo.current}
                </span>
                <span className="text-sm text-slate-500 font-semibold">
                  / {ammo.max}
                </span>
              </div>
            )}
            <div className="text-[10px] tracking-wider text-slate-400 font-semibold uppercase">
              AMMO
            </div>
          </div>
        </div>
      )}

      {/* Low Health Screen Vignette */}
      {health.hp < 30 && (
        <div className="absolute inset-0 border-8 border-rose-600/30 pointer-events-none shadow-[inset_0_0_80px_rgba(225,29,72,0.4)] animate-pulse" />
      )}
    </div>
  );
};
