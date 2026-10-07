import { ExerciseDefinition } from '../types';

export const EXERCISE_LIBRARY: Record<string, ExerciseDefinition> = {
  // --- CHEST & HORIZONTAL PUSH ---
  barbell_bench_press: {
    id: 'barbell_bench_press',
    name: 'Barbell Flat Bench Press',
    targetMuscle: 'chest',
    secondaryMuscles: ['triceps', 'shoulders'],
    movementPattern: 'horizontal_push',
    requiredEquipment: ['barbells', 'gym'],
    tier: 'tier1_compound',
    setup: 'Retract and depress scapulae. Plant feet firmly flat on the floor. Grip the bar slightly wider than shoulder width.',
    execution: 'Unrack bar, stabilize over sternum. Lower with controlled descent in 3 seconds to lower-mid chest. Drive straight up locking triceps without losing shoulder tightness.',
    techniqueCues: [
      'Bend the bar slightly in your hands to activate lats',
      'Maintain steady leg drive throughout the concentric',
      'Keep wrists stacked vertically directly over elbows'
    ],
    commonMistakes: [
      'Bouncing the bar aggressively off the sternum',
      'Flaring elbows outward at a 90-degree angle causing anterior shoulder impingement',
      'Lifting glutes off the bench during heavy drive'
    ],
    tempo: '3-1-1-0',
    warmUpRecommended: true,
    youtubeId: 'rT7DgCr-3pg', // Gold standard bench tutorial
    substitutions: ['dumbbell_bench_press', 'machine_chest_press', 'weighted_pushups'],
    painContraindications: ['shoulder_impingement', 'wrist_pain']
  },

  dumbbell_bench_press: {
    id: 'dumbbell_bench_press',
    name: 'Dumbbell Flat Bench Press',
    targetMuscle: 'chest',
    secondaryMuscles: ['triceps', 'shoulders'],
    movementPattern: 'horizontal_push',
    requiredEquipment: ['dumbbells'],
    tier: 'tier1_compound',
    setup: 'Sit with dumbbells on thighs. Kick back smoothly into flat position, tucking elbows to 45 degrees.',
    execution: 'Press dumbbells vertically converging slightly at top without clanking. Lower down until chest reaches a deep active stretch.',
    techniqueCues: [
      'Neutral-to-semi-pronated wrist angle relieves AC joint pressure',
      'Control eccentric stretch for 3 seconds',
      'Keep shoulder blades packed against bench'
    ],
    commonMistakes: [
      'Dropping elbows too deep past active glenohumeral range',
      'Rushing the turn-around at bottom'
    ],
    tempo: '3-0-1-0',
    warmUpRecommended: true,
    youtubeId: 'VmB1G1K7v94',
    substitutions: ['machine_chest_press', 'weighted_pushups', 'incline_dumbbell_press'],
    painContraindications: ['severe_shoulder_pain']
  },

  incline_dumbbell_press: {
    id: 'incline_dumbbell_press',
    name: 'Incline Dumbbell Press (30°)',
    targetMuscle: 'chest',
    secondaryMuscles: ['shoulders', 'triceps'],
    movementPattern: 'horizontal_push',
    requiredEquipment: ['dumbbells'],
    tier: 'tier2_accessory',
    setup: 'Set bench to low 30-degree incline. Pin shoulders down into bench.',
    execution: 'Press toward the clavicles, keeping wrists stacked. Lower under control feeling upper pectoral fibers stretch.',
    techniqueCues: [
      'Avoid high 60-degree angles which overload anterior deltoids',
      'Squeeze upper chest at top peak contraction'
    ],
    commonMistakes: ['Arching lower back off the pad excessively'],
    tempo: '3-1-1-0',
    warmUpRecommended: false,
    youtubeId: '8iPEnn-ltC8',
    substitutions: ['dumbbell_bench_press', 'machine_chest_press'],
    painContraindications: ['shoulder_impingement']
  },

  machine_chest_press: {
    id: 'machine_chest_press',
    name: 'Converging Machine Chest Press',
    targetMuscle: 'chest',
    secondaryMuscles: ['triceps', 'shoulders'],
    movementPattern: 'horizontal_push',
    requiredEquipment: ['machines', 'gym'],
    tier: 'tier2_accessory',
    setup: 'Adjust seat height so handles align with mid-chest line.',
    execution: 'Press smoothly forward through the machine track. Squeeze chest for 1 second, control return slowly.',
    techniqueCues: ['Fix scapulae tight against back pad', 'Focus strictly on chest contraction'],
    commonMistakes: ['Allowing weight stack to slam at bottom'],
    tempo: '3-1-1-0',
    warmUpRecommended: false,
    youtubeId: 'xUm0BiZCWlQ',
    substitutions: ['dumbbell_bench_press', 'weighted_pushups'],
    painContraindications: []
  },

  weighted_pushups: {
    id: 'weighted_pushups',
    name: 'Push-Up (Deficit / Weighted)',
    targetMuscle: 'chest',
    secondaryMuscles: ['triceps', 'core', 'shoulders'],
    movementPattern: 'horizontal_push',
    requiredEquipment: ['bodyweight', 'home'],
    tier: 'tier2_accessory',
    setup: 'Plank position with hands slightly wider than shoulders. Core braced, glutes locked.',
    execution: 'Descend until chest touches floor or block. Press back up maintaining rigid torso line.',
    techniqueCues: ['Draw belly button inwards', 'Elbows tucked to 45 degrees'],
    commonMistakes: ['Sagging lumbar spine', 'Forward neck poke'],
    tempo: '2-1-1-0',
    warmUpRecommended: false,
    youtubeId: 'IODxDxX7oi4',
    substitutions: ['machine_chest_press', 'dumbbell_bench_press'],
    painContraindications: ['wrist_pain']
  },

  // --- BACK & HORIZONTAL/VERTICAL PULL ---
  barbell_deadlift: {
    id: 'barbell_deadlift',
    name: 'Conventional Barbell Deadlift',
    targetMuscle: 'back',
    secondaryMuscles: ['hamstrings', 'glutes', 'core'],
    movementPattern: 'hinge',
    requiredEquipment: ['barbells', 'gym'],
    tier: 'tier1_compound',
    setup: 'Bar over midfoot. Grip just outside shins. Pull chest tall, engage lats like bending bar around shins.',
    execution: 'Push floor away through heels and midfoot. Hinge hips through to lockout. Reverse hip hinge on descent.',
    techniqueCues: [
      'Take the slack out of the bar before pushing the floor away',
      'Keep lats clamped into back pockets',
      'Hips and chest rise at identical rates from the floor'
    ],
    commonMistakes: [
      'Rounding the lumbar spine under load',
      'Jerking the bar off the floor without lat pre-tension',
      'Hyperextending lumbar spine at top'
    ],
    tempo: '2-1-1-0',
    warmUpRecommended: true,
    youtubeId: 'op9kVnSso6Q',
    substitutions: ['romanian_deadlift', 'trap_bar_deadlift', 'single_arm_dumbbell_row'],
    painContraindications: ['acute_lower_back_pain', 'disc_herniation']
  },

  romanian_deadlift: {
    id: 'romanian_deadlift',
    name: 'Dumbbell / Barbell Romanian Deadlift (RDL)',
    targetMuscle: 'hamstrings',
    secondaryMuscles: ['glutes', 'back', 'core'],
    movementPattern: 'hinge',
    requiredEquipment: ['dumbbells', 'barbells'],
    tier: 'tier1_compound',
    setup: 'Stand tall with dumbbells in front of thighs. Soft bend in knees that remains fixed throughout.',
    execution: 'Push pelvis straight back toward the wall. Lower weights along shins until maximal hamstring stretch.',
    techniqueCues: [
      'Think hips back, not bending over forward',
      'Keep weights grazing your legs the entire trajectory',
      'Contract glutes to lock hips at top'
    ],
    commonMistakes: ['Bending knees further as you descend turning it into a squat', 'Looking up and straining neck'],
    tempo: '3-1-1-0',
    warmUpRecommended: true,
    youtubeId: 'jEy_czb3RKA',
    substitutions: ['leg_curl_seated', 'barbell_deadlift'],
    painContraindications: ['acute_lower_back_pain']
  },

  chest_supported_row: {
    id: 'chest_supported_row',
    name: 'Chest-Supported Incline Row',
    targetMuscle: 'back',
    secondaryMuscles: ['biceps', 'shoulders'],
    movementPattern: 'horizontal_pull',
    requiredEquipment: ['dumbbells', 'gym'],
    tier: 'tier2_accessory',
    setup: 'Lay prone on 30-45 degree incline bench with dumbbells hanging freely.',
    execution: 'Retract shoulder blades and row elbows back toward hips. Squeeze lats and rhomboids at top peak.',
    techniqueCues: [
      'Zero lower back strain since torso is fully supported',
      'Pull toward hip pocket, not upward toward ears'
    ],
    commonMistakes: ['Lifting chest off the pad', 'Using excessive momentum'],
    tempo: '2-1-1-1',
    warmUpRecommended: false,
    youtubeId: '0UBRfiO4zDs',
    substitutions: ['single_arm_dumbbell_row', 'lat_pulldown'],
    painContraindications: []
  },

  lat_pulldown: {
    id: 'lat_pulldown',
    name: 'Lat Pulldown (Neutral / Wide Grip)',
    targetMuscle: 'back',
    secondaryMuscles: ['biceps'],
    movementPattern: 'vertical_pull',
    requiredEquipment: ['cables', 'machines', 'gym'],
    tier: 'tier2_accessory',
    setup: 'Thighs locked under knee pads. Grasp handle with shoulder-width or wide grip.',
    execution: 'Depress shoulders first. Pull bar down toward upper chest driving elbows down and back.',
    techniqueCues: ['Lead with elbows, not wrists', 'Keep slight 10-degree torso lean'],
    commonMistakes: ['Swinging torso excessively backwards', 'Pulling bar behind neck'],
    tempo: '3-0-1-1',
    warmUpRecommended: false,
    youtubeId: 'CAwf7n6Luuc',
    substitutions: ['pull_ups', 'chest_supported_row'],
    painContraindications: []
  },

  pull_ups: {
    id: 'pull_ups',
    name: 'Pull-Up / Chin-Up (Bodyweight)',
    targetMuscle: 'back',
    secondaryMuscles: ['biceps', 'core'],
    movementPattern: 'vertical_pull',
    requiredEquipment: ['bodyweight', 'gym', 'home'],
    tier: 'tier1_compound',
    setup: 'Hang with full arm extension. Hollow body core engagement.',
    execution: 'Initiate by pulling shoulder blades down. Drive elbows down until chin clears bar.',
    techniqueCues: ['Full dead hang at bottom for complete lat stretch', 'Avoid kipping'],
    commonMistakes: ['Half reps cutting the bottom range', 'Excessive neck reach'],
    tempo: '3-0-1-0',
    warmUpRecommended: true,
    youtubeId: 'eGo4IYlbE5g',
    substitutions: ['lat_pulldown', 'chest_supported_row'],
    painContraindications: ['elbow_tendonitis']
  },

  // --- LEGS & SQUAT / LUNGE ---
  barbell_back_squat: {
    id: 'barbell_back_squat',
    name: 'Barbell Back Squat',
    targetMuscle: 'quadriceps',
    secondaryMuscles: ['glutes', 'hamstrings', 'core'],
    movementPattern: 'squat',
    requiredEquipment: ['barbells', 'gym'],
    tier: 'tier1_compound',
    setup: 'Bar resting on upper traps (high bar) or rear delts (low bar). Feet shoulder-width, toes turned 15-30 degrees out.',
    execution: 'Take deep diaphragmatic breath into abdomen. Break at hips and knees simultaneously. Descend to parallel or below. Drive up through full foot.',
    techniqueCues: [
      'Spread the floor with feet to engage gluteus medius',
      'Keep chest tall and elbows pinned under bar',
      'Knees track cleanly in line with toes'
    ],
    commonMistakes: [
      'Knee valgus collapse (knees caving inward under load)',
      'Rounding lower spine at bottom (butt wink under fatigue)',
      'Shifting weight onto toes lifting heels'
    ],
    tempo: '3-1-1-0',
    warmUpRecommended: true,
    youtubeId: 'bEv6CCg2BC8',
    substitutions: ['goblet_squat', 'leg_press', 'bulgarian_split_squat'],
    painContraindications: ['acute_knee_pain', 'lower_back_pain']
  },

  goblet_squat: {
    id: 'goblet_squat',
    name: 'Dumbbell / Kettlebell Goblet Squat',
    targetMuscle: 'quadriceps',
    secondaryMuscles: ['glutes', 'core'],
    movementPattern: 'squat',
    requiredEquipment: ['dumbbells', 'kettlebells', 'home'],
    tier: 'tier2_accessory',
    setup: 'Hold dumbbell vertically cupped against upper chest. Stand shoulder-width apart.',
    execution: 'Squat between legs, elbows grazing inside of knees at bottom depth. Stand tall squeezing glutes.',
    techniqueCues: ['Upright torso naturally enforced by anterior load', 'Deep hip mobility focus'],
    commonMistakes: ['Letting weight drift away from sternum'],
    tempo: '3-1-1-0',
    warmUpRecommended: false,
    youtubeId: 'MeIiIdhvXT4',
    substitutions: ['barbell_back_squat', 'leg_press', 'bulgarian_split_squat'],
    painContraindications: []
  },

  leg_press: {
    id: 'leg_press',
    name: '45° Incline Leg Press',
    targetMuscle: 'quadriceps',
    secondaryMuscles: ['glutes', 'hamstrings'],
    movementPattern: 'squat',
    requiredEquipment: ['machines', 'gym'],
    tier: 'tier2_accessory',
    setup: 'Back and sacrum glued firmly to pad. Feet mid-platform shoulder width.',
    execution: 'Lower sled until knees reach 90 degrees without sacrum peeling off pad. Press through whole foot.',
    techniqueCues: ['Never lock out knees aggressively at top', 'Sacrum stays glued to backrest'],
    commonMistakes: ['Allowing lower back to curl up off seat at bottom'],
    tempo: '3-1-1-0',
    warmUpRecommended: false,
    youtubeId: 'IZxyjW7MPJQ',
    substitutions: ['goblet_squat', 'bulgarian_split_squat'],
    painContraindications: ['sacroiliac_joint_irritation']
  },

  bulgarian_split_squat: {
    id: 'bulgarian_split_squat',
    name: 'Bulgarian Split Squat',
    targetMuscle: 'quadriceps',
    secondaryMuscles: ['glutes', 'hamstrings'],
    movementPattern: 'lunge',
    requiredEquipment: ['dumbbells', 'bodyweight', 'home'],
    tier: 'tier2_accessory',
    setup: 'Rear foot elevated on bench behind you. Front foot 2-3 feet ahead.',
    execution: 'Lower down and slightly back until rear knee nearly taps floor. Drive up through front heel and midfoot.',
    techniqueCues: ['Torso slight forward lean for glute recruitment', '85% of weight on front working leg'],
    commonMistakes: ['Stance too cramped stressing front knee joint'],
    tempo: '3-0-1-0',
    warmUpRecommended: false,
    youtubeId: '2C-uNgKwPLE',
    substitutions: ['goblet_squat', 'leg_press', 'walking_lunges'],
    painContraindications: ['patellar_tendonitis']
  },

  // --- SHOULDERS & VERTICAL PUSH ---
  overhead_press: {
    id: 'overhead_press',
    name: 'Standing Barbell Overhead Press (OHP)',
    targetMuscle: 'shoulders',
    secondaryMuscles: ['triceps', 'core'],
    movementPattern: 'vertical_push',
    requiredEquipment: ['barbells', 'gym'],
    tier: 'tier1_compound',
    setup: 'Grip bar just outside shoulders at collarbone. Squeeze glutes and brace core tightly.',
    execution: 'Press bar vertically, moving head slightly back to clear chin, then pushing head through window once locked out overhead.',
    techniqueCues: [
      'Rock-solid glute contraction prevents lower back arch',
      'Lock out with active shrug at the very top'
    ],
    commonMistakes: ['Leaning backward excessively turning it into an incline press', 'Pressing bar out in front'],
    tempo: '2-1-1-0',
    warmUpRecommended: true,
    youtubeId: '2yjwXTZQDDI',
    substitutions: ['seated_dumbbell_shoulder_press', 'lateral_raises'],
    painContraindications: ['shoulder_impingement', 'lower_back_pain']
  },

  seated_dumbbell_shoulder_press: {
    id: 'seated_dumbbell_shoulder_press',
    name: 'Seated Dumbbell Shoulder Press',
    targetMuscle: 'shoulders',
    secondaryMuscles: ['triceps'],
    movementPattern: 'vertical_push',
    requiredEquipment: ['dumbbells'],
    tier: 'tier2_accessory',
    setup: 'Set bench to 75-80 degrees. Hold dumbbells at ear level with slight 30-degree inward elbow angle.',
    execution: 'Press overhead smoothly. Stop just shy of touching dumbbells together. Lower with control.',
    techniqueCues: ['Elbows slightly forward in scapular plane', 'Feet planted for stability'],
    commonMistakes: ['Flaring elbows 180 degrees sideways'],
    tempo: '3-0-1-0',
    warmUpRecommended: false,
    youtubeId: 'qEwKCR5JCog',
    substitutions: ['overhead_press', 'lateral_raises'],
    painContraindications: ['shoulder_impingement']
  },

  lateral_raises: {
    id: 'lateral_raises',
    name: 'Dumbbell / Cable Lateral Raise',
    targetMuscle: 'shoulders',
    secondaryMuscles: [],
    movementPattern: 'isolation',
    requiredEquipment: ['dumbbells', 'cables'],
    tier: 'tier3_isolation',
    setup: 'Slight hinge forward (15 degrees). Dumbbells at side with soft elbow bend.',
    execution: 'Raise arms out to 90 degrees in the scapular plane (slightly forward of torso). Lead with elbows.',
    techniqueCues: ['Think of pushing hands away toward the walls', 'Pause for a microsecond at the top'],
    commonMistakes: ['Shrugging traps up to ears', 'Swinging torso for momentum'],
    tempo: '2-1-1-1',
    warmUpRecommended: false,
    youtubeId: '3VcKaXpzqRo',
    substitutions: ['cable_face_pull'],
    painContraindications: []
  },

  // --- ARMS & ISOLATION ---
  barbell_biceps_curl: {
    id: 'barbell_biceps_curl',
    name: 'Barbell / EZ-Bar Biceps Curl',
    targetMuscle: 'biceps',
    secondaryMuscles: [],
    movementPattern: 'isolation',
    requiredEquipment: ['barbells', 'dumbbells'],
    tier: 'tier3_isolation',
    setup: 'Supinated grip shoulder width. Elbows pinned at sides.',
    execution: 'Curl bar up squeezing biceps without swinging shoulders forward. Lower down for full stretch.',
    techniqueCues: ['Keep wrists neutral', 'Full extension at the bottom of every rep'],
    commonMistakes: ['Throwing lower back into the curl'],
    tempo: '2-1-1-0',
    warmUpRecommended: false,
    youtubeId: 'kwG2ipFRgfo',
    substitutions: ['incline_dumbbell_curl', 'cable_hammer_curl'],
    painContraindications: []
  },

  triceps_rope_pushdown: {
    id: 'triceps_rope_pushdown',
    name: 'Cable Triceps Rope Pushdown',
    targetMuscle: 'triceps',
    secondaryMuscles: [],
    movementPattern: 'isolation',
    requiredEquipment: ['cables', 'machines'],
    tier: 'tier3_isolation',
    setup: 'Stand tall with slight forward lean. Elbows fixed at ribs.',
    execution: 'Extend arms down, spreading the rope apart at the bottom to maximize lateral triceps head recruitment.',
    techniqueCues: ['Elbows remain like hinges fixed in space', 'Control the 3-second negative'],
    commonMistakes: ['Letting elbows drift forward during eccentric'],
    tempo: '3-0-1-1',
    warmUpRecommended: false,
    youtubeId: 'vB5OHsJ3EME',
    substitutions: ['overhead_triceps_extension'],
    painContraindications: ['elbow_tendonitis']
  },

  // --- CORE & MOBILITY ---
  hanging_knee_raises: {
    id: 'hanging_knee_raises',
    name: 'Hanging Leg / Knee Raise',
    targetMuscle: 'core',
    secondaryMuscles: [],
    movementPattern: 'core',
    requiredEquipment: ['bodyweight', 'gym'],
    tier: 'tier3_isolation',
    setup: 'Hang from bar with active shoulders. Feet together.',
    execution: 'Roll pelvis upward curling knees toward chest. Lower down with steady tempo without swinging.',
    techniqueCues: ['Curl pelvis, do not just flex hip flexors', 'Zero momentum swing'],
    commonMistakes: ['Arching back at bottom to swing legs up'],
    tempo: '2-1-1-1',
    warmUpRecommended: false,
    youtubeId: 'RD_A-Z15Er4',
    substitutions: ['ab_wheel_rollout', 'plank'],
    painContraindications: []
  },

  cable_face_pull: {
    id: 'cable_face_pull',
    name: 'Cable Face Pull (External Rotation)',
    targetMuscle: 'shoulders',
    secondaryMuscles: ['back'],
    movementPattern: 'horizontal_pull',
    requiredEquipment: ['cables', 'resistance_bands'],
    tier: 'tier3_isolation',
    setup: 'Pulley set to eye level. Hold rope with thumbs facing backward.',
    execution: 'Pull toward eyes, rotating hands up and out into a double bicep flex pose at peak contraction.',
    techniqueCues: ['Scapular retraction plus external rotation for rotator cuff health', 'Keep elbows high'],
    commonMistakes: ['Rushing through without holding external rotation'],
    tempo: '2-1-1-2',
    warmUpRecommended: false,
    youtubeId: 'rep-qVOkqgk',
    substitutions: ['lateral_raises'],
    painContraindications: []
  }
};
