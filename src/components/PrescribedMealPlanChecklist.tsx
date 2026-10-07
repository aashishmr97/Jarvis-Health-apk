import React, { useState } from 'react';
import { CheckSquare, Square, ArrowRightLeft, Sparkles, Check, Utensils } from 'lucide-react';
import { PrescribedMeal, UserProfile } from '../types';

interface PrescribedMealPlanChecklistProps {
  profile: UserProfile;
  onToggleMeal: (meal: PrescribedMeal) => void;
  onSwapMeal: (meal: PrescribedMeal) => void;
}

export const PrescribedMealPlanChecklist: React.FC<PrescribedMealPlanChecklistProps> = ({
  profile,
  onToggleMeal,
  onSwapMeal
}) => {
  const isVeg = profile.dietaryPattern === 'vegetarian' || profile.dietaryPattern === 'vegan';

  const [meals, setMeals] = useState<PrescribedMeal[]>([
    {
      id: 'plan_1',
      mealType: 'breakfast',
      name: 'Rolled Oats with Scoop of Whey & Sliced Banana',
      portion: '45g oats + 1 scoop whey + 1 banana',
      calories: 395,
      protein: 32,
      carbs: 58,
      fat: 4,
      isCompleted: true
    },
    {
      id: 'plan_2',
      mealType: 'lunch',
      name: isVeg ? '3 Whole Wheat Rotis, Dal Tadka & Low-Fat Paneer' : 'Grilled Chicken Breast, 1 Cup Basmati Rice & Broccoli',
      portion: isVeg ? '3 rotis + 1 bowl dal + 80g paneer' : '160g chicken + 150g rice + 80g broccoli',
      calories: 520,
      protein: 48,
      carbs: 56,
      fat: 11,
      isCompleted: false
    },
    {
      id: 'plan_3',
      mealType: 'snack',
      name: 'Plain Greek Yogurt (0% Fat) with Handful of Raw Almonds',
      portion: '170g yogurt + 25g almonds',
      calories: 250,
      protein: 21,
      carbs: 9,
      fat: 14,
      isCompleted: false
    },
    {
      id: 'plan_4',
      mealType: 'dinner',
      name: isVeg ? 'Steamed Idlis with Sambar & Sprouted Salad' : 'Baked Salmon Fillet with Sweet Potato & Mixed Greens',
      portion: isVeg ? '3 idlis + 1 bowl sambar + 1 bowl salad' : '150g salmon + 150g sweet potato + greens',
      calories: 440,
      protein: 36,
      carbs: 42,
      fat: 10,
      isCompleted: false
    }
  ]);

  const handleToggle = (id: string) => {
    setMeals(prev => prev.map(m => {
      if (m.id === id) {
        const updated = { ...m, isCompleted: !m.isCompleted };
        onToggleMeal(updated);
        return updated;
      }
      return m;
    }));
  };

  const completedCount = meals.filter(m => m.isCompleted).length;

  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-hud font-bold text-base text-slate-900">
              Today's Prescribed Meal Checklist
            </h3>
            <p className="text-xs text-slate-500 font-mono">
              PEAKD Meal Plan · Tick off as you eat to log macros instantly
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
          {completedCount} of {meals.length} Eaten
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {meals.map(m => (
          <div
            key={m.id}
            className={`py-3.5 flex items-start justify-between gap-3 transition-colors ${
              m.isCompleted ? 'opacity-70 bg-slate-50/50 rounded-xl px-2' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => handleToggle(m.id)}
                className="mt-0.5 text-blue-600 hover:text-blue-700 transition-transform active:scale-90"
              >
                {m.isCompleted ? (
                  <CheckSquare className="w-5 h-5 fill-blue-600 text-white" />
                ) : (
                  <Square className="w-5 h-5 text-slate-300 hover:text-slate-500" />
                )}
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-100">
                    {m.mealType}
                  </span>
                  <strong className={`text-xs font-bold text-slate-900 ${m.isCompleted ? 'line-through text-slate-500' : ''}`}>
                    {m.name}
                  </strong>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 font-medium">{m.portion}</p>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                  {m.calories} kcal · {m.protein}g Protein · {m.carbs}g Carbs · {m.fat}g Fat
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSwapMeal(m)}
              className="text-slate-400 hover:text-indigo-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              title="Swap this prescribed meal"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
