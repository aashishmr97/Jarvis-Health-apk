package com.jarvis.fitness.model

enum class IntensityMode {
    MAIN, LITE, SURVIVAL
}

enum class AppThemeId {
    TITANIUM_CYAN, QUANTUM_COBALT, EMERALD_KINETIC, SOLAR_AMBER, NEURAL_VIOLET
}

data class UserProfile(
    val id: String = "user_default",
    val name: String = "Athlete",
    val weightKg: Double = 78.5,
    val heightCm: Double = 178.0,
    val targetWeightKg: Double = 82.0,
    val baselineRHR: Int = 58,
    val baselineHRV: Int = 65,
    val goal: String = "hypertrophy",
    val experience: String = "intermediate",
    val streakDays: Int = 14,
    val daysPerWeek: Int = 4,
    val targetCalories: Int = 2650,
    val targetProteinGrams: Int = 165,
    val cuisinePreference: String = "indian",
    val dietaryPattern: String = "vegetarian",
    val equipment: List<String> = listOf("Barbell", "Dumbbells", "Bench", "Cable Tower", "Squat Rack"),
    val limitations: List<String> = emptyList()
)

data class ReadinessState(
    val score: Int = 85,
    val tier: String = "peak",
    val rationale: String = "Parasympathetic recovery status is optimal with elevated HRV (68ms) and 7.8 hours restorative sleep architecture.",
    val intensityAdjustment: String = "Full volume approved. Progressive overload +2.5kg recommended.",
    val timestamp: String = "Today, 06:30 AM"
)

data class ExerciseSet(
    val setNumber: Int,
    val prescribedReps: Int,
    val targetRpe: Double = 8.0,
    val recommendedLoadKg: Double,
    var completedReps: Int? = null,
    var actualLoadKg: Double? = null,
    var completed: Boolean = false
)

data class PlannedExercise(
    val id: String,
    val name: String,
    val primaryMuscle: String,
    val sets: List<ExerciseSet>,
    val restSeconds: Int = 90,
    val notes: String = "",
    val videoId: String = ""
)

data class WorkoutSession(
    val id: String,
    val title: String,
    val focus: String,
    val dayOfWeek: String,
    val estimatedDurationMinutes: Int = 45,
    val exercises: List<PlannedExercise>,
    val isCompleted: Boolean = false
)

data class SleepStages(
    val deepMinutes: Int = 95,
    val remMinutes: Int = 110,
    val lightMinutes: Int = 240,
    val awakeMinutes: Int = 25
)

data class GalaxyHealthTelemetry(
    val connectedDevice: String = "Samsung Galaxy Watch Ultra (Bluetooth/Wi-Fi)",
    val isSynced: Boolean = true,
    val lastSyncedAt: String = "Just now",
    val currentHeartRate: Int = 64,
    val restingHeartRate: Int = 58,
    val hrvMs: Int = 68,
    val stepsToday: Int = 8420,
    val stepGoal: Int = 10000,
    val activeBurnKcal: Int = 520,
    val sleepDurationHours: Double = 7.8,
    val sleepScore: Int = 88,
    val bloodOxygenSpO2: Int = 98,
    val skinTempDeltaCelsius: Double = 0.1,
    val sleepStages: SleepStages = SleepStages()
)

data class MealLog(
    val id: String,
    val name: String,
    val calories: Int,
    val proteinGrams: Double,
    val carbsGrams: Double,
    val fatGrams: Double,
    val mealType: String,
    val timestamp: String
)

data class CoachingMemory(
    val id: String,
    val category: String,
    val insight: String,
    val actionableRule: String,
    val recordedAt: String
)

data class CoachMessage(
    val id: String,
    val sender: String, // "coach" or "user"
    val text: String,
    val timestamp: String,
    val suggestedActions: List<String> = emptyList()
)
