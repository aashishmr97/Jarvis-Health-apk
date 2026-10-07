package com.jarvis.fitness.service

import com.google.ai.client.generativeai.GenerativeModel
import com.jarvis.fitness.model.UserProfile
import com.jarvis.fitness.model.ReadinessState
import com.jarvis.fitness.model.WorkoutSession
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class GeminiService(private val apiKey: String = "") {
    private val model = GenerativeModel(
        modelName = "gemini-2.5-flash",
        apiKey = apiKey.ifEmpty { System.getenv("GEMINI_API_KEY") ?: "" }
    )

    suspend fun getCoachingAdvice(
        userMessage: String,
        profile: UserProfile,
        readiness: ReadinessState,
        todayWorkout: WorkoutSession
    ): String = withContext(Dispatchers.IO) {
        try {
            if (apiKey.isEmpty() && (System.getenv("GEMINI_API_KEY") == null)) {
                return@withContext fallbackCoachingAdvice(userMessage, profile, readiness)
            }

            val prompt = """
                You are JARVIS, an elite sports scientist and AI personal trainer.
                Athlete profile: ${profile.name}, ${profile.weightKg}kg, ${profile.streakDays}-day streak, Goal: ${profile.goal}.
                Readiness Score: ${readiness.score}/100 (${readiness.tier}).
                Today's Workout: ${todayWorkout.title} (${todayWorkout.focus}).
                User Question: $userMessage
                
                Provide concise, authoritative, scientific coaching instructions with progressive overload rules and biomechanical cues.
            """.trimIndent()

            val response = model.generateContent(prompt)
            response.text ?: fallbackCoachingAdvice(userMessage, profile, readiness)
        } catch (e: Exception) {
            fallbackCoachingAdvice(userMessage, profile, readiness)
        }
    }

    private fun fallbackCoachingAdvice(message: String, profile: UserProfile, readiness: ReadinessState): String {
        return "JARVIS Analysis for '$message': With your ${readiness.score}/100 readiness and ${profile.goal} objective, target RPE 8.0 on compound sets today. Maintain +2.5kg progressive overload on the first exercise once prescribed reps are locked in. Ensure ${ (profile.weightKg * 2.1).toInt() }g protein intake today."
    }
}
