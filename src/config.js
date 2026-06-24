// tutorial-moon.CONFIG.1 — All starting values and consumption rates as configurable constants
// tutorial-moon.CONFIG.2 — Resources grouped into Materials, Volatiles, Consumables, Power
const CONFIG = {
  // tutorial-moon.INTRO.1 — Introduction screen text
  INTRO_TITLE: "Generation Colony Ship",
  INTRO_SUBTITLE: "Humanity's first step into the cosmos",

  // tutorial-moon.DEST.2 — Moon is the only available destination
  DESTINATIONS: {
    moon: {
      id: "moon",
      name: "The Moon",
      description: "Earth's only natural satellite — humanity's first colony.",
      travelTime: 60, // seconds
      // tutorial-moon.RES.6 — Starting resource values
      // tutorial-moon.POP.1 — 500 starting colonists
      startingResources: {
        steel: 10000,
        aluminum: 5000,
        preciousMetals: 1000,
        water: 8000,
        hydrogen: 3000,
        nitrogen: 2000,
        food: 6000,
        energy: 10000,
        fuel: 4000,
      },
      // tutorial-moon.POP.1 — Starting population
      startingPopulation: 500,
      // tutorial-moon.RES.7 — Per-capita consumption rates (per colonist per tick)
      // Food and Water scale with population. Energy and Fuel are flat.
      consumptionPerSecond: {
        water: { type: "perCapita", rate: 1 },
        food: { type: "perCapita", rate: 1 },
        energy: { type: "flat", rate: 3 },
        fuel: { type: "flat", rate: 1 },
      },
    },
  },

  // tutorial-moon.POP.1 — Population configuration
  POPULATION: {
    initial: 500,
    // Extension: maxPopulation: 1000,
    // Extension: growthRate: 0.001,
  },

  // tutorial-moon.MORALE.1 — Morale system bounds
  // tutorial-moon.MORALE.2 — Starts at 100
  MORALE: {
    initial: 100,
    max: 100,
    min: -100,
    // tutorial-moon.MORALE.3 — Decay when food projections fail
    decayIntervalTicks: 10,     // ticks between morale decay ticks
    decayAmount: 1,
    // tutorial-moon.MORALE.3 — Halfway check (proportion of journey)
    halfWayFraction: 0.5,
  },

  // tutorial-moon.BUILD.2 — Farm building
  // tutorial-moon.BUILD.3 — Costs Steel and Aluminum
  // tutorial-moon.BUILD.4 — Consumes Nitrogen, Energy, Water, produces Food
  BUILDINGS: {
    farm: {
      name: "Farm",
      description: "Grows food for the colony. Consumes Nitrogen, Energy, and Water.",
      cost: { steel: 500, aluminum: 200 },
      // tutorial-moon.BUILD.4 — Inputs per tick per farm
      inputsPerTick: { nitrogen: 5, energy: 10, water: 20 },
      // tutorial-moon.BUILD.5 — Food produced per tick per farm
      foodPerTick: 250,
    },
    // Extension: more buildings
    // waterRecycler: { ... }
    // solarPanel: { ... }
  },

  // Extension points for future systems (tutorial-moon.EXT.1)
  // LABOR: { occupations: {}, efficiency: {} },
  // RESEARCH: { pointsPerTick: 0, techTree: [] },
  // POLITICS: { initialPoints: 0, edicts: [] },
  // EVENTS: { pool: [], checkInterval: 10, baseChance: 0.1 },
  // COLONIES: { list: [] },

  // tutorial-moon.RES.1 — Resource display groups
  RESOURCE_GROUPS: {
    materials: {
      label: "Materials", icon: "⛏️",
      resources: ["steel", "aluminum", "preciousMetals"],
    },
    volatiles: {
      label: "Volatiles", icon: "💧",
      resources: ["water", "hydrogen", "nitrogen"],
    },
    consumables: {
      label: "Consumables", icon: "🍲",
      resources: ["food"],
    },
    power: {
      label: "Power", icon: "⚡",
      resources: ["energy", "fuel"],
    },
  },

  // tutorial-moon.RES.6 — Display names and formatting
  RESOURCE_META: {
    steel:         { label: "Steel",           icon: "🔩", decimals: 0 },
    aluminum:      { label: "Aluminum",        icon: "🪶", decimals: 0 },
    preciousMetals:{ label: "Precious Metals", icon: "💎", decimals: 0 },
    water:         { label: "Water",           icon: "💧", decimals: 0 },
    hydrogen:      { label: "Hydrogen",        icon: "🫧", decimals: 0 },
    nitrogen:      { label: "Nitrogen",        icon: "🌬️", decimals: 0 },
    food:          { label: "Food",            icon: "🍞", decimals: 0 },
    energy:        { label: "Energy",          icon: "⚡", decimals: 0 },
    fuel:          { label: "Fuel",            icon: "⛽", decimals: 0 },
  },
};