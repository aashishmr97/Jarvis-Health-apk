import { AppThemeId, AppThemeConfig } from '../types';

export const APP_THEMES: Record<AppThemeId, AppThemeConfig> = {
  titanium_cyan: {
    id: 'titanium_cyan',
    name: 'Titanium Hologram',
    tagline: 'JARVIS Biomechanics Lab · Holographic Cyan & Titanium',
    primaryHex: '#0891b2',
    accentHex: '#2563eb',
    bgHex: '#f8fafc',
    glowRgba: 'rgba(8, 145, 178, 0.25)',
    primaryButtonClass: 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-cyan-500/25',
    badgeClass: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    borderClass: 'border-cyan-200/80',
    activeTabClass: 'bg-cyan-600 text-white shadow-cyan-500/20',
    gradientClass: 'from-cyan-50/80 via-blue-50/50 to-indigo-50/80',
  },
  quantum_cobalt: {
    id: 'quantum_cobalt',
    name: 'Stark Quantum',
    tagline: 'High-Precision Sports Science · Royal Cobalt & Alabaster',
    primaryHex: '#2563eb',
    accentHex: '#1d4ed8',
    bgHex: '#f8fafc',
    glowRgba: 'rgba(37, 99, 235, 0.25)',
    primaryButtonClass: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/25',
    badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
    borderClass: 'border-blue-200/80',
    activeTabClass: 'bg-blue-600 text-white shadow-blue-500/20',
    gradientClass: 'from-blue-50/80 via-indigo-50/50 to-slate-50/80',
  },
  emerald_kinetic: {
    id: 'emerald_kinetic',
    name: 'Bio-Kinetic Mint',
    tagline: 'Metabolic & Autonomic Engine · Emerald Cyber-Kinetic',
    primaryHex: '#059669',
    accentHex: '#10b981',
    bgHex: '#f7faf8',
    glowRgba: 'rgba(16, 185, 129, 0.25)',
    primaryButtonClass: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-500/25',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    borderClass: 'border-emerald-200/80',
    activeTabClass: 'bg-emerald-600 text-white shadow-emerald-500/20',
    gradientClass: 'from-emerald-50/80 via-teal-50/50 to-emerald-50/80',
  },
  solar_amber: {
    id: 'solar_amber',
    name: 'Solar Hyper-Core',
    tagline: 'ATP Potentiation · High-Velocity Solar Amber & Gold',
    primaryHex: '#d97706',
    accentHex: '#f59e0b',
    bgHex: '#faf8f5',
    glowRgba: 'rgba(217, 119, 6, 0.25)',
    primaryButtonClass: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-amber-500/25',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    borderClass: 'border-amber-200/80',
    activeTabClass: 'bg-amber-500 text-white shadow-amber-500/20',
    gradientClass: 'from-amber-50/80 via-orange-50/50 to-yellow-50/80',
  },
  neural_violet: {
    id: 'neural_violet',
    name: 'Neural Quantum Cortex',
    tagline: 'Neuromorphic Coaching Matrix · Electric Violet & Pearl',
    primaryHex: '#7c3aed',
    accentHex: '#9333ea',
    bgHex: '#faf8fc',
    glowRgba: 'rgba(124, 58, 237, 0.25)',
    primaryButtonClass: 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white shadow-violet-500/25',
    badgeClass: 'bg-violet-50 text-violet-800 border-violet-200',
    borderClass: 'border-violet-200/80',
    activeTabClass: 'bg-violet-600 text-white shadow-violet-500/20',
    gradientClass: 'from-violet-50/80 via-purple-50/50 to-fuchsia-50/80',
  },
};

const STORAGE_KEY = 'jarvis_app_theme_id';

export class ThemeService {
  static getActiveThemeId(): AppThemeId {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as AppThemeId;
      if (saved && APP_THEMES[saved]) {
        return saved;
      }
    } catch (e) {
      console.warn('Error reading stored theme', e);
    }
    return 'titanium_cyan';
  }

  static getActiveTheme(): AppThemeConfig {
    const id = this.getActiveThemeId();
    return APP_THEMES[id] || APP_THEMES.titanium_cyan;
  }

  static setTheme(themeId: AppThemeId): AppThemeConfig {
    const theme = APP_THEMES[themeId] || APP_THEMES.titanium_cyan;
    try {
      localStorage.setItem(STORAGE_KEY, theme.id);
      this.applyCssVariables(theme);
    } catch (e) {
      console.warn('Error saving theme', e);
    }
    return theme;
  }

  static applyCssVariables(theme: AppThemeConfig): void {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', theme.primaryHex);
    root.style.setProperty('--theme-accent', theme.accentHex);
    root.style.setProperty('--theme-bg', theme.bgHex);
    root.style.setProperty('--theme-glow', theme.glowRgba);
  }
}
