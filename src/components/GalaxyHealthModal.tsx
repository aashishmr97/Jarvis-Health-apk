import React, { useState, useEffect } from 'react';
import { 
  X, 
  Watch, 
  Activity, 
  Heart, 
  Flame, 
  Moon, 
  RefreshCw, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  Cpu, 
  Thermometer, 
  Wind,
  Smartphone
} from 'lucide-react';
import { GalaxyHealthTelemetry, ReadinessState } from '../types';
import { GalaxyHealthService } from '../services/galaxyHealthService';

interface GalaxyHealthModalProps {
  onClose: () => void;
  onApplyReadiness: (newReadiness: ReadinessState) => void;
}

export const GalaxyHealthModal: React.FC<GalaxyHealthModalProps> = ({
  onClose,
  onApplyReadiness,
}) => {
  const [telemetry, setTelemetry] = useState<GalaxyHealthTelemetry>(() => GalaxyHealthService.getTelemetry());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string | null>(null);

  // Live heart rate subtle pulsation simulation
  const [livePulse, setLivePulse] = useState<number>(telemetry.currentHeartRate);

  useEffect(() => {
    const interval = setInterval(() => {
      setLivePulse(prev => {
        const delta = Math.floor(Math.random() * 3) - 1;
        return Math.min(78, Math.max(58, prev + delta));
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleManualSync = () => {
    setIsSyncing(true);
    setSyncSuccessMessage(null);
    setTimeout(() => {
      const updated = GalaxyHealthService.syncNow();
      setTelemetry(updated);
      setIsSyncing(false);
      setSyncSuccessMessage('Synced live biometrics with Samsung Health Cloud.');
      setTimeout(() => setSyncSuccessMessage(null), 3500);
    }, 1200);
  };

  const handleInjectToJARVIS = () => {
    const newReadiness = GalaxyHealthService.generateReadinessFromTelemetry(telemetry);
    onApplyReadiness(newReadiness);
    setSyncSuccessMessage('Readiness score calibrated with Galaxy biometrics!');
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const toggleAutoSync = () => {
    const updated: GalaxyHealthTelemetry = {
      ...telemetry,
      autoSyncEnabled: !telemetry.autoSyncEnabled,
    };
    setTelemetry(updated);
    GalaxyHealthService.saveTelemetry(updated);
  };

  const stepPercent = Math.min(100, Math.round((telemetry.steps / telemetry.stepGoal) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-cyan-50/70 via-blue-50/50 to-indigo-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white flex items-center justify-center shadow-md shadow-cyan-500/20">
              <Watch className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-lg">Galaxy Health Realtime Sync</h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> LIVE
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Samsung Health & Health Connect Ecosystem</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Device status card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-xs">
                <Smartphone className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Connected Sensor</p>
                <p className="text-sm font-bold text-slate-900">{telemetry.connectedDevice}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Last synced: {new Date(telemetry.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </p>
              </div>
            </div>

            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs active:scale-95 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>

          {syncSuccessMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              {syncSuccessMessage}
            </div>
          )}

          {/* Telemetry Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* Live Heart Rate */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-50/80 to-white border border-rose-100">
              <div className="flex items-center justify-between text-xs text-rose-500 font-medium">
                <span>Heart Rate</span>
                <Heart className="w-4 h-4 fill-rose-500 text-rose-500 animate-ping duration-1000" />
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-slate-900">{livePulse}</span>
                <span className="text-xs font-semibold text-slate-500">BPM</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Resting: {telemetry.restingHeartRate} bpm</p>
            </div>

            {/* Steps & Activity */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/80 to-white border border-blue-100">
              <div className="flex items-center justify-between text-xs text-blue-500 font-medium">
                <span>Daily Steps</span>
                <Activity className="w-4 h-4 text-blue-600" />
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-slate-900">{telemetry.steps.toLocaleString()}</span>
                <span className="text-xs font-semibold text-slate-500">/ {telemetry.stepGoal.toLocaleString()}</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${stepPercent}%` }} />
              </div>
            </div>

            {/* Active Burn */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/80 to-white border border-amber-100">
              <div className="flex items-center justify-between text-xs text-amber-500 font-medium">
                <span>Active Burn</span>
                <Flame className="w-4 h-4 text-amber-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-slate-900">{telemetry.activeCaloriesBurned}</span>
                <span className="text-xs font-semibold text-slate-500">kcal</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Excludes basal BMR</p>
            </div>

            {/* HRV */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/80 to-white border border-indigo-100">
              <div className="flex items-center justify-between text-xs text-indigo-500 font-medium">
                <span>HRV (rMSSD)</span>
                <Zap className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-slate-900">{telemetry.hrvMs}</span>
                <span className="text-xs font-semibold text-slate-500">ms</span>
              </div>
              <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-700 mt-1">
                Optimal Parasympathetic
              </span>
            </div>

            {/* Blood Oxygen SpO2 */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-50/80 to-white border border-cyan-100">
              <div className="flex items-center justify-between text-xs text-cyan-600 font-medium">
                <span>Blood O2 (SpO2)</span>
                <Wind className="w-4 h-4 text-cyan-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-slate-900">{telemetry.bloodOxygenSpO2}</span>
                <span className="text-xs font-semibold text-slate-500">%</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Continuous nocturnal</p>
            </div>

            {/* Skin Temp Delta */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50/80 to-white border border-purple-100">
              <div className="flex items-center justify-between text-xs text-purple-600 font-medium">
                <span>Skin Temp</span>
                <Thermometer className="w-4 h-4 text-purple-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-slate-900">+{telemetry.skinTemperatureDelta}°</span>
                <span className="text-xs font-semibold text-slate-500">C</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Baseline baseline deviation</p>
            </div>
          </div>

          {/* Sleep Stages Analysis */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Galaxy Sleep Architecture ({telemetry.sleepDurationHours} hrs)
                </span>
              </div>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                Score: {telemetry.sleepScore}/100
              </span>
            </div>

            {/* Sleep stage bar */}
            <div className="h-4 rounded-full overflow-hidden flex gap-0.5 shadow-inner bg-slate-200">
              <div
                className="bg-indigo-700 h-full"
                style={{ width: `${(telemetry.sleepStages.deepMinutes / 470) * 100}%` }}
                title="Deep Sleep"
              />
              <div
                className="bg-indigo-400 h-full"
                style={{ width: `${(telemetry.sleepStages.remMinutes / 470) * 100}%` }}
                title="REM Sleep"
              />
              <div
                className="bg-sky-300 h-full"
                style={{ width: `${(telemetry.sleepStages.lightMinutes / 470) * 100}%` }}
                title="Light Sleep"
              />
              <div
                className="bg-amber-300 h-full"
                style={{ width: `${(telemetry.sleepStages.awakeMinutes / 470) * 100}%` }}
                title="Awake"
              />
            </div>

            <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2 font-medium">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-700" /> Deep: {telemetry.sleepStages.deepMinutes}m</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-400" /> REM: {telemetry.sleepStages.remMinutes}m</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky-300" /> Light: {telemetry.sleepStages.lightMinutes}m</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-300" /> Awake: {telemetry.sleepStages.awakeMinutes}m</span>
            </div>
          </div>

          {/* Realtime Auto-sync toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100/60">
            <div>
              <p className="text-xs font-semibold text-slate-800">Background Realtime Telemetry Polling</p>
              <p className="text-[11px] text-slate-500">Pulls continuous sensor packets during workout sessions</p>
            </div>
            <button
              onClick={toggleAutoSync}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                telemetry.autoSyncEnabled ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                  telemetry.autoSyncEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
          >
            Close
          </button>
          <button
            onClick={handleInjectToJARVIS}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold text-xs hover:from-cyan-700 hover:to-blue-700 active:scale-95 transition-all shadow-md shadow-blue-500/20 flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            Calibrate Readiness with Galaxy Data
          </button>
        </div>
      </div>
    </div>
  );
};
