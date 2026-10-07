import React, { useState } from 'react';
import { 
  X, 
  Trophy, 
  Calculator, 
  Flame, 
  Dumbbell, 
  TrendingUp, 
  Zap, 
  Activity, 
  CheckCircle2, 
  Medal,
  Sparkles
} from 'lucide-react';
import { UserProfile, CompletedWorkout, PersonalRecord, MilestoneBadge } from '../types';
import { PRTrackerService } from '../services/prTrackerService';

interface PRHallOfFameModalProps {
  profile: UserProfile;
  completedWorkouts: CompletedWorkout[];
  onClose: () => void;
}

export const PRHallOfFameModal: React.FC<PRHallOfFameModalProps> = ({
  profile,
  completedWorkouts,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'hall_of_fame' | 'calculator'>('hall_of_fame');

  // Calculator state
  const [calcWeight, setCalcWeight] = useState<number>(100);
  const [calcReps, setCalcReps] = useState<number>(5);

  const e1rmBrzycki = PRTrackerService.calculate1RMBrzycki(calcWeight, calcReps);
  const e1rmEpley = PRTrackerService.calculate1RMEpley(calcWeight, calcReps);
  const repMaxTable = PRTrackerService.getRepMaxTable(e1rmBrzycki);

  // Extracted PRs and Milestones
  const personalRecords: PersonalRecord[] = PRTrackerService.extractPersonalRecords(completedWorkouts);
  const milestones: MilestoneBadge[] = PRTrackerService.getMilestones(profile, completedWorkouts);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-50/70 via-yellow-50/40 to-orange-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                PR Hall of Fame & 1RM Lab
              </h3>
              <p className="text-xs text-slate-500 font-medium">Progressive overload benchmarks & milestone trophies</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-100 bg-slate-50/60 px-5 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('hall_of_fame')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'hall_of_fame'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Medal className="w-3.5 h-3.5" />
            Trophy Room & Personal Bests
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'calculator'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            Interactive 1RM Calculator
          </button>
        </div>

        {/* Body content */}
        <div className="p-5 overflow-y-auto space-y-6">
          {activeTab === 'hall_of_fame' ? (
            <>
              {/* Personal Records Cards */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  All-Time Estimated 1RM Records
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {personalRecords.map((pr) => (
                    <div
                      key={pr.id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-amber-200 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-medium text-slate-500">{pr.exerciseName}</p>
                          <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-2xl font-black text-slate-900">{pr.estimated1RMKg}</span>
                            <span className="text-xs font-bold text-amber-600">kg (1RM)</span>
                          </div>
                        </div>
                        <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs shadow-xs">
                          PR
                        </div>
                      </div>
                      <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Achieved: <strong>{pr.weightKg}kg × {pr.reps} reps</strong></span>
                        <span className="text-slate-400">{pr.achievedDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Milestone Trophies */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Athletic Milestones & Badges
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {milestones.map((m) => (
                    <div
                      key={m.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        m.unlocked
                          ? 'bg-gradient-to-br from-amber-50/50 to-white border-amber-200/80 shadow-xs'
                          : 'bg-slate-50 border-slate-200/60 opacity-70'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm shadow-xs ${
                            m.unlocked
                              ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-white shadow-amber-500/20'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          <Trophy className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h5 className="font-bold text-sm text-slate-900 truncate">{m.title}</h5>
                            {m.unlocked && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{m.description}</p>
                          
                          {/* Progress */}
                          <div className="mt-2.5">
                            <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1">
                              <span>Progress</span>
                              <span>{m.progressPercent}%</span>
                            </div>
                            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  m.unlocked ? 'bg-amber-500' : 'bg-slate-400'
                                }`}
                                style={{ width: `${m.progressPercent}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Interactive 1RM Calculator */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
                  Input Weight & Reps Performed
                </span>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Weight input */}
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Weight Lifted</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={calcWeight}
                        onChange={(e) => setCalcWeight(Math.max(1, parseFloat(e.target.value) || 0))}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 text-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      />
                      <span className="text-xs font-bold text-slate-400">kg</span>
                    </div>
                  </div>

                  {/* Reps input */}
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Reps Achieved (1 - 12)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={calcReps}
                        onChange={(e) => setCalcReps(Math.max(1, Math.min(20, parseInt(e.target.value, 10) || 1)))}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 text-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      />
                      <span className="text-xs font-bold text-slate-400">reps</span>
                    </div>
                  </div>
                </div>

                {/* Estimated Output Result */}
                <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-md flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase font-bold tracking-wider text-amber-100">Estimated 1-Rep Max</p>
                    <p className="text-3xl font-black mt-0.5">{e1rmBrzycki} kg</p>
                    <p className="text-[11px] text-amber-100">Brzycki Model ({calcWeight}kg × {calcReps} reps)</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-amber-100">Epley Formula</p>
                    <p className="text-xl font-bold">{e1rmEpley} kg</p>
                    <p className="text-[11px] text-amber-100">Δ {Math.abs(e1rmBrzycki - e1rmEpley)} kg variance</p>
                  </div>
                </div>
              </div>

              {/* Rep Max Continuum Table */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Repetition Max Continuum (1RM - 12RM)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {repMaxTable.map((item) => (
                    <div key={item.reps} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-center">
                      <span className="text-[11px] font-bold text-amber-600 block">{item.reps}RM ({item.percentage}%)</span>
                      <span className="text-base font-extrabold text-slate-900">{item.weight} kg</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 active:scale-95 transition-all shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
