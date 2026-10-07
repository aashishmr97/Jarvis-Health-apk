import { UserProfile, MacroTarget, FoodItem, MealLog, FoodSubstitutionResult } from '../types';
import { NUTRITION_CATALOG, lookupNutritionCatalog } from '../data/nutritionCatalog';

export class NutritionEngine {
  /**
   * Calculates BMR, TDEE, and precise macro targets based on physiological stats and goals
   */
  static calculateMacroTargets(profile: UserProfile): MacroTarget {
    const isMale = profile.sex === 'male';
    const weight = profile.weight || 75;
    const height = profile.height || 175;
    const age = profile.age || 28;

    // Mifflin-St Jeor Formula
    const bmr = isMale
      ? Math.round(10 * weight + 6.25 * height - 5 * age + 5)
      : Math.round(10 * weight + 6.25 * height - 5 * age - 161);

    // Activity multiplier based on training frequency
    let activityMult = 1.35;
    if (profile.daysPerWeek >= 5) activityMult = 1.6;
    else if (profile.daysPerWeek >= 3) activityMult = 1.45;

    const tdee = Math.round(bmr * activityMult);

    // Goal adjustment
    let targetCalories = tdee;
    if (profile.goal === 'fat_loss') {
      targetCalories = tdee - 450;
    } else if (profile.goal === 'muscle_gain') {
      targetCalories = tdee + 300;
    } else if (profile.goal === 'recomposition') {
      targetCalories = tdee - 150;
    }

    // Protein target: 2.0g per kg of bodyweight
    const proteinGrams = Math.round(weight * 2.1);
    const proteinCalories = proteinGrams * 4;

    // Fat target: 25% of total calories
    const fatCalories = targetCalories * 0.25;
    const fatGrams = Math.round(fatCalories / 9);

    // Carbs: Remainder of daily calories
    const carbCalories = Math.max(0, targetCalories - proteinCalories - fatCalories);
    const carbsGrams = Math.round(carbCalories / 4);

    // Fiber target: 14g per 1000 kcal
    const fiberGrams = Math.round((targetCalories / 1000) * 14);

    return {
      calories: Math.round(targetCalories),
      proteinGrams,
      carbsGrams,
      fatGrams,
      fiberGrams,
      bmr,
      tdee
    };
  }

  /**
   * Offline heuristic parser for natural language food entry
   * Example: "3 idlis, sambar and two eggs"
   */
  static parseFoodTextOffline(query: string): {
    items: FoodItem[];
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    totalFiber: number;
  } {
    const rawTokens = query.split(/,|\band\b|\+/i).map(s => s.trim()).filter(Boolean);
    const items: FoodItem[] = [];

    for (const segment of rawTokens) {
      // Extract quantity number if present (e.g., "3 idlis", "two eggs", "100g chicken")
      let qty = 1;
      const numMatch = segment.match(/^(\d+(?:\.\d+)?)/);
      if (numMatch) {
        qty = parseFloat(numMatch[1]);
      } else if (/\btwo\b/i.test(segment)) {
        qty = 2;
      } else if (/\bthree\b/i.test(segment)) {
        qty = 3;
      } else if (/\bfour\b/i.test(segment)) {
        qty = 4;
      }

      // Check against catalog
      const catalogItem = lookupNutritionCatalog(segment);
      if (catalogItem) {
        const cal = Math.round(catalogItem.calories * qty);
        const p = Math.round(catalogItem.protein * qty * 10) / 10;
        const c = Math.round(catalogItem.carbs * qty * 10) / 10;
        const f = Math.round(catalogItem.fat * qty * 10) / 10;
        const fib = Math.round(catalogItem.fiber * qty * 10) / 10;

        items.push({
          id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: catalogItem.name,
          quantity: qty,
          unit: catalogItem.defaultPortion.split('(')[0].trim() || 'serving',
          calories: cal,
          protein: p,
          carbs: c,
          fat: f,
          fiber: fib,
          category: catalogItem.category,
          cuisine: catalogItem.cuisine,
          verified: true
        });
      } else {
        // Generic estimated item
        items.push({
          id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: segment,
          quantity: qty,
          unit: 'portion',
          calories: 180 * qty,
          protein: 8 * qty,
          carbs: 22 * qty,
          fat: 6 * qty,
          fiber: 2 * qty,
          verified: false
        });
      }
    }

    // Totals
    const totalCalories = items.reduce((sum, i) => sum + i.calories, 0);
    const totalProtein = Math.round(items.reduce((sum, i) => sum + i.protein, 0) * 10) / 10;
    const totalCarbs = Math.round(items.reduce((sum, i) => sum + i.carbs, 0) * 10) / 10;
    const totalFat = Math.round(items.reduce((sum, i) => sum + i.fat, 0) * 10) / 10;
    const totalFiber = Math.round(items.reduce((sum, i) => sum + i.fiber, 0) * 10) / 10;

    return {
      items,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      totalFiber
    };
  }

  /**
   * Deterministic smart food substitution
   */
  static getSmartFoodSubstitutions(originalFood: string, goal: string): FoodSubstitutionResult {
    const q = originalFood.toLowerCase();

    if (q.includes('paneer') || q.includes('cheese')) {
      return {
        originalFood,
        substitutions: [
          {
            name: 'Low-Fat Cottage Cheese / Paneer (Skimmed)',
            portion: '100g',
            calories: 140,
            protein: 21,
            carbs: 4,
            fat: 4,
            why: 'Maintains authentic dairy texture and casein amino profile with 65% fat reduction.'
          },
          {
            name: 'Extra Firm Tofu',
            portion: '120g',
            calories: 110,
            protein: 15,
            carbs: 3,
            fat: 5,
            why: 'Direct culinary swap for curries and grills, superior calcium density, lower saturated lipids.'
          },
          {
            name: 'Nutrela / Soy Chunks (Rehydrated)',
            portion: '40g dry (100g cooked)',
            calories: 138,
            protein: 21,
            carbs: 13,
            fat: 0.3,
            why: 'Unbeatable protein-to-calorie ratio (over 60% of calories from complete protein).'
          }
        ]
      };
    }

    if (q.includes('rice') || q.includes('chawal')) {
      return {
        originalFood,
        substitutions: [
          {
            name: 'Steamed Cauliflower Rice',
            portion: '150g',
            calories: 38,
            protein: 3,
            carbs: 7,
            fat: 0.5,
            why: '80% fewer calories and glycemic index near zero while keeping meal volume high.'
          },
          {
            name: 'Cooked Quinoa',
            portion: '150g',
            calories: 180,
            protein: 7,
            carbs: 32,
            fat: 2.8,
            why: 'Complete amino acid profile and triple the dietary fiber of white basmati.'
          }
        ]
      };
    }

    // Default high-performance athletic substitutes
    return {
      originalFood,
      substitutions: [
        {
          name: 'Liquid Egg Whites + 1 Whole Egg',
          portion: '150g egg whites + 1 egg',
          calories: 155,
          protein: 23,
          carbs: 1,
          fat: 5,
          why: 'Ultra-pure protein with biological value (BV) of 100.'
        },
        {
          name: 'Skinless Chicken Breast',
          portion: '100g cooked',
          calories: 165,
          protein: 31,
          carbs: 0,
          fat: 3.6,
          why: 'Maximum protein density with near-zero carbohydrate load.'
        }
      ]
    };
  }
}
