package com.jarvis.fitness.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.jarvis.fitness.model.*
import com.jarvis.fitness.ui.theme.*

@Composable
fun TodayScreen(
    profile: UserProfile,
    readiness: ReadinessState,
    workout: WorkoutSession,
    telemetry: GalaxyHealthTelemetry,
    intensityMode: IntensityMode,
    onIntensityChanged: (IntensityMode) -> Unit,
    onSyncGalaxyHealth: () -> Unit,
    onStartWorkout: () -> Unit
) {
    val scrollState = rememberScrollState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .verticalScroll(scrollState)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Hero Operational Directive Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "TODAY'S OPERATIONAL DIRECTIVE",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.primary,
                        fontWeight = FontWeight.Bold
                    )
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = Color(0xFFDCFCE7),
                        modifier = Modifier.padding(4.dp)
                    ) {
                        Text(
                            text = "STREAK: ${profile.streakDays} DAYS",
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp),
                            style = MaterialTheme.typography.labelSmall,
                            color = Color(0xFF15803D),
                            fontWeight = FontWeight.Bold
                        )
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Intensity Mode Selector
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color(0xFFF1F5F9), RoundedCornerShape(12.dp))
                        .padding(4.dp),
                    horizontalArrangement = Arrangement.SpaceEvenly
                ) {
                    IntensityChip(
                        title = "Main (45m)",
                        selected = intensityMode == IntensityMode.MAIN,
                        onClick = { onIntensityChanged(IntensityMode.MAIN) }
                    )
                    IntensityChip(
                        title = "Lite (30m)",
                        selected = intensityMode == IntensityMode.LITE,
                        onClick = { onIntensityChanged(IntensityMode.LITE) }
                    )
                    IntensityChip(
                        title = "Survival (15m)",
                        selected = intensityMode == IntensityMode.SURVIVAL,
                        onClick = { onIntensityChanged(IntensityMode.SURVIVAL) }
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                Text(
                    text = workout.title,
                    style = MaterialTheme.typography.headlineMedium,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    text = "Focus: ${workout.focus} · ${workout.estimatedDurationMinutes} mins · ${workout.exercises.size} movements",
                    style = MaterialTheme.typography.bodyMedium,
                    color = TextSecondary
                )

                Spacer(modifier = Modifier.height(16.dp))

                Button(
                    onClick = onStartWorkout,
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
                ) {
                    Icon(Icons.Default.PlayArrow, contentDescription = null, modifier = Modifier.size(20.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "START ${intensityMode.name} WORKOUT",
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }

        // Galaxy Health Real-Time Telemetry Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFFF0FDF4)),
            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFBBF7D0))
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Watch, contentDescription = null, tint = CyanAccent)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Samsung Galaxy Health",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    Button(
                        onClick = onSyncGalaxyHealth,
                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                        shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = SurfaceWhite)
                    ) {
                        Icon(Icons.Default.Refresh, contentDescription = null, tint = CyanAccent, modifier = Modifier.size(14.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(text = "Sync", color = CyanAccent, style = MaterialTheme.typography.labelSmall)
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    MetricBox("Heart Rate", "${telemetry.currentHeartRate} BPM", Icons.Default.Favorite, Color(0xFFEF4444))
                    MetricBox("HRV", "${telemetry.hrvMs} ms", Icons.Default.Bolt, Color(0xFF10B981))
                    MetricBox("Steps", "${telemetry.stepsToday}", Icons.Default.DirectionsWalk, Color(0xFF3B82F6))
                    MetricBox("Sleep", "${telemetry.sleepDurationHours}h", Icons.Default.Bedtime, Color(0xFF6366F1))
                }
            }
        }

        // Planned Exercises Roster
        Text(
            text = "PRESCRIBED MOVEMENTS",
            style = MaterialTheme.typography.labelSmall,
            color = TextSecondary,
            fontWeight = FontWeight.Bold
        )

        workout.exercises.forEach { exercise ->
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = SurfaceWhite),
                border = androidx.compose.foundation.BorderStroke(1.dp, BorderLight)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(text = exercise.name, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                        Text(
                            text = "${exercise.sets.size} sets · Target ${exercise.sets.firstOrNull()?.prescribedReps ?: 8} reps @ ${exercise.sets.firstOrNull()?.recommendedLoadKg ?: 60.0}kg",
                            style = MaterialTheme.typography.bodyMedium,
                            color = TextSecondary
                        )
                    }
                    Icon(Icons.Default.FitnessCenter, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                }
            }
        }
        
        Spacer(modifier = Modifier.height(60.dp)) // Bottom clearance
    }
}

@Composable
fun IntensityChip(
    title: String,
    selected: Boolean,
    onClick: () -> Unit
) {
    Surface(
        shape = RoundedCornerShape(8.dp),
        color = if (selected) MaterialTheme.colorScheme.primary else Color.Transparent,
        modifier = Modifier.clickable { onClick() }
    ) {
        Text(
            text = title,
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
            style = MaterialTheme.typography.labelSmall,
            color = if (selected) SurfaceWhite else TextSecondary,
            fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal
        )
    }
}

@Composable
fun MetricBox(
    label: String,
    value: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    tint: Color
) {
    Surface(
        shape = RoundedCornerShape(12.dp),
        color = SurfaceWhite,
        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFE2E8F0)),
        modifier = Modifier.width(78.dp)
    ) {
        Column(
            modifier = Modifier.padding(8.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(icon, contentDescription = null, tint = tint, modifier = Modifier.size(16.dp))
            Spacer(modifier = Modifier.height(4.dp))
            Text(text = value, style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.Bold)
            Text(text = label, style = MaterialTheme.typography.labelSmall, color = TextSecondary, fontSize = 9.sp)
        }
    }
}
