import React, { useState } from 'react';
import { User, Sparkles, Check, Play, RefreshCw, X } from 'lucide-react';
import { GameSaveData, PlayerCustomization } from '../types/game';
import { INITIAL_SAVE_DATA } from '../data/defaultData';
import { sound } from '../audio/soundEngine';

interface Props {
  onStartGame: (newSave: GameSaveData) => void;
  onClose?: () => void;
}

export const NewGameModal: React.FC<Props> = ({ onStartGame, onClose }) => {
  const [name, setName] = useState('Rahul');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [skinTone, setSkinTone] = useState('#c68642');
  const [outfitStyle, setOutfitStyle] = useState<'kurta' | 'shirt_trousers' | 'casual_tee'>('kurta');
  const [outfitColor, setOutfitColor] = useState('#1e3a8a');
  const [pantsColor, setPantsColor] = useState('#f8fafc');
  const [familyOrigin, setFamilyOrigin] = useState<'Barua' | 'Sharma' | 'Das' | 'Verma'>('Barua');
  const [gameId, setGameId] = useState(`IND-AS-${Math.floor(Math.random() * 89999 + 10000)}`);

  const skinTones = ['#f5d0a9', '#d2996c', '#c68642', '#8d5524', '#59381e'];
  const outfitColors = [
    { name: 'Royal Blue', val: '#1e3a8a' },
    { name: 'Maroon', val: '#881337' },
    { name: 'Forest Green', val: '#14532d' },
    { name: 'Saffron Ochre', val: '#c2410c' },
    { name: 'Classic Black', val: '#0f172a' }
  ];

  const handleRandomizeId = () => {
    sound.playClick();
    setGameId(`IND-AS-${Math.floor(Math.random() * 89999 + 10000)}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playSuccessChime();

    const newSave: GameSaveData = {
      ...INITIAL_SAVE_DATA,
      savedAt: new Date().toISOString(),
      player: {
        name: name.trim() || 'Rahul',
        gender,
        skinTone,
        hairStyle: 'classic',
        outfitColor,
        pantsColor,
        outfitStyle,
        gameId,
        familyOrigin
      }
    };

    onStartGame(newSave);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-3">
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-950 via-amber-950 to-slate-950 px-6 py-5 text-center relative border-b border-amber-500/30">
          {onClose && (
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400">
            Middle Class Edition
          </span>
          <h2 className="text-2xl font-black text-white tracking-wide mt-1">
            INDIAN LIFE RP
          </h2>
          <p className="text-xs text-amber-200 italic mt-0.5">
            "Apni Zindagi Khud Banao – Your Life, Your Family, Your Future."
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* Name & Lineage */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-300">Character First Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium focus:border-amber-500 outline-none"
                placeholder="e.g. Rahul, Diganta, Priya"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-300">Family Lineage</label>
              <select
                value={familyOrigin}
                onChange={e => setFamilyOrigin(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium focus:border-amber-500 outline-none"
              >
                <option value="Barua">Barua (Assam)</option>
                <option value="Sharma">Sharma (North/East)</option>
                <option value="Das">Das (Brahmaputra Valley)</option>
                <option value="Verma">Verma (Central India)</option>
              </select>
            </div>
          </div>

          {/* Gender */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">Gender</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { val: 'male', label: 'Male (Ladka)' },
                { val: 'female', label: 'Female (Ladki)' }
              ].map(g => (
                <button
                  type="button"
                  key={g.val}
                  onClick={() => setGender(g.val as any)}
                  className={`py-2 rounded-xl border text-center font-bold transition ${
                    gender === g.val
                      ? 'bg-amber-600/30 border-amber-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Skin Tone */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">Skin Tone</label>
            <div className="flex gap-3">
              {skinTones.map(tone => (
                <button
                  type="button"
                  key={tone}
                  onClick={() => setSkinTone(tone)}
                  className={`w-9 h-9 rounded-full border-2 transition flex items-center justify-center ${
                    skinTone === tone ? 'border-amber-400 scale-110 shadow-lg' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: tone }}
                >
                  {skinTone === tone && <Check className="w-4 h-4 text-white drop-shadow" />}
                </button>
              ))}
            </div>
          </div>

          {/* Outfit Style */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">Starting Outfit Style</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'kurta', label: 'Indian Kurta-Pajama' },
                { id: 'shirt_trousers', label: 'Formal Shirt-Pant' },
                { id: 'casual_tee', label: 'College Casual Tee' }
              ].map(style => (
                <button
                  type="button"
                  key={style.id}
                  onClick={() => setOutfitStyle(style.id as any)}
                  className={`p-2 rounded-xl border text-center text-[11px] font-bold transition ${
                    outfitStyle === style.id
                      ? 'bg-amber-600/30 border-amber-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          {/* Outfit Color Palette */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">Outfit Color</label>
            <div className="flex gap-2">
              {outfitColors.map(c => (
                <button
                  type="button"
                  key={c.val}
                  onClick={() => setOutfitColor(c.val)}
                  className={`w-8 h-8 rounded-lg border-2 transition ${
                    outfitColor === c.val ? 'border-amber-400 scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c.val }}
                />
              ))}
            </div>
          </div>

          {/* Fictional Game ID Badge */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 block">Fictional Game ID (Middle-Class Citizen)</span>
              <span className="font-mono font-bold text-cyan-400 text-sm">{gameId}</span>
            </div>
            <button
              type="button"
              onClick={handleRandomizeId}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Starting Assets Overview */}
          <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl space-y-1 text-slate-300 text-[11px]">
            <div className="font-bold text-amber-400">MIDDLE-CLASS STARTING ASSETS:</div>
            <div>• Starting Bank Savings: <strong className="text-emerald-400 font-mono">₹12,000</strong></div>
            <div>• Starting Cash in Hand: <strong className="text-amber-400 font-mono">₹2,500</strong></div>
            <div>• Family: Father (Clerk), Mother (Homemaker), Brother, Sister</div>
            <div>• Starting Vehicle: Hero / Atlas Bicycle in house courtyard</div>
          </div>

          {/* Start Button */}
          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-amber-600 via-red-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-2xl font-bold text-sm uppercase tracking-wider shadow-xl shadow-amber-950/50 flex items-center justify-center gap-2 transition"
          >
            <Play className="w-4 h-4 fill-white" /> Start New Indian Life
          </button>
        </form>
      </div>
    </div>
  );
};
