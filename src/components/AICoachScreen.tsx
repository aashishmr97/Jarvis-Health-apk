import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Mic, 
  MicOff, 
  Volume2, 
  Dumbbell, 
  Utensils, 
  Zap, 
  Check, 
  RefreshCw,
  Cpu,
  Layers,
  Heart,
  Activity
} from 'lucide-react';
import { UserProfile, WorkoutSession, ReadinessState, CoachMessage } from '../types';
import { VoiceCoachService } from '../services/voiceCoachService';

interface AICoachScreenProps {
  profile: UserProfile;
  todayWorkout: WorkoutSession;
  readiness: ReadinessState;
  onApplyGeneratedWorkout?: (newWorkout: any) => void;
  onApplyGeneratedDiet?: (newDiet: any) => void;
  onSelectAction?: (actionCode: string) => void;
}

export const AICoachScreen: React.FC<AICoachScreenProps> = ({
  profile,
  todayWorkout,
  readiness,
  onApplyGeneratedWorkout,
  onApplyGeneratedDiet,
  onSelectAction,
}) => {
  const [activeTab, setActiveTab] = useState<'conversation' | 'workout_gen' | 'diet_gen'>('conversation');
  const [messages, setMessages] = useState<CoachMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'coach',
      text: `Hello ${profile.name}. I am JARVIS, your dedicated personal trainer and nutritional scientist. All your bio-telemetry (Readiness ${readiness.score}/100, ${profile.weight}kg, ${profile.streakDays}-day streak) is synchronized in real time. Ask me to formulate a progressive overload workout plan, generate a precision macro diet chart, or advise on today's execution.`,
      timestamp: 'Active Now',
      suggestedActions: [
        { label: '🏋️ Build 4-Week Hypertrophy Split', action: 'gen_plan' },
        { label: '🥗 Create Macro Diet Chart (Indian & Western)', action: 'gen_diet' },
        { label: '🔄 Suggest Knee-Safe Substitutions', action: 'open_substitution' },
        { label: '⚡ Set Today to Lite Mode (30m)', action: 'set_lite_mode' },
      ],
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);

  // Quick Plan Generator form state
  const [planDays, setPlanDays] = useState<number>(profile.daysPerWeek || 4);
  const [planFocus, setPlanFocus] = useState<string>('Muscle Hypertrophy & Density');
  const [planExperience, setPlanExperience] = useState<string>(profile.experience || 'intermediate');
  const [dietCalories, setDietCalories] = useState<number>(Math.round(profile.weight * 28 + 300));
  const [dietCuisine, setDietCuisine] = useState<string>(profile.cuisinePreference || 'indian');
  const [dietPattern, setDietPattern] = useState<string>(profile.dietaryPattern || 'vegetarian');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  // Voice recognition toggle
  const toggleListening = () => {
    if (isListening) {
      VoiceCoachService.stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      VoiceCoachService.startListening(
        (transcript) => {
          setInputPrompt(transcript);
          setIsListening(false);
          handleSendMessage(transcript);
        },
        () => setIsListening(false)
      );
    }
  };

  // Send message to Gemini /api/gemini/coach
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputPrompt).trim();
    if (!text || isStreaming) return;

    const userMsg: CoachMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsStreaming(true);

    try {
      const response = await fetch('/api/gemini/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          userProfile: profile,
          readinessState: readiness,
          currentWorkout: todayWorkout,
          conversationHistory: messages.map((m) => ({ role: m.sender, content: m.text })),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const replyText = data.reply || "I've analyzed your telemetry and calibrated today's training directives.";
        
        const coachMsg: CoachMessage = {
          id: `msg_coach_${Date.now()}`,
          sender: 'coach',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedActions: data.actions || [
            { label: 'Apply Progression to Program', action: 'gen_plan' },
            { label: 'Recalculate Macros', action: 'gen_diet' },
          ],
        };

        setMessages((prev) => [...prev, coachMsg]);

        if (voiceEnabled) {
          VoiceCoachService.speak(replyText.slice(0, 180));
        }
      } else {
        throw new Error('API request failed');
      }
    } catch {
      // Heuristic fallback response
      let fallbackText = `I hear you regarding "${text}". Based on your ${profile.goal} objective, current bodyweight (${profile.weight}kg), and bio-readiness score (${readiness.score}/100), here is my coaching recommendation:\n\n1. Maintain progressive overload on compound lifts by +2.5kg once target sets are completed at RPE ≤ 8.\n2. Ensure protein intake reaches ${Math.round(profile.weight * 2.1)}g today with adequate electrolyte hydration.\n3. Keep eccentric tempo controlled (3s down) to maximize mechanical tension.`;
      
      const coachMsg: CoachMessage = {
        id: `msg_coach_${Date.now()}`,
        sender: 'coach',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, coachMsg]);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleActionClick = (actionCode: string) => {
    if (actionCode === 'gen_plan') {
      setActiveTab('workout_gen');
    } else if (actionCode === 'gen_diet') {
      setActiveTab('diet_gen');
    } else if (onSelectAction) {
      onSelectAction(actionCode);
    }
  };

  // Generate Workout Split
  const handleGeneratePlan = async () => {
    setIsStreaming(true);
    const prompt = `Generate a rigorous ${planDays}-day ${planFocus} training program for an ${planExperience} lifter weighing ${profile.weight}kg.`;
    setActiveTab('conversation');
    await handleSendMessage(prompt);
  };

  // Generate Diet Chart
  const handleGenerateDiet = async () => {
    setIsStreaming(true);
    const prompt = `Create a complete ${dietCalories} kcal ${dietPattern} diet chart focused on ${dietCuisine} cuisine with ${Math.round(profile.weight * 2.0)}g protein for ${profile.goal}.`;
    setActiveTab('conversation');
    await handleSendMessage(prompt);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col h-[calc(100vh-5rem)] max-h-[880px] pb-24 md:pb-8">
      {/* Header bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white flex items-center justify-center shadow-md shadow-cyan-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-hud font-bold text-slate-900 text-lg">JARVIS AI Personal Trainer</h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-800 text-[10px] font-mono font-bold border border-cyan-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> GEMINI NEURAL MATRIX
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Adaptive Training Plans · Diet Charts · Biomechanical Voice Coach</p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('conversation')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'conversation'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Chat Stream
          </button>
          <button
            onClick={() => setActiveTab('workout_gen')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'workout_gen'
                ? 'bg-white text-blue-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Workout Architect
          </button>
          <button
            onClick={() => setActiveTab('diet_gen')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'diet_gen'
                ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Diet Engine
          </button>
        </div>
      </div>

      {/* Main Content Pane */}
      {activeTab === 'conversation' ? (
        <div className="flex-1 flex flex-col bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
          {/* Chat Messages Stream */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-2xl ${
                  msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-slate-800'
                      : 'bg-gradient-to-tr from-cyan-600 to-blue-600'
                  }`}
                >
                  {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div className="space-y-2">
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-none whitespace-pre-line'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Action suggestions pills */}
                  {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.suggestedActions.map((action, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleActionClick(action.action)}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 text-xs font-semibold transition-colors flex items-center gap-1 active:scale-95"
                        >
                          <Sparkles className="w-3 h-3 text-blue-500" />
                          <span>{action.label}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="text-[10px] text-slate-400 font-mono block">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isStreaming && (
              <div className="flex gap-3 max-w-2xl">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-slate-500 text-xs flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  <span>JARVIS is calibrating biomechanical directives...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Input Bar */}
          <div className="p-3 bg-slate-50/80 border-t border-slate-200/80 flex items-center gap-2">
            <button
              onClick={toggleListening}
              className={`p-2.5 rounded-xl border transition-all ${
                isListening
                  ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
              title="Speak naturally to JARVIS"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setVoiceEnabled((v) => !v)}
              className={`p-2.5 rounded-xl border transition-all ${
                voiceEnabled
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-white text-slate-400 border-slate-200'
              }`}
              title="Voice coach audio synthesis toggle"
            >
              <Volume2 className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              placeholder="Ask JARVIS anything: workout adjustments, meal replacement, form cues..."
              className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={!inputPrompt.trim() || isStreaming}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
        </div>
      ) : activeTab === 'workout_gen' ? (
        /* Workout Split Architect Panel */
        <div className="flex-1 bg-white border border-slate-200/90 rounded-2xl shadow-xs p-6 overflow-y-auto space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <Dumbbell className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="font-hud font-bold text-slate-900 text-lg">AI Workout Plan Generator</h3>
              <p className="text-xs text-slate-500">Formulates a personalized 4-to-8 week progressive overload block</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Frequency (Days / Week)</label>
              <select
                value={planDays}
                onChange={(e) => setPlanDays(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              >
                <option value={3}>3 Days (Full Body / Heavy-Light)</option>
                <option value={4}>4 Days (Upper / Lower Split)</option>
                <option value={5}>5 Days (Push / Pull / Legs + Upper)</option>
                <option value={6}>6 Days (Push / Pull / Legs 2x)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Primary Objective</label>
              <select
                value={planFocus}
                onChange={(e) => setPlanFocus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              >
                <option value="Hypertrophy & Muscle Gain">Hypertrophy & Muscle Gain</option>
                <option value="Maximal Strength & Neuromuscular Power">Maximal Strength & Power</option>
                <option value="Fat Loss & High Metabolic Output">Fat Loss & Conditioning</option>
                <option value="Body Recomposition & Joint Longevity">Recomposition & Mobility</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Lifter Experience Level</label>
              <select
                value={planExperience}
                onChange={(e) => setPlanExperience(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              >
                <option value="beginner">Beginner (Linear Progression)</option>
                <option value="intermediate">Intermediate (Undulating Periodization)</option>
                <option value="advanced">Advanced (Block Overload & RPE Autoregulation)</option>
              </select>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-slate-700">
            <strong>JARVIS Adaptation Note:</strong> The generated program will factor in your active equipment ({profile.equipment?.join(', ') || 'Full Gym'}), known limitations ({profile.limitations?.join(', ') || 'None'}), and current baseline RHR ({profile.baselineRHR} bpm).
          </div>

          <button
            onClick={handleGeneratePlan}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-hud font-bold text-sm shadow-md shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Program Split with Gemini</span>
          </button>
        </div>
      ) : (
        /* Nutrition Diet Chart Panel */
        <div className="flex-1 bg-white border border-slate-200/90 rounded-2xl shadow-xs p-6 overflow-y-auto space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <Utensils className="w-6 h-6 text-emerald-600" />
            <div>
              <h3 className="font-hud font-bold text-slate-900 text-lg">AI Nutrition & Diet Chart Architect</h3>
              <p className="text-xs text-slate-500">Calculates exact meal-by-meal macro breakdowns with cultural food options</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Target Daily Calories</label>
              <input
                type="number"
                value={dietCalories}
                onChange={(e) => setDietCalories(parseInt(e.target.value, 10) || 2000)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Cuisine Style</label>
              <select
                value={dietCuisine}
                onChange={(e) => setDietCuisine(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              >
                <option value="indian">Indian (All-Region Balanced)</option>
                <option value="south_indian">South Indian (Idli, Dosa, Sambhar, Dal)</option>
                <option value="north_indian">North Indian (Paneer, Roti, Dal Makhani)</option>
                <option value="western">Western High-Protein</option>
                <option value="mixed">Mixed International</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Dietary Pattern</label>
              <select
                value={dietPattern}
                onChange={(e) => setDietPattern(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              >
                <option value="vegetarian">Vegetarian (Lacto/Ovo)</option>
                <option value="eggetarian">Eggetarian</option>
                <option value="omnivore">Omnivore (Chicken, Fish, Eggs)</option>
                <option value="vegan">100% Plant-Based Vegan</option>
              </select>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs text-slate-700">
            <strong>Target Macronutrients:</strong> Protein: <strong>{Math.round(profile.weight * 2.0)}g</strong> ({(Math.round(profile.weight * 2.0 * 4 / dietCalories * 100))}% of intake), Carbohydrates: <strong>{Math.round((dietCalories * 0.45) / 4)}g</strong>, Fats: <strong>{Math.round((dietCalories * 0.25) / 9)}g</strong>.
          </div>

          <button
            onClick={handleGenerateDiet}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-hud font-bold text-sm shadow-md shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Full Diet Chart with Gemini</span>
          </button>
        </div>
      )}
    </div>
  );
};
