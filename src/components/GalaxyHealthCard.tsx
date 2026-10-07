import React, { useState, useEffect } from 'react';
import { 
  Watch, 
  Heart, 
  Flame, 
  Footprints, 
  Moon, 
  Activity, 
  RefreshCw, 
  Zap,
  CheckCircle2
} from 'lucide-react';
import { GalaxyHealthService } from '../services/galaxyHealthService';
import { ReadinessState, GalaxyHealthTelemetry } from '../types';

interface GalaxyHealthCardProps {
  onApplyReadiness?: (readiness: ReadinessState) => void;
  onOpenFullModal?: () => void;
}

export const GalaxyHealthCard: React.FC<GalaxyHealthCardProps> = ({
  onApplyReadiness,
  onOpenFullModal
}) => {
  const [telemetry, setTelemetry] = useState<GalaxyHealthTelemetry>(() => GalaxyHealthService.getTelemetry());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [liveBpmPulse, setLiveBpmPulse] = useState<number>(telemetry.currentHeartRate);
  const [calibratedSuccess, setCalibratedSuccess] = useState<boolean>(false);

  // Real-time pulse simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveBpmPulse((prev) => {
        const delta = Math.floor(Math.random() * 3) - 1;
        const newBpm = Math.min(Math.max(prev + delta, 60), 75);
        return newBpm;
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleSyncNow = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const updated = GalaxyHealthService.syncNow();
      setTelemetry(updated);
      setLiveBpmPulse(updated.currentHeartRate);
      setIsSyncing(false);
    }, 900);
  };

  const handleCalibrate = () => {
    if (onApplyReadiness) {
      const newReadiness = GalaxyHealthService.generateReadinessFromTelemetry(telemetry);
      onApplyReadiness(newReadiness);
      setCalibratedSuccess(true);
      setTimeout(() => setCalibratedSuccess(false), 3000);
    }
  };

  const stepPercent = Math.min(Math.round((telemetry.steps / telemetry.stepGoal) * 100), 100);

  return (
    <div className="hud-card lab-dots rounded-3xl p-5 sm:p-6 border border-cyan-200/80 bg-gradient-to-br from-white via-cyan-50/20 to-blue-50/30 relative overflow-hidden">
      {/* Background subtle telemetry glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-cyan-100/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-600 text-white flex items-center justify-center shadow-md shadow-cyan-500/20 shrink-0">
            <Watch className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-hud font-bold text-slate-900 text-base sm:text-lg">
                Samsung Galaxy Health
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-mono font-bold border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> LIVE SYNC
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {telemetry.connectedDevice} · Last sync {new Date(telemetry.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleSyncNow}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-cyan-200 bg-white hover:bg-cyan-50 text-cyan-800 text-xs font-semibold shadow-2xs transition-all active:scale-95 disabled:opacity-50"
            title="Poll Galaxy Watch sensor array"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-cyan-600' : 'text-cyan-700'}`} />
            <span>{isSyncing ? 'Polling...' : 'Sync Sensor'}</span>
          </button>

          {onApplyReadiness && (
            <button
              onClick={handleCalibrate}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 ${
                calibratedSuccess
                  ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                  : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-cyan-500/25'
              }`}
            >
              {calibratedSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Calibrated!</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  <span>Calibrate Readiness</span>
                </>
              )}
            </button>
          )}

          {onOpenFullModal && (
            <button
              onClick={onOpenFullModal}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Open full Galaxy Health diagnostics hub"
            >
              <Activity className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Grid of Key Real-Time Telemetry Gauges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
        
        {/* Metric 1: Live Pulse & Resting HR */}
        <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Heart Rate</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-hud font-bold text-2xl text-slate-900 font-mono-num">{liveBpmPulse}</span>
            <span className="text-xs font-mono text-slate-500">BPM</span>
          </div>
          <div className="text-[10px] font-mono text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
            <span>Resting:</span>
            <span className="font-bold text-slate-700">{telemetry.restingHeartRate} bpm</span>
          </div>
        </div>

        {/* Metric 2: HRV (rMSSD) */}
        <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">HRV (rMSSD)</span>
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-hud font-bold text-2xl text-slate-900 font-mono-num">{telemetry.hrvMs}</span>
            <span className="text-xs font-mono text-slate-500">ms</span>
          </div>
          <div className="text-[10px] font-mono text-emerald-700 flex items-center justify-between pt-1 border-t border-slate-100">
            <span>Autonomic:</span>
            <span className="font-bold">Parasympathetic High</span>
          </div>
        </div>

        {/* Metric 3: Steps Today */}
        <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Daily Steps</span>
            <Footprints className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-hud font-bold text-2xl text-slate-900 font-mono-num">{telemetry.steps.toLocaleString()}</span>
          </div>
          <div className="space-y-1 pt-1 border-t border-slate-100">
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: `${stepPercent}%` }} />
            </div>
            <span className="text-[10px] font-mono text-slate-500 block text-right">{stepPercent}% of goal</span>
          </div>
        </div>

        {/* Metric 4: Active Calories & Sleep */}
        <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Burn</span>
            <Flame className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-hud font-bold text-2xl text-slate-900 font-mono-num">{telemetry.activeCaloriesBurned}</span>
            <span className="text-xs font-mono text-slate-500">kcal</span>
          </div>
          <div className="text-[10px] font-mono text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
            <span>Sleep Score:</span>
            <span className="font-bold text-indigo-600">{telemetry.sleepScore}/100</span>
          </div>
        </div>

      </div>

      {/* Sleep Stages Architecture Bar */}
      <div className="mt-3 p-3 rounded-2xl bg-white/80 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 shrink-0">
          <Moon className="w-4 h-4 text-indigo-600" />
          <div>
            <span className="font-bold text-slate-900 block leading-tight">
              Sleep: {telemetry.sleepDurationHours} hrs ({telemetry.sleepScore}/100)
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              SpO2 {telemetry.bloodOxygenSpO2}% · Skin Temp {telemetry.skinTemperatureDelta > 0 ? `+${telemetry.skinTemperatureDelta}` : telemetry.skinTemperatureDelta}°C
            </span>
          </div>
        </div>

        {/* Visual stage bars */}
        <div className="flex-1 max-w-sm flex items-center gap-1">
          <div className="flex-1 bg-indigo-700 h-3 rounded-l-md text-[9px] text-white flex items-center justify-center font-mono font-bold" title="Deep Sleep">
            {telemetry.sleepStages.deepMinutes}m Deep
          </div>
          <div className="flex-1 bg-indigo-500 h-3 text-[9px] text-white flex items-center justify-center font-mono font-bold" title="REM Sleep">
            {telemetry.sleepStages.remMinutes}m REM
          </div>
          <div className="flex-1 bg-indigo-300 h-3 text-[9px] text-slate-800 flex items-center justify-center font-mono font-bold" title="Light Sleep">
            {telemetry.sleepStages.lightMinutes}m Light
          </div>
          <div className="w-8 bg-amber-300 h-3 rounded-r-md text-[9px] text-slate-900 flex items-center justify-center font-mono font-bold" title="Awake">
            {telemetry.sleepStages.awakeMinutes}m
          </div>
        </div>
      </div>
    </div>
  );
};
