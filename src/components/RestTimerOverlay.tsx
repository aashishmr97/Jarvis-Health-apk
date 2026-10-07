import React, { useEffect, useState } from 'react';
import { Timer, Plus, Minus, FastForward, Volume2 } from 'lucide-react';
import { VoiceCoachService } from '../services/voiceCoachService';

interface RestTimerOverlayProps {
  initialSeconds: number;
  onFinish: () => void;
  exerciseName: string;
  nextLoad: number;
  nextReps: string;
}

export const RestTimerOverlay: React.FC<RestTimerOverlayProps> = ({
  initialSeconds,
  onFinish,
  exerciseName,
  nextLoad,
  nextReps
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(initialSeconds);
  const [totalSeconds, setTotalSeconds] = useState<number>(initialSeconds);

  useEffect(() => {
    if (secondsRemaining <= 0) {
      VoiceCoachService.playRestBeep(true); // Final tone
      VoiceCoachService.speak(`Rest complete. Set target: ${nextLoad} kilos for ${nextReps} reps.`);
      onFinish();
      return;
    }

    if (secondsRemaining <= 3 && secondsRemaining > 0) {
      VoiceCoachService.playRestBeep(false); // 3-2-1 countdown beep
    }

    const timer = setInterval(() => {
      setSecondsRemaining(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsRemaining, onFinish, nextLoad, nextReps]);

  const addSeconds = (amount: number) => {
    const updated = Math.max(5, secondsRemaining + amount);
    setSecondsRemaining(updated);
    setTotalSeconds(Math.max(totalSeconds, updated));
  };

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const progressPercent = Math.max(0, Math.min(100, ((totalSeconds - secondsRemaining) / totalSeconds) * 100));

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-900 to-indigo-950 text-white shadow-lg border border-blue-700/50 relative overflow-hidden animate-in fade-in duration-200">
      
      {/* Background Pulse Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl -mr-10 -mt-10" />

      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Left Timer Dial */}
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 flex items-center justify-center">
            {/* SVG Progress Circle */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                className="stroke-blue-800"
                strokeWidth="4"
                fill="none"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                className="stroke-cyan-400 transition-all duration-500"
                strokeWidth="4"
                strokeDasharray="175.9"
                strokeDashoffset={175.9 - (175.9 * progressPercent) / 100}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <Timer className="w-6 h-6 text-cyan-300 absolute" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-300 font-bold">
                Recovery Timer
              </span>
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            </div>
            <div className="font-hud font-bold text-3xl tracking-tight text-white">
              {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
            </div>
          </div>
        </div>

        {/* Center Next Up Info */}
        <div className="text-center sm:text-left bg-blue-800/40 px-3.5 py-2 rounded-xl border border-blue-600/30">
          <span className="text-[10px] font-mono uppercase text-blue-200 block">Up Next</span>
          <div className="text-xs font-semibold text-white truncate max-w-[200px]">{exerciseName}</div>
          <div className="text-[11px] text-cyan-300 font-mono">
            Target: <strong>{nextLoad} kg</strong> × <strong>{nextReps} reps</strong>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => addSeconds(-15)}
            className="p-2 rounded-xl bg-blue-800/60 hover:bg-blue-700 text-blue-200 hover:text-white transition-colors border border-blue-700/50 text-xs font-mono"
            title="Reduce 15s"
          >
            <Minus className="w-4 h-4" />
          </button>

          <button
            onClick={() => addSeconds(30)}
            className="px-2.5 py-2 rounded-xl bg-blue-800/60 hover:bg-blue-700 text-blue-200 hover:text-white transition-colors border border-blue-700/50 text-xs font-mono font-medium flex items-center gap-1"
            title="Extend 30s"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>30s</span>
          </button>

          <button
            onClick={onFinish}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-all ml-1"
          >
            <FastForward className="w-3.5 h-3.5 fill-current" />
            <span>Ready Now</span>
          </button>
        </div>

      </div>
    </div>
  );
};
