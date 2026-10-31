import React, { useState } from 'react';
import { Monitor, Printer, FileText, CheckCircle2, DollarSign, Award, X, Briefcase, ExternalLink, Download, Smartphone } from 'lucide-react';
import { GameSaveData } from '../types/game';
import { sound } from '../audio/soundEngine';
import { downloadApkFile } from '../utils/apkGenerator';

interface Props {
  saveData: GameSaveData;
  onUpdateSave: (updater: (prev: GameSaveData) => GameSaveData) => void;
  onClose: () => void;
}

export const CyberCafeModal: React.FC<Props> = ({ saveData, onUpdateSave, onClose }) => {
  const [activeTab, setActiveTab] = useState<'jobs' | 'admissions' | 'resume' | 'business' | 'apk'>('jobs');
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [admitCardJob, setAdmitCardJob] = useState<string | null>(null);
  const [resumePrinted, setResumePrinted] = useState(false);

  const jobForms = [
    {
      id: 'defence_agniveer',
      title: 'Indian Army / Defence GD Agniveer Recruitment',
      dept: 'Ministry of Defence (Fictional In-Game)',
      fee: 250,
      eligibility: 'Class 10 / 12 Pass • Age 17.5 - 21',
      salary: '₹30,000 - ₹40,000/month',
      deadline: 'Day 30'
    },
    {
      id: 'police_si',
      title: 'Assam State Police Sub-Inspector (SI) Direct Entry',
      dept: 'State Police Recruitment Board',
      fee: 350,
      eligibility: 'Graduate / Class 12 • Physical Endurance',
      salary: '₹38,000 - ₹52,000/month',
      deadline: 'Day 25'
    },
    {
      id: 'doctor_neet',
      title: 'State Medical Services & MBBS Internship Scheme',
      dept: 'Health & Family Welfare Directorate',
      fee: 500,
      eligibility: 'Class 12 (Science stream) Pass',
      salary: '₹45,000 - ₹75,000/month',
      deadline: 'Day 45'
    },
    {
      id: 'teacher_tet',
      title: 'State Teachers Eligibility Test (TET) Examination',
      dept: 'Department of School Education',
      fee: 200,
      eligibility: 'Higher Secondary or College Degree',
      salary: '₹28,000 - ₹42,000/month',
      deadline: 'Day 20'
    }
  ];

  const handleApply = (job: typeof jobForms[0]) => {
    if (saveData.moneyBank < job.fee && saveData.moneyCash < job.fee) {
      alert(`Insufficient funds for application fee (₹${job.fee}). Visit the ATM or Bank to deposit savings!`);
      return;
    }

    sound.playClick();
    onUpdateSave(prev => {
      let cash = prev.moneyCash;
      let bank = prev.moneyBank;
      if (bank >= job.fee) {
        bank -= job.fee;
      } else {
        cash -= job.fee;
      }

      const completedMissions = [...prev.completedMissionIds];
      if (!completedMissions.includes('m3_cyber_cafe')) {
        completedMissions.push('m3_cyber_cafe');
      }

      return {
        ...prev,
        moneyCash: cash,
        moneyBank: bank,
        xp: prev.xp + 250,
        completedMissionIds: completedMissions
      };
    });

    setAppliedJobs(prev => [...prev, job.id]);
    setAdmitCardJob(job.title);
    sound.playSuccessChime();
  };

  const handlePrintResume = () => {
    sound.playCyberPrint();
    setResumePrinted(true);
    onUpdateSave(prev => ({
      ...prev,
      xp: prev.xp + 100
    }));
  };

  const handleBuyCafe = () => {
    const cost = 150000;
    if (saveData.moneyBank < cost) {
      alert(`You need ₹1,50,000 in your bank account to purchase Maa Tara Cyber Point. Keep working and saving!`);
      return;
    }

    sound.playSuccessChime();
    onUpdateSave(prev => ({
      ...prev,
      moneyBank: prev.moneyBank - cost,
      business: {
        ...prev.business,
        ownedTypes: [...prev.business.ownedTypes, 'cyber_cafe'],
        dailyRevenue: prev.business.dailyRevenue + 2400,
        employees: prev.business.employees + 1
      },
      xp: prev.xp + 1500
    }));
  };

  const isCafeOwner = saveData.business.ownedTypes.includes('cyber_cafe');

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* CRT/Cyber Header */}
        <div className="bg-gradient-to-r from-red-900 via-slate-900 to-cyan-950 px-6 py-4 flex items-center justify-between border-b border-cyan-500/30">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-red-600/30 rounded-lg border border-red-500/50 text-red-400">
              <Monitor className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
                MAA TARA CYBER POINT
                <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
                  PC #04 ACTIVE
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Online Examination Forms • Admit Cards • University Cutoffs • High-Speed Internet
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

        {/* Cyber Navigation Tabs */}
        <div className="bg-slate-950 px-6 pt-3 flex space-x-2 border-b border-slate-800 overflow-x-auto">
          {[
            { id: 'jobs', label: 'Govt & Career Forms', icon: Briefcase },
            { id: 'admissions', label: 'College Admissions', icon: ExternalLink },
            { id: 'resume', label: 'Resume & Biodata', icon: FileText },
            { id: 'apk', label: 'Download APK File', icon: Download },
            { id: 'business', label: 'Own This Cafe', icon: DollarSign }
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
                    ? 'bg-slate-900 text-cyan-400 border-cyan-500/50'
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
          {activeTab === 'jobs' && (
            <div className="space-y-4">
              <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700 text-xs text-slate-300 flex justify-between items-center">
                <span>
                  Applicant: <strong className="text-white">{saveData.player.name}</strong> ({saveData.player.gameId})
                </span>
                <span>
                  Bank Balance: <strong className="text-emerald-400 font-mono">₹{saveData.moneyBank.toLocaleString()}</strong>
                </span>
              </div>

              <div className="grid gap-3">
                {jobForms.map(job => {
                  const isApplied = appliedJobs.includes(job.id);
                  return (
                    <div
                      key={job.id}
                      className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-sm">{job.title}</h4>
                          {isApplied && (
                            <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Form Submitted
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">{job.dept}</p>
                        <div className="flex flex-wrap gap-3 text-xs text-slate-300 pt-1">
                          <span>Eligibility: <strong className="text-cyan-300">{job.eligibility}</strong></span>
                          <span>Salary: <strong className="text-emerald-300">{job.salary}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-xs text-slate-400 block">Exam Fee</span>
                          <span className="text-base font-bold font-mono text-amber-400">₹{job.fee}</span>
                        </div>

                        {isApplied ? (
                          <button
                            onClick={() => {
                              sound.playCyberPrint();
                              setAdmitCardJob(job.title);
                            }}
                            className="px-4 py-2 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                          >
                            <Printer className="w-3.5 h-3.5" /> Print Admit Card
                          </button>
                        ) : (
                          <button
                            onClick={() => handleApply(job)}
                            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-cyan-900/30 transition"
                          >
                            Fill Form & Pay
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {admitCardJob && (
                <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-emerald-400">
                    <span className="font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> OFFICIAL E-ADMIT CARD GENERATED
                    </span>
                    <button
                      onClick={() => setAdmitCardJob(null)}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Dismiss
                    </button>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-lg font-mono text-xs text-slate-300 space-y-1">
                    <div>EXAM: <span className="text-white font-bold">{admitCardJob}</span></div>
                    <div>CANDIDATE: {saveData.player.name} | ROLL NO: IND-{Math.floor(Math.random() * 89999 + 10000)}</div>
                    <div>EXAM VENUE: Saraswati Model High School Examination Wing, Borpeta Village</div>
                    <div className="text-amber-400 font-semibold pt-1">STATUS: Valid for written test & physical endurance academy</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'admissions' && (
            <div className="space-y-4">
              <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700 space-y-2">
                <h3 className="font-bold text-white text-sm">State Central University & Polytechnic Admission Portal</h3>
                <p className="text-xs text-slate-300">
                  Submit marks from your Class 10/12 Report Card to qualify for Higher Degrees (B.Tech, MBBS, B.Sc, B.A. Arts).
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { stream: 'Bachelor of Technology (B.Tech)', cutOff: '75%', field: 'Engineering', duration: '4 Years' },
                  { stream: 'MBBS & Allied Health Sciences', cutOff: '82%', field: 'Medical', duration: '5.5 Years' },
                  { stream: 'Bachelor of Science (B.Sc)', cutOff: '60%', field: 'Science & Research', duration: '3 Years' },
                  { stream: 'Bachelor of Arts / Law (B.A. LLB)', cutOff: '55%', field: 'Civil Services / Law', duration: '3 Years' }
                ].map((course, idx) => (
                  <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                    <h4 className="font-bold text-cyan-300 text-sm">{course.stream}</h4>
                    <p className="text-xs text-slate-400">Department: {course.field} • Duration: {course.duration}</p>
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-slate-300">Minimum Cut-Off: <strong className="text-amber-400">{course.cutOff}</strong></span>
                      <button
                        onClick={() => {
                          sound.playSuccessChime();
                          alert(`Application submitted to University Registry for ${course.stream}! Check your phone for counseling allotment.`);
                        }}
                        className="px-3 py-1.5 bg-cyan-700/50 hover:bg-cyan-600 text-white rounded text-xs"
                      >
                        Apply Online
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'resume' && (
            <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl space-y-4 font-mono">
              <div className="text-center border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-white uppercase">{saveData.player.name}</h3>
                <p className="text-xs text-slate-400">Fictional Game ID: {saveData.player.gameId} • Assam, India</p>
                <p className="text-xs text-slate-400">Current Life Stage: {saveData.lifeStage.toUpperCase()} • Rank: {saveData.rank}</p>
              </div>

              <div className="text-xs text-slate-300 space-y-2">
                <div>
                  <strong className="text-cyan-400">CAREER OBJECTIVE:</strong>
                  <p className="text-slate-400 font-sans text-xs">
                    Hardworking individual from an Indian middle-class background dedicated to serving the nation through defence, public service, healthcare, technology, or entrepreneurship.
                  </p>
                </div>

                <div>
                  <strong className="text-cyan-400">EDUCATION & QUALIFICATIONS:</strong>
                  <ul className="list-disc list-inside text-slate-400 space-y-1 font-sans text-xs pt-1">
                    {saveData.education.degreesEarned.map((deg, i) => (
                      <li key={i}>{deg}</li>
                    ))}
                    <li>Saraswati Vidya Niketan Model School</li>
                  </ul>
                </div>

                <div>
                  <strong className="text-cyan-400">KEY SKILLS:</strong>
                  <p className="text-slate-400 font-sans text-xs">
                    Discipline, Mathematics, Time Management, Physical Fitness, Computer Operations, Teamwork.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                <span className="text-xs text-slate-400 font-sans">
                  {resumePrinted ? '✓ Biodata successfully printed & saved!' : 'Cost: ₹20 per printout'}
                </span>
                <button
                  onClick={handlePrintResume}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 text-white rounded-lg text-xs font-sans font-bold flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" /> Print Biodata
                </button>
              </div>
            </div>
          )}

          {activeTab === 'business' && (
            <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/40">
                  <DollarSign className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Commercial Acquisition: Maa Tara Cyber Point</h3>
                  <p className="text-xs text-slate-400">
                    The owner is retiring. Buy all 8 desktop terminals, photo printers, high-speed fiber line, and shop lease.
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-900 rounded-lg space-y-1">
                  <span className="text-slate-400 block">Acquisition Cost</span>
                  <span className="text-lg font-bold font-mono text-amber-400">₹1,50,000</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-lg space-y-1">
                  <span className="text-slate-400 block">Estimated Daily Revenue</span>
                  <span className="text-lg font-bold font-mono text-emerald-400">+₹2,400 / day</span>
                </div>
              </div>

              {isCafeOwner ? (
                <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-center text-emerald-400 font-bold text-sm">
                  🎉 You are the proud owner of Maa Tara Cyber Point! Daily revenue is credited to your bank account.
                </div>
              ) : (
                <button
                  onClick={handleBuyCafe}
                  className="w-full py-3 bg-gradient-to-r from-amber-600 to-emerald-600 hover:from-amber-500 hover:to-emerald-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg transition"
                >
                  Purchase Cyber Cafe Business (₹1,50,000)
                </button>
              )}
            </div>
          )}

          {activeTab === 'apk' && (
            <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/40">
                  <Smartphone className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Direct Android APK Package (v1.0.0)</h3>
                  <p className="text-xs text-slate-400">
                    High-speed download from Maa Tara Cyber Point fiber internet connection.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="text-slate-400">File Name:</span>
                  <span className="text-white font-mono font-bold">IndianLifeRP_v1.0.apk</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="text-slate-400">Package Identifier:</span>
                  <span className="text-cyan-400 font-mono">com.indianliferp.middleclass</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="text-slate-400">File Size:</span>
                  <span className="text-emerald-400 font-mono font-bold">4.6 KB (Standalone APK)</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-400">Target Devices:</span>
                  <span className="text-amber-300">Android 8.0 to Android 14+ (ARM64/Universal)</span>
                </div>
              </div>

              <button
                onClick={async () => {
                  sound.playSuccessChime();
                  await downloadApkFile();
                }}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition"
              >
                <Download className="w-4 h-4 animate-bounce" />
                <span>Download APK to Device (IndianLifeRP_v1.0.apk)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
