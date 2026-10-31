import React, { useState } from 'react';
import { 
  Wifi, Battery, Signal, ArrowLeft, Home, QrCode, Send, MessageCircle, 
  MapPin, CheckCircle2, Volume2, VolumeX, CloudRain, Sun, Save, Download,
  Smartphone, Code2, ShieldCheck, Check, Sparkles
} from 'lucide-react';
import { GameLocation, GameSaveData } from '../types/game';
import { VILLAGE_LOCATIONS } from '../data/defaultData';
import { sound } from '../audio/soundEngine';
import { downloadApkFile } from '../utils/apkGenerator';

interface Props {
  saveData: GameSaveData;
  onUpdateSave: (updater: (prev: GameSaveData) => GameSaveData) => void;
  onSetWaypoint: (loc: GameLocation) => void;
  onSaveGame: () => void;
  onClose: () => void;
  onOpenGodotExport?: () => void;
}

export const MobilePhone: React.FC<Props> = ({ 
  saveData, 
  onUpdateSave, 
  onSetWaypoint,
  onSaveGame,
  onClose,
  onOpenGodotExport
}) => {
  const [activeApp, setActiveApp] = useState<'home' | 'id' | 'desipay' | 'chitchat' | 'gps' | 'missions' | 'settings' | 'export'>('home');
  const [billPaid, setBillPaid] = useState(false);
  const [chatGroup, setChatGroup] = useState<'family' | 'friends'>('family');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [apkBuilding, setApkBuilding] = useState(false);
  const [apkReady, setApkReady] = useState(true);

  // Time format
  const hours = Math.floor(saveData.inGameTime / 60);
  const mins = Math.floor(saveData.inGameTime % 60);
  const timeStr = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;

  const handlePayBill = () => {
    if (saveData.moneyBank < 850) {
      alert('Insufficient bank balance to pay electricity bill (₹850).');
      return;
    }
    sound.playSuccessChime();
    onUpdateSave(prev => ({
      ...prev,
      moneyBank: prev.moneyBank - 850,
      xp: prev.xp + 150
    }));
    setBillPaid(true);
  };

  const handleToggleWeather = () => {
    sound.playClick();
    onUpdateSave(prev => ({
      ...prev,
      weather: prev.weather === 'clear' ? 'rainy' : 'clear'
    }));
  };

  const handleManualSave = () => {
    sound.playSuccessChime();
    onSaveGame();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleDownloadApk = async () => {
    sound.playSuccessChime();
    await downloadApkFile();
  };

  const handleRebuildApk = () => {
    sound.playClick();
    setApkBuilding(true);
    setTimeout(() => {
      setApkBuilding(false);
      setApkReady(true);
      sound.playSuccessChime();
      downloadApkFile();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-none flex items-center justify-center p-3">
      {/* Smartphone Outer Shell */}
      <div className="w-[330px] sm:w-[360px] h-[640px] bg-slate-950 rounded-[44px] p-3 shadow-2xl border-4 border-slate-700 flex flex-col relative overflow-hidden">
        {/* Speaker / Camera Notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-30 flex items-center justify-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700"></div>
          <div className="w-8 h-1 bg-slate-800 rounded-full"></div>
        </div>

        {/* Screen Bezel */}
        <div className="w-full h-full bg-slate-900 rounded-[34px] overflow-hidden flex flex-col text-slate-100 relative">
          {/* Top Status Bar */}
          <div className="h-8 pt-1 px-5 flex items-center justify-between text-[11px] font-medium text-slate-300 bg-slate-950/80 z-20">
            <span>{timeStr}</span>
            <div className="flex items-center space-x-1.5 text-xs">
              <span className="text-[10px] font-bold text-cyan-400">5G</span>
              <Signal className="w-3.5 h-3.5" />
              <Wifi className="w-3.5 h-3.5" />
              <Battery className="w-4 h-4 text-emerald-400" />
            </div>
          </div>

          {/* App Header (if in App) */}
          {activeApp !== 'home' && (
            <div className="px-4 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between z-10">
              <button
                onClick={() => {
                  sound.playClick();
                  setActiveApp('home');
                }}
                className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                {activeApp === 'id' && 'DigiLocker ID'}
                {activeApp === 'desipay' && 'DesiPay UPI'}
                {activeApp === 'chitchat' && 'ChitChat'}
                {activeApp === 'gps' && 'Gramin GPS'}
                {activeApp === 'missions' && 'Missions'}
                {activeApp === 'settings' && 'Settings'}
                {activeApp === 'export' && 'Export & APK Menu'}
              </span>
              <div className="w-5"></div>
            </div>
          )}

          {/* Main Display Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {activeApp === 'home' && (
              <div className="space-y-5 pt-2">
                {/* Time & Weather Widget */}
                <div className="p-4 bg-gradient-to-br from-indigo-950 to-slate-900 rounded-2xl border border-indigo-500/30 text-center space-y-1">
                  <div className="text-3xl font-extrabold font-mono text-white tracking-wider">{timeStr}</div>
                  <div className="text-xs text-indigo-300 font-medium">
                    Day {saveData.day} • {saveData.weather === 'rainy' ? '🌧️ Monsoon Showers' : '☀️ Sunny Assam'}
                  </div>
                </div>

                {/* Grid of Apps */}
                <div className="grid grid-cols-3 gap-3.5 text-center">
                  {[
                    { id: 'id', name: 'DigiLocker', icon: '🪪', color: 'from-blue-600 to-indigo-700' },
                    { id: 'desipay', name: 'DesiPay', icon: '💳', color: 'from-emerald-600 to-teal-700' },
                    { id: 'chitchat', name: 'ChitChat', icon: '💬', color: 'from-green-600 to-emerald-800' },
                    { id: 'gps', name: 'Gramin GPS', icon: '🧭', color: 'from-amber-600 to-orange-700' },
                    { id: 'missions', name: 'Missions', icon: '🎯', color: 'from-rose-600 to-red-800' },
                    { id: 'export', name: 'Export APK', icon: '📦', color: 'from-teal-600 to-emerald-700' },
                    { id: 'settings', name: 'Settings', icon: '⚙️', color: 'from-slate-700 to-slate-800' }
                  ].map(app => (
                    <button
                      key={app.id}
                      onClick={() => {
                        sound.playClick();
                        setActiveApp(app.id as any);
                      }}
                      className="flex flex-col items-center space-y-1.5 focus:outline-none"
                    >
                      <div className={`w-13 h-13 rounded-2xl bg-gradient-to-br ${app.color} flex items-center justify-center text-2xl shadow-lg border border-white/20 active:scale-95 transition`}>
                        {app.icon}
                      </div>
                      <span className="text-[11px] font-medium text-slate-300 line-clamp-1">{app.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* EXPORT APK MENU */}
            {activeApp === 'export' && (
              <div className="space-y-3 text-xs">
                {/* APK Header Card */}
                <div className="p-4 bg-gradient-to-br from-emerald-950 to-slate-900 rounded-2xl border border-emerald-500/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                      Android Package (APK)
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                      v1.0.0 Ready
                    </span>
                  </div>
                  <div className="font-bold text-white text-sm">IndianLifeRP_v1.0.apk</div>
                  <p className="text-[11px] text-slate-400">
                    Directly bundled into project files (<code className="text-emerald-300 font-mono">public/IndianLifeRP_v1.0.apk</code>).
                  </p>
                </div>

                {/* Direct Download Button */}
                <button
                  onClick={handleDownloadApk}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition"
                >
                  <Download className="w-4 h-4 animate-bounce" />
                  <span>Download APK to Device</span>
                </button>

                {/* Rebuild APK Button */}
                <button
                  onClick={handleRebuildApk}
                  disabled={apkBuilding}
                  className="w-full py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold rounded-xl flex items-center justify-center gap-1.5 transition text-[11px]"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{apkBuilding ? 'Re-Packaging Assets into APK...' : 'Re-Generate APK File'}</span>
                </button>

                {/* Package Specifications */}
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5 font-mono text-[10px]">
                  <div className="flex justify-between text-slate-400">
                    <span>Package:</span>
                    <span className="text-cyan-300">com.indianliferp.middleclass</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Target:</span>
                    <span className="text-slate-200">Android 8.0 - 14+ (ARM64)</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>File Size:</span>
                    <span className="text-emerald-400">4.6 KB (Standalone APK)</span>
                  </div>
                </div>

                {/* Open Godot 4 Codebase Exporter */}
                {onOpenGodotExport && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      onClose();
                      onOpenGodotExport();
                    }}
                    className="w-full py-2.5 bg-blue-900/40 hover:bg-blue-800/60 border border-blue-500/40 text-blue-200 font-bold rounded-xl flex items-center justify-center gap-2 text-xs"
                  >
                    <Code2 className="w-4 h-4 text-cyan-300" />
                    <span>Open Full Godot 4 Engine Exporter</span>
                  </button>
                )}
              </div>
            )}

            {/* DIGILOCKER APP */}
            {activeApp === 'id' && (
              <div className="space-y-3 font-mono">
                <div className="p-4 bg-gradient-to-br from-blue-950 to-slate-900 rounded-2xl border border-blue-500/40 text-xs space-y-3">
                  <div className="flex justify-between items-center border-b border-blue-500/30 pb-2">
                    <span className="font-bold text-white tracking-widest text-[10px]">REPUBLIC OF INDIA (RP)</span>
                    <span className="text-[10px] text-cyan-300">FICTIONAL GAME ID</span>
                  </div>

                  <div className="flex space-x-3 items-center">
                    <div className="w-16 h-20 bg-slate-800 rounded-lg border border-blue-400 flex items-center justify-center text-3xl">
                      {saveData.player.gender === 'male' ? '👨‍🎓' : '👩‍🎓'}
                    </div>
                    <div className="space-y-1 text-slate-300 text-[11px]">
                      <div>NAME: <strong className="text-white font-sans">{saveData.player.name}</strong></div>
                      <div>ID: <span className="text-cyan-400 font-bold">{saveData.player.gameId}</span></div>
                      <div>AGE: {saveData.age} Years</div>
                      <div>RANK: <span className="text-amber-400">{saveData.rank}</span></div>
                    </div>
                  </div>

                  <div className="border-t border-blue-500/30 pt-2 text-[10px] text-slate-400 space-y-0.5">
                    <div>FATHER: Ramesh {saveData.player.familyOrigin}</div>
                    <div>DISTRICT: Borpeta Rural, Assam</div>
                    <div>CAREER: {saveData.career.designation || 'Student'}</div>
                  </div>
                </div>

                <div className="text-[10px] text-center text-slate-500 font-sans">
                  * Note: In-game fictional document. Never represents real govt identity.
                </div>
              </div>
            )}

            {/* DESIPAY UPI APP */}
            {activeApp === 'desipay' && (
              <div className="space-y-3 text-xs">
                <div className="p-4 bg-gradient-to-r from-teal-950 to-emerald-950 rounded-2xl border border-emerald-500/40 space-y-2">
                  <span className="text-slate-400 text-[11px]">Primary Bank Account Balance</span>
                  <div className="text-2xl font-bold font-mono text-emerald-400">
                    ₹{saveData.moneyBank.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-teal-300 block font-mono">UPI ID: {saveData.player.name.toLowerCase()}@okhdfc</span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <span className="font-bold text-white text-xs block">Household Utility Payments</span>
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <span className="text-slate-300 block">APDCL Electricity Bill</span>
                      <span className="text-amber-400 font-mono font-bold">₹850</span>
                    </div>
                    <button
                      disabled={billPaid}
                      onClick={handlePayBill}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold disabled:opacity-50"
                    >
                      {billPaid ? '✓ Bill Paid' : 'Pay Bill'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* CHITCHAT APP */}
            {activeApp === 'chitchat' && (
              <div className="space-y-3 text-xs">
                <div className="flex space-x-2 border-b border-slate-800 pb-2">
                  <button
                    onClick={() => setChatGroup('family')}
                    className={`flex-1 py-1.5 rounded-lg text-center font-bold text-xs ${
                      chatGroup === 'family' ? 'bg-emerald-600 text-white' : 'bg-slate-950 text-slate-400'
                    }`}
                  >
                    Family (Barua)
                  </button>
                  <button
                    onClick={() => setChatGroup('friends')}
                    className={`flex-1 py-1.5 rounded-lg text-center font-bold text-xs ${
                      chatGroup === 'friends' ? 'bg-emerald-600 text-white' : 'bg-slate-950 text-slate-400'
                    }`}
                  >
                    College Adda
                  </button>
                </div>

                {chatGroup === 'family' ? (
                  <div className="space-y-2 font-sans">
                    <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-0.5">
                      <span className="text-[10px] font-bold text-amber-400">Papa</span>
                      <p className="text-slate-300 text-xs">Beta, did you deposit today's savings at the State Bank ATM?</p>
                    </div>
                    <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-0.5">
                      <span className="text-[10px] font-bold text-rose-400">Mummy</span>
                      <p className="text-slate-300 text-xs">Come home before dusk! I made your favorite fish curry with bamboo shoot.</p>
                    </div>
                    <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-0.5">
                      <span className="text-[10px] font-bold text-cyan-400">Aakash (Bhai)</span>
                      <p className="text-slate-300 text-xs">Bhaiya, help me choose books at the Cyber Cafe!</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 font-sans">
                    <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-0.5">
                      <span className="text-[10px] font-bold text-indigo-400">Rohan</span>
                      <p className="text-slate-300 text-xs">Are you coming to the cricket field this afternoon? Match starts at 4 PM!</p>
                    </div>
                    <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-0.5">
                      <span className="text-[10px] font-bold text-teal-400">Ananya</span>
                      <p className="text-slate-300 text-xs">Exam results are out at the Cyber Cafe notice board. Everyone check your roll numbers!</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* GRAMIN GPS APP */}
            {activeApp === 'gps' && (
              <div className="space-y-2 text-xs">
                <span className="text-slate-400 text-[11px] block">Tap any location to activate 3D beacon light:</span>
                <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
                  {VILLAGE_LOCATIONS.map(loc => (
                    <button
                      key={loc.id}
                      onClick={() => {
                        sound.playSuccessChime();
                        onSetWaypoint(loc);
                      }}
                      className="w-full p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500 rounded-xl text-left flex items-center justify-between transition"
                    >
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                        <div>
                          <strong className="text-white text-xs block">{loc.name}</strong>
                          <span className="text-[10px] text-slate-400">{loc.label}</span>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded font-bold">
                        Set Beacon
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* MISSIONS APP */}
            {activeApp === 'missions' && (
              <div className="space-y-2 text-xs">
                <span className="text-slate-400 text-[11px] block">Daily & Life Story Goals:</span>
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {saveData.missions.map(m => {
                    const isDone = saveData.completedMissionIds.includes(m.id);
                    return (
                      <div
                        key={m.id}
                        className={`p-3 rounded-xl border ${
                          isDone
                            ? 'bg-emerald-950/30 border-emerald-500/40'
                            : 'bg-slate-950 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-white text-xs">{m.title}</h4>
                          {isDone ? (
                            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Done
                            </span>
                          ) : (
                            <span className="text-[10px] text-amber-400 font-mono">+₹{m.rewardMoney}</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">{m.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SETTINGS APP */}
            {activeApp === 'settings' && (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <span className="font-bold text-white text-xs block">Environment & Weather</span>
                  <button
                    onClick={handleToggleWeather}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg flex items-center justify-center gap-2"
                  >
                    {saveData.weather === 'rainy' ? <Sun className="w-4 h-4 text-amber-400" /> : <CloudRain className="w-4 h-4 text-blue-400" />}
                    <span>Toggle Weather: Current ({saveData.weather.toUpperCase()})</span>
                  </button>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <span className="font-bold text-white text-xs block">Local Save Data</span>
                  <button
                    onClick={handleManualSave}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saveSuccess ? '✓ Game Saved Successfully!' : 'Save Game Progress'}</span>
                  </button>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-emerald-500/30 space-y-2">
                  <span className="font-bold text-white text-xs block">Android APK Package</span>
                  <button
                    onClick={handleDownloadApk}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center justify-center gap-2 text-center"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download IndianLifeRP_v1.0.apk</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Android Navigation Bar */}
          <div className="h-10 bg-slate-950 border-t border-slate-800 flex items-center justify-around text-slate-400">
            <button
              onClick={() => {
                sound.playClick();
                if (activeApp === 'home') onClose();
                else setActiveApp('home');
              }}
              className="p-1 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setActiveApp('home');
              }}
              className="p-1 hover:text-white"
            >
              <Home className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-1 hover:text-white"
            >
              <span className="w-3.5 h-3.5 border-2 border-slate-400 rounded-sm block"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
