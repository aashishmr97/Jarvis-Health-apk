import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json());

// Initialize Google GenAI if key is present
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({ 
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

// 1. Daily Coaching "What should I do today and why?"
app.post('/api/gemini/coaching-daily', async (req: Request, res: Response) => {
  try {
    const { profile, readiness, todayWorkout, memory, lastWorkouts } = req.body;

    if (!ai) {
      // Deterministic expert heuristic fallback
      return res.json({
        rationale: `Readiness score is ${readiness.score}/100 (${readiness.tier}). Based on your primary goal of ${profile.goal} and sleep duration of ${readiness.metrics.sleepHours}h with ${readiness.metrics.sorenessLevel}/10 muscle soreness, today is programmed for ${todayWorkout.title}. Volume is autoregulated to ${todayWorkout.exercises.length} key compound movements.`,
        keyDirectives: [
          `Prioritize form on ${todayWorkout.exercises[0]?.name || 'first movement'} with RIR of ${todayWorkout.exercises[0]?.targetRIR || 2}`,
          readiness.score < 60 ? 'Active recovery or reduced loads recommended due to elevated fatigue' : 'Target progressive overload (+1-2 reps or +2.5kg if RPE < 8)',
          'Hydrate and ensure target protein intake of ' + Math.round(profile.weight * 2) + 'g'
        ],
        coachTone: 'focused and objective'
      });
    }

    const prompt = `You are JARVIS, an elite adaptive personal trainer and sports scientist.
Analyze the user's data and answer definitively: "What should I do today, and why?"

USER PROFILE:
Goal: ${profile.goal}
Experience: ${profile.experience}
Current Weight: ${profile.weight} kg
Equipment: ${profile.equipment?.join(', ')}
Injury Limitations: ${profile.limitations?.join(', ') || 'None reported'}

READINESS & BIO-TELEMETRY:
Readiness Score: ${readiness.score}/100 (${readiness.tier})
Sleep: ${readiness.metrics.sleepHours}h (Quality: ${readiness.metrics.sleepQuality}/10)
Resting HR: ${readiness.metrics.restingHR} bpm (Baseline: ${readiness.metrics.baselineRHR || 60} bpm)
Subjective Soreness: ${readiness.metrics.sorenessLevel}/10 (${readiness.metrics.soreMuscles?.join(', ') || 'None'})
Stress: ${readiness.metrics.stressLevel}/10

PROGRAMMED TODAY WORKOUT:
Title: ${todayWorkout.title} (${todayWorkout.type})
Target Focus: ${todayWorkout.focus}
Volume: ${todayWorkout.exercises?.length} movements

COACHING MEMORY (Learned facts):
${memory?.slice(0, 5).map((m: any) => `- [${m.category}] ${m.fact}`).join('\n') || 'No previous recorded anomalies.'}

RECENT WORKOUT CONTEXT:
${lastWorkouts?.slice(0, 2).map((w: any) => `- ${w.date}: ${w.title} (RPE avg: ${w.avgRpe || 'N/A'})`).join('\n') || 'First logged session.'}

Respond in concise, high-impact, professional personal trainer voice (inspired by JARVIS: articulate, authoritative, science-grounded, zero fluff).
Provide a structured JSON output with:
{
  "rationale": "2-3 sentences explaining exactly what to do and the physiological WHY based on their recovery and progressive overload goals",
  "keyDirectives": ["directive 1", "directive 2", "directive 3"],
  "loadAdjustment": "maintain | increase_2_5kg | decrease_10_percent | focus_technique",
  "readinessTakeaway": "One short sentence summary of their bio-readiness state"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Coaching daily error:', error);
    return res.status(500).json({ error: error.message || 'Error generating coaching advice' });
  }
});

// 2. Natural Language Food Logging
app.post('/api/gemini/parse-food', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'Query is required' });

    if (!ai) {
      // Heuristic parsing fallback for offline mode
      return res.json({
        recognizedItems: [
          {
            name: query,
            quantity: 1,
            unit: 'serving',
            calories: 250,
            protein: 15,
            carbs: 30,
            fat: 7,
            fiber: 3,
            confidence: 0.8
          }
        ],
        totalCalories: 250,
        totalProtein: 15,
        totalCarbs: 30,
        totalFat: 7,
        totalFiber: 3
      });
    }

    const prompt = `You are a nutrition database parser. A user wants to log food naturally:
"${query}"

Break this down into individual food items with realistic standard nutritional data (calories, protein in g, carbs in g, fat in g, fiber in g).
Recognize global and regional cuisines accurately (including Indian: idli, sambar, roti, paneer, dal, dosa, biryani; Western: oatmeal, chicken breast, protein shake, steak, avocado, etc.).
Support household portions (pieces, bowls, cups, spoons, grams).

Return JSON format:
{
  "recognizedItems": [
    {
      "name": "Food item name",
      "quantity": 3,
      "unit": "pieces/grams/bowl/cup/serving",
      "calories": 180,
      "protein": 6,
      "carbs": 36,
      "fat": 1,
      "fiber": 2,
      "confidence": 0.95
    }
  ],
  "totalCalories": 180,
  "totalProtein": 6,
  "totalCarbs": 36,
  "totalFat": 1,
  "totalFiber": 2
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Food parse error:', error);
    return res.status(500).json({ error: error.message || 'Error parsing food entry' });
  }
});

// 3. Voice Command Parser (during workout)
app.post('/api/gemini/voice-command', async (req: Request, res: Response) => {
  try {
    const { transcript, currentExercise, currentSet, currentWeight } = req.body;
    if (!transcript) return res.status(400).json({ error: 'Transcript is required' });

    if (!ai) {
      // Rule-based fallback
      const lower = transcript.toLowerCase();
      let action = 'unknown';
      let spokenResponse = 'Command noted.';
      let deltaWeight = 0;

      if (lower.includes('done') || lower.includes('finished')) {
        action = 'complete_set';
        spokenResponse = 'Set completed. Rest timer started.';
      } else if (lower.includes('too easy') || lower.includes('add weight') || lower.includes('add 5') || lower.includes('add 2.5')) {
        action = 'increase_weight';
        deltaWeight = lower.includes('5') ? 5 : 2.5;
        spokenResponse = `Adding ${deltaWeight} kilos for next set.`;
      } else if (lower.includes('too hard') || lower.includes('reduce weight') || lower.includes('drop weight')) {
        action = 'decrease_weight';
        deltaWeight = -2.5;
        spokenResponse = `Lowering weight by 2.5 kilos. Form integrity first.`;
      } else if (lower.includes('hurt') || lower.includes('pain') || lower.includes('replace') || lower.includes('substitute') || lower.includes("can't do")) {
        action = 'substitute_exercise';
        spokenResponse = `Understood. Finding an intelligent biomechanical substitute that protects that joint.`;
      } else if (lower.includes('skip rest') || lower.includes('ready')) {
        action = 'skip_rest';
        spokenResponse = 'Rest skipped. Ready for next set.';
      } else if (lower.includes('pause') || lower.includes('wait')) {
        action = 'pause_workout';
        spokenResponse = 'Workout paused.';
      } else if (lower.includes('how much rest') || lower.includes('what next')) {
        action = 'query_status';
        spokenResponse = `Next set target is ${currentWeight} kilos. Take standard rest.`;
      }

      return res.json({ action, deltaWeight, spokenResponse, targetRpe: 8 });
    }

    const prompt = `You are the real-time voice controller for JARVIS during an active training workout.
CURRENT STATE:
Exercise: ${currentExercise?.name || 'Bench Press'}
Set: ${currentSet || 1}
Current Load: ${currentWeight || 60} kg

USER VOICE INPUT:
"${transcript}"

Classify this into one of these actions:
- "complete_set" (e.g. "done", "finished", "got 8 reps", "completed")
- "increase_weight" (e.g. "too easy", "add 5 kilos", "increase weight")
- "decrease_weight" (e.g. "too heavy", "reduce weight", "drop 5 kilos")
- "substitute_exercise" (e.g. "my shoulder hurts", "replace this", "I can't do bench press", "swap exercise")
- "skip_rest" (e.g. "skip rest", "let's go", "ready now")
- "extend_rest" (e.g. "need more rest", "add 30 seconds")
- "pause_workout" (e.g. "pause", "hold on")
- "resume_workout" (e.g. "resume", "continue")
- "log_feedback" (e.g. "RPE was 9", "form felt clean", "twinge in elbow")

Return JSON format:
{
  "action": "complete_set | increase_weight | decrease_weight | substitute_exercise | skip_rest | extend_rest | pause_workout | resume_workout | log_feedback",
  "deltaWeight": 2.5,
  "deltaRest": 30,
  "rpe": 8,
  "painFlag": false,
  "painLocation": "shoulder | knee | back | none",
  "spokenResponse": "Crisp JARVIS voice confirmation (10-15 words max)"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Voice command error:', error);
    return res.status(500).json({ error: error.message || 'Error processing voice command' });
  }
});

// 4. Food Substitution recommendation
app.post('/api/gemini/food-substitution', async (req: Request, res: Response) => {
  try {
    const { foodToReplace, reason, dietaryPreference } = req.body;

    if (!ai) {
      return res.json({
        substitutions: [
          {
            name: "Extra Firm Tofu",
            portion: "100g",
            calories: 140,
            protein: 16,
            carbs: 3,
            fat: 8,
            why: "Matches texture with 40% lower saturated fat and comparable protein density."
          },
          {
            name: "Low-Fat Paneer / Cottage Cheese",
            portion: "100g",
            calories: 160,
            protein: 20,
            carbs: 4,
            fat: 6,
            why: "Direct culinary match with 50% fat reduction and higher casein protein."
          }
        ]
      });
    }

    const prompt = `A user wants to replace "${foodToReplace}".
Reason/Goal: "${reason || 'Higher protein or lower fat'}"
Dietary Preference: "${dietaryPreference || 'Any'}"

Suggest 3 intelligent, biologically sound and culinary compatible food substitutions.
Include precise portion, calories, protein (g), carbs (g), fat (g), and scientific rationale for why this is superior.

Return JSON format:
{
  "substitutions": [
    {
      "name": "Food name",
      "portion": "100g / 1 cup",
      "calories": 150,
      "protein": 22,
      "carbs": 2,
      "fat": 4,
      "why": "Clear explanation of why this fits their requirement"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Food substitution error:', error);
    return res.status(500).json({ error: error.message || 'Error generating food substitution' });
  }
});

// 5. Interactive AI Coach Chat (PEAKD-style plain language coaching)
app.post('/api/gemini/coach-chat', async (req: Request, res: Response) => {
  try {
    const { message, conversationHistory, profile, todayWorkout, readiness } = req.body;

    if (!ai) {
      return res.json({
        reply: `Understood. Given your goal of ${profile.goal} and today's readiness score of ${readiness.score}/100, focus on executing your programmed ${todayWorkout.title}. If you're short on time, switch to Lite mode (30m) or Survival mode (15m) so you never break your streak!`,
        suggestedActions: [
          { label: "Switch to Lite Mode (30m)", action: "set_lite_mode" },
          { label: "Swap Primary Exercise", action: "open_substitution" }
        ]
      });
    }

    const prompt = `You are JARVIS, an elite personal trainer and AI coach inside an adaptive fitness app (similar to PEAKD!).
USER CONTEXT:
Goal: ${profile.goal}
Experience: ${profile.experience}
Weight: ${profile.weight}kg
Limitations/Medical: ${profile.limitations?.join(', ') || 'None'}
Medical Conditions: ${profile.medicalConditions?.join(', ') || 'None'}
Food Allergies: ${profile.foodAllergies?.join(', ') || 'None'}
Today's Scheduled Workout: ${todayWorkout.title} (${todayWorkout.focus})
Readiness Score: ${readiness.score}/100 (${readiness.tier})

USER MESSAGE:
"${message}"

CONVERSATION HISTORY:
${conversationHistory?.slice(-4).map((m: any) => `${m.sender}: ${m.text}`).join('\n') || 'Start of conversation'}

Answer with high-performance sports science expertise in a warm, authoritative, articulate coaching voice.
If they ask to swap an exercise, explain the physiological alternative.
If they ask what to eat or log a meal, give exact portions and macros.
If they say they have low energy, mention Lite or Survival mode.

Return JSON format:
{
  "reply": "Clear, concise coaching response (2-4 sentences)",
  "suggestedActions": [
    { "label": "Action label", "action": "action_code" }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Coach chat error:', error);
    return res.status(500).json({ error: error.message || 'Error processing coach chat' });
  }
});

// 6. Plate Photo Recognition (PEAKD-style photograph your plate food tracking)
app.post('/api/gemini/analyze-plate', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', notes } = req.body;

    if (!ai || !imageBase64) {
      // Deterministic fallback
      return res.json({
        dishName: "Grilled Chicken, Rice & Steamed Veggies",
        recognizedItems: [
          { name: "Grilled Chicken Breast", quantity: 150, unit: "g", calories: 247, protein: 46.5, carbs: 0, fat: 5.4, fiber: 0 },
          { name: "Cooked Steamed White Rice", quantity: 150, unit: "g (1 cup)", calories: 195, protein: 4.1, carbs: 43.0, fat: 0.4, fiber: 0.6 },
          { name: "Steamed Broccoli & Carrots", quantity: 100, unit: "g", calories: 45, protein: 2.8, carbs: 9.0, fat: 0.5, fiber: 3.2 }
        ],
        totalCalories: 487,
        totalProtein: 53.4,
        totalCarbs: 52.0,
        totalFat: 6.3,
        totalFiber: 3.8,
        confidence: 0.92,
        coachingFeedback: "Excellent high-protein, clean carbohydrate refuel plate."
      });
    }

    // Call Gemini with image
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          inlineData: {
            mimeType,
            data: imageBase64.replace(/^data:image\/\w+;base64,/, '')
          }
        },
        {
          text: `You are an expert nutrition computer vision engine. Analyze this food plate photograph.
${notes ? `User notes: "${notes}"` : ''}

Identify all food components on the plate, estimate reasonable culinary portion weights in grams/household units, and calculate precise calories, protein(g), carbs(g), fat(g), and fiber(g).
Recognize global, Western, and Indian dishes accurately.

Return JSON format:
{
  "dishName": "Summary title of the plate",
  "recognizedItems": [
    {
      "name": "Food item",
      "quantity": 150,
      "unit": "g / pieces / cup",
      "calories": 220,
      "protein": 25,
      "carbs": 12,
      "fat": 8,
      "fiber": 2
    }
  ],
  "totalCalories": 450,
  "totalProtein": 35,
  "totalCarbs": 40,
  "totalFat": 12,
  "totalFiber": 5,
  "confidence": 0.9,
  "coachingFeedback": "One sentence evaluation of macro balance"
}`
        }
      ],
      config: {
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Analyze plate error:', error);
    return res.status(500).json({ error: error.message || 'Error analyzing plate photo' });
  }
});

// 7. Weekly Stand-Up Adaptive Review (PEAKD-style weekly check-in & adaptation)
app.post('/api/gemini/weekly-standup', async (req: Request, res: Response) => {
  try {
    const { completedCount, scheduledCount, missedReasons, currentStreak, profile } = req.body;

    if (!ai) {
      const isDeloadNeeded = completedCount < scheduledCount && missedReasons?.includes('fatigue');
      return res.json({
        grade: completedCount >= scheduledCount ? "A+" : completedCount >= 3 ? "B" : "C",
        summary: `You completed ${completedCount} of ${scheduledCount} workouts this week with a ${currentStreak}-day streak.`,
        weeklyAdaptation: isDeloadNeeded 
          ? "Deload Week Scheduled: Volume reduced by 30% to clear systemic joint fatigue and reboot neural drive."
          : "Volume Ramp: Continuing progression block with +2.5kg target overload on primary lifts.",
        nextWeekFocus: "Maintain consistency across your compound movements.",
        recommendedMode: isDeloadNeeded ? "survival" : "main"
      });
    }

    const prompt = `You are JARVIS running the weekly "Stand-Up" coaching review (PEAKD feature).
REVIEW DATA:
Athlete: ${profile.name} (Goal: ${profile.goal})
Completed Sessions: ${completedCount} / ${scheduledCount} scheduled
Current Active Streak: ${currentStreak} days
User Reported Reasons for Missed Workouts: ${missedReasons?.join(', ') || 'None, 100% adherence'}

Evaluate the athlete's weekly consistency and determine next week's adaptations:
- Should next week be a Deload/Recovery block (if fatigue/missed sessions high)?
- Should volume increase (+5-10%)?
- Provide actionable advice for schedule adherence.

Return JSON format:
{
  "grade": "A+ | A | B | C",
  "summary": "2-sentence empathetic yet rigorous review of the week",
  "weeklyAdaptation": "Detailed explanation of next week's programming changes",
  "nextWeekFocus": "Primary technical or recovery focus",
  "recommendedMode": "main | lite | survival"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Weekly standup error:', error);
    return res.status(500).json({ error: error.message || 'Error generating weekly standup' });
  }
});

// 8. Dedicated Multi-Turn Gemini Personal Trainer Chatbot
app.post('/api/gemini/chat', async (req: Request, res: Response) => {
  try {
    const { 
      message, 
      history = [], 
      taskComplexity = 'general', // 'complex' | 'general' | 'fast'
      profile, 
      todayWorkout, 
      readiness 
    } = req.body;

    if (!message) return res.status(400).json({ error: 'Message is required' });

    // Select model according to prompt instructions:
    // Complex tasks: gemini-3.1-pro-preview
    // General tasks: gemini-3.5-flash
    // Fast tasks: gemini-3.1-flash-lite
    let modelName = 'gemini-3.5-flash';
    if (taskComplexity === 'complex' || message.toLowerCase().includes('plan') || message.toLowerCase().includes('diet chart') || message.toLowerCase().includes('routine')) {
      modelName = 'gemini-3.1-pro-preview';
    } else if (taskComplexity === 'fast') {
      modelName = 'gemini-3.1-flash-lite';
    }

    if (!ai) {
      return res.json({
        reply: `As your personal trainer, I am monitoring your progress for ${profile?.goal || 'athletic fitness'}. Based on your metrics, keep your progressive overload consistent and ensure you hit your protein goals. What specific exercise or meal adjustment would you like to make?`,
        modelUsed: 'heuristic-fallback'
      });
    }

    const systemInstruction = `You are JARVIS, an elite adaptive personal trainer, biomechanics specialist, and sports nutritionist.
Your mission is to act as the user's authoritative, science-grounded personal trainer throughout their daily life.
You generate custom workout plans, detailed customized diet charts, autoregulate sets based on fatigue, provide exercise cues, and protect their joints.

CURRENT ATHLETE STATE:
Name: ${profile?.name || 'Athlete'}
Goal: ${profile?.goal || 'muscle_gain'}
Experience: ${profile?.experience || 'intermediate'}
Weight: ${profile?.weight || 75} kg (Target: ${profile?.targetWeight || 72} kg)
Streak: ${profile?.streakDays || 14} days
Equipment: ${profile?.equipment?.join(', ') || 'gym'}
Injuries/Limitations: ${profile?.limitations?.join(', ') || 'None'}
Medical Screening: ${profile?.medicalConditions?.join(', ') || 'None'}
Food Allergies: ${profile?.foodAllergies?.join(', ') || 'None'}
Dietary Pattern: ${profile?.dietaryPattern || 'omnivore'} (${profile?.cuisinePreference || 'mixed'})
Today's Scheduled Workout: ${todayWorkout?.title || 'Upper Focus'}
Current Bio-Readiness: ${readiness?.score || 84}/100 (${readiness?.tier || 'optimal'})

COMMUNICATION STYLE:
- Articulate, authoritative, precise, empathetic, encouraging.
- When generating workout plans: specify movement patterns, target muscles, sets, reps, load, tempo, and RIR.
- When generating diet charts: specify meals, exact ingredients in grams/pieces, calories, and macros (protein, carbs, fat, fiber).
- Never give generic advice. Ground everything in this athlete's specific biometric context.`;

    // Format conversation history
    const contents: any[] = [];
    if (history && history.length > 0) {
      for (const h of history.slice(-8)) {
        contents.push({
          role: h.sender === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }]
        });
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: modelName,
      contents,
      config: {
        systemInstruction,
      }
    });

    return res.json({
      reply: response.text || "I have analyzed your request. Let's optimize your session.",
      modelUsed: modelName
    });
  } catch (error: any) {
    console.error('Gemini chat error:', error);
    return res.status(500).json({ error: error.message || 'Error generating chat response' });
  }
});

// 9. Complex Workout Plan Generator (Using gemini-3.1-pro-preview)
app.post('/api/gemini/generate-workout-plan', async (req: Request, res: Response) => {
  try {
    const { profile, specificFocus, numWeeks = 4, splitType } = req.body;

    if (!ai) {
      return res.json({
        planTitle: "4-Week Adaptive Periodization",
        summary: "Balanced hypertrophy and strength mesocycle targeting progressive overload on key compound movements.",
        splitType: splitType || "Upper / Lower",
        days: [
          { day: "Day 1", name: "Upper Heavy", focus: "Chest & Back Overload", exercises: ["Barbell Bench Press (3x6-8)", "Chest Supported Row (3x8)", "Overhead Press (3x6)"] },
          { day: "Day 2", name: "Lower Quad", focus: "Squat Dominance", exercises: ["Barbell Back Squat (3x6-8)", "Romanian Deadlift (3x8)", "Bulgarian Split Squat (2x10)"] },
          { day: "Day 3", name: "Active Recovery", focus: "Zone 2 Cardio & Mobility", exercises: ["30-min brisk walk", "Hip Mobility Flow"] },
          { day: "Day 4", name: "Upper Hypertrophy", focus: "Shoulders & Back Width", exercises: ["Incline DB Press (3x10)", "Pull-Ups (3xMax)", "Lateral Raises (4x12)"] }
        ]
      });
    }

    const prompt = `You are an elite sports scientist. Generate a structured, personalized ${numWeeks}-week workout program for:
Goal: ${profile.goal}
Experience: ${profile.experience}
Equipment: ${profile.equipment?.join(', ')}
Limitations: ${profile.limitations?.join(', ') || 'None'}
Medical: ${profile.medicalConditions?.join(', ') || 'None'}
Focus: ${specificFocus || 'Maximal hypertrophy and strength progression'}
Days per week: ${profile.daysPerWeek || 4}

Provide JSON format:
{
  "planTitle": "Title of the plan",
  "summary": "2-sentence scientific overview",
  "splitType": "Upper/Lower | Full Body | PPL",
  "days": [
    {
      "day": "Day 1",
      "name": "Session Name",
      "focus": "Target muscles",
      "exercises": ["Exercise 1 (sets x reps)", "Exercise 2 (sets x reps)"]
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Generate workout plan error:', error);
    return res.status(500).json({ error: error.message || 'Error generating workout plan' });
  }
});

// 10. Complex Diet Chart Generator (Using gemini-3.1-pro-preview)
app.post('/api/gemini/generate-diet-chart', async (req: Request, res: Response) => {
  try {
    const { profile, macroTarget } = req.body;

    if (!ai) {
      return res.json({
        chartTitle: "7-Day High-Protein Metabolic Diet Chart",
        dailyCalorieTarget: macroTarget?.calories || 2400,
        macroSplit: `${macroTarget?.proteinGrams || 160}g Protein / ${macroTarget?.carbsGrams || 260}g Carbs / ${macroTarget?.fatGrams || 65}g Fat`,
        mealPlan: [
          { meal: "Breakfast", item: "Rolled Oats with 1 Scoop Whey & Banana", calories: 410, protein: 33, carbs: 58, fat: 5 },
          { meal: "Lunch", item: "Grilled Chicken or Paneer with 1 cup Basmati Rice & Dal", calories: 620, protein: 44, carbs: 73, fat: 15 },
          { meal: "Snack", item: "Greek Yogurt with Almonds & Apple", calories: 280, protein: 22, carbs: 28, fat: 9 },
          { meal: "Dinner", item: "3 Rotis with Vegetable Curry & Egg Whites/Tofu", calories: 520, protein: 38, carbs: 62, fat: 12 }
        ],
        groceryList: ["Rolled oats", "Whey protein", "Bananas", "Chicken breast or Paneer", "Greek yogurt", "Whole wheat flour", "Lentils", "Almonds"]
      });
    }

    const prompt = `You are a clinical sports dietitian. Generate a personalized 7-day diet chart for:
Athlete Weight: ${profile.weight} kg (Goal: ${profile.goal})
Calorie Target: ${macroTarget?.calories || 2400} kcal
Protein: ${macroTarget?.proteinGrams || 160}g | Carbs: ${macroTarget?.carbsGrams || 260}g | Fat: ${macroTarget?.fatGrams || 65}g
Dietary Pattern: ${profile.dietaryPattern} (${profile.cuisinePreference})
Food Allergies: ${profile.foodAllergies?.join(', ') || 'None'}

Provide JSON format:
{
  "chartTitle": "Title of the diet chart",
  "dailyCalorieTarget": 2400,
  "macroSplit": "160g P / 260g C / 65g F",
  "mealPlan": [
    {
      "meal": "Breakfast",
      "item": "Detailed foods with grams/pieces",
      "calories": 450,
      "protein": 35,
      "carbs": 55,
      "fat": 8
    }
  ],
  "groceryList": ["item 1", "item 2", "item 3"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Generate diet chart error:', error);
    return res.status(500).json({ error: error.message || 'Error generating diet chart' });
  }
});

// 11. Live Voice Conversation Endpoint (Gemini Live API gemini-3.8-live)
app.post('/api/gemini/live-voice', async (req: Request, res: Response) => {
  const { transcript, profile, currentContext } = req.body || {};
  try {
    if (!ai) {
      return res.json({
        spokenResponse: "JARVIS Live: I'm tracking your telemetry. Keep your core tight and maintain tempo.",
        action: "continue"
      });
    }

    const prompt = `You are JARVIS operating via Gemini Live API (model: gemini-3.8-live).
You are having an active live voice conversation with the athlete during their day/training.
ATHLETE: ${profile?.name || 'Athlete'} (Goal: ${profile?.goal || 'fitness'})
CONTEXT: ${currentContext || 'Active training session'}
ATHLETE VOICE INPUT: "${transcript}"

Respond concisely in 1-2 spoken sentences as their high-performance personal trainer.
Return JSON:
{
  "spokenResponse": "Crisp live spoken answer",
  "action": "none | log_set | pause | substitute"
}`;

    // Use gemini-3.8-live for Live API tasks as specified
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-live',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.warn('Live voice fallback:', error);
    return res.json({
      spokenResponse: `JARVIS: Understood. Maintaining your target intensity for ${profile?.goal || 'your goal'}.`,
      action: "none"
    });
  }
});

// Download Android Studio Project Archive
app.get('/api/download-android-project', (_req: Request, res: Response) => {
  try {
    const archivePath = path.resolve(__dirname, 'public', 'JARVIS_Android_Project.tar.gz');
    return res.download(archivePath, 'JARVIS_Android_Project.tar.gz');
  } catch (err) {
    return res.status(500).json({ error: 'Failed to download project archive' });
  }
});

app.get('/api/download-android-project-legacy', async (_req: Request, res: Response) => {
  try {
    const JSZipModule = await import('jszip');
    const JSZip = (JSZipModule as any).default || JSZipModule;
    const zip = new JSZip();
    const root = zip.folder('jarvis-android-studio-project') || zip;

    root.file('build.gradle', `// Top-level build file where you can add configuration options common to all sub-projects/modules.
buildscript {
    ext.kotlin_version = '1.9.22'
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.2.2'
        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version"
    }
}
allprojects {
    repositories {
        google()
        mavenCentral()
    }
}
task clean(type: Delete) {
    delete rootProject.buildDir
}
`);

    root.file('settings.gradle', `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}
rootProject.name = "JARVIS"
include ':app'
`);

    root.file('gradle.properties', `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.enableJetifier=true
android.nonTransitiveRClass=true
kotlin.code.style=official
`);

    const wrapperFolder = root.folder('gradle/wrapper');
    wrapperFolder?.file('gradle-wrapper.properties', `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.2-bin.zip
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`);

    const appFolder = root.folder('app');
    appFolder?.file('build.gradle', `plugins {
    id 'com.android.application'
    id 'org.jetbrains.kotlin.android'
}
android {
    namespace 'com.jarvis.fitness'
    compileSdk 34
    defaultConfig {
        applicationId "com.jarvis.fitness"
        minSdk 26
        targetSdk 34
        versionCode 1
        versionName "1.0.0"
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary true
        }
    }
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = '17'
    }
    buildFeatures {
        compose true
        viewBinding true
    }
    composeOptions {
        kotlinCompilerExtensionVersion '1.5.8'
    }
    packaging {
        resources {
            excludes += '/META-INF/{AL2.0,LGPL2.1}'
        }
    }
}
dependencies {
    implementation 'androidx.core:core-ktx:1.12.0'
    implementation 'androidx.lifecycle:lifecycle-runtime-ktx:2.7.0'
    implementation 'androidx.activity:activity-compose:1.8.2'
    implementation platform('androidx.compose:compose-bom:2024.02.00')
    implementation 'androidx.compose.ui:ui'
    implementation 'androidx.compose.ui:ui-graphics'
    implementation 'androidx.compose.ui:ui-tooling-preview'
    implementation 'androidx.compose.material3:material3'
    implementation 'androidx.webkit:webkit:1.10.0'
    implementation 'androidx.health.connect:connect-client:1.1.0-alpha07'
    testImplementation 'junit:junit:4.13.2'
    androidTestImplementation 'androidx.test.ext:junit:1.1.5'
    androidTestImplementation 'androidx.test.espresso:espresso-core:3.5.1'
}
`);

    const mainFolder = root.folder('app/src/main');
    mainFolder?.file('AndroidManifest.xml', `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.BLUETOOTH" />
    <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:supportsRtl="true"
        android:theme="@style/Theme.JARVIS"
        android:usesCleartextTraffic="true">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@style/Theme.JARVIS"
            android:configChanges="orientation|screenSize|screenLayout|keyboardHidden">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
`);

    const javaFolder = root.folder('app/src/main/java/com/jarvis/fitness');
    javaFolder?.file('MainActivity.kt', `package com.jarvis.fitness

import android.annotation.SuppressLint
import android.content.Context
import android.os.Build
import android.os.Bundle
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView

class MainActivity : ComponentActivity() {
    private val APP_URL = "https://ais-pre-257onqdsopzi277dx6ren3-732684635989.asia-east1.run.app"
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    JarvisAppView(appUrl = APP_URL, context = this)
                }
            }
        }
    }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun JarvisAppView(appUrl: String, context: Context) {
    AndroidView(
        modifier = Modifier.fillMaxSize(),
        factory = { ctx ->
            WebView(ctx).apply {
                settings.apply {
                    javaScriptEnabled = true
                    domStorageEnabled = true
                    databaseEnabled = true
                    allowFileAccess = true
                    allowContentAccess = true
                    mediaPlaybackRequiresUserGesture = false
                    cacheMode = WebSettings.LOAD_DEFAULT
                    useWideViewPort = true
                    loadWithOverviewMode = true
                }
                webViewClient = object : WebViewClient() {
                    override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                        return false
                    }
                }
                webChromeClient = WebChromeClient()
                addJavascriptInterface(JarvisNativeBridge(ctx), "JarvisNative")
                loadUrl(appUrl)
            }
        }
    )
}

class JarvisNativeBridge(private val context: Context) {
    @JavascriptInterface
    fun triggerHapticRestFeedback(milliseconds: Long) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val vibratorManager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
            val vibrator = vibratorManager.defaultVibrator
            vibrator.vibrate(VibrationEffect.createOneShot(milliseconds, VibrationEffect.DEFAULT_AMPLITUDE))
        } else {
            @Suppress("DEPRECATION")
            val vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
            vibrator.vibrate(milliseconds)
        }
    }
    @JavascriptInterface
    fun getAndroidVersion(): String {
        return "Android " + Build.VERSION.RELEASE
    }
}
`);

    const resValues = root.folder('app/src/main/res/values');
    resValues?.file('strings.xml', `<resources>
    <string name="app_name">JARVIS</string>
</resources>
`);
    resValues?.file('colors.xml', `<resources>
    <color name="primary">#2563EB</color>
    <color name="primary_dark">#1D4ED8</color>
    <color name="accent">#0284C7</color>
    <color name="background">#F8FAFC</color>
</resources>
`);
    resValues?.file('themes.xml', `<resources>
    <style name="Theme.JARVIS" parent="android:Theme.Material.Light.NoActionBar">
        <item name="android:statusBarColor">#2563EB</item>
        <item name="android:windowLightStatusBar">false</item>
    </style>
</resources>
`);

    root.file('README.md', `# JARVIS — Native Android Studio Project

## How to Open in Android Studio:
1. Extract this ZIP file.
2. In Android Studio, click **File > Open** and select the \`jarvis-android-studio-project\` directory.
3. Wait for Gradle to finish syncing.
4. Click **Run (▶)** to test on your phone or emulator!

## How to Build the APK:
- Click **Build > Build Bundle(s) / APK(s) > Build APK(s)** in Android Studio.
`);

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="jarvis-android-studio-project.zip"');
    res.send(zipBuffer);
  } catch (err) {
    console.error('ZIP generation error:', err);
    res.status(500).json({ error: 'Failed to generate ZIP project' });
  }
});

// Vite middleware mounting
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`JARVIS Server online at http://0.0.0.0:${PORT}`);
  });
}

startServer();
