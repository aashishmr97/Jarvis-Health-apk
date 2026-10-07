import React, { useState } from 'react';
import { 
  Calendar, 
  TrendingUp, 
  Layers, 
  Dumbbell, 
  ChevronRight, 
  CheckCircle2, 
  ShieldCheck, 
  Play, 
  Download, 
  FileSpreadsheet, 
  Plus 
} from 'lucide-react';
import { WorkoutSession, UserProfile, CompletedWorkout } from '../types';
import { EXERCISE_LIBRARY } from '../data/exerciseLibrary';
import { TrainingEngine } from '../services/trainingEngine';
import { ExerciseDemoModal } from './ExerciseDemoModal';

interface ProgramViewProps {
  program: WorkoutSession[];
  profile: UserProfile;
  completedWorkouts: CompletedWorkout[];
  onStartSpecificWorkout: (workout: WorkoutSession) => void;
  onOpenPlateCalc?: (weight?: number) => void;
  onOpenCustomRoutine?: () => void;
  onExportCalendar?: () => void;
  onExportWorkoutsCSV?: () => void;
}

export const ProgramView: React.FC<ProgramViewProps> = ({
  program,
  profile,
  completedWorkouts,
  onStartSpecificWorkout,
  onOpenPlateCalc,
  onOpenCustomRoutine,
  onExportCalendar,
  onExportWorkoutsCSV
}) => {
  const [selectedDayId, setSelectedDayId] = useState<string>(program[0]?.id || 'session_day_1');
  const [demoExerciseId, setDemoExerciseId] = useState<string | null>(null);

  const selectedWorkout = program.find(w => w.id === selectedDayId) || program[0];

  // Calculate volume distribution by muscle group across the 7-day microcycle
  const volumeByMuscle: Record<string, number> = {};
  program.forEach(w => {
    w.exercises.forEach(ex => {
      volumeByMuscle[ex.targetMuscle] = (volumeByMuscle[ex.targetMuscle] || 0) + ex.targetSets;
    });
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-32 md:pb-12">
      
      {/* Microcycle Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-hud font-bold text-xs uppercase tracking-wider text-blue-700">
                PERIODIZED ARCHITECTURE
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500 font-mono">
                Block: Hypertrophy & Overload Mesocycle (Week 3 of 8)
              </span>
            </div>
            <h2 className="font-hud font-bold text-2xl text-slate-900 mt-1">
              7-Day Adaptive Schedule & Microcycle
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-slate-500 mr-2 hidden sm:inline">
              Training Days: <strong className="text-slate-800">{profile.daysPerWeek} Days/Wk</strong> · Duration: <strong className="text-slate-800">{profile.sessionDurationMinutes}m</strong>
            </span>

            {onOpenCustomRoutine && (
              <button
                onClick={onOpenCustomRoutine}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition-colors shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Custom Routine</span>
              </button>
            )}

            {onExportCalendar && (
              <button
                onClick={onExportCalendar}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200 transition-colors border border-slate-200"
                title="Download 7-day schedule to Android / Google Calendar (.ics)"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                <span>Calendar (.ics)</span>
              </button>
            )}

            {onExportWorkoutsCSV && (
              <button
                onClick={onExportWorkoutsCSV}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200 transition-colors border border-slate-200"
                title="Download complete workout history to CSV spreadsheet"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>CSV Export</span>
              </button>
            )}
          </div>
        </div>

        {/* 7-Day Day Selector Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
          {program.map(session => {
            const isSelected = session.id === selectedDayId;
            const isRest = session.type === 'recovery' || session.type === 'rest';

            return (
              <button
                key={session.id}
                onClick={() => setSelectedDayId(session.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/50 shadow-sm ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50/70'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-mono uppercase text-slate-400 font-bold">
                    Day {session.dayNumber}
                  </span>
                  {isRest ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  )}
                </div>
                <div className="text-xs font-bold text-slate-900 truncate">
                  {session.dayName}
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">
                  {isRest ? 'Rest' : session.title.split('—')[0]}
                </div>
              </button>
            );
          })}
        </div>

      </div>

      {/* Selected Day Workout Details */}
      {selectedWorkout && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase text-blue-600 font-bold">
                  {selectedWorkout.dayName} · {selectedWorkout.type.toUpperCase()}
                </span>
              </div>
              <h3 className="font-hud font-bold text-2xl text-slate-900 mt-1">{selectedWorkout.title}</h3>
              <p className="text-xs text-slate-600 font-medium mt-1">
                Objective Focus: <strong className="text-blue-700">{selectedWorkout.focus}</strong> · {selectedWorkout.estimatedDurationMinutes} mins
              </p>
            </div>

            {selectedWorkout.type !== 'recovery' && selectedWorkout.type !== 'rest' && (
              <button
                onClick={() => onStartSpecificWorkout(selectedWorkout)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-hud font-bold text-xs shadow-md shadow-blue-500/20 transition-all self-start sm:self-center"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Launch This Workout</span>
              </button>
            )}
          </div>

          {/* Warm-Up Sequence */}
          {selectedWorkout.warmUp.exercises.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">
                Warm-Up & Movement Preparation ({selectedWorkout.warmUp.durationMinutes} mins)
              </span>
              <div className="grid sm:grid-cols-3 gap-2 text-xs">
                {selectedWorkout.warmUp.exercises.map((wu, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-white border border-slate-200/60">
                    <strong className="text-slate-900 block">{wu.name}</strong>
                    <span className="font-mono text-slate-500">{wu.repsOrTime}</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">{wu.cue}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prescribed Movements Table */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Prescribed Exercises ({selectedWorkout.exercises.length})
            </span>

            {selectedWorkout.exercises.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                Rest and neural tissue regeneration programmed. No heavy resistance training scheduled today.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {selectedWorkout.exercises.map((ex, idx) => {
                  const def = EXERCISE_LIBRARY[ex.exerciseId];
                  return (
                    <div key={ex.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/50">
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs font-mono shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <strong className="text-sm font-bold text-slate-900">{ex.name}</strong>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 capitalize">
                              {ex.targetMuscle}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1 font-mono">
                            <span>Sets: <strong className="text-slate-800">{ex.targetSets}</strong></span>
                            <span>·</span>
                            <span>Reps: <strong className="text-slate-800">{ex.targetReps}</strong></span>
                            <span>·</span>
                            <span>Starting Load: <strong className="text-blue-700">{ex.recommendedLoad} kg</strong></span>
                            <span>·</span>
                            <span>Target RPE: <strong className="text-slate-800">{ex.targetRPE}</strong></span>
                            <span>·</span>
                            <span>Rest: <strong className="text-slate-800">{ex.restSeconds}s</strong></span>
                          </div>
                        </div>
                      </div>

                      {def && (
                        <button
                          onClick={() => setDemoExerciseId(def.id)}
                          className="self-start md:self-center px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-white transition-colors"
                        >
                          Biomechanics Guide
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Cool-Down Protocol */}
          {selectedWorkout.coolDown.exercises.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">
                Cool-Down & Autonomic Downregulation ({selectedWorkout.coolDown.durationMinutes} mins)
              </span>
              <div className="grid sm:grid-cols-2 gap-2 text-xs">
                {selectedWorkout.coolDown.exercises.map((cd, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-white border border-slate-200/60">
                    <strong className="text-slate-900 block">{cd.name}</strong>
                    <span className="font-mono text-slate-500">{cd.repsOrTime}</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">{cd.cue}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Weekly Volume Allocation by Muscle Group */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Layers className="w-5 h-5 text-blue-600" />
          <h3 className="font-hud font-bold text-lg text-slate-900">
            Weekly Hypertrophy Volume Distribution (Sets/Week)
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
          {Object.entries(volumeByMuscle).map(([muscle, sets]) => (
            <div key={muscle} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-center">
              <span className="text-[10px] font-mono uppercase text-slate-400 block capitalize">{muscle}</span>
              <strong className="font-hud text-xl text-slate-900 mt-1 block">{sets} sets</strong>
              <span className="text-[10px] text-emerald-600 font-medium block mt-0.5">
                {sets >= 10 && sets <= 20 ? 'Optimal (MEV-MRV)' : 'Maintenance'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Exercise Demo Modal */}
      {demoExerciseId && (
        <ExerciseDemoModal
          exercise={EXERCISE_LIBRARY[demoExerciseId]}
          onClose={() => setDemoExerciseId(null)}
        />
      )}

    </div>
  );
};
