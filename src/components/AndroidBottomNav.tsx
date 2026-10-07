import React from 'react';
import { Zap, Calendar, Utensils, Brain, User, Bot } from 'lucide-react';
import { NavigationTab } from '../types';

interface AndroidBottomNavProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  onOpenProfile: () => void;
}

export const AndroidBottomNav: React.FC<AndroidBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenProfile
}) => {
  const handleNav = (tab: NavigationTab) => {
    // Trigger native Android haptic vibration if available
    try {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(15);
      }
    } catch (e) {}
    setActiveTab(tab);
  };

  return (
    <nav className="w-full bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-1.5 px-2 z-30 select-none">
      <div className="flex items-center justify-around max-w-md mx-auto">
        
        {/* Tab 1: Today */}
        <button
          onClick={() => handleNav('today')}
          className="flex flex-col items-center gap-0.5 py-1 px-1.5 group transition-transform active:scale-95"
        >
          <div className={`px-3 py-1 rounded-full transition-all flex items-center justify-center ${
            activeTab === 'today'
              ? 'bg-blue-100 text-blue-700'
              : 'text-slate-500 hover:text-slate-800'
          }`}>
            <Zap className={`w-4 h-4 ${activeTab === 'today' ? 'fill-blue-700' : ''}`} />
          </div>
          <span className={`text-[10px] font-medium tracking-tight ${
            activeTab === 'today' ? 'text-blue-700 font-bold' : 'text-slate-500'
          }`}>
            Today
          </span>
        </button>

        {/* Tab 2: Program */}
        <button
          onClick={() => handleNav('program')}
          className="flex flex-col items-center gap-0.5 py-1 px-1.5 group transition-transform active:scale-95"
        >
          <div className={`px-3 py-1 rounded-full transition-all flex items-center justify-center ${
            activeTab === 'program'
              ? 'bg-blue-100 text-blue-700'
              : 'text-slate-500 hover:text-slate-800'
          }`}>
            <Calendar className="w-4 h-4" />
          </div>
          <span className={`text-[10px] font-medium tracking-tight ${
            activeTab === 'program' ? 'text-blue-700 font-bold' : 'text-slate-500'
          }`}>
            Program
          </span>
        </button>

        {/* Tab 3: Nutrition */}
        <button
          onClick={() => handleNav('nutrition')}
          className="flex flex-col items-center gap-0.5 py-1 px-1.5 group transition-transform active:scale-95"
        >
          <div className={`px-3 py-1 rounded-full transition-all flex items-center justify-center ${
            activeTab === 'nutrition'
              ? 'bg-blue-100 text-blue-700'
              : 'text-slate-500 hover:text-slate-800'
          }`}>
            <Utensils className="w-4 h-4" />
          </div>
          <span className={`text-[10px] font-medium tracking-tight ${
            activeTab === 'nutrition' ? 'text-blue-700 font-bold' : 'text-slate-500'
          }`}>
            Nutrition
          </span>
        </button>

        {/* Tab 4: AI Coach (Dedicated Screen Next to Nutrition) */}
        <button
          onClick={() => handleNav('coach')}
          className="flex flex-col items-center gap-0.5 py-1 px-1.5 group transition-transform active:scale-95"
        >
          <div className={`px-3 py-1 rounded-full transition-all flex items-center justify-center ${
            activeTab === 'coach'
              ? 'bg-cyan-100 text-cyan-800'
              : 'text-slate-500 hover:text-slate-800'
          }`}>
            <Bot className={`w-4 h-4 ${activeTab === 'coach' ? 'text-cyan-700' : ''}`} />
          </div>
          <span className={`text-[10px] font-medium tracking-tight ${
            activeTab === 'coach' ? 'text-cyan-800 font-bold' : 'text-slate-500'
          }`}>
            AI Coach
          </span>
        </button>

        {/* Tab 5: Memory */}
        <button
          onClick={() => handleNav('memory')}
          className="flex flex-col items-center gap-0.5 py-1 px-1.5 group transition-transform active:scale-95"
        >
          <div className={`px-3 py-1 rounded-full transition-all flex items-center justify-center ${
            activeTab === 'memory'
              ? 'bg-blue-100 text-blue-700'
              : 'text-slate-500 hover:text-slate-800'
          }`}>
            <Brain className="w-4 h-4" />
          </div>
          <span className={`text-[10px] font-medium tracking-tight ${
            activeTab === 'memory' ? 'text-blue-700 font-bold' : 'text-slate-500'
          }`}>
            Memory
          </span>
        </button>

        {/* Tab 6: Profile Wizard */}
        <button
          onClick={() => {
            try {
              if (typeof window !== 'undefined' && 'vibrate' in navigator) {
                navigator.vibrate(15);
              }
            } catch (e) {}
            onOpenProfile();
          }}
          className="flex flex-col items-center gap-0.5 py-1 px-1.5 group transition-transform active:scale-95"
        >
          <div className="px-3 py-1 rounded-full text-slate-500 hover:text-slate-800 transition-all flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-medium text-slate-500 tracking-tight">
            Profile
          </span>
        </button>

      </div>
    </nav>
  );
};
