import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Mic, 
  MicOff,
  Volume2, 
  ArrowRight, 
  Dumbbell, 
  Utensils, 
  Zap, 
  Radio, 
  Check, 
  PlusCircle,
  Cpu
} from 'lucide-react';
import { UserProfile, WorkoutSession, ReadinessState, CoachMessage } from '../types';
import { VoiceCoachService } from '../services/voiceCoachService';

interface AICoachChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  todayWorkout: WorkoutSession;
  readiness: ReadinessState;
  onApplyGeneratedWorkout?: (newWorkout: any) => void;
  onApplyGeneratedDiet?: (newDiet: any) => void;
  onSelectAction?: (actionCode: string) => void;
}

export const AICoachChatModal: React.FC<AICoachChatModalProps> = ({
  isOpen,
  onClose,
  profile,
  todayWorkout,
  readiness,
  onApplyGeneratedWorkout,
  onApplyGeneratedDiet,
  onSelectAction
}) => {
  if (!isOpen) return null;

  const [activeMode, setActiveMode] = useState<'chat' | 'workout_gen' | 'diet_gen' | 'live_voice'>('chat');

  // Messages Thread
  const [messages, setMessages] = useState<CoachMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'coach',
      text: `Greetings, ${profile.name}. I am JARVIS, your AI personal trainer and sports scientist. I am monitoring your telemetry (${readiness.score}/100 readiness, ${profile.streakDays}-day streak). I can generate customized periodized workout plans, craft comprehensive 7-day diet charts, swap exercises, and converse with you live via Gemini Live API. How can I coach you today?`,
      timestamp: 'Just now',
      suggestedActions: [
        { label: '🏋️ Generate 4-Week Custom Plan', action: 'gen_plan' },
        { label: '🥗 Create Personalized Diet Chart', action: 'gen_diet' },
        { label: '🎙️ Start Gemini Live Voice', action: 'live_voice' },
        { label: 'Switch to Lite Mode (30m)', action: 'set_lite_mode' }
      ]
    }
  ]);

  const [inputText, setInputText] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Live Voice Mode State (gemini-3.8-live)
  const [isLiveListening, setIsLiveListening] = useState<boolean>(false);
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [liveResponse, setLiveResponse] = useState<string>('Press Start to speak with JARVIS Live.');

  // Generated Plan & Diet Preview states
  const [generatedPlan, setGeneratedPlan] = useState<any | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState<boolean>(false);
  const [planFocus, setPlanFocus] = useState<string>('Hypertrophy & progressive overload');

  const [generatedDiet, setGeneratedDiet] = useState<any | null>(null);
  const [isGeneratingDiet, setIsGeneratingDiet] = useState<boolean>(false);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeMode]);

  // Handle Multi-Turn Chat (gemini-3.5-flash / gemini-3.1-pro-preview / gemini-3.1-flash-lite)
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isSending) return;

    const userMsg: CoachMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInputText('');
    setIsSending(true);

    try {
      const isComplex = text.toLowerCase().includes('plan') || text.toLowerCase().includes('diet') || text.toLowerCase().includes('routine');
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          history: updatedHistory,
          taskComplexity: isComplex ? 'complex' : 'general',
          profile,
          todayWorkout,
          readiness
        })
      });

      if (res.ok) {
        const data = await res.json();
        const coachMsg: CoachMessage = {
          id: `msg_coach_${Date.now()}`,
          sender: 'coach',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedActions: [
            { label: 'Apply adjustments', action: 'apply' },
            { label: 'Generate Diet Chart', action: 'gen_diet' }
          ]
        };
        setMessages([...updatedHistory, coachMsg]);
        VoiceCoachService.speak(data.reply);
      } else {
        throw new Error('API failure');
      }
    } catch (e) {
      const coachMsg: CoachMessage = {
        id: `msg_coach_${Date.now()}`,
        sender: 'coach',
        text: `Understood. Given your goal of ${profile.goal} and today's readiness of ${readiness.score}/100, execute planned loads with an RIR of 1-2. Let's make every set count.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...updatedHistory, coachMsg]);
    } finally {
      setIsSending(false);
    }
  };

  // Generate 4-Week Custom Workout Plan (gemini-3.1-pro-preview)
  const handleGenerateWorkoutPlan = async () => {
    setIsGeneratingPlan(true);
    try {
      const res = await fetch('/api/gemini/generate-workout-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          specificFocus: planFocus,
          numWeeks: 4,
          splitType: profile.daysPerWeek === 3 ? 'Full Body' : 'Upper / Lower'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedPlan(data);
      }
    } catch (e) {
      console.error('Plan generation failed', e);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  // Generate 7-Day Diet Chart (gemini-3.1-pro-preview)
  const handleGenerateDietChart = async () => {
    setIsGeneratingDiet(true);
    try {
      const res = await fetch('/api/gemini/generate-diet-chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          macroTarget: {
            calories: Math.round(profile.weight * 32),
            proteinGrams: Math.round(profile.weight * 2.1),
            carbsGrams: Math.round(profile.weight * 3.5),
            fatGrams: Math.round(profile.weight * 0.8)
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedDiet(data);
      }
    } catch (e) {
      console.error('Diet generation failed', e);
    } finally {
      setIsGeneratingDiet(false);
    }
  };

  // Handle Gemini Live Voice Conversation (gemini-3.8-live)
  const toggleLiveVoice = () => {
    if (isLiveListening) {
      VoiceCoachService.stopListening();
      setIsLiveListening(false);
    } else {
      setIsLiveListening(true);
      setLiveTranscript('Listening... Speak to JARVIS');

      VoiceCoachService.startListening(
        async (transcript) => {
          setLiveTranscript(transcript);
          try {
            const res = await fetch('/api/gemini/live-voice', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                transcript,
                profile,
                currentContext: `Workout ${todayWorkout.title}, Readiness ${readiness.score}/100`
              })
            });

            if (res.ok) {
              const data = await res.json();
              setLiveResponse(data.spokenResponse);
              VoiceCoachService.speak(data.spokenResponse);
            }
          } catch (e) {
            setLiveResponse("JARVIS: Received. Form and breathing locked in.");
          } finally {
            setIsLiveListening(false);
          }
        },
        () => setIsLiveListening(false)
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden h-[90vh] flex flex-col text-slate-900">
        
        {/* Top Header */}
        <div className="px-6 py-3.5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-hud font-bold text-base text-slate-900">JARVIS Personal Trainer</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center gap-1">
                  <Cpu className="w-2.5 h-2.5" />
                  Gemini Integrated
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                Multi-Turn Chat · gemini-3.1-pro-preview · gemini-3.5-flash · gemini-3.8-live
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feature Mode Selector Bar */}
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-200/80 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
          <button
            onClick={() => setActiveMode('chat')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeMode === 'chat'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-white border border-transparent hover:border-slate-200'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Coaching Chat</span>
          </button>

          <button
            onClick={() => {
              setActiveMode('workout_gen');
              if (!generatedPlan) handleGenerateWorkoutPlan();
            }}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeMode === 'workout_gen'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-white border border-transparent hover:border-slate-200'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span>Workout Plan Generator (Pro)</span>
          </button>

          <button
            onClick={() => {
              setActiveMode('diet_gen');
              if (!generatedDiet) handleGenerateDietChart();
            }}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeMode === 'diet_gen'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-white border border-transparent hover:border-slate-200'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Diet Chart Generator (Pro)</span>
          </button>

          <button
            onClick={() => setActiveMode('live_voice')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeMode === 'live_voice'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Gemini Live Voice</span>
          </button>
        </div>

        {/* =========================================================================
            MODE 1: MULTI-TURN CHAT INTERFACE
           ========================================================================= */}
        {activeMode === 'chat' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 bg-slate-50/50">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-none shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-2xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono mt-1 px-1">
                    {msg.timestamp}
                  </span>

                  {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {msg.suggestedActions.map((act, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            if (act.action === 'gen_plan') {
                              setActiveMode('workout_gen');
                              handleGenerateWorkoutPlan();
                            } else if (act.action === 'gen_diet') {
                              setActiveMode('diet_gen');
                              handleGenerateDietChart();
                            } else if (act.action === 'live_voice') {
                              setActiveMode('live_voice');
                            } else if (onSelectAction) {
                              onSelectAction(act.action);
                            }
                            handleSendMessage(act.label);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-medium transition-colors flex items-center gap-1"
                        >
                          <span>{act.label}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div ref={chatBottomRef} />
            </div>

            <div className="p-3.5 border-t border-slate-100 bg-white">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ask your personal trainer anything: workout plan, diet chart, form tips..."
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={!inputText.trim() || isSending}
                  className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-40 shadow-xs"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MODE 2: COMPLEX WORKOUT PLAN GENERATOR (gemini-3.1-pro-preview)
           ========================================================================= */}
        {activeMode === 'workout_gen' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-blue-700 font-bold">
                  gemini-3.1-pro-preview
                </span>
                <h4 className="font-hud font-bold text-lg text-slate-900">
                  Custom Periodized Workout Generator
                </h4>
              </div>

              <button
                onClick={handleGenerateWorkoutPlan}
                disabled={isGeneratingPlan}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
              >
                {isGeneratingPlan ? 'Generating with Pro Model...' : 'Regenerate Plan'}
              </button>
            </div>

            {isGeneratingPlan ? (
              <div className="p-12 text-center space-y-3">
                <Sparkles className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                <p className="text-sm font-semibold text-slate-800">
                  Gemini 3.1 Pro is synthesizing your periodized programming...
                </p>
                <p className="text-xs text-slate-500 font-mono">
                  Calculating volume load, joint safety constraints, and progressive overload...
                </p>
              </div>
            ) : generatedPlan ? (
              <div className="space-y-4 animate-in fade-in">
                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/80">
                  <h5 className="font-hud font-bold text-base text-blue-900">{generatedPlan.planTitle}</h5>
                  <p className="text-xs text-slate-700 mt-1">{generatedPlan.summary}</p>
                  <span className="text-[11px] font-mono text-blue-700 font-bold block mt-1">
                    Split Architecture: {generatedPlan.splitType}
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  {generatedPlan.days?.map((d: any, idx: number) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <strong className="text-xs font-bold text-slate-900">{d.day}: {d.name}</strong>
                        <span className="text-[10px] font-mono text-blue-700 px-1.5 py-0.2 rounded bg-blue-50 font-bold">
                          {d.focus}
                        </span>
                      </div>
                      <ul className="text-xs text-slate-600 space-y-1 pt-1">
                        {d.exercises?.map((ex: string, i: number) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <span className="text-blue-500 font-bold">•</span>
                            <span>{ex}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      if (onApplyGeneratedWorkout) onApplyGeneratedWorkout(generatedPlan);
                      alert('Custom workout program applied to your schedule!');
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    <span>Apply This Program to My 7-Day Schedule</span>
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* =========================================================================
            MODE 3: COMPLEX DIET CHART GENERATOR (gemini-3.1-pro-preview)
           ========================================================================= */}
        {activeMode === 'diet_gen' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-blue-700 font-bold">
                  gemini-3.1-pro-preview
                </span>
                <h4 className="font-hud font-bold text-lg text-slate-900">
                  Personalized 7-Day Diet Chart Generator
                </h4>
              </div>

              <button
                onClick={handleGenerateDietChart}
                disabled={isGeneratingDiet}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
              >
                {isGeneratingDiet ? 'Synthesizing with Pro...' : 'Regenerate Diet Chart'}
              </button>
            </div>

            {isGeneratingDiet ? (
              <div className="p-12 text-center space-y-3">
                <Sparkles className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                <p className="text-sm font-semibold text-slate-800">
                  Gemini 3.1 Pro is calculating exact portion grams and micronutrients...
                </p>
                <p className="text-xs text-slate-500 font-mono">
                  Filtering for {profile.dietaryPattern} ({profile.cuisinePreference}) without allergies...
                </p>
              </div>
            ) : generatedDiet ? (
              <div className="space-y-4 animate-in fade-in">
                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
                  <h5 className="font-hud font-bold text-base text-emerald-900">{generatedDiet.chartTitle}</h5>
                  <div className="flex items-center gap-4 text-xs font-mono text-emerald-800 font-semibold mt-1">
                    <span>Target: {generatedDiet.dailyCalorieTarget} kcal</span>
                    <span>·</span>
                    <span>Macros: {generatedDiet.macroSplit}</span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                    Daily Meal Protocol
                  </span>
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                    {generatedDiet.mealPlan?.map((m: any, idx: number) => (
                      <div key={idx} className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-50">
                        <div>
                          <strong className="text-slate-900 block font-bold">{m.meal}: {m.item}</strong>
                        </div>
                        <div className="font-mono text-slate-600 text-right shrink-0">
                          <strong>{m.calories} kcal</strong> · {m.protein}g P · {m.carbs}g C · {m.fat}g F
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {generatedDiet.groceryList && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                    <strong className="text-slate-900 block font-bold">Recommended Grocery List:</strong>
                    <div className="flex flex-wrap gap-1.5">
                      {generatedDiet.groceryList.map((item: string, i: number) => (
                        <span key={i} className="px-2.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-medium">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}

        {/* =========================================================================
            MODE 4: GEMINI LIVE VOICE CONVERSATION (gemini-3.8-live)
           ========================================================================= */}
        {activeMode === 'live_voice' && (
          <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-6 bg-gradient-to-b from-slate-50 to-white">
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase text-rose-600 font-bold px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200">
                Model: gemini-3.8-live (Live API)
              </span>
              <h4 className="font-hud font-bold text-2xl text-slate-900">
                Live Voice Conversation with JARVIS
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Speak directly to your trainer in real time. Get instant spoken feedback on technique, load autoregulation, or rest timing.
              </p>
            </div>

            {/* Pulsing Mic Visualizer */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              {isLiveListening && (
                <>
                  <div className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping" />
                  <div className="absolute inset-3 rounded-full bg-rose-500/30 animate-pulse" />
                </>
              )}
              <button
                type="button"
                onClick={toggleLiveVoice}
                className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
                  isLiveListening
                    ? 'bg-rose-600 text-white ring-8 ring-rose-200'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isLiveListening ? <Mic className="w-10 h-10 animate-bounce" /> : <Mic className="w-10 h-10" />}
              </button>
            </div>

            <div className="space-y-2 max-w-md">
              <div className="text-xs font-mono text-slate-500">
                {liveTranscript || 'Tap microphone to speak'}
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 leading-relaxed shadow-2xs">
                <Volume2 className="w-4 h-4 text-blue-600 inline mr-1.5" />
                {liveResponse}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
