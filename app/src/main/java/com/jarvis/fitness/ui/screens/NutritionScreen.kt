package com.jarvis.fitness.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Restaurant
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.jarvis.fitness.model.MealLog
import com.jarvis.fitness.model.UserProfile
import com.jarvis.fitness.ui.theme.BorderLight
import com.jarvis.fitness.ui.theme.SurfaceWhite
import com.jarvis.fitness.ui.theme.TextSecondary

@Composable
fun NutritionScreen(
    profile: UserProfile,
    mealLogs: List<MealLog> = emptyList(),
    onAddMeal: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(16.dp)
    ) {
        Text(
            text = "NUTRITION & MACRO TARGETS",
            style = MaterialTheme.typography.labelSmall,
            color = Color(0xFF059669),
            fontWeight = FontWeight.Bold
        )
        Text(
            text = "Daily Calorie & Protein Engine",
            style = MaterialTheme.typography.headlineMedium
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Macro Summary Cards
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Card(
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = SurfaceWhite),
                border = androidx.compose.foundation.BorderStroke(1.dp, BorderLight)
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Text("Calories", style = MaterialTheme.typography.labelSmall, color = TextSecondary)
                    Text("${profile.targetCalories}", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                    Text("kcal / day", style = MaterialTheme.typography.labelSmall, color = TextSecondary)
                }
            }
            Card(
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = SurfaceWhite),
                border = androidx.compose.foundation.BorderStroke(1.dp, BorderLight)
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Text("Target Protein", style = MaterialTheme.typography.labelSmall, color = TextSecondary)
                    Text("${profile.targetProteinGrams}g", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = Color(0xFF2563EB))
                    Text("2.1g / kg", style = MaterialTheme.typography.labelSmall, color = TextSecondary)
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        Button(
            onClick = onAddMeal,
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF059669))
        ) {
            Icon(Icons.Default.Add, contentDescription = null)
            Spacer(modifier = Modifier.width(8.dp))
            Text("Log Meal or Calculate Nutrition", fontWeight = FontWeight.Bold)
        }
    }
}
