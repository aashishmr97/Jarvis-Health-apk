import { ReadinessState, ReadinessMetrics, MuscleGroup } from '../types';

export class RecoveryEngine {
  /**
   * Calculates comprehensive bio-readiness state
   */
  static calculateReadiness(metrics: ReadinessMetrics): ReadinessState {
    // 1. Sleep score (30 pts max)
    // Target: 8 hours. 1 hr deviation = -6 pts.
    const sleepDiff = metrics.sleepHours - 8;
    let sleepPoints = 25 + (sleepDiff * 4) + (metrics.sleepQuality * 0.5);
    sleepPoints = Math.max(5, Math.min(30, sleepPoints));

    // 2. Resting Heart Rate score (25 pts max)
    // Lower or equal to baseline is ideal. Each 2 bpm above baseline costs points.
    const rhrDiff = metrics.restingHR - (metrics.baselineRHR || 60);
    let rhrPoints = 25;
    if (rhrDiff > 0) {
      rhrPoints -= rhrDiff * 2.5; // Elevating RHR suggests sympathetic overdrive
    } else {
      rhrPoints += Math.min(2, Math.abs(rhrDiff)); // Slightly lower RHR is positive vagal tone
    }
    rhrPoints = Math.max(5, Math.min(25, rhrPoints));

    // 3. Soreness score (25 pts max)
    // 0 soreness = 25 pts. 10 soreness = 0 pts.
    const sorenessPenalty = (metrics.sorenessLevel / 10) * 20;
    const muscleCountPenalty = (metrics.soreMuscles?.length || 0) * 1.5;
    let sorenessPoints = Math.max(5, 25 - sorenessPenalty - muscleCountPenalty);

    // 4. Stress & Adherence score (20 pts max)
    const stressPenalty = (metrics.stressLevel / 10) * 12;
    const adherenceBonus = (metrics.nutritionAdherence / 10) * 8;
    let stressPoints = Math.max(4, 12 - stressPenalty + adherenceBonus);

    // Total Score (0 - 100)
    const totalScore = Math.round(sleepPoints + rhrPoints + sorenessPoints + stressPoints);

    let tier: 'peak' | 'optimal' | 'moderate_fatigue' | 'recovery_required' = 'optimal';
    let volumeMultiplier = 1.0;
    let intensityAdjustment = 'Execute scheduled loads as programmed';
    let rationale = '';

    if (totalScore >= 88) {
      tier = 'peak';
      volumeMultiplier = 1.05;
      intensityAdjustment = 'Prime CNS state. Green light for progressive overload (+2.5kg or +1-2 reps).';
      rationale = `Bio-telemetry indicates superior autonomic recovery. Sleep reached ${metrics.sleepHours}h and resting HR is steady at ${metrics.restingHR} bpm.`;
    } else if (totalScore >= 75) {
      tier = 'optimal';
      volumeMultiplier = 1.0;
      intensityAdjustment = 'Maintain prescribed loads. Target RIR 1-2 across working sets.';
      rationale = `Physiological baseline is stable. ${metrics.sleepHours}h sleep with manageable DOMS (${metrics.sorenessLevel}/10). Full training stimulus indicated.`;
    } else if (totalScore >= 55) {
      tier = 'moderate_fatigue';
      volumeMultiplier = 0.85;
      intensityAdjustment = 'Autoregulate loads. Drop 1 accessory set if working RPE exceeds 8.5.';
      rationale = `Elevated systemic fatigue detected. Sleep duration (${metrics.sleepHours}h) or elevated soreness (${metrics.sorenessLevel}/10) suggests moderate residual strain. Volume trimmed by 15%.`;
    } else {
      tier = 'recovery_required';
      volumeMultiplier = 0.7;
      intensityAdjustment = 'Deload session. Reduce working weight by 20% or switch to restorative mobility.';
      rationale = `Readiness score of ${totalScore}/100 signals acute autonomic suppression or sleep deficit (${metrics.sleepHours}h). Heavy axial loads contraindicated today to prevent overtraining.`;
    }

    return {
      score: totalScore,
      tier,
      volumeMultiplier,
      intensityAdjustment,
      rationale,
      metrics,
      updatedAt: new Date().toISOString()
    };
  }
}
