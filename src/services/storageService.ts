import { 
  UserProfile, 
  ReadinessState, 
  CompletedWorkout, 
  CoachingMemory, 
  MealLog,
  WorkoutSession 
} from '../types';

const STORAGE_KEYS = {
  PROFILE: 'jarvis_profile_v2',
  READINESS: 'jarvis_readiness_v2',
  COMPLETED_WORKOUTS: 'jarvis_completed_workouts_v2',
  COACHING_MEMORY: 'jarvis_coaching_memory_v2',
  MEAL_LOGS: 'jarvis_meal_logs_v2',
  ACTIVE_WORKOUT_SESSION: 'jarvis_active_session_v2',
  CURRENT_PROGRAM_WEEK: 'jarvis_program_week_v2'
};

export const DEFAULT_PROFILE: UserProfile = {
  id: 'usr_jarvis_alpha',
  name: 'Alex Vance',
  age: 28,
  sex: 'male',
  height: 178,
  weight: 76.5,
  waist: 81,
  bodyFatPercentage: 14.5,
  weightTrend: 'stable',
  targetWeight: 74.0,
  streakDays: 14,
  goal: 'muscle_gain',
  experience: 'intermediate',
  trainingHistoryYears: 3,
  previousPrograms: ['Push Pull Legs', 'Upper Lower Hypertrophy'],
  equipment: ['barbells', 'dumbbells', 'cables', 'machines', 'gym', 'bodyweight'],
  daysPerWeek: 4,
  sessionDurationMinutes: 60,
  preferredTrainingTime: 'morning',
  preferredDays: [1, 2, 4, 5], // Mon, Tue, Thu, Fri
  limitations: ['mild_left_shoulder_impingement'],
  medicalConditions: [],
  foodAllergies: [],
  exercisesToAvoid: [],
  favoriteExercises: ['barbell_bench_press', 'romanian_deadlift', 'pull_ups'],
  dislikedExercises: ['bulgarian_split_squat'],
  preferredStyles: ['hypertrophy', 'strength'],
  dietaryPattern: 'omnivore',
  cuisinePreference: 'mixed',
  baselineRHR: 58,
  baselineSteps: 9500,
  baselineSleepHours: 7.5,
  hasCompletedAssessment: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export const DEFAULT_INITIAL_READINESS: ReadinessState = {
  score: 84,
  tier: 'optimal',
  volumeMultiplier: 1.0,
  intensityAdjustment: 'Target planned loads (RPE 7.5 - 8.5)',
  rationale: 'Resting HR (56 bpm) is 2 bpm below baseline. 7.8 hours of sleep recorded with minimal residual lower-body DOMS.',
  metrics: {
    sleepHours: 7.8,
    sleepQuality: 8,
    restingHR: 56,
    baselineRHR: 58,
    sorenessLevel: 2,
    soreMuscles: ['calves'],
    stressLevel: 3,
    nutritionAdherence: 9
  },
  updatedAt: new Date().toISOString()
};

export const INITIAL_COACHING_MEMORIES: CoachingMemory[] = [
  {
    id: 'mem_1',
    category: 'biomechanics',
    fact: 'Flat barbell bench causes mild anterior acromioclavicular pinch if grip exceeds 1.5x biacromial width. Dumbbell bench with 45° tucked elbows executes pain-free.',
    confidence: 0.95,
    relevanceScore: 0.98,
    source: 'workout_log',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'mem_2',
    category: 'recovery',
    fact: 'Sessions scheduled following less than 6.5 hours of sleep register +1.2 higher average RPE on tier-1 compound movements.',
    confidence: 0.90,
    relevanceScore: 0.92,
    source: 'readiness_checkin',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString()
  },
  {
    id: 'mem_3',
    category: 'performance',
    fact: 'Romanian Deadlift 1RM baseline estimated at 135kg with immaculate spinal neutrality up to RPE 8.5.',
    confidence: 0.88,
    relevanceScore: 0.85,
    source: 'workout_log',
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString()
  },
  {
    id: 'mem_4',
    category: 'nutrition',
    fact: 'User hits daily protein targets consistently when supplementing with whey or Greek yogurt in morning window.',
    confidence: 0.85,
    relevanceScore: 0.78,
    source: 'assessment',
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString()
  }
];

export const INITIAL_SAMPLE_WORKOUTS: CompletedWorkout[] = [
  {
    id: 'comp_1',
    workoutSessionId: 'day_1_push',
    title: 'Upper A — Progressive Chest & Delts',
    date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    startTime: '07:30',
    endTime: '08:32',
    durationMinutes: 62,
    overallRPE: 7.8,
    readinessBefore: 88,
    totalVolumeLoadKg: 8450,
    coachingSummary: 'Solid progression: Bench press hit 82.5kg x 8 reps with RPE 7.5. Clean form across all sets.',
    exercises: [
      {
        exerciseId: 'dumbbell_bench_press',
        name: 'Dumbbell Flat Bench Press',
        sets: [
          { setNumber: 1, isWarmup: false, targetLoad: 32, targetReps: 8, actualLoad: 32, actualReps: 8, rpe: 7.5, rir: 2, techniqueQuality: 5, painLevel: 0, completedAt: '07:42' },
          { setNumber: 2, isWarmup: false, targetLoad: 32, targetReps: 8, actualLoad: 32, actualReps: 8, rpe: 8.0, rir: 2, techniqueQuality: 5, painLevel: 0, completedAt: '07:46' },
          { setNumber: 3, isWarmup: false, targetLoad: 34, targetReps: 8, actualLoad: 34, actualReps: 8, rpe: 8.5, rir: 1, techniqueQuality: 4, painLevel: 0, completedAt: '07:51' }
        ]
      },
      {
        exerciseId: 'overhead_press',
        name: 'Standing Barbell Overhead Press',
        sets: [
          { setNumber: 1, isWarmup: false, targetLoad: 50, targetReps: 6, actualLoad: 50, actualReps: 6, rpe: 7.5, rir: 2, techniqueQuality: 5, painLevel: 0, completedAt: '08:02' },
          { setNumber: 2, isWarmup: false, targetLoad: 52.5, targetReps: 6, actualLoad: 52.5, actualReps: 6, rpe: 8.0, rir: 1, techniqueQuality: 5, painLevel: 0, completedAt: '08:07' }
        ]
      }
    ]
  }
];

export const INITIAL_SAMPLE_MEALS: MealLog[] = [
  {
    id: 'meal_1',
    mealType: 'breakfast',
    time: '08:45 AM',
    rawInput: 'Rolled oats with scoop of whey protein and a banana',
    totalCalories: 410,
    totalProtein: 33,
    totalCarbs: 58,
    totalFat: 5,
    totalFiber: 7,
    items: [
      { id: 'item_1', name: 'Rolled Oats', quantity: 45, unit: 'g', calories: 170, protein: 6, carbs: 30, fat: 3, fiber: 4.5, verified: true },
      { id: 'item_2', name: 'Whey Protein Isolate', quantity: 1, unit: 'scoop', calories: 120, protein: 25, carbs: 2, fat: 1, fiber: 0.5, verified: true },
      { id: 'item_3', name: 'Medium Banana', quantity: 1, unit: 'fruit', calories: 105, protein: 1.3, carbs: 27, fat: 0.3, fiber: 3.1, verified: true }
    ]
  },
  {
    id: 'meal_2',
    mealType: 'lunch',
    time: '01:15 PM',
    rawInput: '3 rotis, yellow dal tadka, and chicken curry',
    totalCalories: 620,
    totalProtein: 44,
    totalCarbs: 73,
    totalFat: 15,
    totalFiber: 13,
    items: [
      { id: 'item_4', name: 'Whole Wheat Roti', quantity: 3, unit: 'rotis', calories: 255, protein: 9.6, carbs: 52.5, fat: 1.5, fiber: 8.4, verified: true },
      { id: 'item_5', name: 'Yellow Dal Tadka', quantity: 1, unit: 'bowl', calories: 145, protein: 8.2, carbs: 21, fat: 3.5, fiber: 5, verified: true },
      { id: 'item_6', name: 'Home-style Chicken Curry', quantity: 1, unit: 'bowl', calories: 220, protein: 26, carbs: 4.5, fat: 11, fiber: 1.5, verified: true }
    ]
  }
];

export class StorageService {
  static getProfile(): UserProfile {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Storage read failed', e);
    }
    return DEFAULT_PROFILE;
  }

  static saveProfile(profile: UserProfile): void {
    profile.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }

  static getReadiness(): ReadinessState {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.READINESS);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return DEFAULT_INITIAL_READINESS;
  }

  static saveReadiness(readiness: ReadinessState): void {
    readiness.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.READINESS, JSON.stringify(readiness));
  }

  static getCompletedWorkouts(): CompletedWorkout[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.COMPLETED_WORKOUTS);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return INITIAL_SAMPLE_WORKOUTS;
  }

  static saveCompletedWorkout(workout: CompletedWorkout): void {
    const list = this.getCompletedWorkouts();
    const updated = [workout, ...list];
    localStorage.setItem(STORAGE_KEYS.COMPLETED_WORKOUTS, JSON.stringify(updated));
  }

  static getCoachingMemories(): CoachingMemory[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.COACHING_MEMORY);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return INITIAL_COACHING_MEMORIES;
  }

  static addCoachingMemory(memory: CoachingMemory): void {
    const list = this.getCoachingMemories();
    const updated = [memory, ...list];
    localStorage.setItem(STORAGE_KEYS.COACHING_MEMORY, JSON.stringify(updated));
  }

  static getMealLogs(): MealLog[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.MEAL_LOGS);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return INITIAL_SAMPLE_MEALS;
  }

  static saveMealLog(meal: MealLog): void {
    const list = this.getMealLogs();
    const updated = [meal, ...list];
    localStorage.setItem(STORAGE_KEYS.MEAL_LOGS, JSON.stringify(updated));
  }

  static deleteMealLog(id: string): void {
    const list = this.getMealLogs();
    const updated = list.filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MEAL_LOGS, JSON.stringify(updated));
  }
}
