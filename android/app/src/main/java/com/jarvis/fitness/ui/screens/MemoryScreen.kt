package com.jarvis.fitness.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Psychology
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.jarvis.fitness.model.CoachingMemory
import com.jarvis.fitness.ui.theme.BorderLight
import com.jarvis.fitness.ui.theme.SurfaceWhite
import com.jarvis.fitness.ui.theme.TextSecondary

@Composable
fun MemoryScreen(
    memories: List<CoachingMemory> = emptyList()
) {
    val sampleMemories = listOf(
        CoachingMemory("1", "Autoregulation", "Athlete thrives on 90s rest periods for bench press", "Auto-preset rest timer to 90s", "3 days ago"),
        CoachingMemory("2", "Nutrition", "High satiety reported with 40g protein breakfast", "Recommend whey + oats post-workout", "1 week ago"),
        CoachingMemory("3", "Biomechanical", "Left knee discomfort observed on back squats with narrow stance", "Enforce shoulder-width stance with 15° toe out", "2 weeks ago")
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(16.dp)
    ) {
        Text(
            text = "COACHING MEMORY VAULT",
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.primary,
            fontWeight = FontWeight.Bold
        )
        Text(
            text = "Long-Term Athletic Intelligence",
            style = MaterialTheme.typography.headlineMedium
        )

        Spacer(modifier = Modifier.height(16.dp))

        LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            items(sampleMemories) { memory ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = SurfaceWhite),
                    border = androidx.compose.foundation.BorderStroke(1.dp, BorderLight)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Psychology, contentDescription = null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(text = memory.category.uppercase(), style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.Bold)
                            Spacer(modifier = Modifier.weight(1f))
                            Text(text = memory.recordedAt, style = MaterialTheme.typography.labelSmall, color = TextSecondary)
                        }
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(text = memory.insight, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.SemiBold)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(text = "Rule: ${memory.actionableRule}", style = MaterialTheme.typography.labelSmall, color = TextSecondary)
                    }
                }
            }
        }
    }
}
