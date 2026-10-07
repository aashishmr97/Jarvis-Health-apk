import React, { useState } from 'react';
import { 
  Brain, 
  ShieldCheck, 
  Plus, 
  Sparkles, 
  Clock, 
  Activity, 
  Flame, 
  Dumbbell, 
  Calendar 
} from 'lucide-react';
import { CoachingMemory, UserProfile, CompletedWorkout } from '../types';
import { StorageService } from '../services/storageService';

interface CoachingMemoryViewProps {
  memories: CoachingMemory[];
  completedWorkouts: CompletedWorkout[];
  profile: UserProfile;
  onAddMemory: (memory: CoachingMemory) => void;
}

export const CoachingMemoryView: React.FC<CoachingMemoryViewProps> = ({
  memories,
  completedWorkouts,
  profile,
  onAddMemory
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [newFactText, setNewFactText] = useState<string>('');
  const [newFactCategory, setNewFactCategory] = useState<CoachingMemory['category']>('preferences');

  const filteredMemories = selectedCategory === 'all'
    ? memories
    : memories.filter(m => m.category === selectedCategory);

  const handleCreateMemory = () => {
    if (!newFactText.trim()) return;

    const memory: CoachingMemory = {
      id: `mem_${Date.now()}`,
      category: newFactCategory,
      fact: newFactText.trim(),
      confidence: 1.0,
      relevanceScore: 0.95,
      source: 'assessment',
      createdAt: new Date().toISOString()
    };

    StorageService.addCoachingMemory(memory);
    onAddMemory(memory);
    setNewFactText('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-32 md:pb-12">
      
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-hud font-bold text-xs uppercase tracking-wider text-blue-700">
                PERSISTENT COGNITIVE VAULT
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500 font-mono">
                {memories.length} Structured Memory Vectors
              </span>
            </div>
            <h2 className="font-hud font-bold text-2xl text-slate-900 mt-1">
              Long-Term Coaching Memory
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              JARVIS continuously accumulates facts, biomechanical pain tolerances, and performance trends to individualize future daily directives.
            </p>
          </div>
        </div>

        {/* Input: Teach JARVIS a Fact */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-blue-600" />
            Directly Teach JARVIS a Fact or Preference
          </span>

          <div className="flex flex-col sm:flex-row items-stretch gap-2">
            <input
              type="text"
              placeholder='e.g., "I feel lower back tightness if squat stance is narrower than shoulder width"'
              value={newFactText}
              onChange={e => setNewFactText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreateMemory()}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <select
              value={newFactCategory}
              onChange={e => setNewFactCategory(e.target.value as any)}
              className="px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700"
            >
              <option value="biomechanics">Biomechanics</option>
              <option value="recovery">Recovery</option>
              <option value="performance">Performance</option>
              <option value="preferences">Preferences</option>
              <option value="nutrition">Nutrition</option>
              <option value="schedule">Schedule</option>
            </select>

            <button
              type="button"
              onClick={handleCreateMemory}
              disabled={!newFactText.trim()}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-40"
            >
              Commit to Memory
            </button>
          </div>
        </div>
      </div>

      {/* Categories Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {['all', 'biomechanics', 'recovery', 'performance', 'preferences', 'nutrition', 'schedule'].map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Memory Cards Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {filteredMemories.map(mem => (
          <div
            key={mem.id}
            className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2 hover:border-blue-300 transition-all"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-bold uppercase text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                {mem.category}
              </span>
              <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
                <span>Confidence: <strong className="text-slate-800">{Math.round(mem.confidence * 100)}%</strong></span>
                <span>·</span>
                <span>Source: {mem.source}</span>
              </div>
            </div>

            <p className="text-sm text-slate-800 leading-relaxed font-medium pt-1">
              {mem.fact}
            </p>

            <div className="text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-100 flex items-center justify-between">
              <span>Observed: {new Date(mem.createdAt).toLocaleDateString()}</span>
              <span>Relevance Weight: {mem.relevanceScore}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Workout History Log Archive */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h3 className="font-hud font-bold text-lg text-slate-900">Historical Training Logs</h3>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {completedWorkouts.length} Completed Sessions
          </span>
        </div>

        {completedWorkouts.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No completed sessions recorded yet. Finish a workout to log historical data.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {completedWorkouts.map(w => (
              <div key={w.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-sm font-bold text-slate-900">{w.title}</strong>
                    <span className="text-xs font-mono text-slate-400">{w.date}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    {w.coachingSummary || `Total volume load: ${w.totalVolumeLoadKg?.toLocaleString()} kg`}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500 mt-1">
                    <span>Duration: {w.durationMinutes}m</span>
                    <span>·</span>
                    <span>Readiness Before: {w.readinessBefore}/100</span>
                    <span>·</span>
                    <span>Movements: {w.exercises.length}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Total Load</span>
                  <strong className="font-mono text-sm text-blue-700 font-bold">
                    {w.totalVolumeLoadKg?.toLocaleString() || 0} kg
                  </strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
