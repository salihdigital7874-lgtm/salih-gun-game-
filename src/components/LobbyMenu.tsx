import React from 'react';
import { Play, Zap } from 'lucide-react';
import { MAX_TIER, WEAPON_TIERS } from '../game/weapons';
import { SalihHeroBadge } from './SalihHeroBadge';

interface LobbyMenuProps {
  onStart: () => void;
  onOpenControls: () => void;
}

export const LobbyMenu: React.FC<LobbyMenuProps> = ({ onStart, onOpenControls }) => {
  return (
    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 z-40 select-none overflow-y-auto">
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden my-auto">
        {/* Ambient Top Glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-40 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Hero Header with Salih Avatar Badge from photo */}
        <div className="text-center relative flex flex-col items-center">
          <div className="mb-2">
            <SalihHeroBadge size="md" showLabel={false} />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-widest mb-1.5">
            <Zap className="w-3.5 h-3.5" /> 3D Gun Game FPS
          </div>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            SALIH GUN 3D
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-lg mx-auto">
            Play as Commander Salih! Progress through 8 weapon tiers in fast-paced 3D combat.
          </p>
        </div>

        {/* Mobile / PC Quick Guide Banner */}
        <div className="mt-6 p-3 bg-slate-950/70 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-around gap-2 text-xs">
          <div className="flex items-center gap-2 text-amber-300 font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Mobile: Left Joystick (Move) • Swipe (Aim) • Auto-Fire</span>
          </div>
          <div className="flex items-center gap-2 text-sky-300 font-semibold">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span>PC: WASD • Mouse Aim • Left Click Fire</span>
          </div>
        </div>

        {/* Weapon Ladder Mini Preview */}
        <div className="mt-6">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center justify-between">
            <span>Gun Progression (8 Tiers)</span>
            <span className="text-amber-400 font-mono">1 Kill = Next Gun</span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {Array.from({ length: MAX_TIER }).map((_, i) => {
              const tier = i + 1;
              const w = WEAPON_TIERS[tier];
              return (
                <div
                  key={tier}
                  className="bg-slate-950/70 border border-slate-800 rounded-xl p-2 flex flex-col items-center text-center transition-transform hover:scale-105"
                >
                  <div className="text-[10px] font-black text-amber-400 font-mono">
                    T{tier}
                  </div>
                  <div className="text-[11px] font-bold text-slate-200 truncate w-full mt-1">
                    {w.category}
                  </div>
                  <div
                    className="w-2 h-2 rounded-full mt-1.5"
                    style={{ backgroundColor: w.accentColor }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6">
          <button
            onClick={onStart}
            className="flex-1 py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-base uppercase tracking-wider rounded-2xl shadow-xl shadow-amber-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-6 h-6 fill-current" />
            <span>START SALIH GUN (PLAY)</span>
          </button>

          <button
            onClick={onOpenControls}
            className="px-6 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-2xl transition-colors cursor-pointer"
          >
            Controls & Guide
          </button>
        </div>
      </div>
    </div>
  );
};
