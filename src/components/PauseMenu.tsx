import React from 'react';
import { Play, RotateCcw, Settings, Keyboard } from 'lucide-react';

interface PauseMenuProps {
  onResume: () => void;
  onRestart: () => void;
  onOpenSettings: () => void;
  onOpenControls: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  onResume,
  onRestart,
  onOpenSettings,
  onOpenControls,
}) => {
  return (
    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-40 select-none">
      <div className="max-w-sm w-full bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl text-center">
        <h2 className="text-xl font-black uppercase tracking-wider text-white mb-1">
          SALIH GUN • PAUSED
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          Game state is held. Click resume to continue combat.
        </p>

        <div className="space-y-3">
          <button
            onClick={onResume}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Resume Combat</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restart Salih Gun</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="w-full py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Settings className="w-4 h-4 text-sky-400" />
            <span>Settings</span>
          </button>

          <button
            onClick={onOpenControls}
            className="w-full py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Keyboard className="w-4 h-4 text-amber-400" />
            <span>Keybinds & Help</span>
          </button>
        </div>
      </div>
    </div>
  );
};
