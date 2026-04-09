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
    key: "split",
    title: "What kind of split do you prefer?",
    description: "Only show extra structure when it helps the plan feel more tailored.",
  },
];

const DEFAULT_USER_ID = Object.keys(USER_LIBRARY)[0] || null;
const DEFAULT_PROFILE = {
  name: "New member",
  goal: "general_fitness",
  frequency: "3",
  startingPoint: "beginner",
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
};

const tabButtons = [...document.querySelectorAll("[data-tab-target]")];
const tabScreens = [...document.querySelectorAll("[data-tab]")];
const newUserNameInput = document.getElementById("newUserNameInput");
const addUserButton = document.getElementById("addUserButton");
const userOptions = document.getElementById("userOptions");
const workoutLogActions = document.getElementById("workoutLogActions");
const workoutHistoryList = document.getElementById("workoutHistoryList");
const workoutHistoryMeta = document.getElementById("workoutHistoryMeta");
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
const pulseCardTop = document.getElementById("pulseCardTop");
const pulseHeadline = document.getElementById("pulseHeadline");
const pulseMomentumPill = document.getElementById("pulseMomentumPill");
const pulseCuroVisual = document.getElementById("pulseCuroVisual");
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
const bodyReferenceBase = document.getElementById("bodyReferenceBase");
const bodyReferenceNodes = [...document.querySelectorAll("[data-asset-zone]")];
const hotspotNodes = [...document.querySelectorAll("[data-hotspot]")];
let bodyReferenceOverlaysReady = false;
const bodyAssetPreparation = prepareBodyReferenceOverlays();

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
    splitPreference: SPLIT_LIBRARY[profile.splitPreference]
      ? profile.splitPreference
      : DEFAULT_PROFILE.splitPreference,
  };
}

function createUserProgress(userId, seedUser = USER_LIBRARY[userId], nameOverride = null) {
  const profile = cloneUserProfile({
    ...DEFAULT_PROFILE,
    ...(seedUser?.profile || {}),
    ...(nameOverride ? { name: nameOverride } : {}),
  });

  return {
    profile,
    planCreated: seedUser?.planCreated ?? false,
    goalStep: 0,
    workouts: (seedUser?.workouts || []).map(cloneWorkout),
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
    workouts: Array.isArray(storedProgress?.workouts)
      ? storedProgress.workouts.map(cloneWorkout)
      : fallbackWorkouts,
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
  state.currentDate = getReferenceDateForUser();
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
  };
  saveUserProgressMap();
}

function getReferenceDateForUser(userId = state.selectedUserId) {
  const latestWorkout = getCurrentWorkout(userId);
  return latestWorkout ? getWorkoutDateObject(latestWorkout) : new Date(TODAY);
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
  syncTabHash();
  renderAll();
}

function getNewWorkoutDateTime(workouts) {
  return new Date(TODAY.getTime() + (workouts.length * 60 * 60 * 1000)).toISOString();
}

function logWorkout(format) {
  const record = getSelectedUserProgress();
  if (!record) {
    return;
  }

  const formatDetails = FORMAT_LIBRARY[format];

  record.workouts = [
    ...record.workouts,
    {
      dateTime: getNewWorkoutDateTime(record.workouts),
      format,
      durationMinutes: formatDetails.defaultDurationMinutes,
      source: "cult_class",
    },
  ];

  state.userProgress[state.selectedUserId] = record;
  saveUserProgressMap();
  syncCurrentUserToState();
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

function endOfDay(date) {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
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

function formatShortDate(date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
  }).format(date);
}

function formatWorkoutName(format) {
  return format === "Strength & Conditioning" ? "S&C" : format;
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
  const user = getSelectedUserProgress();
  if (!user) {
    currentDateLabel.textContent = formatFullDate(state.currentDate);
    welcomeTitle.textContent = "Create your first member";
    memberName.textContent = "No member selected";
    summaryGoal.textContent = "No goal yet";
    summaryScenario.textContent = "No workouts yet";
    summaryRange.textContent = "--";
    summaryLoad.textContent = "Waiting";
    progressDescription.textContent = "Add a user from the left pane to start goal setup and workout tracking.";
    saveStatus.textContent = "Once you add a member, goal edits and workouts will be saved locally until reset.";
    return;
  }

  const goal = getGoalConfig();
  const weekly = getWeeklyLoadSummary();
  const snapshot = getProgressSnapshotCopy();
  const currentWorkout = getCurrentWorkout();

  currentDateLabel.textContent = formatFullDate(state.currentDate);
  welcomeTitle.textContent = `Good evening, ${state.profile.name.split(" ")[0]}`;
  memberName.textContent = state.profile.name;
  summaryGoal.textContent = goal.label;
  summaryScenario.textContent = snapshot.shortLabel;
  summaryRange.textContent = `${goal.targetRange[0]}-${goal.targetRange[1]} load`;
  summaryLoad.textContent = weekly.targetLabel;
  progressDescription.textContent = currentWorkout
    ? `${user.profile.name} is showing ${snapshot.timelineLabel}. Log another workout on the left and this view will update immediately.`
    : `${user.profile.name} has no workouts yet. Create the goal plan and log the first class from the left pane.`;
  saveStatus.textContent = `Saved locally for ${user.profile.name}. Goal edits and logged workouts stay with this member until you reset.`;
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
    renderAll();
  });

  const workoutActions = Object.fromEntries(
    Object.entries(FORMAT_LIBRARY).map(([format, details]) => [
      format,
      {
        label: format,
        description: `${details.defaultDurationMinutes} min • Tap to log`,
      },
    ]),
  );

  renderButtonGroup(workoutLogActions, workoutActions, null, (format) => {
    logWorkout(format);
  });

  const workouts = getScenarioWorkouts().sort((left, right) => right.dateObject - left.dateObject);

  workoutHistoryList.innerHTML = "";

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
    workoutHistoryList.appendChild(item);
  });

  workoutHistoryMeta.textContent = state.selectedUserId
    ? workouts.length
    ? `Last workout: ${formatWorkoutName(workouts[0].format)} | ${formatShortDate(workouts[0].dateObject)}`
    : "No workouts logged yet. Use the buttons above to add the first class."
    : "Add a member first, then log workouts here.";
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
    goalStepCount.textContent = "No member selected";
    goalStepper.innerHTML = "";
    goalStepContent.innerHTML = '<p class="step-hint">No member selected yet. Add a user from the left pane to start goal setup.</p>';
    renderGoalPlan();
    goalBackButton.disabled = true;
    goalBackButton.style.visibility = "hidden";
    goalNextButton.disabled = true;
    goalNextButton.textContent = "Next";
    return;
  }

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
  goalNextButton.disabled = false;
}

function getPulseNarrative(summary, weekly, goal, plannedSessions) {
  const topZoneText = formatZones(summary.topZones);
  const focusAreaInline = summary.focusArea?.inline || "your recent signal";
  const focusAreaLabel = summary.focusArea?.label || "Recent signal";
  const recommendedFormat = summary.recommendedFormat || "HRX";
  const remainingSessions = Math.max(0, plannedSessions - weekly.sessions);
  const sessionProgress =
    weekly.status === "above"
      ? "You are already above your weekly load target, so the next win is recovery quality."
      : weekly.status === "in_range"
        ? "You are already inside your weekly load zone."
        : remainingSessions === 1
          ? "You are one session away from your weekly plan."
          : `You are ${remainingSessions} sessions away from your weekly plan.`;

  if (summary.momentumState === "fresh_gain") {
    return {
      headline: "Momentum is building. Keep it going.",
      pill: "Fresh gain",
      adherenceTitle: "One more class locks this in",
      adherenceText: `You have live signal on the map now. Another ${recommendedFormat} session this week will help the routine stick. ${sessionProgress}`,
      actionLabel: `Protect with ${recommendedFormat}`,
      insightTitle: "What changed today",
      insightText: `${topZoneText} showed activity today. ${sessionProgress} Another ${recommendedFormat} class before it cools will turn this into a pattern.`,
    };
  }

  if (summary.momentumState === "recovering") {
    return {
      headline: "You are back on track. Repeat it this week.",
      pill: "Recovering",
      adherenceTitle: "One more class keeps the comeback alive",
      adherenceText: `That last class reversed the slide. Repeat it once more this week and the comeback will feel real. ${sessionProgress}`,
      actionLabel: `Keep it alive with ${recommendedFormat}`,
      insightTitle: "What changed today",
      insightText: `${topZoneText} came back today. ${sessionProgress} One more ${recommendedFormat} session this week keeps the comeback real.`,
    };
  }

  if (summary.momentumState === "worth_protecting") {
    return {
      headline: "This week is working. Keep it alive.",
      pill: "Worth protecting",
      adherenceTitle: "Protect the momentum you built",
      adherenceText: `You have built a strong recent signal. Protect it before ${focusAreaInline} cools any further. ${sessionProgress}`,
      actionLabel: `Protect with ${recommendedFormat}`,
      insightTitle: "How to protect this week",
      insightText: `The map is broad, load is moving, and ${focusAreaInline} is the first place likely to fade. ${recommendedFormat} is the best class to protect the week.`,
    };
  }

  if (summary.momentumState === "cooling") {
    const isEarlyCooling = summary.coolingRisk === "early_cooling";
    return {
      headline: isEarlyCooling
        ? "Momentum is cooling. Catch it now."
        : "Progress is cooling. Act this week.",
      pill: isEarlyCooling ? "Cooling early" : "Cooling",
      adherenceTitle: `${focusAreaLabel} is starting to cool`,
      adherenceText: `The map is still active, but ${focusAreaInline} is slipping from its recent peak. One ${recommendedFormat} class this week restores the curve while the week is still easy to save. ${sessionProgress}`,
      actionLabel: `Restore with ${recommendedFormat}`,
      insightTitle: isEarlyCooling ? "What is starting to cool" : "What is cooling now",
      insightText: isEarlyCooling
        ? `${focusAreaLabel} is slipping before the week is complete. ${sessionProgress} One ${recommendedFormat} class will widen the map again while the save is easy.`
        : `Recent signal is fading around ${focusAreaInline}, and load is still short of target. ${recommendedFormat} is the fastest way to bring the week back into shape.`,
    };
  }

  if (summary.momentumState === "slipping") {
    return {
      headline:
        summary.coolingRisk === "dropoff_risk"
          ? "You can restart this week. One class does it."
          : "You are slipping this week. Catch it now.",
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
          ? `The map has flattened around ${focusAreaInline}. One meaningful ${recommendedFormat} class will wake it back up and restart the week.`
          : `${focusAreaLabel} is fading and the weekly signal is slipping. One ${recommendedFormat} class brings the map back before this turns into a reset.`,
    };
  }

  return {
    headline: "Restart this week. One class is enough.",
    pill: "Ready to restart",
    adherenceTitle: "A single session restarts the map",
    adherenceText: `The recent signal has mostly cooled off, but one meaningful ${recommendedFormat} session will wake the map back up. ${sessionProgress}`,
    actionLabel: `Restart with ${recommendedFormat}`,
    insightTitle: "What your body needs now",
    insightText: `The map has flattened, especially in ${focusAreaInline}. The easiest restart is one ${recommendedFormat} class this week.`,
  };
}

function getGoalAdherenceCopy(summary, weekly, goal, plannedSessions, program, snapshot) {
  const recommendedFormat = summary.recommendedFormat || "HRX";
  const remainingSessions = Math.max(0, plannedSessions - weekly.sessions);
  const recommendedSession =
    recommendedFormat === "Strength & Conditioning" ? "Strength session" : recommendedFormat;
  const goalContext =
    state.profile.goal === "weight_loss"
      ? "Fat-loss rhythm"
      : state.profile.goal === "strength"
        ? "Strength rhythm"
        : "Fitness rhythm";
  const sessionsLeftLabel =
    remainingSessions === 1 ? "1 session left" : `${remainingSessions} sessions left`;

  if (weekly.status === "in_range") {
    return {
      title: "On track",
      text: `${goalContext} | In zone`,
      split: program.split,
      progress: `${weekly.sessions}/${plannedSessions} done`,
      actionLabel: `Keep ${recommendedSession} in rotation`,
    };
  }

  if (weekly.status === "above") {
    return {
      title: "Above target",
      text: `${goalContext} | Recovery focus`,
      split: program.split,
      progress: `${weekly.sessions}/${plannedSessions} done`,
      actionLabel: "Prioritize recovery",
    };
  }

  if (summary.coolingRisk === "dropoff_risk") {
    return {
      title: "Restart needed",
      text: `${goalContext} | Log 1 class`,
      split: program.split,
      progress: `${weekly.sessions}/${plannedSessions} done`,
      actionLabel: `Plan ${recommendedSession}`,
    };
  }

  if (remainingSessions <= 1) {
    return {
      title: "1 session left",
      text: `${goalContext} | ${recommendedSession} next`,
      split: program.split,
      progress: `${weekly.sessions}/${plannedSessions} done`,
      actionLabel: `Plan ${recommendedSession}`,
    };
  }

  return {
    title: sessionsLeftLabel,
    text: `${goalContext} | ${recommendedSession} next`,
    split: program.split,
    progress: `${weekly.sessions}/${plannedSessions} done`,
    actionLabel: `Plan ${recommendedSession}`,
  };
}

function getWeeklyLoadNarrative(weekly, latestWorkout, workoutEffort, snapshot) {
  if (!latestWorkout) {
    return "No workout has landed in this week's view yet.";
  }

  if (weekly.status === "above") {
    return `${snapshot.timelineLabel}. ${workoutEffort.headline} pushed the week above target.`;
  }

  if (weekly.status === "in_range") {
    return `${snapshot.timelineLabel}. ${workoutEffort.headline} moved the week into target.`;
  }

  if (workoutEffort.key === "light") {
    return `${snapshot.timelineLabel}. ${workoutEffort.headline} nudged the week forward, but this week is still building.`;
  }

  return `${snapshot.timelineLabel}. ${workoutEffort.headline} moved the week forward, but it is still below target.`;
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

function getPulseHeaderDiagnostics(pulseSummary, weekly, plannedSessions) {
  const adherence = getGoalAdherenceBand(weekly.sessions, plannedSessions);
  const bodyMapFaded = isBodyMapFaded(pulseSummary);
  let headerState = "progress";

  if (bodyMapFaded) {
    headerState = "risk";
  } else if (adherence.band === "low") {
    headerState = "risk";
  } else if (weekly.status === "below") {
    headerState = "progress";
  } else {
    headerState = "positive";
  }

  return {
    headerState,
    adherenceBand: adherence.band,
    adherenceRatio: adherence.ratio,
    loadState: weekly.status,
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

function renderPulse() {
  if (!state.selectedUserId) {
    pulseHeadline.textContent = "Add a member to start Pulse";
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
    weeklyLoadNarrative.textContent = "Add a member and log a workout to start the weekly load view.";
    goalAdherenceTitle.textContent = "No adherence data";
    goalAdherenceText.textContent = "Add member | Log workout";
    adherenceSplitLabel.textContent = "--";
    adherenceProgressLabel.textContent = "0/0 done";
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
  const weekly = getWeeklyLoadSummary();
  const pulseSummary = getPulseSummary();
  const snapshot = getProgressSnapshotCopy();
  const latestWorkout = getLatestCompletedWorkout(workouts);
  const workoutEffort = getWorkoutEffortSummary(latestWorkout, weekly);
  const narrative = getPulseNarrative(pulseSummary, weekly, goal, Number(state.profile.frequency));
  const adherence = getGoalAdherenceCopy(
    pulseSummary,
    weekly,
    goal,
    Number(state.profile.frequency),
    program,
    snapshot,
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
  const plannedSessions = Number(state.profile.frequency);
  const headerDiagnostics = getPulseHeaderDiagnostics(pulseSummary, weekly, plannedSessions);
  const { headerState } = headerDiagnostics;

  pulseHeadline.textContent = narrative.headline;
  pulseMomentumPill.textContent = narrative.pill;
  pulseCuroVisual.src = CURO_VISUAL_LIBRARY[getCuroVisualState(headerState)];
  pulseCardTop.classList.remove("is-progress", "is-positive", "is-risk");
  pulseCardTop.classList.add(
    headerState === "positive" ? "is-positive" : headerState === "risk" ? "is-risk" : "is-progress",
  );
  pulseMomentumPill.classList.remove("is-cooling", "is-risk", "is-recovering", "is-light", "is-moderate", "is-high", "is-very-high");
  pulseMomentumPill.classList.toggle("is-cooling", pulseSummary.coolingRisk === "early_cooling");
  pulseMomentumPill.classList.toggle("is-risk", pulseSummary.coolingRisk === "cooling" || pulseSummary.coolingRisk === "dropoff_risk");
  pulseMomentumPill.classList.toggle("is-recovering", pulseSummary.momentumState === "fresh_gain" || pulseSummary.momentumState === "recovering");
  pulseLoadValue.textContent = weekly.targetLabel;
  pulseLoadSubtext.textContent = `${workouts.length} workouts logged.`;

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
    snapshot,
  );

  goalAdherenceTitle.textContent = adherence.title;
  goalAdherenceText.textContent = adherence.text;
  adherenceSplitLabel.textContent = adherence.split;
  adherenceProgressLabel.textContent = adherence.progress;
  renderAdherenceProgressDots(weekly.sessions, Number(state.profile.frequency));
  primaryAction.textContent = adherence.actionLabel || "View goal plan";

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
  newUserNameInput.value = "";
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

addUserButton.addEventListener("click", addUser);

newUserNameInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    addUser();
  }
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
