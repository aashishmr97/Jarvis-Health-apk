import React, { useState } from 'react';
import { Mic, MicOff, Volume2, Sparkles, AlertCircle } from 'lucide-react';
import { VoiceCoachService } from '../services/voiceCoachService';
import { GeminiService } from '../services/geminiService';

interface VoiceCoachControlProps {
  currentExercise: any;
  currentSet: number;
  currentWeight: number;
  onVoiceAction: (actionData: {
    action: string;
    deltaWeight?: number;
    deltaRest?: number;
    painFlag?: boolean;
    painLocation?: string;
    spokenResponse?: string;
  }) => void;
}

const QUICK_COMMANDS = [
  'Done',
  'Too easy (+2.5kg)',
  'Too hard (-2.5kg)',
  'Skip rest',
  'My joint hurts',
  'Replace this'
];

export const VoiceCoachControl: React.FC<VoiceCoachControlProps> = ({
  currentExercise,
  currentSet,
  currentWeight,
  onVoiceAction
}) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [lastTranscript, setLastTranscript] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [lastResponse, setLastResponse] = useState<string>('Voice coach standing by.');

  const handleVoiceInput = async (transcript: string) => {
    setLastTranscript(transcript);
    setIsProcessing(true);

    try {
      const result = await GeminiService.processVoiceCommand({
        transcript,
        currentExercise,
        currentSet,
        currentWeight
      });

      if (result.spokenResponse) {
        setLastResponse(result.spokenResponse);
        VoiceCoachService.speak(result.spokenResponse);
      }

      onVoiceAction(result);
    } catch (e) {
      console.error('Voice handling failed', e);
    } finally {
      setIsProcessing(false);
      setIsListening(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      VoiceCoachService.stopListening();
      setIsListening(false);
    } else {
      const success = VoiceCoachService.startListening(
        (transcript) => {
          handleVoiceInput(transcript);
        },
        (err) => {
          console.warn('Speech recognition error', err);
          setIsListening(false);
        }
      );

      if (success) {
        setIsListening(true);
        setLastTranscript('Listening for command...');
      } else {
        // Speech recognition not permitted in iframe or unsupported: provide informative tip
        setLastTranscript('Mic access restricted in sandbox. Use quick voice command triggers below.');
      }
    }
  };

  return (
    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 text-slate-800">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Mic Activation Button & State */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={toggleListening}
            className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all shadow-sm ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/30 ring-4 ring-rose-100'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
            }`}
            title="Toggle Voice Coaching"
          >
            {isListening ? <Mic className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                JARVIS Voice Interaction
              </span>
              {isListening && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 font-bold">
                  LIVE
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 truncate max-w-[280px]">
              {lastTranscript || lastResponse}
            </p>
          </div>
        </div>

        {/* Quick Voice Triggers */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none">
          {QUICK_COMMANDS.map((cmd, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isProcessing}
              onClick={() => handleVoiceInput(cmd.replace(/\s*\([^)]*\)/, ''))}
              className="px-2.5 py-1 text-[11px] rounded-lg bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 font-medium whitespace-nowrap transition-colors shadow-2xs"
            >
              "{cmd}"
            </button>
          ))}
        </div>

      </div>
    </div>
  );
};
