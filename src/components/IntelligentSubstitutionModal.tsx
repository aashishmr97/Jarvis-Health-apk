import React from 'react';
import { X, ArrowRightLeft, ShieldCheck, Dumbbell, Sparkles } from 'lucide-react';
import { PlannedExercise, ExerciseDefinition, UserProfile } from '../types';
import { EXERCISE_LIBRARY } from '../data/exerciseLibrary';
import { TrainingEngine } from '../services/trainingEngine';

interface IntelligentSubstitutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentExercise: PlannedExercise;
  profile: UserProfile;
  onSelectSubstitution: (substitute: ExerciseDefinition, reason: string) => void;
}

export const IntelligentSubstitutionModal: React.FC<IntelligentSubstitutionModalProps> = ({
  isOpen,
  onClose,
  currentExercise,
  profile,
  onSelectSubstitution
}) => {
  if (!isOpen) return null;

  const currentDef = EXERCISE_LIBRARY[currentExercise.exerciseId] || {
    id: currentExercise.exerciseId,
    name: currentExercise.name,
    targetMuscle: currentExercise.targetMuscle,
    movementPattern: currentExercise.movementPattern,
    requiredEquipment: ['gym'],
    tier: 'tier1_compound',
    setup: '',
    execution: '',
    techniqueCues: [],
    commonMistakes: [],
    tempo: '3-0-1-0',
    warmUpRecommended: false,
    youtubeId: '',
    substitutions: currentExercise.substitutions || [],
    painContraindications: []
  };

  // Find candidate substitutions
  const candidateIds = currentDef.substitutions || [];
  const candidates: ExerciseDefinition[] = [];

  for (const id of candidateIds) {
    if (EXERCISE_LIBRARY[id]) {
      candidates.push(EXERCISE_LIBRARY[id]);
    }
  }

  // Also query any other matching movement pattern exercises
  for (const item of Object.values(EXERCISE_LIBRARY)) {
    if (item.id !== currentDef.id && !candidates.some(c => c.id === item.id)) {
      if (item.movementPattern === currentDef.movementPattern || item.targetMuscle === currentDef.targetMuscle) {
        candidates.push(item);
      }
    }
  }

  const getReasoning = (cand: ExerciseDefinition) => {
    if (currentDef.movementPattern === 'horizontal_push') {
      if (cand.id.includes('dumbbell')) {
        return 'Independent arm movement allows natural wrist/elbow rotation, significantly reducing anterior shoulder strain.';
      }
      if (cand.id.includes('machine')) {
        return 'Fixed plane of motion isolates the pectoralis with zero stabilizing axial stress or joint shear.';
      }
    }
    if (currentDef.movementPattern === 'squat') {
      if (cand.id.includes('leg_press')) {
        return 'Completely removes spinal axial compression; allows quad overload with neutral lumbar support.';
      }
      if (cand.id.includes('bulgarian') || cand.id.includes('goblet')) {
        return 'Anterior loading forces upright thoracic posture, reducing shear on the L4/L5 lumbar spine.';
      }
    }
    return `Preserves ${cand.movementPattern.replace('_', ' ')} biomechanics and ${cand.targetMuscle} stimulation with alternate equipment constraints.`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xl w-full overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-hud font-bold text-base text-slate-900">Intelligent Substitution</h3>
              <p className="text-xs text-slate-500">Biomechanical & joint-protective alternatives</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Exercise Banner */}
        <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Current Exercise</span>
            <strong className="text-sm text-slate-900 font-semibold">{currentExercise.name}</strong>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Target Muscle</span>
            <span className="text-xs font-medium text-slate-700 capitalize">{currentExercise.targetMuscle}</span>
          </div>
        </div>

        {/* Candidates List */}
        <div className="p-6 overflow-y-auto space-y-3.5 flex-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Recommended Alternatives ({candidates.length})
          </span>

          {candidates.slice(0, 5).map(cand => {
            const reasoning = getReasoning(cand);
            return (
              <div
                key={cand.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all flex flex-col justify-between gap-3 bg-white shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-bold text-slate-900">{cand.name}</h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 capitalize border border-slate-200">
                      {cand.tier.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">
                    <strong className="text-blue-700">JARVIS Rationale: </strong>
                    {reasoning}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Equipment: {cand.requiredEquipment.join(', ')}</span>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => {
                      onSelectSubstitution(cand, reasoning);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>Swap to this Exercise</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};
