import React, { useState } from 'react';
import { TrendingDown, TrendingUp, Flame, Target, Calendar, Plus, Award, Check } from 'lucide-react';
import { UserProfile } from '../types';

interface WeightProjectionTrackerProps {
  profile: UserProfile;
  onUpdateWeight: (newWeight: number) => void;
}

export const WeightProjectionTracker: React.FC<WeightProjectionTrackerProps> = ({
  profile,
  onUpdateWeight
}) => {
  const currentWeight = profile.weight || 76.5;
  const targetWeight = profile.targetWeight || 73.0;
  const isLoss = targetWeight < currentWeight;
  const delta = Math.abs(currentWeight - targetWeight);

  const [inputWeight, setInputWeight] = useState<number>(currentWeight);
  const [isLogging, setIsLogging] = useState<boolean>(false);

  // Generate 8-week projection trajectory
  const ratePerWeek = isLoss ? -0.45 : 0.25;
  const projectionWeeks = [
    { week: 'Now', weight: currentWeight },
    { week: 'Wk 2', weight: Math.round((currentWeight + ratePerWeek * 2) * 10) / 10 },
    { week: 'Wk 4', weight: Math.round((currentWeight + ratePerWeek * 4) * 10) / 10 },
    { week: 'Wk 6', weight: Math.round((currentWeight + ratePerWeek * 6) * 10) / 10 },
    { week: 'Wk 8 (Goal)', weight: targetWeight }
  ];

  const handleSaveWeight = () => {
    onUpdateWeight(inputWeight);
    setIsLogging(false);
  };

  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-xs">
            <Flame className="w-5 h-5 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-hud font-bold text-lg text-slate-900">
                {profile.streakDays || 14}-Day Streak
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold border border-amber-200">
                Active Habit
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Consistency builds compounding athletic results</p>
          </div>
        </div>

        <button
          onClick={() => setIsLogging(!isLogging)}
          className="self-start sm:self-center px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Log Weight</span>
        </button>
      </div>

      {/* Log Weight Input Drawer */}
      {isLogging && (
        <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/80 flex items-center gap-3 animate-in fade-in">
          <label className="text-xs font-bold text-blue-900 whitespace-nowrap">
            Current Scale Reading (kg):
          </label>
          <input
            type="number"
            step="0.1"
            value={inputWeight}
            onChange={e => setInputWeight(parseFloat(e.target.value) || currentWeight)}
            className="w-24 px-3 py-1.5 rounded-lg border border-blue-300 bg-white text-xs font-mono font-bold text-slate-900"
          />
          <button
            onClick={handleSaveWeight}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
          >
            Save
          </button>
        </div>
      )}

      {/* Weight & Target KPI */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Current Weight</span>
          <strong className="font-hud text-xl text-slate-900 mt-0.5 block">{currentWeight} kg</strong>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Target Weight</span>
          <strong className="font-hud text-xl text-blue-700 mt-0.5 block">{targetWeight} kg</strong>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Remaining Delta</span>
          <strong className="font-hud text-xl text-slate-900 mt-0.5 block">
            {isLoss ? `-${delta.toFixed(1)}` : `+${delta.toFixed(1)}`} kg
          </strong>
        </div>
      </div>

      {/* 8-Week PEAKD Mathematical Projection Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-blue-600" />
            PEAKD 8-Week Weight Trajectory Projection
          </span>
          <span className="font-mono text-slate-500 font-medium text-[11px]">
            Est. Rate: {ratePerWeek} kg / week
          </span>
        </div>

        <div className="grid grid-cols-5 gap-2 pt-1">
          {projectionWeeks.map((pt, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                idx === 0
                  ? 'bg-blue-50/70 border-blue-200 font-bold text-blue-900'
                  : idx === 4
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <span className="text-[10px] font-mono block uppercase text-slate-400">{pt.week}</span>
              <strong className="font-hud text-sm block mt-0.5">{pt.weight} kg</strong>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
