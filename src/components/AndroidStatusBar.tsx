import React, { useEffect, useState } from 'react';
import { Wifi, Signal, BatteryCharging } from 'lucide-react';

interface AndroidStatusBarProps {
  darkIcons?: boolean;
}

export const AndroidStatusBar: React.FC<AndroidStatusBarProps> = ({ darkIcons = true }) => {
  const [currentTime, setCurrentTime] = useState<string>('09:41');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    update();
    const interval = setInterval(update, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`w-full px-6 pt-2.5 pb-1 flex items-center justify-between text-xs select-none z-30 transition-colors ${
      darkIcons ? 'text-slate-800' : 'text-white'
    }`}>
      {/* Left: Android Clock */}
      <div className="font-mono font-bold tracking-tight text-[12px] pl-1">
        {currentTime}
      </div>

      {/* Center: Camera Punch Hole */}
      <div className="w-3.5 h-3.5 rounded-full bg-slate-900 ring-2 ring-slate-800/20 shadow-inner" />

      {/* Right: Android System Telemetry (5G, WiFi, Battery) */}
      <div className="flex items-center gap-2 pr-1 font-mono text-[11px]">
        <span className="font-bold text-[10px] tracking-tighter">5G</span>
        <Signal className="w-3.5 h-3.5" />
        <Wifi className="w-3.5 h-3.5" />
        <div className="flex items-center gap-0.5">
          <span className="text-[10px] font-bold">94%</span>
          <div className="w-4 h-2.5 rounded-[3px] border border-current p-[1px] flex items-center">
            <div className="h-full w-[94%] bg-current rounded-[1px]" />
          </div>
        </div>
      </div>
    </div>
  );
};
