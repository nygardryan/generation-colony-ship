// tutorial-moon.ARCH.2 — Central game state object
// tutorial-moon.ARCH.3 — Simulation logic separated from UI/rendering
// tutorial-moon.CONFIG.5 — Supports adding destinations without refactoring

/**
 * Creates a new game state for the given destination.
 * tutorial-moon.ARCH.2 — Returns resource values, travel status, destination, and travel time.
 */
function createGameState(destinationId) {
  // tutorial-moon.CONFIG.1 — Load configuration for this destination
  const dest = CONFIG.DESTINATIONS[destinationId];
  if (!dest) throw new Error(`Unknown destination: ${destinationId}`);

  return {
    // tutorial-moon.ARCH.2 — Current destination
    destinationId: destinationId,
    destinationName: dest.name,

    // tutorial-moon.ARCH.2 — Travel status
    phase: "intro", // intro | selecting | traveling | complete
    travelTimeRemaining: dest.travelTime,
    travelTimeTotal: dest.travelTime,

    // tutorial-moon.ARCH.2 — Resource values (clone to avoid mutating config)
    // tutorial-moon.RES.6 — Initial values
    resources: { ...dest.startingResources },

    // Extension point: future state fields (tutorial-moon.EXT.1)
    // Uncomment when implementing:
    //
    // population: {
    //   total: 0,
    //   colonists: 0,
    //   capacity: CONFIG.POPULATION.maxPopulation,
    // },
    //
    // morale: CONFIG.MORALE.initial,
    //
    // research: {
    //   points: 0,
    //   completedTechs: [],
    //   activeResearch: null,
    // },
    //
    // politics: {
    //   points: 0,
    //   activeEdicts: [],
    // },
    //
    // events: {
    //   active: [],
    //   history: [],
    //   lastCheck: 0,
    // },
    //
    // colonies: [],
  };
}

/**
 * Advances the game simulation by one tick (1 second).
 * tutorial-moon.TRAVEL.2 — Resources continuously decrease during travel
 * tutorial-moon.RES.7 — Consumption rates applied per second
 * tutorial-moon.RES.10 — Resources cannot go below zero
 *
 * @param {object} state - Current game state
 * @returns {object} Updated game state (mutated for performance)
 */
function tick(state) {
  if (state.phase !== "traveling") return state;

  const dest = CONFIG.DESTINATIONS[state.destinationId];
  if (!dest) return state;

  // tutorial-moon.TRAVEL.3 — Decrement remaining travel time
  state.travelTimeRemaining = Math.max(0, state.travelTimeRemaining - 1);

  // tutorial-moon.RES.7 — Apply consumption
  // tutorial-moon.RES.8 — Only specified resources change
  for (const [resourceKey, rate] of Object.entries(dest.consumptionPerSecond)) {
    if (state.resources[resourceKey] !== undefined) {
      // tutorial-moon.RES.10 — Floor at zero, never negative
      state.resources[resourceKey] = Math.max(0, state.resources[resourceKey] - rate);
    }
  }

  // Extension point: future per-tick updates (tutorial-moon.EXT.2)
  // if (state.population) updatePopulation(state);
  // if (state.morale)     updateMorale(state);
  // if (state.research)   updateResearch(state);
  // if (state.politics)   updatePolitics(state);
  // if (state.events)     checkEvents(state);

  // tutorial-moon.TRAVEL.5 — Transition to completion when timer reaches zero
  if (state.travelTimeRemaining <= 0) {
    state.phase = "complete";
  }

  return state;
}

/**
 * Begins the voyage for the given state.
 * tutorial-moon.DEST.3 — Selecting the Moon begins the voyage
 */
function startTravel(state) {
  state.phase = "traveling";
  return state;
}

/**
 * Resets the game to its initial state.
 * tutorial-moon.EXT.2 — Gap resolution: "Play Again" flow
 */
function resetState() {
  return createGameState("moon");
}

// Extension point: future simulation functions (tutorial-moon.EXT.1)
// function updatePopulation(state) { ... }
// function updateMorale(state) { ... }
// function updateResearch(state) { ... }
// function updatePolitics(state) { ... }
// function checkEvents(state) { ... }