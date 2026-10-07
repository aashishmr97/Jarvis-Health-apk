// ==========================================
// JARVIS CORE DOMAIN TYPES & DATA CONTRACTS
// ==========================================

export type Goal = 
  | 'fat_loss' 
  | 'muscle_gain' 
  | 'recomposition' 
  | 'strength' 
  | 'endurance' 
  | 'general_fitness' 
  | 'mobility' 
  | 'maintenance';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export type Equipment = 
  | 'gym' 
  | 'home' 
  | 'outdoors' 
  | 'bodyweight' 
  | 'dumbbells' 
  | 'barbells' 
  | 'machines' 
  | 'resistance_bands' 
  | 'cables'
  | 'kettlebells'
  | 'cardio_equipment';

export type MovementPattern = 
  | 'squat' 
  | 'hinge' 
  | 'horizontal_push' 
  | 'horizontal_pull' 
  | 'vertical_push' 
  | 'vertical_pull' 
  | 'lunge' 
  | 'carry' 
  | 'isolation' 
  | 'core' 
  | 'cardio';

export type MuscleGroup = 
  | 'chest' 
  | 'back' 
  | 'quadriceps' 
  | 'hamstrings' 
  | 'glutes' 
  | 'shoulders' 
  | 'biceps' 
  | 'triceps' 
  | 'calves' 
  | 'core' 
  | 'full_body';

export type IntensityMode = 'main' | 'lite' | 'survival';

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  sex: 'male' | 'female' | 'other';
  height: number; // in cm
  weight: number; // in kg
  targetWeight?: number; // target goal weight
  waist?: number; // in cm
  bodyFatPercentage?: number;
  weightTrend: 'losing' | 'stable' | 'gaining';
  streakDays: number; // PEAKD consistency streak
  
  // Goals & Training
  goal: Goal;
  experience: ExperienceLevel;
  trainingHistoryYears: number;
  previousPrograms: string[];
  
  // Environment & Schedule
  equipment: Equipment[];
  daysPerWeek: number;
  sessionDurationMinutes: number;
  preferredTrainingTime: 'morning' | 'afternoon' | 'evening';
  preferredDays: number[]; // 0 = Sunday, 1 = Monday, etc.
  
  // Limitations, Medical & Clinical Safety (PEAKD Safety Screening)
  limitations: string[]; // e.g., 'left_knee_pain', 'lower_back', 'rotator_cuff'
  medicalConditions: string[]; // e.g. 'high_blood_pressure', 'asthma', 'heart_condition', 'pregnancy', 'disc_injury'
  foodAllergies: string[]; // e.g. 'peanuts', 'dairy', 'gluten', 'shellfish', 'soy'
  exercisesToAvoid: string[];
  
  // Preferences
  favoriteExercises: string[];
  dislikedExercises: string[];
  preferredStyles: string[];
  dietaryPattern: 'omnivore' | 'vegetarian' | 'eggetarian' | 'vegan' | 'pescatarian';
  cuisinePreference: 'indian' | 'south_indian' | 'north_indian' | 'western' | 'mixed';
  
  // Baseline Telemetry
  baselineRHR: number;
  baselineSteps: number;
  baselineSleepHours: number;
  
  hasCompletedAssessment: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CoachMessage {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  timestamp: string;
  suggestedActions?: { label: string; action: string }[];
}

export interface PrescribedMeal {
  id: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  isCompleted: boolean;
}

export interface PlateScanResult {
  dishName: string;
  recognizedItems: {
    name: string;
    quantity: number;
    unit: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  }[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  coachingFeedback: string;
}

export interface WeeklyStandupResult {
  grade: string;
  summary: string;
  weeklyAdaptation: string;
  nextWeekFocus: string;
  recommendedMode: IntensityMode;
}

export interface ExerciseDefinition {
  id: string;
  name: string;
  targetMuscle: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  movementPattern: MovementPattern;
  requiredEquipment: Equipment[];
  tier: 'tier1_compound' | 'tier2_accessory' | 'tier3_isolation';
  setup: string;
  execution: string;
  techniqueCues: string[];
  commonMistakes: string[];
  tempo: string; // e.g., "3-0-1-0"
  warmUpRecommended: boolean;
  youtubeId: string; // Curated YouTube demonstration video
  substitutions: string[]; // ids of substitute exercises
  painContraindications: string[]; // e.g. ['knee_pain', 'lower_back']
}

export interface PlannedExercise {
  id: string;
  exerciseId: string;
  name: string;
  targetMuscle: MuscleGroup;
  movementPattern: MovementPattern;
  targetSets: number;
  targetReps: string; // e.g., "8-10" or "5"
  recommendedLoad: number; // in kg
  targetRPE: number; // Rate of Perceived Exertion (e.g. 7-9)
  targetRIR: number; // Reps In Reserve (e.g. 1-2)
  restSeconds: number;
  tempo: string;
  warmUpSets?: number;
  techniqueCues: string[];
  commonMistakes: string[];
  youtubeId: string;
  substitutions: string[];
}

export interface WorkoutSession {
  id: string;
  dayNumber: number;
  dayName: string;
  title: string;
  focus: string;
  type: 'strength' | 'hypertrophy' | 'conditioning' | 'recovery' | 'rest';
  estimatedDurationMinutes: number;
  warmUp: {
    durationMinutes: number;
    exercises: { name: string; repsOrTime: string; cue: string }[];
  };
  exercises: PlannedExercise[];
  coolDown: {
    durationMinutes: number;
    exercises: { name: string; repsOrTime: string; cue: string }[];
  };
  isCompleted?: boolean;
}

export interface SetLog {
  setNumber: number;
  isWarmup: boolean;
  targetLoad: number;
  targetReps: number;
  actualLoad: number;
  actualReps: number;
  rpe: number; // 6 to 10
  rir: number; // 0 to 4
  techniqueQuality: 1 | 2 | 3 | 4 | 5; // 5 is flawless
  painLevel: number; // 0 to 10
  painLocation?: string;
  notes?: string;
  completedAt: string;
}

export interface LoggedExercise {
  exerciseId: string;
  name: string;
  sets: SetLog[];
  wasSubstitutedFrom?: string;
  substitutionReason?: string;
}

export interface CompletedWorkout {
  id: string;
  workoutSessionId: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  exercises: LoggedExercise[];
  overallRPE: number;
  readinessBefore: number;
  totalVolumeLoadKg: number;
  userNotes?: string;
  coachingSummary?: string;
}

export interface ReadinessMetrics {
  sleepHours: number;
  sleepQuality: number; // 1-10
  restingHR: number;
  baselineRHR: number;
  sorenessLevel: number; // 0-10
  soreMuscles: MuscleGroup[];
  stressLevel: number; // 1-10
  nutritionAdherence: number; // 1-10
}

export interface ReadinessState {
  score: number; // 0-100
  tier: 'peak' | 'optimal' | 'moderate_fatigue' | 'recovery_required';
  volumeMultiplier: number; // 0.7 to 1.05
  intensityAdjustment: string; // e.g. "Maintain planned load" or "-5% load autoregulation"
  rationale: string;
  metrics: ReadinessMetrics;
  updatedAt: string;
}

export interface CoachingMemory {
  id: string;
  category: 'biomechanics' | 'recovery' | 'performance' | 'preferences' | 'nutrition' | 'schedule';
  fact: string;
  confidence: number; // 0.0 - 1.0
  relevanceScore: number;
  source: 'workout_log' | 'voice_interaction' | 'assessment' | 'readiness_checkin';
  createdAt: string;
}

export interface MacroTarget {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams: number;
  bmr: number;
  tdee: number;
}

export interface FoodItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  category?: string;
  cuisine?: string;
  verified?: boolean;
}

export interface MealLog {
  id: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  time: string;
  rawInput?: string;
  items: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
}

export interface FoodSubstitutionResult {
  originalFood: string;
  substitutions: {
    name: string;
    portion: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    why: string;
  }[];
}

export interface TodayRecommendation {
  date: string;
  readiness: ReadinessState;
  recommendedWorkout: WorkoutSession;
  rationale: string;
  keyDirectives: string[];
  coachingTone: string;
  lastTrainedDaysAgo: number;
}

// Galaxy Health / Samsung Health Realtime Telemetry
export interface GalaxyHealthTelemetry {
  connectedDevice: string;
  syncStatus: 'synced' | 'syncing' | 'idle' | 'disconnected';
  lastSyncedAt: string;
  autoSyncEnabled: boolean;
  steps: number;
  stepGoal: number;
  activeCaloriesBurned: number;
  restingHeartRate: number;
  currentHeartRate: number;
  hrvMs: number;
  stressScore: number;
  bloodOxygenSpO2: number;
  skinTemperatureDelta: number;
  sleepDurationHours: number;
  sleepScore: number;
  sleepStages: {
    deepMinutes: number;
    remMinutes: number;
    lightMinutes: number;
    awakeMinutes: number;
  };
}

// Hydration Tracking
export interface HydrationLog {
  currentMl: number;
  targetMl: number;
  lastLoggedAt: string;
  logs: { id: string; amountMl: number; timestamp: string }[];
}

// Personal Records & 1RM Calculations
export interface PersonalRecord {
  id: string;
  exerciseId: string;
  exerciseName: string;
  weightKg: number;
  reps: number;
  estimated1RMKg: number;
  achievedDate: string;
  previousBestKg?: number;
}

export interface MilestoneBadge {
  id: string;
  title: string;
  description: string;
  category: 'strength' | 'consistency' | 'volume' | 'recovery';
  unlocked: boolean;
  unlockedAt?: string;
  icon: string;
  progressPercent: number;
}

export interface CustomRoutine {
  id: string;
  name: string;
  description: string;
  targetSplit: string;
  createdAt: string;
  exercises: PlannedExercise[];
}

export type NavigationTab = 'today' | 'program' | 'nutrition' | 'coach' | 'memory';

export type AppThemeId = 
  | 'titanium_cyan' 
  | 'quantum_cobalt' 
  | 'emerald_kinetic' 
  | 'solar_amber' 
  | 'neural_violet';

export interface AppThemeConfig {
  id: AppThemeId;
  name: string;
  tagline: string;
  primaryHex: string;
  accentHex: string;
  bgHex: string;
  glowRgba: string;
  primaryButtonClass: string;
  badgeClass: string;
  borderClass: string;
  activeTabClass: string;
  gradientClass: string;
}
