import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Dumbbell, 
  Trash2, 
  Save, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  Layers 
} from 'lucide-react';
import { PlannedExercise, WorkoutSession, MuscleGroup, MovementPattern } from '../types';
import { EXERCISE_LIBRARY } from '../data/exerciseLibrary';

interface CustomRoutineModalProps {
  onSaveRoutine: (newRoutine: WorkoutSession) => void;
  onClose: () => void;
}

export const CustomRoutineModal: React.FC<CustomRoutineModalProps> = ({
  onSaveRoutine,
  onClose,
}) => {
  const [title, setTitle] = useState<string>('Custom Strength Circuit');
  const [focus, setFocus] = useState<string>('Hypertrophy & Power');
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [exercises, setExercises] = useState<PlannedExercise[]>([
    {
      id: 'custom_ex_1',
      exerciseId: 'barbell_bench_press',
      name: 'Barbell Flat Bench Press',
      targetMuscle: 'chest',
      movementPattern: 'horizontal_push',
      targetSets: 3,
      targetReps: '8-10',
      recommendedLoad: 70,
      targetRPE: 8,
      targetRIR: 2,
      restSeconds: 90,
      tempo: '3-0-1-0',
      techniqueCues: ['Retract scapulae', 'Touch mid-sternum'],
      commonMistakes: ['Flaring elbows 90 degrees'],
      youtubeId: 'rT7DgCr-3pg',
      substitutions: ['dumbbell_bench_press'],
    },
  ]);

  const [selectedLibraryId, setSelectedLibraryId] = useState<string>('dumbbell_bench_press');

  const handleAddExerciseFromLibrary = () => {
    const def = EXERCISE_LIBRARY[selectedLibraryId];
    if (!def) return;

    const newEx: PlannedExercise = {
      id: `custom_ex_${Date.now()}`,
      exerciseId: def.id,
      name: def.name,
      targetMuscle: def.targetMuscle,
      movementPattern: def.movementPattern,
      targetSets: 3,
      targetReps: '10-12',
      recommendedLoad: 24,
      targetRPE: 8,
      targetRIR: 2,
      restSeconds: 75,
      tempo: def.tempo || '2-0-1-0',
      techniqueCues: def.techniqueCues.slice(0, 2),
      commonMistakes: def.commonMistakes.slice(0, 1),
      youtubeId: def.youtubeId,
      substitutions: def.substitutions,
    };

    setExercises(prev => [...prev, newEx]);
  };

  const handleRemoveExercise = (id: string) => {
    setExercises(prev => prev.filter(e => e.id !== id));
  };

  const handleSave = () => {
    const newSession: WorkoutSession = {
      id: `custom_routine_${Date.now()}`,
      dayNumber: 7,
      dayName: 'Custom Day',
      title,
      focus,
      type: 'strength',
      estimatedDurationMinutes: durationMinutes,
      warmUp: {
        durationMinutes: 5,
        exercises: [
          { name: 'Cat-Camel Mobility', repsOrTime: '10 reps', cue: 'Dynamic spinal flexion' },
          { name: 'Band Pull-Aparts', repsOrTime: '15 reps', cue: 'Scapular activation' },
        ],
      },
      exercises,
      coolDown: {
        durationMinutes: 5,
        exercises: [
          { name: 'Diaphragmatic Parasympathetic Breathing', repsOrTime: '2 mins', cue: '4s inhale, 7s exhale' },
        ],
      },
    };

    onSaveRoutine(newSession);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Custom Workout Builder</h3>
              <p className="text-xs text-slate-500 font-medium">Design & persist bespoke training sessions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Metadata inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Routine Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Primary Focus</label>
              <input
                type="text"
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Add Exercise from Catalog */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <label className="text-xs font-bold text-slate-600 block mb-1.5 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-blue-600" /> Add Exercise from Exercise Library
            </label>
            <div className="flex gap-2">
              <select
                value={selectedLibraryId}
                onChange={(e) => setSelectedLibraryId(e.target.value)}
                className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {Object.values(EXERCISE_LIBRARY).map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name} ({ex.targetMuscle})
                  </option>
                ))}
              </select>
              <button
                onClick={handleAddExerciseFromLibrary}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 active:scale-95 transition-all shadow-xs"
              >
                Add
              </button>
            </div>
          </div>

          {/* Exercise list */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Prescribed Exercises ({exercises.length})
            </h4>
            <div className="space-y-2">
              {exercises.map((ex, idx) => (
                <div
                  key={ex.id}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{ex.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {ex.targetSets} sets × {ex.targetReps} reps • {ex.recommendedLoad} kg • {ex.restSeconds}s rest
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveExercise(ex.id)}
                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-400 flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={exercises.length === 0}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-500/20 flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            Save & Add to Program
          </button>
        </div>
      </div>
    </div>
  );
};
