package com.jarvis.fitness.service

import com.jarvis.fitness.model.GalaxyHealthTelemetry
import com.jarvis.fitness.model.ReadinessState
import com.jarvis.fitness.model.SleepStages
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.text.SimpleDateFormat
import java.util.*

class GalaxyHealthService {
    private val _telemetry = MutableStateFlow(GalaxyHealthTelemetry())
    val telemetry: StateFlow<GalaxyHealthTelemetry> = _telemetry.asStateFlow()

    fun syncNow(): GalaxyHealthTelemetry {
        val random = Random()
        val deltaSteps = random.nextInt(400) + 100
        val currentSteps = _telemetry.value.stepsToday + deltaSteps
        val updated = _telemetry.value.copy(
            stepsToday = currentSteps,
            currentHeartRate = 60 + random.nextInt(15),
            restingHeartRate = 56 + random.nextInt(4),
            hrvMs = 64 + random.nextInt(8),
            activeBurnKcal = _telemetry.value.activeBurnKcal + (deltaSteps * 0.04).toInt(),
            lastSyncedAt = SimpleDateFormat("h:mm a", Locale.getDefault()).format(Date())
        )
        _telemetry.value = updated
        return updated
    }

    fun calculateReadiness(telemetry: GalaxyHealthTelemetry): ReadinessState {
        val hrvFactor = (telemetry.hrvMs.toDouble() / 65.0) * 40.0
        val sleepFactor = (telemetry.sleepScore.toDouble() / 100.0) * 40.0
        val rhrFactor = (60.0 / telemetry.restingHeartRate.toDouble()) * 20.0
        val score = (hrvFactor + sleepFactor + rhrFactor).coerceIn(40.0, 99.0).toInt()

        val tier = when {
            score >= 88 -> "peak"
            score >= 75 -> "optimal"
            score >= 55 -> "moderate"
            else -> "reduced"
        }

        val adjustment = when (tier) {
            "peak" -> "Full progressive overload approved. Increase compound loads +2.5kg."
            "optimal" -> "Maintain prescribed intensity. Focus on eccentric control."
            "moderate" -> "Moderate fatigue detected. Cap top set at RPE 8.0."
            else -> "Autonomic recovery compromised. Switch to Lite or Survival Mode."
        }

        return ReadinessState(
            score = score,
            tier = tier,
            rationale = "Galaxy Health sync indicates HRV of ${telemetry.hrvMs}ms and ${telemetry.sleepDurationHours}h sleep (${telemetry.sleepScore}/100 sleep score).",
            intensityAdjustment = adjustment,
            timestamp = "Synced at ${telemetry.lastSyncedAt}"
        )
    }
}
