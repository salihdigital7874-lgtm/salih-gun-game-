import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/gameEngine';
import {
  GameSettings,
  MatchState,
  PlayerStats,
  WeaponDef,
  KillFeedItem,
  DamageNumber,
} from './types/game';
import { HUD } from './components/HUD';
import { Leaderboard } from './components/Leaderboard';
import { ControlDock } from './components/ControlDock';
import { SettingsModal } from './components/SettingsModal';
import { ControlsModal } from './components/ControlsModal';
import { GameOverModal } from './components/GameOverModal';
import { LobbyMenu } from './components/LobbyMenu';
import { PauseMenu } from './components/PauseMenu';
import { MobileControls } from './components/MobileControls';
import { LandscapePrompt } from './components/LandscapePrompt';

const isTouchDevice =
  typeof window !== 'undefined' &&
  ('ontouchstart' in window || navigator.maxTouchPoints > 0);

const DEFAULT_SETTINGS: GameSettings = {
  mouseSensitivity: 1.0,
  fov: 78,
  soundVolume: 0.7,
  musicVolume: 0.35,
  botCount: 3,
  botDifficulty: 'recruit',
  crosshairStyle: 'cross',
  autoFire: true,
  aimAssist: true,
  touchControls: isTouchDevice,
};

export const App: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Game UI States
  const [matchState, setMatchState] = useState<MatchState>('menu');
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [weapon, setWeapon] = useState<WeaponDef | null>(null);
  const [ammo, setAmmo] = useState({ current: 12, max: 12, isReloading: false });
  const [health, setHealth] = useState({ hp: 100, maxHp: 100, shield: 50 });
  const [stats, setStats] = useState<PlayerStats>({
    kills: 0,
    deaths: 0,
    headshots: 0,
    shotsFired: 0,
    shotsHit: 0,
    score: 0,
    currentTier: 1,
  });
  const [killFeed, setKillFeed] = useState<KillFeedItem[]>([]);
  const [damageNumbers, setDamageNumbers] = useState<DamageNumber[]>([]);
  const [hitmarker, setHitmarker] = useState(false);
  const [isHeadshotHit, setIsHeadshotHit] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [leaderboardEntries, setLeaderboardEntries] = useState<
    { name: string; tier: number; kills: number; isPlayer: boolean }[]
  >([]);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isControlsOpen, setIsControlsOpen] = useState(false);

  // Initialize GameEngine
  useEffect(() => {
    if (!mountRef.current) return;

    const engine = new GameEngine(mountRef.current, settings, {
      onStatsChange: (s) => setStats(s),
      onHealthChange: (hp, maxHp, shield) => setHealth({ hp, maxHp, shield }),
      onAmmoChange: (current, max, isReloading) => setAmmo({ current, max, isReloading }),
      onWeaponChange: (w) => setWeapon(w),
      onKillFeed: (item) => {
        setKillFeed((prev) => [...prev.slice(-10), item]);
      },
      onDamageNumber: (num) => {
        setDamageNumbers((prev) => [...prev.slice(-6), num]);
        setTimeout(() => {
          setDamageNumbers((prev) => prev.filter((d) => d.id !== num.id));
        }, 800);
      },
      onHitmarker: (headshot) => {
        setHitmarker(true);
        setIsHeadshotHit(headshot);
        setTimeout(() => setHitmarker(false), 90);
      },
      onMatchStateChange: (st) => setMatchState(st),
      onLeaderboardUpdate: (list) => setLeaderboardEntries(list),
    });

    engine.startLoop();
    engineRef.current = engine;

    // Leaderboard hold [TAB] key handler
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Tab') {
        e.preventDefault();
        setIsLeaderboardOpen(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Tab') {
        e.preventDefault();
        setIsLeaderboardOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  const handleStartMatch = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.startMatch();
      setMatchState('playing');
    }
  }, []);

  const handleResumeMatch = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.setMatchState('playing');
      engineRef.current.requestPointerLock();
      setMatchState('playing');
    }
  }, []);

  const handleUpdateSettings = useCallback((newSettings: GameSettings) => {
    setSettings(newSettings);
    if (engineRef.current) {
      engineRef.current.updateSettings(newSettings);
    }
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 text-white select-none">
      {/* 1. Isolated 3D WebGL Canvas Container */}
      <div
        ref={mountRef}
        onClick={() => {
          if (matchState === 'playing') {
            engineRef.current?.requestPointerLock();
          }
        }}
        className="absolute inset-0 cursor-crosshair-custom w-full h-full"
      />

      {/* 2. In-Game Heads-Up Display (Only visible when active in match) */}
      {(matchState === 'playing' || matchState === 'paused') && (
        <HUD
          weapon={weapon}
          ammo={ammo}
          health={health}
          stats={stats}
          killFeed={killFeed}
          damageNumbers={damageNumbers}
          hitmarker={hitmarker}
          isHeadshotHit={isHeadshotHit}
          crosshairStyle={settings.crosshairStyle}
        />
      )}

      {/* 2.5 Mobile Virtual Joystick & Touch Controls */}
      {matchState === 'playing' && settings.touchControls && (
        <MobileControls
          onMove={(x, y) => engineRef.current?.setTouchMovement(x, y)}
          onLook={(dx, dy) => engineRef.current?.addTouchLook(dx, dy)}
          onFire={(firing) => engineRef.current?.setTouchFiring(firing)}
          onAim={(aiming) => engineRef.current?.setTouchAiming(aiming)}
          onJump={() => engineRef.current?.triggerJump()}
          onReload={() => engineRef.current?.triggerReload()}
          autoFire={settings.autoFire}
          onToggleAutoFire={() =>
            handleUpdateSettings({ ...settings, autoFire: !settings.autoFire })
          }
        />
      )}

      {/* 3. Match Standings Leaderboard overlay */}
      <Leaderboard
        entries={leaderboardEntries}
        isOpen={isLeaderboardOpen && matchState !== 'menu'}
      />

      {/* 4. Collapsible Bottom Dock Controls */}
      <ControlDock
        matchState={matchState}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onStartMatch={handleStartMatch}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleControlsModal={() => setIsControlsOpen(true)}
      />

      {/* 5. Start Lobby Menu */}
      {matchState === 'menu' && (
        <LobbyMenu
          onStart={handleStartMatch}
          onOpenControls={() => setIsControlsOpen(true)}
        />
      )}

      {/* 6. Pause Menu Overlay */}
      {matchState === 'paused' && (
        <PauseMenu
          onResume={handleResumeMatch}
          onRestart={handleStartMatch}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenControls={() => setIsControlsOpen(true)}
        />
      )}

      {/* 7. Victory / Defeat Modal */}
      {(matchState === 'victory' || matchState === 'defeat') && (
        <GameOverModal
          state={matchState}
          stats={stats}
          onRestart={handleStartMatch}
        />
      )}

      {/* 8. Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />

      {/* 9. Keybinds & Help Modal */}
      <ControlsModal
        isOpen={isControlsOpen}
        onClose={() => setIsControlsOpen(false)}
      />

      {/* 10. Mobile Landscape Orientation Guide */}
      <LandscapePrompt />
    </div>
  );
};
