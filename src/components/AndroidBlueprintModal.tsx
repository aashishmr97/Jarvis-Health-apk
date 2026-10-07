import React, { useState } from 'react';
import { X, Smartphone, Code2, Download, Copy, Check, Layers, Cpu, Database, Activity, FileArchive } from 'lucide-react';

interface AndroidBlueprintModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidBlueprintModal: React.FC<AndroidBlueprintModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<'compose' | 'engine' | 'room' | 'health'>('compose');
  const [isGeneratingZip, setIsGeneratingZip] = useState<boolean>(false);

  const handleDownloadZip = () => {
    window.location.href = '/JARVIS_Android_Project.tar.gz';
  };

  const copyCode = (key: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const COMPOSE_SNIPPET = `// Jetpack Compose 1.7+ & Material 3 Screen
package com.jarvis.fitness.presentation.today

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.jarvis.fitness.domain.model.ReadinessState
import com.jarvis.fitness.domain.model.WorkoutSession

@Composable
fun JarvisTodayScreen(
    readiness: ReadinessState,
    todayWorkout: WorkoutSession,
    onStartWorkout: () -> Unit,
    modifier: Modifier = Modifier
) {
    Scaffold(
        topBar = {
            JarvisTopAppBar(title = "JARVIS", subtitle = "Autonomous Training Engine")
        }
    ) { innerPadding ->
        Column(
            modifier = modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(horizontal = 16.dp)
        ) {
            // Hero Mandate: What should I do today, and why?
            TodayMandateCard(
                workout = todayWorkout,
                rationale = readiness.rationale,
                onStartClick = onStartWorkout
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Bio-Telemetry Diagnostics (Health Connect Sync)
            ReadinessMetricsGrid(readiness = readiness)
        }
    }
}`;

  const ENGINE_SNIPPET = `// Autonomous Progressive Overload & Autoregulation Engine in Kotlin
package com.jarvis.fitness.domain.engine

import com.jarvis.fitness.domain.model.SetLog
import com.jarvis.fitness.domain.model.PlannedExercise

class TrainingEngine {
    fun evaluateSetProgression(
        loggedSet: SetLog,
        planned: PlannedExercise
    ): ProgressionDecision {
        // Absolute Safety Override: Joint Pain Protection
        if (loggedSet.painLevel >= 4) {
            return ProgressionDecision(
                nextLoad = (loggedSet.actualLoad * 0.7f).coerceAtLeast(0f),
                action = ActionType.SUBSTITUTE_INJURY,
                rationale = "Safety Rule: Pain (\${loggedSet.painLevel}/10) in \${loggedSet.painLocation}. Load reduced 30%."
            )
        }

        // Form Breakdown Check
        if (loggedSet.techniqueQuality <= 2) {
            return ProgressionDecision(
                nextLoad = loggedSet.actualLoad,
                action = ActionType.MAINTAIN,
                rationale = "Form score <= 2/5. Preserving load to enforce bar trajectory."
            )
        }

        // Autoregulated Progressive Overload
        return if (loggedSet.rpe <= 7.0f && loggedSet.techniqueQuality >= 4) {
            val delta = if (loggedSet.actualLoad >= 60f) 5.0f else 2.5f
            ProgressionDecision(
                nextLoad = loggedSet.actualLoad + delta,
                action = ActionType.INCREASE_LOAD,
                rationale = "RPE \${loggedSet.rpe} undershot target. Advancing +\${delta}kg."
            )
        } else {
            ProgressionDecision(
                nextLoad = loggedSet.actualLoad,
                action = ActionType.MAINTAIN,
                rationale = "Target RPE aligned with program stimulus."
            )
        }
    }
}`;

  const ROOM_SNIPPET = `// Room Database Entity & DAO
package com.jarvis.fitness.data.local

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Entity(tableName = "coaching_memory")
data class CoachingMemoryEntity(
    @PrimaryKey val id: String,
    val category: String,
    val fact: String,
    val confidence: Float,
    val relevanceScore: Float,
    val createdAt: Long
)

@Dao
interface CoachingMemoryDao {
    @Query("SELECT * FROM coaching_memory ORDER BY relevanceScore DESC, createdAt DESC")
    fun getAllMemories(): Flow<List<CoachingMemoryEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMemory(memory: CoachingMemoryEntity)
}`;

  const HEALTH_SNIPPET = `// Health Connect Integration (Sleep & Resting HR)
package com.jarvis.fitness.data.healthconnect

import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.records.HeartRateRecord
import androidx.health.connect.client.records.SleepSessionRecord
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter
import java.time.Instant

class HealthConnectDataSource(private val client: HealthConnectClient) {
    suspend fun getReadinessTelemetry(start: Instant, end: Instant) {
        val sleepRecords = client.readRecords(
            ReadRecordsRequest(
                recordType = SleepSessionRecord::class,
                timeRangeFilter = TimeRangeFilter.between(start, end)
            )
        )
        // Autonomic readiness calibration pipeline...
    }
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full overflow-hidden max-h-[92vh] flex flex-col text-slate-900">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-hud font-bold text-base text-slate-900">
                Android Native Architecture & Direct Mobile Installation
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Kotlin · Jetpack Compose · Health Connect · Room SQLite
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          
          {/* Quick 1-Tap Installation on Android Phone */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                <Download className="w-4 h-4 text-emerald-700" />
                How to run as Native Android App on your Phone Right Now:
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 font-bold">
                PWA APK Engine
              </span>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Open this app URL in <strong>Google Chrome on any Android phone</strong>, tap the <strong>⋮ (three dots menu)</strong>, and select <strong>"Install app"</strong> or <strong>"Add to Home Screen"</strong>. It installs an Android webAPK that launches full-screen with native hardware acceleration, speech recognition, and zero browser chrome!
            </p>
          </div>

          {/* Android Kotlin Architecture Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              Production Android Architecture (Clean Architecture / MVI)
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <strong className="text-slate-900 block font-mono text-[11px]">presentation/</strong>
                <span className="text-slate-500 text-[10px] mt-0.5 block">Jetpack Compose UI + Material 3 ViewModels</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <strong className="text-slate-900 block font-mono text-[11px]">domain/engine/</strong>
                <span className="text-slate-500 text-[10px] mt-0.5 block">TrainingEngine, RecoveryEngine, Overload</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <strong className="text-slate-900 block font-mono text-[11px]">data/room/</strong>
                <span className="text-slate-500 text-[10px] mt-0.5 block">Room SQLite DB, MemoryDao, SetLogDao</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <strong className="text-slate-900 block font-mono text-[11px]">data/healthconnect/</strong>
                <span className="text-slate-500 text-[10px] mt-0.5 block">Android Health Connect Sleep & HeartRate</span>
              </div>
            </div>
          </div>

          {/* Code Viewer Tabs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                <button
                  onClick={() => setActiveCodeTab('compose')}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    activeCodeTab === 'compose' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  JarvisTodayScreen.kt
                </button>
                <button
                  onClick={() => setActiveCodeTab('engine')}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    activeCodeTab === 'engine' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  TrainingEngine.kt
                </button>
                <button
                  onClick={() => setActiveCodeTab('room')}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    activeCodeTab === 'room' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  RoomDatabase.kt
                </button>
                <button
                  onClick={() => setActiveCodeTab('health')}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    activeCodeTab === 'health' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  HealthConnect.kt
                </button>
              </div>

              <button
                onClick={() => {
                  const code = activeCodeTab === 'compose' ? COMPOSE_SNIPPET :
                               activeCodeTab === 'engine' ? ENGINE_SNIPPET :
                               activeCodeTab === 'room' ? ROOM_SNIPPET : HEALTH_SNIPPET;
                  copyCode(activeCodeTab, code);
                }}
                className="flex items-center gap-1 text-xs text-blue-600 font-semibold hover:text-blue-700"
              >
                {copiedKey === activeCodeTab ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === activeCodeTab ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>

            {/* Code Box */}
            <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto max-h-60 leading-relaxed">
              {activeCodeTab === 'compose' && COMPOSE_SNIPPET}
              {activeCodeTab === 'engine' && ENGINE_SNIPPET}
              {activeCodeTab === 'room' && ROOM_SNIPPET}
              {activeCodeTab === 'health' && HEALTH_SNIPPET}
            </pre>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <button
            onClick={handleDownloadZip}
            disabled={isGeneratingZip}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-50"
          >
            <FileArchive className="w-4 h-4" />
            <span>{isGeneratingZip ? 'Generating ZIP...' : 'Download Android Studio (.ZIP)'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Close Blueprint
          </button>
        </div>

      </div>
    </div>
  );
};
