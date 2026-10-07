/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TodayView } from './components/TodayView';
import { ProgramView } from './components/ProgramView';
import { NutritionView } from './components/NutritionView';
import { CoachingMemoryView } from './components/CoachingMemoryView';
import { GuidedWorkoutModal } from './components/GuidedWorkoutModal';
import { ReadinessModal } from './components/ReadinessModal';
import { AssessmentModal } from './components/AssessmentModal';
import { AndroidStatusBar } from './components/AndroidStatusBar';
import { AndroidBottomNav } from './components/AndroidBottomNav';
import { AndroidGestureBar } from './components/AndroidGestureBar';
import { AndroidBlueprintModal } from './components/AndroidBlueprintModal';
import { WeeklyStandUpModal } from './components/WeeklyStandUpModal';
import { AICoachChatModal } from './components/AICoachChatModal';
import { AICoachScreen } from './components/AICoachScreen';
import { GalaxyHealthModal } from './components/GalaxyHealthModal';
import { PlateCalculatorModal } from './components/PlateCalculatorModal';
import { PRHallOfFameModal } from './components/PRHallOfFameModal';
import { MuscleHeatmapModal } from './components/MuscleHeatmapModal';
import { CustomRoutineModal } from './components/CustomRoutineModal';
import { ThemeSelectorModal } from './components/ThemeSelectorModal';
import { AndroidExportModal } from './components/AndroidExportModal';

import { 
  UserProfile, 
  ReadinessState, 
  WorkoutSession, 
  CompletedWorkout, 
  CoachingMemory, 
  MealLog,
  IntensityMode,
  WeeklyStandupResult,
  AppThemeId,
  NavigationTab
} from './types';
import { StorageService } from './services/storageService';
import { TrainingEngine } from './services/trainingEngine';
import { RecoveryEngine } from './services/recoveryEngine';
import { ThemeService } from './services/themeService';
import { CalendarExportService } from './services/calendarExportService';
import { CSVExportService } from './services/csvExportService';
import { 
  auth, 
  signInWithGoogle, 
  logOut, 
  onAuthStateChanged, 
  syncUserProfileToCloud, 
  loadUserProfileFromCloud,
  saveWorkoutToCloud,
  saveMealToCloud 
} from './services/firebase';
import { User as FirebaseUser } from 'firebase/auth';

export default function App() {
  // Load persistent state
  const [profile, setProfile] = useState<UserProfile>(() => StorageService.getProfile());
  const [readiness, setReadiness] = useState<ReadinessState>(() => StorageService.getReadiness());
  const [program, setProgram] = useState<WorkoutSession[]>(() => 
    TrainingEngine.generateWeeklyProgram(profile, readiness)
  );
  const [memories, setMemories] = useState<CoachingMemory[]>(() => 
    StorageService.getCoachingMemories()
  );
  const [completedWorkouts, setCompletedWorkouts] = useState<CompletedWorkout[]>(() => 
    StorageService.getCompletedWorkouts()
  );
  const [mealLogs, setMealLogs] = useState<MealLog[]>(() => 
    StorageService.getMealLogs()
  );

  // Firebase Auth state
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const cloudProfile = await loadUserProfileFromCloud(user.uid);
        if (cloudProfile) {
          setProfile(cloudProfile);
        } else {
          await syncUserProfileToCloud(user.uid, profile);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // PEAKD Flexibility Workout Intensity Mode ('main' | 'lite' | 'survival')
  const [intensityMode, setIntensityMode] = useState<IntensityMode>('main');

  // Active UI Navigation state
  const [activeTab, setActiveTab] = useState<NavigationTab>('today');

  // Device display mode: 'phone' (Pixel 9 Pro Shell) or 'fullscreen'
  const [deviceViewMode, setDeviceViewMode] = useState<'phone' | 'fullscreen'>('phone');

  // Modals state
  const [isGuidedWorkoutOpen, setIsGuidedWorkoutOpen] = useState<boolean>(false);
  const [activeWorkoutToRun, setActiveWorkoutToRun] = useState<WorkoutSession | null>(null);
  const [isReadinessModalOpen, setIsReadinessModalOpen] = useState<boolean>(false);
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState<boolean>(false);
  const [isBlueprintModalOpen, setIsBlueprintModalOpen] = useState<boolean>(false);
  const [isStandupModalOpen, setIsStandupModalOpen] = useState<boolean>(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState<boolean>(false);
  const [isGalaxyHealthOpen, setIsGalaxyHealthOpen] = useState<boolean>(false);
  const [isPlateCalcOpen, setIsPlateCalcOpen] = useState<boolean>(false);
  const [targetPlateWeight, setTargetPlateWeight] = useState<number>(85);
  const [isPRHallOfFameOpen, setIsPRHallOfFameOpen] = useState<boolean>(false);
  const [isMuscleHeatmapOpen, setIsMuscleHeatmapOpen] = useState<boolean>(false);
  const [isCustomRoutineOpen, setIsCustomRoutineOpen] = useState<boolean>(false);

  // Futuristic Theme System (5 light cybernetic environments)
  const [currentThemeId, setCurrentThemeId] = useState<AppThemeId>(() => ThemeService.getActiveThemeId());
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState<boolean>(false);
  const [isAndroidExportOpen, setIsAndroidExportOpen] = useState<boolean>(false);

  useEffect(() => {
    ThemeService.applyCssVariables(ThemeService.getActiveTheme());
  }, [currentThemeId]);

  const handleSelectTheme = (newThemeId: AppThemeId) => {
    setCurrentThemeId(newThemeId);
    ThemeService.setTheme(newThemeId);
  };

  const handleOpenPlateCalc = (weight?: number) => {
    if (weight) setTargetPlateWeight(weight);
    setIsPlateCalcOpen(true);
  };

  const handleCalendarExport = () => {
    CalendarExportService.downloadCalendarFile(program);
  };

  const handleWorkoutsCSVExport = () => {
    CSVExportService.exportWorkoutsCSV(completedWorkouts);
  };

  const handleSaveCustomRoutine = (newRoutine: WorkoutSession) => {
    setProgram(prev => [...prev, newRoutine]);
  };

  // Today's workout session
  const todayWorkout: WorkoutSession = program[0] || {
    id: 'session_fallback',
    dayNumber: 1,
    dayName: 'Today',
    title: 'Adaptive Foundation',
    focus: 'Full Body Activation',
    type: 'strength',
    estimatedDurationMinutes: 50,
    warmUp: { durationMinutes: 5, exercises: [] },
    exercises: [],
    coolDown: { durationMinutes: 5, exercises: [] }
  };

  const handleUpdateProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    const newProg = TrainingEngine.generateWeeklyProgram(newProfile, readiness);
    setProgram(newProg);
    if (currentUser) {
      syncUserProfileToCloud(currentUser.uid, newProfile);
    }
  };

  const handleUpdateReadiness = (newReadiness: ReadinessState) => {
    setReadiness(newReadiness);
    const newProg = TrainingEngine.generateWeeklyProgram(profile, newReadiness);
    setProgram(newProg);
  };

  const handleUpdateWeight = (newWeight: number) => {
    const updated = { ...profile, weight: newWeight };
    handleUpdateProfile(updated);
  };

  const handleStartWorkout = (targetWorkout?: WorkoutSession) => {
    setActiveWorkoutToRun(targetWorkout || todayWorkout);
    setIsGuidedWorkoutOpen(true);
  };

  const handleFinishWorkout = (completed: CompletedWorkout) => {
    setIsGuidedWorkoutOpen(false);
    setCompletedWorkouts(prev => [completed, ...prev]);
    setProfile(prev => ({ ...prev, streakDays: (prev.streakDays || 14) + 1 }));
    setMemories(StorageService.getCoachingMemories());
    if (currentUser) {
      saveWorkoutToCloud(currentUser.uid, completed);
      syncUserProfileToCloud(currentUser.uid, { ...profile, streakDays: (profile.streakDays || 14) + 1 });
    }
  };

  const handleAddMealLog = (meal: MealLog) => {
    StorageService.saveMealLog(meal);
    setMealLogs(prev => [meal, ...prev]);
    if (currentUser) {
      saveMealToCloud(currentUser.uid, meal);
    }
  };

  const handleDeleteMealLog = (id: string) => {
    StorageService.deleteMealLog(id);
    setMealLogs(prev => prev.filter(m => m.id !== id));
  };

  const handleAddMemory = (memory: CoachingMemory) => {
    setMemories(prev => [memory, ...prev]);
  };

  const handleApplyStandupResult = (result: WeeklyStandupResult) => {
    if (result.recommendedMode) {
      setIntensityMode(result.recommendedMode);
    }
  };

  // Google Sign-In with Firebase Auth
  const handleSignInGoogle = async () => {
    try {
      const user = await signInWithGoogle();
      if (user) {
        await syncUserProfileToCloud(user.uid, profile);
      }
    } catch (e) {
      console.warn("Google sign-in completed or cancelled", e);
    }
  };

  const handleSignOut = async () => {
    try {
      await logOut();
      setCurrentUser(null);
    } catch (e) {}
  };

  const handleApplyGeneratedWorkout = (gen: any) => {
    if (gen && gen.days) {
      setProgram(prev => {
        return prev.map((sess, idx) => {
          const d = gen.days[idx % gen.days.length];
          return {
            ...sess,
            title: d.name || sess.title,
            focus: d.focus || sess.focus
          };
        });
      });
    }
  };

  // Render the core view content
  const renderCurrentView = () => {
    switch (activeTab) {
      case 'today':
        return (
          <TodayView
            profile={profile}
            readiness={readiness}
            todayWorkout={todayWorkout}
            memories={memories}
            completedWorkouts={completedWorkouts}
            intensityMode={intensityMode}
            setIntensityMode={setIntensityMode}
            onStartWorkout={(w) => handleStartWorkout(w)}
            onOpenReadinessModal={() => setIsReadinessModalOpen(true)}
            onOpenStandupModal={() => setIsStandupModalOpen(true)}
            onOpenChatModal={() => setIsChatModalOpen(true)}
            onUpdateWeight={handleUpdateWeight}
            onOpenGalaxyHealth={() => setIsGalaxyHealthOpen(true)}
            onOpenPlateCalc={handleOpenPlateCalc}
            onOpenPRHallOfFame={() => setIsPRHallOfFameOpen(true)}
            onOpenMuscleHeatmap={() => setIsMuscleHeatmapOpen(true)}
            onExportCalendar={handleCalendarExport}
            onOpenThemeSelector={() => setIsThemeSelectorOpen(true)}
            onApplyReadiness={handleUpdateReadiness}
          />
        );
      case 'program':
        return (
          <ProgramView
            program={program}
            profile={profile}
            completedWorkouts={completedWorkouts}
            onStartSpecificWorkout={(w) => handleStartWorkout(w)}
            onOpenPlateCalc={handleOpenPlateCalc}
            onOpenCustomRoutine={() => setIsCustomRoutineOpen(true)}
            onExportCalendar={handleCalendarExport}
            onExportWorkoutsCSV={handleWorkoutsCSVExport}
          />
        );
      case 'nutrition':
        return (
          <NutritionView
            profile={profile}
            mealLogs={mealLogs}
            onAddMealLog={handleAddMealLog}
            onDeleteMealLog={handleDeleteMealLog}
          />
        );
      case 'coach':
        return (
          <AICoachScreen
            profile={profile}
            todayWorkout={todayWorkout}
            readiness={readiness}
            onApplyGeneratedWorkout={handleApplyGeneratedWorkout}
            onSelectAction={(action) => {
              if (action === 'set_lite_mode') setIntensityMode('lite');
              if (action === 'open_substitution') setIsGuidedWorkoutOpen(true);
            }}
          />
        );
      case 'memory':
        return (
          <CoachingMemoryView
            memories={memories}
            completedWorkouts={completedWorkouts}
            profile={profile}
            onAddMemory={handleAddMemory}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-900 flex flex-col font-sans selection:bg-blue-500/20">
      
      {/* Top Bar: Rendered in Fullscreen Viewport Mode */}
      {deviceViewMode === 'fullscreen' && (
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          readiness={readiness}
          profile={profile}
          currentUser={currentUser}
          deviceViewMode={deviceViewMode}
          setDeviceViewMode={setDeviceViewMode}
          onOpenReadinessModal={() => setIsReadinessModalOpen(true)}
          onOpenAssessmentModal={() => setIsAssessmentModalOpen(true)}
          onOpenBlueprintModal={() => setIsBlueprintModalOpen(true)}
          onOpenChatModal={() => setIsChatModalOpen(true)}
          onOpenGalaxyHealth={() => setIsGalaxyHealthOpen(true)}
          onOpenPlateCalc={() => handleOpenPlateCalc()}
          onOpenPRHallOfFame={() => setIsPRHallOfFameOpen(true)}
          onOpenThemeSelector={() => setIsThemeSelectorOpen(true)}
          onSignInGoogle={handleSignInGoogle}
          onSignOut={handleSignOut}
        />
      )}

      {/* Main Container: Mobile Frame vs Full Screen */}
      <div className={`flex-1 flex flex-col items-center justify-center ${deviceViewMode === 'phone' ? 'p-0 md:p-6' : 'p-0'}`}>
        
        {deviceViewMode === 'phone' ? (
          /* =========================================================================
              GOOGLE PIXEL 9 PRO ANDROID MOBILE APP FRAME
             ========================================================================= */
          <div className="relative w-full md:max-w-[430px] h-screen md:h-[890px] bg-slate-900 md:rounded-[50px] p-0 md:p-[10px] shadow-2xl md:ring-12 md:ring-slate-800/80 flex flex-col overflow-hidden">
            
            {/* Phone Outer Screen Wrapper */}
            <div className="w-full h-full bg-[#f8fafc] md:rounded-[40px] flex flex-col overflow-hidden relative border border-slate-200">
              
              {/* Android 15 Status Bar (The absolute topmost element on the phone screen) */}
              <AndroidStatusBar darkIcons={true} />

              {/* In-App Mobile Top App Bar (Material 3) */}
              <div className="px-4 py-2.5 bg-white/95 backdrop-blur-md border-b border-slate-200 flex items-center justify-between z-20 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-2xs font-hud font-bold text-xs">
                    J
                  </div>
                  <div>
                    <span className="font-hud font-bold text-sm tracking-tight text-slate-900 block leading-tight">
                      JARVIS
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 leading-tight block">
                      Adaptive Trainer
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Switch to Fullscreen Mode button */}
                  <button
                    onClick={() => setDeviceViewMode('fullscreen')}
                    className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200"
                    title="Switch to Fullscreen Desktop View"
                  >
                    <svg className="w-3.5 h-3.5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </button>

                  {/* Android 15 & ADB Export Kit Trigger */}
                  <button
                    onClick={() => setIsAndroidExportOpen(true)}
                    className="p-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-colors border border-emerald-200"
                    title="Export Native Android 15 APK & ADB Commands"
                  >
                    <svg className="w-3.5 h-3.5 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </button>

                  {/* Futuristic Theme Switcher */}
                  <button
                    onClick={() => setIsThemeSelectorOpen(true)}
                    className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200"
                    title="Futuristic Themes (5 Light Environments)"
                  >
                    <svg className="w-3.5 h-3.5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4 4 4 0 014-4h2.5a2.5 2.5 0 002.5-2.5V8a4 4 0 014-4 4 4 0 014 4v2.5a2.5 2.5 0 002.5 2.5H21a4 4 0 010 8h-2.5a2.5 2.5 0 00-2.5 2.5V21" />
                    </svg>
                  </button>

                  {/* Galaxy Health Real-Time Sync Trigger */}
                  <button
                    onClick={() => setIsGalaxyHealthOpen(true)}
                    className="p-1.5 rounded-full bg-cyan-50 hover:bg-cyan-100 text-cyan-800 transition-colors border border-cyan-200 relative"
                    title="Galaxy Health Realtime Biometrics"
                  >
                    <svg className="w-3.5 h-3.5 text-cyan-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <rect x="5" y="6" width="14" height="12" rx="3" strokeWidth="2" />
                      <path d="M9 2h6M9 22h6" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <span className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </button>

                  {/* Google Sign In / User Avatar */}
                  {currentUser ? (
                    <button
                      onClick={handleSignOut}
                      className="w-7 h-7 rounded-full bg-blue-100 border border-blue-200 text-blue-800 font-bold text-xs flex items-center justify-center overflow-hidden"
                      title={`Signed in as ${currentUser.displayName || currentUser.email}. Tap to sign out.`}
                    >
                      {currentUser.photoURL ? (
                        <img src={currentUser.photoURL} alt="User" className="w-full h-full object-cover" />
                      ) : (
                        <span>{(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}</span>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={handleSignInGoogle}
                      className="px-2 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-semibold text-[10px] flex items-center gap-1"
                      title="Sign in with Google"
                    >
                      <span>Sign In</span>
                    </button>
                  )}

                  <button
                    onClick={() => setIsReadinessModalOpen(true)}
                    className="px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-mono font-bold text-[11px] flex items-center gap-1"
                  >
                    <span>{readiness.score}</span>
                    <span className="text-[9px] uppercase font-sans">Ready</span>
                  </button>
                </div>
              </div>

              {/* Scrollable Mobile App Body */}
              <div className="flex-1 overflow-y-auto overscroll-contain">
                {renderCurrentView()}
              </div>

              {/* Android Material 3 Bottom Navigation Bar */}
              <AndroidBottomNav
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onOpenProfile={() => setIsAssessmentModalOpen(true)}
              />

              {/* Android Gesture Navigation Pill */}
              <AndroidGestureBar />

            </div>

          </div>
        ) : (
          /* =========================================================================
              FULL RESPONSIVE SCREEN LAYOUT
             ========================================================================= */
          <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col bg-white border border-slate-200 shadow-sm md:rounded-2xl overflow-hidden">
            <div className="flex-1">
              {renderCurrentView()}
            </div>
          </div>
        )}

      </div>

      {/* Guided Workout Active HUD Modal */}
      {isGuidedWorkoutOpen && activeWorkoutToRun && (
        <GuidedWorkoutModal
          workout={activeWorkoutToRun}
          profile={profile}
          readinessScore={readiness.score}
          onClose={() => setIsGuidedWorkoutOpen(false)}
          onFinishWorkout={handleFinishWorkout}
        />
      )}

      {/* Bio-Readiness Check-in Modal */}
      {isReadinessModalOpen && (
        <ReadinessModal
          isOpen={isReadinessModalOpen}
          onClose={() => setIsReadinessModalOpen(false)}
          currentReadiness={readiness}
          onSaveReadiness={handleUpdateReadiness}
        />
      )}

      {/* Comprehensive Assessment Modal */}
      {isAssessmentModalOpen && (
        <AssessmentModal
          isOpen={isAssessmentModalOpen}
          onClose={() => setIsAssessmentModalOpen(false)}
          currentProfile={profile}
          onSaveProfile={handleUpdateProfile}
        />
      )}

      {/* Android Kotlin Blueprint & Direct Installation Modal */}
      {isBlueprintModalOpen && (
        <AndroidBlueprintModal
          isOpen={isBlueprintModalOpen}
          onClose={() => setIsBlueprintModalOpen(false)}
        />
      )}

      {/* PEAKD Weekly Stand-Up Modal */}
      {isStandupModalOpen && (
        <WeeklyStandUpModal
          isOpen={isStandupModalOpen}
          onClose={() => setIsStandupModalOpen(false)}
          profile={profile}
          completedWorkouts={completedWorkouts}
          onApplyStandupResult={handleApplyStandupResult}
        />
      )}

      {/* PEAKD AI Personal Trainer Suite Modal */}
      {isChatModalOpen && (
        <AICoachChatModal
          isOpen={isChatModalOpen}
          onClose={() => setIsChatModalOpen(false)}
          profile={profile}
          todayWorkout={todayWorkout}
          readiness={readiness}
          onApplyGeneratedWorkout={handleApplyGeneratedWorkout}
          onSelectAction={(action) => {
            if (action === 'set_lite_mode') setIntensityMode('lite');
            if (action === 'open_substitution') setIsGuidedWorkoutOpen(true);
          }}
        />
      )}

      {/* Samsung Galaxy Health Realtime Sync Hub Modal */}
      {isGalaxyHealthOpen && (
        <GalaxyHealthModal
          onClose={() => setIsGalaxyHealthOpen(false)}
          onApplyReadiness={handleUpdateReadiness}
        />
      )}

      {/* Barbell Plate Loading Calculator Modal */}
      {isPlateCalcOpen && (
        <PlateCalculatorModal
          initialWeight={targetPlateWeight}
          onClose={() => setIsPlateCalcOpen(false)}
        />
      )}

      {/* PR Hall of Fame & 1RM Lab Modal */}
      {isPRHallOfFameOpen && (
        <PRHallOfFameModal
          profile={profile}
          completedWorkouts={completedWorkouts}
          onClose={() => setIsPRHallOfFameOpen(false)}
        />
      )}

      {/* Anatomical Muscle Recovery Heatmap Modal */}
      {isMuscleHeatmapOpen && (
        <MuscleHeatmapModal
          completedWorkouts={completedWorkouts}
          onClose={() => setIsMuscleHeatmapOpen(false)}
        />
      )}

      {/* Custom Workout Routine Builder Modal */}
      {isCustomRoutineOpen && (
        <CustomRoutineModal
          onSaveRoutine={handleSaveCustomRoutine}
          onClose={() => setIsCustomRoutineOpen(false)}
        />
      )}

      {/* Futuristic Light Themes Matrix Modal */}
      {isThemeSelectorOpen && (
        <ThemeSelectorModal
          currentThemeId={currentThemeId}
          onSelectTheme={handleSelectTheme}
          onClose={() => setIsThemeSelectorOpen(false)}
        />
      )}

      {/* Native Android 15 APK & ADB Export Modal */}
      {isAndroidExportOpen && (
        <AndroidExportModal
          isOpen={isAndroidExportOpen}
          onClose={() => setIsAndroidExportOpen(false)}
        />
      )}

    </div>
  );
}

function AICoachChatModalTriggerIcon() {
  return (
    <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
  );
}
