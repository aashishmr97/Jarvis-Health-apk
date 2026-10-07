import React, { useState } from 'react';
import { X, Dumbbell, ArrowRight, RotateCcw, Sparkles, Layers } from 'lucide-react';

interface PlateCalculatorModalProps {
  initialWeight?: number;
  onClose: () => void;
}

interface PlateSpec {
  weight: number;
  color: string;
  borderColor: string;
  textColor: string;
  heightClass: string;
}

const AVAILABLE_PLATES: PlateSpec[] = [
  { weight: 25, color: 'bg-red-500', borderColor: 'border-red-600', textColor: 'text-white', heightClass: 'h-24' },
  { weight: 20, color: 'bg-blue-600', borderColor: 'border-blue-700', textColor: 'text-white', heightClass: 'h-22' },
  { weight: 15, color: 'bg-amber-400', borderColor: 'border-amber-500', textColor: 'text-slate-900', heightClass: 'h-20' },
  { weight: 10, color: 'bg-emerald-500', borderColor: 'border-emerald-600', textColor: 'text-white', heightClass: 'h-18' },
  { weight: 5, color: 'bg-slate-200', borderColor: 'border-slate-400', textColor: 'text-slate-800', heightClass: 'h-14' },
  { weight: 2.5, color: 'bg-slate-800', borderColor: 'border-slate-950', textColor: 'text-white', heightClass: 'h-12' },
  { weight: 1.25, color: 'bg-slate-400', borderColor: 'border-slate-500', textColor: 'text-white', heightClass: 'h-10' },
];

export const PlateCalculatorModal: React.FC<PlateCalculatorModalProps> = ({
  initialWeight = 85,
  onClose,
}) => {
  const [targetWeight, setTargetWeight] = useState<number>(initialWeight);
  const [barWeight, setBarWeight] = useState<number>(20); // 20kg standard Olympic bar

  // Calculate plates per side
  const calculatePlatesPerSide = () => {
    let remainingPerSide = Math.max(0, (targetWeight - barWeight) / 2);
    const result: { plate: PlateSpec; count: number }[] = [];

    for (const p of AVAILABLE_PLATES) {
      if (remainingPerSide >= p.weight) {
        const count = Math.floor(remainingPerSide / p.weight);
        result.push({ plate: p, count });
        remainingPerSide = Math.round((remainingPerSide - count * p.weight) * 100) / 100;
      }
    }

    const loadedTotal = barWeight + result.reduce((acc, curr) => acc + curr.plate.weight * curr.count * 2, 0);
    return {
      plates: result,
      remainder: Math.round(remainingPerSide * 2 * 100) / 100,
      actualTotal: loadedTotal,
    };
  };

  const { plates, remainder, actualTotal } = calculatePlatesPerSide();

  // Warmup pyramid ramp
  const warmUpRamp = [
    { label: 'Set 1 (Empty Bar)', weight: barWeight, reps: '10 reps', pct: Math.round((barWeight / targetWeight) * 100) },
    { label: 'Set 2 (50% Warmup)', weight: Math.max(barWeight, Math.round((targetWeight * 0.5) / 2.5) * 2.5), reps: '5 reps', pct: 50 },
    { label: 'Set 3 (70% Acclimation)', weight: Math.max(barWeight, Math.round((targetWeight * 0.7) / 2.5) * 2.5), reps: '3 reps', pct: 70 },
    { label: 'Set 4 (85% Potentiation)', weight: Math.max(barWeight, Math.round((targetWeight * 0.85) / 2.5) * 2.5), reps: '1 rep', pct: 85 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50/60 to-indigo-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                Plate Loading Calculator
              </h3>
              <p className="text-xs text-slate-500 font-medium">Olympic Barbell sleeve load breakdown</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-6">
          {/* Target Weight Controls */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 text-center">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Target Working Weight</span>
            <div className="flex items-center justify-center gap-3 my-2">
              <button
                onClick={() => setTargetWeight(prev => Math.max(barWeight, prev - 5))}
                className="w-10 h-10 rounded-xl bg-white border border-slate-200 font-bold text-slate-700 hover:bg-slate-100 active:scale-95 shadow-sm text-sm"
              >
                -5
              </button>
              <button
                onClick={() => setTargetWeight(prev => Math.max(barWeight, prev - 2.5))}
                className="w-10 h-10 rounded-xl bg-white border border-slate-200 font-bold text-slate-700 hover:bg-slate-100 active:scale-95 shadow-sm text-xs"
              >
                -2.5
              </button>
              <div className="px-5 py-2 bg-white rounded-2xl border border-blue-200 shadow-sm min-w-32">
                <span className="text-3xl font-extrabold text-blue-600 tracking-tight">{targetWeight}</span>
                <span className="text-sm font-bold text-slate-400 ml-1">kg</span>
              </div>
              <button
                onClick={() => setTargetWeight(prev => prev + 2.5)}
                className="w-10 h-10 rounded-xl bg-white border border-slate-200 font-bold text-slate-700 hover:bg-slate-100 active:scale-95 shadow-sm text-xs"
              >
                +2.5
              </button>
              <button
                onClick={() => setTargetWeight(prev => prev + 5)}
                className="w-10 h-10 rounded-xl bg-white border border-slate-200 font-bold text-slate-700 hover:bg-slate-100 active:scale-95 shadow-sm text-sm"
              >
                +5
              </button>
            </div>

            {/* Barbell Weight Toggle */}
            <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-slate-200/60">
              <span className="text-xs text-slate-500 font-medium">Barbell:</span>
              <button
                onClick={() => setBarWeight(20)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  barWeight === 20 ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                }`}
              >
                20 kg (Men's Olympic)
              </button>
              <button
                onClick={() => setBarWeight(15)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  barWeight === 15 ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                }`}
              >
                15 kg (Women's)
              </button>
            </div>
          </div>

          {/* Graphical Barbell Visualizer */}
          <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Dumbbell className="w-3.5 h-3.5 text-blue-400" /> Each Side of the Bar
              </span>
              <span className="font-mono text-cyan-400 font-bold">
                {((actualTotal - barWeight) / 2).toFixed(1)} kg / side
              </span>
            </div>

            {/* Barbell Visual Representation */}
            <div className="flex items-center justify-center py-6 px-2 min-h-32 relative">
              {/* Center collar */}
              <div className="w-4 h-16 bg-slate-400 rounded-sm shadow-inner z-10 border border-slate-500" />
              
              {/* Sleeve shaft */}
              <div className="h-6 flex-1 bg-gradient-to-b from-slate-300 via-slate-100 to-slate-400 rounded-r-md flex items-center px-1 gap-1 shadow-md">
                {plates.flatMap(({ plate, count }, pIdx) =>
                  Array.from({ length: count }).map((_, cIdx) => (
                    <div
                      key={`${pIdx}-${cIdx}`}
                      className={`w-5 ${plate.color} ${plate.borderColor} border rounded-sm flex items-center justify-center shadow-md ${plate.heightClass}`}
                      title={`${plate.weight}kg plate`}
                    >
                      <span className={`text-[8px] font-bold ${plate.textColor} -rotate-90 select-none`}>
                        {plate.weight}
                      </span>
                    </div>
                  ))
                )}
                {plates.length === 0 && (
                  <span className="text-xs text-slate-500 italic ml-2">Empty Bar (0 plates)</span>
                )}
              </div>
            </div>

            {/* List breakdown */}
            <div className="mt-2 pt-3 border-t border-slate-800 flex flex-wrap gap-2 justify-center">
              {plates.length > 0 ? (
                plates.map(({ plate, count }, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-xs font-medium border border-slate-700"
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${plate.color}`} />
                    <strong className="text-white">{count}×</strong> {plate.weight} kg
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">Load the 20kg bar with no extra plates.</span>
              )}
            </div>

            {remainder > 0 && (
              <p className="text-[11px] text-amber-300 text-center mt-2 font-medium">
                ⚠️ Note: Remaining {remainder} kg requires microplates (&lt;1.25kg).
              </p>
            )}
          </div>

          {/* Warmup Ramp Calculator */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Suggested Warm-Up Ramp
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {warmUpRamp.map((ramp, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] font-medium text-slate-500 block">{ramp.label}</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-base font-bold text-slate-900">{ramp.weight} kg</span>
                    <span className="text-xs text-blue-600 font-semibold">{ramp.reps}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            Total Loaded: <strong className="text-slate-900">{actualTotal} kg</strong>
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-500/20"
          >
            Apply to Workout
          </button>
        </div>
      </div>
    </div>
  );
};
