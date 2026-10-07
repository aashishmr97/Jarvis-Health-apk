import React from 'react';
import { X, Palette, Check, Sparkles, ShieldCheck, Sun } from 'lucide-react';
import { AppThemeId, AppThemeConfig } from '../types';
import { APP_THEMES } from '../services/themeService';

interface ThemeSelectorModalProps {
  currentThemeId: AppThemeId;
  onSelectTheme: (themeId: AppThemeId) => void;
  onClose: () => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({
  currentThemeId,
  onSelectTheme,
  onClose,
}) => {
  const themes = Object.values(APP_THEMES);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
        {/* Futuristic Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 via-white to-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md shadow-slate-900/20">
              <Palette className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-hud font-bold text-slate-900 text-lg">Futuristic Theme Matrix</h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-mono font-bold">
                  <Sun className="w-3 h-3 text-amber-500" /> LIGHT BIO-HUD
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Select your high-precision sports science visual environment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Theme Cards List */}
        <div className="p-5 overflow-y-auto space-y-3">
          {themes.map((theme) => {
            const isSelected = theme.id === currentThemeId;

            return (
              <button
                key={theme.id}
                onClick={() => onSelectTheme(theme.id)}
                className={`w-full p-4 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                  isSelected
                    ? 'border-slate-900 bg-slate-50/80 shadow-md ring-2 ring-slate-900/10'
                    : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/50 shadow-2xs'
                }`}
              >
                {/* Glow accent indicator */}
                <div
                  className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-40 pointer-events-none transition-opacity group-hover:opacity-70"
                  style={{ backgroundColor: theme.primaryHex }}
                />

                <div className="flex items-start justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    {/* Dual Color Swatch Orb */}
                    <div className="relative w-11 h-11 rounded-2xl flex items-center justify-center shadow-xs border border-slate-200/70 overflow-hidden bg-white">
                      <div
                        className="absolute inset-0 opacity-80"
                        style={{
                          background: `linear-gradient(135deg, ${theme.primaryHex} 0%, ${theme.accentHex} 100%)`,
                        }}
                      />
                      {isSelected ? (
                        <Check className="w-5 h-5 text-white relative z-10 drop-shadow-xs" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-white/90 relative z-10" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-hud font-bold text-sm text-slate-900">{theme.name}</h4>
                        {isSelected && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-900 text-white">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">{theme.tagline}</p>
                    </div>
                  </div>

                  {/* Visual Color Chips */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white shadow-2xs"
                      style={{ backgroundColor: theme.primaryHex }}
                      title="Primary Key"
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white shadow-2xs"
                      style={{ backgroundColor: theme.accentHex }}
                      title="Secondary Accent"
                    />
                  </div>
                </div>

                {/* Micro preview strip */}
                <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.primaryHex }} />
                    {theme.primaryHex}
                  </span>
                  <span>Light Futuristic Spec</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Zero Dark Mode · High-Luminance Lab Protocol
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 active:scale-95 transition-all shadow-md"
          >
            Apply Visual Matrix
          </button>
        </div>
      </div>
    </div>
  );
};
