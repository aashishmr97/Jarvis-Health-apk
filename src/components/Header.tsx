import React from 'react';
import { 
  Activity, 
  Sparkles, 
  Utensils, 
  Brain, 
  Calendar, 
  SlidersHorizontal,
  Zap,
  Smartphone,
  Maximize2,
  Code2,
  LogIn,
  LogOut,
  User,
  Bot,
  Watch,
  Layers,
  Trophy,
  Palette
} from 'lucide-react';
import { ReadinessState, UserProfile, NavigationTab } from '../types';
import { User as FirebaseUser } from 'firebase/auth';

interface HeaderProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  readiness: ReadinessState;
  profile: UserProfile;
  currentUser: FirebaseUser | null;
  deviceViewMode: 'phone' | 'fullscreen';
  setDeviceViewMode: (mode: 'phone' | 'fullscreen') => void;
  onOpenReadinessModal: () => void;
  onOpenAssessmentModal: () => void;
  onOpenBlueprintModal: () => void;
  onOpenChatModal: () => void;
  onOpenGalaxyHealth: () => void;
  onOpenPlateCalc: () => void;
  onOpenPRHallOfFame: () => void;
  onOpenThemeSelector: () => void;
  onSignInGoogle: () => void;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  readiness,
  profile,
  currentUser,
  deviceViewMode,
  setDeviceViewMode,
  onOpenReadinessModal,
  onOpenAssessmentModal,
  onOpenBlueprintModal,
  onOpenChatModal,
  onOpenGalaxyHealth,
  onOpenPlateCalc,
  onOpenPRHallOfFame,
  onOpenThemeSelector,
  onSignInGoogle,
  onSignOut
}) => {
  const getReadinessBadgeClass = () => {
    if (readiness.score >= 88) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (readiness.score >= 75) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (readiness.score >= 55) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Android App Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Identity */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 shrink-0">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-hud font-bold text-base sm:text-lg tracking-tight text-slate-900 leading-tight">JARVIS</span>
                <span className="hidden sm:inline-flex text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 items-center gap-1 whitespace-nowrap shrink-0">
                  <Smartphone className="w-2.5 h-2.5" />
                  Android 15 Edition
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate">Adaptive Personal Trainer · Gemini AI</p>
            </div>
          </div>

          {/* Right Controls & Device Viewport Switcher */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Galaxy Health Real-Time Sync Indicator & Launcher */}
            <button
              onClick={onOpenGalaxyHealth}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-cyan-200 bg-cyan-50/70 hover:bg-cyan-100 text-cyan-800 text-xs font-bold transition-all shadow-2xs"
              title="Galaxy Health Realtime Biometrics (Watch & Ring)"
            >
              <Watch className="w-3.5 h-3.5 text-cyan-600" />
              <span className="hidden sm:inline">Galaxy Health</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </button>

            {/* Barbell Plate Loading Calculator */}
            <button
              onClick={onOpenPlateCalc}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
              title="Barbell Plate Loading Calculator"
            >
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>Plates</span>
            </button>

            {/* PR & 1RM Lab */}
            <button
              onClick={onOpenPRHallOfFame}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-amber-200 bg-amber-50/70 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-colors"
              title="PR Hall of Fame & 1RM Lab"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-600" />
              <span>PRs</span>
            </button>

            {/* Futuristic Theme Matrix Trigger */}
            <button
              onClick={onOpenThemeSelector}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors shadow-2xs"
              title="Change Futuristic Light Theme (5 Environments)"
            >
              <Palette className="w-3.5 h-3.5 text-cyan-600" />
              <span className="hidden xl:inline">Themes</span>
            </button>

            {/* AI Personal Trainer Chatbot Launcher */}
            <button
              onClick={onOpenChatModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
              title="Launch AI Personal Trainer Chatbot (Workout Plans, Diet Charts & Live Voice)"
            >
              <Bot className="w-4 h-4" />
              <span className="hidden sm:inline">AI Trainer</span>
            </button>

            {/* Switch between Pixel Mobile Shell and Full Screen */}
            <div className="hidden lg:flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80 text-xs font-semibold text-slate-600">
              <button
                onClick={() => setDeviceViewMode('phone')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
                  deviceViewMode === 'phone'
                    ? 'bg-white text-blue-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="View inside Google Pixel 9 Pro device frame"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Pixel 9 Pro</span>
              </button>
              <button
                onClick={() => setDeviceViewMode('fullscreen')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
                  deviceViewMode === 'fullscreen'
                    ? 'bg-white text-blue-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Full Responsive View"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Full Screen</span>
              </button>
            </div>

            {/* Firebase Google Auth Button */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenAssessmentModal}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium border border-slate-200"
                  title={`Signed in as ${currentUser.displayName || currentUser.email}`}
                >
                  {currentUser.photoURL ? (
                    <img src={currentUser.photoURL} alt="User Avatar" className="w-4 h-4 rounded-full" />
                  ) : (
                    <User className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden sm:inline max-w-[90px] truncate">{currentUser.displayName?.split(' ')[0] || 'User'}</span>
                </button>
                <button
                  onClick={onSignOut}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Sign out of Firebase"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onSignInGoogle}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
                title="Sign in with Google to sync with Firebase Firestore"
              >
                <LogIn className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Google Sign-In</span>
              </button>
            )}

            {/* Readiness Trigger */}
            <button
              onClick={onOpenReadinessModal}
              title="Click to check in today's bio-telemetry"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all hover:shadow-sm ${getReadinessBadgeClass()}`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Readiness: <strong className="font-mono-num font-bold">{readiness.score}</strong></span>
              <span className="hidden sm:inline capitalize">· {readiness.tier.replace('_', ' ')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-bar (for desktop / full-screen mode) */}
      {deviceViewMode === 'fullscreen' && (
        <div className="border-t border-slate-100 bg-slate-50/60 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto py-2 scrollbar-none">
            <button
              onClick={() => setActiveTab('today')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'today'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Today's Mandate</span>
            </button>

            <button
              onClick={() => setActiveTab('program')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'program'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>7-Day Program & Overload</span>
            </button>

            <button
              onClick={() => setActiveTab('nutrition')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'nutrition'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Nutrition & Food Log</span>
            </button>

            {/* Tab: AI Coach (Dedicated Screen next to Nutrition) */}
            <button
              onClick={() => setActiveTab('coach')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'coach'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-cyan-500" />
              <span>AI Personal Trainer</span>
            </button>

            <button
              onClick={() => setActiveTab('memory')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'memory'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Coaching Memory Vault</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
