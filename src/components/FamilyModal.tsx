import React, { useState } from 'react';
import { Users, Heart, Coffee, Home, Sparkles, Check, X, ShieldCheck } from 'lucide-react';
import { GameSaveData, HouseUpgrades } from '../types/game';
import { sound } from '../audio/soundEngine';

interface Props {
  saveData: GameSaveData;
  onUpdateSave: (updater: (prev: GameSaveData) => GameSaveData) => void;
  onClose: () => void;
}

export const FamilyModal: React.FC<Props> = ({ saveData, onUpdateSave, onClose }) => {
  const [activeTab, setActiveTab] = useState<'talk' | 'upgrades' | 'activities'>('talk');
  const [selectedMember, setSelectedMember] = useState<'father' | 'mother' | 'brother' | 'sister'>('father');
  const [dialogueMessage, setDialogueMessage] = useState<string | null>(null);

  const familyMembers = Object.values(saveData.family);
  const currentMember = saveData.family[selectedMember];

  const handleTalk = (topic: 'study' | 'career' | 'blessing' | 'life') => {
    sound.playClick();
    let reply = '';

    if (selectedMember === 'father') {
      if (topic === 'career') reply = `Beta, whether you join the Army, Police, become a Doctor, or do business — work with 100% integrity. The pride of our middle-class family is in your hands.`;
      else if (topic === 'study') reply = `Focus on your daily practice and exams at Saraswati High School. Education is the greatest ladder for us.`;
      else if (topic === 'blessing') reply = `Ayushmaan bhava! May God grant you wisdom and patience in every challenge.`;
      else reply = `The family is doing well, beta. Do not stress yourself too much. Remember to deposit savings in the bank.`;
    } else if (selectedMember === 'mother') {
      if (topic === 'career') reply = `My blessings are always with you. Keep your health first, don't forget to eat timely meals.`;
      else if (topic === 'study') reply = `I have made hot pitha and Assam tea for you. Study diligently, God will surely reward you!`;
      else if (topic === 'blessing') reply = `Jug jug jiyo mere bacche! May no evil eye ever touch you.`;
      else reply = `When you succeed in life, that will be the happiest day for me and Papa.`;
    } else if (selectedMember === 'brother') {
      if (topic === 'study') reply = `Bhaiya, teach me physics numericals after dinner! I want to score 90% like you!`;
      else if (topic === 'career') reply = `When you become an Officer or Doctor, can you take me for a ride around Guwahati city?`;
      else reply = `Let us go to the river bridge this evening and watch the Brahmaputra sunset!`;
    } else {
      // Sister
      if (topic === 'career') reply = `Bhaiya, you are setting such an inspiring example for me in college!`;
      else if (topic === 'study') reply = `I prepared notes for general knowledge from the Cyber Cafe library. You can read them too.`;
      else reply = `Mummy was saying we should save for an inverter so our lights stay on during monsoons.`;
    }

    setDialogueMessage(reply);
    sound.playSuccessChime();

    onUpdateSave(prev => {
      const completedMissions = [...prev.completedMissionIds];
      if (!completedMissions.includes('m1_greet_family')) {
        completedMissions.push('m1_greet_family');
      }

      const updatedFam = { ...prev.family };
      if (updatedFam[selectedMember]) {
        updatedFam[selectedMember] = {
          ...updatedFam[selectedMember],
          relationship: Math.min(100, updatedFam[selectedMember].relationship + 5)
        };
      }

      return {
        ...prev,
        xp: prev.xp + 80,
        family: updatedFam,
        completedMissionIds: completedMissions
      };
    });
  };

  const handleHaveTea = () => {
    sound.playSuccessChime();
    setDialogueMessage(`The whole family gathered at the veranda for steaming Assam tea, samosas, and warm conversation. (+100 XP, +10 Family Bond)`);
    onUpdateSave(prev => {
      const updatedFam = { ...prev.family };
      for (const key of Object.keys(updatedFam)) {
        updatedFam[key].relationship = Math.min(100, updatedFam[key].relationship + 8);
      }
      return {
        ...prev,
        xp: prev.xp + 100,
        family: updatedFam
      };
    });
  };

  const upgradesList: { key: keyof HouseUpgrades; name: string; price: number; desc: string; icon: string }[] = [
    { key: 'cooler', name: 'Desert Air Cooler', price: 8000, desc: 'Keeps the family room cool during humid Assam summers', icon: '❄️' },
    { key: 'almirah', name: 'Godrej Steel Almirah', price: 12000, desc: 'Traditional heavy steel wardrobe for parents certificates and savings', icon: '🚪' },
    { key: 'tv', name: '43" LED Smart Color TV', price: 15000, desc: 'Family gathers to watch evening news, cricket, and movies', icon: '📺' },
    { key: 'inverter', name: 'Pure Sinewave Power Inverter', price: 18000, desc: '24/7 backup power for lights and fans during village load shedding', icon: '⚡' },
    { key: 'familyMotorcycle', name: 'Family 100cc Commuter Bike', price: 75000, desc: 'Reliable vehicle for Papa and the whole household errands', icon: '🏍️' },
    { key: 'puccaRoof', name: 'Pucca Reinforced Concrete Roof', price: 120000, desc: 'Permanent solid roof replacing tin sheets, securing family for generations', icon: '🏛️' }
  ];

  const handleBuyUpgrade = (item: typeof upgradesList[0]) => {
    if (saveData.moneyBank < item.price && saveData.moneyCash < item.price) {
      alert(`Insufficient funds for ${item.name} (₹${item.price.toLocaleString()}). Save more through career or business!`);
      return;
    }

    sound.playSuccessChime();
    onUpdateSave(prev => {
      let bank = prev.moneyBank;
      let cash = prev.moneyCash;
      if (bank >= item.price) {
        bank -= item.price;
      } else {
        cash -= item.price;
      }

      const completedMissions = [...prev.completedMissionIds];
      if (!completedMissions.includes('m7_upgrade_home')) {
        completedMissions.push('m7_upgrade_home');
      }

      return {
        ...prev,
        moneyBank: bank,
        moneyCash: cash,
        xp: prev.xp + 600,
        houseUpgrades: {
          ...prev.houseUpgrades,
          [item.key]: true
        },
        completedMissionIds: completedMissions
      };
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3">
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-950 via-red-950 to-slate-900 px-6 py-4 flex items-center justify-between border-b border-amber-500/30">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-600/30 rounded-lg border border-amber-500/50 text-amber-400">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">
                APNA PARIWAR (FAMILY HOME)
              </h2>
              <p className="text-xs text-amber-200">
                Barua Niwas • The Heart and Foundation of Your Life Journey
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="bg-slate-950 px-6 pt-2 flex space-x-2 border-b border-slate-800">
          {[
            { id: 'talk', label: 'Talk With Family', icon: Users },
            { id: 'upgrades', label: 'House Upgrades', icon: Sparkles },
            { id: 'activities', label: 'Family Tea & Chores', icon: Coffee }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sound.playClick();
                  setActiveTab(tab.id as any);
                }}
                className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition border-t border-x ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-amber-400 border-amber-500/40'
                    : 'text-slate-400 border-transparent hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'talk' && (
            <div className="space-y-4">
              {/* Member Selector Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {familyMembers.map(m => {
                  const isSelected = selectedMember === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        sound.playClick();
                        setSelectedMember(m.id as any);
                        setDialogueMessage(null);
                      }}
                      className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                        isSelected
                          ? 'bg-amber-950/40 border-amber-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-xs block text-white">{m.relation}</span>
                        <span className="text-[11px] text-slate-400 block truncate">{m.name}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-1 text-[11px] text-rose-400 font-semibold">
                        <Heart className="w-3 h-3 fill-rose-500" /> {m.relationship}%
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Member Profile & Dialogue */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <h3 className="text-base font-bold text-amber-300">{currentMember.name} ({currentMember.relation})</h3>
                    <p className="text-slate-400">{currentMember.occupation} • Mood: <span className="text-emerald-400 font-semibold">{currentMember.currentMood}</span></p>
                  </div>
                  <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 font-mono">
                    Bond: {currentMember.relationship}%
                  </div>
                </div>

                {dialogueMessage && (
                  <div className="p-3.5 bg-amber-950/30 border border-amber-500/40 rounded-xl text-xs text-amber-200 leading-relaxed font-sans italic">
                    "{dialogueMessage}"
                  </div>
                )}

                {/* Conversation Topic Options */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {[
                    { id: 'blessing', label: 'Touch Feet & Seek Blessings' },
                    { id: 'study', label: 'Discuss Studies & School' },
                    { id: 'career', label: 'Share Career Ambition' },
                    { id: 'life', label: 'Ask About Household' }
                  ].map(topic => (
                    <button
                      key={topic.id}
                      onClick={() => handleTalk(topic.id as any)}
                      className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 rounded-lg text-xs font-semibold text-slate-200 text-left transition"
                    >
                      {topic.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'upgrades' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-slate-400 flex justify-between items-center">
                <span>Family Prosperity (Ghar Ka Vikas)</span>
                <span>Bank Balance: <strong className="text-emerald-400 font-mono">₹{saveData.moneyBank.toLocaleString()}</strong></span>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {upgradesList.map(item => {
                  const isOwned = saveData.houseUpgrades[item.key];
                  return (
                    <div
                      key={item.key}
                      className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-lg">{item.icon}</span>
                          {isOwned ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1">
                              <Check className="w-3 h-3" /> Installed
                            </span>
                          ) : (
                            <span className="font-mono font-bold text-amber-400 text-xs">
                              ₹{item.price.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-white text-xs pt-1">{item.name}</h4>
                        <p className="text-[11px] text-slate-400">{item.desc}</p>
                      </div>

                      {!isOwned && (
                        <button
                          onClick={() => handleBuyUpgrade(item)}
                          className="w-full py-2 bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 text-white rounded-lg text-xs font-bold transition mt-2"
                        >
                          Buy for Family
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'activities' && (
            <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl space-y-4 text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Coffee className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-white text-base">Evening Family Chai & Adda</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Sit with Papa, Mummy, Bhai, and Behen on the veranda. Drink Assam tea, discuss daily news, and strengthen family relationships.
                </p>
              </div>

              <button
                onClick={handleHaveTea}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-amber-950/40"
              >
                Brew Garam Chai with Family (+100 XP)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
