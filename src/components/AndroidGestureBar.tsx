import React from 'react';

export const AndroidGestureBar: React.FC = () => {
  return (
    <div className="w-full h-5 bg-white flex items-center justify-center select-none shrink-0 z-30">
      <div className="w-32 h-1 rounded-full bg-slate-400/80 active:bg-slate-700 transition-colors" />
    </div>
  );
};
