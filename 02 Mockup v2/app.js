function getTodayReferenceDate() {
  const now = new Date();
  now.setHours(18, 30, 0, 0);
  return now;
}

const TODAY = getTodayReferenceDate();
const DAY_MS = 24 * 60 * 60 * 1000;
const LOAD_MAX = 36;
const ROLLING_LOAD_DAYS = 7;
const BASELINE_LOAD_DAYS = 28;
const BODY_MAP_VISIBLE_THRESHOLD = 0.32;
const TOP_ZONE_THRESHOLD = 0.2;
const POSITIVE_SLOPE_THRESHOLD = 0.04;
const BODY_ASSET_DISPLAY_THRESHOLD = 0.1;
const BODY_ASSET_DISPLAY_GAMMA = 1.1;
const BODY_ASSET_AT_RISK_MIN_DAYS = 4;
const BODY_ASSET_AT_RISK_MAX_DAYS = 7;
const BODY_ASSET_AT_RISK_THRESHOLD = 0.12;
const BODY_ASSET_FADE_MEMORY_THRESHOLD = 0.03;
const DEFAULT_HRX_FORMAT = "HRX Core";
const HIDDEN_RECOMMENDATION_FORMATS = new Set(["HRX"]);
const PLAN_ITEM_FORMAT_OPTIONS = {
  "Gym: Full body": ["Gym Full body"],
  "Gym: Upper": ["Gym Upper"],
  "Gym: Lower": ["Gym Lower"],
  "Gym: Legs": ["Gym Legs", "Gym Lower"],
  "Gym: Chest+Tri": ["Gym Chest+Tri"],
  "Gym: Back+Bicep": ["Gym Back+Bicep"],
  "Gym: Shoulders+Core": ["Gym Shoulders+Core"],
};

const BODY_ASSET_LIBRARY = {
  shoulders: { shoulders: 1 },
  arms: { arms: 1, shoulders: 0.16 },
  chest: { chest: 1, shoulders: 0.12 },
  core: { core: 1 },
  back: { back: 1, core: 0.16 },
  legs: { quads: 1, glutes: 0.96, hamstrings: 0.92, calves: 0.82 },
};
const ANATOMICAL_ZONES = new Set([
  "shoulders",
  "arms",
  "chest",
  "core",
  "back",
  "glutes",
  "quads",
  "hamstrings",
  "calves",
]);

const GOAL_LIBRARY = {
  weight_loss: {
    label: "Lose weight",
    description: "Burn body fat with a routine you can actually repeat.",
    baseRange: [15, 20],
    intent: "Build a repeatable calorie-burning routine with enough recovery to stay consistent.",
  },
  strength: {
    label: "Build strength",
    description: "Get stronger with regular strength-focused work.",
    baseRange: [16, 22],
    intent: "Prioritize progressive overload and recovery rhythm.",
  },
  general_fitness: {
    label: "Stay fit",
    description: "Build a balanced routine across strength, cardio, and recovery.",
    baseRange: [13, 18],
    intent: "Balance strength, conditioning, and recovery without overreaching.",
  },
};

const FREQUENCY_LIBRARY = {
  2: { label: "2 days", description: "A low-friction start for a busy week.", modifier: -4 },
  3: { label: "3 days", description: "A lighter but realistic week.", modifier: -2 },
  4: { label: "4 days", description: "Default demo rhythm.", modifier: 0 },
  5: { label: "5 days", description: "A more ambitious training week.", modifier: 3 },
};

const LEVEL_LIBRARY = {
  beginner: {
    label: "First time / little recent training",
    description: "Keep the first week simple and build confidence fast.",
    modifier: -3,
  },
  restarting: {
    label: "Restarting after a break",
    description: "Get the rhythm back before pushing intensity again.",
    modifier: -1,
  },
  regular: {
    label: "Already working out regularly",
    description: "Use a little more structure and a higher target zone.",
    modifier: 2,
  },
};

const SPLIT_LIBRARY = {
  full_body: {
    label: "Full body",
    description: "Simple, broad coverage across the whole week.",
  },
  upper_lower: {
    label: "Upper / lower",
    description: "Alternate upper-body and lower-body focus days.",
  },
  two_muscles: {
    label: "Two muscles per day",
    description: "A more focused split for regular strength users.",
  },
};

const TRAINING_MODE_LIBRARY = {
  gx_only: {
    label: "Group Classes only",
    description: "Stick to guided group classes only.",
  },
  gym_only: {
    label: "Gym only",
    description: "Build the week around self-directed gym sessions.",
  },
  suggested_mix: {
    label: "Suggested mix",
    description: "Use the best balance of Group Classes and gym for this goal.",
  },
};

const SUPPORT_LIBRARY = {
  center_consult: {
    label: "Talk to a coach at a nearby center",
    description: "Use an in-person goal-setting conversation if the member wants help locking the routine in.",
  },
  bca: {
    label: "Schedule a BCA report check",
    description: "Book a nearby cult center visit to get a baseline body-composition read.",
  },
};

const TARGET_STATUS_LABELS = {
  below: "Below target",
  in_range: "In target",
  above: "Above target",
};

const RELATIVE_STATE_LABELS = {
  well_below: "Well below usual",
  below: "Below usual",
  in_range: "In line with usual",
  above: "Above usual",
  well_above: "Well above usual",
  building: "Building your rhythm",
};

const EFFORT_BAND_LIBRARY = [
  {
    key: "light",
    maxLoad: 4.49,
    label: "Light",
    headline: "Light effort",
    description: "A lighter session that keeps your rhythm going.",
    className: "is-light",
  },
  {
    key: "moderate",
    maxLoad: 6.24,
    label: "Moderate",
    headline: "Moderate effort",
    description: "A solid session that moves the week forward.",
    className: "is-moderate",
  },
  {
    key: "high",
    maxLoad: 7.74,
    label: "High",
    headline: "High effort",
    description: "A strong push that meaningfully builds momentum.",
    className: "is-high",
  },
  {
    key: "very_high",
    maxLoad: Number.POSITIVE_INFINITY,
    label: "Very high",
    headline: "Very high effort",
    description: "A very demanding session. Recovery matters before the next hard push.",
    className: "is-very-high",
  },
];

const FORMAT_LIBRARY = {
  Yoga: {
    intensity: 3,
    defaultDurationMinutes: 45,
    modalityFactor: 1.02,
    defaultEffortFactor: 0.08,
    zoneWeights: {
      hamstrings: 0.95,
      core: 0.75,
      back: 0.7,
      shoulders: 0.35,
      glutes: 0.3,
    },
  },
  Boxing: {
    intensity: 7,
    defaultDurationMinutes: 45,
    modalityFactor: 1.06,
    defaultEffortFactor: 0.12,
    zoneWeights: {
      shoulders: 1,
      arms: 0.95,
      core: 0.75,
      cardio: 0.95,
      chest: 0.45,
      back: 0.25,
    },
  },
  "HRX Chest": {
    intensity: 8,
    defaultDurationMinutes: 50,
    modalityFactor: 1.12,
    defaultEffortFactor: 0.13,
    zoneWeights: {
      chest: 1,
      shoulders: 0.38,
      arms: 0.34,
      core: 0.22,
      cardio: 0.62,
    },
  },
  "HRX Back": {
    intensity: 8,
    defaultDurationMinutes: 50,
    modalityFactor: 1.12,
    defaultEffortFactor: 0.13,
    zoneWeights: {
      back: 1,
      shoulders: 0.34,
      arms: 0.28,
      core: 0.22,
      cardio: 0.62,
    },
  },
  "HRX Arms": {
    intensity: 8,
    defaultDurationMinutes: 45,
    modalityFactor: 1.1,
    defaultEffortFactor: 0.13,
    zoneWeights: {
      arms: 1,
      shoulders: 0.26,
      chest: 0.18,
      core: 0.16,
      cardio: 0.58,
    },
  },
  "HRX Shoulders": {
    intensity: 8,
    defaultDurationMinutes: 45,
    modalityFactor: 1.1,
    defaultEffortFactor: 0.13,
    zoneWeights: {
      shoulders: 1,
      arms: 0.24,
      chest: 0.18,
      back: 0.16,
      cardio: 0.58,
    },
  },
  "HRX Core": {
    intensity: 8,
    defaultDurationMinutes: 45,
    modalityFactor: 1.08,
    defaultEffortFactor: 0.12,
    zoneWeights: {
      core: 1,
      back: 0.26,
      shoulders: 0.16,
      glutes: 0.14,
      cardio: 0.52,
    },
  },
  "HRX Glutes": {
    intensity: 8,
    defaultDurationMinutes: 50,
    modalityFactor: 1.12,
    defaultEffortFactor: 0.13,
    zoneWeights: {
      glutes: 1,
      quads: 0.34,
      hamstrings: 0.28,
      calves: 0.14,
      cardio: 0.62,
    },
  },
  "HRX Quads": {
    intensity: 8,
    defaultDurationMinutes: 50,
    modalityFactor: 1.12,
    defaultEffortFactor: 0.13,
    zoneWeights: {
      quads: 1,
      glutes: 0.3,
      calves: 0.22,
      core: 0.16,
      cardio: 0.62,
    },
  },
  "HRX Hamstrings": {
    intensity: 8,
    defaultDurationMinutes: 50,
    modalityFactor: 1.12,
    defaultEffortFactor: 0.13,
    zoneWeights: {
      hamstrings: 1,
      glutes: 0.34,
      calves: 0.18,
      core: 0.14,
      cardio: 0.6,
    },
  },
  "HRX Calves": {
    intensity: 7,
    defaultDurationMinutes: 40,
    modalityFactor: 1.08,
    defaultEffortFactor: 0.12,
    zoneWeights: {
      calves: 1,
      quads: 0.18,
      hamstrings: 0.16,
      cardio: 0.56,
    },
  },
  HRX: {
    intensity: 8,
    defaultDurationMinutes: 50,
    modalityFactor: 1.12,
    defaultEffortFactor: 0.13,
    zoneWeights: {
      quads: 1,
      glutes: 0.85,
      core: 0.8,
      shoulders: 0.55,
      cardio: 0.7,
      calves: 0.35,
      arms: 0.2,
    },
  },
  "Strength & Conditioning": {
    intensity: 7,
    defaultDurationMinutes: 50,
    modalityFactor: 1.17,
    defaultEffortFactor: 0.11,
    zoneWeights: {
      back: 0.8,
      glutes: 0.75,
      quads: 0.65,
      arms: 0.6,
      chest: 0.5,
      core: 0.35,
    },
  },
  Burn: {
    intensity: 6,
    defaultDurationMinutes: 45,
    modalityFactor: 1.08,
    defaultEffortFactor: 0.11,
    zoneWeights: {
      shoulders: 0.58,
      arms: 0.46,
      chest: 0.42,
      back: 0.48,
      core: 0.72,
      quads: 0.62,
      glutes: 0.56,
      hamstrings: 0.38,
      calves: 0.26,
      cardio: 0.85,
    },
  },
  "Gym Full body": {
    intensity: 6,
    defaultDurationMinutes: 50,
    modalityFactor: 1.08,
    defaultEffortFactor: 0.1,
    zoneWeights: {
      shoulders: 0.46,
      arms: 0.38,
      chest: 0.44,
      back: 0.46,
      core: 0.34,
      glutes: 0.44,
      quads: 0.52,
      hamstrings: 0.38,
      calves: 0.2,
    },
  },
  "Gym Upper": {
    intensity: 6,
    defaultDurationMinutes: 50,
    modalityFactor: 1.08,
    defaultEffortFactor: 0.1,
    zoneWeights: {
      back: 0.8,
      chest: 0.72,
      shoulders: 0.7,
      arms: 0.62,
      core: 0.2,
    },
  },
  "Gym Lower": {
    intensity: 6,
    defaultDurationMinutes: 50,
    modalityFactor: 1.08,
    defaultEffortFactor: 0.1,
    zoneWeights: {
      quads: 0.92,
      glutes: 0.84,
      hamstrings: 0.72,
      calves: 0.38,
      core: 0.16,
    },
  },
  "Gym Chest": {
    intensity: 5,
    defaultDurationMinutes: 45,
    modalityFactor: 1.02,
    defaultEffortFactor: 0.09,
    zoneWeights: {
      chest: 1,
      shoulders: 0.34,
      arms: 0.3,
    },
  },
  "Gym Back": {
    intensity: 5,
    defaultDurationMinutes: 45,
    modalityFactor: 1.02,
    defaultEffortFactor: 0.09,
    zoneWeights: {
      back: 1,
      arms: 0.28,
      shoulders: 0.22,
      core: 0.14,
    },
  },
  "Gym Arms": {
    intensity: 4,
    defaultDurationMinutes: 40,
    modalityFactor: 0.98,
    defaultEffortFactor: 0.08,
    zoneWeights: {
      arms: 1,
      shoulders: 0.18,
      chest: 0.08,
    },
  },
  "Gym Shoulders": {
    intensity: 5,
    defaultDurationMinutes: 40,
    modalityFactor: 1,
    defaultEffortFactor: 0.09,
    zoneWeights: {
      shoulders: 1,
      arms: 0.18,
      chest: 0.1,
      back: 0.1,
    },
  },
  "Gym Legs": {
    intensity: 6,
    defaultDurationMinutes: 50,
    modalityFactor: 1.08,
    defaultEffortFactor: 0.1,
    zoneWeights: {
      quads: 0.95,
      glutes: 0.86,
      hamstrings: 0.74,
      calves: 0.42,
    },
  },
  "Gym Core": {
    intensity: 4,
    defaultDurationMinutes: 35,
    modalityFactor: 0.94,
    defaultEffortFactor: 0.08,
    zoneWeights: {
      core: 1,
      back: 0.22,
    },
  },
  "Gym Chest+Tri": {
    intensity: 5,
    defaultDurationMinutes: 45,
    modalityFactor: 1.02,
    defaultEffortFactor: 0.09,
    zoneWeights: {
      chest: 1,
      arms: 0.48,
      shoulders: 0.28,
      core: 0.1,
    },
  },
  "Gym Back+Bicep": {
    intensity: 5,
    defaultDurationMinutes: 45,
    modalityFactor: 1.02,
    defaultEffortFactor: 0.09,
    zoneWeights: {
      back: 1,
      arms: 0.44,
      shoulders: 0.22,
      core: 0.12,
    },
  },
  "Gym Shoulders+Core": {
    intensity: 5,
    defaultDurationMinutes: 40,
    modalityFactor: 1,
    defaultEffortFactor: 0.09,
    zoneWeights: {
      shoulders: 0.92,
      core: 0.74,
      arms: 0.18,
      back: 0.14,
    },
  },
};

const LOG_WORKOUT_SOURCE_LIBRARY = {
  group_class: {
    label: "Class",
    description: "Coach-led workout",
  },
  gym: {
    label: "Gym",
    description: "Self-directed workout",
  },
};

const LOG_WORKOUT_TYPE_LIBRARY = {
  group_class: {
    hrx: { label: "HRX", description: "High intensity" },
    burn: { label: "Burn", description: "Cardio conditioning" },
    strength_conditioning: { label: "S&C", description: "Full-body strength" },
    boxing: { label: "Boxing", description: "Cardio + upper body" },
    yoga: { label: "Yoga", description: "Recovery + mobility" },
  },
  gym: {
    full_body: { label: "Full body", description: "Balanced strength session" },
    upper_lower: { label: "Upper / lower", description: "Broad strength split" },
    split_day: { label: "Split day", description: "Two target areas" },
    focused: { label: "Focused muscle", description: "One target area" },
  },
};

const LOG_WORKOUT_MUSCLE_LIBRARY = {
  group_class: {
    hrx: {
      chest: { label: "Chest", format: "HRX Chest" },
      back: { label: "Back", format: "HRX Back" },
      arms: { label: "Arms", format: "HRX Arms" },
      shoulders: { label: "Shoulders", format: "HRX Shoulders" },
      core: { label: "Core", format: "HRX Core" },
      lower_body: { label: "Lower body", format: "HRX Quads" },
    },
  },
  gym: {
    full_body: {
      full_body: { label: "Full body", format: "Gym Full body" },
    },
    upper_lower: {
      upper: { label: "Upper body", format: "Gym Upper" },
      lower: { label: "Lower body", format: "Gym Lower" },
    },
    split_day: {
      chest_tri: { label: "Chest + triceps", format: "Gym Chest+Tri" },
      back_bicep: { label: "Back + biceps", format: "Gym Back+Bicep" },
      shoulders_core: { label: "Shoulders + core", format: "Gym Shoulders+Core" },
    },
    focused: {
      chest: { label: "Chest", format: "Gym Chest" },
      back: { label: "Back", format: "Gym Back" },
      arms: { label: "Arms", format: "Gym Arms" },
      shoulders: { label: "Shoulders", format: "Gym Shoulders" },
      legs: { label: "Legs", format: "Gym Legs" },
      core: { label: "Core", format: "Gym Core" },
    },
  },
};

const ZONE_COPY_LABELS = {
  shoulders: "shoulders",
  arms: "arms",
  chest: "chest",
  core: "core",
  back: "back",
  glutes: "glutes",
  quads: "quads",
  hamstrings: "hamstrings",
  calves: "calves",
  cardio: "cardio",
};

function getFormatFocusDescription(format, details) {
  const primaryZones = Object.entries(details.zoneWeights)
    .filter(([zone]) => zone !== "cardio")
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3)
    .map(([zone]) => ZONE_COPY_LABELS[zone] || zone);

  if (!primaryZones.length) {
    return `${details.defaultDurationMinutes} min class`;
  }

  return `${details.defaultDurationMinutes} min • ${primaryZones.join(", ")}`;
}


const TIME_CONTROL_LIBRARY = {
  today: { label: "↺", description: "" },
  plus_1: { label: "+1d", description: "" },
  plus_7: { label: "+7d", description: "" },
  plus_14: { label: "+14d", description: "" },
};

const ZONE_LIBRARY = {
  shoulders: { label: "Shoulders", halfLifeDays: 4.4, activationTarget: 7.2, inactivityPenaltyPerDay: 0.9 },
  arms: { label: "Arms", halfLifeDays: 4.4, activationTarget: 7.2, inactivityPenaltyPerDay: 0.9 },
  chest: { label: "Chest", halfLifeDays: 4.3, activationTarget: 7.0, inactivityPenaltyPerDay: 0.9 },
  core: { label: "Core", halfLifeDays: 3.5, activationTarget: 6.4, inactivityPenaltyPerDay: 0.87 },
  back: { label: "Back", halfLifeDays: 4.4, activationTarget: 7.4, inactivityPenaltyPerDay: 0.9 },
  glutes: { label: "Glutes", halfLifeDays: 4.8, activationTarget: 8.2, inactivityPenaltyPerDay: 0.91 },
  quads: { label: "Quads", halfLifeDays: 4.8, activationTarget: 8.2, inactivityPenaltyPerDay: 0.91 },
  hamstrings: { label: "Hamstrings", halfLifeDays: 3.8, activationTarget: 6.8, inactivityPenaltyPerDay: 0.89 },
  calves: { label: "Calves", halfLifeDays: 3.5, activationTarget: 6.2, inactivityPenaltyPerDay: 0.88 },
  cardio: { label: "Cardio", halfLifeDays: 2.6, activationTarget: 5.0, inactivityPenaltyPerDay: 0.84 },
};

const GOAL_ZONE_PRIORITY = {
  weight_loss: {
    cardio: 1,
    core: 0.92,
    quads: 0.82,
    glutes: 0.82,
    hamstrings: 0.6,
    calves: 0.55,
    shoulders: 0.48,
    arms: 0.4,
    back: 0.45,
    chest: 0.34,
  },
  strength: {
    quads: 1,
    glutes: 0.95,
    back: 0.9,
    shoulders: 0.78,
    arms: 0.75,
    chest: 0.72,
    core: 0.62,
    hamstrings: 0.56,
    calves: 0.38,
    cardio: 0.24,
  },
  general_fitness: {
    cardio: 0.82,
    core: 0.8,
    quads: 0.74,
    glutes: 0.74,
    back: 0.68,
    shoulders: 0.64,
    arms: 0.58,
    hamstrings: 0.6,
    calves: 0.52,
    chest: 0.56,
  },
};

const AREA_GROUPS = {
  cardio: { label: "Cardio", inline: "cardio", zones: ["cardio"] },
  lower_body: {
    label: "Lower-body response",
    inline: "lower body",
    zones: ["quads", "glutes", "hamstrings", "calves"],
  },
  upper_body: {
    label: "Upper-body response",
    inline: "upper body",
    zones: ["shoulders", "arms", "chest", "back"],
  },
  core: { label: "Core activation", inline: "core", zones: ["core"] },
};

const STORAGE_KEY = "cult-pulse-demo-user-progress-v2";

const USER_LIBRARY = {};

const GOAL_STEP_LIBRARY = [
  {
    key: "goal",
    title: "What are you working toward?",
    description: "Pick the one thing that matters most right now.",
  },
  {
    key: "starting_point",
    title: "Which best describes you right now?",
    description: "This helps us set the right pace for week one.",
  },
  {
    key: "rhythm",
    title: "How many days can you realistically commit each week?",
    description: "Set a weekly rhythm that feels realistic for you.",
  },
  {
    key: "training_mode",
    title: "How do you want to train?",
    description: "Choose classes only, gym only, or let us suggest the right mix.",
  },
];

const DEFAULT_USER_ID = Object.keys(USER_LIBRARY)[0] || null;
const DEFAULT_PROFILE = {
  name: "New member",
  goal: "general_fitness",
  frequency: "3",
  startingPoint: "beginner",
  trainingMode: "suggested_mix",
  splitPreference: "full_body",
};
const initialUserProgressMap = getInitialUserProgressMap();
const initialSelectedProgress = DEFAULT_USER_ID ? initialUserProgressMap[DEFAULT_USER_ID] : null;

const state = {
  activeTab: "goal",
  currentDate: new Date(TODAY),
  selectedUserId: DEFAULT_USER_ID,
  userProgress: initialUserProgressMap,
  profile: initialSelectedProgress ? { ...initialSelectedProgress.profile } : cloneUserProfile(DEFAULT_PROFILE),
  planCreated: initialSelectedProgress ? initialSelectedProgress.planCreated : false,
  goalStep: initialSelectedProgress ? initialSelectedProgress.goalStep : 0,
  supportPanelOpen: false,
  logWorkoutSource: "group_class",
  logWorkoutType: "hrx",
  logWorkoutMuscle: "core",
};

const tabButtons = [...document.querySelectorAll("[data-tab-target]")];
const tabScreens = [...document.querySelectorAll("[data-tab]")];
const newUserNameInput = document.getElementById("newUserNameInput");
const addUserButton = document.getElementById("addUserButton");
const userOptions = document.getElementById("userOptions");
const resetSelectedUserButton = document.getElementById("resetSelectedUserButton");
const deleteSelectedUserButton = document.getElementById("deleteSelectedUserButton");
const resetAllUsersButton = document.getElementById("resetAllUsersButton");
const timeControlLabel = document.getElementById("timeControlLabel");
const timeTravelActions = document.getElementById("timeTravelActions");
const currentDateLabel = document.getElementById("currentDateLabel");
const welcomeTitle = document.getElementById("welcomeTitle");
const memberName = document.getElementById("memberName");
const summaryGoal = document.getElementById("summaryGoal");
const summaryScenario = document.getElementById("summaryScenario");
const summaryRange = document.getElementById("summaryRange");
const summaryLoad = document.getElementById("summaryLoad");
const progressDescription = document.getElementById("progressDescription");
const saveStatus = document.getElementById("saveStatus");
const goalStepper = document.getElementById("goalStepper");
const goalStepTitle = document.getElementById("goalStepTitle");
const goalStepDescription = document.getElementById("goalStepDescription");
const goalStepContent = document.getElementById("goalStepContent");
const goalBackButton = document.getElementById("goalBackButton");
const planEmptyState = document.getElementById("planEmptyState");
const planSummary = document.getElementById("planSummary");
const setupPreviewTitle = document.getElementById("setupPreviewTitle");
const setupPreviewBody = document.getElementById("setupPreviewBody");
const previewTargetRange = document.getElementById("previewTargetRange");
const previewSplit = document.getElementById("previewSplit");
const previewWeeklyPattern = document.getElementById("previewWeeklyPattern");
const centerConsultNudge = document.getElementById("centerConsultNudge");
const bcaNudge = document.getElementById("bcaNudge");
const helpToggleButton = document.getElementById("helpToggleButton");
const supportPanel = document.getElementById("supportPanel");
const viewPulseFromPlan = document.getElementById("viewPulseFromPlan");
const pulseCardTop = document.getElementById("pulseCardTop");
const pulseWeekDots = document.getElementById("pulseWeekDots");
const pulseHeadline = document.getElementById("pulseHeadline");
const pulseHeaderSubtext = document.getElementById("pulseHeaderSubtext");
const pulseMomentumPill = document.getElementById("pulseMomentumPill");
const pulseCuroVisual = document.getElementById("pulseCuroVisual");
const bodyMapMostActive = document.getElementById("bodyMapMostActive");
const bodyMapCoverage = document.getElementById("bodyMapCoverage");
const pulseLoadValue = document.getElementById("pulseLoadValue");
const pulseLoadSubtext = document.getElementById("pulseLoadSubtext");
const miniLoadTarget = document.getElementById("miniLoadTarget");
const miniLoadPrevious = document.getElementById("miniLoadPrevious");
const miniLoadBoost = document.getElementById("miniLoadBoost");
const loadStatusBadge = document.getElementById("loadStatusBadge");
const weeklyLoadNarrative = document.getElementById("weeklyLoadNarrative");
const goalAdherenceTitle = document.getElementById("goalAdherenceTitle");
const goalAdherenceText = document.getElementById("goalAdherenceText");
const adherenceSplitLabel = document.getElementById("adherenceSplitLabel");
const adherenceProgressDots = document.getElementById("adherenceProgressDots");
const adherenceProgressLabel = document.getElementById("adherenceProgressLabel");
const primaryAction = document.getElementById("primaryAction");
const wearableNudgeButton = document.getElementById("wearableNudgeButton");
const wearableNudgeText = document.getElementById("wearableNudgeText");
const pulseBcaTrayButton = document.getElementById("pulseBcaTrayButton");
const askCuroButton = document.getElementById("askCuroButton");
const logWorkoutTitle = document.getElementById("logWorkoutTitle");
const logWorkoutStepCount = document.getElementById("logWorkoutStepCount");
const logWorkoutSourceSection = document.getElementById("logWorkoutSourceSection");
const logWorkoutSourceChoices = document.getElementById("logWorkoutSourceChoices");
const logWorkoutTypeSection = document.getElementById("logWorkoutTypeSection");
const logWorkoutTypeTitle = document.getElementById("logWorkoutTypeTitle");
const logWorkoutTypeChoices = document.getElementById("logWorkoutTypeChoices");
const logWorkoutMuscleSection = document.getElementById("logWorkoutMuscleSection");
const logWorkoutMuscleTitle = document.getElementById("logWorkoutMuscleTitle");
const logWorkoutMuscleChoices = document.getElementById("logWorkoutMuscleChoices");
const logWorkoutMeta = document.getElementById("logWorkoutMeta");
const logWorkoutBackButton = document.getElementById("logWorkoutBackButton");
const logWorkoutButton = document.getElementById("logWorkoutButton");
const logWorkoutHistoryList = document.getElementById("logWorkoutHistoryList");
const logWorkoutHistoryMeta = document.getElementById("logWorkoutHistoryMeta");
const bodyReferenceNodes = [...document.querySelectorAll("[data-asset-zone]")];

const CURO_VISUAL_LIBRARY = {
  default: "../99 curo images/Meet.png",
  happy: "../99 curo images/streak check_.png",
  unhappy: "../99 curo images/Dont_do_this.png",
};

function cloneWorkout(workout) {
  return {
    ...workout,
    heartRateSummary: workout.heartRateSummary
      ? {
          ...workout.heartRateSummary,
          zoneMinutes: workout.heartRateSummary.zoneMinutes
            ? { ...workout.heartRateSummary.zoneMinutes }
            : undefined,
        }
      : undefined,
  };
}

function cloneUserProfile(profile = DEFAULT_PROFILE) {
  return {
    name: profile.name || DEFAULT_PROFILE.name,
    goal: GOAL_LIBRARY[profile.goal] ? profile.goal : DEFAULT_PROFILE.goal,
    frequency: FREQUENCY_LIBRARY[profile.frequency] ? profile.frequency : DEFAULT_PROFILE.frequency,
    startingPoint: LEVEL_LIBRARY[profile.startingPoint]
      ? profile.startingPoint
      : DEFAULT_PROFILE.startingPoint,
    trainingMode: TRAINING_MODE_LIBRARY[profile.trainingMode]
      ? profile.trainingMode
      : DEFAULT_PROFILE.trainingMode,
    splitPreference: SPLIT_LIBRARY[profile.splitPreference]
      ? profile.splitPreference
      : DEFAULT_PROFILE.splitPreference,
  };
}

function getDefaultReferenceDateFromWorkouts(workouts = []) {
  const latestWorkout =
    workouts
      .slice()
      .sort((left, right) => getWorkoutDateObject(right) - getWorkoutDateObject(left))[0] || null;

  return latestWorkout ? getWorkoutDateObject(latestWorkout) : new Date(TODAY);
}

function parseStoredReferenceDate(referenceDate, fallbackWorkouts = []) {
  if (referenceDate) {
    const parsed = new Date(referenceDate);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return getDefaultReferenceDateFromWorkouts(fallbackWorkouts);
}

function getDefaultStartDateFromProgress(referenceDate, workouts = []) {
  const earliestWorkout =
    workouts
      .slice()
      .sort((left, right) => getWorkoutDateObject(left) - getWorkoutDateObject(right))[0] || null;

  if (earliestWorkout) {
    return getWorkoutDateObject(earliestWorkout);
  }

  return referenceDate ? new Date(referenceDate) : new Date(TODAY);
}

function parseStoredStartDate(startDate, referenceDate, workouts = []) {
  if (startDate) {
    const parsed = new Date(startDate);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return getDefaultStartDateFromProgress(referenceDate, workouts);
}

function createUserProgress(userId, seedUser = USER_LIBRARY[userId], nameOverride = null) {
  const profile = cloneUserProfile({
    ...DEFAULT_PROFILE,
    ...(seedUser?.profile || {}),
    ...(nameOverride ? { name: nameOverride } : {}),
  });
  const workouts = (seedUser?.workouts || []).map(cloneWorkout);
  const referenceDate = parseStoredReferenceDate(seedUser?.referenceDate, workouts);
  const startDate = parseStoredStartDate(seedUser?.startDate, referenceDate, workouts);

  return {
    profile,
    planCreated: seedUser?.planCreated ?? false,
    goalStep: 0,
    workouts,
    referenceDate: referenceDate.toISOString(),
    startDate: startDate.toISOString(),
  };
}

function getDefaultUserProgressMap() {
  return Object.fromEntries(
    Object.keys(USER_LIBRARY).map((userId) => [userId, createUserProgress(userId)]),
  );
}

function normalizeUserProgress(userId, storedProgress) {
  const fallback = createUserProgress(userId);
  const storedProfile = storedProgress?.profile || {};
  const fallbackWorkouts = fallback.workouts.map(cloneWorkout);
  const workouts = Array.isArray(storedProgress?.workouts)
    ? storedProgress.workouts.map(cloneWorkout)
    : fallbackWorkouts;
  const referenceDate = parseStoredReferenceDate(storedProgress?.referenceDate, workouts);
  const startDate = parseStoredStartDate(storedProgress?.startDate, referenceDate, workouts);

  return {
    profile: cloneUserProfile({
      ...fallback.profile,
      name:
        typeof storedProfile.name === "string" && storedProfile.name.trim()
          ? storedProfile.name.trim()
          : fallback.profile.name,
      goal: storedProfile.goal,
      frequency: storedProfile.frequency,
      startingPoint: storedProfile.startingPoint,
      splitPreference: storedProfile.splitPreference,
    }),
    planCreated:
      typeof storedProgress?.planCreated === "boolean" ? storedProgress.planCreated : fallback.planCreated,
    goalStep: Number.isFinite(Number(storedProgress?.goalStep)) ? Number(storedProgress.goalStep) : fallback.goalStep,
    workouts,
    referenceDate: referenceDate.toISOString(),
    startDate: startDate.toISOString(),
  };
}

function getInitialUserProgressMap() {
  const defaults = getDefaultUserProgressMap();

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return defaults;
    }

    const parsed = JSON.parse(stored);
    const allUserIds = [...Object.keys(defaults), ...Object.keys(parsed || {}).filter((userId) => !defaults[userId])];

    return Object.fromEntries(
      allUserIds.map((userId) => {
        const fallbackSeed = USER_LIBRARY[userId] || {
          profile: {
            ...DEFAULT_PROFILE,
            name: parsed?.[userId]?.profile?.name || `Member`,
          },
          planCreated: false,
          workouts: [],
        };

        return [userId, normalizeUserProgress(userId, { ...fallbackSeed, ...parsed?.[userId] })];
      }),
    );
  } catch (error) {
    console.warn("Could not read saved user progress.", error);
    return defaults;
  }
}

function saveUserProgressMap() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.userProgress));
  } catch (error) {
    console.warn("Could not save user progress.", error);
  }
}

function getUserRecord(userId = state.selectedUserId) {
  return state.userProgress[userId];
}

function getSelectedUserProgress() {
  return getUserRecord(state.selectedUserId);
}

function syncCurrentUserToState() {
  const progress = getSelectedUserProgress();
  if (!progress) {
    state.profile = cloneUserProfile(DEFAULT_PROFILE);
    state.planCreated = false;
    state.goalStep = 0;
    state.currentDate = new Date(TODAY);
    return;
  }

  state.profile = { ...progress.profile };
  state.planCreated = progress.planCreated;
  state.goalStep = progress.goalStep;
  syncSplitPreference();
  clampGoalStep();
  state.currentDate = parseStoredReferenceDate(progress.referenceDate, progress.workouts);
}

function syncStateToCurrentUser() {
  if (!state.selectedUserId || !getSelectedUserProgress()) {
    return;
  }

  state.userProgress[state.selectedUserId] = {
    ...getSelectedUserProgress(),
    profile: { ...state.profile },
    planCreated: state.planCreated,
    goalStep: state.goalStep,
    referenceDate: state.currentDate.toISOString(),
  };
  saveUserProgressMap();
}

function getReferenceDateForUser(userId = state.selectedUserId) {
  const progress = getUserRecord(userId);
  return parseStoredReferenceDate(progress?.referenceDate, progress?.workouts || []);
}

function getStartDateForUser(userId = state.selectedUserId) {
  const progress = getUserRecord(userId);
  return parseStoredStartDate(progress?.startDate, progress?.referenceDate, progress?.workouts || []);
}

function getProgressViewLabel(userId = state.selectedUserId) {
  const workoutCount = getUserRecord(userId)?.workouts?.length || 0;
  return workoutCount ? `${workoutCount} workouts logged` : "No workouts yet";
}

function getCurrentWorkout(userId = state.selectedUserId) {
  const workouts = getUserRecord(userId)?.workouts || [];
  return (
    workouts
      .slice()
      .sort((left, right) => getWorkoutDateObject(right) - getWorkoutDateObject(left))[0] || null
  );
}

function getProgressSnapshotCopy(userId = state.selectedUserId) {
  const currentWorkout = getCurrentWorkout(userId);
  const workoutCount = getUserRecord(userId)?.workouts?.length || 0;

  if (!currentWorkout) {
    return {
      shortLabel: "No workouts yet",
      timelineLabel: "No workouts logged yet",
      detail: "Create a goal and log the first class from the left pane.",
    };
  }

  const workoutDate = formatFullDate(getWorkoutDateObject(currentWorkout));
  const workoutName = formatWorkoutName(currentWorkout.format);

  return {
    shortLabel: `${workoutCount} workouts logged`,
    timelineLabel: `Latest workout: ${workoutName} on ${workoutDate}`,
    detail: `${workoutName} on ${workoutDate}`,
  };
}

function getNextMemberName() {
  return `New member ${Object.keys(state.userProgress).length + 1}`;
}

function getLogWorkoutTypeLibrary(source = state.logWorkoutSource) {
  return LOG_WORKOUT_TYPE_LIBRARY[source] || {};
}

function getLogWorkoutMuscleLibrary(source = state.logWorkoutSource, type = state.logWorkoutType) {
  return LOG_WORKOUT_MUSCLE_LIBRARY[source]?.[type] || null;
}

function getSelectedLogWorkoutFormat() {
  if (state.logWorkoutSource === "group_class") {
    const staticFormats = {
      burn: "Burn",
      strength_conditioning: "Strength & Conditioning",
      boxing: "Boxing",
      yoga: "Yoga",
    };

    if (staticFormats[state.logWorkoutType]) {
      return staticFormats[state.logWorkoutType];
    }
  }

  const muscleLibrary = getLogWorkoutMuscleLibrary();
  return muscleLibrary?.[state.logWorkoutMuscle]?.format || null;
}

function getSuggestedLogWorkoutSelection(format) {
  if (!format || !FORMAT_LIBRARY[format]) {
    return {
      source: "group_class",
      type: "hrx",
      muscle: "core",
    };
  }

  if (format.startsWith("Gym ")) {
    const gymMap = {
      "Gym Full body": { source: "gym", type: "full_body", muscle: "full_body" },
      "Gym Upper": { source: "gym", type: "upper_lower", muscle: "upper" },
      "Gym Lower": { source: "gym", type: "upper_lower", muscle: "lower" },
      "Gym Chest+Tri": { source: "gym", type: "split_day", muscle: "chest_tri" },
      "Gym Back+Bicep": { source: "gym", type: "split_day", muscle: "back_bicep" },
      "Gym Shoulders+Core": { source: "gym", type: "split_day", muscle: "shoulders_core" },
      "Gym Chest": { source: "gym", type: "focused", muscle: "chest" },
      "Gym Back": { source: "gym", type: "focused", muscle: "back" },
      "Gym Arms": { source: "gym", type: "focused", muscle: "arms" },
      "Gym Shoulders": { source: "gym", type: "focused", muscle: "shoulders" },
      "Gym Legs": { source: "gym", type: "focused", muscle: "legs" },
      "Gym Core": { source: "gym", type: "focused", muscle: "core" },
    };

    return gymMap[format] || { source: "gym", type: "upper_lower", muscle: "upper" };
  }

  const classMap = {
    Burn: { source: "group_class", type: "burn", muscle: null },
    "Strength & Conditioning": { source: "group_class", type: "strength_conditioning", muscle: null },
    Boxing: { source: "group_class", type: "boxing", muscle: null },
    Yoga: { source: "group_class", type: "yoga", muscle: null },
    "HRX Chest": { source: "group_class", type: "hrx", muscle: "chest" },
    "HRX Back": { source: "group_class", type: "hrx", muscle: "back" },
    "HRX Arms": { source: "group_class", type: "hrx", muscle: "arms" },
    "HRX Shoulders": { source: "group_class", type: "hrx", muscle: "shoulders" },
    "HRX Core": { source: "group_class", type: "hrx", muscle: "core" },
    "HRX Quads": { source: "group_class", type: "hrx", muscle: "lower_body" },
    "HRX Glutes": { source: "group_class", type: "hrx", muscle: "lower_body" },
    "HRX Hamstrings": { source: "group_class", type: "hrx", muscle: "lower_body" },
    "HRX Calves": { source: "group_class", type: "hrx", muscle: "lower_body" },
  };

  return classMap[format] || { source: "group_class", type: "hrx", muscle: "core" };
}

function syncLogWorkoutSelection() {
  const typeOptions = getLogWorkoutTypeLibrary();
  if (!typeOptions[state.logWorkoutType]) {
    state.logWorkoutType = Object.keys(typeOptions)[0];
  }

  const muscleOptions = getLogWorkoutMuscleLibrary();
  if (muscleOptions) {
    if (!muscleOptions[state.logWorkoutMuscle]) {
      state.logWorkoutMuscle = Object.keys(muscleOptions)[0];
    }
  } else {
    state.logWorkoutMuscle = null;
  }
}

function resetLogWorkoutFlow() {
  state.logWorkoutSource = "group_class";
  state.logWorkoutType = "hrx";
  state.logWorkoutMuscle = "core";
  syncLogWorkoutSelection();
}

function syncLogWorkoutSelectionForFormat(recommendedFormat = null) {
  if (!recommendedFormat || !FORMAT_LIBRARY[recommendedFormat]) {
    resetLogWorkoutFlow();
    return;
  }

  const selection = getSuggestedLogWorkoutSelection(recommendedFormat);
  state.logWorkoutSource = selection.source;
  state.logWorkoutType = selection.type;
  state.logWorkoutMuscle = selection.muscle;
  syncLogWorkoutSelection();
}

function getPulseActionContext() {
  const summary = getPulseSummary();
  const goal = getGoalConfig();
  const program = generateWeeklyProgram();
  const currentWindow = getWeeklyLoadSummary(state.currentDate);
  const nextPlannedWorkout = getNextPlannedWorkout(state.profile, state.currentDate);
  const plannedSessions = Number(state.profile.frequency);
  const actionSummary = {
    ...summary,
    recommendedFormat: nextPlannedWorkout.format || summary.recommendedFormat || DEFAULT_HRX_FORMAT,
  };
  const adherence = getGoalAdherenceCopy(
    actionSummary,
    currentWindow,
    goal,
    Number(state.profile.frequency),
    program,
  );
  const isRecoveryAction =
    adherence.actionLabel === "Recover" && currentWindow.sessions >= plannedSessions;

  return {
    summary: actionSummary,
    adherence,
    nextPlannedWorkout,
    isRecoveryAction,
    recommendedFormat: actionSummary.recommendedFormat,
  };
}

function openLogWorkout(recommendedFormat = null) {
  if (recommendedFormat && FORMAT_LIBRARY[recommendedFormat]) {
    syncLogWorkoutSelectionForFormat(recommendedFormat);
  } else {
    resetLogWorkoutFlow();
  }

  state.activeTab = "log";
  syncTabHash();
  renderAll();
}

function addUser() {
  const typedName = newUserNameInput.value.trim();
  const memberName = typedName || getNextMemberName();
  const userId = `user_${Date.now()}`;

  if (state.selectedUserId) {
    syncStateToCurrentUser();
  }
  state.userProgress[userId] = createUserProgress(userId, null, memberName);
  state.selectedUserId = userId;
  state.activeTab = "goal";
  state.supportPanelOpen = false;
  newUserNameInput.value = "";
  syncCurrentUserToState();
  resetLogWorkoutFlow();
  syncLogWorkoutSelection();
  syncTabHash();
  renderAll();
}

function getNewWorkoutDateTime(workouts, referenceDate = state.currentDate) {
  const baseDate = new Date(referenceDate);
  baseDate.setHours(18, 30, 0, 0);

  const latestWorkout = workouts
    .slice()
    .sort((left, right) => getWorkoutDateObject(right) - getWorkoutDateObject(left))[0];

  if (!latestWorkout) {
    return baseDate.toISOString();
  }

  const latestWorkoutDate = getWorkoutDateObject(latestWorkout);
  const latestWorkoutDay = new Date(latestWorkoutDate);
  latestWorkoutDay.setHours(18, 30, 0, 0);

  if (diffDays(baseDate, latestWorkoutDay) <= 0) {
    return moveDateKeepingTime(latestWorkoutDay, 1).toISOString();
  }

  return baseDate.toISOString();
}

function logWorkout(format) {
  const record = getSelectedUserProgress();
  if (!record) {
    return;
  }

  if (!format || !FORMAT_LIBRARY[format]) {
    return;
  }

  const formatDetails = FORMAT_LIBRARY[format];
  const workoutDateTime = getNewWorkoutDateTime(record.workouts);

  record.workouts = [
    ...record.workouts,
    {
      dateTime: workoutDateTime,
      format,
      durationMinutes: formatDetails.defaultDurationMinutes,
      source: state.logWorkoutSource === "gym" ? "gym" : "cult_class",
    },
  ];
  state.currentDate = new Date(workoutDateTime);
  record.referenceDate = workoutDateTime;

  state.userProgress[state.selectedUserId] = record;
  saveUserProgressMap();
  syncCurrentUserToState();
  resetLogWorkoutFlow();
  state.activeTab = "pulse";
  syncTabHash();
  renderAll();
}

function removeWorkout(workoutIndex) {
  const record = getSelectedUserProgress();
  if (!record) {
    return;
  }

  record.workouts = record.workouts.filter((_, index) => index !== workoutIndex);
  state.userProgress[state.selectedUserId] = record;
  saveUserProgressMap();
  syncCurrentUserToState();
  renderAll();
}

function resetSelectedUser() {
  if (!state.selectedUserId) {
    return;
  }

  const existingUser = getSelectedUserProgress();
  const memberName = existingUser?.profile?.name || getNextMemberName();
  state.userProgress[state.selectedUserId] = createUserProgress(state.selectedUserId, null, memberName);
  state.activeTab = "goal";
  state.supportPanelOpen = false;
  syncCurrentUserToState();
  resetLogWorkoutFlow();
  syncLogWorkoutSelection();
  syncTabHash();
  renderAll();
}

function deleteSelectedUser() {
  if (!state.selectedUserId) {
    return;
  }

  const remainingUserIds = Object.keys(state.userProgress).filter((userId) => userId !== state.selectedUserId);
  delete state.userProgress[state.selectedUserId];
  state.selectedUserId = remainingUserIds[0] || null;
  state.activeTab = state.selectedUserId ? state.activeTab : "goal";
  state.supportPanelOpen = false;
  syncCurrentUserToState();
  resetLogWorkoutFlow();
  syncLogWorkoutSelection();
  syncTabHash();
  renderAll();
}

function shiftCurrentDate(days) {
  if (!state.selectedUserId) {
    return;
  }

  state.currentDate = moveDateKeepingTime(state.currentDate, days);
  syncStateToCurrentUser();
  renderAll();
}

function resetCurrentDate() {
  if (!state.selectedUserId) {
    return;
  }

  state.currentDate = getDefaultReferenceDateFromWorkouts(getSelectedUserProgress()?.workouts || []);
  syncStateToCurrentUser();
  renderAll();
}

function getAvailableTrainingModes(profile = state.profile) {
  if (profile.startingPoint === "beginner") {
    return {
      gx_only: {
        ...TRAINING_MODE_LIBRARY.gx_only,
        description: "Best for week one. We keep beginners in guided classes first.",
      },
    };
  }

  return TRAINING_MODE_LIBRARY;
}

function shouldAskTrainingMode(profile = state.profile) {
  return profile.startingPoint !== "beginner";
}

function getGoalSteps(profile = state.profile) {
  return GOAL_STEP_LIBRARY.filter((step) => step.key !== "training_mode" || shouldAskTrainingMode(profile));
}

function clampGoalStep() {
  state.goalStep = clamp(state.goalStep, 0, getGoalSteps().length - 1);
}

function getDefaultSplit(profile = state.profile) {
  const frequency = Number(profile.frequency);

  if (profile.goal === "strength") {
    if (profile.startingPoint === "regular" && frequency >= 5) {
      return "two_muscles";
    }

    if (
      (profile.startingPoint === "regular" && frequency >= 3) ||
      (profile.startingPoint === "restarting" && frequency >= 4)
    ) {
      return "upper_lower";
    }

    return "full_body";
  }

  if (profile.goal === "weight_loss") {
    return profile.startingPoint === "regular" && frequency >= 4 ? "upper_lower" : "full_body";
  }

  return profile.startingPoint === "regular" && frequency >= 4 ? "upper_lower" : "full_body";
}

function getResolvedTrainingMode(profile = state.profile) {
  if (profile.startingPoint === "beginner") {
    return "gx_only";
  }

  return TRAINING_MODE_LIBRARY[profile.trainingMode] ? profile.trainingMode : DEFAULT_PROFILE.trainingMode;
}

function getRecommendedTrainingMode(profile = state.profile) {
  if (profile.startingPoint === "beginner") {
    return "gx_only";
  }

  if (profile.goal === "strength") {
    return profile.startingPoint === "regular" ? "gym_only" : "suggested_mix";
  }

  return "suggested_mix";
}

function getOrderedTrainingModes(profile = state.profile) {
  const availableModes = getAvailableTrainingModes(profile);
  const recommendedMode = getRecommendedTrainingMode(profile);
  const modeEntries = Object.entries(availableModes);

  modeEntries.sort(([leftKey], [rightKey]) => {
    if (leftKey === recommendedMode) {
      return -1;
    }

    if (rightKey === recommendedMode) {
      return 1;
    }

    return 0;
  });

  return Object.fromEntries(
    modeEntries.map(([key, value]) => [key, { ...value }]),
  );
}

function getResolvedSplitPreference(profile = state.profile) {
  const frequency = Number(profile.frequency);
  const preferred = profile.splitPreference || getDefaultSplit(profile);

  if (preferred === "upper_lower" && frequency < 3) {
    return "full_body";
  }

  if (preferred === "two_muscles") {
    if (profile.goal !== "strength" || profile.startingPoint !== "regular" || frequency < 5) {
      return profile.goal === "strength" && profile.startingPoint === "regular" && frequency >= 3
        ? "upper_lower"
        : getDefaultSplit(profile);
    }
  }

  if (profile.goal === "general_fitness" && preferred === "two_muscles") {
    return getDefaultSplit(profile);
  }

  if (profile.goal === "weight_loss" && preferred === "two_muscles") {
    return frequency >= 4 ? "upper_lower" : "full_body";
  }

  return preferred;
}

function syncSplitPreference() {
  state.profile.trainingMode = getResolvedTrainingMode(state.profile);
  state.profile.splitPreference = getResolvedSplitPreference(state.profile);
}

function startOfDay(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfDay(date) {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

function startOfWeek(date) {
  const copy = startOfDay(date);
  const day = copy.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + mondayOffset);
  return copy;
}

function endOfWeek(date) {
  return endOfDay(addDays(startOfWeek(date), 6));
}

function addDays(date, days) {
  return new Date(startOfDay(date).getTime() + days * DAY_MS);
}

function moveDateKeepingTime(date, days) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function diffDays(later, earlier) {
  return Math.round((startOfDay(later) - startOfDay(earlier)) / DAY_MS);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function roundLoad(value) {
  return Math.round(value * 10) / 10;
}

function formatLoadValue(value) {
  const rounded = roundLoad(value);
  return Number.isInteger(rounded) ? `${rounded}` : rounded.toFixed(1);
}

function formatFullDate(date) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatShortDate(date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
  }).format(date);
}

function formatWeekRangeLabel(start, end) {
  return `${formatShortDate(start)}-${formatShortDate(end)}`;
}

function formatWorkoutName(format) {
  if (format === "Strength & Conditioning") {
    return "S&C";
  }

  if (format.startsWith("Gym ")) {
    return `Gym: ${format.replace("Gym ", "")}`;
  }

  return format;
}

function formatRelativeDayLabel(days) {
  if (days === null || days === undefined) {
    return null;
  }

  if (days <= 0) {
    return "today";
  }

  if (days === 1) {
    return "yesterday";
  }

  return `${days} days ago`;
}

function formatSessionCount(count) {
  return count === 1 ? "1 session" : `${count} sessions`;
}

function getWorkoutDateObject(workout, index = 0) {
  if (workout.dateTime) {
    return new Date(workout.dateTime);
  }

  if (workout.date) {
    return new Date(`${workout.date}T${String(9 + (index % 8)).padStart(2, "0")}:00:00`);
  }

  return new Date(TODAY.getTime() + (index * 60 * 1000));
}

function getGoalConfigForProfile(profile) {
  const goal = GOAL_LIBRARY[profile.goal];
  const frequencyModifier = FREQUENCY_LIBRARY[profile.frequency].modifier;
  const levelModifier = LEVEL_LIBRARY[profile.startingPoint].modifier;
  const minimumLoad = 8;
  const maximumLoad = LOAD_MAX - 2;

  return {
    ...goal,
    targetRange: [
      clamp(goal.baseRange[0] + frequencyModifier + levelModifier, minimumLoad, maximumLoad),
      clamp(goal.baseRange[1] + frequencyModifier + levelModifier, minimumLoad + 2, maximumLoad),
    ],
  };
}

function getGoalConfig() {
  return getGoalConfigForProfile(state.profile);
}

function getScenarioConfig() {
  return getSelectedUserProgress();
}

function getRatingEffortFactor(rating) {
  return clamp(0.05 + (rating / 10) * 0.1, 0.07, 0.16);
}

function getHeartRateEffortFactor(heartRateSummary) {
  if (!heartRateSummary) {
    return null;
  }

  const zoneWeights = {
    zone1: 0.42,
    zone2: 0.55,
    zone3: 0.72,
    zone4: 0.9,
    zone5: 1.05,
  };

  let weightedZoneEffort = null;
  const zoneMinutes = heartRateSummary.zoneMinutes;
  if (zoneMinutes) {
    const totalZoneMinutes = Object.values(zoneMinutes).reduce((sum, minutes) => sum + minutes, 0);
    if (totalZoneMinutes > 0) {
      const weightedZones = Object.entries(zoneMinutes).reduce((sum, [zone, minutes]) => {
        return sum + minutes * (zoneWeights[zone] || 0.42);
      }, 0);
      weightedZoneEffort = clamp(0.045 + (weightedZones / totalZoneMinutes) * 0.095, 0.07, 0.17);
    }
  }

  let averageHeartRateEffort = null;
  if (heartRateSummary.avgBpm && heartRateSummary.maxBpm) {
    const relativeHeartRate = clamp(heartRateSummary.avgBpm / heartRateSummary.maxBpm, 0.45, 0.95);
    averageHeartRateEffort = clamp(0.045 + relativeHeartRate * 0.1, 0.07, 0.16);
  }

  if (weightedZoneEffort !== null && averageHeartRateEffort !== null) {
    return (weightedZoneEffort * 0.65) + (averageHeartRateEffort * 0.35);
  }

  return weightedZoneEffort ?? averageHeartRateEffort;
}

function getMeasuredEffortFactor(workout, formatDetails) {
  const heartRateEffort = getHeartRateEffortFactor(workout.heartRateSummary);
  const ratingEffort =
    typeof workout.effortRating === "number" ? getRatingEffortFactor(workout.effortRating) : null;

  if (heartRateEffort === null && ratingEffort === null) {
    return null;
  }

  const measuredEffort =
    heartRateEffort !== null && ratingEffort !== null
      ? (heartRateEffort * 0.7) + (ratingEffort * 0.3)
      : heartRateEffort ?? ratingEffort;

  return (measuredEffort * 0.8) + (formatDetails.defaultEffortFactor * 0.2);
}

function getLoadConfidence(workout, measuredEffortFactor) {
  if (measuredEffortFactor !== null) {
    return "measured";
  }

  if (workout.durationMinutes) {
    return "estimated";
  }

  return "low_confidence";
}

function getWindowRange(referenceDate, windowDays, offsetDays = 0) {
  const end = endOfDay(addDays(referenceDate, -offsetDays));
  const start = startOfDay(new Date(end.getTime() - ((windowDays - 1) * DAY_MS)));
  return { start, end };
}

function getRelativeLoadState(currentLoad, baselineLoad) {
  if (baselineLoad <= 0) {
    return "building";
  }

  const ratio = currentLoad / baselineLoad;
  const delta = currentLoad - baselineLoad;

  if (ratio <= 0.6 && delta <= -4) {
    return "well_below";
  }

  if (ratio < 0.88 && delta <= -2) {
    return "below";
  }

  if (ratio >= 1.45 && delta >= 5) {
    return "well_above";
  }

  if (ratio > 1.15 && delta >= 2) {
    return "above";
  }

  return "in_range";
}

function getConfidenceSummary(workouts) {
  const counts = workouts.reduce(
    (summary, workout) => {
      summary[workout.loadConfidence] += 1;
      return summary;
    },
    { measured: 0, estimated: 0, low_confidence: 0 },
  );

  if (counts.measured === workouts.length && workouts.length > 0) {
    return "All measured";
  }

  if (counts.estimated === workouts.length && workouts.length > 0) {
    return "All estimated";
  }

  const parts = [];
  if (counts.measured) {
    parts.push(`${counts.measured} measured`);
  }
  if (counts.estimated) {
    parts.push(`${counts.estimated} estimated`);
  }
  if (counts.low_confidence) {
    parts.push(`${counts.low_confidence} low confidence`);
  }

  return parts.join(" • ") || "No sessions yet";
}

function getLatestCompletedWorkout(workouts = getScenarioWorkouts(), referenceDate = state.currentDate) {
  return workouts
    .filter((workout) => workout.dateObject <= referenceDate)
    .sort((a, b) => b.dateObject - a.dateObject)[0] || null;
}

function getEffortBand(sessionLoad = 0) {
  return EFFORT_BAND_LIBRARY.find((band) => sessionLoad <= band.maxLoad) || EFFORT_BAND_LIBRARY[0];
}

function getWorkoutEffortSummary(workout, weekly) {
  if (!workout) {
    const fallbackBand = EFFORT_BAND_LIBRARY[0];
    return {
      ...fallbackBand,
      guidance: "Log one workout to start building your last 7 days.",
      workoutLabel: "No workout logged yet",
    };
  }

  const band = getEffortBand(workout.sessionLoad);
  const workoutLabel = `${workout.format} • ${workout.durationMinutes} min`;

  if (weekly.status === "above") {
    return {
      ...band,
      workoutLabel,
      guidance: `${band.description} You are already above target for the last 7 days, so recovery should be the priority now.`,
    };
  }

  if (weekly.status === "in_range") {
    return {
      ...band,
      workoutLabel,
      guidance: `${band.description} You are in the right zone for your goal over the last 7 days.`,
    };
  }

  if (band.key === "light") {
    return {
      ...band,
      workoutLabel,
      guidance: `${band.description} Good for consistency, but the last 7 days still need one stronger push.`,
    };
  }

  if (band.key === "moderate") {
    return {
      ...band,
      workoutLabel,
      guidance: `${band.description} One more moderate or high-effort session gets you closer to target.`,
    };
  }

  return {
    ...band,
    workoutLabel,
    guidance: `${band.description} This moved the week forward, but you still need one more meaningful session to get into range.`,
  };
}

function getScenarioWorkouts() {
  const scenario = getScenarioConfig();
  return ((scenario && scenario.workouts) || []).map((workout, index) => {
    const details = FORMAT_LIBRARY[workout.format];
    const measuredEffortFactor = getMeasuredEffortFactor(workout, details);
    const durationMinutes = workout.durationMinutes || details.defaultDurationMinutes;
    const effortFactor = measuredEffortFactor ?? details.defaultEffortFactor;
    const sessionLoad = roundLoad(durationMinutes * details.modalityFactor * effortFactor);

    return {
      id: `w${index + 1}`,
      ...workout,
      intensity: details.intensity,
      workoutType: workout.workoutType || workout.format,
      durationMinutes,
      source: workout.source || "cult_class",
      calories: workout.calories || null,
      sessionLoad,
      effortFactor,
      modalityFactor: details.modalityFactor,
      loadConfidence: getLoadConfidence(workout, measuredEffortFactor),
      zoneWeights: { ...details.zoneWeights },
      dateObject: getWorkoutDateObject(workout, index),
    };
  });
}

function getWeeklyLoadSummary(referenceDate = state.currentDate) {
  const workouts = getScenarioWorkouts();
  const goal = getGoalConfig();
  const rollingWindow = getWindowRange(referenceDate, ROLLING_LOAD_DAYS);
  const baselineWindow = getWindowRange(referenceDate, BASELINE_LOAD_DAYS, ROLLING_LOAD_DAYS);

  const rollingWorkouts = workouts.filter(
    (workout) => workout.dateObject >= rollingWindow.start && workout.dateObject <= rollingWindow.end,
  );
  const baselineWorkouts = workouts.filter(
    (workout) => workout.dateObject >= baselineWindow.start && workout.dateObject <= baselineWindow.end,
  );
  const total = roundLoad(rollingWorkouts.reduce((sum, workout) => sum + workout.sessionLoad, 0));
  const baselineLoad = roundLoad(
    baselineWorkouts.reduce((sum, workout) => sum + workout.sessionLoad, 0) / (BASELINE_LOAD_DAYS / ROLLING_LOAD_DAYS),
  );
  const sessions = rollingWorkouts.length;

  let status = "below";
  if (total > goal.targetRange[1]) {
    status = "above";
  } else if (total >= goal.targetRange[0]) {
    status = "in_range";
  }

  const relativeState =
    baselineWorkouts.length === 0 && baselineLoad === 0 ? "building" : getRelativeLoadState(total, baselineLoad);
  const latestWorkout = rollingWorkouts
    .slice()
    .sort((a, b) => b.dateObject - a.dateObject)[0] || null;

  return {
    total,
    rollingWindow,
    rollingWorkouts,
    latestWorkout,
    baselineWindow,
    start: rollingWindow.start,
    end: rollingWindow.end,
    label: formatWeekRangeLabel(rollingWindow.start, rollingWindow.end),
    rollingLabel: `${ROLLING_LOAD_DAYS}-day rolling load`,
    baselineLoad,
    sessions,
    sessionLoads: rollingWorkouts.map((workout) => workout.sessionLoad),
    relativeState,
    relativeLabel: RELATIVE_STATE_LABELS[relativeState],
    confidenceSummary: getConfidenceSummary(rollingWorkouts),
    targetRange: goal.targetRange,
    status,
    targetLabel: TARGET_STATUS_LABELS[status],
  };
}

function getCalendarWeekSummary(referenceDate = state.currentDate, weekOffset = 0) {
  const workouts = getScenarioWorkouts();
  const goal = getGoalConfig();
  const weekAnchor = addDays(referenceDate, weekOffset * 7);
  const weekStart = startOfWeek(weekAnchor);
  const weekEnd = endOfWeek(weekAnchor);
  const weekWorkouts = workouts.filter(
    (workout) => workout.dateObject >= weekStart && workout.dateObject <= weekEnd,
  );
  const total = roundLoad(weekWorkouts.reduce((sum, workout) => sum + workout.sessionLoad, 0));
  const sessions = weekWorkouts.length;

  let status = "below";
  if (total > goal.targetRange[1]) {
    status = "above";
  } else if (total >= goal.targetRange[0]) {
    status = "in_range";
  }

  return {
    start: weekStart,
    end: weekEnd,
    label: formatWeekRangeLabel(weekStart, weekEnd),
    workouts: weekWorkouts,
    total,
    sessions,
    status,
  };
}

function getJourneyWeekSummary(
  referenceDate = state.currentDate,
  weekOffset = 0,
  userId = state.selectedUserId,
) {
  const workouts = getScenarioWorkouts();
  const goal = getGoalConfig();
  const journeyStart = startOfDay(getStartDateForUser(userId));
  const currentDay = startOfDay(referenceDate);
  const currentWeekNumber = Math.max(1, Math.floor(diffDays(currentDay, journeyStart) / 7) + 1);
  const targetWeekNumber = currentWeekNumber + weekOffset;

  if (targetWeekNumber < 1) {
    const endBeforeJourney = endOfDay(addDays(journeyStart, -1));
    return {
      weekNumber: 0,
      start: startOfDay(addDays(journeyStart, -7)),
      end: endBeforeJourney,
      label: "Before start",
      workouts: [],
      total: 0,
      sessions: 0,
      status: "below",
      isFuture: false,
      isCurrent: false,
    };
  }

  const weekStart = startOfDay(addDays(journeyStart, (targetWeekNumber - 1) * 7));
  const weekEnd = endOfDay(addDays(weekStart, 6));
  const weekWorkouts = workouts.filter(
    (workout) => workout.dateObject >= weekStart && workout.dateObject <= weekEnd,
  );
  const total = roundLoad(weekWorkouts.reduce((sum, workout) => sum + workout.sessionLoad, 0));
  const sessions = weekWorkouts.length;

  let status = "below";
  if (total > goal.targetRange[1]) {
    status = "above";
  } else if (total >= goal.targetRange[0]) {
    status = "in_range";
  }

  return {
    weekNumber: targetWeekNumber,
    start: weekStart,
    end: weekEnd,
    label: `W${targetWeekNumber}`,
    workouts: weekWorkouts,
    total,
    sessions,
    status,
    isFuture: weekStart > referenceDate,
    isCurrent: referenceDate >= weekStart && referenceDate <= weekEnd,
  };
}

function getWeekTone(weekSummary, goalTargetRange, plannedSessions, isCurrentWeek, totalWorkouts) {
  if (weekSummary.isFuture) {
    return "pending";
  }

  if (totalWorkouts === 0 && isCurrentWeek) {
    return "pending";
  }

  const sessionRatio = plannedSessions > 0 ? weekSummary.sessions / plannedSessions : 0;

  if (weekSummary.sessions >= plannedSessions || weekSummary.status === "in_range") {
    return "good";
  }

  if (weekSummary.status === "above") {
    return "good";
  }

  const loadRatio = goalTargetRange[0] > 0 ? weekSummary.total / goalTargetRange[0] : 0;
  return sessionRatio >= 0.5 || loadRatio >= 0.5 ? "okay" : "risk";
}

function getSixWeekJourney(referenceDate = state.currentDate, userId = state.selectedUserId) {
  const workouts = getUserRecord(userId)?.workouts || [];
  const goal = getGoalConfig();
  const plannedSessions = Number(getUserRecord(userId)?.profile?.frequency || state.profile.frequency || 0);
  const journeyStart = startOfDay(getStartDateForUser(userId));
  const currentDay = startOfDay(referenceDate);
  const currentWeekNumber = Math.max(1, Math.floor(diffDays(currentDay, journeyStart) / 7) + 1);
  const firstVisibleWeek = currentWeekNumber <= 6 ? 1 : currentWeekNumber - 5;

  return Array.from({ length: 6 }, (_, index) => {
    const weekNumber = firstVisibleWeek + index;
    const weekStart = startOfDay(addDays(journeyStart, (weekNumber - 1) * 7));
    const weekEnd = endOfDay(addDays(weekStart, 6));
    const isFuture = weekStart > referenceDate;
    const weekWorkouts = workouts
      .map((workout) => ({ ...workout, dateObject: getWorkoutDateObject(workout) }))
      .filter((workout) => workout.dateObject >= weekStart && workout.dateObject <= weekEnd);
    const total = roundLoad(weekWorkouts.reduce((sum, workout) => sum + workout.sessionLoad, 0));

    let status = "below";
    if (total > goal.targetRange[1]) {
      status = "above";
    } else if (total >= goal.targetRange[0]) {
      status = "in_range";
    }

    const summary = {
      weekNumber,
      label: `W${weekNumber}`,
      start: weekStart,
      end: weekEnd,
      total,
      sessions: weekWorkouts.length,
      status,
      isFuture,
      isCurrent: referenceDate >= weekStart && referenceDate <= weekEnd,
    };

    return {
      ...summary,
      tone: getWeekTone(summary, goal.targetRange, plannedSessions, summary.isCurrent, workouts.length),
    };
  });
}

function renderPulseWeekDots(weeks) {
  pulseWeekDots.innerHTML = "";

  weeks.forEach((week) => {
    const chip = document.createElement("div");
    chip.className = "pulse-week-chip";
    chip.classList.add(`is-${week.tone}`);
    if (week.isCurrent) {
      chip.classList.add("is-current");
    }
    if (week.isFuture) {
      chip.classList.add("is-future");
    }
    chip.title = `Week ${week.weekNumber}`;

    const dot = document.createElement("span");
    dot.className = "pulse-week-dot";

    const label = document.createElement("span");
    label.className = "pulse-week-label";
    label.textContent = `W${week.weekNumber}`;

    chip.append(dot, label);
    pulseWeekDots.appendChild(chip);
  });
}

function getPulseStates(referenceDate = state.currentDate, workouts = getScenarioWorkouts()) {
  const pulseStates = Object.fromEntries(
    Object.keys(ZONE_LIBRARY).map((zone) => [
      zone,
      {
        rawStimulus: 0,
        activation: 0,
        hitCount: 0,
        freshness: 0,
        lastTrained: null,
        daysSinceLast: null,
      },
    ]),
  );

  workouts.forEach((workout) => {
    if (workout.dateObject > referenceDate) {
      return;
    }

    Object.entries(workout.zoneWeights).forEach(([zone, weight]) => {
      const zoneConfig = ZONE_LIBRARY[zone];
      const daysAgo = Math.max(0, diffDays(referenceDate, workout.dateObject));
      const decayFactor = getZoneDecayFactor(zoneConfig, daysAgo);
      const stimulus = workout.intensity * weight;

      pulseStates[zone].rawStimulus += stimulus * decayFactor;
      pulseStates[zone].freshness = Math.max(
        pulseStates[zone].freshness,
        clamp(1 - daysAgo / (zoneConfig.halfLifeDays * 2), 0, 1),
      );
      pulseStates[zone].hitCount += 1;
      if (!pulseStates[zone].lastTrained || workout.dateObject > pulseStates[zone].lastTrained) {
        pulseStates[zone].lastTrained = workout.dateObject;
      }
    });
  });

  Object.entries(pulseStates).forEach(([zone, zoneState]) => {
    if (!zoneState.lastTrained) {
      return;
    }

    zoneState.daysSinceLast = Math.max(0, diffDays(referenceDate, zoneState.lastTrained));

    const repeatedStimulusMultiplier = 1 + Math.min(0.16, Math.max(0, zoneState.hitCount - 1) * 0.05);
    const normalizedActivation =
      1 - Math.exp((-zoneState.rawStimulus * repeatedStimulusMultiplier) / ZONE_LIBRARY[zone].activationTarget);

    zoneState.activation = clamp(Math.pow(normalizedActivation, 1.18), 0, 1);
  });

  return pulseStates;
}

function getTopZoneKeys(pulseStates, limit = 3) {
  return Object.entries(pulseStates)
    .filter(([, zoneState]) => zoneState.activation > TOP_ZONE_THRESHOLD)
    .sort((a, b) => b[1].activation - a[1].activation)
    .slice(0, limit)
    .map(([zone]) => zone);
}

function getTopZoneAverage(pulseStates, limit = 3) {
  const topZones = getTopZoneKeys(pulseStates, limit);
  if (!topZones.length) {
    return 0;
  }

  const total = topZones.reduce((sum, zone) => sum + pulseStates[zone].activation, 0);
  return total / topZones.length;
}

function getVisibleZoneCount(pulseStates) {
  return Object.values(pulseStates).filter((zoneState) => zoneState.activation >= BODY_MAP_VISIBLE_THRESHOLD).length;
}

function getCoverageLabelFromCount(activeCount) {
  return activeCount === 1 ? "1 zone lit" : `${activeCount} zones lit`;
}

function getAnatomicalTopZoneKeys(pulseStates, limit = 3) {
  return Object.entries(pulseStates)
    .filter(([zone, zoneState]) => ANATOMICAL_ZONES.has(zone) && zoneState.activation > TOP_ZONE_THRESHOLD)
    .sort((a, b) => b[1].activation - a[1].activation)
    .slice(0, limit)
    .map(([zone]) => zone);
}

function getAnatomicalVisibleZoneCount(pulseStates) {
  return Object.entries(pulseStates)
    .filter(([zone, zoneState]) => ANATOMICAL_ZONES.has(zone) && zoneState.activation >= BODY_MAP_VISIBLE_THRESHOLD)
    .length;
}

function getZoneDecayFactor(zoneConfig, daysAgo) {
  const baseDecay = Math.pow(0.5, daysAgo / zoneConfig.halfLifeDays);
  const inactivityDays = Math.max(0, daysAgo - 2);
  const inactivityPenalty = Math.pow(zoneConfig.inactivityPenaltyPerDay || 0.9, inactivityDays);
  return baseDecay * inactivityPenalty;
}

function getWeightedAssetScore(zoneWeights, pulseStates) {
  const weightedContributions = Object.entries(zoneWeights).map(
    ([zone, weight]) => clamp((pulseStates[zone]?.activation || 0) * weight, 0, 1),
  );

  if (!weightedContributions.length) {
    return 0;
  }

  const peakScore = Math.max(...weightedContributions);
  const averageScore =
    weightedContributions.reduce((sum, contribution) => sum + contribution, 0) /
    weightedContributions.length;
  const rawScore = peakScore * 0.72 + averageScore * 0.28;

  if (rawScore < BODY_ASSET_DISPLAY_THRESHOLD) {
    return 0;
  }

  return Math.pow((rawScore - BODY_ASSET_DISPLAY_THRESHOLD) / (1 - BODY_ASSET_DISPLAY_THRESHOLD), BODY_ASSET_DISPLAY_GAMMA);
}

function getBodyAssetStates(pulseStates) {
  return Object.fromEntries(
    Object.entries(BODY_ASSET_LIBRARY).map(([asset, zoneWeights]) => [
      asset,
      getWeightedAssetScore(zoneWeights, pulseStates),
    ]),
  );
}

function getBodyAssetVisualStates(pulseStates) {
  return Object.fromEntries(
    Object.entries(BODY_ASSET_LIBRARY).map(([asset, zoneWeights]) => {
      const score = getWeightedAssetScore(zoneWeights, pulseStates);
      const weightedZones = Object.entries(zoneWeights)
        .map(([zone, weight]) => ({
          zone,
          weight,
          activation: pulseStates[zone]?.activation || 0,
          daysSinceLast: pulseStates[zone]?.daysSinceLast,
        }))
        .filter(({ activation, daysSinceLast }) => activation > 0 && daysSinceLast !== null);

      const hasFreshSignal = weightedZones.some(
        ({ activation, weight, daysSinceLast }) =>
          activation * weight >= BODY_ASSET_DISPLAY_THRESHOLD &&
          daysSinceLast < BODY_ASSET_AT_RISK_MIN_DAYS,
      );
      const hasAtRiskSignal = weightedZones.some(
        ({ activation, weight, daysSinceLast }) =>
          activation * weight >= BODY_ASSET_AT_RISK_THRESHOLD &&
          daysSinceLast >= BODY_ASSET_AT_RISK_MIN_DAYS &&
          daysSinceLast <= BODY_ASSET_AT_RISK_MAX_DAYS,
      );
      const hasFadingMemorySignal = weightedZones.some(
        ({ activation, weight, daysSinceLast }) =>
          activation * weight >= BODY_ASSET_FADE_MEMORY_THRESHOLD &&
          daysSinceLast >= BODY_ASSET_AT_RISK_MIN_DAYS &&
          daysSinceLast <= BODY_ASSET_AT_RISK_MAX_DAYS,
      );
      const strongestWeightedSignal = weightedZones.length
        ? Math.max(...weightedZones.map(({ activation, weight }) => activation * weight))
        : 0;
      const strongestFadingSignal = weightedZones.length
        ? Math.max(
            0,
            ...weightedZones
              .filter(
                ({ daysSinceLast }) =>
                  daysSinceLast >= BODY_ASSET_AT_RISK_MIN_DAYS &&
                  daysSinceLast <= BODY_ASSET_AT_RISK_MAX_DAYS,
              )
              .map(({ activation, weight }) => activation * weight),
          )
        : 0;
      const atRiskVisualScore = hasFadingMemorySignal
        ? clamp(
            (strongestFadingSignal - BODY_ASSET_FADE_MEMORY_THRESHOLD) / (1 - BODY_ASSET_FADE_MEMORY_THRESHOLD),
            0.26,
            0.56,
          )
        : 0;

      const state =
        hasFreshSignal ? "active" : hasFadingMemorySignal || hasAtRiskSignal ? "at-risk" : score <= 0 ? "inactive" : "inactive";

      return [asset, { score, state, visualScore: state === "at-risk" ? Math.max(score, atRiskVisualScore) : score }];
    }),
  );
}

function getBodyAssetRiskSummary(assetStates) {
  const states = Object.values(assetStates);
  const atRiskCount = states.filter((asset) => asset.state === "at-risk").length;
  const activeCount = states.filter((asset) => asset.state === "active").length;

  return {
    atRiskCount,
    activeCount,
    hasAtRiskAssets: atRiskCount > 0,
  };
}

function getDaysSinceLastWorkout(workouts, referenceDate) {
  const latestWorkout = workouts
    .filter((workout) => workout.dateObject <= referenceDate)
    .sort((a, b) => b.dateObject - a.dateObject)[0];

  if (!latestWorkout) {
    return null;
  }

  return Math.max(0, diffDays(referenceDate, latestWorkout.dateObject));
}

function getHistoricalPulseSnapshots(referenceDate, workouts) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(referenceDate, -index);
    const zones = getPulseStates(date, workouts);
    return {
      date,
      zones,
      visibleZoneCount: getVisibleZoneCount(zones),
      topZoneAverage: getTopZoneAverage(zones),
    };
  });
}

function getPeakZoneActivations(snapshots) {
  return Object.fromEntries(
    Object.keys(ZONE_LIBRARY).map((zone) => [
      zone,
      Math.max(...snapshots.map((snapshot) => snapshot.zones[zone].activation)),
    ]),
  );
}

function getCoolingRiskState(visibleDrop, topZoneDeclineRatio, daysSinceLastWorkout) {
  if (daysSinceLastWorkout !== null && daysSinceLastWorkout <= 2) {
    if (visibleDrop >= 3 || topZoneDeclineRatio >= 0.35) {
      return "early_cooling";
    }

    return "stable";
  }

  if (daysSinceLastWorkout !== null && daysSinceLastWorkout <= 5) {
    if (visibleDrop >= 3 || topZoneDeclineRatio >= 0.3) {
      return "cooling";
    }

    if (visibleDrop >= 1 || topZoneDeclineRatio >= 0.1) {
      return "early_cooling";
    }

    return "stable";
  }

  if (
    visibleDrop >= 3 ||
    topZoneDeclineRatio >= 0.3 ||
    (daysSinceLastWorkout !== null && daysSinceLastWorkout >= 7)
  ) {
    return "dropoff_risk";
  }

  if (visibleDrop >= 2 || topZoneDeclineRatio >= 0.15) {
    return "cooling";
  }

  if (visibleDrop >= 1 || topZoneDeclineRatio >= 0.1) {
    return "early_cooling";
  }

  return "stable";
}

function getGoalZonePriorities(goalKey) {
  return GOAL_ZONE_PRIORITY[goalKey];
}

function getZoneOpportunity(summary, zone, goalKey) {
  const goalWeight = getGoalZonePriorities(goalKey)[zone] || 0;
  const currentActivation = summary.zones[zone].activation;
  const peakActivation = summary.peakZoneActivations7d[zone] || currentActivation;
  const coolingGap = Math.max(0, peakActivation - currentActivation);
  const baseGap = Math.max(0, 1 - currentActivation);
  const coolingBias = summary.coolingRisk === "stable" ? 0.42 : 0.7;

  return goalWeight * ((coolingGap * 1.45) + (baseGap * coolingBias));
}

function getFocusArea(summary, goalKey) {
  const areaScores = Object.entries(AREA_GROUPS).map(([key, area]) => {
    const score = area.zones.reduce((sum, zone) => sum + getZoneOpportunity(summary, zone, goalKey), 0);
    return { key, ...area, score };
  });

  return areaScores.sort((a, b) => b.score - a.score)[0];
}

function getPlanAllowedFormats(profile = state.profile) {
  const program = generateWeeklyProgram(profile);
  const allowedFormats = new Set();

  program.patternItems.forEach((item) => {
    if (item.startsWith("GX: ") || item.startsWith("Group Class: ")) {
      const format = item.replace("GX: ", "").replace("Group Class: ", "");
      if (FORMAT_LIBRARY[format]) {
        allowedFormats.add(format);
      }
      return;
    }

    (PLAN_ITEM_FORMAT_OPTIONS[item] || []).forEach((format) => {
      if (FORMAT_LIBRARY[format]) {
        allowedFormats.add(format);
      }
    });
  });

  return allowedFormats;
}

function getPlanItemFormat(item) {
  if (!item) {
    return null;
  }

  if (item.startsWith("GX: ") || item.startsWith("Group Class: ")) {
    return item.replace("GX: ", "").replace("Group Class: ", "");
  }

  const gymPlanMap = {
    "Gym: Full body": "Gym Full body",
    "Gym: Upper": "Gym Upper",
    "Gym: Lower": "Gym Lower",
    "Gym: Legs": "Gym Legs",
    "Gym: Chest+Tri": "Gym Chest+Tri",
    "Gym: Back+Bicep": "Gym Back+Bicep",
    "Gym: Shoulders+Core": "Gym Shoulders+Core",
  };

  return gymPlanMap[item] || PLAN_ITEM_FORMAT_OPTIONS[item]?.[0] || null;
}

function getPlanItemLabel(item) {
  if (!item) {
    return "";
  }

  if (item.startsWith("GX: ") || item.startsWith("Group Class: ")) {
    return item.replace("GX: ", "").replace("Group Class: ", "");
  }

  return item.replace("Gym: ", "");
}

function getNextPlannedWorkout(profile = state.profile, referenceDate = state.currentDate) {
  const program = generateWeeklyProgram(profile);
  const totalCompletedWorkouts = getScenarioWorkouts().length;
  const patternLength = program.patternItems.length;
  const cycleIndex = patternLength > 0 ? totalCompletedWorkouts % patternLength : 0;
  const safeIndex = clamp(cycleIndex, 0, Math.max(0, patternLength - 1));
  const item = program.patternItems[safeIndex] || null;

  return {
    item,
    format: getPlanItemFormat(item),
    label: getPlanItemLabel(item),
    index: safeIndex,
  };
}

function getRecommendedFormat(summary, goalKey, profile = state.profile) {
  const allowedFormats = getPlanAllowedFormats(profile);
  const formatScores = Object.entries(FORMAT_LIBRARY)
    .filter(([format]) => !HIDDEN_RECOMMENDATION_FORMATS.has(format))
    .filter(([format]) => !allowedFormats.size || allowedFormats.has(format))
    .map(([format, details]) => {
    const stimulusScore = Object.entries(details.zoneWeights).reduce((sum, [zone, weight]) => {
      return sum + weight * getZoneOpportunity(summary, zone, goalKey);
    }, 0);

    const breadth = Object.values(details.zoneWeights).filter((weight) => weight >= 0.45).length;
    const breadthBonus =
      goalKey === "strength" ? breadth * 0.03 : breadth * (goalKey === "weight_loss" ? 0.05 : 0.06);
    const intensityBonus = (details.intensity / 8) * (goalKey === "strength" ? 0.08 : 0.04);

    return {
      format,
      score: stimulusScore + breadthBonus + intensityBonus,
    };
    });

  return formatScores.sort((a, b) => b.score - a.score)[0]?.format || null;
}

function formatZones(zoneKeys) {
  const labels = zoneKeys.map((zone) => ZONE_LIBRARY[zone].label);
  if (labels.length <= 1) {
    return labels[0] || "your recent progress";
  }

  if (labels.length === 2) {
    return `${labels[0]} and ${labels[1]}`;
  }

  return `${labels.slice(0, -1).join(", ")}, and ${labels[labels.length - 1]}`;
}

function getMomentumState({
  visibleZoneCount,
  coolingRisk,
  visibleDrop,
  topZoneDeclineRatio,
  hasRecentWorkout,
  improvedFromYesterday,
  previousWasCooling,
}) {
  if (hasRecentWorkout && improvedFromYesterday && previousWasCooling) {
    return "recovering";
  }

  if (hasRecentWorkout && improvedFromYesterday) {
    return "fresh_gain";
  }

  if (coolingRisk === "dropoff_risk") {
    return "slipping";
  }

  if (coolingRisk === "cooling" && (visibleDrop >= 2 || topZoneDeclineRatio >= 0.3)) {
    return "slipping";
  }

  if (coolingRisk === "cooling" || coolingRisk === "early_cooling") {
    return "cooling";
  }

  if (visibleZoneCount < 2) {
    return "flat";
  }

  return "worth_protecting";
}

function getRecoveryEffortState(coolingRisk, visibleZoneCount, daysSinceLastWorkout) {
  if (
    coolingRisk === "dropoff_risk" &&
    (visibleZoneCount <= 1 || (daysSinceLastWorkout !== null && daysSinceLastWorkout > 10))
  ) {
    return "restart";
  }

  if (
    coolingRisk === "early_cooling" ||
    coolingRisk === "stable" ||
    (coolingRisk === "cooling" && daysSinceLastWorkout !== null && daysSinceLastWorkout <= 6)
  ) {
    return "easy";
  }

  if (coolingRisk === "cooling") {
    return "moderate";
  }

  return "restart";
}

function getPulseSummary(referenceDate = state.currentDate) {
  const workouts = getScenarioWorkouts();
  const zones = getPulseStates(referenceDate, workouts);
  const assetVisualStates = getBodyAssetVisualStates(zones);
  const assetRiskSummary = getBodyAssetRiskSummary(assetVisualStates);
  const visibleZoneCount = getVisibleZoneCount(zones);
  const topZones = getTopZoneKeys(zones);
  const topZoneAverage = getTopZoneAverage(zones);
  const coverageLabel = getCoverageLabelFromCount(visibleZoneCount);
  const historicalSnapshots = getHistoricalPulseSnapshots(referenceDate, workouts);
  const peakVisibleZones7d = Math.max(...historicalSnapshots.map((snapshot) => snapshot.visibleZoneCount));
  const peakTopZoneAvg7d = Math.max(...historicalSnapshots.map((snapshot) => snapshot.topZoneAverage));
  const peakZoneActivations7d = getPeakZoneActivations(historicalSnapshots);
  const daysSinceLastWorkout = getDaysSinceLastWorkout(workouts, referenceDate);
  const visibleDrop = Math.max(0, peakVisibleZones7d - visibleZoneCount);
  const topZoneDeclineRatio =
    peakTopZoneAvg7d > 0 ? Math.max(0, (peakTopZoneAvg7d - topZoneAverage) / peakTopZoneAvg7d) : 0;
  const previousSnapshot = historicalSnapshots[1] || historicalSnapshots[0];
  const previousSnapshots = historicalSnapshots.slice(1);
  const previousPeakVisible = previousSnapshots.length
    ? Math.max(...previousSnapshots.map((snapshot) => snapshot.visibleZoneCount))
    : previousSnapshot.visibleZoneCount;
  const previousPeakTopZoneAvg = previousSnapshots.length
    ? Math.max(...previousSnapshots.map((snapshot) => snapshot.topZoneAverage))
    : previousSnapshot.topZoneAverage;
  const previousVisibleDrop = Math.max(0, previousPeakVisible - previousSnapshot.visibleZoneCount);
  const previousTopZoneDeclineRatio =
    previousPeakTopZoneAvg > 0
      ? Math.max(0, (previousPeakTopZoneAvg - previousSnapshot.topZoneAverage) / previousPeakTopZoneAvg)
      : 0;
  const improvedFromYesterday =
    visibleZoneCount > previousSnapshot.visibleZoneCount ||
    topZoneAverage - previousSnapshot.topZoneAverage >= POSITIVE_SLOPE_THRESHOLD;
  const hasRecentWorkout = daysSinceLastWorkout !== null && daysSinceLastWorkout <= 1;
  const previousWasCooling = previousVisibleDrop >= 1 || previousTopZoneDeclineRatio >= 0.1;
  const coolingRisk = getCoolingRiskState(visibleDrop, topZoneDeclineRatio, daysSinceLastWorkout);
  const momentumState = getMomentumState({
    visibleZoneCount,
    coolingRisk,
    visibleDrop,
    topZoneDeclineRatio,
    hasRecentWorkout,
    improvedFromYesterday,
    previousWasCooling,
  });
  const recoveryEffort = getRecoveryEffortState(coolingRisk, visibleZoneCount, daysSinceLastWorkout);
  const recommendedFormat = getRecommendedFormat(
    {
      zones,
      peakZoneActivations7d,
      coolingRisk,
    },
    state.profile.goal,
    state.profile,
  );
  const focusArea = getFocusArea(
    {
      zones,
      peakZoneActivations7d,
      coolingRisk,
    },
    state.profile.goal,
  );

  return {
    zones,
    assetVisualStates,
    atRiskAssetCount: assetRiskSummary.atRiskCount,
    hasAtRiskAssets: assetRiskSummary.hasAtRiskAssets,
    topZones,
    topZoneAverage,
    visibleZoneCount,
    coverageLabel,
    peakVisibleZones7d,
    peakTopZoneAvg7d,
    peakZoneActivations7d,
    momentumState,
    coolingRisk,
    recoveryEffort,
    recommendedFormat,
    focusArea,
    daysSinceLastWorkout,
  };
}

function getWeeklyLoadSubtext(weekly, pulseSummary) {
  if (weekly.sessions === 0) {
    if (pulseSummary.daysSinceLastWorkout === null) {
      return `0 sessions in the last ${ROLLING_LOAD_DAYS} days`;
    }

    return `0 sessions in the last ${ROLLING_LOAD_DAYS} days • Last workout ${formatRelativeDayLabel(pulseSummary.daysSinceLastWorkout)}`;
  }

  const recencyLabel =
    pulseSummary.daysSinceLastWorkout === null
      ? ""
      : ` • Last workout ${formatRelativeDayLabel(pulseSummary.daysSinceLastWorkout)}`;

  return `${formatSessionCount(weekly.sessions)} in the last ${ROLLING_LOAD_DAYS} days${recencyLabel}`;
}

function getWeekTransitionNarrative(currentWeek, previousWeek, recommendedFormat, referenceDate = state.currentDate) {
  if (currentWeek.sessions > 0 || previousWeek.sessions === 0) {
    return null;
  }

  const daysSinceLastWorkout = getDaysSinceLastWorkout(getScenarioWorkouts(), referenceDate);
  if (daysSinceLastWorkout === null || daysSinceLastWorkout > 8) {
    return null;
  }

  const sessionLabel = formatSessionCount(previousWeek.sessions);
  const carryForward =
    previousWeek.status === "above"
      ? "Your previous 7-day window was above target."
      : previousWeek.status === "in_range"
        ? "Your previous 7-day window landed in target."
        : `You logged ${sessionLabel} in the previous 7-day window and started building momentum.`;

  return {
    headline:
      previousWeek.status === "above" || previousWeek.status === "in_range"
        ? "Your last 7 days went well. Keep it going."
        : "Your earlier 7-day window started well. Keep the rhythm going.",
    visualState:
      previousWeek.status === "above" || previousWeek.status === "in_range" ? "positive" : "progress",
    pill: "Keep momentum",
    adherenceTitle: "Carry recent momentum forward",
    adherenceText: `${carryForward} Log ${recommendedFormat} now so the last-7-days view keeps moving.`,
    actionLabel: `Start with ${recommendedFormat}`,
    insightTitle: "Previous 7 days and next step",
    insightText: `${previousWeek.label}: ${sessionLabel}. Log ${recommendedFormat} now to keep the momentum alive.`,
  };
}

function getPulseHeaderSubtext(
  summary,
  currentWeek,
  previousWeek,
  totalWorkouts = 0,
  referenceDate = state.currentDate,
) {
  if (totalWorkouts === 0) {
    return "Start with one class and Pulse will begin tracking your last 7 days.";
  }

  if (
    currentWeek.sessions === 0 &&
    previousWeek.sessions > 0 &&
    summary.daysSinceLastWorkout !== null &&
    summary.daysSinceLastWorkout <= 8
  ) {
    return "Your earlier 7-day window went well. A fresh session now keeps the momentum moving.";
  }

  if (summary.momentumState === "fresh_gain") {
    return "You made a strong start. One more session in the next few days will build on it.";
  }

  if (summary.momentumState === "recovering") {
    return "You reversed the slide. Repeat this once more and the comeback starts to feel stable.";
  }

  if (summary.momentumState === "worth_protecting") {
    return "Your last 7 days have real momentum now. The next win is protecting it with one more class.";
  }

  if (summary.momentumState === "cooling") {
    return "You still have momentum, but the last-7-days view needs another class soon.";
  }

  if (summary.momentumState === "slipping") {
    return "Older sessions are still helping, but the last-7-days view needs a fresh workout now.";
  }

  if (summary.momentumState === "flat") {
    return "You have a good start to build from, but the last-7-days view still needs one more meaningful session.";
  }

  return "Stay close to the plan over the next 7 days and keep the next step simple.";
}

function getBodyResponseCopy(summary) {
  const mostActiveZones = getAnatomicalTopZoneKeys(summary.zones);
  const anatomicalCoverage = getAnatomicalVisibleZoneCount(summary.zones);

  return {
    mostActive: mostActiveZones.length ? formatZones(mostActiveZones) : "None",
    coverage: anatomicalCoverage > 0 ? getCoverageLabelFromCount(anatomicalCoverage) : "No zones lit yet",
  };
}

function toPercent(value, max) {
  return `${clamp((value / max) * 100, 0, 100)}%`;
}

function markPlanDirty() {
  state.planCreated = false;
}

function handleGoalStepSelection(updateProfile) {
  updateProfile();
  syncSplitPreference();
  markPlanDirty();

  const steps = getGoalSteps();
  if (state.goalStep < steps.length - 1) {
    state.goalStep += 1;
  } else {
    state.planCreated = true;
  }

  renderAll();
}

function renderTabs() {
  tabButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.tabTarget === state.activeTab);
  });

  tabScreens.forEach((screen) => {
    screen.classList.toggle("active", screen.dataset.tab === state.activeTab);
  });
}

function syncTabHash() {
  const nextHash = `#${state.activeTab}`;
  if (window.location.hash !== nextHash) {
    window.location.hash = nextHash;
  }
}

function renderButtonGroup(container, library, activeKey, onSelect) {
  container.innerHTML = "";

  Object.entries(library).forEach(([key, value]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "control-option";
    if (key === activeKey) {
      button.classList.add("active");
    }
    button.innerHTML = `<strong>${value.label}</strong><small>${value.description}</small>`;
    button.addEventListener("click", () => onSelect(key));
    container.appendChild(button);
  });
}

function renderPresenter() {
  const user = getSelectedUserProgress();
  if (!user) {
    currentDateLabel.textContent = formatFullDate(state.currentDate);
    timeControlLabel.textContent = formatFullDate(state.currentDate);
    welcomeTitle.textContent = "Create your first member";
    memberName.textContent = "No member selected";
    summaryGoal.textContent = "No goal yet";
    summaryScenario.textContent = "No workouts yet";
    summaryRange.textContent = "--";
    summaryLoad.textContent = "Waiting";
    progressDescription.textContent = "Add a user from the left pane to start goal setup and then log workouts from the main app.";
    saveStatus.textContent = "Each member saves locally on this browser until you reset or delete them.";
    return;
  }

  const goal = getGoalConfig();
  const weekly = getWeeklyLoadSummary();
  const snapshot = getProgressSnapshotCopy();
  const currentWorkout = getCurrentWorkout();

  currentDateLabel.textContent = formatFullDate(state.currentDate);
  timeControlLabel.textContent = formatFullDate(state.currentDate);
  welcomeTitle.textContent = `Good evening, ${state.profile.name.split(" ")[0]}`;
  memberName.textContent = state.profile.name;
  summaryGoal.textContent = goal.label;
  summaryScenario.textContent = snapshot.shortLabel;
  summaryRange.textContent = `${goal.targetRange[0]}-${goal.targetRange[1]} load`;
  summaryLoad.textContent = weekly.targetLabel;
  progressDescription.textContent = currentWorkout
    ? `${user.profile.name} is showing ${snapshot.timelineLabel}. Move time forward or log the next workout from the main app to update the Pulse.`
    : `${user.profile.name} has no workouts yet. Create the goal plan and log the first workout from the main app.`;
  saveStatus.textContent = `Saved locally for ${user.profile.name}. Goals, workouts, and time progression stay with this member until reset.`;
}

function renderScenarioControls() {
  const userLibrary = Object.fromEntries(
    Object.entries(state.userProgress).map(([userId, progress]) => {
      return [
        userId,
        {
          label: progress.profile.name,
          description: `${GOAL_LIBRARY[progress.profile.goal].label} • ${getProgressViewLabel(userId)}`,
        },
      ];
    }),
  );

  renderButtonGroup(userOptions, userLibrary, state.selectedUserId, (userId) => {
    syncStateToCurrentUser();
    state.selectedUserId = userId;
    syncCurrentUserToState();
    resetLogWorkoutFlow();
    syncLogWorkoutSelection();
    renderAll();
  });

  resetSelectedUserButton.disabled = !state.selectedUserId;
  deleteSelectedUserButton.disabled = !state.selectedUserId;
  resetAllUsersButton.disabled = !Object.keys(state.userProgress).length;

  renderButtonGroup(timeTravelActions, TIME_CONTROL_LIBRARY, null, (key) => {
    if (key === "today") {
      resetCurrentDate();
      return;
    }

    if (key === "plus_1") {
      shiftCurrentDate(1);
      return;
    }

    if (key === "plus_7") {
      shiftCurrentDate(7);
      return;
    }

    if (key === "plus_14") {
      shiftCurrentDate(14);
    }
  });
}

function renderGoalStepper() {
  const steps = getGoalSteps();
  goalStepper.innerHTML = "";
  const progressTrack = document.createElement("div");
  progressTrack.className = "goal-stepper-track";

  const progressFill = document.createElement("div");
  progressFill.className = "goal-stepper-fill";
  const completedSteps = state.planCreated ? steps.length : state.goalStep;
  const progressRatio = steps.length <= 0 ? 0 : completedSteps / steps.length;
  progressFill.style.width = `${Math.max(0, Math.min(100, progressRatio * 100))}%`;
  progressTrack.appendChild(progressFill);
  goalStepper.appendChild(progressTrack);
}

function renderChoiceGrid(target, library, activeKey, onSelect, className = "choice-button") {
  target.innerHTML = "";

  Object.entries(library).forEach(([key, value]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    if (key === activeKey) {
      button.classList.add("active");
    }
    button.innerHTML = `
      <span class="choice-header">
        <strong>${value.label}</strong>
      </span>
      <small>${value.description}</small>
    `;
    button.addEventListener("click", () => onSelect(key));
    target.appendChild(button);
  });
}

function getPlanDescription(profile, goal) {
  const trainingMode = getResolvedTrainingMode(profile);
  return `${LEVEL_LIBRARY[profile.startingPoint].label} • ${TRAINING_MODE_LIBRARY[trainingMode].label} • ${profile.frequency} days/week`;
}

function gx(format) {
  return `Group Class: ${format}`;
}

function getProgramStyleLabel(profile, splitKey) {
  const trainingMode = getResolvedTrainingMode(profile);

  if (trainingMode === "gx_only") {
    return "Group Classes only";
  }

  if (trainingMode === "gym_only") {
    return splitKey === "upper_lower" ? "Gym only" : "Gym only";
  }

  return "Suggested mix";
}

function getWeeklyPatternItems(profile, splitKey) {
  const frequency = Number(profile.frequency);
  const trainingMode = getResolvedTrainingMode(profile);
  const isBeginner = profile.startingPoint === "beginner";

  if (trainingMode === "gx_only" || isBeginner) {
    if (profile.goal === "general_fitness") {
      if (frequency === 2) {
        return [gx("HRX Core"), gx("Yoga")];
      }

      if (frequency === 3) {
        return [gx("HRX Quads"), gx("Boxing"), gx("Yoga")];
      }

      return frequency === 4
        ? [gx("HRX Quads"), gx("Burn"), gx("HRX Core"), gx("Yoga")]
        : [gx("HRX Quads"), gx("Burn"), gx("HRX Core"), gx("Boxing"), gx("Yoga")];
    }

    if (profile.goal === "weight_loss") {
      if (frequency === 2) {
        return [gx("HRX Quads"), gx("HRX Core")];
      }

      if (frequency === 3) {
        return [gx("HRX Quads"), gx("Burn"), gx("HRX Core")];
      }

      return frequency === 4
        ? [gx("HRX Quads"), gx("Burn"), gx("HRX Core"), gx("Yoga")]
        : [gx("HRX Quads"), gx("Burn"), gx("HRX Core"), gx("Boxing"), gx("HRX Glutes")];
    }

    if (frequency === 2) {
      return [gx("HRX Chest"), gx("HRX Quads")];
    }

    if (frequency === 3) {
      return [gx("HRX Chest"), gx("HRX Quads"), gx("HRX Core")];
    }

    return frequency === 4
      ? [gx("HRX Chest"), gx("HRX Back"), gx("HRX Quads"), gx("HRX Core")]
      : [gx("HRX Chest"), gx("HRX Back"), gx("HRX Quads"), gx("HRX Shoulders"), gx("HRX Core")];
  }

  if (trainingMode === "gym_only") {
    if (profile.goal === "general_fitness") {
      if (frequency === 2) {
        return ["Gym: Full body", "Gym: Full body"];
      }

      if (frequency === 3) {
        return splitKey === "upper_lower"
          ? ["Gym: Upper", "Gym: Lower", "Gym: Upper"]
          : ["Gym: Full body", "Gym: Full body", "Gym: Full body"];
      }

      return frequency === 4
        ? ["Gym: Upper", "Gym: Lower", "Gym: Upper", "Gym: Lower"]
        : ["Gym: Upper", "Gym: Lower", "Gym: Upper", "Gym: Lower", "Gym: Full body"];
    }

    if (profile.goal === "weight_loss") {
      if (frequency === 2) {
        return ["Gym: Full body", "Gym: Full body"];
      }

      if (frequency === 3) {
        return ["Gym: Full body", "Gym: Upper", "Gym: Lower"];
      }

      return frequency === 4
        ? ["Gym: Upper", "Gym: Lower", "Gym: Upper", "Gym: Lower"]
        : ["Gym: Upper", "Gym: Lower", "Gym: Upper", "Gym: Lower", "Gym: Full body"];
    }

    if (splitKey === "two_muscles") {
      return ["Gym: Chest+Tri", "Gym: Back+Bicep", "Gym: Legs", "Gym: Shoulders+Core", "Gym: Legs"].slice(0, frequency);
    }

    if (splitKey === "upper_lower") {
      if (frequency === 2) {
        return ["Gym: Upper", "Gym: Lower"];
      }

      if (frequency === 3) {
        return ["Gym: Upper", "Gym: Lower", "Gym: Upper"];
      }

      return frequency === 4
        ? ["Gym: Upper", "Gym: Lower", "Gym: Upper", "Gym: Lower"]
        : ["Gym: Upper", "Gym: Lower", "Gym: Upper", "Gym: Lower", "Gym: Legs"];
    }

    if (frequency === 2) {
      return ["Gym: Full body", "Gym: Full body"];
    }

    if (frequency === 3) {
      return ["Gym: Full body", "Gym: Full body", "Gym: Full body"];
    }

    return frequency === 4
      ? ["Gym: Full body", "Gym: Full body", "Gym: Upper", "Gym: Lower"]
      : ["Gym: Full body", "Gym: Full body", "Gym: Upper", "Gym: Lower", "Gym: Full body"];
  }

  if (profile.goal === "general_fitness") {
    if (frequency === 2) {
      return [gx("HRX Core"), gx("Yoga")];
    }

    if (frequency === 3) {
      return [gx("HRX Quads"), gx("Boxing"), gx("Yoga")];
    }

    if (splitKey === "upper_lower") {
      return frequency === 4
        ? ["Gym: Upper", "Gym: Lower", gx("HRX Core"), gx("Yoga")]
        : ["Gym: Upper", "Gym: Lower", gx("HRX Shoulders"), gx("Boxing"), gx("Yoga")];
    }

    return frequency === 4
      ? ["Gym: Full body", gx("HRX Quads"), gx("Boxing"), gx("Yoga")]
      : ["Gym: Full body", gx("HRX Quads"), gx("Boxing"), gx("HRX Core"), gx("Yoga")];
  }

  if (profile.goal === "weight_loss") {
    if (frequency === 2) {
      return [gx("HRX Quads"), gx("HRX Core")];
    }

    if (frequency === 3) {
      return [gx("HRX Quads"), gx("Burn"), gx("HRX Core")];
    }

    if (splitKey === "upper_lower") {
      return frequency === 4
        ? ["Gym: Upper", "Gym: Lower", gx("HRX Core"), gx("HRX Quads")]
        : ["Gym: Upper", "Gym: Lower", gx("HRX Core"), gx("HRX Quads"), gx("Burn")];
    }

    return frequency === 4
      ? [gx("HRX Quads"), gx("Burn"), gx("HRX Core"), gx("Yoga")]
      : [gx("HRX Quads"), gx("Burn"), gx("HRX Core"), gx("Boxing"), gx("HRX Glutes")];
  }

  if (splitKey === "two_muscles") {
    return ["Gym: Chest+Tri", "Gym: Back+Bicep", "Gym: Legs", "Gym: Shoulders+Core", gx("HRX Core")];
  }

  if (splitKey === "upper_lower") {
    if (frequency === 3) {
      return ["Gym: Upper", "Gym: Lower", gx("HRX Core")];
    }

    return frequency === 4
      ? ["Gym: Upper", "Gym: Lower", "Gym: Upper", gx("HRX Quads")]
      : ["Gym: Upper", "Gym: Lower", "Gym: Upper", "Gym: Lower", gx("HRX Core")];
  }

  if (frequency === 2) {
    return ["Gym: Full body", gx("HRX Core")];
  }

  if (frequency === 3) {
    return ["Gym: Full body", "Gym: Full body", gx("HRX Core")];
  }

  return frequency === 4
    ? ["Gym: Full body", "Gym: Full body", gx("HRX Quads"), gx("HRX Core")]
    : ["Gym: Full body", "Gym: Full body", "Gym: Upper", gx("HRX Quads"), gx("HRX Core")];
}

function generateWeeklyProgram(profile = state.profile) {
  const goal = getGoalConfigForProfile(profile);
  const splitKey = getResolvedSplitPreference(profile);
  const workoutStyle = getProgramStyleLabel(profile, splitKey);

  return {
    title: `${goal.label} plan`,
    description: getPlanDescription(profile, goal),
    targetRange: goal.targetRange,
    split: workoutStyle,
    patternItems: getWeeklyPatternItems(profile, splitKey),
  };
}

function renderGoalStepContent() {
  goalStepContent.innerHTML = "";

  const stepKey = getGoalSteps()[state.goalStep].key;

  if (stepKey === "goal") {
    const grid = document.createElement("div");
    grid.className = "choice-grid";
    renderChoiceGrid(grid, GOAL_LIBRARY, state.profile.goal, (goalKey) => {
      handleGoalStepSelection(() => {
        state.profile.goal = goalKey;
      });
    });
    goalStepContent.appendChild(grid);
  }

  if (stepKey === "starting_point") {
    const grid = document.createElement("div");
    grid.className = "choice-grid";
    renderChoiceGrid(grid, LEVEL_LIBRARY, state.profile.startingPoint, (startingPointKey) => {
      handleGoalStepSelection(() => {
        state.profile.startingPoint = startingPointKey;
      });
    });
    goalStepContent.appendChild(grid);
  }

  if (stepKey === "rhythm") {
    const grid = document.createElement("div");
    grid.className = "segmented-grid";
    renderChoiceGrid(grid, FREQUENCY_LIBRARY, state.profile.frequency, (frequencyKey) => {
      handleGoalStepSelection(() => {
        state.profile.frequency = frequencyKey;
      });
    }, "segmented-button");
    goalStepContent.appendChild(grid);
  }

  if (stepKey === "training_mode") {
    const grid = document.createElement("div");
    grid.className = "choice-grid";
    const trainingModes = getOrderedTrainingModes(state.profile);
    renderChoiceGrid(grid, trainingModes, getResolvedTrainingMode(state.profile), (trainingModeKey) => {
      handleGoalStepSelection(() => {
        state.profile.trainingMode = trainingModeKey;
      });
    });
    goalStepContent.appendChild(grid);

    if (state.profile.startingPoint === "beginner") {
      const hint = document.createElement("p");
      hint.className = "step-hint";
      hint.textContent = "Week one stays in guided classes so the routine feels easier to start and stick with.";
      goalStepContent.appendChild(hint);
    }
  }
}

function renderGoalPlan() {
  if (!state.planCreated) {
    planEmptyState.classList.remove("hidden");
    planSummary.classList.add("hidden");
    return;
  }

  const program = generateWeeklyProgram();

  planEmptyState.classList.add("hidden");
  planSummary.classList.remove("hidden");
  setupPreviewTitle.textContent = program.title;
  setupPreviewBody.textContent = program.description;
  previewTargetRange.textContent = `${program.targetRange[0]}-${program.targetRange[1]} load`;
  previewSplit.textContent = program.split;
  previewWeeklyPattern.innerHTML = "";
  program.patternItems.forEach((item) => {
    const chip = document.createElement("span");
    chip.className = "plan-pattern-chip";
    chip.textContent = item;
    previewWeeklyPattern.appendChild(chip);
  });
}

function renderGoal() {
  if (!state.selectedUserId) {
    goalStepTitle.textContent = "Create a member to begin";
    goalStepDescription.textContent = "Add a user from the left pane, then use this flow to capture their goal and weekly routine.";
    goalStepper.innerHTML = "";
    goalStepContent.innerHTML = '<p class="step-hint">No member selected yet. Add a user from the left pane to start goal setup.</p>';
    renderGoalPlan();
    goalBackButton.disabled = true;
    goalBackButton.style.visibility = "hidden";
    return;
  }

  clampGoalStep();
  const steps = getGoalSteps();
  const step = steps[state.goalStep];
  goalStepTitle.textContent = step.title;
  goalStepDescription.textContent = step.description;
  renderGoalStepper();
  renderGoalStepContent();
  renderGoalPlan();

  goalBackButton.disabled = state.goalStep === 0;
  goalBackButton.style.visibility = state.goalStep === 0 ? "hidden" : "visible";
}

function renderWorkoutHistoryList(target, metaTarget) {
  const workouts = getScenarioWorkouts().sort((left, right) => right.dateObject - left.dateObject);
  target.innerHTML = "";

  workouts.forEach((workout) => {
    const item = document.createElement("div");
    item.className = "workout-history-item";

    const copy = document.createElement("div");
    copy.className = "workout-history-copy";
    copy.innerHTML = `<strong>${formatWorkoutName(workout.format)}</strong><small>${formatShortDate(workout.dateObject)}</small>`;

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "workout-remove-button";
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", () => removeWorkout(Number(workout.id.replace("w", "")) - 1));

    item.append(copy, removeButton);
    target.appendChild(item);
  });

  metaTarget.textContent = state.selectedUserId
    ? workouts.length
      ? `Last workout: ${formatWorkoutName(workouts[0].format)} | ${formatShortDate(workouts[0].dateObject)}`
      : "No workouts logged yet."
    : "Add a member first to log workouts.";
}

function renderLogWorkout() {
  if (!state.selectedUserId) {
    logWorkoutTitle.textContent = "Add a member to log workouts";
    logWorkoutStepCount.textContent = "3 layers";
    logWorkoutTypeTitle.textContent = "Choose the workout type";
    logWorkoutMuscleTitle.textContent = "Choose the muscle group";
    logWorkoutMeta.textContent = "Create a member first, then log workouts from here.";
    logWorkoutSourceSection.classList.remove("hidden");
    logWorkoutTypeSection.classList.remove("hidden");
    logWorkoutMuscleSection.classList.remove("hidden");
    logWorkoutBackButton.classList.add("hidden");
    logWorkoutButton.disabled = true;
    logWorkoutButton.classList.remove("hidden");
    logWorkoutButton.textContent = "Log workout";
    logWorkoutSourceChoices.innerHTML = "";
    logWorkoutTypeChoices.innerHTML = "";
    logWorkoutMuscleChoices.innerHTML = "";
    logWorkoutHistoryList.innerHTML = "";
    logWorkoutHistoryMeta.textContent = "No workouts logged yet.";
    return;
  }

  syncLogWorkoutSelection();

  const firstName = state.profile.name.split(" ")[0];
  logWorkoutTitle.textContent = `Log ${firstName}'s workout`;
  logWorkoutStepCount.textContent = "3 layers";
  logWorkoutTypeTitle.textContent = "Choose the workout type";
  logWorkoutMuscleTitle.textContent = "Choose the muscle group";

  renderChoiceGrid(logWorkoutSourceChoices, LOG_WORKOUT_SOURCE_LIBRARY, state.logWorkoutSource, (sourceKey) => {
    state.logWorkoutSource = sourceKey;
    syncLogWorkoutSelection();
    renderLogWorkout();
  }, "log-choice-button");

  renderChoiceGrid(logWorkoutTypeChoices, getLogWorkoutTypeLibrary(), state.logWorkoutType, (typeKey) => {
    state.logWorkoutType = typeKey;
    syncLogWorkoutSelection();
    renderLogWorkout();
  }, "log-choice-button");

  const muscleLibrary = getLogWorkoutMuscleLibrary();
  logWorkoutMuscleChoices.innerHTML = "";
  if (muscleLibrary) {
    renderChoiceGrid(logWorkoutMuscleChoices, muscleLibrary, state.logWorkoutMuscle, (muscleKey) => {
      state.logWorkoutMuscle = muscleKey;
      renderLogWorkout();
    }, "log-choice-button");
  }

  const selectedSourceLabel = LOG_WORKOUT_SOURCE_LIBRARY[state.logWorkoutSource].label;
  const selectedTypeEntry = getLogWorkoutTypeLibrary()[state.logWorkoutType];
  const selectedTypeLabel = selectedTypeEntry?.label || state.logWorkoutType;
  const selectedMuscleEntry = muscleLibrary?.[state.logWorkoutMuscle] || null;
  const selectedMuscleLabel = selectedMuscleEntry?.label || null;
  logWorkoutMeta.textContent = selectedMuscleLabel
    ? `${selectedSourceLabel} | ${selectedTypeLabel} | ${selectedMuscleLabel}`
    : `${selectedSourceLabel} | ${selectedTypeLabel}`;
  logWorkoutSourceSection.classList.remove("hidden");
  logWorkoutTypeSection.classList.remove("hidden");
  logWorkoutMuscleSection.classList.toggle("hidden", !muscleLibrary);
  logWorkoutBackButton.classList.add("hidden");
  logWorkoutButton.classList.remove("hidden");
  logWorkoutButton.disabled = !getSelectedLogWorkoutFormat();
  logWorkoutButton.textContent = selectedMuscleLabel
    ? `Log ${selectedTypeLabel} ${selectedMuscleLabel}`
    : `Log ${selectedTypeLabel}`;

  renderWorkoutHistoryList(logWorkoutHistoryList, logWorkoutHistoryMeta);
}

function getPulseNarrative(summary, adherenceWeek, goal, plannedSessions, totalWorkouts = 0) {
  const topZoneText = formatZones(summary.topZones);
  const focusAreaInline = summary.focusArea?.inline || "your recent progress";
  const focusAreaLabel = summary.focusArea?.label || "Recent progress";
  const recommendedFormat = summary.recommendedFormat || DEFAULT_HRX_FORMAT;
  const remainingSessions = Math.max(0, plannedSessions - adherenceWeek.sessions);
  const sessionProgress =
    adherenceWeek.status === "above"
      ? "You are already above your 7-day target, so the next win is recovery quality."
      : adherenceWeek.status === "in_range"
        ? "You are already inside your 7-day target zone."
        : remainingSessions === 1
          ? "You are one session away from your 7-day plan."
          : `You are ${remainingSessions} sessions away from your 7-day plan.`;

  if (totalWorkouts === 0) {
    return {
      headline: "Start your first week strong.",
      visualState: "progress",
      pill: "Getting started",
      adherenceTitle: "Log your first class",
      adherenceText: `Your plan is ready. Start with one ${recommendedFormat} class and the Pulse will begin tracking your last 7 days.`,
      actionLabel: `Start with ${recommendedFormat}`,
      insightTitle: "How to begin",
      insightText: `Your first class sets the tone for the next 7 days. ${recommendedFormat} is a strong place to begin.`,
    };
  }

  if (summary.momentumState === "fresh_gain") {
    return {
      headline: "Momentum is building. Keep it going.",
      visualState: totalWorkouts === 1 ? "progress" : "positive",
      pill: "Building",
      adherenceTitle: "One more class locks this in",
      adherenceText: `Your body is already responding. Another ${recommendedFormat} session in the next few days will help the routine stick. ${sessionProgress}`,
      actionLabel: `Protect with ${recommendedFormat}`,
      insightTitle: "What changed today",
      insightText: `${topZoneText} responded today. ${sessionProgress} Another ${recommendedFormat} class soon will turn this into a pattern.`,
    };
  }

  if (summary.momentumState === "recovering") {
    return {
      headline: "You are back on track. Repeat it soon.",
      visualState: "positive",
      pill: "Recovering",
      adherenceTitle: "One more class keeps the comeback alive",
      adherenceText: `That last class reversed the slide. Repeat it once more in the next few days and the comeback will feel real. ${sessionProgress}`,
      actionLabel: `Keep it alive with ${recommendedFormat}`,
      insightTitle: "What changed today",
      insightText: `${topZoneText} came back today. ${sessionProgress} One more ${recommendedFormat} session soon keeps the comeback real.`,
    };
  }

  if (summary.momentumState === "worth_protecting") {
    return {
      headline: "Your last 7 days are working. Keep it alive.",
      visualState: "positive",
      pill: "Worth protecting",
      adherenceTitle: "Protect the momentum you built",
      adherenceText: `You have built real momentum over the last 7 days. Protect it before ${focusAreaInline} fades any further. ${sessionProgress}`,
      actionLabel: `Protect with ${recommendedFormat}`,
      insightTitle: "How to protect your last 7 days",
      insightText: `The map is broad, the last-7-days view is moving, and ${focusAreaInline} is the first place likely to fade. ${recommendedFormat} is the best class to protect that momentum.`,
    };
  }

  if (summary.momentumState === "cooling") {
    const isEarlyCooling = summary.coolingRisk === "early_cooling";
    return {
      headline: isEarlyCooling ? "Your last 7 days are cooling. Stay ahead of it." : "Your last 7 days are cooling. Catch it now.",
      visualState: isEarlyCooling ? "progress" : "risk",
      pill: isEarlyCooling ? "Cooling early" : "Cooling",
      adherenceTitle: `${focusAreaLabel} is starting to cool`,
      adherenceText: `The map is still active, but ${focusAreaInline} is cooling from its recent peak. One ${recommendedFormat} class now gets the last-7-days view back on track while the save is still easy. ${sessionProgress}`,
      actionLabel: `Restore with ${recommendedFormat}`,
      insightTitle: isEarlyCooling ? "What is starting to cool" : "What is cooling now",
      insightText: isEarlyCooling
        ? `${focusAreaLabel} is cooling before the week is complete. ${sessionProgress} One ${recommendedFormat} class will widen the map again while the save is easy.`
        : `${focusAreaLabel} is fading around ${focusAreaInline}, and the last-7-days view is still short of target. ${recommendedFormat} is the fastest way to bring it back into shape.`,
    };
  }

  if (summary.momentumState === "slipping") {
    return {
      headline: "Your last 7 days are slipping. Catch it now.",
      visualState: "risk",
      pill: summary.coolingRisk === "dropoff_risk" ? "Ready to restart" : "Momentum slipping",
      adherenceTitle: summary.coolingRisk === "dropoff_risk" ? "A single session restarts the map" : `${focusAreaLabel} is fading now`,
      adherenceText:
        summary.coolingRisk === "dropoff_risk"
          ? `Your recent progress has mostly faded, but one meaningful ${recommendedFormat} session will wake the map back up. ${sessionProgress}`
          : `Your recent progress is fading, especially around ${focusAreaInline}. One ${recommendedFormat} class is the fastest way to bring it back. ${sessionProgress}`,
      actionLabel:
        summary.coolingRisk === "dropoff_risk"
          ? `Restart with ${recommendedFormat}`
          : `Rebuild with ${recommendedFormat}`,
      insightTitle: "What your body needs now",
      insightText:
        summary.coolingRisk === "dropoff_risk"
          ? `The map has flattened around ${focusAreaInline}. One meaningful ${recommendedFormat} class will wake it back up and restart the last-7-days view.`
          : `${focusAreaLabel} is fading and the last-7-days view is slipping. One ${recommendedFormat} class brings the map back before this turns into a reset.`,
    };
  }

  if (summary.momentumState === "flat") {
    return {
      headline: "Momentum is building. Keep it going.",
      visualState: "progress",
      pill: "Getting going",
      adherenceTitle: "Add one more session soon",
      adherenceText: `You have started creating visible progress. Another ${recommendedFormat} workout in the next few days will make the pattern easier to see. ${sessionProgress}`,
      actionLabel: `Add ${recommendedFormat}`,
      insightTitle: "What changed today",
      insightText: `${topZoneText} has started responding. One more ${recommendedFormat} workout soon will make the change more visible.`,
    };
  }

  return {
    headline: "Your last 7 days are slipping. Catch it now.",
    visualState: "risk",
    pill: "Ready to restart",
    adherenceTitle: "A single session restarts the map",
    adherenceText: `Your recent progress has mostly faded, but one meaningful ${recommendedFormat} session will wake the map back up. ${sessionProgress}`,
    actionLabel: `Restart with ${recommendedFormat}`,
    insightTitle: "What your body needs now",
    insightText: `The map has flattened, especially in ${focusAreaInline}. The easiest restart is one ${recommendedFormat} class soon.`,
  };
}

function getGoalAdherenceCopy(summary, adherenceWeek, goal, plannedSessions, program) {
  const recommendedFormat = summary.recommendedFormat || DEFAULT_HRX_FORMAT;
  const remainingSessions = Math.max(0, plannedSessions - adherenceWeek.sessions);
  const recommendedSession =
    recommendedFormat === "Strength & Conditioning" ? "Strength session" : recommendedFormat;
  const daysSinceLastWorkout = summary.daysSinceLastWorkout;
  const isRestartState = daysSinceLastWorkout !== null && daysSinceLastWorkout >= 8 && !summary.hasAtRiskAssets;
  const goalContext =
    state.profile.goal === "weight_loss"
      ? "Fat-loss rhythm"
      : state.profile.goal === "strength"
        ? "Strength rhythm"
        : "Fitness rhythm";
  const sessionsLeftLabel =
    remainingSessions === 1 ? "1 session left" : `${remainingSessions} sessions left`;

  if (isRestartState) {
    return {
      title: "Restart needed",
      text: `${goalContext} | Log 1 class`,
      split: program.split,
      progress: `${adherenceWeek.sessions}/${plannedSessions} done`,
      actionLabel: `Log ${recommendedSession}`,
    };
  }

  if (summary.hasAtRiskAssets) {
    return {
      title: daysSinceLastWorkout !== null && daysSinceLastWorkout <= 5 ? "Momentum fading" : "Act now",
      text: `${goalContext} | ${recommendedSession} now`,
      split: program.split,
      progress: `${adherenceWeek.sessions}/${plannedSessions} done`,
      actionLabel: `Log ${recommendedSession}`,
    };
  }

  if (summary.coolingRisk === "cooling" && adherenceWeek.status !== "below") {
    return {
      title: "Momentum cooling",
      text: `${goalContext} | ${recommendedSession} soon`,
      split: program.split,
      progress: `${adherenceWeek.sessions}/${plannedSessions} done`,
      actionLabel: `Log ${recommendedSession}`,
    };
  }

  if (adherenceWeek.status === "in_range") {
    return {
      title: "On track",
      text: `${goalContext} | In zone`,
      split: program.split,
      progress: `${adherenceWeek.sessions}/${plannedSessions} done`,
      actionLabel: `Log ${recommendedSession}`,
    };
  }

  if (adherenceWeek.status === "above") {
    return {
      title: "Above target",
      text: `${goalContext} | Recovery focus`,
      split: program.split,
      progress: `${adherenceWeek.sessions}/${plannedSessions} done`,
      actionLabel: "Recover",
    };
  }

  if (remainingSessions <= 1) {
    return {
      title: "1 session left",
      text: `${goalContext} | ${recommendedSession} next`,
      split: program.split,
      progress: `${adherenceWeek.sessions}/${plannedSessions} done`,
      actionLabel: `Log ${recommendedSession}`,
    };
  }

  return {
    title: sessionsLeftLabel,
    text: `${goalContext} | ${recommendedSession} next`,
    split: program.split,
    progress: `${adherenceWeek.sessions}/${plannedSessions} done`,
    actionLabel: `Log ${recommendedSession}`,
  };
}

function getWeeklyLoadNarrative(weekly, latestWorkout, workoutEffort, pulseSummary) {
  const lastWorkoutLabel = formatRelativeDayLabel(pulseSummary.daysSinceLastWorkout);
  const hasFreshWorkout = pulseSummary.daysSinceLastWorkout !== null && pulseSummary.daysSinceLastWorkout <= 2;

  if (!latestWorkout) {
    if (pulseSummary.daysSinceLastWorkout === null) {
      return "No workout yet in the last 7 days.";
    }

    return `Last workout was ${lastWorkoutLabel}. The last-7-days view needs a restart.`;
  }

  const latestWorkoutLabel = `${formatWorkoutName(latestWorkout.format)} ${formatRelativeDayLabel(diffDays(state.currentDate, latestWorkout.dateObject))}`;

  if (!hasFreshWorkout && pulseSummary.coolingRisk === "dropoff_risk") {
    if (pulseSummary.hasAtRiskAssets) {
      return `${latestWorkoutLabel}. Parts of your recent progress are fading in the last 7 days.`;
    }
    return `${latestWorkoutLabel}. Momentum has dropped off in the last 7 days.`;
  }

  if (!hasFreshWorkout && (pulseSummary.coolingRisk === "cooling" || pulseSummary.coolingRisk === "early_cooling")) {
    return `${latestWorkoutLabel}. Your last-7-days view is cooling.`;
  }

  if (weekly.status === "above") {
    return `${latestWorkoutLabel}. The last 7 days are above target.`;
  }

  if (weekly.status === "in_range") {
    return `${latestWorkoutLabel}. The last 7 days are in target.`;
  }

  if (workoutEffort.key === "light") {
    return `${latestWorkoutLabel}. Good start, but the last 7 days are still building.`;
  }

  return `${latestWorkoutLabel}. The last 7 days are moving, but still below target.`;
}

function getHeaderWidget(summary, weekly, plannedSessions, totalWorkouts = 0) {
  const recommendedFormat = summary.recommendedFormat || DEFAULT_HRX_FORMAT;
  const daysSinceLastWorkout = summary.daysSinceLastWorkout;
  const remainingSessions = Math.max(0, plannedSessions - weekly.sessions);
  const hasOlderHistoryOutsideWindow = totalWorkouts > weekly.sessions;
  const hasAtRiskAssets = summary.hasAtRiskAssets;
  const isOnTrack = weekly.status === "in_range";
  const isAboveTarget = weekly.status === "above";
  const oneMoreClassLine =
    remainingSessions <= 1
      ? `One more ${recommendedFormat} soon keeps this moving.`
      : `${remainingSessions} more sessions soon rebuild the pattern.`;

  if (totalWorkouts === 0) {
    return {
      state: "progress",
      pill: "Getting started",
      headline: "Start your first week strong.",
      subtext: "Start with one class to get going.",
    };
  }

  if (hasAtRiskAssets && daysSinceLastWorkout !== null && daysSinceLastWorkout <= 2 && totalWorkouts > 1) {
    return {
      state: "progress",
      pill: "Rebalancing",
      headline: "You're getting back into rhythm. Keep going.",
      subtext: `Another ${recommendedFormat} soon will help you settle back in.`,
    };
  }

  if (daysSinceLastWorkout === 0 && hasOlderHistoryOutsideWindow && weekly.sessions === 1) {
    return {
      state: "positive",
      pill: "Recovering",
      headline: "You're back. Keep it going.",
      subtext: "Repeat it once more soon to make the comeback stick.",
    };
  }

  if (hasAtRiskAssets && daysSinceLastWorkout !== null && daysSinceLastWorkout <= 5) {
    return {
      state: "progress",
      pill: "Cooling early",
      headline: "You're losing momentum. Stay on it.",
      subtext: oneMoreClassLine,
    };
  }

  if (hasAtRiskAssets && daysSinceLastWorkout !== null && daysSinceLastWorkout <= 7) {
    return {
      state: "risk",
      pill: "Cooling",
      headline: "Your momentum is fading. Act now.",
      subtext: `Log ${recommendedFormat} soon before this turns into a restart.`,
    };
  }

  if (daysSinceLastWorkout === 0 && isAboveTarget) {
    return {
      state: "positive",
      pill: "Above target",
      headline: "You're doing well! Keep it up!",
      subtext: "You've done enough for now. Focus on recovery.",
    };
  }

  if (daysSinceLastWorkout === 0 && (isOnTrack || weekly.sessions >= plannedSessions)) {
    return {
      state: "positive",
      pill: "On track",
      headline: "You're doing well! Keep it up!",
      subtext: "Keep the rhythm going without forcing extra.",
    };
  }

  if (daysSinceLastWorkout === 0) {
    return {
      state: totalWorkouts === 1 ? "progress" : "positive",
      pill: "Building",
      headline: "You're making progress. Keep going.",
      subtext: `Another ${recommendedFormat} soon will build on this.`,
    };
  }

  if (daysSinceLastWorkout !== null && daysSinceLastWorkout <= 3) {
    if (isAboveTarget) {
      return {
        state: "positive",
        pill: "Recovery focus",
        headline: "You're doing well! Recover well.",
        subtext: "You're above target. Focus on recovery now.",
      };
    }

    if (isOnTrack) {
      return {
        state: "positive",
        pill: "On track",
        headline: "You're doing well! Keep it up!",
        subtext: "One more smart session soon keeps this going.",
      };
    }

    return {
      state: "progress",
      pill: "Worth protecting",
      headline: "You're building momentum. Keep it up!",
      subtext: oneMoreClassLine,
    };
  }

  if (daysSinceLastWorkout !== null && daysSinceLastWorkout <= 5) {
    return {
      state: "progress",
      pill: "Cooling early",
      headline: "You're losing momentum. Stay on it.",
      subtext: oneMoreClassLine,
    };
  }

  if (daysSinceLastWorkout !== null && daysSinceLastWorkout <= 7) {
    return {
      state: "risk",
      pill: "Cooling",
      headline: "Your momentum is fading. Act now.",
      subtext: `Log ${recommendedFormat} soon before this turns into a restart.`,
    };
  }

  return {
    state: "risk",
    pill: "Restart now",
    headline: "It's time to get going again. Start today.",
    subtext: `One meaningful ${recommendedFormat} session gets you moving again.`,
  };
}

function renderSupportPanel() {
  supportPanel.classList.toggle("hidden", !state.supportPanelOpen);
  helpToggleButton.textContent = state.supportPanelOpen ? "Hide help" : "Need help?";
}

function renderAdherenceProgressDots(completed, planned) {
  const safePlanned = Math.max(1, planned);
  const safeCompleted = clamp(completed, 0, safePlanned);

  adherenceProgressDots.innerHTML = "";

  const fill = document.createElement("span");
  fill.className = "adherence-progress-fill";
  fill.style.width = `${(safeCompleted / safePlanned) * 100}%`;

  const markers = document.createElement("span");
  markers.className = "adherence-progress-markers";

  Array.from({ length: safePlanned }, () => {
    const marker = document.createElement("span");
    marker.className = "adherence-progress-marker";
    markers.appendChild(marker);
  });

  adherenceProgressDots.append(fill, markers);
}

function renderPulseMap(pulseStates) {
  const assetStates = getBodyAssetVisualStates(pulseStates);
  const fadeSyncDelay = `${-((Date.now() % 2200) / 1000)}s`;

  bodyReferenceNodes.forEach((node) => {
    const assetState = assetStates[node.dataset.assetZone] || { score: 0, state: "inactive" };
    const score = assetState.visualScore ?? assetState.score ?? 0;
    node.style.setProperty("--zone-score", score.toFixed(3));
    const visibleOpacity = score <= 0 ? 0 : clamp(Math.pow(score, 1.08) * 0.92, 0, 0.92);
    node.style.setProperty("--zone-opacity", visibleOpacity.toFixed(3));
    node.style.setProperty("--fade-sync-delay", fadeSyncDelay);
    node.classList.toggle("is-at-risk", assetState.state === "at-risk");
    node.classList.toggle("is-active", assetState.state === "active");
  });
}

function getGoalAdherenceBand(completedSessions, plannedSessions) {
  const safePlanned = Math.max(1, plannedSessions);
  const adherenceRatio = clamp(completedSessions / safePlanned, 0, 1);

  if (adherenceRatio < 0.34) {
    return { band: "low", ratio: adherenceRatio };
  }

  if (adherenceRatio < 0.67) {
    return { band: "medium", ratio: adherenceRatio };
  }

  return { band: "high", ratio: adherenceRatio };
}

function isBodyMapFaded(summary) {
  return summary.visibleZoneCount <= 1 && summary.topZoneAverage < 0.22;
}

function getPulseHeaderDiagnostics(pulseSummary, adherenceWeek, plannedSessions, totalWorkouts = 0) {
  if (totalWorkouts === 0) {
    return {
      headerState: "progress",
      adherenceBand: "starting",
      adherenceRatio: 0,
      loadState: adherenceWeek.status,
      bodyMapFaded: false,
    };
  }

  const adherence = getGoalAdherenceBand(adherenceWeek.sessions, plannedSessions);
  const bodyMapFaded = totalWorkouts <= 1 ? false : isBodyMapFaded(pulseSummary);
  let headerState = "progress";

  if (
    bodyMapFaded ||
    pulseSummary.coolingRisk === "dropoff_risk" ||
    pulseSummary.momentumState === "slipping" ||
    pulseSummary.momentumState === "flat"
  ) {
    headerState = "risk";
  } else if (totalWorkouts === 1 && adherenceWeek.sessions >= 1) {
    headerState = "progress";
  } else if (adherence.band === "low") {
    headerState = "risk";
  } else if (pulseSummary.coolingRisk === "cooling" || pulseSummary.coolingRisk === "early_cooling") {
    headerState = "progress";
  } else if (adherenceWeek.status === "below") {
    headerState = "progress";
  } else {
    headerState = "positive";
  }

  return {
    headerState,
    adherenceBand: adherence.band,
    adherenceRatio: adherence.ratio,
    loadState: adherenceWeek.status,
    bodyMapFaded,
  };
}

function getCuroVisualState(headerState) {
  if (headerState === "positive") {
    return "happy";
  }

  if (headerState === "risk") {
    return "unhappy";
  }

  return "default";
}

function getResolvedHeaderState(narrativeState, fallbackHeaderState) {
  if (narrativeState === "risk") {
    return "risk";
  }

  if (narrativeState === "positive") {
    return "positive";
  }

  if (narrativeState === "progress" && fallbackHeaderState === "positive") {
    return "positive";
  }

  return narrativeState || fallbackHeaderState || "progress";
}

function renderPulse() {
  if (!state.selectedUserId) {
    renderPulseWeekDots(
      Array.from({ length: 6 }, (_, index) => ({
        weekNumber: index + 1,
        tone: "pending",
        isCurrent: index === 0,
        isFuture: index > 0,
      })),
    );
    pulseHeadline.textContent = "Add a member to start Pulse";
    pulseHeaderSubtext.textContent = "Create a member, set the goal, and Pulse will turn workouts into a rolling 7-day story.";
    pulseMomentumPill.textContent = "Waiting";
    pulseCuroVisual.src = CURO_VISUAL_LIBRARY.default;
    pulseCardTop.classList.remove("is-progress", "is-positive", "is-risk");
    pulseCardTop.classList.add("is-progress");
    pulseLoadValue.textContent = "Waiting";
    pulseLoadSubtext.textContent = "No member selected";
    miniLoadTarget.style.left = "0%";
    miniLoadTarget.style.width = "0%";
    miniLoadPrevious.style.width = "0%";
    miniLoadBoost.style.left = "0%";
    miniLoadBoost.style.width = "0%";
    loadStatusBadge.textContent = "Waiting";
    loadStatusBadge.classList.remove("in-range", "above");
    weeklyLoadNarrative.textContent = "Add a member and log a workout to start the 7-day load view.";
    goalAdherenceTitle.textContent = "No adherence data";
    goalAdherenceText.textContent = "Add member | Log workout";
    adherenceSplitLabel.textContent = "--";
    adherenceProgressLabel.textContent = "0/0 done";
    bodyMapMostActive.textContent = "Waiting";
    bodyMapMostActive.classList.remove("is-empty");
    bodyMapCoverage.textContent = "0 zones lit";
    bodyMapCoverage.classList.remove("is-empty");
    renderAdherenceProgressDots(0, 1);
    primaryAction.textContent = "Create first member";
    renderPulseMap(
      Object.fromEntries(
        Object.keys(ZONE_LIBRARY).map((zone) => [zone, { activation: 0 }]),
      ),
    );
    return;
  }

  const goal = getGoalConfig();
  const program = generateWeeklyProgram();
  const workouts = getScenarioWorkouts();
  const weekly = getWeeklyLoadSummary(state.currentDate);
  const previousRollingWeek = getWeeklyLoadSummary(addDays(state.currentDate, -7));
  const pulseSummary = getPulseSummary();
  const sixWeekJourney = getSixWeekJourney(state.currentDate, state.selectedUserId);
  const bodyResponse = getBodyResponseCopy(pulseSummary);
  const nextPlannedWorkout = getNextPlannedWorkout(state.profile, state.currentDate);
  const pulseActionSummary = {
    ...pulseSummary,
    recommendedFormat: nextPlannedWorkout.format || pulseSummary.recommendedFormat || DEFAULT_HRX_FORMAT,
  };
  const latestWorkout = getLatestCompletedWorkout(workouts);
  const workoutEffort = getWorkoutEffortSummary(latestWorkout, weekly);
  const headerWidget = getHeaderWidget(
    pulseActionSummary,
    weekly,
    Number(state.profile.frequency),
    workouts.length,
  );
  const adherence = getGoalAdherenceCopy(
    pulseActionSummary,
    weekly,
    goal,
    Number(state.profile.frequency),
    program,
  );
  const isRecoveryAction =
    adherence.actionLabel === "Recover" && weekly.sessions >= Number(state.profile.frequency);
  const latestWorkoutInWindow = weekly.latestWorkout;
  const previousWeeklyTotal = roundLoad(
    Math.max(0, weekly.total - (latestWorkoutInWindow ? latestWorkoutInWindow.sessionLoad : 0)),
  );
  const plannedSessions = Number(state.profile.frequency);
  const displayState = headerWidget.state;

  renderPulseWeekDots(sixWeekJourney);
  pulseHeadline.textContent = headerWidget.headline;
  pulseHeaderSubtext.textContent = headerWidget.subtext;
  pulseMomentumPill.textContent = headerWidget.pill;
  pulseCuroVisual.src = CURO_VISUAL_LIBRARY[getCuroVisualState(displayState)];
  pulseCardTop.classList.remove("is-progress", "is-positive", "is-risk");
  pulseCardTop.classList.add(
    displayState === "positive" ? "is-positive" : displayState === "risk" ? "is-risk" : "is-progress",
  );
  pulseMomentumPill.classList.remove("is-cooling", "is-risk", "is-recovering", "is-light", "is-moderate", "is-high", "is-very-high");
  if (workouts.length > 0) {
    pulseMomentumPill.classList.toggle("is-cooling", pulseSummary.coolingRisk === "early_cooling");
    pulseMomentumPill.classList.toggle("is-risk", pulseSummary.coolingRisk === "cooling" || pulseSummary.coolingRisk === "dropoff_risk");
    pulseMomentumPill.classList.toggle("is-recovering", pulseSummary.momentumState === "fresh_gain" || pulseSummary.momentumState === "recovering");
  }
  bodyMapMostActive.textContent = bodyResponse.mostActive;
  bodyMapMostActive.classList.toggle("is-empty", bodyResponse.mostActive === "None");
  bodyMapCoverage.textContent = bodyResponse.coverage;
  bodyMapCoverage.classList.toggle("is-empty", bodyResponse.coverage === "No zones lit yet");
  pulseLoadValue.textContent = weekly.targetLabel;
  pulseLoadSubtext.textContent = getWeeklyLoadSubtext(weekly, pulseSummary);

  miniLoadTarget.style.left = toPercent(goal.targetRange[0], LOAD_MAX);
  miniLoadTarget.style.width = toPercent(goal.targetRange[1] - goal.targetRange[0], LOAD_MAX);
  miniLoadPrevious.style.width = toPercent(previousWeeklyTotal, LOAD_MAX);
  miniLoadBoost.style.left = toPercent(previousWeeklyTotal, LOAD_MAX);
  miniLoadBoost.style.width = toPercent(
    latestWorkoutInWindow ? latestWorkoutInWindow.sessionLoad : 0,
    LOAD_MAX,
  );

  loadStatusBadge.textContent = weekly.targetLabel;
  loadStatusBadge.classList.toggle("in-range", weekly.status === "in_range");
  loadStatusBadge.classList.toggle("above", weekly.status === "above");
  weeklyLoadNarrative.textContent = getWeeklyLoadNarrative(
    weekly,
    latestWorkoutInWindow,
    workoutEffort,
    pulseSummary,
  );

  goalAdherenceTitle.textContent = adherence.title;
  goalAdherenceText.textContent = adherence.text;
  adherenceSplitLabel.textContent = adherence.split;
  adherenceProgressLabel.textContent = adherence.progress;
  renderAdherenceProgressDots(weekly.sessions, Number(state.profile.frequency));
  primaryAction.textContent =
    isRecoveryAction
      ? "Recover"
      : nextPlannedWorkout.label
        ? `Log ${nextPlannedWorkout.label}`
        : adherence.actionLabel || "View goal plan";

  renderPulseMap(pulseSummary.zones);
}

function renderAll() {
  syncStateToCurrentUser();
  renderTabs();
  renderSupportPanel();
  renderScenarioControls();
  renderPresenter();
  renderGoal();
  renderPulse();
  renderLogWorkout();
}

function resetAllUsers() {
  state.activeTab = "goal";
  state.selectedUserId = DEFAULT_USER_ID;
  state.userProgress = getDefaultUserProgressMap();
  state.supportPanelOpen = false;
  newUserNameInput.value = "";
  syncCurrentUserToState();
  syncLogWorkoutSelection();
  syncTabHash();
  renderAll();
}

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.tabTarget === "log" && state.selectedUserId) {
      const { recommendedFormat } = getPulseActionContext();
      openLogWorkout(recommendedFormat);
      return;
    }

    state.activeTab = button.dataset.tabTarget;
    syncTabHash();
    renderAll();
  });
});

goalBackButton.addEventListener("click", () => {
  if (state.goalStep > 0) {
    state.goalStep -= 1;
    renderAll();
  }
});

viewPulseFromPlan.addEventListener("click", () => {
  state.activeTab = "pulse";
  syncTabHash();
  renderAll();
});

helpToggleButton.addEventListener("click", () => {
  state.supportPanelOpen = !state.supportPanelOpen;
  renderSupportPanel();
});

primaryAction.addEventListener("click", () => {
  if (!state.selectedUserId) {
    state.activeTab = "goal";
    syncTabHash();
    renderAll();
    return;
  }

  const { isRecoveryAction, recommendedFormat } = getPulseActionContext();

  if (isRecoveryAction) {
    shiftCurrentDate(1);
    return;
  }

  syncLogWorkoutSelectionForFormat(recommendedFormat);
  logWorkout(recommendedFormat);
});

addUserButton.addEventListener("click", addUser);

newUserNameInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    addUser();
  }
});

resetSelectedUserButton.addEventListener("click", resetSelectedUser);
deleteSelectedUserButton.addEventListener("click", deleteSelectedUser);
resetAllUsersButton.addEventListener("click", resetAllUsers);

logWorkoutButton.addEventListener("click", () => {
  if (!state.selectedUserId) {
    return;
  }

  logWorkout(getSelectedLogWorkoutFormat());
});

logWorkoutBackButton.addEventListener("click", () => {
  renderLogWorkout();
});

centerConsultNudge.addEventListener("click", () => {
  centerConsultNudge.querySelector("small").textContent = "Coach consult suggested near your selected center.";
});

if (bcaNudge) {
  bcaNudge.addEventListener("click", () => {
    bcaNudge.querySelector("small").textContent = "BCA check suggested near your selected center.";
  });
}

wearableNudgeButton.addEventListener("click", () => {
  wearableNudgeText.textContent = "Wearable sync suggested. Heart rate and recovery data can sharpen Pulse accuracy.";
});

pulseBcaTrayButton.addEventListener("click", () => {
  wearableNudgeText.textContent = "BCA report suggested. Body-composition data can sharpen Pulse accuracy.";
});

askCuroButton.addEventListener("click", () => {
  pulseHeadline.textContent = "Ask Curo anything about your progress.";
  pulseHeaderSubtext.textContent = "Use Curo for recovery questions, workout choices, and body-map interpretation.";
  pulseMomentumPill.textContent = "Curo ready";
  pulseMomentumPill.classList.remove("is-cooling", "is-risk", "is-recovering", "is-light", "is-moderate", "is-high", "is-very-high");
});

window.addEventListener("hashchange", () => {
  const nextTab = window.location.hash.replace("#", "");
  if (nextTab === "goal" || nextTab === "pulse" || nextTab === "log") {
    state.activeTab = nextTab;
    renderAll();
  }
});

const initialHash = window.location.hash.replace("#", "");
if (initialHash === "goal" || initialHash === "pulse" || initialHash === "log") {
  state.activeTab = initialHash;
}

syncCurrentUserToState();
renderAll();
