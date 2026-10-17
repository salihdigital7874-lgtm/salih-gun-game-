import React from 'react';
import { MAX_TIER } from '../game/weapons';
import { Trophy, Target } from 'lucide-react';

interface LeaderboardProps {
  entries: { name: string; tier: number; kills: number; isPlayer: boolean }[];
  isOpen: boolean;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ entries, isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center z-40 pointer-events-none">
      <div className="w-full max-w-xl bg-slate-900/90 border border-slate-700 rounded-2xl p-6 shadow-2xl pointer-events-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">
              Salih Gun 3D • Standings
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            First to reach Tier {MAX_TIER} win!
          </span>
        </div>

        <div className="mt-4 flex flex-col gap-2 max-h-96 overflow-y-auto pr-1">
          {entries.map((entry, idx) => (
            <div
              key={entry.name}
              className={`flex items-center justify-between px-4 py-2.5 rounded-xl border transition-all ${
                entry.isPlayer
                  ? 'bg-amber-500/15 border-amber-500/50 text-white shadow-md'
                  : 'bg-slate-950/40 border-slate-800/80 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-6 text-center font-bold font-mono text-sm ${
                    idx === 0
                      ? 'text-amber-400'
                      : idx === 1
                      ? 'text-slate-300'
                      : idx === 2
                      ? 'text-amber-600'
                      : 'text-slate-500'
                  }`}
                >
                  #{idx + 1}
                </span>
                <span className="font-semibold text-sm">
                  {entry.name} {entry.isPlayer && '(YOU)'}
                </span>
              </div>

              <div className="flex items-center gap-6 text-xs font-mono">
                <div className="flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-400">Kills:</span>
                  <span className="font-bold text-white">{entry.kills}</span>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-md">
                  <span className="text-slate-400">Tier:</span>
                  <span
                    className={`font-black ${
                      entry.tier === MAX_TIER
                        ? 'text-amber-400'
                        : 'text-sky-400'
                    }`}
                  >
                    {entry.tier} / {MAX_TIER}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 text-center text-xs text-slate-400 font-mono">
          Hold [TAB] to view leaderboard • Press [ESC] to pause
        </div>
      </div>
    </div>
  );
};
