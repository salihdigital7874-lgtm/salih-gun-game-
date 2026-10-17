import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Target, Zap, RotateCcw, ArrowUp, Crosshair } from 'lucide-react';

interface MobileControlsProps {
  onMove: (x: number, y: number) => void;
  onLook: (deltaX: number, deltaY: number) => void;
  onFire: (firing: boolean) => void;
  onAim: (aiming: boolean) => void;
  onJump: () => void;
  onReload: () => void;
  autoFire: boolean;
  onToggleAutoFire: () => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onMove,
  onLook,
  onFire,
  onAim,
  onJump,
  onReload,
  autoFire,
  onToggleAutoFire,
}) => {
  // Joystick state
  const joystickRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isJoystickActive, setIsJoystickActive] = useState(false);
  const joystickTouchIdRef = useRef<number | null>(null);
  const joystickCenterRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Aim touch state (swiping anywhere on the right half of the screen)
  const lookTouchIdRef = useRef<number | null>(null);
  const lastLookPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isADS, setIsADS] = useState(false);
  const [isFiringActive, setIsFiringActive] = useState(false);

  // Left Joystick Touch Handlers
  const handleJoystickStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (joystickTouchIdRef.current !== null) return;

    const touch = e.changedTouches[0];
    joystickTouchIdRef.current = touch.identifier;

    if (joystickRef.current) {
      const rect = joystickRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      joystickCenterRef.current = { x: centerX, y: centerY };

      const dx = touch.clientX - centerX;
      const dy = touch.clientY - centerY;
      const maxRadius = rect.width / 2;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);
      const clampedDist = Math.min(dist, maxRadius);

      const kx = Math.cos(angle) * clampedDist;
      const ky = Math.sin(angle) * clampedDist;

      setKnobPos({ x: kx, y: ky });
      setIsJoystickActive(true);
      onMove(kx / maxRadius, -(ky / maxRadius)); // inverted Y for forward
    }
  }, [onMove]);

  const handleJoystickMove = useCallback((e: TouchEvent) => {
    if (joystickTouchIdRef.current === null || !joystickRef.current) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === joystickTouchIdRef.current) {
        const { x: cx, y: cy } = joystickCenterRef.current;
        const dx = touch.clientX - cx;
        const dy = touch.clientY - cy;
        const maxRadius = joystickRef.current.clientWidth / 2;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        const clampedDist = Math.min(dist, maxRadius);

        const kx = Math.cos(angle) * clampedDist;
        const ky = Math.sin(angle) * clampedDist;

        setKnobPos({ x: kx, y: ky });
        onMove(kx / maxRadius, -(ky / maxRadius));
        break;
      }
    }
  }, [onMove]);

  const handleJoystickEnd = useCallback((e: TouchEvent) => {
    if (joystickTouchIdRef.current === null) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === joystickTouchIdRef.current) {
        joystickTouchIdRef.current = null;
        setKnobPos({ x: 0, y: 0 });
        setIsJoystickActive(false);
        onMove(0, 0);
        break;
      }
    }
  }, [onMove]);

  // Right Aim Area Touch Handlers (Right half screen drag for camera look)
  const handleAimAreaStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (lookTouchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    lookTouchIdRef.current = touch.identifier;
    lastLookPosRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleAimAreaMove = useCallback((e: TouchEvent) => {
    if (lookTouchIdRef.current === null) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === lookTouchIdRef.current) {
        const dx = touch.clientX - lastLookPosRef.current.x;
        const dy = touch.clientY - lastLookPosRef.current.y;
        lastLookPosRef.current = { x: touch.clientX, y: touch.clientY };
        onLook(dx, dy);
        break;
      }
    }
  }, [onLook]);

  const handleAimAreaEnd = useCallback((e: TouchEvent) => {
    if (lookTouchIdRef.current === null) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === lookTouchIdRef.current) {
        lookTouchIdRef.current = null;
        break;
      }
    }
  }, []);

  // Global touch listeners to prevent touch lockups
  useEffect(() => {
    window.addEventListener('touchmove', handleJoystickMove, { passive: false });
    window.addEventListener('touchend', handleJoystickEnd);
    window.addEventListener('touchcancel', handleJoystickEnd);

    window.addEventListener('touchmove', handleAimAreaMove, { passive: false });
    window.addEventListener('touchend', handleAimAreaEnd);
    window.addEventListener('touchcancel', handleAimAreaEnd);

    return () => {
      window.removeEventListener('touchmove', handleJoystickMove);
      window.removeEventListener('touchend', handleJoystickEnd);
      window.removeEventListener('touchcancel', handleJoystickEnd);

      window.removeEventListener('touchmove', handleAimAreaMove);
      window.removeEventListener('touchend', handleAimAreaEnd);
      window.removeEventListener('touchcancel', handleAimAreaEnd);
    };
  }, [handleJoystickMove, handleJoystickEnd, handleAimAreaMove, handleAimAreaEnd]);

  const toggleADS = () => {
    const next = !isADS;
    setIsADS(next);
    onAim(next);
  };

  const handleShootStart = (e: React.TouchEvent | React.MouseEvent) => {
    e.stopPropagation();
    setIsFiringActive(true);
    onFire(true);
  };

  const handleShootEnd = (e: React.TouchEvent | React.MouseEvent) => {
    e.stopPropagation();
    setIsFiringActive(false);
    onFire(false);
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-20 overflow-hidden">
      {/* 1. LEFT SIDE: PURE CONTROL BUTTON (Movement Joystick) */}
      <div className="absolute bottom-4 left-4 sm:bottom-8 sm:left-8 flex flex-col items-center pointer-events-auto">
        <div className="text-[10px] sm:text-xs font-black tracking-widest uppercase text-amber-400 bg-slate-950/80 px-3 py-0.5 rounded-full border border-amber-500/30 mb-2 shadow-lg">
          CONTROL BUTTON (നീക്കുക)
        </div>

        <div
          className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center touch-none cursor-pointer"
          onTouchStart={handleJoystickStart}
        >
          {/* Direction indicator markings */}
          <div className="absolute top-1 text-[11px] text-slate-500 font-mono font-bold">▲</div>
          <div className="absolute bottom-1 text-[11px] text-slate-500 font-mono font-bold">▼</div>
          <div className="absolute left-1 text-[11px] text-slate-500 font-mono font-bold">◄</div>
          <div className="absolute right-1 text-[11px] text-slate-500 font-mono font-bold">►</div>

          {/* Outer circle base */}
          <div
            ref={joystickRef}
            className={`relative w-32 h-32 sm:w-40 sm:h-40 rounded-full border-2 transition-all flex items-center justify-center shadow-2xl ${
              isJoystickActive
                ? 'bg-amber-500/25 border-amber-400 shadow-amber-500/30 scale-105'
                : 'bg-slate-900/70 border-slate-700/90 backdrop-blur-md'
            }`}
          >
            {/* Inner cross grid lines */}
            <div className="absolute w-full h-[1px] bg-slate-700/50" />
            <div className="absolute h-full w-[1px] bg-slate-700/50" />

            {/* Inner Knob */}
            <div
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 transition-transform duration-75 flex flex-col items-center justify-center shadow-2xl ${
                isJoystickActive
                  ? 'bg-gradient-to-tr from-amber-400 to-yellow-300 border-white text-slate-950 scale-110 shadow-amber-400/50'
                  : 'bg-gradient-to-tr from-slate-800 to-slate-700 border-amber-500/60 text-amber-300'
              }`}
              style={{
                transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
              }}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400 mb-0.5" />
              <span className="text-[9px] font-black tracking-wider uppercase">MOVE</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. RIGHT HALF SCREEN: Touch Swipe Aiming Surface */}
      <div
        className="absolute top-0 right-0 w-1/2 h-full pointer-events-auto touch-none"
        onTouchStart={handleAimAreaStart}
      />

      {/* 3. RIGHT SIDE: PURE SHOOT BUTTON & COMBAT ACTIONS */}
      <div className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 flex flex-col items-end pointer-events-auto">
        <div className="text-[10px] sm:text-xs font-black tracking-widest uppercase text-rose-400 bg-slate-950/80 px-3 py-0.5 rounded-full border border-rose-500/30 mb-2 shadow-lg">
          SHOOT BUTTON (വെടി)
        </div>

        {/* Action cluster container */}
        <div className="relative flex items-center justify-center">
          {/* Auto-Fire Toggle (Top of shoot cluster) */}
          <div className="absolute -top-12 right-2 flex items-center gap-2">
            <button
              onTouchStart={(e) => {
                e.stopPropagation();
                onToggleAutoFire();
              }}
              onClick={onToggleAutoFire}
              className={`px-3 py-1.5 rounded-xl border text-[10px] sm:text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg active:scale-95 transition-all cursor-pointer ${
                autoFire
                  ? 'bg-emerald-600 border-emerald-300 text-white shadow-emerald-900/40'
                  : 'bg-slate-900/90 border-slate-700 text-slate-400'
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Auto-Shoot: {autoFire ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          {/* Quick Reload (Left flank of shoot button) */}
          <button
            onTouchStart={(e) => {
              e.stopPropagation();
              onReload();
            }}
            onClick={onReload}
            className="absolute -left-16 sm:-left-20 bottom-8 w-13 h-13 sm:w-15 sm:h-15 rounded-2xl bg-slate-900/90 border border-slate-700 text-slate-200 flex flex-col items-center justify-center shadow-xl active:scale-90 transition-transform cursor-pointer"
            title="Reload Weapon"
          >
            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 text-sky-400" />
            <span className="text-[8px] sm:text-[9px] font-black text-slate-300 uppercase mt-0.5">RELOAD</span>
          </button>

          {/* Jump Button (Top-left flank of shoot button) */}
          <button
            onTouchStart={(e) => {
              e.stopPropagation();
              onJump();
            }}
            onClick={onJump}
            className="absolute -top-14 -left-6 sm:-top-16 sm:-left-8 w-13 h-13 sm:w-15 sm:h-15 rounded-2xl bg-slate-900/90 border-2 border-amber-500/60 text-amber-300 flex flex-col items-center justify-center shadow-xl active:scale-90 transition-transform cursor-pointer"
            title="Jump"
          >
            <ArrowUp className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
            <span className="text-[8px] sm:text-[9px] font-black text-amber-300 uppercase">JUMP</span>
          </button>

          {/* ADS Zoom Button (Top flank of shoot button) */}
          <button
            onTouchStart={(e) => {
              e.stopPropagation();
              toggleADS();
            }}
            onClick={toggleADS}
            className={`absolute -top-14 right-10 sm:-top-16 sm:right-12 w-13 h-13 sm:w-15 sm:h-15 rounded-2xl border-2 flex flex-col items-center justify-center shadow-xl active:scale-90 transition-transform cursor-pointer ${
              isADS
                ? 'bg-sky-600 border-sky-300 text-white'
                : 'bg-slate-900/90 border-slate-700 text-slate-300'
            }`}
            title="Aim Down Sights Zoom"
          >
            <Crosshair className="w-5 h-5 text-sky-300" />
            <span className="text-[8px] sm:text-[9px] font-black uppercase mt-0.5">ZOOM</span>
          </button>

          {/* MAIN BIG PROMINENT SHOOT BUTTON */}
          <button
            onTouchStart={handleShootStart}
            onTouchEnd={handleShootEnd}
            onMouseDown={handleShootStart}
            onMouseUp={handleShootEnd}
            className={`w-28 h-28 sm:w-34 sm:h-34 rounded-full border-4 flex flex-col items-center justify-center shadow-2xl transition-all duration-75 cursor-pointer touch-none ${
              isFiringActive
                ? 'bg-gradient-to-tr from-rose-600 via-red-500 to-amber-400 border-white scale-95 shadow-red-500/60 ring-4 ring-rose-400/50'
                : 'bg-gradient-to-tr from-rose-700 via-rose-600 to-red-500 border-rose-300 text-white shadow-rose-900/50 hover:scale-105 active:scale-95'
            }`}
          >
            <Target className="w-10 h-10 sm:w-12 sm:h-12 stroke-[2.5] mb-0.5" />
            <span className="text-xs sm:text-sm font-black tracking-widest uppercase">
              SHOOT
            </span>
            <span className="text-[9px] sm:text-[10px] font-bold text-rose-200 uppercase -mt-0.5">
              വെടിവെക്കുക
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
