import { 
  UserProfile, 
  WorkoutSession, 
  PlannedExercise, 
  ExerciseDefinition, 
  CompletedWorkout, 
  SetLog,
  ReadinessState
} from '../types';
import { EXERCISE_LIBRARY } from '../data/exerciseLibrary';

export class TrainingEngine {
  /**
   * Adapts workout session to user's daily reality:
   * - Main: Standard scheduled session (60m)
   * - Lite: Short on time (30m, top 3 compound exercises)
   * - Survival: Low energy / tough day (15m, preserves streak and non-zero momentum)
   */
  static getWorkoutByIntensity(
    workout: WorkoutSession,
    mode: 'main' | 'lite' | 'survival'
  ): WorkoutSession {
    if (mode === 'main' || workout.type === 'recovery' || workout.type === 'rest') {
      return workout;
    }

    if (mode === 'lite') {
      const top3 = workout.exercises.slice(0, 3).map(ex => ({
        ...ex,
        targetSets: 2,
        restSeconds: Math.max(60, Math.round(ex.restSeconds * 0.75))
      }));
      return {
        ...workout,
        title: `${workout.title.split('(')[0].trim()} (Lite)`,
        focus: `${workout.focus} · Condensed 30-min Density`,
        estimatedDurationMinutes: 30,
        exercises: top3
      };
    }

    // Survival Mode (15m)
    const survivalEx = workout.exercises.slice(0, 2).map(ex => ({
      ...ex,
      targetSets: 2,
      targetReps: '12-15',
      recommendedLoad: Math.max(5, Math.round((ex.recommendedLoad * 0.5) / 2.5) * 2.5),
      targetRPE: 6.5,
      targetRIR: 3,
      restSeconds: 60
    }));

    return {
      ...workout,
      title: `${workout.title.split('(')[0].trim()} (Survival)`,
      focus: 'Streak Protection & Non-Zero Recovery (15m)',
      estimatedDurationMinutes: 15,
      exercises: survivalEx
    };
  }
  /**
   * Generates a calibrated 7-day training schedule matching the user's profile and equipment
   */
  static generateWeeklyProgram(profile: UserProfile, readiness?: ReadinessState): WorkoutSession[] {
    const days: WorkoutSession[] = [];
    const isStrengthOrMuscle = profile.goal === 'muscle_gain' || profile.goal === 'strength' || profile.goal === 'recomposition';

    // Base splits:
    // 4 days: Upper A, Lower A, Rest, Upper B, Lower B, Active Recovery, Rest
    // 3 days: Full Body A, Rest, Full Body B, Rest, Full Body C, Rest, Rest
    // 5 days: Push, Pull, Legs, Upper, Lower, Active Recovery, Rest
    const trainingDaysCount = profile.daysPerWeek || 4;

    if (trainingDaysCount <= 3) {
      // 3-day Full Body split
      days.push(
        this.createWorkoutSession(1, 'Monday', 'Full Body Alpha', 'Compound Foundations', 'strength', [
          'barbell_back_squat',
          'barbell_bench_press',
          'chest_supported_row',
          'overhead_press',
          'hanging_knee_raises'
        ], profile),
        this.createRestDay(2, 'Tuesday', 'Active Recovery & Tissue Care'),
        this.createWorkoutSession(3, 'Wednesday', 'Full Body Beta', 'Hinge & Pull Dynamics', 'hypertrophy', [
          'barbell_deadlift',
          'incline_dumbbell_press',
          'lat_pulldown',
          'goblet_squat',
          'lateral_raises'
        ], profile),
        this.createRestDay(4, 'Thursday', 'Physiological Rest'),
        this.createWorkoutSession(5, 'Friday', 'Full Body Gamma', 'Unilateral & Upper Density', 'hypertrophy', [
          'bulgarian_split_squat',
          'dumbbell_bench_press',
          'pull_ups',
          'romanian_deadlift',
          'triceps_rope_pushdown'
        ], profile),
        this.createRestDay(6, 'Saturday', 'Aerobic Flush & Mobility'),
        this.createRestDay(7, 'Sunday', 'Complete Rest')
      );
    } else {
      // 4-day Upper/Lower split (Gold Standard for intermediate/advanced)
      days.push(
        this.createWorkoutSession(1, 'Monday', 'Upper A — Heavy Push & Horizontal Pull', 'Chest, Shoulders & Back Density', 'strength', [
          'barbell_bench_press',
          'chest_supported_row',
          'overhead_press',
          'lat_pulldown',
          'lateral_raises',
          'barbell_biceps_curl'
        ], profile),
        this.createWorkoutSession(2, 'Tuesday', 'Lower A — Quad Dominance & Posterior Chain', 'Knee Flexion & Glute Drive', 'strength', [
          'barbell_back_squat',
          'romanian_deadlift',
          'bulgarian_split_squat',
          'hanging_knee_raises'
        ], profile),
        this.createRestDay(3, 'Wednesday', 'Active Recovery & Aerobic Flushes'),
        this.createWorkoutSession(4, 'Thursday', 'Upper B — Vertical Dynamics & Hypertrophy', 'Shoulders, Lats & Upper Chest', 'hypertrophy', [
          'incline_dumbbell_press',
          'pull_ups',
          'seated_dumbbell_shoulder_press',
          'cable_face_pull',
          'triceps_rope_pushdown'
        ], profile),
        this.createWorkoutSession(5, 'Friday', 'Lower B — Hinge Overload & Unilateral Work', 'Hamstrings, Quads & Glute Strength', 'hypertrophy', [
          'barbell_deadlift',
          'leg_press',
          'goblet_squat',
          'hanging_knee_raises'
        ], profile),
        this.createRestDay(6, 'Saturday', 'Mobility & Zone 2 Cardio Flush'),
        this.createRestDay(7, 'Sunday', 'CNS Regeneration & Rest')
      );
    }

    return days;
  }

  private static createWorkoutSession(
    dayNumber: number,
    dayName: string,
    title: string,
    focus: string,
    type: 'strength' | 'hypertrophy',
    exerciseIds: string[],
    profile: UserProfile
  ): WorkoutSession {
    const plannedExercises: PlannedExercise[] = [];

    for (const id of exerciseIds) {
      let def = EXERCISE_LIBRARY[id];
      if (!def) continue;

      // Filter against user limitations or missing equipment
      const hasLimitation = def.painContraindications.some(p => profile.limitations.includes(p));
      const hasEquipment = def.requiredEquipment.some(eq => profile.equipment.includes(eq) || eq === 'bodyweight');

      if (hasLimitation || !hasEquipment) {
        // Substitute immediately
        const sub = this.findIntelligentSubstitution(def, profile, 'Equipment or pain avoidance');
        if (sub) {
          def = sub;
        }
      }

      // Determine starting calibrated load based on tier and experience
      const baseLoad = this.calculateEstimatedStartingLoad(def, profile);
      const isTier1 = def.tier === 'tier1_compound';

      plannedExercises.push({
        id: `pe_${def.id}_${dayNumber}`,
        exerciseId: def.id,
        name: def.name,
        targetMuscle: def.targetMuscle,
        movementPattern: def.movementPattern,
        targetSets: isTier1 ? 3 : 3,
        targetReps: isTier1 ? (type === 'strength' ? '5-6' : '8-10') : '10-12',
        recommendedLoad: baseLoad,
        targetRPE: isTier1 ? 8.0 : 8.5,
        targetRIR: isTier1 ? 2 : 1,
        restSeconds: isTier1 ? 120 : 90,
        tempo: def.tempo,
        warmUpSets: isTier1 ? 2 : 0,
        techniqueCues: def.techniqueCues,
        commonMistakes: def.commonMistakes,
        youtubeId: def.youtubeId,
        substitutions: def.substitutions
      });
    }

    return {
      id: `session_day_${dayNumber}`,
      dayNumber,
      dayName,
      title,
      focus,
      type,
      estimatedDurationMinutes: profile.sessionDurationMinutes || 60,
      warmUp: {
        durationMinutes: 8,
        exercises: [
          { name: 'Cat-Cow & Thoracic Spine Rotations', repsOrTime: '10 reps each side', cue: 'Mobilize spinal segments before axial loading' },
          { name: 'Band Pull-Aparts / Scapular Shrugs', repsOrTime: '15 reps', cue: 'Activate mid-traps and rotators' },
          { name: 'Glute Bridges & Hip 90/90s', repsOrTime: '10 reps with 2s hold', cue: 'Wake up posterior chain stabilizers' }
        ]
      },
      exercises: plannedExercises,
      coolDown: {
        durationMinutes: 6,
        exercises: [
          { name: 'Down-Dog to Cobra Breathing Flow', repsOrTime: '2 mins slow nasal breath', cue: 'Downregulate nervous system into parasympathetic mode' },
          { name: 'Standing Quad & Lats Stretch', repsOrTime: '45s each limb', cue: 'Decompress loaded joints' }
        ]
      }
    };
  }

  private static createRestDay(dayNumber: number, dayName: string, focus: string): WorkoutSession {
    return {
      id: `session_day_${dayNumber}`,
      dayNumber,
      dayName,
      title: 'Rest & Neural Recovery',
      focus,
      type: 'recovery',
      estimatedDurationMinutes: 20,
      warmUp: { durationMinutes: 0, exercises: [] },
      exercises: [],
      coolDown: {
        durationMinutes: 15,
        exercises: [
          { name: '20-Minute Zone 1 Walking', repsOrTime: '20 mins', cue: 'Promote capillary blood flow and accelerate metabolic waste clearance' },
          { name: 'Hip Capsule & Thoracic Foam Rolling', repsOrTime: '5 mins', cue: 'Myofascial relaxation' }
        ]
      }
    };
  }

  /**
   * Intelligently selects substitute based on movement pattern, target muscle, available equipment, and safety
   */
  static findIntelligentSubstitution(
    current: ExerciseDefinition,
    profile: UserProfile,
    reason: string
  ): ExerciseDefinition | null {
    // 1. Check curated explicit substitutions
    for (const subId of current.substitutions) {
      const candidate = EXERCISE_LIBRARY[subId];
      if (!candidate) continue;

      // Ensure candidate does not violate limitations
      const violatesLimitation = candidate.painContraindications.some(p => profile.limitations.includes(p));
      const hasEquipment = candidate.requiredEquipment.some(eq => profile.equipment.includes(eq) || eq === 'bodyweight');

      if (!violatesLimitation && hasEquipment) {
        return candidate;
      }
    }

    // 2. Fallback search by movement pattern & target muscle
    for (const candidate of Object.values(EXERCISE_LIBRARY)) {
      if (candidate.id === current.id) continue;
      if (candidate.movementPattern === current.movementPattern || candidate.targetMuscle === current.targetMuscle) {
        const violatesLimitation = candidate.painContraindications.some(p => profile.limitations.includes(p));
        const hasEquipment = candidate.requiredEquipment.some(eq => profile.equipment.includes(eq) || eq === 'bodyweight');
        if (!violatesLimitation && hasEquipment) {
          return candidate;
        }
      }
    }

    return null;
  }

  /**
   * Real-time Progressive Overload Decision Engine
   * Evaluates logged set and determines the next target load/reps/action
   */
  static evaluateSetProgression(
    loggedSet: SetLog,
    plannedExercise: PlannedExercise,
    history: CompletedWorkout[]
  ): {
    nextLoad: number;
    nextReps: number;
    decisionReason: string;
    action: 'increase_load' | 'increase_reps' | 'maintain' | 'reduce_load' | 'substitute_injury';
  } {
    // Safety check: acute pain override
    if (loggedSet.painLevel >= 4) {
      return {
        nextLoad: Math.max(0, loggedSet.actualLoad * 0.7),
        nextReps: loggedSet.actualReps,
        decisionReason: `SAFETY OVERRIDE: Pain level ${loggedSet.painLevel}/10 detected in ${loggedSet.painLocation || 'joint'}. Load reduced 30%. Consider immediate exercise substitution.`,
        action: 'substitute_injury'
      };
    }

    // Technique failure check
    if (loggedSet.techniqueQuality <= 2) {
      return {
        nextLoad: loggedSet.actualLoad,
        nextReps: loggedSet.actualReps,
        decisionReason: 'Technique score dropped below threshold (<= 2/5). Maintain current load; lock in bar path and tempo.',
        action: 'maintain'
      };
    }

    // Undershot target RPE (too easy) -> RPE <= 7.0 when target was 8.0+
    if (loggedSet.rpe <= 7.0 && loggedSet.techniqueQuality >= 4) {
      const increment = loggedSet.actualLoad >= 60 ? 5.0 : 2.5;
      return {
        nextLoad: loggedSet.actualLoad + increment,
        nextReps: loggedSet.actualReps,
        decisionReason: `RPE ${loggedSet.rpe} was below target (${plannedExercise.targetRPE}). Form was pristine (${loggedSet.techniqueQuality}/5). Autoregulating load up +${increment}kg.`,
        action: 'increase_load'
      };
    }

    // Overshot target RPE (too hard / grinder) -> RPE >= 9.5
    if (loggedSet.rpe >= 9.5 || loggedSet.rir === 0) {
      return {
        nextLoad: Math.max(0, loggedSet.actualLoad - 2.5),
        nextReps: loggedSet.actualReps,
        decisionReason: `RPE ${loggedSet.rpe} indicated near-failure. Dropping load 2.5kg to manage central nervous system fatigue and preserve volume quality.`,
        action: 'reduce_load'
      };
    }

    // In the sweet spot (RPE 7.5 - 8.5)
    return {
      nextLoad: loggedSet.actualLoad,
      nextReps: loggedSet.actualReps,
      decisionReason: `Performance aligned with target RPE ${loggedSet.rpe} (RIR ${loggedSet.rir}). Hold load steady for remaining sets.`,
      action: 'maintain'
    };
  }

  /**
   * Epley 1RM formula calculation
   */
  static calculateEstimated1RM(weightKg: number, reps: number): number {
    if (reps <= 0 || weightKg <= 0) return 0;
    if (reps === 1) return weightKg;
    // Epley Formula: 1RM = weight * (1 + reps / 30)
    return Math.round((weightKg * (1 + reps / 30)) * 10) / 10;
  }

  private static calculateEstimatedStartingLoad(def: ExerciseDefinition, profile: UserProfile): number {
    const isMale = profile.sex === 'male';
    const bw = profile.weight || 75;
    const isAdv = profile.experience === 'advanced';
    const isBeg = profile.experience === 'beginner';

    let mult = 0.5;
    if (def.id === 'barbell_bench_press') mult = isMale ? (isAdv ? 1.1 : isBeg ? 0.6 : 0.85) : 0.45;
    else if (def.id === 'barbell_back_squat') mult = isMale ? (isAdv ? 1.4 : isBeg ? 0.75 : 1.05) : 0.65;
    else if (def.id === 'barbell_deadlift') mult = isMale ? (isAdv ? 1.6 : isBeg ? 0.9 : 1.25) : 0.8;
    else if (def.id === 'overhead_press') mult = isMale ? 0.55 : 0.3;
    else if (def.id === 'dumbbell_bench_press') mult = isMale ? 0.38 : 0.22; // per hand
    else if (def.id === 'goblet_squat') mult = 0.25;
    else if (def.id === 'chest_supported_row') mult = 0.28;
    else mult = 0.2;

    const raw = bw * mult;
    // Round to nearest 2.5kg plate increment
    return Math.max(10, Math.round(raw / 2.5) * 2.5);
  }
}
