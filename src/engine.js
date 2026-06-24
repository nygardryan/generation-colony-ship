// tutorial-moon.ARCH.2 — Central game state object
// tutorial-moon.ARCH.3 — Simulation logic separated from UI/rendering

/**
 * Creates a new game state for the given destination.
 * tutorial-moon.ARCH.2 — Resource values, travel status, destination, population, morale, buildings
 */
function createGameState(destinationId) {
  const dest = CONFIG.DESTINATIONS[destinationId];
  if (!dest) throw new Error(`Unknown destination: ${destinationId}`);

  return {
    // tutorial-moon.ARCH.2 — Core travel state
    destinationId,
    destinationName: dest.name,
    phase: "intro",
    travelTimeRemaining: dest.travelTime,
    travelTimeTotal: dest.travelTime,
    paused: false,

    // tutorial-moon.RES.6 — Resources
    resources: { ...dest.startingResources },

    // tutorial-moon.POP.1 — Population
    population: dest.startingPopulation,

    // tutorial-moon.MORALE.1 — Morale
    morale: CONFIG.MORALE.initial,
    moraleDecayTimer: 0, // counts ticks until next morale decay

    // tutorial-moon.BUILD.6 — Buildings
    buildings: { farm: 0 },

    // tutorial-moon.STATUS.1 — Active statuses
    statuses: [],

    // Track whether tutorial events have fired
    flags: {
      lowFoodPopupShown: false,
      popupDismissed: false,
    },

    // Tick counter (for time-based conditions)
    tickCount: 0,
  };
}

/**
 * tutorial-moon.TRAVEL.2 — Advances simulation by one tick
 * tutorial-moon.RES.7 — Food/Water per capita, Energy/Fuel flat
 */
function tick(state) {
  if (state.phase !== "traveling") return state;
  if (state.paused) return state;

  state.tickCount++;

  // tutorial-moon.TRAVEL.3 — Decrement travel time
  state.travelTimeRemaining = Math.max(0, state.travelTimeRemaining - 1);

  // ── Apply resource consumption ──────────────────
  // tutorial-moon.RES.7 — Per-capita vs flat consumption
  const dest = CONFIG.DESTINATIONS[state.destinationId];
  for (const [resourceKey, config] of Object.entries(dest.consumptionPerSecond)) {
    let amount = 0;
    if (config.type === "perCapita") {
      // tutorial-moon.POP.3 — Population-scaled consumption
      // tutorial-moon.RES.9 — Floor at zero
      amount = Math.min(state.resources[resourceKey], state.population * config.rate);
    } else if (config.type === "flat") {
      amount = Math.min(state.resources[resourceKey], config.rate);
    }
    state.resources[resourceKey] -= amount;
  }

  // ── Apply building production ───────────────────
  // tutorial-moon.BUILD.5 — Farm produces food each tick
  if (state.buildings.farm > 0) {
    const farm = CONFIG.BUILDINGS.farm;
    const count = state.buildings.farm;

    // Check if we can afford inputs
    let canOperate = true;
    for (const [inputKey, inputRate] of Object.entries(farm.inputsPerTick)) {
      if ((state.resources[inputKey] || 0) < inputRate * count) {
        canOperate = false;
        break;
      }
    }

    if (canOperate) {
      // Consume inputs
      for (const [inputKey, inputRate] of Object.entries(farm.inputsPerTick)) {
        state.resources[inputKey] -= inputRate * count;
      }
      // tutorial-moon.BUILD.5 — Produce food
      state.resources.food = Math.min(
        state.resources.food + farm.foodPerTick * count,
        // No hard cap on food storage
        state.resources.food + farm.foodPerTick * count
      );
    }
  }

  // ── Check status triggers ───────────────────────
  // tutorial-moon.STATUS.1 — Detect low food
  checkStatusTriggers(state);

  // ── Update morale ───────────────────────────────
  // tutorial-moon.MORALE.3 — Morale decay when food projections fail
  updateMorale(state);

  // tutorial-moon.TRAVEL.5 — Completion
  if (state.travelTimeRemaining <= 0) {
    state.phase = "complete";
  }

  return state;
}

/**
 * tutorial-moon.STATUS.1 — Checks conditions and triggers status events
 * tutorial-moon.STATUS.2 — Low food triggers tutorial popup with pause
 */
function checkStatusTriggers(state) {
  // Low food check
  if (!state.flags.lowFoodPopupShown && state.tickCount > 0) {
    const dest = CONFIG.DESTINATIONS[state.destinationId];
    const foodPerTick = calculateFoodConsumption(state);
    const ticksLeft = state.travelTimeRemaining;

    if (foodPerTick > 0 && ticksLeft > 0) {
      const foodWillRunOut = state.resources.food < foodPerTick * ticksLeft;
      if (foodWillRunOut) {
        // tutorial-moon.STATUS.2 — Pause with popup
        state.paused = true;
        state.flags.lowFoodPopupShown = true;
        state.statuses.push({
          id: "low-food",
          title: "Critical: Food Shortage",
          message: "Earth did not send enough supplies. You must build a farm to sustain the colony.",
          type: "critical",
        });
      }
    }
  }
}

/**
 * Calculates food consumption per tick based on population.
 * tutorial-moon.RES.7 — Per-capita food consumption
 */
function calculateFoodConsumption(state) {
  const dest = CONFIG.DESTINATIONS[state.destinationId];
  const foodConfig = dest.consumptionPerSecond.food;
  if (foodConfig.type === "perCapita") {
    return state.population * foodConfig.rate;
  }
  return foodConfig.rate;
}

/**
 * tutorial-moon.MORALE.3 — Updates morale based on conditions
 */
function updateMorale(state) {
  // Only check morale after halfway point
  const progress = 1 - (state.travelTimeRemaining / state.travelTimeTotal);
  if (progress < CONFIG.MORALE.halfWayFraction) {
    state.moraleDecayTimer = 0;
    return;
  }

  // Check if food will run out
  const dest = CONFIG.DESTINATIONS[state.destinationId];
  const foodPerTick = calculateFoodConsumption(state);
  const farmFoodPerTick = (state.buildings.farm || 0) * CONFIG.BUILDINGS.farm.foodPerTick;
  const netFoodPerTick = farmFoodPerTick - foodPerTick;
  const ticksLeft = state.travelTimeRemaining;
  const foodAtArrival = state.resources.food + netFoodPerTick * ticksLeft;

  // tutorial-moon.MORALE.3 — If food insufficient at arrival, morale decays
  if (foodAtArrival <= 0) {
    state.moraleDecayTimer++;
    if (state.moraleDecayTimer >= CONFIG.MORALE.decayIntervalTicks) {
      state.moraleDecayTimer = 0;
      state.morale = Math.max(CONFIG.MORALE.min, state.morale - CONFIG.MORALE.decayAmount);
    }
  } else {
    state.moraleDecayTimer = 0;
  }

  // tutorial-moon.MORALE.4 — Track hostile status
  if (state.morale < 0 && !state.statuses.find(s => s.id === "hostile-populace")) {
    state.statuses.push({
      id: "hostile-populace",
      title: "Hostile Populace",
      message: "Morale has dropped below zero. The population is becoming hostile.",
      type: "warning",
    });
  }
}

/**
 * tutorial-moon.DEST.3 — Begin voyage
 */
function startTravel(state) {
  state.phase = "traveling";
  return state;
}

/**
 * tutorial-moon.BUILD.2 — Build a farm
 * tutorial-moon.BUILD.3 — Costs Steel and Aluminum
 */
function buildFarm(state) {
  const farm = CONFIG.BUILDINGS.farm;

  // Check resources
  for (const [resKey, cost] of Object.entries(farm.cost)) {
    if ((state.resources[resKey] || 0) < cost) {
      return { success: false, error: `Not enough ${CONFIG.RESOURCE_META[resKey]?.label || resKey}` };
    }
  }

  // tutorial-moon.BUILD.3 — Deduct cost
  for (const [resKey, cost] of Object.entries(farm.cost)) {
    state.resources[resKey] -= cost;
  }

  // tutorial-moon.BUILD.6 — Track building
  state.buildings.farm = (state.buildings.farm || 0) + 1;

  // tutorial-moon.STATUS.5 — Resume game if paused
  if (state.paused) {
    state.paused = false;
    // Remove the low-food status
    state.statuses = state.statuses.filter(s => s.id !== "low-food");
  }

  return { success: true };
}

/**
 * tutorial-moon.COMPLETE — Reset for replay
 */
function resetState() {
  return createGameState("moon");
}