import React from 'react';
import { PlayerStats, MatchState } from '../types/game';
import { Trophy, Skull, Target, Zap, RotateCcw } from 'lucide-react';
import { SalihHeroBadge } from './SalihHeroBadge';

interface GameOverModalProps {
  state: MatchState;
  stats: PlayerStats;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ state, stats, onRestart }) => {
  if (state !== 'victory' && state !== 'defeat') return null;

  const isWin = state === 'victory';
  const accuracy = stats.shotsFired > 0 ? Math.round((stats.shotsHit / stats.shotsFired) * 100) : 0;
  const kdRatio = stats.deaths > 0 ? (stats.kills / stats.deaths).toFixed(2) : stats.kills.toFixed(2);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-lg flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-8 shadow-2xl text-center relative overflow-hidden">
        {/* Glow backdrop */}
        <div
          className={`absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none ${
            isWin ? 'bg-amber-500/20' : 'bg-red-500/20'
          }`}
        />

        {/* Title Badge / Salih Avatar on Victory */}
        <div className="flex justify-center mb-3">
          {isWin ? (
            <SalihHeroBadge size="lg" showLabel={true} />
          ) : (
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 shadow-xl">
              <Skull className="w-8 h-8 text-rose-500" />
            </div>
          )}
        </div>

        <h1
          className={`text-3xl font-black uppercase tracking-wider ${
            isWin
              ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500'
              : 'text-rose-500'
          }`}
        >
          {isWin ? 'SALIH GUN CHAMPION!' : 'MATCH DEFEAT'}
        </h1>

        <p className="text-slate-400 text-sm mt-1">
          {isWin
            ? 'You mastered all 8 weapon tiers in Salih Gun 3D and claimed ultimate victory!'
            : 'A rival combatant claimed victory on the final tier. Try again!'}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3">
            <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-slate-400 uppercase">
              <Target className="w-3.5 h-3.5 text-amber-400" />
              <span>Eliminations</span>
            </div>
            <div className="text-2xl font-black text-white mt-1 font-mono">
              {stats.kills}
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3">
            <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-slate-400 uppercase">
              <Skull className="w-3.5 h-3.5 text-rose-400" />
              <span>Deaths</span>
            </div>
            <div className="text-2xl font-black text-white mt-1 font-mono">
              {stats.deaths}
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3">
            <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-slate-400 uppercase">
              <Zap className="w-3.5 h-3.5 text-sky-400" />
              <span>Accuracy</span>
            </div>
            <div className="text-2xl font-black text-white mt-1 font-mono">
              {accuracy}%
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3">
            <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-slate-400 uppercase">
              <Trophy className="w-3.5 h-3.5 text-purple-400" />
              <span>K/D Ratio</span>
            </div>
            <div className="text-2xl font-black text-white mt-1 font-mono">
              {kdRatio}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onRestart}
          className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 fill-current" />
          <span>Play Next Salih Gun Match</span>
        </button>
      </div>
    </div>
  );
};
