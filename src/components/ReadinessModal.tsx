import React, { useState } from 'react';
import { X, Activity, Moon, Heart, Flame, ShieldAlert, Check } from 'lucide-react';
import { ReadinessState, ReadinessMetrics, MuscleGroup } from '../types';
import { RecoveryEngine } from '../services/recoveryEngine';
import { StorageService } from '../services/storageService';

interface ReadinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentReadiness: ReadinessState;
  onSaveReadiness: (newReadiness: ReadinessState) => void;
}

const MUSCLE_OPTIONS: { id: MuscleGroup; label: string }[] = [
  { id: 'chest', label: 'Chest' },
  { id: 'back', label: 'Back & Lats' },
  { id: 'shoulders', label: 'Shoulders' },
  { id: 'quadriceps', label: 'Quadriceps' },
  { id: 'hamstrings', label: 'Hamstrings' },
  { id: 'glutes', label: 'Glutes' },
  { id: 'biceps', label: 'Arms / Biceps' },
  { id: 'calves', label: 'Calves' },
  { id: 'core', label: 'Core / Abs' }
];

export const ReadinessModal: React.FC<ReadinessModalProps> = ({
  isOpen,
  onClose,
  currentReadiness,
  onSaveReadiness
}) => {
  if (!isOpen) return null;

  const [metrics, setMetrics] = useState<ReadinessMetrics>({
    ...currentReadiness.metrics
  });

  const toggleMuscle = (muscle: MuscleGroup) => {
    if (metrics.soreMuscles.includes(muscle)) {
      setMetrics({
        ...metrics,
        soreMuscles: metrics.soreMuscles.filter(m => m !== muscle)
      });
    } else {
      setMetrics({
        ...metrics,
        soreMuscles: [...metrics.soreMuscles, muscle]
      });
    }
  };

  // Preview score live
  const previewReadiness = RecoveryEngine.calculateReadiness(metrics);

  const handleSave = () => {
    StorageService.saveReadiness(previewReadiness);
    onSaveReadiness(previewReadiness);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-hud font-bold text-base text-slate-900">Bio-Readiness Check-In</h3>
              <p className="text-xs text-slate-500">Autonomous recovery & autonomic calibration</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Score Preview Bar */}
        <div className="px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-700">Calculated Score:</span>
            <span className="font-mono-num font-bold text-xl text-blue-700">{previewReadiness.score}/100</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white text-blue-700 border border-blue-200 capitalize">
              {previewReadiness.tier.replace('_', ' ')}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Autoreg: x{previewReadiness.volumeMultiplier} Vol</span>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          
          {/* Sleep Hours & Quality */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                <Moon className="w-4 h-4 text-indigo-600" />
                Sleep Duration & Quality
              </label>
              <span className="font-mono text-xs font-bold text-indigo-600">
                {metrics.sleepHours} hrs · {metrics.sleepQuality}/10
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[11px] text-slate-500">Hours Slept</span>
                <input
                  type="range"
                  min="4"
                  max="11"
                  step="0.5"
                  value={metrics.sleepHours}
                  onChange={e => setMetrics({ ...metrics, sleepHours: parseFloat(e.target.value) })}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-500">Restorative Quality</span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={metrics.sleepQuality}
                  onChange={e => setMetrics({ ...metrics, sleepQuality: parseInt(e.target.value) })}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Resting Heart Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                <Heart className="w-4 h-4 text-rose-500" />
                Resting Heart Rate (Waking BPM)
              </label>
              <span className="font-mono text-xs font-bold text-rose-600">
                {metrics.restingHR} bpm (Base: {metrics.baselineRHR})
              </span>
            </div>
            <input
              type="range"
              min="45"
              max="90"
              step="1"
              value={metrics.restingHR}
              onChange={e => setMetrics({ ...metrics, restingHR: parseInt(e.target.value) })}
              className="w-full accent-rose-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">
              Deviations above baseline signal sympathetic nervous system fatigue or dehydration.
            </p>
          </div>

          {/* Subjective Soreness */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                <Flame className="w-4 h-4 text-amber-500" />
                Subjective Muscle Soreness (DOMS)
              </label>
              <span className="font-mono text-xs font-bold text-amber-600">
                {metrics.sorenessLevel}/10
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={metrics.sorenessLevel}
              onChange={e => setMetrics({ ...metrics, sorenessLevel: parseInt(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer"
            />

            {/* Affected muscle tags */}
            <div>
              <span className="text-[11px] text-slate-500 block mb-1.5 font-medium">Select sore muscle groups:</span>
              <div className="flex flex-wrap gap-1.5">
                {MUSCLE_OPTIONS.map(m => {
                  const isSelected = metrics.soreMuscles.includes(m.id);
                  return (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => toggleMuscle(m.id)}
                      className={`px-2.5 py-1 text-xs rounded-md border font-medium transition-all ${
                        isSelected
                          ? 'bg-amber-100 border-amber-300 text-amber-800'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Stress level */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4 text-slate-600" />
                Systemic Stress & Life Load
              </label>
              <span className="font-mono text-xs font-bold text-slate-700">
                {metrics.stressLevel}/10
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={metrics.stressLevel}
              onChange={e => setMetrics({ ...metrics, stressLevel: parseInt(e.target.value) })}
              className="w-full accent-slate-700 cursor-pointer"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all shadow-blue-500/20"
          >
            <Check className="w-4 h-4" />
            <span>Update Readiness Engine</span>
          </button>
        </div>

      </div>
    </div>
  );
};
