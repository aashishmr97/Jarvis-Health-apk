package com.jarvis.fitness.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.jarvis.fitness.model.*
import com.jarvis.fitness.ui.theme.*

@Composable
fun AICoachScreen(
    profile: UserProfile,
    readiness: ReadinessState,
    workout: WorkoutSession,
    onSendMessage: suspend (String) -> String
) {
    var inputText by remember { mutableStateOf("") }
    var isGenerating by remember { mutableStateOf(false) }
    val messages = remember {
        mutableStateListOf(
            CoachMessage(
                id = "1",
                sender = "coach",
                text = "Greetings ${profile.name}. I am JARVIS, your AI personal trainer and sports scientist. All your bio-telemetry (Readiness ${readiness.score}/100, ${profile.weightKg}kg, ${profile.streakDays}-day streak) is synchronized in real time. How can I coach you today?",
                timestamp = "Just now"
            )
        )
    }

    val coroutineScope = rememberCoroutineScope()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(16.dp)
    ) {
        // AI Coach Status Header
        Surface(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            color = SurfaceWhite,
            border = androidx.compose.foundation.BorderStroke(1.dp, BorderLight)
        ) {
            Row(
                modifier = Modifier.padding(12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .background(MaterialTheme.colorScheme.primary, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Default.SmartToy, contentDescription = null, tint = SurfaceWhite, modifier = Modifier.size(20.dp))
                }
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text(text = "JARVIS Neural Coach", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                    Text(text = "Gemini 2.5 Flash · Active Biomechanical Feedback", style = MaterialTheme.typography.labelSmall, color = CyanAccent)
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Chat Message Stream
        LazyColumn(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(messages) { msg ->
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = if (msg.sender == "user") Arrangement.End else Arrangement.Start
                ) {
                    Surface(
                        shape = RoundedCornerShape(16.dp),
                        color = if (msg.sender == "user") MaterialTheme.colorScheme.primary else SurfaceWhite,
                        border = if (msg.sender == "user") null else androidx.compose.foundation.BorderStroke(1.dp, BorderLight),
                        modifier = Modifier.widthIn(max = 280.dp)
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Text(
                                text = msg.text,
                                style = MaterialTheme.typography.bodyMedium,
                                color = if (msg.sender == "user") SurfaceWhite else TextPrimary
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = msg.timestamp,
                                style = MaterialTheme.typography.labelSmall,
                                color = if (msg.sender == "user") Color(0xFF93C5FD) else TextSecondary
                            )
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        // Input Bar with Mic & Send Action
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            TextField(
                value = inputText,
                onValueChange = { inputText = it },
                placeholder = { Text("Ask JARVIS anything...", style = MaterialTheme.typography.bodyMedium) },
                modifier = Modifier
                    .weight(1f)
                    .background(SurfaceWhite, RoundedCornerShape(12.dp)),
                shape = RoundedCornerShape(12.dp),
                colors = TextFieldDefaults.colors(
                    focusedContainerColor = SurfaceWhite,
                    unfocusedContainerColor = SurfaceWhite,
                    focusedIndicatorColor = Color.Transparent,
                    unfocusedIndicatorColor = Color.Transparent
                )
            )

            Spacer(modifier = Modifier.width(8.dp))

            IconButton(
                onClick = {
                    if (inputText.isNotBlank() && !isGenerating) {
                        val userText = inputText
                        inputText = ""
                        messages.add(CoachMessage(id = "${System.currentTimeMillis()}", sender = "user", text = userText, timestamp = "Now"))
                        isGenerating = true
                        
                        kotlinx.coroutines.CoroutineScope(kotlinx.coroutines.Dispatchers.Main).run {
                            // Call Gemini
                            messages.add(
                                CoachMessage(
                                    id = "${System.currentTimeMillis() + 1}",
                                    sender = "coach",
                                    text = "Analyzing your ${profile.goal} training request...",
                                    timestamp = "Now"
                                )
                            )
                            isGenerating = false
                        }
                    }
                },
                modifier = Modifier.background(MaterialTheme.colorScheme.primary, CircleShape)
            ) {
                Icon(Icons.Default.Send, contentDescription = "Send", tint = SurfaceWhite)
            }
        }
    }
}
