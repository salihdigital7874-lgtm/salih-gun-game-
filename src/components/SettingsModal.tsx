import React from 'react';
import { GameSettings } from '../types/game';
import { X, Sliders, Volume2, Eye, MousePointer } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdateSettings: (s: GameSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-sky-400" />
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              Tactical Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-5">
          {/* Mouse Sensitivity */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
              <span className="flex items-center gap-1.5">
                <MousePointer className="w-3.5 h-3.5 text-amber-400" />
                Mouse Sensitivity
              </span>
              <span className="font-mono text-amber-400">
                {settings.mouseSensitivity.toFixed(1)}x
              </span>
            </div>
            <input
              type="range"
              min="0.4"
              max="3.0"
              step="0.1"
              value={settings.mouseSensitivity}
              onChange={(e) =>
                onUpdateSettings({
                  ...settings,
                  mouseSensitivity: parseFloat(e.target.value),
                })
              }
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          {/* Field of View (FOV) */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-sky-400" />
                Field of View (FOV)
              </span>
              <span className="font-mono text-sky-400">{settings.fov}°</span>
            </div>
            <input
              type="range"
              min="65"
              max="105"
              step="1"
              value={settings.fov}
              onChange={(e) =>
                onUpdateSettings({
                  ...settings,
                  fov: parseInt(e.target.value, 10),
                })
              }
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>

          {/* Sound FX Volume */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
              <span className="flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                SFX Volume
              </span>
              <span className="font-mono text-emerald-400">
                {Math.round(settings.soundVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.soundVolume}
              onChange={(e) =>
                onUpdateSettings({
                  ...settings,
                  soundVolume: parseFloat(e.target.value),
                })
              }
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          {/* Reticle Style */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Crosshair Reticle
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['dot', 'cross', 'circle'] as const).map((style) => (
                <button
                  key={style}
                  onClick={() =>
                    onUpdateSettings({ ...settings, crosshairStyle: style })
                  }
                  className={`py-2 text-xs font-bold uppercase rounded-xl border transition-all cursor-pointer ${
                    settings.crosshairStyle === style
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-800/60 border-slate-700/80 text-slate-400 hover:text-white'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Bot Count */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
              <span>AI Combatants Count</span>
              <span className="font-mono text-purple-400">
                {settings.botCount} Bots
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="7"
              step="1"
              value={settings.botCount}
              onChange={(e) =>
                onUpdateSettings({
                  ...settings,
                  botCount: parseInt(e.target.value, 10),
                })
              }
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>

          {/* Mobile & Accessibility Helpers */}
          <div className="pt-2 border-t border-slate-800 space-y-2.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
              Mobile & Combat Assistance
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300">On-Screen Touch Controls</span>
              <button
                onClick={() =>
                  onUpdateSettings({ ...settings, touchControls: !settings.touchControls })
                }
                className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                  settings.touchControls
                    ? 'bg-emerald-600 border-emerald-400 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {settings.touchControls ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300">Auto-Fire on Target</span>
              <button
                onClick={() =>
                  onUpdateSettings({ ...settings, autoFire: !settings.autoFire })
                }
                className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                  settings.autoFire
                    ? 'bg-emerald-600 border-emerald-400 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {settings.autoFire ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300">Aim Assist (Magnetism)</span>
              <button
                onClick={() =>
                  onUpdateSettings({ ...settings, aimAssist: !settings.aimAssist })
                }
                className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                  settings.aimAssist
                    ? 'bg-emerald-600 border-emerald-400 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {settings.aimAssist ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
