import { GalaxyHealthTelemetry, ReadinessState, ReadinessMetrics } from '../types';
import { RecoveryEngine } from './recoveryEngine';

const STORAGE_KEY = 'jarvis_galaxy_health_telemetry';

export class GalaxyHealthService {
  private static defaultTelemetry: GalaxyHealthTelemetry = {
    connectedDevice: 'Samsung Galaxy Watch Ultra (Bluetooth/Wi-Fi)',
    syncStatus: 'synced',
    lastSyncedAt: new Date().toISOString(),
    autoSyncEnabled: true,
    steps: 8420,
    stepGoal: 10000,
    activeCaloriesBurned: 520,
    restingHeartRate: 58,
    currentHeartRate: 64,
    hrvMs: 68,
    stressScore: 28,
    bloodOxygenSpO2: 98,
    skinTemperatureDelta: 0.1,
    sleepDurationHours: 7.8,
    sleepScore: 88,
    sleepStages: {
      deepMinutes: 95,
      remMinutes: 110,
      lightMinutes: 240,
      awakeMinutes: 25,
    },
  };

  /**
   * Retrieves stored Galaxy Health telemetry
   */
  static getTelemetry(): GalaxyHealthTelemetry {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Error reading Galaxy Health telemetry', e);
    }
    return this.defaultTelemetry;
  }

  /**
   * Saves Galaxy Health telemetry
   */
  static saveTelemetry(telemetry: GalaxyHealthTelemetry): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(telemetry));
    } catch (e) {
      console.warn('Error saving Galaxy Health telemetry', e);
    }
  }

  /**
   * Performs a fresh sync from Galaxy Health / Samsung Health
   */
  static syncNow(): GalaxyHealthTelemetry {
    const current = this.getTelemetry();
    // Simulate real-time sensor fluctuation
    const newSteps = current.steps + Math.floor(Math.random() * 45) + 10;
    const newBurned = Math.round(current.activeCaloriesBurned + (newSteps - current.steps) * 0.04);
    const newCurrentHR = Math.floor(60 + Math.random() * 12);
    const newHRV = Math.floor(62 + Math.random() * 10);

    const updated: GalaxyHealthTelemetry = {
      ...current,
      syncStatus: 'synced',
      lastSyncedAt: new Date().toISOString(),
      steps: newSteps,
      activeCaloriesBurned: newBurned,
      currentHeartRate: newCurrentHR,
      hrvMs: newHRV,
    };

    this.saveTelemetry(updated);
    return updated;
  }

  /**
   * Converts Galaxy Health biometrics into JARVIS Readiness metrics
   */
  static generateReadinessFromTelemetry(
    telemetry: GalaxyHealthTelemetry,
    currentBaselineRHR: number = 60
  ): ReadinessState {
    const sleepQuality = Math.min(10, Math.max(1, Math.round(telemetry.sleepScore / 10)));
    const stressInverted = Math.round((100 - telemetry.stressScore) / 10);

    const metrics: ReadinessMetrics = {
      sleepHours: telemetry.sleepDurationHours,
      sleepQuality: sleepQuality,
      restingHR: telemetry.restingHeartRate,
      baselineRHR: currentBaselineRHR,
      sorenessLevel: 2,
      soreMuscles: [],
      stressLevel: Math.round(telemetry.stressScore / 10),
      nutritionAdherence: 8,
    };

    return RecoveryEngine.calculateReadiness(metrics);
  }
}
