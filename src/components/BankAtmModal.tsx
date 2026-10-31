import React, { useState } from 'react';
import { Landmark, CreditCard, ArrowDownRight, ArrowUpRight, CheckCircle2, X, RefreshCw } from 'lucide-react';
import { GameSaveData } from '../types/game';
import { sound } from '../audio/soundEngine';

interface Props {
  saveData: GameSaveData;
  onUpdateSave: (updater: (prev: GameSaveData) => GameSaveData) => void;
  onClose: () => void;
}

export const BankAtmModal: React.FC<Props> = ({ saveData, onUpdateSave, onClose }) => {
  const [activeTab, setActiveTab] = useState<'atm' | 'deposit' | 'passbook'>('atm');
  const [customAmount, setCustomAmount] = useState('');
  const [transactionSuccess, setTransactionSuccess] = useState<string | null>(null);

  const handleWithdraw = (amount: number) => {
    if (saveData.moneyBank < amount) {
      alert(`Insufficient balance in bank account to withdraw ₹${amount}.`);
      return;
    }

    sound.playCashDispense();
    onUpdateSave(prev => {
      const completedMissions = [...prev.completedMissionIds];
      if (!completedMissions.includes('m4_atm_visit')) {
        completedMissions.push('m4_atm_visit');
      }

      return {
        ...prev,
        moneyBank: prev.moneyBank - amount,
        moneyCash: prev.moneyCash + amount,
        xp: prev.xp + 50,
        completedMissionIds: completedMissions
      };
    });

    setTransactionSuccess(`Successfully withdrawn ₹${amount.toLocaleString()} from ATM! Cash added to your wallet.`);
    setTimeout(() => setTransactionSuccess(null), 3500);
  };

  const handleDeposit = (amount: number) => {
    if (saveData.moneyCash < amount) {
      alert(`Insufficient cash in wallet to deposit ₹${amount}.`);
      return;
    }

    sound.playSuccessChime();
    onUpdateSave(prev => ({
      ...prev,
      moneyCash: prev.moneyCash - amount,
      moneyBank: prev.moneyBank + amount,
      xp: prev.xp + 50
    }));

    setTransactionSuccess(`Successfully deposited ₹${amount.toLocaleString()} into your savings account!`);
    setTimeout(() => setTransactionSuccess(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3">
      <div className="bg-slate-900 border border-sky-500/40 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-900 via-blue-950 to-slate-900 px-6 py-4 flex items-center justify-between border-b border-sky-500/30">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-sky-600/30 rounded-lg border border-sky-500/50 text-sky-400">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">
                STATE GRAMIN BANK & 24x7 ATM
              </h2>
              <p className="text-xs text-sky-200">
                Safe Middle-Class Banking • Instant Cash Kiosk
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

        {/* Balance Overview Cards */}
        <div className="p-6 bg-slate-950 border-b border-slate-800 grid grid-cols-2 gap-4">
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-xs block">Bank Savings Balance</span>
            <span className="text-xl font-bold font-mono text-emerald-400">
              ₹{saveData.moneyBank.toLocaleString()}
            </span>
          </div>
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-xs block">Cash in Wallet</span>
            <span className="text-xl font-bold font-mono text-amber-400">
              ₹{saveData.moneyCash.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="bg-slate-900 px-6 pt-2 flex space-x-2 border-b border-slate-800">
          {[
            { id: 'atm', label: 'ATM Cash Withdrawal', icon: CreditCard },
            { id: 'deposit', label: 'Cash Deposit', icon: ArrowUpRight },
            { id: 'passbook', label: 'Passbook & Statement', icon: RefreshCw }
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
                    ? 'bg-slate-950 text-sky-400 border-sky-500/40'
                    : 'text-slate-400 border-transparent hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {transactionSuccess && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{transactionSuccess}</span>
            </div>
          )}

          {activeTab === 'atm' && (
            <div className="space-y-4">
              <div className="p-4 bg-sky-950/30 border border-sky-500/30 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-sky-300 font-semibold uppercase tracking-wider block">RuPay Debit Card Inserted</span>
                  <span className="text-xs text-slate-400 font-mono">XXXX-XXXX-8429 • {saveData.player.name}</span>
                </div>
                <div className="text-xs text-emerald-400 font-bold px-2.5 py-1 bg-emerald-500/20 rounded-md">
                  PIN VERIFIED
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fast Cash Withdrawal</span>
                <div className="grid grid-cols-2 gap-3">
                  {[500, 1000, 2000, 5000].map(amt => (
                    <button
                      key={amt}
                      onClick={() => handleWithdraw(amt)}
                      className="p-3.5 bg-slate-950 hover:bg-sky-950 border border-slate-800 hover:border-sky-500 text-white font-mono font-bold text-sm rounded-xl transition flex items-center justify-between"
                    >
                      <span>₹{amt.toLocaleString()}</span>
                      <ArrowDownRight className="w-4 h-4 text-sky-400" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'deposit' && (
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Deposit Cash into Account</span>
              <div className="grid grid-cols-2 gap-3">
                {[500, 1000, 2000, 5000].map(amt => (
                  <button
                    key={amt}
                    onClick={() => handleDeposit(amt)}
                    className="p-3.5 bg-slate-950 hover:bg-emerald-950 border border-slate-800 hover:border-emerald-500 text-white font-mono font-bold text-sm rounded-xl transition flex items-center justify-between"
                  >
                    <span>Deposit ₹{amt.toLocaleString()}</span>
                    <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'passbook' && (
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>ACCOUNT HOLDER:</span>
                  <strong className="text-white">{saveData.player.name}</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>ACCOUNT NUMBER:</span>
                  <strong className="text-cyan-400">SBIN00294184920</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>BRANCH:</span>
                  <span className="text-white">Borpeta Rural, Assam</span>
                </div>
              </div>

              <div className="border border-slate-800 rounded-lg overflow-hidden">
                <div className="bg-slate-800 p-2 text-[11px] font-sans font-bold text-slate-300 grid grid-cols-3">
                  <span>Description</span>
                  <span className="text-center">Type</span>
                  <span className="text-right">Amount</span>
                </div>
                <div className="p-3 bg-slate-950 divide-y divide-slate-900 text-slate-300">
                  <div className="py-2 grid grid-cols-3 items-center">
                    <span>Initial Savings</span>
                    <span className="text-center text-emerald-400 font-bold">CREDIT</span>
                    <span className="text-right font-mono text-emerald-400">+₹12,000</span>
                  </div>
                  <div className="py-2 grid grid-cols-3 items-center">
                    <span>Cyber Cafe Form Fee</span>
                    <span className="text-center text-rose-400 font-bold">DEBIT</span>
                    <span className="text-right font-mono text-rose-400">-₹250</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
