import React, { useState } from 'react';
import { Briefcase, Shield, HeartPulse, Cpu, DollarSign, BookOpen, Award, CheckCircle2, X, Zap } from 'lucide-react';
import { CareerType, GameSaveData } from '../types/game';
import { CAREER_TIERS } from '../data/defaultData';
import { sound } from '../audio/soundEngine';

interface Props {
  saveData: GameSaveData;
  onUpdateSave: (updater: (prev: GameSaveData) => GameSaveData) => void;
  onClose: () => void;
}

export const CareerHubModal: React.FC<Props> = ({ saveData, onUpdateSave, onClose }) => {
  const [selectedCareer, setSelectedCareer] = useState<CareerType>(saveData.career.career !== 'none' ? saveData.career.career : 'army_defence');
  const [fitnessClicks, setFitnessClicks] = useState(0);
  const [fitnessRunning, setFitnessRunning] = useState(false);
  const [fitnessPassed, setFitnessPassed] = useState(false);
  const [dutyCompleted, setDutyCompleted] = useState(false);

  const careersList: { id: CareerType; name: string; icon: any; color: string; desc: string }[] = [
    { id: 'army_defence', name: 'Indian Army / Defence', icon: Shield, color: 'text-emerald-400', desc: 'Courage, physical endurance, national security & academy training' },
    { id: 'police', name: 'Assam State Police', icon: Shield, color: 'text-amber-400', desc: 'Law enforcement, public safety, patrolling & investigative duty' },
    { id: 'doctor', name: 'Healthcare & Doctor', icon: HeartPulse, color: 'text-rose-400', desc: 'Medical clinic, patient diagnosis, hospital duty & curing ailments' },
    { id: 'engineer', name: 'Engineering & Tech', icon: Cpu, color: 'text-cyan-400', desc: 'Infrastructure, systems programming, mechanics & project design' },
    { id: 'businessperson', name: 'Commercial Business', icon: DollarSign, color: 'text-yellow-400', desc: 'Retail store, inventory management, daily customer sales & enterprise' },
    { id: 'teacher', name: 'Education & Teaching', icon: BookOpen, color: 'text-indigo-400', desc: 'Educating village youth, school curriculum & mentorship' }
  ];

  const currentTiers = CAREER_TIERS[selectedCareer as keyof typeof CAREER_TIERS] || [];
  const isEnrolled = saveData.career.career === selectedCareer;

  const handleStartFitness = () => {
    sound.playClick();
    setFitnessClicks(0);
    setFitnessRunning(true);
    setFitnessPassed(false);

    let timeLeft = 5;
    const timer = setInterval(() => {
      timeLeft--;
      if (timeLeft <= 0) {
        clearInterval(timer);
        setFitnessRunning(false);
        setFitnessClicks(prev => {
          if (prev >= 18) {
            setFitnessPassed(true);
            sound.playSuccessChime();
          } else {
            alert(`Stamina test incomplete (${prev}/18 reps). Tap faster to build fitness!`);
          }
          return prev;
        });
      }
    }, 1000);
  };

  const handleJoinCareer = (tier: typeof currentTiers[0]) => {
    sound.playSuccessChime();
    onUpdateSave(prev => {
      const completedMissions = [...prev.completedMissionIds];
      if (!completedMissions.includes('m6_join_career')) {
        completedMissions.push('m6_join_career');
      }

      return {
        ...prev,
        career: {
          career: selectedCareer,
          designation: tier.title,
          salary: tier.salary,
          academyCompleted: true,
          promotions: 0,
          dutyPoints: 10
        },
        moneyBank: prev.moneyBank + 5000, // Signing bonus
        xp: prev.xp + 800,
        completedMissionIds: completedMissions
      };
    });
  };

  const handlePerformDuty = () => {
    sound.playSuccessChime();
    setDutyCompleted(true);
    const dailyPay = Math.round(saveData.career.salary / 30) || 1200;

    onUpdateSave(prev => ({
      ...prev,
      moneyBank: prev.moneyBank + dailyPay,
      xp: prev.xp + 200,
      career: {
        ...prev.career,
        dutyPoints: prev.career.dutyPoints + 5
      }
    }));

    setTimeout(() => setDutyCompleted(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3">
      <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 px-6 py-4 flex items-center justify-between border-b border-emerald-500/30">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-600/30 rounded-lg border border-emerald-500/50 text-emerald-400">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">
                BHARAT CAREER & VOCATIONAL PORTAL
              </h2>
              <p className="text-xs text-emerald-200">
                Defence • Civil Police • Medicine • Engineering • Business • Teaching
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

        {/* Current Career Status Banner */}
        <div className="bg-slate-950 px-6 py-3 border-b border-slate-800 flex justify-between items-center text-xs">
          <div>
            <span className="text-slate-400">Active Career: </span>
            <strong className="text-white font-mono uppercase">{saveData.career.designation || 'Aspirant'}</strong>
          </div>
          <div>
            <span className="text-slate-400">Monthly Salary: </span>
            <strong className="text-emerald-400 font-mono">₹{saveData.career.salary.toLocaleString()}/mo</strong>
          </div>
          {saveData.career.career !== 'none' && (
            <button
              onClick={handlePerformDuty}
              disabled={dutyCompleted}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-semibold transition"
            >
              {dutyCompleted ? 'Duty Logged (+Salary)' : 'Complete Today Shift'}
            </button>
          )}
        </div>

        {/* Career Selection Pills */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 grid grid-cols-3 sm:grid-cols-6 gap-2">
          {careersList.map(c => {
            const Icon = c.icon;
            const isSelected = selectedCareer === c.id;
            return (
              <button
                key={c.id}
                onClick={() => {
                  sound.playClick();
                  setSelectedCareer(c.id);
                }}
                className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-950/50 border-emerald-500 text-white shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${c.color}`} />
                <span className="text-[11px] font-bold line-clamp-1">{c.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Career Details Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
            <h3 className="font-bold text-white text-sm">
              Progression Ladder: {careersList.find(c => c.id === selectedCareer)?.name}
            </h3>
            <p className="text-xs text-slate-400">
              {careersList.find(c => c.id === selectedCareer)?.desc}
            </p>

            {/* Ranks list */}
            <div className="space-y-2 pt-2">
              {currentTiers.map((tier, idx) => {
                const canUnlock = saveData.xp >= tier.reqXP;
                return (
                  <div
                    key={idx}
                    className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-white block text-sm">{tier.title}</span>
                      <span className="text-slate-400">
                        Req XP: <strong className="text-amber-400">{tier.reqXP}</strong> • Min Age: {tier.minAge}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-slate-400 block text-[10px]">Monthly Salary</span>
                        <span className="font-mono font-bold text-emerald-400 text-sm">
                          ₹{tier.salary.toLocaleString()}
                        </span>
                      </div>

                      {saveData.career.designation === tier.title ? (
                        <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-lg font-bold text-xs flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Current Rank
                        </span>
                      ) : (
                        <button
                          disabled={!canUnlock}
                          onClick={() => handleJoinCareer(tier)}
                          className="px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white rounded-lg font-bold text-xs disabled:opacity-40 transition"
                        >
                          {canUnlock ? 'Enlist / Promote' : 'Locked (Need XP)'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Fitness Mini-Game for Defence & Police */}
          {(selectedCareer === 'army_defence' || selectedCareer === 'police') && (
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-400" /> Physical Endurance Sprint & Pushup Test
                  </h4>
                  <p className="text-[11px] text-slate-400">Tap fast 18 times in 5 seconds to pass fitness academy.</p>
                </div>

                {fitnessRunning ? (
                  <button
                    onClick={() => {
                      sound.playClick();
                      setFitnessClicks(prev => prev + 1);
                    }}
                    className="px-6 py-3 bg-amber-500 text-slate-950 font-black rounded-xl text-sm animate-bounce"
                  >
                    TAP! ({fitnessClicks}/18)
                  </button>
                ) : (
                  <button
                    onClick={handleStartFitness}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg text-xs font-bold"
                  >
                    {fitnessPassed ? '✓ Fitness Passed (Retest)' : 'Start Physical Test'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
