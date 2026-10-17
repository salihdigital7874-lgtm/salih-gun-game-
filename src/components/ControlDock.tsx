import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Volume2, VolumeX, Settings, Play, RotateCcw, Keyboard } from 'lucide-react';
import { GameSettings, MatchState } from '../types/game';

interface ControlDockProps {
  matchState: MatchState;
  settings: GameSettings;
  onUpdateSettings: (s: GameSettings) => void;
  onStartMatch: () => void;
  onOpenSettings: () => void;
  onToggleControlsModal: () => void;
}

export const ControlDock: React.FC<ControlDockProps> = ({
  matchState,
  settings,
  onUpdateSettings,
  onStartMatch,
  onOpenSettings,
  onToggleControlsModal,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return typeof window !== 'undefined' && window.innerWidth < 768;
  });
  const [isMuted, setIsMuted] = useState(false);

  const toggleMute = () => {
    if (isMuted) {
      onUpdateSettings({ ...settings, soundVolume: 0.7, musicVolume: 0.4 });
      setIsMuted(false);
    } else {
      onUpdateSettings({ ...settings, soundVolume: 0.0, musicVolume: 0.0 });
      setIsMuted(true);
    }
  };

  const handleDifficultyChange = (diff: GameSettings['botDifficulty']) => {
    onUpdateSettings({ ...settings, botDifficulty: diff });
  };

  return (
    <div
      className="fixed z-30 transition-transform duration-300 ease-out select-none"
      style={{
        bottom: '16px',
        left: '50%',
        transform: `translateX(-50%) translateY(${isCollapsed ? 'calc(100% - 28px)' : '0'})`,
        maxWidth: 'min(940px, 94vw)',
        width: '100%',
      }}
    >
      {/* Collapse / Expand Tab */}
      <div className="flex justify-center -mb-px">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-1.5 px-4 py-1 bg-slate-900/95 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-medium rounded-t-lg border-t border-x border-slate-700/80 shadow-md transition-colors cursor-pointer"
        >
          {isCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              <span>Show Controls</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              <span>Hide Controls</span>
            </>
          )}
        </button>
      </div>

      {/* Dock Card */}
      <div className="bg-slate-950/90 backdrop-blur-md border border-slate-800/90 rounded-2xl p-2.5 shadow-2xl flex flex-wrap items-center justify-between gap-3">
        {/* Left: Quick Actions */}
        <div className="flex items-center gap-2">
          {matchState === 'menu' ? (
            <button
              onClick={onStartMatch}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Enter Arena</span>
            </button>
          ) : (
            <button
              onClick={onStartMatch}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors cursor-pointer"
              title="Restart Gun Game Match"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart Match</span>
            </button>
          )}

          <button
            onClick={onToggleControlsModal}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl border border-slate-800 transition-colors cursor-pointer"
          >
            <Keyboard className="w-3.5 h-3.5 text-amber-400" />
            <span>Keybinds</span>
          </button>
        </div>

        {/* Center: Bot Difficulty Pill */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 px-2 py-1 rounded-xl border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 px-1">AI Combatants:</span>
          {(['recruit', 'veteran', 'apex'] as const).map((diff) => (
            <button
              key={diff}
              onClick={() => handleDifficultyChange(diff)}
              className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                settings.botDifficulty === diff
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>

        {/* Right: Audio & Settings */}
        <div className="flex items-center gap-2">
          {/* Quick Audio Mute */}
          <button
            onClick={toggleMute}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isMuted
                ? 'bg-rose-950/60 border-rose-800/80 text-rose-300'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
            }`}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Settings Modal Trigger */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl border border-slate-800 transition-colors cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-sky-400" />
            <span>Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
