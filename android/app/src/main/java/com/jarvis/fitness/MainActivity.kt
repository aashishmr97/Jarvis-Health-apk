package com.jarvis.fitness

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import com.jarvis.fitness.model.*
import com.jarvis.fitness.service.GalaxyHealthService
import com.jarvis.fitness.service.GeminiService
import com.jarvis.fitness.ui.screens.*
import com.jarvis.fitness.ui.theme.JarvisTheme

class MainActivity : ComponentActivity() {
    private val galaxyHealthService = GalaxyHealthService()
    private val geminiService = GeminiService()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            var activeTab by remember { mutableStateOf("today") }
            var activeTheme by remember { mutableStateOf(AppThemeId.TITANIUM_CYAN) }
            var intensityMode by remember { mutableStateOf(IntensityMode.MAIN) }

            val profile by remember { mutableStateOf(UserProfile()) }
            val telemetry by galaxyHealthService.telemetry.collectAsState()
            var readiness by remember { mutableStateOf(galaxyHealthService.calculateReadiness(telemetry)) }

            val todayWorkout by remember {
                mutableStateOf(
                    WorkoutSession(
                        id = "workout_upper_1",
                        title = "Upper Body Hypertrophy & Overload",
                        focus = "Chest, Lats & Deltoid Volume",
                        dayOfWeek = "Monday",
                        estimatedDurationMinutes = 45,
                        exercises = listOf(
                            PlannedExercise(
                                id = "bench_press",
                                name = "Barbell Bench Press",
                                primaryMuscle = "Chest",
                                sets = listOf(
                                    ExerciseSet(1, 8, 8.0, 75.0),
                                    ExerciseSet(2, 8, 8.0, 75.0),
                                    ExerciseSet(3, 8, 8.5, 75.0)
                                )
                            ),
                            PlannedExercise(
                                id = "lat_pulldown",
                                name = "Lat Pulldown (Neutral Grip)",
                                primaryMuscle = "Lats",
                                sets = listOf(
                                    ExerciseSet(1, 10, 8.0, 65.0),
                                    ExerciseSet(2, 10, 8.0, 65.0),
                                    ExerciseSet(3, 10, 8.5, 65.0)
                                )
                            ),
                            PlannedExercise(
                                id = "incline_dumbbell_press",
                                name = "Incline Dumbbell Press",
                                primaryMuscle = "Upper Chest",
                                sets = listOf(
                                    ExerciseSet(1, 10, 8.0, 26.0),
                                    ExerciseSet(2, 10, 8.0, 26.0),
                                    ExerciseSet(3, 10, 8.5, 26.0)
                                )
                            )
                        )
                    )
                )
            }

            JarvisTheme(themeId = activeTheme) {
                Scaffold(
                    modifier = Modifier.fillMaxSize(),
                    bottomBar = {
                        NavigationBar(
                            containerColor = MaterialTheme.colorScheme.surface,
                            tonalElevation = NavigationBarDefaults.Elevation
                        ) {
                            NavigationBarItem(
                                selected = activeTab == "today",
                                onClick = { activeTab = "today" },
                                icon = { Icon(Icons.Default.Bolt, contentDescription = "Today") },
                                label = { Text("Today") }
                            )
                            NavigationBarItem(
                                selected = activeTab == "program",
                                onClick = { activeTab = "program" },
                                icon = { Icon(Icons.Default.CalendarMonth, contentDescription = "Program") },
                                label = { Text("Program") }
                            )
                            NavigationBarItem(
                                selected = activeTab == "nutrition",
                                onClick = { activeTab = "nutrition" },
                                icon = { Icon(Icons.Default.Restaurant, contentDescription = "Nutrition") },
                                label = { Text("Nutrition") }
                            )
                            NavigationBarItem(
                                selected = activeTab == "coach",
                                onClick = { activeTab = "coach" },
                                icon = { Icon(Icons.Default.SmartToy, contentDescription = "AI Coach") },
                                label = { Text("AI Coach") }
                            )
                            NavigationBarItem(
                                selected = activeTab == "memory",
                                onClick = { activeTab = "memory" },
                                icon = { Icon(Icons.Default.Psychology, contentDescription = "Memory") },
                                label = { Text("Memory") }
                            )
                        }
                    }
                ) { innerPadding ->
                    Box(modifier = Modifier.padding(innerPadding)) {
                        when (activeTab) {
                            "today" -> TodayScreen(
                                profile = profile,
                                readiness = readiness,
                                workout = todayWorkout,
                                telemetry = telemetry,
                                intensityMode = intensityMode,
                                onIntensityChanged = { intensityMode = it },
                                onSyncGalaxyHealth = {
                                    val newTelemetry = galaxyHealthService.syncNow()
                                    readiness = galaxyHealthService.calculateReadiness(newTelemetry)
                                },
                                onStartWorkout = { /* Launch Guided Workout */ }
                            )
                            "program" -> ProgramScreen(
                                profile = profile,
                                onStartWorkout = { /* Launch Workout */ }
                            )
                            "nutrition" -> NutritionScreen(
                                profile = profile,
                                onAddMeal = { /* Add meal dialog */ }
                            )
                            "coach" -> AICoachScreen(
                                profile = profile,
                                readiness = readiness,
                                workout = todayWorkout,
                                onSendMessage = { text ->
                                    geminiService.getCoachingAdvice(text, profile, readiness, todayWorkout)
                                }
                            )
                            "memory" -> MemoryScreen()
                        }
                    }
                }
            }
        }
    }
}
