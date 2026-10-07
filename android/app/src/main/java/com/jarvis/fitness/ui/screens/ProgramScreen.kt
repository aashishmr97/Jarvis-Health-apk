package com.jarvis.fitness.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.jarvis.fitness.model.UserProfile
import com.jarvis.fitness.model.WorkoutSession
import com.jarvis.fitness.ui.theme.BorderLight
import com.jarvis.fitness.ui.theme.SurfaceWhite
import com.jarvis.fitness.ui.theme.TextSecondary

@Composable
fun ProgramScreen(
    profile: UserProfile,
    onStartWorkout: (WorkoutSession) -> Unit
) {
    val sampleDays = listOf(
        "Day 1: Upper Body Mechanical Tension (Push/Pull)",
        "Day 2: Lower Body Quad & Glute Dominant",
        "Day 3: Active Physiological Rest & Recovery",
        "Day 4: Upper Body Density & Hypertrophy",
        "Day 5: Posterior Chain & Hamstring Overload",
        "Day 6: Conditioning & Core Mobility",
        "Day 7: Full Rest & Central Nervous Reset"
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(16.dp)
    ) {
        Text(
            text = "7-DAY PROGRESSIVE OVERLOAD SPLIT",
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.primary,
            fontWeight = FontWeight.Bold
        )
        Text(
            text = "Autoregulated Training Program",
            style = MaterialTheme.typography.headlineMedium
        )

        Spacer(modifier = Modifier.height(16.dp))

        LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            items(sampleDays) { day ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = SurfaceWhite),
                    border = androidx.compose.foundation.BorderStroke(1.dp, BorderLight)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(text = day.split(":")[0], style = MaterialTheme.typography.labelSmall, color = TextSecondary)
                            Text(text = day.split(":")[1], style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                        }
                        Icon(Icons.Default.ChevronRight, contentDescription = null, tint = TextSecondary)
                    }
                }
            }
        }
    }
}
