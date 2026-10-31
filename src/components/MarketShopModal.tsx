import React, { useState } from 'react';
import { ShoppingBag, Bike, Check, X } from 'lucide-react';
import { GameSaveData, VehicleType } from '../types/game';
import { sound } from '../audio/soundEngine';

interface Props {
  saveData: GameSaveData;
  onUpdateSave: (updater: (prev: GameSaveData) => GameSaveData) => void;
  onClose: () => void;
}

export const MarketShopModal: React.FC<Props> = ({ saveData, onUpdateSave, onClose }) => {
  const [activeTab, setActiveTab] = useState<'bazar' | 'vehicles'>('bazar');
  const [purchaseNotice, setPurchaseNotice] = useState<string | null>(null);

  const bazarItems = [
    { id: 'chai', name: 'Special Assam Kadak Chai', price: 10, icon: '☕', desc: 'Fresh brewed hot tea with ginger and cardamom' },
    { id: 'samosa', name: 'Garam Crispy Samosa', price: 15, icon: '🥟', desc: 'Delicious potato and pea snack with mint chutney' },
    { id: 'notebook', name: 'Classwork Register & Pen', price: 50, icon: '📓', desc: 'For school & college exam preparation notes' },
    { id: 'sweets', name: 'Mithai Box for Family', price: 250, icon: '🍬', desc: 'Rasgulla and Laru sweets to celebrate achievements' },
    { id: 'petrol', name: 'Petrol (1 Litre)', price: 105, icon: '⛽', desc: 'Fuel for your scooter or motorcycle' }
  ];

  const vehicleCatalog: { type: VehicleType; name: string; price: number; icon: string; topSpeed: string; desc: string }[] = [
    {
      type: 'bicycle',
      name: 'Hero / Atlas Roadster Bicycle',
      price: 3500,
      icon: '🚲',
      topSpeed: '18 km/h',
      desc: 'Classic Indian green cycle with carrier & bell. Pure zero fuel cost.'
    },
    {
      type: 'scooter',
      name: 'Desi Activa / Chetak Scooter',
      price: 45000,
      icon: '🛵',
      topSpeed: '55 km/h',
      desc: 'Comfortable step-through scooter with metal body & front luggage hook.'
    },
    {
      type: 'motorcycle',
      name: '100cc Desi Splendor Bike',
      price: 72000,
      icon: '🏍️',
      topSpeed: '75 km/h',
      desc: 'The undisputed king of middle-class Indian roads with legendary 70kmpl mileage.'
    },
    {
      type: 'car',
      name: 'Desi 800 Indian Hatchback',
      price: 250000,
      icon: '🚗',
      topSpeed: '110 km/h',
      desc: 'The iconic first family car of India. Compact, reliable, and air-conditioned.'
    }
  ];

  const handleBuyItem = (item: typeof bazarItems[0]) => {
    if (saveData.moneyCash < item.price) {
      alert(`Insufficient cash in pocket! Visit the ATM to withdraw ₹${item.price}.`);
      return;
    }

    sound.playSuccessChime();
    onUpdateSave(prev => ({
      ...prev,
      moneyCash: prev.moneyCash - item.price,
      xp: prev.xp + 40
    }));

    setPurchaseNotice(`Purchased ${item.name} for ₹${item.price}!`);
    setTimeout(() => setPurchaseNotice(null), 3000);
  };

  const handleBuyVehicle = (veh: typeof vehicleCatalog[0]) => {
    if (saveData.moneyBank < veh.price && saveData.moneyCash < veh.price) {
      alert(`Insufficient funds for ${veh.name} (₹${veh.price.toLocaleString()}). Save more money in your bank account!`);
      return;
    }

    sound.playSuccessChime();
    onUpdateSave(prev => {
      let bank = prev.moneyBank;
      let cash = prev.moneyCash;
      if (bank >= veh.price) {
        bank -= veh.price;
      } else {
        cash -= veh.price;
      }

      const completedMissions = [...prev.completedMissionIds];
      if (!completedMissions.includes('m5_buy_vehicle')) {
        completedMissions.push('m5_buy_vehicle');
      }

      return {
        ...prev,
        moneyBank: bank,
        moneyCash: cash,
        ownedVehicles: [...new Set([...prev.ownedVehicles, veh.type])],
        xp: prev.xp + 800,
        completedMissionIds: completedMissions
      };
    });

    setPurchaseNotice(`Congratulations! You now own the ${veh.name}! Ride it across the village!`);
    setTimeout(() => setPurchaseNotice(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3">
      <div className="bg-slate-900 border border-orange-500/40 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-950 via-amber-950 to-slate-900 px-6 py-4 flex items-center justify-between border-b border-orange-500/30">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-orange-600/30 rounded-lg border border-orange-500/50 text-orange-400">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">
                GRAMIN BAZAR & AUTOMOBILES
              </h2>
              <p className="text-xs text-orange-200">
                Sharma Kirana Store • Village Tea Stall • Desi Auto Dealership
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
            { id: 'bazar', label: 'Kirana & Chai Stall', icon: ShoppingBag },
            { id: 'vehicles', label: 'Desi Vehicle Dealership', icon: Bike }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sound.playClick();
                  setActiveTab(tab.id as any);
                }}
                className={`flex items-center space-x-2 px-4 py-2 text-xs font-semibold rounded-t-lg transition border-t border-x ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-orange-400 border-orange-500/40'
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
          {purchaseNotice && (
            <div className="p-3 bg-emerald-950/70 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-medium">
              {purchaseNotice}
            </div>
          )}

          {activeTab === 'bazar' && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                <span>Wallet Cash: <strong className="text-amber-400 font-mono">₹{saveData.moneyCash.toLocaleString()}</strong></span>
                <span className="text-slate-400">Sharma Kirana: "Namaste, bhai! What can I pack for you?"</span>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {bazarItems.map(item => (
                  <div key={item.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <h4 className="font-bold text-white text-xs">{item.name}</h4>
                        <p className="text-[11px] text-slate-400">{item.desc}</p>
                        <span className="text-amber-400 font-mono font-bold text-xs mt-1 block">₹{item.price}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleBuyItem(item)}
                      className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-bold transition flex-shrink-0"
                    >
                      Buy
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'vehicles' && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                <span>Bank Balance: <strong className="text-emerald-400 font-mono">₹{saveData.moneyBank.toLocaleString()}</strong></span>
                <span className="text-slate-400">All vehicles include in-game RC & Helmet</span>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {vehicleCatalog.map(veh => {
                  const isOwned = saveData.ownedVehicles.includes(veh.type);
                  return (
                    <div
                      key={veh.type}
                      className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-3xl">{veh.icon}</span>
                          {isOwned ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1">
                              <Check className="w-3 h-3" /> In Garage
                            </span>
                          ) : (
                            <span className="font-mono font-bold text-amber-400 text-sm">
                              ₹{veh.price.toLocaleString()}
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-white text-sm pt-2">{veh.name}</h4>
                        <p className="text-[11px] text-slate-400">{veh.desc}</p>
                        <span className="text-[11px] text-cyan-300 block pt-1">Top Speed: {veh.topSpeed}</span>
                      </div>

                      {!isOwned ? (
                        <button
                          onClick={() => handleBuyVehicle(veh)}
                          className="w-full py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 text-white rounded-lg text-xs font-bold transition mt-3"
                        >
                          Buy Vehicle
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            sound.playHorn(veh.type === 'scooter' ? 'scooter' : veh.type === 'car' ? 'car' : 'bike');
                            onClose();
                          }}
                          className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg text-xs font-bold transition mt-3"
                        >
                          Ride Now
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
