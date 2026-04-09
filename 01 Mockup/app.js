const TODAY = new Date("2026-04-09T18:30:00");
const DAY_MS = 24 * 60 * 60 * 1000;
const LOAD_MAX = 30;
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
    label: "Weight loss",
    description: "Lose body fat and build a steady routine.",
    baseRange: [15, 20],
    intent: "Build a repeatable calorie deficit with full-body effort.",
  },
  strength: {
    label: "Build strength",
    description: "Get stronger with regular strength-focused work.",
    baseRange: [16, 22],
    intent: "Prioritize progressive overload and recovery rhythm.",
  },
  general_fitness: {
    label: "General fitness",
    description: "Build an all-round routine that feels sustainable.",
    baseRange: [13, 18],
    intent: "Balance endurance, resilience, and routine.",
  },
};

const FREQUENCY_LIBRARY = {
  3: { label: "3 days", description: "A lighter but realistic week.", modifier: -2 },
  4: { label: "4 days", description: "Default demo rhythm.", modifier: 0 },
  5: { label: "5 days", description: "A more ambitious training week.", modifier: 3 },
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

const FORMAT_LIBRARY = {
  Yoga: {
    intensity: 3,
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

const PROFILE_MODES = {
  new_user: {
    label: "New user",
    description: "Starts with goal setup and very little history.",
    profile: {
      name: "Aisha Rao",
      goal: "general_fitness",
      frequency: "3",
    },
    planCreated: false,
  },
  existing_user: {
    label: "Existing user",
    description: "Has training history and already knows the routine.",
    profile: {
      name: "Aisha Rao",
      goal: "weight_loss",
      frequency: "4",
    },
    planCreated: true,
  },
};

const BEHAVIOR_SCENARIOS = {
  first_workout: {
    label: "After first workout",
    description: "New member just finished the first session and needs encouragement plus a next step.",
    workouts: [{ date: "2026-04-09", format: "Yoga" }],
    action: "Plan next session",
    pulse: {
      headline: "A strong start. Now turn it into a rhythm.",
      momentum: "First week starting",
      adherenceTitle: "One more session helps the habit stick",
      adherenceText: "This is the moment to build rhythm, not chase intensity. One more class this week will help the routine settle in.",
      insightTitle: "What changed today",
      insightText: "That first session woke up mobility, core stability, and recovery work. The best next move is simply to repeat the behavior once more before the week ends.",
    },
  },
  building: {
    label: "Building this week",
    description: "Existing user has some momentum this week but is still one session short of the target zone.",
    workouts: [
      { date: "2026-04-07", format: "Boxing" },
      { date: "2026-04-08", format: "Yoga" },
    ],
    action: "Book next session",
    pulse: {
      headline: "You are close to your target this week",
      momentum: "Momentum building",
      adherenceTitle: "One more class gets you back into range",
      adherenceText: "You are building momentum, but this week still needs one strong session to feel complete.",
      insightTitle: "What changed today",
      insightText: "Your recent work is already building useful momentum across the lower body, shoulders, and cardio. One HRX or Boxing class would turn this from a good week into a complete one.",
    },
  },
  consistent: {
    label: "On track this week",
    description: "User has stayed consistent and is comfortably inside the target zone.",
    workouts: [
      { date: "2026-04-06", format: "Burn" },
      { date: "2026-04-07", format: "Boxing" },
      { date: "2026-04-08", format: "Yoga" },
      { date: "2026-04-09", format: "HRX" },
    ],
    action: "Keep momentum going",
    pulse: {
      headline: "You are right where you need to be this week",
      momentum: "On track",
      adherenceTitle: "This week is already in range",
      adherenceText: "The focus has shifted from catching up to maintaining rhythm and recovering well enough to repeat it next week.",
      insightTitle: "What changed today",
      insightText: "This is what consistency looks like. Your load is inside target, the body map is broad, and you are building momentum without having to overreach.",
    },
  },
  losing: {
    label: "Losing momentum",
    description: "The week started well but the user has slowed down and momentum is fading.",
    workouts: [
      { date: "2026-03-31", format: "Burn" },
      { date: "2026-04-01", format: "Strength & Conditioning" },
      { date: "2026-04-03", format: "Yoga" },
    ],
    action: "Restart this week",
    pulse: {
      headline: "The week has started to cool off",
      momentum: "Momentum fading",
      adherenceTitle: "You still have time to bring this week back",
      adherenceText: "The earlier sessions gave you a base, but the gap since then is starting to show in the Pulse.",
      insightTitle: "What changed this week",
      insightText: "The earlier sessions gave you a base, but the gap since then is starting to show. Cardio fades first, so one well-chosen class would restore the feeling of momentum quickly.",
    },
  },
  dropped: {
    label: "Dropped off",
    description: "It has been almost two weeks since the last session, so the Pulse should feel cooler and lower-energy.",
    workouts: [
      { date: "2026-03-24", format: "Strength & Conditioning" },
      { date: "2026-03-26", format: "Burn" },
      { date: "2026-03-27", format: "Yoga" },
    ],
    action: "Come back this week",
    pulse: {
      headline: "Your Pulse has cooled down",
      momentum: "Cooling off",
      adherenceTitle: "A single comeback session restarts the curve",
      adherenceText: "The goal here is not to chase the old week. It is simply to restart with one meaningful session.",
      insightTitle: "What your body needs now",
      insightText: "It has been long enough for the stronger signals to flatten out, especially cardio. One solid comeback session this week is enough to reverse that curve.",
    },
  },
  returned: {
    label: "Returned after a drop",
    description: "User had a visible gap but has come back with a stronger class, so the view should feel hopeful.",
    workouts: [
      { date: "2026-03-24", format: "Strength & Conditioning" },
      { date: "2026-03-27", format: "Yoga" },
      { date: "2026-04-09", format: "HRX" },
    ],
    action: "Keep momentum going",
    pulse: {
      headline: "You are back, and the signal is waking up again",
      momentum: "Back in motion",
      adherenceTitle: "One more class helps lock the comeback in",
      adherenceText: "Today’s session restarted the map. The next job is to repeat it once before the week ends.",
      insightTitle: "What changed today",
      insightText: "That return session hit the lower body, core, shoulders, and cardio together. The most important thing is not the score itself, it is that the body map is active again and momentum has restarted.",
    },
  },
};

const GOAL_STEPS = [
  {
    key: "goal",
    title: "What are you working toward?",
    description: "Pick the one thing that matters most right now.",
  },
  {
    key: "rhythm",
    title: "How often do you want to train?",
    description: "Set a weekly rhythm that feels realistic for you.",
  },
];

const state = {
  activeTab: "goal",
  currentDate: new Date(TODAY),
  profileMode: "existing_user",
  behavior: "building",
  profile: cloneProfile("existing_user"),
  planCreated: PROFILE_MODES.existing_user.planCreated,
  goalStep: 0,
};

const tabButtons = [...document.querySelectorAll("[data-tab-target]")];
const tabScreens = [...document.querySelectorAll("[data-tab]")];
const profileModeOptions = document.getElementById("profileModeOptions");
const behaviorOptions = document.getElementById("behaviorOptions");
const currentDateLabel = document.getElementById("currentDateLabel");
const welcomeTitle = document.getElementById("welcomeTitle");
const memberName = document.getElementById("memberName");
const summaryGoal = document.getElementById("summaryGoal");
const summaryScenario = document.getElementById("summaryScenario");
const summaryRange = document.getElementById("summaryRange");
const summaryLoad = document.getElementById("summaryLoad");
const scenarioDescription = document.getElementById("scenarioDescription");
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
const previewIntent = document.getElementById("previewIntent");
const previewTone = document.getElementById("previewTone");
const centerConsultNudge = document.getElementById("centerConsultNudge");
const bcaNudge = document.getElementById("bcaNudge");
const viewPulseFromPlan = document.getElementById("viewPulseFromPlan");
const pulseHeadline = document.getElementById("pulseHeadline");
const pulseMomentumPill = document.getElementById("pulseMomentumPill");
const pulseLoadValue = document.getElementById("pulseLoadValue");
const pulseLoadSubtext = document.getElementById("pulseLoadSubtext");
const miniLoadTarget = document.getElementById("miniLoadTarget");
const miniLoadFill = document.getElementById("miniLoadFill");
const loadStatusBadge = document.getElementById("loadStatusBadge");
const goalAdherenceTitle = document.getElementById("goalAdherenceTitle");
const goalAdherenceText = document.getElementById("goalAdherenceText");
const topZonesLabel = document.getElementById("topZonesLabel");
const bodyCoverageLabel = document.getElementById("bodyCoverageLabel");
const primaryAction = document.getElementById("primaryAction");
const trainingInsightTitle = document.getElementById("trainingInsightTitle");
const pulseCuroText = document.getElementById("pulseCuroText");
const bodyReferenceBase = document.getElementById("bodyReferenceBase");
const bodyReferenceNodes = [...document.querySelectorAll("[data-asset-zone]")];
const hotspotNodes = [...document.querySelectorAll("[data-hotspot]")];
let bodyReferenceOverlaysReady = false;
const bodyAssetPreparation = prepareBodyReferenceOverlays();

function cloneProfile(modeKey) {
  const source = PROFILE_MODES[modeKey].profile;
  return { ...source };
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

function getGoalConfig() {
  const goal = GOAL_LIBRARY[state.profile.goal];
  const frequencyModifier = FREQUENCY_LIBRARY[state.profile.frequency].modifier;
  return {
    ...goal,
    targetRange: [
      goal.baseRange[0] + frequencyModifier,
      goal.baseRange[1] + frequencyModifier,
    ],
  };
}

function getScenarioConfig() {
  return BEHAVIOR_SCENARIOS[state.behavior];
}

function getScenarioWorkouts() {
  return getScenarioConfig().workouts.map((workout, index) => {
    const details = FORMAT_LIBRARY[workout.format];
    return {
      id: `w${index + 1}`,
      ...workout,
      intensity: details.intensity,
      zoneWeights: { ...details.zoneWeights },
      dateObject: new Date(`${workout.date}T09:00:00`),
    };
  });
}

function getCurrentWeekRange() {
  const anchor = startOfDay(state.currentDate);
  const day = anchor.getDay();
  const offsetToMonday = day === 0 ? 6 : day - 1;
  const start = addDays(anchor, -offsetToMonday);
  const end = addDays(start, 6);
  return { start, end };
}

function getWeeklyLoadSummary() {
  const workouts = getScenarioWorkouts();
  const goal = getGoalConfig();
  const { start, end } = getCurrentWeekRange();
  const total = workouts.reduce((sum, workout) => {
    return workout.dateObject >= start && workout.dateObject <= end ? sum + workout.intensity : sum;
  }, 0);
  const sessions = workouts.filter((workout) => workout.dateObject >= start && workout.dateObject <= end).length;

  let status = "below";
  if (total > goal.targetRange[1]) {
    status = "above";
  } else if (total >= goal.targetRange[0]) {
    status = "in_range";
  }

  return {
    total,
    sessions,
    targetRange: goal.targetRange,
    status,
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
  const scenario = getScenarioConfig();
  const goal = getGoalConfig();
  const weekly = getWeeklyLoadSummary();

  currentDateLabel.textContent = formatFullDate(state.currentDate);
  welcomeTitle.textContent = `Good evening, ${state.profile.name.split(" ")[0]}`;
  memberName.textContent = state.profile.name;
  summaryGoal.textContent = goal.label;
  summaryScenario.textContent = scenario.label;
  summaryRange.textContent = `${goal.targetRange[0]}-${goal.targetRange[1]} load`;
  summaryLoad.textContent = `${weekly.total}`;
  scenarioDescription.textContent = scenario.description;
}

function renderScenarioControls() {
  renderButtonGroup(profileModeOptions, PROFILE_MODES, state.profileMode, (modeKey) => {
    state.profileMode = modeKey;
    state.profile = cloneProfile(modeKey);
    state.planCreated = PROFILE_MODES[modeKey].planCreated;
    state.goalStep = 0;
    if (modeKey === "new_user" && state.behavior !== "first_workout") {
      state.behavior = "first_workout";
    }
    if (modeKey === "existing_user" && state.behavior === "first_workout") {
      state.behavior = "building";
    }
    renderAll();
  });

  renderButtonGroup(behaviorOptions, BEHAVIOR_SCENARIOS, state.behavior, (behaviorKey) => {
    state.behavior = behaviorKey;
    if (behaviorKey === "first_workout") {
      state.profileMode = "new_user";
      state.profile = cloneProfile("new_user");
      state.planCreated = false;
      state.goalStep = 0;
    } else if (state.profileMode === "new_user") {
      state.profileMode = "existing_user";
      state.profile = cloneProfile("existing_user");
      state.planCreated = true;
    }
    renderAll();
  });
}

function renderGoalStepper() {
  goalStepper.innerHTML = "";
  GOAL_STEPS.forEach((step, index) => {
    const chip = document.createElement("div");
    chip.className = "step-indicator";
    if (index === state.goalStep) {
      chip.classList.add("active");
    } else if (index < state.goalStep) {
      chip.classList.add("done");
    }
    chip.innerHTML = `<strong>${index + 1}</strong><small>${step.title}</small>`;
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

function renderGoalStepContent() {
  goalStepContent.innerHTML = "";

  const stepKey = GOAL_STEPS[state.goalStep].key;

  if (stepKey === "goal") {
    const grid = document.createElement("div");
    grid.className = "choice-grid";
    renderChoiceGrid(grid, GOAL_LIBRARY, state.profile.goal, (goalKey) => {
      state.profile.goal = goalKey;
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
      markPlanDirty();
      renderAll();
    }, "segmented-button");
    goalStepContent.appendChild(grid);
  }
}

function renderGoalPlan() {
  const goal = getGoalConfig();

  if (!state.planCreated) {
    planEmptyState.classList.remove("hidden");
    planSummary.classList.add("hidden");
    return;
  }

  planEmptyState.classList.add("hidden");
  planSummary.classList.remove("hidden");
  setupPreviewTitle.textContent = `${goal.label} plan`;
  setupPreviewBody.textContent = goal.description;
  previewTargetRange.textContent = `${goal.targetRange[0]}-${goal.targetRange[1]} load`;
  previewIntent.textContent = goal.intent;
  previewTone.textContent = `${FREQUENCY_LIBRARY[state.profile.frequency].label} each week`;
}

function renderGoal() {
  const step = GOAL_STEPS[state.goalStep];
  goalStepTitle.textContent = step.title;
  goalStepDescription.textContent = step.description;
  goalStepCount.textContent = `Step ${state.goalStep + 1} of ${GOAL_STEPS.length}`;
  renderGoalStepper();
  renderGoalStepContent();
  renderGoalPlan();

  goalBackButton.disabled = state.goalStep === 0;
  goalBackButton.style.visibility = state.goalStep === 0 ? "hidden" : "visible";

  if (state.goalStep === GOAL_STEPS.length - 1) {
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
  const weekly = getWeeklyLoadSummary();
  const pulseSummary = getPulseSummary();
  const narrative = getPulseNarrative(pulseSummary, weekly, goal, Number(state.profile.frequency));

  pulseHeadline.textContent = narrative.headline;
  pulseMomentumPill.textContent = narrative.pill;
  pulseMomentumPill.classList.toggle("is-cooling", pulseSummary.coolingRisk === "early_cooling");
  pulseMomentumPill.classList.toggle("is-risk", pulseSummary.coolingRisk === "cooling" || pulseSummary.coolingRisk === "dropoff_risk");
  pulseMomentumPill.classList.toggle("is-recovering", pulseSummary.momentumState === "fresh_gain" || pulseSummary.momentumState === "recovering");
  pulseLoadValue.textContent = `${weekly.total} / ${goal.targetRange[0]}-${goal.targetRange[1]}`;
  pulseLoadSubtext.textContent = `${weekly.sessions} sessions this week`;

  miniLoadTarget.style.left = toPercent(goal.targetRange[0], LOAD_MAX);
  miniLoadTarget.style.width = toPercent(goal.targetRange[1] - goal.targetRange[0], LOAD_MAX);
  miniLoadFill.style.width = toPercent(weekly.total, LOAD_MAX);

  loadStatusBadge.textContent =
    weekly.status === "in_range"
      ? "In target"
      : weekly.status === "above"
        ? "Above target"
        : "Below target";
  loadStatusBadge.classList.toggle("in-range", weekly.status === "in_range");
  loadStatusBadge.classList.toggle("above", weekly.status === "above");

  goalAdherenceTitle.textContent = narrative.adherenceTitle;
  goalAdherenceText.textContent = narrative.adherenceText;
  topZonesLabel.textContent = pulseSummary.topZones.length
    ? pulseSummary.topZones.map((zone) => ZONE_LIBRARY[zone].label).join(", ")
    : "Recovery";
  bodyCoverageLabel.textContent = pulseSummary.coverageLabel;
  primaryAction.textContent = narrative.actionLabel;
  trainingInsightTitle.textContent = narrative.insightTitle;
  pulseCuroText.textContent = narrative.insightText;

  renderPulseMap(pulseSummary.zones);
}

function renderAll() {
  renderTabs();
  renderScenarioControls();
  renderPresenter();
  renderGoal();
  renderPulse();
}

function resetDemo() {
  state.activeTab = "goal";
  state.profileMode = "existing_user";
  state.behavior = "building";
  state.profile = cloneProfile("existing_user");
  state.planCreated = PROFILE_MODES.existing_user.planCreated;
  state.goalStep = 0;
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
    renderGoal();
  }
});

goalNextButton.addEventListener("click", () => {
  if (state.goalStep < GOAL_STEPS.length - 1) {
    state.goalStep += 1;
    renderGoal();
    return;
  }

  state.planCreated = true;
  renderGoalPlan();
});

viewPulseFromPlan.addEventListener("click", () => {
  state.activeTab = "pulse";
  syncTabHash();
  renderAll();
});

primaryAction.addEventListener("click", () => {
  primaryAction.textContent = "Class booked";
  setTimeout(() => {
    renderPulse();
  }, 1400);
});

resetButton.addEventListener("click", resetDemo);

centerConsultNudge.addEventListener("click", () => {
  centerConsultNudge.querySelector("small").textContent = "Coach consult suggested near the selected center.";
});

bcaNudge.addEventListener("click", () => {
  bcaNudge.querySelector("small").textContent = "BCA check suggested near the selected center.";
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

renderAll();
