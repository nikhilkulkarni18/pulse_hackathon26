const TODAY = new Date("2026-04-09T18:30:00");
const DAY_MS = 24 * 60 * 60 * 1000;
const LOAD_MAX = 36;
const ROLLING_LOAD_DAYS = 7;
const BASELINE_LOAD_DAYS = 28;
const BODY_MAP_VISIBLE_THRESHOLD = 0.3;
const TOP_ZONE_THRESHOLD = 0.12;
const POSITIVE_SLOPE_THRESHOLD = 0.04;

const BODY_ASSET_LIBRARY = {
  shoulders: { shoulders: 1 },
  arms: { arms: 0.8, shoulders: 0.2 },
  chest: { chest: 0.8, shoulders: 0.2 },
  back: { back: 0.8, core: 0.2 },
  legs: { quads: 0.32, glutes: 0.3, hamstrings: 0.22, calves: 0.16 },
};

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
      quads: 0.9,
      glutes: 0.8,
      core: 0.75,
      cardio: 0.85,
      calves: 0.4,
      hamstrings: 0.35,
    },
  },
};

const ZONE_LIBRARY = {
  shoulders: { label: "Shoulders", halfLifeDays: 5, activationTarget: 5.6 },
  arms: { label: "Arms", halfLifeDays: 5, activationTarget: 5.6 },
  chest: { label: "Chest", halfLifeDays: 5, activationTarget: 5.4 },
  core: { label: "Core", halfLifeDays: 4, activationTarget: 5.0 },
  back: { label: "Back", halfLifeDays: 5, activationTarget: 5.8 },
  glutes: { label: "Glutes", halfLifeDays: 5.5, activationTarget: 6.2 },
  quads: { label: "Quads", halfLifeDays: 5.5, activationTarget: 6.2 },
  hamstrings: { label: "Hamstrings", halfLifeDays: 4, activationTarget: 4.6 },
  calves: { label: "Calves", halfLifeDays: 4, activationTarget: 4.4 },
  cardio: { label: "Cardio", halfLifeDays: 3, activationTarget: 4.0 },
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
    label: "Lower-body signal",
    inline: "lower body",
    zones: ["quads", "glutes", "hamstrings", "calves"],
  },
  upper_body: {
    label: "Upper-body signal",
    inline: "upper body",
    zones: ["shoulders", "arms", "chest", "back"],
  },
  core: { label: "Core activation", inline: "core", zones: ["core"] },
};

const STORAGE_KEY = "cult-pulse-demo-user-progress-v1";

const USER_LIBRARY = {
  aisha: {
    label: "Aisha Rao",
    description: "Weight-loss member rebuilding her weekly rhythm.",
    profile: {
      name: "Aisha Rao",
      goal: "weight_loss",
      frequency: "4",
      startingPoint: "restarting",
      splitPreference: "upper_lower",
    },
    planCreated: true,
    defaultWorkoutStep: 2,
    workouts: [
      { date: "2026-03-29", format: "Yoga", durationMinutes: 45, source: "cult_class" },
      {
        date: "2026-04-02",
        format: "Boxing",
        durationMinutes: 44,
        source: "apple_health",
        effortRating: 7,
      },
      {
        date: "2026-04-06",
        format: "HRX",
        durationMinutes: 50,
        source: "health_connect",
        effortRating: 8,
        heartRateSummary: {
          avgBpm: 159,
          maxBpm: 184,
          zoneMinutes: { zone1: 2, zone2: 5, zone3: 15, zone4: 19, zone5: 9 },
        },
      },
      { date: "2026-04-08", format: "Yoga", durationMinutes: 48, source: "cult_class" },
      {
        date: "2026-04-09",
        format: "Boxing",
        durationMinutes: 45,
        source: "apple_health",
        effortRating: 7,
        heartRateSummary: {
          avgBpm: 152,
          maxBpm: 178,
          zoneMinutes: { zone1: 3, zone2: 7, zone3: 18, zone4: 13, zone5: 4 },
        },
      },
    ],
  },
  rohan: {
    label: "Rohan Singh",
    description: "Strength user layering volume across the week.",
    profile: {
      name: "Rohan Singh",
      goal: "strength",
      frequency: "5",
      startingPoint: "regular",
      splitPreference: "two_muscles",
    },
    planCreated: true,
    defaultWorkoutStep: 3,
    workouts: [
      {
        date: "2026-03-24",
        format: "Strength & Conditioning",
        durationMinutes: 50,
        source: "health_connect",
        effortRating: 7,
      },
      { date: "2026-03-29", format: "Burn", durationMinutes: 45, source: "cult_class" },
      {
        date: "2026-04-03",
        format: "Strength & Conditioning",
        durationMinutes: 52,
        source: "apple_health",
        effortRating: 8,
      },
      {
        date: "2026-04-07",
        format: "HRX",
        durationMinutes: 50,
        source: "health_connect",
        effortRating: 8,
        heartRateSummary: {
          avgBpm: 158,
          maxBpm: 183,
          zoneMinutes: { zone1: 1, zone2: 6, zone3: 14, zone4: 18, zone5: 11 },
        },
      },
      { date: "2026-04-09", format: "Yoga", durationMinutes: 45, source: "cult_class" },
    ],
  },
  meera: {
    label: "Meera Iyer",
    description: "General-fitness beginner easing into a repeatable routine.",
    profile: {
      name: "Meera Iyer",
      goal: "general_fitness",
      frequency: "3",
      startingPoint: "beginner",
      splitPreference: "full_body",
    },
    planCreated: false,
    defaultWorkoutStep: 1,
    workouts: [
      { date: "2026-04-04", format: "Yoga", durationMinutes: 45, source: "cult_class" },
      { date: "2026-04-07", format: "Burn", durationMinutes: 42, source: "cult_class" },
      {
        date: "2026-04-09",
        format: "Boxing",
        durationMinutes: 43,
        source: "apple_health",
        effortRating: 6,
      },
    ],
  },
};

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
    key: "split",
    title: "What kind of split do you prefer?",
    description: "Only show extra structure when it helps the plan feel more tailored.",
  },
];

const DEFAULT_USER_ID = Object.keys(USER_LIBRARY)[0];
const initialUserProgressMap = getInitialUserProgressMap();
const initialSelectedProgress = initialUserProgressMap[DEFAULT_USER_ID];

const state = {
  activeTab: "goal",
  currentDate: new Date(TODAY),
  selectedUserId: DEFAULT_USER_ID,
  userProgress: initialUserProgressMap,
  currentWorkoutStep: initialSelectedProgress.workoutStep,
  profile: { ...initialSelectedProgress.profile },
  planCreated: initialSelectedProgress.planCreated,
  goalStep: initialSelectedProgress.goalStep,
  supportPanelOpen: false,
};

const tabButtons = [...document.querySelectorAll("[data-tab-target]")];
const tabScreens = [...document.querySelectorAll("[data-tab]")];
const userOptions = document.getElementById("userOptions");
const workoutProgressOptions = document.getElementById("workoutProgressOptions");
const currentDateLabel = document.getElementById("currentDateLabel");
const welcomeTitle = document.getElementById("welcomeTitle");
const memberName = document.getElementById("memberName");
const summaryGoal = document.getElementById("summaryGoal");
const summaryScenario = document.getElementById("summaryScenario");
const summaryRange = document.getElementById("summaryRange");
const summaryLoad = document.getElementById("summaryLoad");
const progressDescription = document.getElementById("progressDescription");
const saveStatus = document.getElementById("saveStatus");
const resetButton = document.getElementById("resetDemo");
const goalStepper = document.getElementById("goalStepper");
const goalStepTitle = document.getElementById("goalStepTitle");
const goalStepCount = document.getElementById("goalStepCount");
const goalStepDescription = document.getElementById("goalStepDescription");
const goalStepContent = document.getElementById("goalStepContent");
const goalBackButton = document.getElementById("goalBackButton");
const goalNextButton = document.getElementById("goalNextButton");
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
const pulseHeadline = document.getElementById("pulseHeadline");
const pulseEffortSummary = document.getElementById("pulseEffortSummary");
const pulseMomentumPill = document.getElementById("pulseMomentumPill");
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
const trainingInsightTitle = document.getElementById("trainingInsightTitle");
const pulseCuroText = document.getElementById("pulseCuroText");
const bodyReferenceBase = document.getElementById("bodyReferenceBase");
const bodyReferenceNodes = [...document.querySelectorAll("[data-asset-zone]")];
const hotspotNodes = [...document.querySelectorAll("[data-hotspot]")];
let bodyReferenceOverlaysReady = false;
const bodyAssetPreparation = prepareBodyReferenceOverlays();

function cloneUserProfile(userId) {
  const source = USER_LIBRARY[userId].profile;
  return { ...source };
}

function createUserProgress(userId) {
  const user = USER_LIBRARY[userId];
  return {
    profile: cloneUserProfile(userId),
    planCreated: user.planCreated,
    goalStep: 0,
    workoutStep: clamp(user.defaultWorkoutStep ?? user.workouts.length, 0, user.workouts.length),
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

  return {
    profile: {
      name: typeof storedProfile.name === "string" && storedProfile.name.trim() ? storedProfile.name : fallback.profile.name,
      goal: GOAL_LIBRARY[storedProfile.goal] ? storedProfile.goal : fallback.profile.goal,
      frequency: FREQUENCY_LIBRARY[storedProfile.frequency] ? storedProfile.frequency : fallback.profile.frequency,
      startingPoint: LEVEL_LIBRARY[storedProfile.startingPoint]
        ? storedProfile.startingPoint
        : fallback.profile.startingPoint,
      splitPreference: SPLIT_LIBRARY[storedProfile.splitPreference]
        ? storedProfile.splitPreference
        : fallback.profile.splitPreference,
    },
    planCreated:
      typeof storedProgress?.planCreated === "boolean" ? storedProgress.planCreated : fallback.planCreated,
    goalStep: Number.isFinite(Number(storedProgress?.goalStep)) ? Number(storedProgress.goalStep) : fallback.goalStep,
    workoutStep: clamp(
      Number.isFinite(Number(storedProgress?.workoutStep)) ? Number(storedProgress.workoutStep) : fallback.workoutStep,
      0,
      USER_LIBRARY[userId].workouts.length,
    ),
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
    return Object.fromEntries(
      Object.keys(USER_LIBRARY).map((userId) => [userId, normalizeUserProgress(userId, parsed?.[userId])]),
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

function getSelectedUserConfig() {
  return USER_LIBRARY[state.selectedUserId];
}

function getSelectedUserProgress() {
  return state.userProgress[state.selectedUserId];
}

function getReferenceDateForWorkoutStep(userId = state.selectedUserId, workoutStep = state.currentWorkoutStep) {
  const workouts = USER_LIBRARY[userId].workouts;
  if (!workouts.length) {
    return new Date(TODAY);
  }

  if (workoutStep <= 0) {
    return addDays(new Date(`${workouts[0].date}T18:30:00`), -1);
  }

  const workout = workouts[clamp(workoutStep, 1, workouts.length) - 1];
  return new Date(`${workout.date}T18:30:00`);
}

function syncCurrentUserToState() {
  const progress = getSelectedUserProgress();
  state.profile = { ...progress.profile };
  state.planCreated = progress.planCreated;
  state.goalStep = progress.goalStep;
  state.currentWorkoutStep = clamp(progress.workoutStep, 0, getSelectedUserConfig().workouts.length);
  syncSplitPreference();
  clampGoalStep();
  state.currentDate = getReferenceDateForWorkoutStep();
}

function syncStateToCurrentUser() {
  state.userProgress[state.selectedUserId] = {
    ...getSelectedUserProgress(),
    profile: { ...state.profile },
    planCreated: state.planCreated,
    goalStep: state.goalStep,
    workoutStep: state.currentWorkoutStep,
  };
  saveUserProgressMap();
}

function getProgressViewLabel(userId = state.selectedUserId, workoutStep = state.currentWorkoutStep) {
  const totalWorkouts = USER_LIBRARY[userId].workouts.length;

  if (workoutStep <= 0) {
    return `Baseline before workouts`;
  }

  return `Workout ${workoutStep} of ${totalWorkouts}`;
}

function getCurrentWorkout(userId = state.selectedUserId, workoutStep = state.currentWorkoutStep) {
  if (workoutStep <= 0) {
    return null;
  }

  return USER_LIBRARY[userId].workouts[workoutStep - 1] || null;
}

function getNextWorkout(userId = state.selectedUserId, workoutStep = state.currentWorkoutStep) {
  return USER_LIBRARY[userId].workouts[workoutStep] || null;
}

function shouldShowSplitStep(profile = state.profile) {
  return profile.goal === "strength" || profile.startingPoint === "regular";
}

function getGoalSteps(profile = state.profile) {
  return GOAL_STEP_LIBRARY.filter((step) => step.key !== "split" || shouldShowSplitStep(profile));
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

function getResolvedSplitPreference(profile = state.profile) {
  const frequency = Number(profile.frequency);
  const preferred = profile.splitPreference || getDefaultSplit(profile);

  if (!shouldShowSplitStep(profile)) {
    return getDefaultSplit(profile);
  }

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
  state.profile.splitPreference = getResolvedSplitPreference(state.profile);
}

function startOfDay(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(date, days) {
  return new Date(startOfDay(date).getTime() + days * DAY_MS);
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

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load image: ${source}`));
    image.src = source;
  });
}

function extractOverlayMask(baseImage, overlayImage) {
  const width = baseImage.naturalWidth || baseImage.width;
  const height = baseImage.naturalHeight || baseImage.height;
  const bodyRegion = {
    left: width * 0.16,
    right: width * 0.84,
    top: height * 0.18,
    bottom: height * 0.76,
  };
  const baseCanvas = document.createElement("canvas");
  const overlayCanvas = document.createElement("canvas");
  baseCanvas.width = overlayCanvas.width = width;
  baseCanvas.height = overlayCanvas.height = height;

  const baseContext = baseCanvas.getContext("2d", { willReadFrequently: true });
  const overlayContext = overlayCanvas.getContext("2d", { willReadFrequently: true });
  baseContext.drawImage(baseImage, 0, 0, width, height);
  overlayContext.drawImage(overlayImage, 0, 0, width, height);

  const basePixels = baseContext.getImageData(0, 0, width, height);
  const overlayPixels = overlayContext.getImageData(0, 0, width, height);
  const outputPixels = overlayContext.createImageData(width, height);

  for (let index = 0; index < overlayPixels.data.length; index += 4) {
    const pixelNumber = index / 4;
    const x = pixelNumber % width;
    const y = Math.floor(pixelNumber / width);

    if (x < bodyRegion.left || x > bodyRegion.right || y < bodyRegion.top || y > bodyRegion.bottom) {
      continue;
    }

    const baseR = basePixels.data[index];
    const baseG = basePixels.data[index + 1];
    const baseB = basePixels.data[index + 2];
    const overlayR = overlayPixels.data[index];
    const overlayG = overlayPixels.data[index + 1];
    const overlayB = overlayPixels.data[index + 2];

    const diff =
      Math.abs(overlayR - baseR) + Math.abs(overlayG - baseG) + Math.abs(overlayB - baseB);
    const greenDominance = overlayG - Math.max(overlayR, overlayB);
    const brightnessGain =
      (overlayR + overlayG + overlayB) / 3 - (baseR + baseG + baseB) / 3;

    if (diff < 70 || (greenDominance < 14 && brightnessGain < 26)) {
      continue;
    }

    const maskStrength = clamp((diff - 70) / 150, 0, 1);
    const alpha = Math.round(255 * Math.max(maskStrength, clamp((greenDominance + brightnessGain) / 140, 0, 1)));

    outputPixels.data[index] = overlayR;
    outputPixels.data[index + 1] = overlayG;
    outputPixels.data[index + 2] = overlayB;
    outputPixels.data[index + 3] = alpha;
  }

  overlayContext.clearRect(0, 0, width, height);
  overlayContext.putImageData(outputPixels, 0, 0);
  return overlayCanvas.toDataURL("image/png");
}

async function prepareBodyReferenceOverlays() {
  if (!bodyReferenceBase || !bodyReferenceNodes.length) {
    return;
  }

  try {
    const baseImage = await loadImage(bodyReferenceBase.src);
    await Promise.all(
      bodyReferenceNodes.map(async (node) => {
        const overlayImage = await loadImage(node.src);
        node.src = extractOverlayMask(baseImage, overlayImage);
      }),
    );
    bodyReferenceOverlaysReady = true;
    renderPulse();
  } catch (error) {
    console.warn("Could not prepare body reference overlays.", error);
  }
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
  return getSelectedUserConfig();
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
  const end = addDays(referenceDate, -offsetDays);
  const start = addDays(end, -(windowDays - 1));
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
      guidance: "Log one workout to start building this week.",
      workoutLabel: "No workout logged yet",
    };
  }

  const band = getEffortBand(workout.sessionLoad);
  const workoutLabel = `${workout.format} • ${workout.durationMinutes} min`;

  if (weekly.status === "above") {
    return {
      ...band,
      workoutLabel,
      guidance: `${band.description} You are already above target for the week, so recovery should be the priority now.`,
    };
  }

  if (weekly.status === "in_range") {
    return {
      ...band,
      workoutLabel,
      guidance: `${band.description} You are in the right zone for your goal this week.`,
    };
  }

  if (band.key === "light") {
    return {
      ...band,
      workoutLabel,
      guidance: `${band.description} Good for consistency, but this week still needs one stronger push.`,
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
  return getScenarioConfig().workouts.slice(0, state.currentWorkoutStep).map((workout, index) => {
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
      dateObject: new Date(`${workout.date}T09:00:00`),
    };
  });
}

function getWeeklyLoadSummary() {
  const workouts = getScenarioWorkouts();
  const goal = getGoalConfig();
  const rollingWindow = getWindowRange(state.currentDate, ROLLING_LOAD_DAYS);
  const baselineWindow = getWindowRange(state.currentDate, BASELINE_LOAD_DAYS, ROLLING_LOAD_DAYS);

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

  return {
    total,
    rollingWindow,
    baselineWindow,
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
      const decayFactor = Math.pow(0.5, daysAgo / zoneConfig.halfLifeDays);
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

    const repeatedStimulusMultiplier = 1 + Math.min(0.24, Math.max(0, zoneState.hitCount - 1) * 0.08);
    const normalizedActivation =
      1 - Math.exp((-zoneState.rawStimulus * repeatedStimulusMultiplier) / ZONE_LIBRARY[zone].activationTarget);

    zoneState.activation = clamp(normalizedActivation, 0, 1);
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

function getWeightedAssetScore(zoneWeights, pulseStates) {
  const { total, weightTotal } = Object.entries(zoneWeights).reduce(
    (accumulator, [zone, weight]) => {
      accumulator.total += (pulseStates[zone]?.activation || 0) * weight;
      accumulator.weightTotal += weight;
      return accumulator;
    },
    { total: 0, weightTotal: 0 },
  );

  return weightTotal ? total / weightTotal : 0;
}

function getBodyAssetStates(pulseStates) {
  return Object.fromEntries(
    Object.entries(BODY_ASSET_LIBRARY).map(([asset, zoneWeights]) => [
      asset,
      getWeightedAssetScore(zoneWeights, pulseStates),
    ]),
  );
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

function getRecommendedFormat(summary, goalKey) {
  const formatScores = Object.entries(FORMAT_LIBRARY).map(([format, details]) => {
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
    return labels[0] || "your recent signal";
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
  if (visibleZoneCount < 2) {
    return "flat";
  }

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

function toPercent(value, max) {
  return `${clamp((value / max) * 100, 0, 100)}%`;
}

function markPlanDirty() {
  state.planCreated = false;
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
  const user = getSelectedUserConfig();
  const goal = getGoalConfig();
  const weekly = getWeeklyLoadSummary();
  const currentWorkout = getCurrentWorkout();
  const nextWorkout = getNextWorkout();

  currentDateLabel.textContent = formatFullDate(state.currentDate);
  welcomeTitle.textContent = `Good evening, ${state.profile.name.split(" ")[0]}`;
  memberName.textContent = state.profile.name;
  summaryGoal.textContent = goal.label;
  summaryScenario.textContent = getProgressViewLabel();
  summaryRange.textContent = `${goal.targetRange[0]}-${goal.targetRange[1]} load`;
  summaryLoad.textContent = weekly.targetLabel;
  progressDescription.textContent = currentWorkout
    ? `Viewing ${user.label} after ${currentWorkout.format}. ${
        nextWorkout
          ? `Next logged workout is ${nextWorkout.format}, so you can step forward and compare the pulse.`
          : `This is the latest saved workout in the sequence.`
      }`
    : `Viewing ${user.label} before the first logged workout so you can compare baseline versus workout 1, 2, and 3.`;
  saveStatus.textContent = `Saved locally for ${user.label}. Switching users restores their last selected workout step and goal setup.`;
}

function renderScenarioControls() {
  const userLibrary = Object.fromEntries(
    Object.entries(USER_LIBRARY).map(([userId, user]) => {
      const progress = state.userProgress[userId];
      return [
        userId,
        {
          label: user.label,
          description: `${GOAL_LIBRARY[progress.profile.goal].label} • ${getProgressViewLabel(userId, progress.workoutStep)}`,
        },
      ];
    }),
  );

  renderButtonGroup(userOptions, userLibrary, state.selectedUserId, (userId) => {
    syncStateToCurrentUser();
    state.selectedUserId = userId;
    syncCurrentUserToState();
    renderAll();
  });

  const workouts = getSelectedUserConfig().workouts;
  const workoutLibrary = {
    0: {
      label: "Baseline",
      description: workouts.length
        ? `Before ${workouts[0].format} on ${formatFullDate(new Date(`${workouts[0].date}T18:30:00`))}`
        : "Before any logged workouts",
    },
  };

  workouts.forEach((workout, index) => {
    workoutLibrary[index + 1] = {
      label: `Workout ${index + 1}`,
      description: `${workout.format} • ${formatFullDate(new Date(`${workout.date}T18:30:00`))}`,
    };
  });

  renderButtonGroup(workoutProgressOptions, workoutLibrary, String(state.currentWorkoutStep), (stepKey) => {
    state.currentWorkoutStep = Number(stepKey);
    state.currentDate = getReferenceDateForWorkoutStep(state.selectedUserId, state.currentWorkoutStep);
    renderAll();
  });
}

function renderGoalStepper() {
  const steps = getGoalSteps();
  goalStepper.innerHTML = "";
  steps.forEach((step, index) => {
    const chip = document.createElement("div");
    chip.className = "step-indicator";
    chip.setAttribute("aria-label", `Step ${index + 1}: ${step.title}`);
    chip.title = step.title;
    if (index === state.goalStep) {
      chip.classList.add("active");
    } else if (index < state.goalStep) {
      chip.classList.add("done");
    }
    goalStepper.appendChild(chip);
  });
}

function renderChoiceGrid(target, library, activeKey, onSelect, className = "choice-button") {
  Object.entries(library).forEach(([key, value]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    if (key === activeKey) {
      button.classList.add("active");
    }
    button.innerHTML = `<strong>${value.label}</strong><small>${value.description}</small>`;
    button.addEventListener("click", () => onSelect(key));
    target.appendChild(button);
  });
}

function getPlanDescription(profile, goal) {
  return `${LEVEL_LIBRARY[profile.startingPoint].label} • ${profile.frequency} days/week`;
}

function getWeeklyPatternItems(profile, splitKey) {
  const frequency = Number(profile.frequency);

  if (profile.goal === "general_fitness") {
    if (frequency === 2) {
      return ["Gym: Full body", "GX: Yoga"];
    }

    if (frequency === 3) {
      return ["Gym: Full body", "GX: Boxing", "GX: Yoga"];
    }

    if (splitKey === "upper_lower") {
      return frequency === 4
        ? ["Gym: Upper", "Gym: Lower", "GX: Boxing", "GX: Yoga"]
        : ["Gym: Upper", "Gym: Lower", "GX: Boxing", "GX: Yoga", "GX: Burn"];
    }

    return frequency === 4
      ? ["Gym: Full body", "Gym: Full body", "GX: Boxing", "GX: Yoga"]
      : ["Gym: Full body", "Gym: Full body", "GX: Boxing", "GX: Yoga", "GX: Burn"];
  }

  if (profile.goal === "weight_loss") {
    if (frequency === 2) {
      return ["GX: HRX", "GX: Boxing"];
    }

    if (frequency === 3) {
      return ["GX: HRX", "GX: Burn", "GX: Yoga"];
    }

    if (splitKey === "upper_lower") {
      return frequency === 4
        ? ["Gym: Upper", "Gym: Lower", "GX: HRX", "GX: Yoga"]
        : ["Gym: Upper", "Gym: Lower", "GX: HRX", "GX: Burn", "GX: Yoga"];
    }

    return frequency === 4
      ? ["GX: HRX", "GX: Burn", "Gym: Full body", "GX: Yoga"]
      : ["GX: HRX", "GX: Burn", "Gym: Full body", "GX: Boxing", "GX: Yoga"];
  }

  if (splitKey === "two_muscles") {
    return ["Gym: Chest+Tri", "Gym: Back+Bicep", "Gym: Legs", "Gym: Shoulders+Core", "GX: Yoga"];
  }

  if (splitKey === "upper_lower") {
    if (frequency === 3) {
      return ["Gym: Upper", "Gym: Lower", "GX: Yoga"];
    }

    return frequency === 4
      ? ["Gym: Upper", "Gym: Lower", "Gym: Upper", "Gym: Lower"]
      : ["Gym: Upper", "Gym: Lower", "Gym: Upper", "Gym: Lower", "GX: Yoga"];
  }

  if (frequency === 2) {
    return ["Gym: Full body", "Gym: Full body"];
  }

  if (frequency === 3) {
    return ["Gym: Full body", "Gym: Full body", "GX: Yoga"];
  }

  return frequency === 4
    ? ["Gym: Full body", "Gym: Upper", "Gym: Lower", "GX: Yoga"]
    : ["Gym: Full body", "Gym: Full body", "Gym: Upper", "Gym: Lower", "GX: Yoga"];
}

function generateWeeklyProgram(profile = state.profile) {
  const goal = getGoalConfigForProfile(profile);
  const splitKey = getResolvedSplitPreference(profile);

  return {
    title: `${goal.label} plan`,
    description: getPlanDescription(profile, goal),
    targetRange: goal.targetRange,
    split: SPLIT_LIBRARY[splitKey].label,
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
      state.profile.goal = goalKey;
      syncSplitPreference();
      markPlanDirty();
      renderAll();
    });
    goalStepContent.appendChild(grid);
  }

  if (stepKey === "starting_point") {
    const grid = document.createElement("div");
    grid.className = "choice-grid";
    renderChoiceGrid(grid, LEVEL_LIBRARY, state.profile.startingPoint, (startingPointKey) => {
      state.profile.startingPoint = startingPointKey;
      syncSplitPreference();
      markPlanDirty();
      renderAll();
    });
    goalStepContent.appendChild(grid);
  }

  if (stepKey === "rhythm") {
    const grid = document.createElement("div");
    grid.className = "segmented-grid";
    renderChoiceGrid(grid, FREQUENCY_LIBRARY, state.profile.frequency, (frequencyKey) => {
      state.profile.frequency = frequencyKey;
      syncSplitPreference();
      markPlanDirty();
      renderAll();
    }, "segmented-button");
    goalStepContent.appendChild(grid);
  }

  if (stepKey === "split") {
    const grid = document.createElement("div");
    grid.className = "choice-grid";
    renderChoiceGrid(grid, SPLIT_LIBRARY, getResolvedSplitPreference(state.profile), (splitKey) => {
      state.profile.splitPreference = splitKey;
      syncSplitPreference();
      markPlanDirty();
      renderAll();
    });
    goalStepContent.appendChild(grid);

    const hint = document.createElement("p");
    hint.className = "step-hint";
    hint.textContent = "If this feels too advanced, we will keep the plan broad and default to full body.";
    goalStepContent.appendChild(hint);
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
  previewTargetRange.textContent = "Target zone";
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
  clampGoalStep();
  const steps = getGoalSteps();
  const step = steps[state.goalStep];
  goalStepTitle.textContent = step.title;
  goalStepDescription.textContent = step.description;
  goalStepCount.textContent = `Step ${state.goalStep + 1} of ${steps.length}`;
  renderGoalStepper();
  renderGoalStepContent();
  renderGoalPlan();

  goalBackButton.disabled = state.goalStep === 0;
  goalBackButton.style.visibility = state.goalStep === 0 ? "hidden" : "visible";

  if (state.goalStep === steps.length - 1) {
    goalNextButton.textContent = "Create my plan";
  } else {
    goalNextButton.textContent = "Next";
  }
}

function getPulseNarrative(summary, weekly, goal, plannedSessions) {
  const topZoneText = formatZones(summary.topZones);
  const focusAreaInline = summary.focusArea?.inline || "your recent signal";
  const focusAreaLabel = summary.focusArea?.label || "Recent signal";
  const recommendedFormat = summary.recommendedFormat || "HRX";
  const sessionProgress = `${weekly.sessions}/${plannedSessions} sessions are done so far.`;
  const goalFrame =
    state.profile.goal === "weight_loss"
      ? "Keeping the map broad matters more than chasing a perfect score."
      : state.profile.goal === "strength"
        ? "The win now is repeating the right signal before it fades."
        : "Protecting the rhythm matters more than overreaching.";

  if (summary.momentumState === "fresh_gain") {
    return {
      headline: "Your map is waking up.",
      pill: "Fresh gain",
      adherenceTitle: "One more class locks this in",
      adherenceText: `You have live signal on the map now. Another ${recommendedFormat} session this week will help the routine stick. ${sessionProgress}`,
      actionLabel: `Protect with ${recommendedFormat}`,
      insightTitle: "What changed today",
      insightText: `That session activated ${topZoneText}. The next win is not intensity, it is protecting the signal before it cools.`,
    };
  }

  if (summary.momentumState === "recovering") {
    return {
      headline: "You brought the signal back.",
      pill: "Recovering",
      adherenceTitle: "One more class keeps the comeback alive",
      adherenceText: `That last class reversed the slide. Repeat it once more this week and the comeback will feel real. ${sessionProgress}`,
      actionLabel: `Keep it alive with ${recommendedFormat}`,
      insightTitle: "What changed today",
      insightText: `That return session brought the signal back across ${topZoneText}. One more workout this week helps lock the comeback in.`,
    };
  }

  if (summary.momentumState === "worth_protecting") {
    return {
      headline: "This week has momentum.",
      pill: "Worth protecting",
      adherenceTitle: "Protect the momentum you built",
      adherenceText: `You have built a strong recent signal. Protect it before ${focusAreaInline} cools any further. ${sessionProgress}`,
      actionLabel: `Protect with ${recommendedFormat}`,
      insightTitle: "How to protect this week",
      insightText: `Your map is broad enough to feel like momentum now. ${focusAreaLabel} is the part to watch next. ${goalFrame}`,
    };
  }

  if (summary.momentumState === "cooling") {
    const isEarlyCooling = summary.coolingRisk === "early_cooling";
    return {
      headline: isEarlyCooling ? "A couple of areas are starting to cool." : "Your pulse is cooling this week.",
      pill: isEarlyCooling ? "Cooling early" : "Cooling",
      adherenceTitle: `${focusAreaLabel} is starting to cool`,
      adherenceText: `The map is still active, but ${focusAreaInline} is slipping from its recent peak. One ${recommendedFormat} class this week restores the curve while the week is still easy to save. ${sessionProgress}`,
      actionLabel: `Restore with ${recommendedFormat}`,
      insightTitle: isEarlyCooling ? "What is starting to cool" : "What is cooling now",
      insightText: `The recent signal is fading, especially around ${focusAreaInline}. ${recommendedFormat} is the easiest way to widen the map again.`,
    };
  }

  if (summary.momentumState === "slipping") {
    return {
      headline: summary.coolingRisk === "dropoff_risk" ? "Your map has flattened." : "Your pulse is cooling this week.",
      pill: summary.coolingRisk === "dropoff_risk" ? "Ready to restart" : "Momentum slipping",
      adherenceTitle: summary.coolingRisk === "dropoff_risk" ? "A single session restarts the map" : `${focusAreaLabel} is fading this week`,
      adherenceText:
        summary.coolingRisk === "dropoff_risk"
          ? `The recent signal has mostly cooled off, but one meaningful ${recommendedFormat} session will wake the map back up. ${sessionProgress}`
          : `The recent signal is fading, especially around ${focusAreaInline}. One ${recommendedFormat} class is the fastest way to bring it back. ${sessionProgress}`,
      actionLabel:
        summary.coolingRisk === "dropoff_risk"
          ? `Restart with ${recommendedFormat}`
          : `Rebuild with ${recommendedFormat}`,
      insightTitle: "What your body needs now",
      insightText:
        summary.coolingRisk === "dropoff_risk"
          ? `This is a restart moment, not a failure. The easiest way back is one ${recommendedFormat} class that wakes up ${focusAreaInline} again.`
          : `This is a recoverable dip, not a reset. A ${recommendedFormat} class would restart ${focusAreaInline} and widen the map again.`,
    };
  }

  return {
    headline: "Your map has flattened.",
    pill: "Ready to restart",
    adherenceTitle: "A single session restarts the map",
    adherenceText: `The recent signal has mostly cooled off, but one meaningful ${recommendedFormat} session will wake the map back up. ${sessionProgress}`,
    actionLabel: `Restart with ${recommendedFormat}`,
    insightTitle: "What your body needs now",
    insightText: `The map has flattened, especially in ${focusAreaInline}. The easiest restart is one ${recommendedFormat} class this week.`,
  };
}

function getGoalAdherenceCopy(summary, weekly, goal, plannedSessions, program) {
  const recommendedFormat = summary.recommendedFormat || "HRX";
  const remainingSessions = Math.max(0, plannedSessions - weekly.sessions);
  const recommendedSession =
    recommendedFormat === "Strength & Conditioning" ? "Strength session" : recommendedFormat;

  if (weekly.status === "in_range") {
    return {
      title: `${goal.label} plan is on track`,
      text: "You are in the right zone for this week, and the plan is holding steady.",
      split: program.split,
      progress: `${weekly.sessions}/${plannedSessions} done`,
      actionLabel: `Keep ${recommendedSession} in rotation`,
    };
  }

  if (weekly.status === "above") {
    return {
      title: `${goal.label} plan is above target`,
      text: "You have already gone above target this week.",
      split: program.split,
      progress: `${weekly.sessions}/${plannedSessions} done`,
      actionLabel: "Prioritize recovery",
    };
  }

  if (summary.coolingRisk === "dropoff_risk") {
    return {
      title: `${goal.label} plan needs a restart`,
      text: "This week has dropped off and the plan needs a restart.",
      split: program.split,
      progress: `${weekly.sessions}/${plannedSessions} done`,
      actionLabel: `Plan ${recommendedSession}`,
    };
  }

  if (remainingSessions <= 1) {
    return {
      title: `${goal.label} plan needs one more session`,
      text: "You are close to target, with one session still left to complete the week.",
      split: program.split,
      progress: `${weekly.sessions}/${plannedSessions} done`,
      actionLabel: `Plan ${recommendedSession}`,
    };
  }

  return {
    title: `${goal.label} plan is behind this week`,
    text: "This week is still below target, and the plan is not fully back on track yet.",
    split: program.split,
    progress: `${weekly.sessions}/${plannedSessions} done`,
    actionLabel: `Plan ${recommendedSession}`,
  };
}

function getWeeklyLoadNarrative(weekly, latestWorkout, workoutEffort) {
  if (!latestWorkout) {
    return "No workout has landed in this week's view yet.";
  }

  if (weekly.status === "above") {
    return `${workoutEffort.headline} from your latest ${latestWorkout.format} session pushed the week above target.`;
  }

  if (weekly.status === "in_range") {
    return `${workoutEffort.headline} from your latest ${latestWorkout.format} session moved the week into target.`;
  }

  if (workoutEffort.key === "light") {
    return `${workoutEffort.headline} from your latest ${latestWorkout.format} session nudged the week forward, but this week is still building.`;
  }

  return `${workoutEffort.headline} from your latest ${latestWorkout.format} session moved the week forward, but it is still below target.`;
}

function renderSupportPanel() {
  supportPanel.classList.toggle("hidden", !state.supportPanelOpen);
  helpToggleButton.textContent = state.supportPanelOpen ? "Hide help" : "Need help?";
}

function renderAdherenceProgressDots(completed, planned) {
  adherenceProgressDots.innerHTML = "";

  Array.from({ length: planned }, (_, index) => {
    const dot = document.createElement("span");
    dot.className = "adherence-progress-dot";
    if (index < completed) {
      dot.classList.add("done");
    }
    adherenceProgressDots.appendChild(dot);
  });
}

function renderPulseMap(pulseStates) {
  const assetScores = getBodyAssetStates(pulseStates);

  bodyReferenceNodes.forEach((node) => {
    const score = assetScores[node.dataset.assetZone] || 0;
    node.style.setProperty("--zone-score", score.toFixed(3));
    if (!bodyReferenceOverlaysReady) {
      node.style.opacity = "0";
      return;
    }
    node.style.opacity = `${clamp(Math.pow(score, 0.9) * 0.98, 0, 0.98)}`;
  });

  hotspotNodes.forEach((node) => {
    const score = pulseStates[node.dataset.hotspot]?.activation || 0;
    node.style.opacity = `${clamp(score * 0.8, 0.04, 0.78)}`;
    node.style.transform = `scale(${1 + clamp(score * 0.14, 0, 0.2)})`;
  });
}

function renderPulse() {
  const goal = getGoalConfig();
  const program = generateWeeklyProgram();
  const workouts = getScenarioWorkouts();
  const weekly = getWeeklyLoadSummary();
  const pulseSummary = getPulseSummary();
  const latestWorkout = getLatestCompletedWorkout(workouts);
  const workoutEffort = getWorkoutEffortSummary(latestWorkout, weekly);
  const narrative = getPulseNarrative(pulseSummary, weekly, goal, Number(state.profile.frequency));
  const adherence = getGoalAdherenceCopy(
    pulseSummary,
    weekly,
    goal,
    Number(state.profile.frequency),
    program,
  );
  const latestWorkoutInWindow =
    latestWorkout &&
    latestWorkout.dateObject >= weekly.rollingWindow.start &&
    latestWorkout.dateObject <= weekly.rollingWindow.end
      ? latestWorkout
      : null;
  const previousWeeklyTotal = roundLoad(
    Math.max(0, weekly.total - (latestWorkoutInWindow ? latestWorkoutInWindow.sessionLoad : 0)),
  );

  pulseHeadline.textContent = narrative.headline;
  pulseEffortSummary.textContent = narrative.insightText;
  pulseMomentumPill.textContent = narrative.pill;
  pulseMomentumPill.classList.remove("is-cooling", "is-risk", "is-recovering", "is-light", "is-moderate", "is-high", "is-very-high");
  pulseMomentumPill.classList.toggle("is-cooling", pulseSummary.coolingRisk === "early_cooling");
  pulseMomentumPill.classList.toggle("is-risk", pulseSummary.coolingRisk === "cooling" || pulseSummary.coolingRisk === "dropoff_risk");
  pulseMomentumPill.classList.toggle("is-recovering", pulseSummary.momentumState === "fresh_gain" || pulseSummary.momentumState === "recovering");
  pulseLoadValue.textContent = weekly.targetLabel;
  pulseLoadSubtext.textContent = latestWorkout
    ? `Latest workout: ${latestWorkout.format} • ${latestWorkout.durationMinutes} min • ${workoutEffort.headline}`
    : `${weekly.sessions} sessions in the last ${ROLLING_LOAD_DAYS} days`;

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
  );

  goalAdherenceTitle.textContent = adherence.title;
  goalAdherenceText.textContent = adherence.text;
  adherenceSplitLabel.textContent = adherence.split;
  adherenceProgressLabel.textContent = adherence.progress;
  renderAdherenceProgressDots(weekly.sessions, Number(state.profile.frequency));
  primaryAction.textContent = adherence.actionLabel || "View goal plan";
  trainingInsightTitle.textContent = "What today means";
  pulseCuroText.textContent = workoutEffort.guidance;

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
}

function resetDemo() {
  state.activeTab = "goal";
  state.selectedUserId = DEFAULT_USER_ID;
  state.userProgress = getDefaultUserProgressMap();
  state.supportPanelOpen = false;
  syncCurrentUserToState();
  syncTabHash();
  renderAll();
}

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
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

goalNextButton.addEventListener("click", () => {
  const steps = getGoalSteps();

  if (state.goalStep < steps.length - 1) {
    state.goalStep += 1;
    renderAll();
    return;
  }

  syncSplitPreference();
  state.planCreated = true;
  renderAll();
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
  state.activeTab = "goal";
  syncTabHash();
  renderAll();
});

resetButton.addEventListener("click", resetDemo);

centerConsultNudge.addEventListener("click", () => {
  centerConsultNudge.querySelector("small").textContent = "Coach consult suggested near your selected center.";
});

bcaNudge.addEventListener("click", () => {
  bcaNudge.querySelector("small").textContent = "BCA check suggested near your selected center.";
});

window.addEventListener("hashchange", () => {
  const nextTab = window.location.hash.replace("#", "");
  if (nextTab === "goal" || nextTab === "pulse") {
    state.activeTab = nextTab;
    renderAll();
  }
});

const initialHash = window.location.hash.replace("#", "");
if (initialHash === "goal" || initialHash === "pulse") {
  state.activeTab = initialHash;
}

syncCurrentUserToState();
renderAll();
