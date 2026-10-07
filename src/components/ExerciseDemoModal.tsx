import React from 'react';
import { X, Play, CheckCircle2, AlertTriangle, Clock, Activity } from 'lucide-react';
import { ExerciseDefinition } from '../types';

interface ExerciseDemoModalProps {
  exercise: ExerciseDefinition | null;
  onClose: () => void;
}

export const ExerciseDemoModal: React.FC<ExerciseDemoModalProps> = ({
  exercise,
  onClose
}) => {
  if (!exercise) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-blue-600 font-bold">
                {exercise.movementPattern.replace('_', ' ')} · {exercise.tier.replace('_', ' ')}
              </span>
            </div>
            <h3 className="font-hud font-bold text-lg text-slate-900">{exercise.name}</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">

          {/* YouTube Video Embed */}
          <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner relative">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${exercise.youtubeId}?rel=0&modestbranding=1`}
              title={`${exercise.name} Video Demonstration`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* Quick Specifications Strip */}
          <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Primary Target</span>
              <strong className="text-slate-900 capitalize font-medium">{exercise.targetMuscle}</strong>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Prescribed Tempo</span>
              <strong className="font-mono text-slate-900">{exercise.tempo}</strong>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Equipment</span>
              <strong className="text-slate-900 capitalize font-medium">{exercise.requiredEquipment.join(', ')}</strong>
            </div>
          </div>

          {/* Setup & Execution */}
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-blue-600" />
                Setup & Biomechanical Alignment
              </h4>
              <p className="text-sm text-slate-700 leading-relaxed bg-blue-50/50 p-3 rounded-lg border border-blue-100/60">
                {exercise.setup}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Execution Details
              </h4>
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200/60">
                {exercise.execution}
              </p>
            </div>
          </div>

          {/* Technique Cues vs Common Mistakes */}
          <div className="grid sm:grid-cols-2 gap-4">
            
            {/* Technique Cues */}
            <div className="p-4 rounded-xl border border-emerald-200/70 bg-emerald-50/30">
              <h5 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Technique Cues
              </h5>
              <ul className="space-y-2 text-xs text-slate-700">
                {exercise.techniqueCues.map((cue, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>{cue}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Common Mistakes */}
            <div className="p-4 rounded-xl border border-rose-200/70 bg-rose-50/30">
              <h5 className="text-xs font-bold text-rose-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Mistakes to Avoid
              </h5>
              <ul className="space-y-2 text-xs text-slate-700">
                {exercise.commonMistakes.map((mistake, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-600 font-bold">✕</span>
                    <span>{mistake}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};
