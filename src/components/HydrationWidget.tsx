import React, { useState, useEffect } from 'react';
import { Droplets, Plus, RotateCcw, CheckCircle2, Sparkles } from 'lucide-react';
import { UserProfile } from '../types';

interface HydrationWidgetProps {
  profile: UserProfile;
}

export const HydrationWidget: React.FC<HydrationWidgetProps> = ({ profile }) => {
  // Target = 35ml per kg bodyweight + 500ml for workout activity
  const baseTarget = Math.round((profile.weight || 75) * 35 + 500);
  const [targetMl, setTargetMl] = useState<number>(baseTarget);
  const [currentMl, setCurrentMl] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('jarvis_hydration_ml');
      return saved ? parseInt(saved, 10) : 1750;
    } catch {
      return 1750;
    }
  });

  const [history, setHistory] = useState<number[]>([]);

  const handleAddWater = (amount: number) => {
    setCurrentMl(prev => {
      const next = prev + amount;
      try {
        localStorage.setItem('jarvis_hydration_ml', next.toString());
      } catch {}
      setHistory(h => [amount, ...h]);
      return next;
    });
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const last = history[0];
    setCurrentMl(prev => {
      const next = Math.max(0, prev - last);
      try {
        localStorage.setItem('jarvis_hydration_ml', next.toString());
      } catch {}
      setHistory(h => h.slice(1));
      return next;
    });
  };

  const percent = Math.min(100, Math.round((currentMl / targetMl) * 100));

  return (
    <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
            <Droplets className="w-4 h-4 fill-sky-500" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Adaptive Hydration Target</h4>
            <p className="text-[11px] text-slate-500 font-medium">Scaled to body mass & workout sweat rate</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {history.length > 0 && (
            <button
              onClick={handleUndo}
              title="Undo last log"
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
          <span className="text-xs font-extrabold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">
            {percent}%
          </span>
        </div>
      </div>

      {/* Progress display */}
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-xl font-black text-slate-900">
          {(currentMl / 1000).toFixed(2)} <span className="text-xs font-bold text-slate-400">L</span>
        </span>
        <span className="text-xs font-semibold text-slate-500">
          Target: {(targetMl / 1000).toFixed(1)} L
        </span>
      </div>

      {/* Progress Bar with wave gradient */}
      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-3">
        <div
          className="bg-gradient-to-r from-sky-400 to-blue-500 h-full rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Quick Add buttons */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => handleAddWater(250)}
          className="py-1.5 px-2 rounded-xl bg-slate-50 hover:bg-sky-50 hover:border-sky-200 border border-slate-200/60 text-slate-700 text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1"
        >
          <Plus className="w-3 h-3 text-sky-500" /> 250 ml
        </button>
        <button
          onClick={() => handleAddWater(500)}
          className="py-1.5 px-2 rounded-xl bg-slate-50 hover:bg-sky-50 hover:border-sky-200 border border-slate-200/60 text-slate-700 text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1"
        >
          <Plus className="w-3 h-3 text-sky-500" /> 500 ml
        </button>
        <button
          onClick={() => handleAddWater(750)}
          className="py-1.5 px-2 rounded-xl bg-slate-50 hover:bg-sky-50 hover:border-sky-200 border border-slate-200/60 text-slate-700 text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1"
        >
          <Plus className="w-3 h-3 text-sky-500" /> 750 ml
        </button>
      </div>
    </div>
  );
};
