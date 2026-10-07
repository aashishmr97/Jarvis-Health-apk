import React, { useState } from 'react';
import { 
  Play, 
  Activity, 
  Flame, 
  Moon, 
  Heart, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  ShieldCheck, 
  Dumbbell,
  ArrowRight,
  Info,
  Calendar,
  MessageSquare,
  Zap,
  Coffee,
  LifeBuoy,
  Watch,
  Layers,
  Trophy,
  Download,
  Droplets,
  Palette
} from 'lucide-react';
import { 
  UserProfile, 
  ReadinessState, 
  WorkoutSession, 
  CoachingMemory, 
  CompletedWorkout, 
  IntensityMode 
} from '../types';
import { EXERCISE_LIBRARY } from '../data/exerciseLibrary';
import { TrainingEngine } from '../services/trainingEngine';
import { ExerciseDemoModal } from './ExerciseDemoModal';
import { WeightProjectionTracker } from './WeightProjectionTracker';
import { HydrationWidget } from './HydrationWidget';
import { GalaxyHealthCard } from './GalaxyHealthCard';

interface TodayViewProps {
  profile: UserProfile;
  readiness: ReadinessState;
  todayWorkout: WorkoutSession;
  memories: CoachingMemory[];
  completedWorkouts: CompletedWorkout[];
  intensityMode: IntensityMode;
  setIntensityMode: (mode: IntensityMode) => void;
  onStartWorkout: (workout: WorkoutSession) => void;
  onOpenReadinessModal: () => void;
  onOpenStandupModal: () => void;
  onOpenChatModal: () => void;
  onUpdateWeight: (newWeight: number) => void;
  onOpenGalaxyHealth: () => void;
  onOpenPlateCalc: (weight?: number) => void;
  onOpenPRHallOfFame: () => void;
  onOpenMuscleHeatmap: () => void;
  onExportCalendar: () => void;
  onOpenThemeSelector?: () => void;
  onApplyReadiness?: (newReadiness: ReadinessState) => void;
}

export const TodayView: React.FC<TodayViewProps> = ({
  profile,
  readiness,
  todayWorkout,
  memories,
  completedWorkouts,
  intensityMode,
  setIntensityMode,
  onStartWorkout,
  onOpenReadinessModal,
  onOpenStandupModal,
  onOpenChatModal,
  onUpdateWeight,
  onOpenGalaxyHealth,
  onOpenPlateCalc,
  onOpenPRHallOfFame,
  onOpenMuscleHeatmap,
  onExportCalendar,
  onOpenThemeSelector,
  onApplyReadiness
}) => {
  const [selectedExerciseForDemo, setSelectedExerciseForDemo] = useState<string | null>(null);

  // Derive adjusted workout based on PEAKD Intensity Mode (Main, Lite, Survival)
  const activeWorkout = TrainingEngine.getWorkoutByIntensity(todayWorkout, intensityMode);
  const isRestDay = activeWorkout.type === 'recovery' || activeWorkout.type === 'rest';

  // Extract key memories related to today's muscle focus
  const relevantMemories = memories.filter(m => 
    activeWorkout.exercises.some(ex => m.fact.toLowerCase().includes(ex.targetMuscle) || m.fact.toLowerCase().includes(ex.name.toLowerCase().split(' ')[0]))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-28 md:pb-12">
      
      {/* =========================================================================
          HERO MANDATE: "WHAT SHOULD I DO TODAY, AND WHY?"
         ========================================================================= */}
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden">
        
        {/* Top Operational Kicker & PEAKD Stand-Up Alert */}
        <div className="px-6 py-3.5 bg-gradient-to-r from-slate-50 to-blue-50/40 border-b border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-hud font-bold text-xs uppercase tracking-wider text-blue-700">
              TODAY'S OPERATIONAL DIRECTIVE
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500 font-medium">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Galaxy Health Live Hub */}
            <button
              onClick={onOpenGalaxyHealth}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-100 hover:bg-cyan-200 text-cyan-900 text-xs font-bold transition-all shadow-2xs"
            >
              <Watch className="w-3.5 h-3.5 text-cyan-700" />
              <span>Galaxy Health</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </button>

            {/* Weekly Stand-Up Trigger */}
            <button
              onClick={onOpenStandupModal}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs font-bold transition-colors"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Weekly Stand-Up</span>
            </button>

            {/* AI Coach Chat Trigger */}
            <button
              onClick={onOpenChatModal}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
              <span>AI Coach</span>
            </button>
          </div>
        </div>

        {/* Realtime Gym Floor & Biometric Toolbar */}
        <div className="px-6 py-2.5 bg-slate-50/80 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onOpenPlateCalc(todayWorkout.exercises[0]?.recommendedLoad || 80)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>Plate Calculator</span>
            </button>

            <button
              onClick={onOpenPRHallOfFame}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>PR Hall of Fame</span>
            </button>

            <button
              onClick={onOpenMuscleHeatmap}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span>Muscle Heatmap</span>
            </button>

            {onOpenThemeSelector && (
              <button
                onClick={onOpenThemeSelector}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors shadow-2xs"
                title="Futuristic Theme Matrix"
              >
                <Palette className="w-3.5 h-3.5 text-cyan-600" />
                <span>Theme Matrix</span>
              </button>
            )}
          </div>

          <button
            onClick={onExportCalendar}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100 transition-colors border border-blue-200/60"
            title="Download .ics schedule for Google Calendar / Android Calendar"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Sync to Calendar (.ics)</span>
          </button>
        </div>

        {/* Hero Content */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* PEAKD Flexibility Intensity Modes: Main, Lite, Survival */}
          {!isRestDay && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Flexible Workout Intensity
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Adapt to your day's time and energy — never quit, preserve the streak!
                </span>
              </div>

              <div className="flex items-center p-1 bg-white rounded-xl border border-slate-200/80 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setIntensityMode('main')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
                    intensityMode === 'main'
                      ? 'bg-blue-600 text-white shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Full standard session (60m)"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Main (60m)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIntensityMode('lite')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
                    intensityMode === 'lite'
                      ? 'bg-blue-600 text-white shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Short on time: 3 compound exercises (30m)"
                >
                  <Coffee className="w-3.5 h-3.5" />
                  <span>Lite (30m)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIntensityMode('survival')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
                    intensityMode === 'survival'
                      ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Low energy or tough day: gentle 15m session to protect streak"
                >
                  <LifeBuoy className="w-3.5 h-3.5" />
                  <span>Survival (15m)</span>
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-500 block">
                Recommended Action
              </span>
              <h1 className="font-hud font-bold text-3xl sm:text-4xl text-slate-900 tracking-tight">
                {activeWorkout.title}
              </h1>
              <p className="text-sm font-medium text-slate-600">
                Focus Area: <strong className="text-blue-700">{activeWorkout.focus}</strong> · {activeWorkout.estimatedDurationMinutes} mins · {activeWorkout.exercises.length} prescribed movements
              </p>
            </div>

            {/* Prominent Action Button */}
            <div className="shrink-0">
              {!isRestDay ? (
                <button
                  onClick={() => onStartWorkout(activeWorkout)}
                  className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-hud font-bold text-base shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  <Play className="w-5 h-5 fill-white" />
                  <span>START {intensityMode.toUpperCase()} WORKOUT</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              ) : (
                <div className="px-6 py-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold text-center">
                  Rest & Physiological Recovery Scheduled Today
                </div>
              )}
            </div>
          </div>

          {/* Deep Biological Rationale: "THE WHY" */}
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <h3 className="font-hud font-bold text-sm text-slate-900 tracking-tight">
                PHYSIOLOGICAL RATIONALE: WHY THIS TODAY?
              </h3>
            </div>
            
            <p className="text-sm text-slate-700 leading-relaxed">
              {readiness.rationale} Based on your primary objective of <strong className="text-slate-900">{profile.goal.replace('_', ' ')}</strong>, this session loads the prime movers while respecting recent central fatigue. The mechanical tension on primary compound movements is calibrated at an autoregulated RPE of 8.0, preserving joint health while stimulating maximal motor unit recruitment.
            </p>

            {/* Directives bullet points */}
            <div className="grid sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-lg bg-white border border-slate-200/70 shadow-2xs">
                <span className="font-bold text-blue-700 block mb-1">1. Primary Overload</span>
                <span className="text-slate-600">
                  Target +1 rep or +2.5kg on first exercise if first set feels &le; RPE 7.5.
                </span>
              </div>
              <div className="p-3 rounded-lg bg-white border border-slate-200/70 shadow-2xs">
                <span className="font-bold text-blue-700 block mb-1">2. Autoregulation Rule</span>
                <span className="text-slate-600">
                  {readiness.intensityAdjustment}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-white border border-slate-200/70 shadow-2xs">
                <span className="font-bold text-blue-700 block mb-1">3. Nutrition Link</span>
                <span className="text-slate-600">
                  Ensure target {Math.round(profile.weight * 2.1)}g protein post-session to drive muscle protein synthesis.
                </span>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* =========================================================================
          SAMSUNG GALAXY HEALTH REALTIME BIOMETRIC TELEMETRY
         ========================================================================= */}
      <GalaxyHealthCard
        onApplyReadiness={onApplyReadiness}
        onOpenFullModal={onOpenGalaxyHealth}
      />

      {/* =========================================================================
          BODY COMPOSITION & ADAPTIVE HYDRATION
         ========================================================================= */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <WeightProjectionTracker
            profile={profile}
            onUpdateWeight={onUpdateWeight}
          />
        </div>
        <div className="md:col-span-1">
          <HydrationWidget profile={profile} />
        </div>
      </div>

      {/* =========================================================================
          BIO-READINESS TELEMETRY & MEMORY INSIGHTS
         ========================================================================= */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Bio-Telemetry Diagnostics */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <h3 className="font-hud font-bold text-base text-slate-900">Bio-Readiness & Autonomic Telemetry</h3>
            </div>
            <button
              onClick={onOpenReadinessModal}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              Update Telemetry
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center sm:text-left">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Readiness Score</span>
              <strong className="font-hud text-2xl text-slate-900">{readiness.score}/100</strong>
              <span className="text-[11px] block font-medium capitalize text-blue-600 mt-0.5">
                {readiness.tier.replace('_', ' ')}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Sleep Duration</span>
              <strong className="font-hud text-2xl text-slate-900">{readiness.metrics.sleepHours}h</strong>
              <span className="text-[11px] block text-slate-500 mt-0.5">
                Quality: {readiness.metrics.sleepQuality}/10
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Resting Heart Rate</span>
              <strong className="font-hud text-2xl text-slate-900">{readiness.metrics.restingHR}</strong>
              <span className="text-[11px] block text-emerald-600 font-medium mt-0.5">
                {readiness.metrics.restingHR <= readiness.metrics.baselineRHR ? 'Stable Baseline' : '+ Elevated'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Muscle Soreness</span>
              <strong className="font-hud text-2xl text-slate-900">{readiness.metrics.sorenessLevel}/10</strong>
              <span className="text-[11px] block text-slate-500 mt-0.5">
                {readiness.metrics.soreMuscles?.length ? readiness.metrics.soreMuscles.join(', ') : 'None active'}
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-500 bg-slate-50/80 p-3 rounded-lg border border-slate-200/60 flex items-center justify-between">
            <span>Volume Autoregulation Factor: <strong className="font-mono text-slate-900">x{readiness.volumeMultiplier}</strong></span>
            <span>Joint Safety Protocol: <strong className="text-emerald-700">Active</strong></span>
          </div>
        </div>

        {/* Right 1 Col: Long-term Coaching Memory Recall */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <h3 className="font-hud font-bold text-base text-slate-900">Coaching Memory Recall</h3>
          </div>

          <div className="space-y-3">
            {relevantMemories.length > 0 ? (
              relevantMemories.slice(0, 2).map(mem => (
                <div key={mem.id} className="p-3 rounded-xl bg-indigo-50/40 border border-indigo-100 text-xs text-slate-700">
                  <span className="font-bold text-indigo-800 uppercase text-[10px] block mb-1 font-mono">
                    [{mem.category}] {Math.round(mem.confidence * 100)}% Confidence
                  </span>
                  <p className="leading-relaxed">{mem.fact}</p>
                </div>
              ))
            ) : (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-600">
                <span className="font-bold text-slate-800 uppercase text-[10px] block mb-1 font-mono">
                  [Biomechanical Learning]
                </span>
                <p>No acute movement anomalies stored for today's exercises. Executing standard anatomical cues.</p>
              </div>
            )}

            <div className="p-3 rounded-xl bg-emerald-50/40 border border-emerald-100 text-xs text-slate-700">
              <span className="font-bold text-emerald-800 uppercase text-[10px] block mb-1 font-mono">
                [Progression Memory]
              </span>
              <p>Last upper session hit 82.5kg x 8 reps at RPE 7.5. Today's target is 85kg for 8 reps.</p>
            </div>
          </div>
        </div>

      </div>

      {/* =========================================================================
          PLANNED MOVEMENT ROSTER FOR TODAY
         ========================================================================= */}
      {!isRestDay && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-hud font-bold text-lg text-slate-900">
                Today's Prescribed Movement Roster ({intensityMode.toUpperCase()})
              </h3>
              <p className="text-xs text-slate-500">Structured sequence optimized for neurological recruitment</p>
            </div>
            <span className="text-xs font-mono text-slate-500">
              {activeWorkout.exercises.length} Movements
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {activeWorkout.exercises.map((ex, index) => {
              const def = EXERCISE_LIBRARY[ex.exerciseId];
              return (
                <div key={ex.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-xs font-mono text-slate-700 shrink-0">
                      {index + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-hud font-bold text-base text-slate-900">{ex.name}</h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 capitalize">
                          {ex.targetMuscle}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1 font-mono">
                        <span>Sets: <strong className="text-slate-800 font-sans">{ex.targetSets}</strong></span>
                        <span>·</span>
                        <span>Reps: <strong className="text-slate-800 font-sans">{ex.targetReps}</strong></span>
                        <span>·</span>
                        <span>Recommended Load: <strong className="text-blue-700 font-sans">{ex.recommendedLoad} kg</strong></span>
                        <span>·</span>
                        <span>Target RPE: <strong className="text-slate-800 font-sans">{ex.targetRPE}</strong></span>
                        <span>·</span>
                        <span>Tempo: <strong className="text-slate-800">{ex.tempo}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    {ex.recommendedLoad > 0 && (
                      <button
                        onClick={() => onOpenPlateCalc(ex.recommendedLoad)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                        title="Calculate barbell plates for this weight"
                      >
                        <Layers className="w-3.5 h-3.5 text-blue-600" />
                        <span>Plates</span>
                      </button>
                    )}

                    {def && (
                      <button
                        onClick={() => setSelectedExerciseForDemo(def.id)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
                      >
                        View Technique
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Movement Demo Modal */}
      {selectedExerciseForDemo && (
        <ExerciseDemoModal
          exercise={EXERCISE_LIBRARY[selectedExerciseForDemo]}
          onClose={() => setSelectedExerciseForDemo(null)}
        />
      )}

    </div>
  );
};
