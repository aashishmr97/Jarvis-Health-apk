import { CoachingMemory, UserProfile, SetLog } from '../types';
import { StorageService } from './storageService';

export class CoachingMemoryService {
  /**
   * Retrieves all memories sorted by relevance and recency
   */
  static getMemories(): CoachingMemory[] {
    return StorageService.getCoachingMemories();
  }

  /**
   * Finds memories relevant to a specific exercise or muscle group
   */
  static getMemoriesForExercise(exerciseId: string, exerciseName: string): CoachingMemory[] {
    const list = this.getMemories();
    const q1 = exerciseId.toLowerCase();
    const q2 = exerciseName.toLowerCase();

    return list.filter(m => {
      const text = m.fact.toLowerCase();
      return text.includes(q1) || text.includes(q2);
    });
  }

  /**
   * Adds an automatically inferred coaching insight
   */
  static recordWorkoutInsight(
    exerciseName: string,
    setLog: SetLog,
    context: string
  ): CoachingMemory | null {
    let fact = '';
    let category: CoachingMemory['category'] = 'performance';

    if (setLog.painLevel >= 4) {
      category = 'biomechanics';
      fact = `Pain registered (${setLog.painLevel}/10) in ${setLog.painLocation || 'joint'} during ${exerciseName} at ${setLog.actualLoad}kg. Requires biomechanical modification or substitution.`;
    } else if (setLog.rpe >= 9.5 && setLog.actualReps < setLog.targetReps) {
      category = 'performance';
      fact = `${exerciseName} hit early technical failure at ${setLog.actualLoad}kg (${setLog.actualReps}/${setLog.targetReps} reps). Recommended load ceiling is ${Math.round(setLog.actualLoad * 0.95)}kg.`;
    } else if (setLog.techniqueQuality === 5 && setLog.rpe <= 7.0) {
      category = 'performance';
      fact = `Flawless mechanical stability on ${exerciseName} at ${setLog.actualLoad}kg. Readiness for +2.5kg to +5kg progression demonstrated.`;
    }

    if (!fact) return null;

    const memory: CoachingMemory = {
      id: `mem_${Date.now()}`,
      category,
      fact,
      confidence: 0.92,
      relevanceScore: 0.95,
      source: 'workout_log',
      createdAt: new Date().toISOString()
    };

    StorageService.addCoachingMemory(memory);
    return memory;
  }
}
