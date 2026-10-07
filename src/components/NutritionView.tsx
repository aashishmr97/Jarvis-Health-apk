import React, { useState } from 'react';
import { 
  Utensils, 
  Plus, 
  Sparkles, 
  Trash2, 
  ArrowRightLeft, 
  Flame, 
  Check, 
  Search, 
  CheckCircle2, 
  PieChart,
  Camera,
  Layers
} from 'lucide-react';
import { UserProfile, MealLog, MacroTarget, FoodItem, FoodSubstitutionResult, PrescribedMeal } from '../types';
import { NutritionEngine } from '../services/nutritionEngine';
import { StorageService } from '../services/storageService';
import { GeminiService } from '../services/geminiService';
import { PlateScannerModal } from './PlateScannerModal';
import { PrescribedMealPlanChecklist } from './PrescribedMealPlanChecklist';

interface NutritionViewProps {
  profile: UserProfile;
  mealLogs: MealLog[];
  onAddMealLog: (meal: MealLog) => void;
  onDeleteMealLog: (id: string) => void;
}

const SAMPLE_LOG_PROMPTS = [
  '3 idlis, sambar and two eggs',
  '45g rolled oats with 1 scoop whey and banana',
  '3 rotis, yellow dal and home-style chicken curry',
  '200g Greek yogurt with raw almonds and apple'
];

export const NutritionView: React.FC<NutritionViewProps> = ({
  profile,
  mealLogs,
  onAddMealLog,
  onDeleteMealLog
}) => {
  const macroTarget = NutritionEngine.calculateMacroTargets(profile);

  // Totals consumed today
  const consumedCalories = mealLogs.reduce((sum, m) => sum + m.totalCalories, 0);
  const consumedProtein = Math.round(mealLogs.reduce((sum, m) => sum + m.totalProtein, 0) * 10) / 10;
  const consumedCarbs = Math.round(mealLogs.reduce((sum, m) => sum + m.totalCarbs, 0) * 10) / 10;
  const consumedFat = Math.round(mealLogs.reduce((sum, m) => sum + m.totalFat, 0) * 10) / 10;
  const consumedFiber = Math.round(mealLogs.reduce((sum, m) => sum + m.totalFiber, 0) * 10) / 10;

  // Natural Language Input State
  const [naturalQuery, setNaturalQuery] = useState<string>('');
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [parsedPreview, setParsedPreview] = useState<{
    items: FoodItem[];
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    totalFiber: number;
  } | null>(null);

  // Smart Food Substitution Tool State
  const [substituteQuery, setSubstituteQuery] = useState<string>('Paneer');
  const [substituteGoal, setSubstituteGoal] = useState<string>('Higher protein and lower fat');
  const [subResults, setSubResults] = useState<FoodSubstitutionResult | null>(null);
  const [isFindingSub, setIsFindingSub] = useState<boolean>(false);

  // Plate Scanner Modal State
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);

  // Handle parsing natural language food log
  const handleParseNaturalLog = async (queryText?: string) => {
    const q = queryText || naturalQuery;
    if (!q.trim()) return;

    setIsParsing(true);
    try {
      const parsed = await GeminiService.parseNaturalFoodLog(q);
      setParsedPreview(parsed);
    } catch (e) {
      console.error('Failed to parse food text', e);
    } finally {
      setIsParsing(false);
    }
  };

  // Confirm and save meal
  const handleConfirmSaveMeal = () => {
    if (!parsedPreview) return;

    const newMeal: MealLog = {
      id: `meal_${Date.now()}`,
      mealType: selectedMealType,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      rawInput: naturalQuery,
      items: parsedPreview.items,
      totalCalories: parsedPreview.totalCalories,
      totalProtein: parsedPreview.totalProtein,
      totalCarbs: parsedPreview.totalCarbs,
      totalFat: parsedPreview.totalFat,
      totalFiber: parsedPreview.totalFiber
    };

    onAddMealLog(newMeal);
    setParsedPreview(null);
    setNaturalQuery('');
  };

  // Run food substitution search
  const handleFindSubstitutions = async () => {
    if (!substituteQuery.trim()) return;
    setIsFindingSub(true);
    try {
      const res = await GeminiService.getFoodSubstitution(substituteQuery, substituteGoal, profile.dietaryPattern);
      setSubResults(res);
    } catch (e) {
      console.error('Food substitution search failed', e);
    } finally {
      setIsFindingSub(false);
    }
  };

  // Ticking off prescribed meal
  const handleTogglePrescribedMeal = (m: PrescribedMeal) => {
    if (m.isCompleted) {
      const log: MealLog = {
        id: `prescribed_${m.id}_${Date.now()}`,
        mealType: m.mealType,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        rawInput: `Prescribed: ${m.name}`,
        items: [{
          id: `item_p_${m.id}`,
          name: m.name,
          quantity: 1,
          unit: m.portion,
          calories: m.calories,
          protein: m.protein,
          carbs: m.carbs,
          fat: m.fat,
          fiber: 4,
          verified: true
        }],
        totalCalories: m.calories,
        totalProtein: m.protein,
        totalCarbs: m.carbs,
        totalFat: m.fat,
        totalFiber: 4
      };
      onAddMealLog(log);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-32 md:pb-12">
      
      {/* =========================================================================
          DAILY MACRO HUD & ENERGY BALANCE
         ========================================================================= */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-hud font-bold text-xs uppercase tracking-wider text-blue-700">
                METABOLIC ENGINE
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500 font-mono capitalize">
                Dietary Pattern: {profile.dietaryPattern} ({profile.cuisinePreference})
              </span>
            </div>
            <h2 className="font-hud font-bold text-2xl text-slate-900 mt-1">Daily Macro & Energy Targets</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsScannerOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <Camera className="w-4 h-4" />
              <span>Photograph Plate</span>
            </button>
          </div>
        </div>

        {/* Progress Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {/* Calories */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Calories</span>
            <div className="flex items-baseline gap-1">
              <strong className="font-hud text-2xl text-slate-900">{consumedCalories}</strong>
              <span className="text-xs text-slate-500 font-mono">/ {macroTarget.calories}</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-blue-600 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (consumedCalories / macroTarget.calories) * 100)}%` }}
              />
            </div>
          </div>

          {/* Protein */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-mono uppercase text-blue-600 font-bold block mb-1">Protein</span>
            <div className="flex items-baseline gap-1">
              <strong className="font-hud text-2xl text-blue-700">{consumedProtein}g</strong>
              <span className="text-xs text-slate-500 font-mono">/ {macroTarget.proteinGrams}g</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-blue-600 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (consumedProtein / macroTarget.proteinGrams) * 100)}%` }}
              />
            </div>
          </div>

          {/* Carbs */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-mono uppercase text-amber-600 font-bold block mb-1">Carbohydrates</span>
            <div className="flex items-baseline gap-1">
              <strong className="font-hud text-2xl text-amber-700">{consumedCarbs}g</strong>
              <span className="text-xs text-slate-500 font-mono">/ {macroTarget.carbsGrams}g</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-amber-500 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (consumedCarbs / macroTarget.carbsGrams) * 100)}%` }}
              />
            </div>
          </div>

          {/* Fats */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-mono uppercase text-rose-600 font-bold block mb-1">Fats</span>
            <div className="flex items-baseline gap-1">
              <strong className="font-hud text-2xl text-rose-700">{consumedFat}g</strong>
              <span className="text-xs text-slate-500 font-mono">/ {macroTarget.fatGrams}g</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-rose-500 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (consumedFat / macroTarget.fatGrams) * 100)}%` }}
              />
            </div>
          </div>

          {/* Fiber */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-mono uppercase text-emerald-600 font-bold block mb-1">Dietary Fiber</span>
            <div className="flex items-baseline gap-1">
              <strong className="font-hud text-2xl text-emerald-700">{consumedFiber}g</strong>
              <span className="text-xs text-slate-500 font-mono">/ {macroTarget.fiberGrams}g</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (consumedFiber / macroTarget.fiberGrams) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          PEAKD PRESCRIBED MEAL PLAN CHECKLIST (TICK OFF AS YOU EAT)
         ========================================================================= */}
      <PrescribedMealPlanChecklist
        profile={profile}
        onToggleMeal={handleTogglePrescribedMeal}
        onSwapMeal={(meal) => {
          setSubstituteQuery(meal.name.split(' ')[0]);
          handleFindSubstitutions();
        }}
      />

      {/* =========================================================================
          NATURAL LANGUAGE FOOD LOGGING ENGINE
         ========================================================================= */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="font-hud font-bold text-lg text-slate-900">Natural-Language Food Logging</h3>
            <p className="text-xs text-slate-500">
              Speak or type what you ate. Global, Indian (South/North), and household portions supported.
            </p>
          </div>
        </div>

        {/* Input Bar */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder='e.g., "3 idlis, sambar and two eggs" or "Grilled chicken with 1 cup brown rice"'
                value={naturalQuery}
                onChange={e => setNaturalQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleParseNaturalLog()}
                className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-300 font-sans text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
              />
              <button
                type="button"
                onClick={() => handleParseNaturalLog()}
                disabled={isParsing || !naturalQuery.trim()}
                className="absolute right-2 top-2 p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 transition-colors"
                title="Parse Log"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>

            <select
              value={selectedMealType}
              onChange={e => setSelectedMealType(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
          </div>

          {/* Quick Example Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-[11px] text-slate-400 font-mono shrink-0">Try:</span>
            {SAMPLE_LOG_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setNaturalQuery(prompt);
                  handleParseNaturalLog(prompt);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 text-slate-600 hover:text-blue-700 whitespace-nowrap transition-colors text-[11px]"
              >
                "{prompt}"
              </button>
            ))}
          </div>
        </div>

        {/* Parsed Output Preview & Confirmation */}
        {parsedPreview && (
          <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200/80 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-blue-100 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                Parsed Structured Nutrition
              </span>
              <span className="text-xs font-mono font-bold text-blue-900">
                Total: {parsedPreview.totalCalories} kcal (P: {parsedPreview.totalProtein}g · C: {parsedPreview.totalCarbs}g · F: {parsedPreview.totalFat}g)
              </span>
            </div>

            <div className="divide-y divide-blue-100/60 text-xs">
              {parsedPreview.items.map((item, idx) => (
                <div key={idx} className="py-2 flex items-center justify-between">
                  <div>
                    <strong className="text-slate-900">{item.quantity} {item.unit} {item.name}</strong>
                    {item.verified && (
                      <span className="ml-2 text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="font-mono text-slate-600">
                    {item.calories} kcal · {item.protein}g P · {item.carbs}g C · {item.fat}g F
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setParsedPreview(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200/50 transition-colors"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={handleConfirmSaveMeal}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>Confirm & Save to {selectedMealType.toUpperCase()}</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* =========================================================================
          SMART FOOD SUBSTITUTION ENGINE
         ========================================================================= */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <ArrowRightLeft className="w-5 h-5 text-indigo-600" />
          <div>
            <h3 className="font-hud font-bold text-lg text-slate-900">Intelligent Food Substitution</h3>
            <p className="text-xs text-slate-500">
              Replace foods while preserving culinary match, protein density, or calorie limits.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
              Food to Replace
            </label>
            <input
              type="text"
              value={substituteQuery}
              onChange={e => setSubstituteQuery(e.target.value)}
              placeholder="e.g. Paneer, White Rice, Whole Eggs"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
              Optimization Goal
            </label>
            <input
              type="text"
              value={substituteGoal}
              onChange={e => setSubstituteGoal(e.target.value)}
              placeholder="e.g. Higher protein, Lower fat"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleFindSubstitutions}
              disabled={isFindingSub}
              className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              {isFindingSub ? 'Analyzing Biomechanics...' : 'Find Smart Substitutes'}
            </button>
          </div>
        </div>

        {subResults && (
          <div className="p-4 rounded-xl bg-indigo-50/40 border border-indigo-100 space-y-3 animate-in fade-in">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 block">
              Alternatives for "{subResults.originalFood}"
            </span>

            <div className="grid md:grid-cols-2 gap-3">
              {subResults.substitutions.map((sub, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-white border border-indigo-200/70 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <strong className="text-sm text-slate-900">{sub.name}</strong>
                    <span className="text-xs font-mono font-bold text-indigo-700">{sub.calories} kcal</span>
                  </div>
                  <div className="text-xs font-mono text-slate-600">
                    Portion: {sub.portion} · {sub.protein}g Protein · {sub.carbs}g Carbs · {sub.fat}g Fat
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2 rounded-lg">
                    {sub.why}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          TODAY'S LOGGED MEALS
         ========================================================================= */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-hud font-bold text-lg text-slate-900">Today's Meal Timeline</h3>
          <span className="text-xs font-mono text-slate-500">{mealLogs.length} Meals Recorded</span>
        </div>

        {mealLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No meals logged today yet. Use the camera button or natural-language bar above!
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {mealLogs.map(meal => (
              <div key={meal.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase font-hud text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {meal.mealType}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{meal.time}</span>
                  </div>
                  <div className="text-sm font-medium text-slate-800 mt-1">
                    {meal.items.map(i => `${i.quantity} ${i.unit} ${i.name}`).join(' · ')}
                  </div>
                  <div className="text-xs font-mono text-slate-500 mt-0.5">
                    {meal.totalCalories} kcal · {meal.totalProtein}g Protein · {meal.totalCarbs}g Carbs · {meal.totalFat}g Fat
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onDeleteMealLog(meal.id)}
                  className="self-start sm:self-center p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Delete meal"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Plate Scanner Modal */}
      {isScannerOpen && (
        <PlateScannerModal
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onLogScannedMeal={onAddMealLog}
        />
      )}

    </div>
  );
};
