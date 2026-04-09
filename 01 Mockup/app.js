const TODAY = new Date("2026-04-09T18:30:00");
const DAY_MS = 24 * 60 * 60 * 1000;
const LOAD_MAX = 30;

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
  Yoga: { intensity: 3, zones: ["hamstrings", "core", "back"] },
  Boxing: { intensity: 7, zones: ["shoulders", "arms", "core", "cardio"] },
  HRX: { intensity: 8, zones: ["quads", "glutes", "core", "shoulders", "cardio"] },
  "Strength & Conditioning": { intensity: 7, zones: ["back", "glutes", "quads", "arms"] },
  Burn: { intensity: 6, zones: ["quads", "glutes", "core", "cardio"] },
};

const ZONE_LIBRARY = {
  shoulders: { label: "Shoulders", decayDays: 11 },
  arms: { label: "Arms", decayDays: 11 },
  chest: { label: "Chest", decayDays: 11 },
  core: { label: "Core", decayDays: 10 },
  back: { label: "Back", decayDays: 11 },
  glutes: { label: "Glutes", decayDays: 11 },
  quads: { label: "Quads", decayDays: 11 },
  hamstrings: { label: "Hamstrings", decayDays: 9 },
  calves: { label: "Calves", decayDays: 10 },
  cardio: { label: "Cardio", decayDays: 5 },
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
const primaryAction = document.getElementById("primaryAction");
const trainingInsightTitle = document.getElementById("trainingInsightTitle");
const pulseCuroText = document.getElementById("pulseCuroText");
const bodyReferenceNodes = [...document.querySelectorAll("[data-asset-zone]")];
const hotspotNodes = [...document.querySelectorAll("[data-hotspot]")];

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

function formatFullDate(date) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
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
      zones: details.zones,
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

function getPulseStates() {
  const workouts = getScenarioWorkouts();
  const pulseStates = Object.fromEntries(
    Object.keys(ZONE_LIBRARY).map((zone) => [zone, { score: 0, lastTrained: null }]),
  );

  workouts.forEach((workout) => {
    workout.zones.forEach((zone) => {
      const decayFactor = Math.exp(-diffDays(state.currentDate, workout.dateObject) / ZONE_LIBRARY[zone].decayDays);
      pulseStates[zone].score += (workout.intensity / 8) * decayFactor;
      if (!pulseStates[zone].lastTrained || workout.dateObject > pulseStates[zone].lastTrained) {
        pulseStates[zone].lastTrained = workout.dateObject;
      }
    });
  });

  return pulseStates;
}

function getTopZones(pulseStates) {
  return Object.entries(pulseStates)
    .sort((a, b) => b[1].score - a[1].score)
    .slice(0, 3)
    .map(([zone]) => ZONE_LIBRARY[zone].label);
}

function toPercent(value, max) {
  return `${Math.max(0, Math.min(100, (value / max) * 100))}%`;
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

function renderPulseMap(pulseStates) {
  const assetOpacities = {
    shoulders: pulseStates.shoulders.score,
    arms: pulseStates.arms.score,
    chest: pulseStates.chest.score,
    back: pulseStates.back.score,
    legs: Math.max(
      pulseStates.quads.score,
      pulseStates.glutes.score,
      pulseStates.hamstrings.score,
      pulseStates.calves.score,
    ),
  };

  bodyReferenceNodes.forEach((node) => {
    const score = assetOpacities[node.dataset.assetZone] || 0;
    node.style.opacity = `${Math.max(0, Math.min(0.95, score * 0.82))}`;
  });

  hotspotNodes.forEach((node) => {
    const score = pulseStates[node.dataset.hotspot]?.score || 0;
    node.style.opacity = `${Math.max(0.04, Math.min(0.78, score * 0.7))}`;
    node.style.transform = `scale(${1 + Math.min(0.18, score * 0.1)})`;
  });
}

function renderPulse() {
  const scenario = getScenarioConfig();
  const goal = getGoalConfig();
  const weekly = getWeeklyLoadSummary();
  const pulseStates = getPulseStates();
  const topZones = getTopZones(pulseStates);
  const plannedSessions = Number(state.profile.frequency);

  pulseHeadline.textContent = scenario.pulse.headline;
  pulseMomentumPill.textContent = scenario.pulse.momentum;
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

  goalAdherenceTitle.textContent = scenario.pulse.adherenceTitle;
  goalAdherenceText.textContent = `${scenario.pulse.adherenceText} ${weekly.sessions}/${plannedSessions} sessions are done so far.`;
  topZonesLabel.textContent = topZones.join(", ");
  primaryAction.textContent = scenario.action;
  trainingInsightTitle.textContent = scenario.pulse.insightTitle;
  pulseCuroText.textContent = scenario.pulse.insightText;

  renderPulseMap(pulseStates);
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
    primaryAction.textContent = getScenarioConfig().action;
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
