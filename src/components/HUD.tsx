import React, { useState, useRef, useEffect } from 'react';
import { 
  Smartphone, MapPin, Bike, Footprints, Volume2, VolumeX, Code2, 
  ChevronDown, ChevronUp, Compass, Award, IndianRupee, Sun, CloudRain,
  Radio, CheckCircle2, RotateCcw, Download
} from 'lucide-react';
import { GameSaveData, VehicleType } from '../types/game';
import { sound } from '../audio/soundEngine';

interface Props {
  saveData: GameSaveData;
  nearbyInteractable: { id: string; name: string } | null;
  nearbyVehicle: VehicleType | null;
  isDriving: boolean;
  onInteract: () => void;
  onToggleDrive: () => void;
  onHonk: () => void;
  onOpenPhone: () => void;
  onOpenGodotExport: () => void;
  onOpenNewGame: () => void;
  onJoystickMove: (vec: { x: number; y: number }) => void;
  onSprintToggle: (sprint: boolean) => void;
  onJump: () => void;
}

export const HUD: React.FC<Props> = ({
  saveData,
  nearbyInteractable,
  nearbyVehicle,
  isDriving,
  onInteract,
  onToggleDrive,
  onHonk,
  onOpenPhone,
  onOpenGodotExport,
  onOpenNewGame,
  onJoystickMove,
  onSprintToggle,
  onJump
}) => {
  const [isSprinting, setIsSprinting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hudCollapsed, setHudCollapsed] = useState(false);

  // Virtual Joystick Touch Tracking
  const joystickContainerRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const touchIdRef = useRef<number | null>(null);

  // Time format
  const hours = Math.floor(saveData.inGameTime / 60);
  const mins = Math.floor(saveData.inGameTime % 60);
  const timeStr = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;

  const toggleSprint = () => {
    const next = !isSprinting;
    setIsSprinting(next);
    onSprintToggle(next);
  };

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    sound.setMuted(next);
  };

  // Touch handlers for joystick
  const handleTouchStart = (e: React.TouchEvent) => {
    if (touchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;
    updateJoystick(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        updateJoystick(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        touchIdRef.current = null;
        setKnobPos({ x: 0, y: 0 });
        onJoystickMove({ x: 0, y: 0 });
        break;
      }
    }
  };

  const updateJoystick = (clientX: number, clientY: number) => {
    if (!joystickContainerRef.current) return;
    const rect = joystickContainerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let dx = clientX - centerX;
    let dy = clientY - centerY;
    const maxRadius = rect.width / 2;
    const distance = Math.hypot(dx, dy);

    if (distance > maxRadius) {
      dx = (dx / distance) * maxRadius;
      dy = (dy / distance) * maxRadius;
    }

    setKnobPos({ x: dx, y: dy });
    onJoystickMove({
      x: dx / maxRadius,
      y: dy / maxRadius
    });
  };

  const currentMission = saveData.missions.find(m => !saveData.completedMissionIds.includes(m.id)) || saveData.missions[0];

  return (
    <div className="absolute inset-0 pointer-events-none select-none flex flex-col justify-between p-3 sm:p-5 z-20">
      {/* Top Header Bar */}
      <div className="flex justify-between items-start w-full gap-2">
        {/* Left: Player Profile & Level */}
        <div className="pointer-events-auto bg-slate-950/85 border border-slate-800 rounded-2xl p-2.5 sm:p-3 shadow-xl flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-xl shadow-md font-bold text-white">
            {saveData.player.gender === 'male' ? '👨' : '👩'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs sm:text-sm text-white tracking-wide">
                {saveData.player.name} {saveData.player.familyOrigin}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                {saveData.rank}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
              <span>Age {saveData.age}</span>
              <span>•</span>
              <span className="text-cyan-400 font-mono">XP: {saveData.xp}</span>
              <span>•</span>
              <span className="text-emerald-400 font-mono">₹{(saveData.moneyCash + saveData.moneyBank).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Center: Active Mission Guide Pill */}
        {currentMission && (
          <div className="hidden md:flex pointer-events-auto bg-slate-950/85 border border-amber-500/30 rounded-2xl px-4 py-2 shadow-xl items-center space-x-2 max-w-md">
            <Radio className="w-4 h-4 text-amber-400 animate-pulse flex-shrink-0" />
            <div className="overflow-hidden">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">Active Mission</span>
              <span className="text-xs text-slate-200 font-medium truncate block">{currentMission.title}</span>
            </div>
          </div>
        )}

        {/* Right: Clock, Weather, Audio, Godot 4 & New Game */}
        <div className="pointer-events-auto flex items-center space-x-2">
          {/* Time Widget */}
          <div className="bg-slate-950/85 border border-slate-800 rounded-2xl px-3 py-2 text-center shadow-xl">
            <span className="text-xs sm:text-sm font-bold font-mono text-cyan-300 block">{timeStr}</span>
            <span className="text-[10px] text-slate-400 font-medium block">
              Day {saveData.day} {saveData.weather === 'rainy' ? '🌧️' : '☀️'}
            </span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-2.5 bg-slate-950/85 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl shadow-xl transition"
            title="Toggle Procedural Audio"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Godot 4 Codebase Exporter Button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenGodotExport();
            }}
            className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-xl flex items-center gap-1.5 transition active:scale-95"
            title="Download Android APK & Godot 4 Codebase"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-300"></span>
            <span>Download APK</span>
            <span className="hidden sm:inline text-emerald-200">/ Godot</span>
          </button>

          {/* New Game Button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenNewGame();
            }}
            className="p-2.5 bg-slate-950/85 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-xl shadow-xl transition"
            title="Create New Character / New Life"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center Prompt Banner (when near building or vehicle) */}
      <div className="flex flex-col items-center space-y-2 pointer-events-none">
        {nearbyInteractable && (
          <div className="pointer-events-auto bg-slate-950/90 border border-cyan-500/50 rounded-2xl px-5 py-3 shadow-2xl flex items-center space-x-3 animate-fade-in">
            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping"></div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block">Nearby Landmark</span>
              <span className="text-sm font-bold text-white">{nearbyInteractable.name}</span>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                onInteract();
              }}
              className="ml-2 px-4 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
            >
              Enter / Open (E)
            </button>
          </div>
        )}

        {nearbyVehicle && !isDriving && (
          <div className="pointer-events-auto bg-slate-950/90 border border-emerald-500/50 rounded-2xl px-5 py-2.5 shadow-2xl flex items-center space-x-3">
            <Bike className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold text-white capitalize">Ride {nearbyVehicle}</span>
            <button
              onClick={() => {
                sound.playClick();
                onToggleDrive();
              }}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition"
            >
              Ride (E)
            </button>
          </div>
        )}
      </div>

      {/* Bottom Controls Area */}
      <div className="w-full flex justify-between items-end gap-3">
        {/* Bottom Left: Virtual Touch Joystick (for Mobile) */}
        <div className="pointer-events-auto flex flex-col items-center">
          <div
            ref={joystickContainerRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-slate-950/60 border-2 border-slate-700/80 relative flex items-center justify-center touch-none backdrop-blur-none"
          >
            {/* Joystick Base Rings */}
            <div className="w-16 h-16 rounded-full border border-slate-700/50 absolute"></div>
            {/* Moving Thumb Knob */}
            <div
              style={{
                transform: `translate(${knobPos.x}px, ${knobPos.y}px)`
              }}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 shadow-xl border-2 border-white/60 pointer-events-none flex items-center justify-center text-xs text-white font-bold"
            >
              🕹️
            </div>
          </div>
          <span className="text-[10px] text-slate-400 font-mono mt-1 hidden sm:block">Move (WASD / Touch)</span>
        </div>

        {/* Bottom Center: Collapsible Quick Dock */}
        <div className="pointer-events-auto flex flex-col items-center">
          <button
            onClick={() => setHudCollapsed(!hudCollapsed)}
            className="px-3 py-1 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 rounded-t-xl text-[10px] text-slate-400 flex items-center gap-1 transition"
          >
            {hudCollapsed ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            <span>{hudCollapsed ? 'Show Action Dock' : 'Hide Action Dock'}</span>
          </button>

          {!hudCollapsed && (
            <div className="bg-slate-950/85 border border-slate-800 rounded-2xl p-2 shadow-2xl flex items-center space-x-2">
              {/* DesiPhone 5G button */}
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenPhone();
                }}
                className="px-3 py-2 bg-gradient-to-r from-indigo-700 to-blue-700 hover:from-indigo-600 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5 transition"
              >
                <Smartphone className="w-4 h-4 text-cyan-300" />
                <span>DesiPhone</span>
              </button>

              {/* Export Menu / APK button */}
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenGodotExport();
                }}
                className="px-3 py-2 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5 transition"
              >
                <Download className="w-4 h-4 text-emerald-300" />
                <span>Export APK</span>
              </button>

              {/* Action / Interact Button */}
              {nearbyInteractable && (
                <button
                  onClick={() => {
                    sound.playClick();
                    onInteract();
                  }}
                  className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold shadow transition"
                >
                  Interact (E)
                </button>
              )}

              {/* Exit vehicle button if driving */}
              {isDriving && (
                <>
                  <button
                    onClick={() => {
                      sound.playClick();
                      onHonk();
                    }}
                    className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow transition"
                  >
                    Honk Horn (H)
                  </button>
                  <button
                    onClick={() => {
                      sound.playClick();
                      onToggleDrive();
                    }}
                    className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow transition"
                  >
                    Dismount Vehicle
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Bottom Right: Sprint & Jump Mobile Action Buttons */}
        <div className="pointer-events-auto flex items-end space-x-2.5">
          {/* Sprint Toggle Button */}
          <button
            onClick={toggleSprint}
            className={`w-14 h-14 rounded-2xl border flex flex-col items-center justify-center font-bold text-xs shadow-xl transition active:scale-95 ${
              isSprinting
                ? 'bg-amber-500 border-amber-300 text-slate-950 shadow-amber-500/30'
                : 'bg-slate-950/85 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <Footprints className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">{isSprinting ? 'RUN' : 'WALK'}</span>
          </button>

          {/* Jump Button */}
          <button
            onClick={() => {
              sound.playClick();
              onJump();
            }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-500 border-2 border-blue-400 text-white font-bold text-xs shadow-xl shadow-blue-900/40 flex flex-col items-center justify-center active:scale-95 transition"
          >
            <span className="text-base">⬆️</span>
            <span className="text-[10px] tracking-wider">JUMP</span>
          </button>
        </div>
      </div>
    </div>
  );
};
