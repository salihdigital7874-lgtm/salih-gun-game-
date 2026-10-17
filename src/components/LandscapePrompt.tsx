import React, { useState, useEffect } from 'react';
import { Smartphone, Maximize2, X } from 'lucide-react';

interface LandscapePromptProps {
  onDismiss?: () => void;
}

export const LandscapePrompt: React.FC<LandscapePromptProps> = () => {
  const [isPortrait, setIsPortrait] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const portrait = window.innerHeight > window.innerWidth;
      // Only show if it's portrait and on a mobile / narrow screen
      setIsPortrait(portrait && isTouch && window.innerWidth < 1024);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  const handleFullscreenLandscape = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
      if (screen.orientation && 'lock' in screen.orientation) {
        // @ts-expect-error orientation lock standard
        await screen.orientation.lock('landscape').catch(() => {});
      }
    } catch {
      // Ignore fullscreen rejection if denied by browser
    }
    setIsDismissed(true);
  };

  if (!isPortrait || isDismissed) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center select-none animate-fade-in">
      <button
        onClick={() => setIsDismissed(true)}
        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-900 border border-slate-800"
        title="Continue in Portrait"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Rotating phone graphic */}
      <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
        <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl animate-pulse" />
        <div className="animate-bounce">
          <Smartphone className="w-16 h-16 text-amber-400 transform rotate-90 transition-transform duration-700" />
        </div>
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-widest mb-3">
        LANDSCAPE MODE RECOMMENDED
      </div>

      <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">
        ഫോൺ തിരിക്കുക (Rotate to Landscape)
      </h2>

      <p className="text-slate-300 text-sm max-w-xs leading-relaxed mb-6">
        Salih Gun 3D മൊബൈലിൽ ഏറ്റവും മികച്ച രീതിയിൽ കളിക്കാൻ ഫോൺ <span className="text-amber-400 font-bold">Landscape</span> ആക്കി പിടിക്കുക.
        <br />
        <span className="text-xs text-slate-400 mt-1 block">
          (Left: Control Joystick • Right: Shoot Button)
        </span>
      </p>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={handleFullscreenLandscape}
          className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-transform"
        >
          <Maximize2 className="w-4 h-4 fill-current" />
          <span>Switch to Landscape Fullscreen</span>
        </button>

        <button
          onClick={() => setIsDismissed(true)}
          className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-semibold text-xs rounded-xl border border-slate-800 transition-colors"
        >
          Continue Anyway in Portrait
        </button>
      </div>
    </div>
  );
};
