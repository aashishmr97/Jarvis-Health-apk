import React, { useState } from 'react';
import { 
  Smartphone, 
  Download, 
  Terminal, 
  CheckCircle2, 
  Copy, 
  X, 
  FolderCheck,
  ShieldCheck,
  ExternalLink,
  Layers
} from 'lucide-react';

interface AndroidExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidExportModal: React.FC<AndroidExportModalProps> = ({ isOpen, onClose }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const commands = [
    { title: '1. Connect Device', cmd: 'adb devices' },
    { title: '2. Build Debug APK with Gradle', cmd: 'cd android && ./gradlew assembleDebug' },
    { title: '3. Install via ADB', cmd: 'adb install -r app/build/outputs/apk/debug/app-debug.apk' },
    { title: '4. Launch App on Phone', cmd: 'adb shell am start -n com.jarvis.fitness/.MainActivity' },
    { title: '5. Grant Mic Permission (Optional)', cmd: 'adb shell pm grant com.jarvis.fitness android.permission.RECORD_AUDIO' }
  ];

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-hud font-bold text-lg text-white">Native Android 15 & ADB Export</h2>
              <p className="text-xs text-blue-100 font-medium">Kotlin · Jetpack Compose · Material 3 · Gemini SDK</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          
          {/* Output Path Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
              <FolderCheck className="w-4 h-4 text-emerald-600" />
              <span>Exact Debug APK Output Path:</span>
            </div>
            <code className="block p-2.5 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs select-all">
              android/app/build/outputs/apk/debug/app-debug.apk
            </code>
          </div>

          {/* Download Project Bundle */}
          <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-hud font-bold text-sm text-blue-900">Download Complete Gradle Project Bundle</h3>
              <p className="text-xs text-blue-700">
                Includes Kotlin source files, Compose screens, Gemini service, Gradle wrapper, and AndroidManifest.
              </p>
            </div>
            <a
              href="/JARVIS_Android_Project.tar.gz"
              download="JARVIS_Android_Project.tar.gz"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all shrink-0 active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Download Project (.tar.gz)</span>
            </a>
          </div>

          {/* Step-by-Step ADB Commands */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-hud font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-blue-600" />
                Build & ADB Installation Steps
              </span>
            </div>

            <div className="space-y-2">
              {commands.map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 block mb-0.5">{item.title}</span>
                    <span className="text-emerald-300 font-semibold block truncate select-all">{item.cmd}</span>
                  </div>
                  <button
                    onClick={() => handleCopy(item.cmd, idx)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors shrink-0"
                    title="Copy command"
                  >
                    {copiedIndex === idx ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Android 15 Features Verification */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="text-slate-700 font-medium">Edge-to-Edge UI</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="text-slate-700 font-medium">Gemini AI Client</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="text-slate-700 font-medium">Galaxy Health Hub</span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
