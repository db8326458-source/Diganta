import React, { useState, useEffect, useRef } from 'react';
import { GameSaveData, GameLocation, VehicleType } from './types/game';
import { INITIAL_SAVE_DATA, VILLAGE_LOCATIONS } from './data/defaultData';
import { GameWorld } from './game3d/GameWorld';
import { HUD } from './components/HUD';
import { CyberCafeModal } from './components/CyberCafeModal';
import { SchoolCollegeModal } from './components/SchoolCollegeModal';
import { BankAtmModal } from './components/BankAtmModal';
import { FamilyModal } from './components/FamilyModal';
import { CareerHubModal } from './components/CareerHubModal';
import { MarketShopModal } from './components/MarketShopModal';
import { MobilePhone } from './components/MobilePhone';
import { GodotExportModal } from './components/GodotExportModal';
import { NewGameModal } from './components/NewGameModal';

const SAVE_STORAGE_KEY = 'indian_life_rp_save_v1';

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<GameWorld | null>(null);

  // Game Save State
  const [saveData, setSaveData] = useState<GameSaveData>(() => {
    try {
      const saved = localStorage.getItem(SAVE_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return INITIAL_SAVE_DATA;
  });

  // Modal Visibility State
  const [activeModal, setActiveModal] = useState<
    'none' | 'cyber_cafe' | 'school' | 'bank' | 'home' | 'police' | 'hospital' | 'market' | 'phone' | 'godot_export' | 'new_game'
  >('none');

  // Interaction & Driving State
  const [nearbyInteractable, setNearbyInteractable] = useState<{ id: string; name: string } | null>(null);
  const [nearbyVehicle, setNearbyVehicle] = useState<VehicleType | null>(null);
  const [isDriving, setIsDriving] = useState(false);

  // Input States
  const inputVecRef = useRef({ x: 0, y: 0 });
  const isSprintingRef = useRef(false);
  const keysPressed = useRef<{ [key: string]: boolean }>({});

  // Touch Camera Orbit Drag tracking
  const cameraTouchRef = useRef<{ id: number; lastX: number; lastY: number } | null>(null);

  // Initialize 3D Three.js Game World once
  useEffect(() => {
    if (!mountRef.current) return;

    const world = new GameWorld(mountRef.current, saveData.player);
    worldRef.current = world;

    world.onNearbyInteractable = (loc) => {
      setNearbyInteractable(loc);
    };

    world.onVehicleNearby = (veh) => {
      setNearbyVehicle(veh);
      setIsDriving(world.isDriving);
    };

    // Keyboard Listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;

      keysPressed.current[e.code] = true;

      if (e.code === 'KeyE') {
        handleInteractAction();
      } else if (e.code === 'KeyH') {
        world.honk();
      } else if (e.code === 'KeyM') {
        setActiveModal(prev => prev === 'phone' ? 'none' : 'phone');
      } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        isSprintingRef.current = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = false;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        isSprintingRef.current = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Mouse Drag for Camera Orbit on Desktop
    let isMouseDown = false;
    let lastMouseX = 0;
    let lastMouseY = 0;

    const handleMouseDown = (e: MouseEvent) => {
      if ((e.target as HTMLElement)?.tagName !== 'CANVAS') return;
      isMouseDown = true;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDown || !worldRef.current) return;
      const dx = e.clientX - lastMouseX;
      const dy = e.clientY - lastMouseY;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;

      worldRef.current.camYaw -= dx * 0.005;
      worldRef.current.camPitch = Math.max(0.05, Math.min(Math.PI / 3, worldRef.current.camPitch + dy * 0.005));
    };

    const handleMouseUp = () => {
      isMouseDown = false;
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Frame update loop for desktop WASD input polling
    let frameId = 0;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      if (worldRef.current) {
        let ix = inputVecRef.current.x;
        let iy = inputVecRef.current.y;

        // Overlay keyboard keys if no touch joystick
        if (Math.abs(ix) < 0.05 && Math.abs(iy) < 0.05) {
          if (keysPressed.current['KeyW'] || keysPressed.current['ArrowUp']) iy -= 1;
          if (keysPressed.current['KeyS'] || keysPressed.current['ArrowDown']) iy += 1;
          if (keysPressed.current['KeyA'] || keysPressed.current['ArrowLeft']) ix -= 1;
          if (keysPressed.current['KeyD'] || keysPressed.current['ArrowRight']) ix += 1;

          const len = Math.hypot(ix, iy);
          if (len > 0) {
            ix /= len;
            iy /= len;
          }
        }

        const jump = !!keysPressed.current['Space'];
        worldRef.current.updatePlayerMovement(
          { x: ix, y: iy },
          isSprintingRef.current,
          jump,
          dt
        );
      }

      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      world.destroy();
    };
  }, []);

  // Sync Day / Night & Weather to 3D Game World
  useEffect(() => {
    if (worldRef.current) {
      worldRef.current.updateTimeAndWeather(saveData.inGameTime, saveData.weather);
    }
  }, [saveData.inGameTime, saveData.weather]);

  // Sync Player Appearance to 3D character
  useEffect(() => {
    if (worldRef.current) {
      worldRef.current.playerChar.setAppearance(saveData.player);
    }
  }, [saveData.player]);

  // In-Game Time Progression (1 real sec = 1.2 in-game mins)
  useEffect(() => {
    const timer = setInterval(() => {
      setSaveData(prev => {
        let newTime = prev.inGameTime + 1.2;
        let newDay = prev.day;
        let addedBank = prev.moneyBank;

        // Day rollover at midnight (1440 min)
        if (newTime >= 1440) {
          newTime = 360; // 6:00 AM next morning
          newDay += 1;

          // If owns business, credit daily revenue
          if (prev.business.ownedTypes.length > 0) {
            addedBank += prev.business.dailyRevenue || 1800;
          }
        }

        return {
          ...prev,
          inGameTime: newTime,
          day: newDay,
          moneyBank: addedBank
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Auto-Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(saveData));
    } catch {
      // ignore
    }
  }, [saveData]);

  // Mobile Touch Camera Drag on right side of screen
  const handleTouchStart = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      // If touch is on right half of screen, use for camera orbit
      if (touch.clientX > window.innerWidth * 0.4 && cameraTouchRef.current === null) {
        cameraTouchRef.current = {
          id: touch.identifier,
          lastX: touch.clientX,
          lastY: touch.clientY
        };
        break;
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!cameraTouchRef.current || !worldRef.current) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === cameraTouchRef.current.id) {
        const dx = touch.clientX - cameraTouchRef.current.lastX;
        const dy = touch.clientY - cameraTouchRef.current.lastY;
        cameraTouchRef.current.lastX = touch.clientX;
        cameraTouchRef.current.lastY = touch.clientY;

        worldRef.current.camYaw -= dx * 0.007;
        worldRef.current.camPitch = Math.max(0.05, Math.min(Math.PI / 3, worldRef.current.camPitch + dy * 0.007));
        break;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!cameraTouchRef.current) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === cameraTouchRef.current.id) {
        cameraTouchRef.current = null;
        break;
      }
    }
  };

  const handleInteractAction = () => {
    if (worldRef.current?.isDriving) {
      worldRef.current.toggleDrive();
      setIsDriving(false);
      return;
    }

    if (nearbyInteractable) {
      switch (nearbyInteractable.id) {
        case 'home':
          setActiveModal('home');
          break;
        case 'school':
          setActiveModal('school');
          break;
        case 'cyber_cafe':
          setActiveModal('cyber_cafe');
          break;
        case 'bank':
          setActiveModal('bank');
          break;
        case 'police':
        case 'hospital':
          setActiveModal('police');
          break;
        case 'market':
          setActiveModal('market');
          break;
        default:
          setActiveModal('home');
          break;
      }
    } else if (nearbyVehicle && worldRef.current) {
      worldRef.current.toggleDrive(nearbyVehicle);
      setIsDriving(worldRef.current.isDriving);
    }
  };

  const handleToggleDrive = () => {
    if (worldRef.current) {
      worldRef.current.toggleDrive(nearbyVehicle || undefined);
      setIsDriving(worldRef.current.isDriving);
    }
  };

  const handleHonk = () => {
    worldRef.current?.honk();
  };

  const handleSetWaypoint = (loc: GameLocation) => {
    worldRef.current?.setWaypoint(loc);
  };

  const handleManualSave = () => {
    try {
      localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(saveData));
    } catch {
      // ignore
    }
  };

  const handleStartNewGame = (newSave: GameSaveData) => {
    setSaveData(newSave);
    setActiveModal('none');
    try {
      localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(newSave));
    } catch {
      // ignore
    }
  };

  return (
    <div 
      className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 z-0 touch-none" />

      {/* Heads Up Display (HUD) */}
      <HUD
        saveData={saveData}
        nearbyInteractable={nearbyInteractable}
        nearbyVehicle={nearbyVehicle}
        isDriving={isDriving}
        onInteract={handleInteractAction}
        onToggleDrive={handleToggleDrive}
        onHonk={handleHonk}
        onOpenPhone={() => setActiveModal('phone')}
        onOpenGodotExport={() => setActiveModal('godot_export')}
        onOpenNewGame={() => setActiveModal('new_game')}
        onJoystickMove={(vec) => {
          inputVecRef.current = vec;
        }}
        onSprintToggle={(sprint) => {
          isSprintingRef.current = sprint;
        }}
        onJump={() => {
          // Trigger jump
          if (worldRef.current) {
            worldRef.current.playerPos.y = 1.2;
            setTimeout(() => {
              if (worldRef.current) worldRef.current.playerPos.y = 0;
            }, 300);
          }
        }}
      />

      {/* Interactive Modals */}
      {activeModal === 'cyber_cafe' && (
        <CyberCafeModal
          saveData={saveData}
          onUpdateSave={setSaveData}
          onClose={() => setActiveModal('none')}
        />
      )}

      {activeModal === 'school' && (
        <SchoolCollegeModal
          saveData={saveData}
          onUpdateSave={setSaveData}
          onClose={() => setActiveModal('none')}
        />
      )}

      {activeModal === 'bank' && (
        <BankAtmModal
          saveData={saveData}
          onUpdateSave={setSaveData}
          onClose={() => setActiveModal('none')}
        />
      )}

      {activeModal === 'home' && (
        <FamilyModal
          saveData={saveData}
          onUpdateSave={setSaveData}
          onClose={() => setActiveModal('none')}
        />
      )}

      {(activeModal === 'police' || activeModal === 'hospital') && (
        <CareerHubModal
          saveData={saveData}
          onUpdateSave={setSaveData}
          onClose={() => setActiveModal('none')}
        />
      )}

      {activeModal === 'market' && (
        <MarketShopModal
          saveData={saveData}
          onUpdateSave={setSaveData}
          onClose={() => setActiveModal('none')}
        />
      )}

      {activeModal === 'phone' && (
        <MobilePhone
          saveData={saveData}
          onUpdateSave={setSaveData}
          onSetWaypoint={handleSetWaypoint}
          onSaveGame={handleManualSave}
          onClose={() => setActiveModal('none')}
          onOpenGodotExport={() => setActiveModal('godot_export')}
        />
      )}

      {activeModal === 'godot_export' && (
        <GodotExportModal
          onClose={() => setActiveModal('none')}
        />
      )}

      {activeModal === 'new_game' && (
        <NewGameModal
          onStartGame={handleStartNewGame}
          onClose={() => setActiveModal('none')}
        />
      )}
    </div>
  );
}
