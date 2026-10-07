import { UserProfile, ReadinessState, WorkoutSession, CoachingMemory, CompletedWorkout } from '../types';
import { NutritionEngine } from './nutritionEngine';

export class GeminiService {
  /**
   * Request adaptive coaching analysis for "What should I do today, and why?"
   */
  static async getDailyCoachingAnalysis(params: {
    profile: UserProfile;
    readiness: ReadinessState;
    todayWorkout: WorkoutSession;
    memory: CoachingMemory[];
    lastWorkouts: CompletedWorkout[];
  }): Promise<{
    rationale: string;
    keyDirectives: string[];
    loadAdjustment?: string;
    readinessTakeaway?: string;
  }> {
    try {
      const res = await fetch('/api/gemini/coaching-daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend coaching call failed, using deterministic fallback', e);
    }

    // High-performance deterministic fallback
    const { readiness, todayWorkout, profile } = params;
    const isPeak = readiness.score >= 88;
    const isTired = readiness.score < 60;

    return {
      rationale: isTired
        ? `Readiness score of ${readiness.score}/100 indicates systemic autonomic suppression. Sleep was limited to ${readiness.metrics.sleepHours}h with residual soreness (${readiness.metrics.sorenessLevel}/10). We are autoregulating today's volume on ${todayWorkout.title} to manage fatigue and preserve joint integrity.`
        : isPeak
        ? `Readiness is primed at ${readiness.score}/100 with resting HR steady at ${readiness.metrics.restingHR} bpm. Today is scheduled for ${todayWorkout.title}. Neural recovery is optimal to attack progressive overload (+2.5kg or +1 rep) on your primary compound.`
        : `Your bio-readiness is stable at ${readiness.score}/100. Rest and tissue readiness support ${todayWorkout.title}. Execute planned loads targeting an RIR of 1-2 on working sets.`,
      keyDirectives: [
        `Anchor focus on ${todayWorkout.exercises[0]?.name || 'compound movements'} with steady 3-second eccentric tempo`,
        isTired ? 'Cap RPE at 8.0 — do not grind reps to mechanical failure' : 'Target +1 rep over your previous baseline on final working set',
        `Ensure post-training nutrition targets ${Math.round(profile.weight * 2.1)}g total daily protein`
      ],
      loadAdjustment: isTired ? 'decrease_10_percent' : isPeak ? 'increase_2_5kg' : 'maintain',
      readinessTakeaway: readiness.rationale
    };
  }

  /**
   * Parse natural language food log
   */
  static async parseNaturalFoodLog(query: string) {
    try {
      const res = await fetch('/api/gemini/parse-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend food parse failed, using offline catalog', e);
    }

    return NutritionEngine.parseFoodTextOffline(query);
  }

  /**
   * Process natural voice command during workout
   */
  static async processVoiceCommand(params: {
    transcript: string;
    currentExercise: any;
    currentSet: number;
    currentWeight: number;
  }) {
    try {
      const res = await fetch('/api/gemini/voice-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Voice command server call failed, using heuristic rules', e);
    }

    // Heuristic rule parser fallback
    const t = params.transcript.toLowerCase();
    let action = 'complete_set';
    let deltaWeight = 0;
    let spokenResponse = 'Set completed. Rest timer started.';

    if (t.includes('add 5') || t.includes('add five')) {
      action = 'increase_weight';
      deltaWeight = 5;
      spokenResponse = 'Adding 5 kilos for next set.';
    } else if (t.includes('add 2.5') || t.includes('too easy') || t.includes('increase')) {
      action = 'increase_weight';
      deltaWeight = 2.5;
      spokenResponse = 'Adding 2.5 kilos for next set.';
    } else if (t.includes('too hard') || t.includes('reduce') || t.includes('drop')) {
      action = 'decrease_weight';
      deltaWeight = -2.5;
      spokenResponse = 'Dropping 2.5 kilos. Form integrity first.';
    } else if (t.includes('hurt') || t.includes('pain') || t.includes('replace') || t.includes('substitute')) {
      action = 'substitute_exercise';
      spokenResponse = 'Pain noted. Selecting an intelligent biomechanical substitute.';
    } else if (t.includes('skip') || t.includes('ready')) {
      action = 'skip_rest';
      spokenResponse = 'Rest skipped. Ready for next set.';
    }

    return { action, deltaWeight, spokenResponse };
  }

  /**
   * Generate food substitutions
   */
  static async getFoodSubstitution(foodToReplace: string, reason?: string, dietaryPreference?: string) {
    try {
      const res = await fetch('/api/gemini/food-substitution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foodToReplace, reason, dietaryPreference })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend food substitution failed, using offline rules', e);
    }

    return NutritionEngine.getSmartFoodSubstitutions(foodToReplace, reason || 'high protein');
  }
}
