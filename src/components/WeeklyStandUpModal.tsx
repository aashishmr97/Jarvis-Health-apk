import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, Sparkles, TrendingUp, Calendar, Flame, ShieldAlert, Award } from 'lucide-react';
import { UserProfile, CompletedWorkout, WeeklyStandupResult } from '../types';

interface WeeklyStandUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  completedWorkouts: CompletedWorkout[];
  onApplyStandupResult: (result: WeeklyStandupResult) => void;
}

const REASON_OPTIONS = [
  { id: 'work_deadline', label: 'Work Deadline / Busy Schedule' },
  { id: 'fatigue', label: 'Extreme Muscle Soreness / Joint Fatigue' },
  { id: 'low_energy', label: 'Low Energy / Poor Sleep' },
  { id: 'travel', label: 'Travel / Out of Town' },
  { id: 'illness', label: 'Mild Illness / Under the Weather' }
];

export const WeeklyStandUpModal: React.FC<WeeklyStandUpModalProps> = ({
  isOpen,
  onClose,
  profile,
  completedWorkouts,
  onApplyStandupResult
}) => {
  if (!isOpen) return null;

  const scheduledCount = profile.daysPerWeek || 4;
  const completedCount = Math.min(scheduledCount, completedWorkouts.length);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [result, setResult] = useState<WeeklyStandupResult | null>(null);

  const toggleReason = (id: string) => {
    if (selectedReasons.includes(id)) {
      setSelectedReasons(selectedReasons.filter(r => r !== id));
    } else {
      setSelectedReasons([...selectedReasons, id]);
    }
  };

  const handleRunEvaluation = async () => {
    setIsEvaluating(true);
    try {
      const res = await fetch('/api/gemini/weekly-standup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completedCount,
          scheduledCount,
          missedReasons: selectedReasons,
          currentStreak: profile.streakDays || 14,
          profile
        })
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        throw new Error('API failure');
      }
    } catch (e) {
      // Offline heuristic fallback
      const isDeload = selectedReasons.includes('fatigue');
      setResult({
        grade: completedCount >= scheduledCount ? "A+" : "B+",
        summary: `You logged ${completedCount} of ${scheduledCount} prescribed sessions this week with an active ${profile.streakDays || 14}-day streak.`,
        weeklyAdaptation: isDeload
          ? "Deload Week Scheduled: Volume dialed down by 30% to clear systemic joint fatigue and reset CNS firing."
          : "Overload Progression: Adding +2.5kg to primary compound lifts with volume maintained.",
        nextWeekFocus: "Form integrity and progressive overload execution.",
        recommendedMode: isDeload ? "survival" : "main"
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden max-h-[92vh] flex flex-col text-slate-900">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-2xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-hud font-bold text-xs uppercase tracking-wider text-blue-700">
                  PEAKD WEEKLY REVIEW
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
                  Stand-Up #12
                </span>
              </div>
              <h3 className="font-hud font-bold text-lg text-slate-900">Weekly Coaching Stand-Up</h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          
          {/* Consistency Metrics Banner */}
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Weekly Completion</span>
              <strong className="font-hud text-2xl text-slate-900">
                {completedCount} / {scheduledCount}
              </strong>
              <span className="text-[11px] block font-medium text-emerald-600 mt-0.5">
                {Math.round((completedCount / scheduledCount) * 100)}% Compliance
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Consistency Streak</span>
              <div className="flex items-center justify-center gap-1.5">
                <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
                <strong className="font-hud text-2xl text-slate-900">
                  {profile.streakDays || 14}
                </strong>
                <span className="text-xs font-mono text-slate-500">days</span>
              </div>
              <span className="text-[11px] block text-amber-600 font-medium mt-0.5">
                Non-Zero Habit Active
              </span>
            </div>
          </div>

          {!result ? (
            /* Reason for missed sessions questionnaire */
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                  Weekly Check-in: Any obstacles this week?
                </h4>
                <p className="text-xs text-slate-500">
                  Select any factors that impacted your sessions so JARVIS can calibrate next week's volume.
                </p>
              </div>

              <div className="space-y-2">
                {REASON_OPTIONS.map(opt => {
                  const isSelected = selectedReasons.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => toggleReason(opt.id)}
                      className={`w-full p-3 rounded-xl border text-xs font-medium text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-semibold'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleRunEvaluation}
                  disabled={isEvaluating}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-hud font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isEvaluating ? 'Analyzing Weekly Progress...' : 'Submit Stand-Up & Adapt Next Week'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Standup Evaluation Result */
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-blue-700 font-bold block">
                    Weekly Performance Grade
                  </span>
                  <p className="text-xs text-slate-700 mt-1">{result.summary}</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-white border border-blue-200 flex items-center justify-center shadow-xs">
                  <span className="font-hud font-bold text-2xl text-blue-700">{result.grade}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  Next Week's Programming Adaptation:
                </span>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {result.weeklyAdaptation}
                </p>
                <div className="pt-2 border-t border-slate-200/60 text-xs text-slate-500 flex items-center justify-between font-mono">
                  <span>Focus: <strong>{result.nextWeekFocus}</strong></span>
                  <span>Preset Mode: <strong className="capitalize text-blue-600">{result.recommendedMode}</strong></span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onApplyStandupResult(result);
                  onClose();
                }}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-hud font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Apply Adaptations to Schedule</span>
              </button>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
