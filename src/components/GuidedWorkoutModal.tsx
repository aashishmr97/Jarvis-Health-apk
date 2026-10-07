import React, { useState } from 'react';
import { 
  X, 
  Dumbbell, 
  ChevronRight, 
  ChevronLeft, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRightLeft, 
  RotateCcw, 
  TrendingUp, 
  Flame, 
  Trophy, 
  Volume2, 
  Timer,
  Check,
  Layers
} from 'lucide-react';
import { 
  WorkoutSession, 
  PlannedExercise, 
  SetLog, 
  LoggedExercise, 
  CompletedWorkout, 
  UserProfile, 
  ExerciseDefinition 
} from '../types';
import { EXERCISE_LIBRARY } from '../data/exerciseLibrary';
import { TrainingEngine } from '../services/trainingEngine';
import { CoachingMemoryService } from '../services/coachingMemoryService';
import { StorageService } from '../services/storageService';
import { VoiceCoachService } from '../services/voiceCoachService';
import { RestTimerOverlay } from './RestTimerOverlay';
import { VoiceCoachControl } from './VoiceCoachControl';
import { ExerciseDemoModal } from './ExerciseDemoModal';
import { IntelligentSubstitutionModal } from './IntelligentSubstitutionModal';
import { PlateCalculatorModal } from './PlateCalculatorModal';

interface GuidedWorkoutModalProps {
  workout: WorkoutSession;
  profile: UserProfile;
  readinessScore: number;
  onClose: () => void;
  onFinishWorkout: (completed: CompletedWorkout) => void;
}

export const GuidedWorkoutModal: React.FC<GuidedWorkoutModalProps> = ({
  workout,
  profile,
  readinessScore,
  onClose,
  onFinishWorkout
}) => {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(0);
  const [exercisesList, setExercisesList] = useState<PlannedExercise[]>(workout.exercises);
  const [loggedData, setLoggedData] = useState<Record<string, SetLog[]>>({});
  
  // Active Set Form state
  const currentExercise = exercisesList[currentExerciseIndex];
  const exerciseLogs = loggedData[currentExercise?.id] || [];
  const currentSetNumber = exerciseLogs.length + 1;
  const isFinishedAllSets = currentExercise && currentSetNumber > currentExercise.targetSets;

  const [inputWeight, setInputWeight] = useState<number>(currentExercise?.recommendedLoad || 60);
  const [inputReps, setInputReps] = useState<number>(parseInt(currentExercise?.targetReps.split('-')[0]) || 8);
  const [inputRpe, setInputRpe] = useState<number>(currentExercise?.targetRPE || 8);
  const [inputRir, setInputRir] = useState<number>(currentExercise?.targetRIR || 2);
  const [techniqueQuality, setTechniqueQuality] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [painLevel, setPainLevel] = useState<number>(0);
  const [painLocation, setPainLocation] = useState<string>('');
  
  // Rest Timer State
  const [isResting, setIsResting] = useState<boolean>(false);
  const [restSeconds, setRestSeconds] = useState<number>(currentExercise?.restSeconds || 90);

  // Progression advice banner
  const [progressionBanner, setProgressionBanner] = useState<string | null>(null);

  // Modals inside workout
  const [showDemoModal, setShowDemoModal] = useState<boolean>(false);
  const [showSubstitutionModal, setShowSubstitutionModal] = useState<boolean>(false);
  const [showPlateModal, setShowPlateModal] = useState<boolean>(false);
  const [isCompletedFlow, setIsCompletedFlow] = useState<boolean>(false);

  // Technique def
  const exerciseDef = EXERCISE_LIBRARY[currentExercise?.exerciseId] || null;

  // Handle set logging
  const handleLogSet = () => {
    if (!currentExercise) return;

    const newLog: SetLog = {
      setNumber: currentSetNumber,
      isWarmup: false,
      targetLoad: currentExercise.recommendedLoad,
      targetReps: parseInt(currentExercise.targetReps.split('-')[0]) || 8,
      actualLoad: inputWeight,
      actualReps: inputReps,
      rpe: inputRpe,
      rir: inputRir,
      techniqueQuality,
      painLevel,
      painLocation: painLevel > 0 ? (painLocation || 'joint') : undefined,
      completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedLogs = [...exerciseLogs, newLog];
    setLoggedData({
      ...loggedData,
      [currentExercise.id]: updatedLogs
    });

    // Run progressive overload decision engine
    const history = StorageService.getCompletedWorkouts();
    const evaluation = TrainingEngine.evaluateSetProgression(newLog, currentExercise, history);

    setProgressionBanner(evaluation.decisionReason);
    VoiceCoachService.speak(evaluation.decisionReason);

    // Save auto memory if pain or failure
    CoachingMemoryService.recordWorkoutInsight(currentExercise.name, newLog, workout.title);

    // Apply next load recommendation to form
    setInputWeight(evaluation.nextLoad);

    // Trigger rest timer if more sets left
    if (currentSetNumber < currentExercise.targetSets) {
      setRestSeconds(currentExercise.restSeconds);
      setIsResting(true);
    } else {
      // Completed all sets for this exercise
      if (currentExerciseIndex < exercisesList.length - 1) {
        setProgressionBanner(`All sets completed for ${currentExercise.name}. Tap Next Movement to advance.`);
      }
    }
  };

  // Voice action dispatcher
  const handleVoiceAction = (actionData: any) => {
    if (actionData.action === 'complete_set') {
      handleLogSet();
    } else if (actionData.action === 'increase_weight') {
      const delta = actionData.deltaWeight || 2.5;
      setInputWeight(prev => prev + delta);
    } else if (actionData.action === 'decrease_weight') {
      const delta = actionData.deltaWeight || -2.5;
      setInputWeight(prev => Math.max(0, prev + delta));
    } else if (actionData.action === 'skip_rest') {
      setIsResting(false);
    } else if (actionData.action === 'substitute_exercise') {
      setShowSubstitutionModal(true);
    }
  };

  // Substitute exercise
  const handleApplySubstitution = (sub: ExerciseDefinition, reason: string) => {
    const updatedList = [...exercisesList];
    const isTier1 = sub.tier === 'tier1_compound';

    updatedList[currentExerciseIndex] = {
      ...currentExercise,
      exerciseId: sub.id,
      name: sub.name,
      targetMuscle: sub.targetMuscle,
      movementPattern: sub.movementPattern,
      recommendedLoad: Math.round(inputWeight * 0.8 / 2.5) * 2.5,
      techniqueCues: sub.techniqueCues,
      commonMistakes: sub.commonMistakes,
      youtubeId: sub.youtubeId,
      substitutions: sub.substitutions
    };

    setExercisesList(updatedList);
    setInputWeight(Math.round(inputWeight * 0.8 / 2.5) * 2.5);
    setProgressionBanner(`Substituted to ${sub.name}: ${reason}`);
    VoiceCoachService.speak(`Swapped to ${sub.name}. Load adjusted.`);
  };

  // Complete entire workout session
  const handleFinishFullWorkout = () => {
    let totalVolume = 0;
    const loggedExercises: LoggedExercise[] = [];

    exercisesList.forEach(ex => {
      const sets = loggedData[ex.id] || [];
      if (sets.length > 0) {
        loggedExercises.push({
          exerciseId: ex.exerciseId,
          name: ex.name,
          sets
        });
        sets.forEach(s => {
          totalVolume += s.actualLoad * s.actualReps;
        });
      }
    });

    const completed: CompletedWorkout = {
      id: `comp_${Date.now()}`,
      workoutSessionId: workout.id,
      title: workout.title,
      date: new Date().toISOString().split('T')[0],
      startTime: '08:00',
      endTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      durationMinutes: workout.estimatedDurationMinutes,
      exercises: loggedExercises,
      overallRPE: 8.0,
      readinessBefore: readinessScore,
      totalVolumeLoadKg: totalVolume,
      coachingSummary: `Completed ${loggedExercises.length} movements with ${totalVolume.toLocaleString()} kg total volume load.`
    };

    StorageService.saveCompletedWorkout(completed);
    onFinishWorkout(completed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full h-[96vh] flex flex-col overflow-hidden text-slate-900">
        
        {/* Top Active Bar */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-hud font-bold text-sm text-slate-900">ACTIVE WORKOUT HUD</span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-bold">
                  {workout.type}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">{workout.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleFinishFullWorkout()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Finish Workout</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Exercise Progress Segmented Bar */}
        <div className="px-5 py-2 bg-slate-100/70 border-b border-slate-200/60 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {exercisesList.map((ex, idx) => {
            const isCompleted = (loggedData[ex.id]?.length || 0) >= ex.targetSets;
            const isCurrent = idx === currentExerciseIndex;

            return (
              <button
                key={ex.id}
                onClick={() => {
                  setCurrentExerciseIndex(idx);
                  setIsResting(false);
                  const nextLogs = loggedData[ex.id] || [];
                  setInputWeight(nextLogs.length > 0 ? nextLogs[nextLogs.length - 1].actualLoad : ex.recommendedLoad);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-sm'
                    : isCompleted
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                <span>{idx + 1}. {ex.name.split(' ')[0]}</span>
                {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
              </button>
            );
          })}
        </div>

        {/* Rest Timer Overlay (When active between sets) */}
        {isResting && (
          <div className="px-5 pt-3">
            <RestTimerOverlay
              initialSeconds={restSeconds}
              exerciseName={currentExercise?.name || ''}
              nextLoad={inputWeight}
              nextReps={currentExercise?.targetReps || '8'}
              onFinish={() => setIsResting(false)}
            />
          </div>
        )}

        {/* Main Exercise Content Area */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          
          {/* Active Exercise Header Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-1">
                <span>Movement {currentExerciseIndex + 1} of {exercisesList.length}</span>
                <span>·</span>
                <span className="capitalize font-semibold text-blue-600">{currentExercise.targetMuscle}</span>
                <span>·</span>
                <span className="capitalize">{currentExercise.movementPattern.replace('_', ' ')}</span>
              </div>
              <h2 className="font-hud font-bold text-xl text-slate-900">{currentExercise.name}</h2>
              <p className="text-xs text-slate-600 mt-1">
                Tempo: <strong className="font-mono">{currentExercise.tempo}</strong> · Target: <strong>{currentExercise.targetSets} sets × {currentExercise.targetReps} reps</strong> · Target RPE: <strong>{currentExercise.targetRPE}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDemoModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-2xs transition-colors"
              >
                <Play className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
                <span>Video Guide</span>
              </button>
              
              <button
                onClick={() => setShowSubstitutionModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-2xs transition-colors"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-600" />
                <span>Substitute</span>
              </button>
            </div>
          </div>

          {/* Real-time Progression Advice Banner */}
          {progressionBanner && (
            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200/80 text-blue-900 text-xs flex items-start gap-2.5 animate-in fade-in">
              <TrendingUp className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">JARVIS Decision: </strong>
                <span>{progressionBanner}</span>
              </div>
            </div>
          )}

          {/* Logged Sets Table */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider">
              <span>Completed Sets ({exerciseLogs.length}/{currentExercise.targetSets})</span>
              <span className="font-mono text-slate-500 font-normal">Auto-Overload Tracking</span>
            </div>

            {exerciseLogs.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No sets recorded yet. Enter your performance below and tap "Log Set".
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {exerciseLogs.map((set, idx) => (
                  <div key={idx} className="px-4 py-3 flex items-center justify-between text-xs hover:bg-slate-50/50">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 font-mono text-[11px]">
                        {set.setNumber}
                      </span>
                      <div>
                        <strong className="font-mono font-bold text-sm text-slate-900">{set.actualLoad} kg</strong>
                        <span className="text-slate-400 mx-1">×</span>
                        <strong className="font-mono font-bold text-sm text-slate-900">{set.actualReps} reps</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 font-mono text-[11px] text-slate-600">
                      <span>RPE {set.rpe}</span>
                      <span>·</span>
                      <span>RIR {set.rir}</span>
                      <span>·</span>
                      <span>Form {set.techniqueQuality}/5</span>
                      {set.painLevel > 0 && (
                        <span className="text-rose-600 font-bold">Pain {set.painLevel}/10</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Set Logging Card */}
          <div className="p-5 rounded-2xl bg-white border-2 border-blue-500/30 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <span className="font-hud font-bold text-sm text-blue-700">
                  {isFinishedAllSets ? 'EXTRA / OVER-REACH SET' : `LOG SET ${currentSetNumber} OF ${currentExercise.targetSets}`}
                </span>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                Target: {currentExercise.recommendedLoad}kg × {currentExercise.targetReps}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              
              {/* Actual Load Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                    Load (kg)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPlateModal(true)}
                    className="text-[10px] text-blue-600 font-bold hover:underline flex items-center gap-1"
                    title="Calculate barbell plate distribution"
                  >
                    <Layers className="w-3 h-3" />
                    <span>Plates</span>
                  </button>
                </div>
                <div className="flex items-center">
                  <input
                    type="number"
                    step="0.5"
                    value={inputWeight}
                    onChange={e => setInputWeight(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Actual Reps Input */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Reps Completed
                </label>
                <input
                  type="number"
                  value={inputReps}
                  onChange={e => setInputReps(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* RPE Selector */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  RPE (Exertion 6-10)
                </label>
                <select
                  value={inputRpe}
                  onChange={e => {
                    const r = parseFloat(e.target.value);
                    setInputRpe(r);
                    setInputRir(Math.max(0, Math.round(10 - r)));
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-sm font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="6.5">6.5 (Easy warm-up feel)</option>
                  <option value="7.0">7.0 (3 reps left)</option>
                  <option value="7.5">7.5 (2-3 reps left)</option>
                  <option value="8.0">8.0 (2 reps left in reserve)</option>
                  <option value="8.5">8.5 (1-2 reps left)</option>
                  <option value="9.0">9.0 (1 rep left)</option>
                  <option value="9.5">9.5 (Maybe 0-1 rep)</option>
                  <option value="10">10 (True maximum limit)</option>
                </select>
              </div>

              {/* Technique Quality */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Technique (1-5)
                </label>
                <select
                  value={techniqueQuality}
                  onChange={e => setTechniqueQuality(parseInt(e.target.value) as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-sm font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="5">5/5 - Flawless Bar Path</option>
                  <option value="4">4/5 - Good form, slight speed drop</option>
                  <option value="3">3/5 - Minor breakdown on final rep</option>
                  <option value="2">2/5 - Significant form breakdown</option>
                  <option value="1">1/1 - Failed mechanically</option>
                </select>
              </div>

            </div>

            {/* Pain / Joint Check Slider (Safety Override) */}
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <span className="font-bold text-slate-700 flex items-center gap-1">
                  <AlertTriangle className={`w-3.5 h-3.5 ${painLevel > 0 ? 'text-rose-500' : 'text-slate-400'}`} />
                  Joint Discomfort / Pain:
                </span>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={painLevel}
                  onChange={e => setPainLevel(parseInt(e.target.value))}
                  className="w-32 accent-rose-500"
                />
                <span className={`font-mono font-bold ${painLevel > 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                  {painLevel}/10
                </span>
              </div>

              {painLevel > 0 && (
                <input
                  type="text"
                  placeholder="Location (e.g. left shoulder)"
                  value={painLocation}
                  onChange={e => setPainLocation(e.target.value)}
                  className="px-2.5 py-1 text-xs rounded-lg border border-rose-200 bg-rose-50 text-rose-900 w-full sm:w-48"
                />
              )}

              {/* Log Set Button */}
              <button
                type="button"
                onClick={handleLogSet}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all shadow-blue-500/20"
              >
                Log Set & Start Rest
              </button>
            </div>
          </div>

          {/* Voice Coach Control Widget */}
          <VoiceCoachControl
            currentExercise={currentExercise}
            currentSet={currentSetNumber}
            currentWeight={inputWeight}
            onVoiceAction={handleVoiceAction}
          />

        </div>

        {/* Bottom Navigation Toolbar */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            disabled={currentExerciseIndex === 0}
            onClick={() => {
              setCurrentExerciseIndex(prev => prev - 1);
              setIsResting(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-white disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <span className="text-xs font-mono text-slate-500">
            Movement {currentExerciseIndex + 1} of {exercisesList.length}
          </span>

          <button
            disabled={currentExerciseIndex === exercisesList.length - 1}
            onClick={() => {
              setCurrentExerciseIndex(prev => prev + 1);
              setIsResting(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-white disabled:opacity-40 transition-colors"
          >
            <span>Next Movement</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Video Demonstration Modal */}
      {showDemoModal && exerciseDef && (
        <ExerciseDemoModal
          exercise={exerciseDef}
          onClose={() => setShowDemoModal(false)}
        />
      )}

      {/* Intelligent Substitution Modal */}
      {showSubstitutionModal && (
        <IntelligentSubstitutionModal
          isOpen={showSubstitutionModal}
          onClose={() => setShowSubstitutionModal(false)}
          currentExercise={currentExercise}
          profile={profile}
          onSelectSubstitution={handleApplySubstitution}
        />
      )}

      {/* Barbell Plate Loading Calculator Modal */}
      {showPlateModal && (
        <PlateCalculatorModal
          initialWeight={inputWeight}
          onClose={() => setShowPlateModal(false)}
        />
      )}

    </div>
  );
};
