import { FoodItem } from '../types';

export interface CatalogEntry {
  id: string;
  name: string;
  aliases: string[];
  cuisine: 'indian' | 'south_indian' | 'north_indian' | 'western' | 'asian' | 'universal';
  category: 'protein' | 'grains_carbs' | 'dairy' | 'vegetables' | 'curry_stew' | 'snack_beverage' | 'fruits';
  dietType: 'vegan' | 'vegetarian' | 'eggetarian' | 'non_vegetarian';
  defaultPortion: string;
  servingGrams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  micronutrients?: {
    ironMg?: number;
    calciumMg?: number;
    potassiumMg?: number;
  };
}

export const NUTRITION_CATALOG: CatalogEntry[] = [
  // --- SOUTH INDIAN CUISINE ---
  {
    id: 'idli',
    name: 'Steamed Idli',
    aliases: ['idli', 'idlis', 'steamed rice cake'],
    cuisine: 'south_indian',
    category: 'grains_carbs',
    dietType: 'vegan',
    defaultPortion: '1 piece (45g)',
    servingGrams: 45,
    calories: 58,
    protein: 2.1,
    carbs: 12.0,
    fat: 0.2,
    fiber: 1.1,
    micronutrients: { ironMg: 0.5, calciumMg: 12 }
  },
  {
    id: 'sambar',
    name: 'Vegetable Lentil Sambar',
    aliases: ['sambar', 'sambhar', 'toor dal sambar'],
    cuisine: 'south_indian',
    category: 'curry_stew',
    dietType: 'vegan',
    defaultPortion: '1 bowl / cup (150g)',
    servingGrams: 150,
    calories: 120,
    protein: 5.4,
    carbs: 18.2,
    fat: 3.1,
    fiber: 4.2,
    micronutrients: { ironMg: 1.8, potassiumMg: 340 }
  },
  {
    id: 'masala_dosa',
    name: 'Masala Dosa with Potato Filling',
    aliases: ['masala dosa', 'dosa', 'plain dosa'],
    cuisine: 'south_indian',
    category: 'grains_carbs',
    dietType: 'vegan',
    defaultPortion: '1 dosa (120g)',
    servingGrams: 120,
    calories: 210,
    protein: 4.8,
    carbs: 34.0,
    fat: 6.2,
    fiber: 3.0
  },
  {
    id: 'coconut_chutney',
    name: 'Fresh Coconut Chutney',
    aliases: ['coconut chutney', 'white chutney', 'nariyal chutney'],
    cuisine: 'south_indian',
    category: 'curry_stew',
    dietType: 'vegan',
    defaultPortion: '2 tablespoons (30g)',
    servingGrams: 30,
    calories: 75,
    protein: 0.8,
    carbs: 2.5,
    fat: 7.0,
    fiber: 1.4
  },
  {
    id: 'curd_rice',
    name: 'Tempered Curd Rice (Thayir Sadam)',
    aliases: ['curd rice', 'thayir sadam', 'dahi chawal'],
    cuisine: 'south_indian',
    category: 'grains_carbs',
    dietType: 'vegetarian',
    defaultPortion: '1 bowl (200g)',
    servingGrams: 200,
    calories: 240,
    protein: 6.8,
    carbs: 38.0,
    fat: 6.5,
    fiber: 1.2
  },

  // --- NORTH INDIAN CUISINE ---
  {
    id: 'roti_chapati',
    name: 'Whole Wheat Roti / Chapati (Without Ghee)',
    aliases: ['roti', 'chapati', 'phulka', 'rotis', 'chapatis'],
    cuisine: 'north_indian',
    category: 'grains_carbs',
    dietType: 'vegan',
    defaultPortion: '1 roti (35g)',
    servingGrams: 35,
    calories: 85,
    protein: 3.2,
    carbs: 17.5,
    fat: 0.5,
    fiber: 2.8,
    micronutrients: { ironMg: 1.1 }
  },
  {
    id: 'dal_tadka',
    name: 'Yellow Dal Tadka (Moong/Toor)',
    aliases: ['dal tadka', 'dal fry', 'yellow dal', 'daal'],
    cuisine: 'north_indian',
    category: 'curry_stew',
    dietType: 'vegan',
    defaultPortion: '1 bowl (180g)',
    servingGrams: 180,
    calories: 145,
    protein: 8.2,
    carbs: 21.0,
    fat: 3.5,
    fiber: 5.0,
    micronutrients: { ironMg: 2.4, potassiumMg: 380 }
  },
  {
    id: 'paneer_bhuji_curry',
    name: 'Fresh Paneer (Cottage Cheese)',
    aliases: ['paneer', 'cottage cheese', 'paneer tikka', 'paneer bhurji'],
    cuisine: 'north_indian',
    category: 'dairy',
    dietType: 'vegetarian',
    defaultPortion: '100 grams',
    servingGrams: 100,
    calories: 265,
    protein: 18.3,
    carbs: 3.4,
    fat: 20.8,
    fiber: 0.0,
    micronutrients: { calciumMg: 480 }
  },
  {
    id: 'chole_chickpeas',
    name: 'Chole / Chickpea Masala',
    aliases: ['chole', 'chana masala', 'chickpeas curry', 'chickpea'],
    cuisine: 'north_indian',
    category: 'curry_stew',
    dietType: 'vegan',
    defaultPortion: '1 bowl (180g)',
    servingGrams: 180,
    calories: 215,
    protein: 10.5,
    carbs: 32.0,
    fat: 5.2,
    fiber: 7.8,
    micronutrients: { ironMg: 3.1 }
  },
  {
    id: 'rajma_masala',
    name: 'Rajma / Red Kidney Bean Curry',
    aliases: ['rajma', 'kidney beans curry', 'rajma masala'],
    cuisine: 'north_indian',
    category: 'curry_stew',
    dietType: 'vegan',
    defaultPortion: '1 bowl (180g)',
    servingGrams: 180,
    calories: 195,
    protein: 9.8,
    carbs: 30.5,
    fat: 4.2,
    fiber: 7.2
  },
  {
    id: 'chicken_curry_indian',
    name: 'Home-style Chicken Curry',
    aliases: ['chicken curry', 'murgh curry', 'curry chicken'],
    cuisine: 'north_indian',
    category: 'protein',
    dietType: 'non_vegetarian',
    defaultPortion: '1 bowl / 150g with pieces',
    servingGrams: 150,
    calories: 220,
    protein: 26.0,
    carbs: 4.5,
    fat: 11.0,
    fiber: 1.5
  },

  // --- WESTERN & SPORTS PERFORMANCE FOODS ---
  {
    id: 'chicken_breast_grilled',
    name: 'Grilled Skinless Chicken Breast',
    aliases: ['chicken breast', 'grilled chicken', 'baked chicken'],
    cuisine: 'western',
    category: 'protein',
    dietType: 'non_vegetarian',
    defaultPortion: '100 grams cooked',
    servingGrams: 100,
    calories: 165,
    protein: 31.0,
    carbs: 0.0,
    fat: 3.6,
    fiber: 0.0,
    micronutrients: { potassiumMg: 256 }
  },
  {
    id: 'whole_egg_boiled',
    name: 'Whole Large Egg (Boiled/Poached)',
    aliases: ['egg', 'eggs', 'boiled egg', 'whole egg', 'scrambled eggs'],
    cuisine: 'universal',
    category: 'protein',
    dietType: 'eggetarian',
    defaultPortion: '1 large egg (50g)',
    servingGrams: 50,
    calories: 74,
    protein: 6.3,
    carbs: 0.4,
    fat: 5.0,
    fiber: 0.0,
    micronutrients: { ironMg: 0.9, calciumMg: 28 }
  },
  {
    id: 'egg_whites',
    name: 'Liquid Egg Whites',
    aliases: ['egg white', 'egg whites', 'egg white omelette'],
    cuisine: 'universal',
    category: 'protein',
    dietType: 'eggetarian',
    defaultPortion: '100g (approx 3 whites)',
    servingGrams: 100,
    calories: 52,
    protein: 11.0,
    carbs: 0.7,
    fat: 0.2,
    fiber: 0.0
  },
  {
    id: 'whey_protein_isolate',
    name: 'Whey Protein Powder (1 Scoop)',
    aliases: ['whey', 'whey protein', 'protein shake', 'scoop whey', 'protein powder'],
    cuisine: 'universal',
    category: 'protein',
    dietType: 'vegetarian',
    defaultPortion: '1 scoop (30g)',
    servingGrams: 30,
    calories: 120,
    protein: 25.0,
    carbs: 2.0,
    fat: 1.0,
    fiber: 0.5,
    micronutrients: { calciumMg: 150 }
  },
  {
    id: 'greek_yogurt_plain',
    name: 'Plain Greek Yogurt (0% Fat)',
    aliases: ['greek yogurt', 'strained curd', 'hung curd'],
    cuisine: 'western',
    category: 'dairy',
    dietType: 'vegetarian',
    defaultPortion: '1 cup / 170g',
    servingGrams: 170,
    calories: 100,
    protein: 17.5,
    carbs: 6.0,
    fat: 0.5,
    fiber: 0.0,
    micronutrients: { calciumMg: 200 }
  },
  {
    id: 'rolled_oats',
    name: 'Rolled Oats (Dry Measure)',
    aliases: ['oats', 'oatmeal', 'rolled oats', 'porridge'],
    cuisine: 'western',
    category: 'grains_carbs',
    dietType: 'vegan',
    defaultPortion: '40g dry / 1/2 cup',
    servingGrams: 40,
    calories: 154,
    protein: 5.3,
    carbs: 27.5,
    fat: 2.6,
    fiber: 4.1
  },
  {
    id: 'white_rice_cooked',
    name: 'Steamed Basmati / Jasmine Rice',
    aliases: ['rice', 'white rice', 'cooked rice', 'chawal'],
    cuisine: 'universal',
    category: 'grains_carbs',
    dietType: 'vegan',
    defaultPortion: '1 cup / 150g cooked',
    servingGrams: 150,
    calories: 195,
    protein: 4.1,
    carbs: 43.0,
    fat: 0.4,
    fiber: 0.6
  },
  {
    id: 'brown_rice_cooked',
    name: 'Steamed Brown Rice',
    aliases: ['brown rice'],
    cuisine: 'universal',
    category: 'grains_carbs',
    dietType: 'vegan',
    defaultPortion: '1 cup / 150g cooked',
    servingGrams: 150,
    calories: 170,
    protein: 3.8,
    carbs: 35.5,
    fat: 1.4,
    fiber: 2.5
  },
  {
    id: 'extra_firm_tofu',
    name: 'Extra Firm Tofu',
    aliases: ['tofu', 'firm tofu', 'soy tofu'],
    cuisine: 'asian',
    category: 'protein',
    dietType: 'vegan',
    defaultPortion: '100g',
    servingGrams: 100,
    calories: 85,
    protein: 10.0,
    carbs: 2.0,
    fat: 4.8,
    fiber: 1.2,
    micronutrients: { calciumMg: 350, ironMg: 1.6 }
  },
  {
    id: 'soy_chunks_dry',
    name: 'Textured Soy Chunks / Mealmaker',
    aliases: ['soy chunks', 'soya chunks', 'mealmaker', 'nutrela'],
    cuisine: 'indian',
    category: 'protein',
    dietType: 'vegan',
    defaultPortion: '50g dry',
    servingGrams: 50,
    calories: 172,
    protein: 26.0,
    carbs: 16.5,
    fat: 0.3,
    fiber: 6.5,
    micronutrients: { ironMg: 4.8 }
  },
  {
    id: 'peanut_butter',
    name: 'Natural Peanut Butter (No Added Sugar)',
    aliases: ['peanut butter', 'pb'],
    cuisine: 'western',
    category: 'dairy',
    dietType: 'vegan',
    defaultPortion: '2 tablespoons (32g)',
    servingGrams: 32,
    calories: 190,
    protein: 8.0,
    carbs: 6.0,
    fat: 16.0,
    fiber: 2.0
  },
  {
    id: 'banana',
    name: 'Fresh Banana (Medium)',
    aliases: ['banana', 'bananas'],
    cuisine: 'universal',
    category: 'fruits',
    dietType: 'vegan',
    defaultPortion: '1 medium fruit (118g)',
    servingGrams: 118,
    calories: 105,
    protein: 1.3,
    carbs: 27.0,
    fat: 0.3,
    fiber: 3.1,
    micronutrients: { potassiumMg: 422 }
  },
  {
    id: 'apple',
    name: 'Fresh Apple (Medium)',
    aliases: ['apple', 'apples'],
    cuisine: 'universal',
    category: 'fruits',
    dietType: 'vegan',
    defaultPortion: '1 medium fruit (180g)',
    servingGrams: 180,
    calories: 95,
    protein: 0.5,
    carbs: 25.0,
    fat: 0.3,
    fiber: 4.4
  },
  {
    id: 'almonds_raw',
    name: 'Raw Almonds (Badam)',
    aliases: ['almonds', 'badam', 'nuts'],
    cuisine: 'universal',
    category: 'snack_beverage',
    dietType: 'vegan',
    defaultPortion: '1 handful / 28g (approx 23 nuts)',
    servingGrams: 28,
    calories: 164,
    protein: 6.0,
    carbs: 6.1,
    fat: 14.2,
    fiber: 3.5
  }
];

// Helper to look up catalog entries heuristically offline
export function lookupNutritionCatalog(query: string): CatalogEntry | null {
  const q = query.toLowerCase().trim();
  
  // Direct match
  const direct = NUTRITION_CATALOG.find(item => 
    item.name.toLowerCase().includes(q) || 
    item.aliases.some(alias => alias.toLowerCase() === q || q.includes(alias))
  );
  if (direct) return direct;

  // Partial keyword search
  const words = q.split(/\s+/);
  for (const item of NUTRITION_CATALOG) {
    for (const alias of item.aliases) {
      if (words.some(w => w.length > 2 && alias.includes(w))) {
        return item;
      }
    }
  }

  return null;
}
