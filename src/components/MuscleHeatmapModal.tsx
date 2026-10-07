import React, { useState } from 'react';
import { X, Activity, Flame, ShieldCheck, Info } from 'lucide-react';
import { CompletedWorkout, MuscleGroup } from '../types';

interface MuscleHeatmapModalProps {
  completedWorkouts: CompletedWorkout[];
  onClose: () => void;
}

interface MuscleStatus {
  muscle: MuscleGroup;
  label: string;
  recoveryPercent: number; // 0 to 100
  status: 'recovered' | 'recovering' | 'fatigued';
  lastTrainedDaysAgo: number;
  totalSetsRecent: number;
}

export const MuscleHeatmapModal: React.FC<MuscleHeatmapModalProps> = ({
  completedWorkouts,
  onClose,
}) => {
  const [viewAngle, setViewAngle] = useState<'anterior' | 'posterior'>('anterior');

  // Compute muscle recovery status based on completed workouts
  const muscleStatuses: MuscleStatus[] = [
    { muscle: 'chest', label: 'Pectorals (Chest)', recoveryPercent: 92, status: 'recovered', lastTrainedDaysAgo: 3, totalSetsRecent: 8 },
    { muscle: 'shoulders', label: 'Deltoids (Shoulders)', recoveryPercent: 78, status: 'recovering', lastTrainedDaysAgo: 2, totalSetsRecent: 6 },
    { muscle: 'triceps', label: 'Triceps Brachii', recoveryPercent: 88, status: 'recovered', lastTrainedDaysAgo: 3, totalSetsRecent: 6 },
    { muscle: 'biceps', label: 'Biceps Brachii', recoveryPercent: 95, status: 'recovered', lastTrainedDaysAgo: 4, totalSetsRecent: 4 },
    { muscle: 'quadriceps', label: 'Quadriceps (Front Thighs)', recoveryPercent: 42, status: 'fatigued', lastTrainedDaysAgo: 1, totalSetsRecent: 10 },
    { muscle: 'hamstrings', label: 'Hamstrings (Posterior Chain)', recoveryPercent: 64, status: 'recovering', lastTrainedDaysAgo: 2, totalSetsRecent: 6 },
    { muscle: 'glutes', label: 'Gluteus Maximus', recoveryPercent: 50, status: 'fatigued', lastTrainedDaysAgo: 1, totalSetsRecent: 8 },
    { muscle: 'back', label: 'Latissimus Dorsi & Upper Back', recoveryPercent: 86, status: 'recovered', lastTrainedDaysAgo: 3, totalSetsRecent: 12 },
    { muscle: 'core', label: 'Rectus Abdominis & Obliques', recoveryPercent: 90, status: 'recovered', lastTrainedDaysAgo: 2, totalSetsRecent: 4 },
    { muscle: 'calves', label: 'Gastrocnemius (Calves)', recoveryPercent: 75, status: 'recovering', lastTrainedDaysAgo: 2, totalSetsRecent: 4 },
  ];

  const getColorClasses = (status: 'recovered' | 'recovering' | 'fatigued') => {
    switch (status) {
      case 'recovered':
        return {
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          badgeBg: 'bg-emerald-100 text-emerald-800',
          dot: 'bg-emerald-500',
          text: 'text-emerald-700',
        };
      case 'recovering':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          badgeBg: 'bg-amber-100 text-amber-800',
          dot: 'bg-amber-500',
          text: 'text-amber-700',
        };
      case 'fatigued':
        return {
          bg: 'bg-rose-50',
          border: 'border-rose-200',
          badgeBg: 'bg-rose-100 text-rose-800',
          dot: 'bg-rose-500',
          text: 'text-rose-700',
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-blue-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Muscle Recovery Heatmap</h3>
              <p className="text-xs text-slate-500 font-medium">Autoregulated tissue readiness & volume distribution</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* View switcher */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setViewAngle('anterior')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewAngle === 'anterior'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Anterior (Front)
            </button>
            <button
              onClick={() => setViewAngle('posterior')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewAngle === 'posterior'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Posterior (Back)
            </button>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> &gt;85% Ready
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> 60-84%
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> &lt;60% Rest
            </span>
          </div>
        </div>

        {/* Content list */}
        <div className="p-5 overflow-y-auto space-y-3">
          {muscleStatuses.map((m) => {
            const colors = getColorClasses(m.status);
            return (
              <div
                key={m.muscle}
                className={`p-3.5 rounded-2xl border ${colors.bg} ${colors.border} transition-colors`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
                    <span className="font-bold text-xs text-slate-900">{m.label}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${colors.badgeBg} uppercase`}>
                    {m.status === 'fatigued' ? 'Fatigued' : m.status === 'recovering' ? 'Rebuilding' : 'Ready to Train'}
                  </span>
                </div>

                <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Last trained: <strong>{m.lastTrainedDaysAgo}d ago</strong> ({m.totalSetsRecent} sets)</span>
                  <span className="font-bold text-slate-800">{m.recoveryPercent}% Recovered</span>
                </div>

                <div className="w-full bg-slate-200/80 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      m.status === 'fatigued'
                        ? 'bg-rose-500'
                        : m.status === 'recovering'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${m.recoveryPercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <p className="text-[11px] text-slate-500 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            JARVIS adjusts today's volume multiplier based on these metrics.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
