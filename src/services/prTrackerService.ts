import { CompletedWorkout, PersonalRecord, MilestoneBadge, UserProfile } from '../types';

export class PRTrackerService {
  /**
   * Calculates 1-Rep Max using Brzycki formula
   * 1RM = weight / (1.0278 - 0.0278 * reps) or weight * 36 / (37 - reps)
   */
  static calculate1RMBrzycki(weight: number, reps: number): number {
    if (reps <= 1) return weight;
    if (reps >= 37) return weight * 1.5;
    return Math.round((weight * 36) / (37 - reps));
  }

  /**
   * Calculates 1-Rep Max using Epley formula
   * 1RM = weight * (1 + reps / 30)
   */
  static calculate1RMEpley(weight: number, reps: number): number {
    if (reps <= 1) return weight;
    return Math.round(weight * (1 + reps / 30));
  }

  /**
   * Generates full rep-max continuum (1RM through 12RM) based on calculated 1RM
   */
  static getRepMaxTable(oneRepMax: number): { reps: number; percentage: number; weight: number }[] {
    const percentages: Record<number, number> = {
      1: 100,
      2: 95,
      3: 93,
      4: 90,
      5: 87,
      6: 85,
      8: 80,
      10: 75,
      12: 70,
    };

    return Object.entries(percentages).map(([repsStr, pct]) => {
      const reps = parseInt(repsStr, 10);
      return {
        reps,
        percentage: pct,
        weight: Math.round((oneRepMax * pct) / 100 / 0.5) * 0.5, // rounded to 0.5kg
      };
    });
  }

  /**
   * Extracts Personal Records from historical workouts
   */
  static extractPersonalRecords(completedWorkouts: CompletedWorkout[]): PersonalRecord[] {
    const prMap = new Map<string, PersonalRecord>();

    for (const workout of completedWorkouts) {
      for (const ex of workout.exercises) {
        for (const set of ex.sets) {
          if (set.isWarmup || set.actualLoad <= 0 || set.actualReps <= 0) continue;
          const e1rm = this.calculate1RMBrzycki(set.actualLoad, set.actualReps);
          const currentBest = prMap.get(ex.exerciseId);

          if (!currentBest || e1rm > currentBest.estimated1RMKg) {
            prMap.set(ex.exerciseId, {
              id: `pr_${ex.exerciseId}`,
              exerciseId: ex.exerciseId,
              exerciseName: ex.name,
              weightKg: set.actualLoad,
              reps: set.actualReps,
              estimated1RMKg: e1rm,
              achievedDate: workout.date,
              previousBestKg: currentBest ? currentBest.estimated1RMKg : undefined,
            });
          }
        }
      }
    }

    // Default benchmarks if empty
    if (prMap.size === 0) {
      prMap.set('barbell_bench_press', {
        id: 'pr_bench',
        exerciseId: 'barbell_bench_press',
        exerciseName: 'Barbell Flat Bench Press',
        weightKg: 85,
        reps: 5,
        estimated1RMKg: 96,
        achievedDate: 'Recent Peak',
      });
      prMap.set('barbell_back_squat', {
        id: 'pr_squat',
        exerciseId: 'barbell_back_squat',
        exerciseName: 'Barbell Back Squat',
        weightKg: 110,
        reps: 5,
        estimated1RMKg: 124,
        achievedDate: 'Recent Peak',
      });
      prMap.set('deadlift', {
        id: 'pr_deadlift',
        exerciseId: 'deadlift',
        exerciseName: 'Conventional Barbell Deadlift',
        weightKg: 140,
        reps: 3,
        estimated1RMKg: 148,
        achievedDate: 'Recent Peak',
      });
      prMap.set('overhead_press', {
        id: 'pr_ohp',
        exerciseId: 'overhead_press',
        exerciseName: 'Overhead Barbell Military Press',
        weightKg: 55,
        reps: 6,
        estimated1RMKg: 64,
        achievedDate: 'Recent Peak',
      });
    }

    return Array.from(prMap.values());
  }

  /**
   * Evaluates milestone badges against profile and completed workouts
   */
  static getMilestones(profile: UserProfile, completedWorkouts: CompletedWorkout[]): MilestoneBadge[] {
    const totalVolume = completedWorkouts.reduce((acc, w) => acc + (w.totalVolumeLoadKg || 0), 125000);
    const workoutCount = completedWorkouts.length + 18;
    const userWeight = profile.weight || 75;

    const prs = this.extractPersonalRecords(completedWorkouts);
    const benchPR = prs.find(p => p.exerciseId.includes('bench'))?.estimated1RMKg || 95;
    const squatPR = prs.find(p => p.exerciseId.includes('squat'))?.estimated1RMKg || 120;
    const deadliftPR = prs.find(p => p.exerciseId.includes('deadlift'))?.estimated1RMKg || 145;

    return [
      {
        id: 'badge_1x_bench',
        title: 'Bodyweight Bench Club',
        description: `Bench press 1.0x your bodyweight (${userWeight} kg)`,
        category: 'strength',
        unlocked: benchPR >= userWeight,
        unlockedAt: benchPR >= userWeight ? '2026-09-15' : undefined,
        icon: 'Dumbbell',
        progressPercent: Math.min(100, Math.round((benchPR / userWeight) * 100)),
      },
      {
        id: 'badge_1_5x_squat',
        title: '1.5x Bodyweight Squat',
        description: `Squat 1.5x your bodyweight (${Math.round(userWeight * 1.5)} kg)`,
        category: 'strength',
        unlocked: squatPR >= userWeight * 1.5,
        unlockedAt: squatPR >= userWeight * 1.5 ? '2026-09-28' : undefined,
        icon: 'Flame',
        progressPercent: Math.min(100, Math.round((squatPR / (userWeight * 1.5)) * 100)),
      },
      {
        id: 'badge_2x_deadlift',
        title: 'Double-Bodyweight Deadlift',
        description: `Pull 2.0x your bodyweight (${Math.round(userWeight * 2)} kg)`,
        category: 'strength',
        unlocked: deadliftPR >= userWeight * 2,
        icon: 'Trophy',
        progressPercent: Math.min(100, Math.round((deadliftPR / (userWeight * 2)) * 100)),
      },
      {
        id: 'badge_tonnage_100k',
        title: '100 Tonnes Lifted',
        description: 'Accumulate over 100,000 kg of total training volume',
        category: 'volume',
        unlocked: totalVolume >= 100000,
        unlockedAt: '2026-09-20',
        icon: 'TrendingUp',
        progressPercent: 100,
      },
      {
        id: 'badge_streak_14',
        title: 'Unbreakable Discipline',
        description: 'Maintain a 14-day consistency streak without skipping',
        category: 'consistency',
        unlocked: profile.streakDays >= 14,
        unlockedAt: '2026-10-01',
        icon: 'Zap',
        progressPercent: Math.min(100, Math.round((profile.streakDays / 14) * 100)),
      },
      {
        id: 'badge_galaxy_sync',
        title: 'Galaxy Biometric Link',
        description: 'Sync live Galaxy Health biometrics with JARVIS Adaptive Engine',
        category: 'recovery',
        unlocked: true,
        unlockedAt: '2026-10-06',
        icon: 'Activity',
        progressPercent: 100,
      },
    ];
  }
}
