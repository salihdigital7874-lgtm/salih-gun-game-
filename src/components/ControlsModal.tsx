import React from 'react';
import { X, Keyboard, Mouse } from 'lucide-react';

interface ControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ControlsModal: React.FC<ControlsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const keybinds = [
    { key: 'W / A / S / D', action: 'Move / Strafe' },
    { key: 'Mouse Look', action: 'Aim / Turn View' },
    { key: 'Left Click', action: 'Fire Weapon / Attack' },
    { key: 'Right Click (Hold)', action: 'Aim Down Sights (ADS Zoom)' },
    { key: 'R', action: 'Reload Magazine' },
    { key: 'Spacebar', action: 'Jump (Use on Jump Pads for Super Jump!)' },
    { key: 'Left Shift', action: 'Tactical Sprint' },
    { key: 'C', action: 'Crouch' },
    { key: 'TAB (Hold)', action: 'View Gun Game Leaderboard' },
    { key: 'ESC', action: 'Pause Match / Unlock Cursor' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              Combat Controls & Tips
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-xs">
            <div className="font-bold text-amber-300 text-sm mb-1.5 flex items-center gap-1.5">
              <span>📱 Mobile Controls (Super Simple):</span>
            </div>
            <ul className="space-y-1 text-slate-200 text-[11px]">
              <li>• <strong>Left Joystick:</strong> Drag thumb on bottom-left to move</li>
              <li>• <strong>Right Screen:</strong> Swipe anywhere on right to aim</li>
              <li>• <strong>Auto-Fire:</strong> Automatically shoots when aimed at enemy!</li>
              <li>• <strong>Action Buttons:</strong> Big FIRE, JUMP, RELOAD & ZOOM</li>
            </ul>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
            <div className="font-bold text-sky-300 text-xs mb-1.5">
              💻 PC Keyboard & Mouse:
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-300">
              <div>• WASD: Move</div>
              <div>• Mouse: Aim</div>
              <div>• Left Click: Fire</div>
              <div>• Right Click: Zoom ADS</div>
              <div>• Spacebar: Jump</div>
              <div>• R: Reload</div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed text-center">
          <strong>Goal:</strong> Eliminate enemies to level up your gun from Pistol to Tier 8 Golden Knife to win!
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Got it, Let's Fight!
          </button>
        </div>
      </div>
    </div>
  );
};
