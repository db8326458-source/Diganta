import React, { useState } from 'react';
import { GraduationCap, Award, BookOpen, Clock, CheckCircle2, AlertCircle, X, RotateCcw } from 'lucide-react';
import { GameSaveData } from '../types/game';
import { SCHOOL_EXAM_QUESTIONS } from '../data/defaultData';
import { sound } from '../audio/soundEngine';

interface Props {
  saveData: GameSaveData;
  onUpdateSave: (updater: (prev: GameSaveData) => GameSaveData) => void;
  onClose: () => void;
}

export const SchoolCollegeModal: React.FC<Props> = ({ saveData, onUpdateSave, onClose }) => {
  const [mode, setMode] = useState<'hub' | 'study' | 'exam' | 'report'>('hub');
  const [examIndex, setExamIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [examFinished, setExamFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [studySubject, setStudySubject] = useState<string | null>(null);

  const startExam = () => {
    sound.playSchoolBell();
    setExamIndex(0);
    setSelectedAnswers([]);
    setExamFinished(false);
    setScore(0);
    setMode('exam');
  };

  const handleSelectOption = (optionIdx: number) => {
    sound.playClick();
    const newAnswers = [...selectedAnswers];
    newAnswers[examIndex] = optionIdx;
    setSelectedAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (examIndex < SCHOOL_EXAM_QUESTIONS.length - 1) {
      setExamIndex(prev => prev + 1);
    } else {
      // Calculate final exam score
      let correctCount = 0;
      SCHOOL_EXAM_QUESTIONS.forEach((q, idx) => {
        if (selectedAnswers[idx] === q.correctIndex) {
          correctCount++;
        }
      });
      const finalScore = correctCount;
      const percentage = Math.round((correctCount / SCHOOL_EXAM_QUESTIONS.length) * 100);
      const passed = percentage >= 50;

      let division = 'Fail';
      if (percentage >= 80) division = '1st Division with Star & Distinction';
      else if (percentage >= 60) division = '1st Division';
      else if (percentage >= 50) division = '2nd Division';

      setScore(finalScore);
      setExamFinished(true);
      setMode('report');

      if (passed) {
        sound.playSuccessChime();
      }

      onUpdateSave(prev => {
        const completedMissions = [...prev.completedMissionIds];
        if (!completedMissions.includes('m2_attend_school')) {
          completedMissions.push('m2_attend_school');
        }

        const newReportCard = {
          examName: `State Board Higher Secondary Examination`,
          totalMarks: correctCount * 100,
          maxMarks: SCHOOL_EXAM_QUESTIONS.length * 100,
          percentage,
          passed,
          division,
          date: `Day ${prev.day}`
        };

        const newDegrees = [...prev.education.degreesEarned];
        if (passed && !newDegrees.includes('Higher Secondary School Certificate (Class 12)')) {
          newDegrees.push('Higher Secondary School Certificate (Class 12)');
        }

        return {
          ...prev,
          xp: prev.xp + (passed ? 500 : 150),
          skillPoints: prev.skillPoints + (passed ? 3 : 1),
          moneyCash: prev.moneyCash + (passed ? 500 : 0),
          education: {
            ...prev.education,
            reportCards: [newReportCard, ...prev.education.reportCards],
            degreesEarned: newDegrees,
            attendancePercentage: Math.min(100, prev.education.attendancePercentage + 2)
          },
          completedMissionIds: completedMissions
        };
      });
    }
  };

  const handleStudy = (subject: string) => {
    sound.playClick();
    setStudySubject(subject);
    setTimeout(() => {
      sound.playSuccessChime();
      setStudySubject(null);
      onUpdateSave(prev => ({
        ...prev,
        xp: prev.xp + 120,
        skillPoints: prev.skillPoints + 1
      }));
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3">
      <div className="bg-slate-900 border border-blue-500/40 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 px-6 py-4 flex items-center justify-between border-b border-blue-500/30">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600/30 rounded-lg border border-blue-500/50 text-blue-400">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">
                SARASWATI VIDYA NIKETAN
              </h2>
              <p className="text-xs text-blue-200">
                School & College Education Wing • Class 1 to 12 & Degree Streams
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

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {mode === 'hub' && (
            <div className="space-y-4">
              {/* Profile Card */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                <div>
                  <div className="text-slate-400">Student Name: <strong className="text-white">{saveData.player.name}</strong></div>
                  <div className="text-slate-400">Class / Stream: <strong className="text-cyan-300">Class {saveData.education.currentClass} • {saveData.education.collegeStream || 'General'}</strong></div>
                </div>
                <div className="text-right">
                  <div className="text-slate-400">Attendance: <strong className="text-emerald-400">{saveData.education.attendancePercentage}%</strong></div>
                  <div className="text-slate-400">Skill Points: <strong className="text-amber-400">{saveData.skillPoints} SP</strong></div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-5 bg-gradient-to-br from-slate-950 to-blue-950/60 border border-blue-500/30 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                    <BookOpen className="w-5 h-5" /> Classroom Practice
                  </div>
                  <p className="text-xs text-slate-300">
                    Attend daily lectures in Mathematics, Science, English, Assam History, and General Knowledge. Earn XP & Skill Points.
                  </p>
                  <button
                    onClick={() => setMode('study')}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition"
                  >
                    Enter Classroom Study
                  </button>
                </div>

                <div className="p-5 bg-gradient-to-br from-slate-950 to-amber-950/60 border border-amber-500/30 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <Award className="w-5 h-5" /> Official Board Examination
                  </div>
                  <p className="text-xs text-slate-300">
                    Sit for the 6-question state examination. Pass with distinction to qualify for top careers and university degrees!
                  </p>
                  <button
                    onClick={startExam}
                    className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition shadow-lg shadow-amber-900/30"
                  >
                    Take Board Examination Now
                  </button>
                </div>
              </div>

              {/* Previous Report Cards */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Academic Records & Report Cards</h4>
                <div className="space-y-2">
                  {saveData.education.reportCards.map((rc, idx) => (
                    <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-white block">{rc.examName}</span>
                        <span className="text-slate-400">{rc.division} • {rc.date}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-emerald-400 font-bold font-mono text-sm">{rc.percentage}%</span>
                        <span className="text-slate-400 block text-[11px]">{rc.totalMarks}/{rc.maxMarks} Marks</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {mode === 'study' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-sm">Select Subject for Practice</h3>
                <button
                  onClick={() => setMode('hub')}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  Back to Hub
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { name: 'Mathematics & Mental Ability', icon: '📐', desc: 'Algebra, Profit & Loss, Percentages' },
                  { name: 'General Science & Environment', icon: '🔬', desc: 'Photosynthesis, Energy, Human Body' },
                  { name: 'Assam & Indian History/Geography', icon: '🗺️', desc: 'Brahmaputra, Wildlife, Heritage' },
                  { name: 'English & Formal Communication', icon: '✍️', desc: 'Grammar, Official Letters, Vocabulary' }
                ].map((sub, i) => (
                  <div key={i} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{sub.icon}</span>
                      <h4 className="font-bold text-white text-xs">{sub.name}</h4>
                    </div>
                    <p className="text-[11px] text-slate-400">{sub.desc}</p>
                    <button
                      disabled={!!studySubject}
                      onClick={() => handleStudy(sub.name)}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-blue-300 rounded text-xs font-semibold disabled:opacity-50"
                    >
                      {studySubject === sub.name ? 'Attending Class...' : 'Study 1 Period (+120 XP)'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {mode === 'exam' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                <span>QUESTION {examIndex + 1} OF {SCHOOL_EXAM_QUESTIONS.length}</span>
                <span className="text-amber-400 font-semibold">{SCHOOL_EXAM_QUESTIONS[examIndex].subject}</span>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <h3 className="font-bold text-white text-sm sm:text-base leading-relaxed">
                  {SCHOOL_EXAM_QUESTIONS[examIndex].question}
                </h3>

                <div className="space-y-2 pt-2">
                  {SCHOOL_EXAM_QUESTIONS[examIndex].options.map((opt, optIdx) => {
                    const isSelected = selectedAnswers[examIndex] === optIdx;
                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectOption(optIdx)}
                        className={`w-full p-3 text-left text-xs font-medium rounded-lg border transition flex items-center justify-between ${
                          isSelected
                            ? 'bg-blue-600/30 border-blue-500 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span>{opt}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  disabled={examIndex === 0}
                  onClick={() => setExamIndex(prev => prev - 1)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold disabled:opacity-40"
                >
                  Previous
                </button>

                <button
                  disabled={selectedAnswers[examIndex] === undefined}
                  onClick={handleNextQuestion}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 text-white rounded-lg text-xs font-bold disabled:opacity-50"
                >
                  {examIndex === SCHOOL_EXAM_QUESTIONS.length - 1 ? 'Submit Examination' : 'Next Question'}
                </button>
              </div>
            </div>
          )}

          {mode === 'report' && (
            <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl space-y-4 text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Award className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white">OFFICIAL BOARD REPORT CARD</h3>
                <p className="text-xs text-slate-400">Secondary Education Board of Assam (In-Game Certification)</p>
              </div>

              <div className="p-4 bg-slate-900 rounded-xl max-w-sm mx-auto text-xs space-y-2">
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="text-slate-400">Candidate:</span>
                  <strong className="text-white">{saveData.player.name}</strong>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="text-slate-400">Questions Correct:</span>
                  <strong className="text-emerald-400 font-mono">{score} / {SCHOOL_EXAM_QUESTIONS.length}</strong>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="text-slate-400">Percentage:</span>
                  <strong className="text-emerald-400 font-mono text-sm">
                    {Math.round((score / SCHOOL_EXAM_QUESTIONS.length) * 100)}%
                  </strong>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-400">Result:</span>
                  <strong className="text-cyan-300 font-bold">
                    {Math.round((score / SCHOOL_EXAM_QUESTIONS.length) * 100) >= 50 ? 'PASSED (1st Division)' : 'REPEAT EXAM'}
                  </strong>
                </div>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={startExam}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Repeat Examination
                </button>
                <button
                  onClick={() => setMode('hub')}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold"
                >
                  Return to School
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
