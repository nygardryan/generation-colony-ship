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
      // tutorial-moon.CONFIG.1 — Starting resource values
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
      // tutorial-moon.RES.7 — Consumption rates during travel (per second)
      consumptionPerSecond: {
        water: 2,
        food: 1,
        energy: 3,
        fuel: 1,
      },
    },
  },

  // Extension points for future destinations (tutorial-moon.EXT.1, tutorial-moon.EXT.2)
  // Add new destinations here following the same structure.
  // Future fields per destination:
  //   population: { starting: 0, capacity: 1000 }
  //   morale: { starting: 50, decay: 0.1 }
  //   research: { points: 0, perTick: 0 }

  // tutorial-moon.RES.1 — Resource display groups
  RESOURCE_GROUPS: {
    materials: {
      label: "Materials",
      icon: "⛏️",
      resources: ["steel", "aluminum", "preciousMetals"],
    },
    volatiles: {
      label: "Volatiles",
      icon: "💧",
      resources: ["water", "hydrogen", "nitrogen"],
    },
    consumables: {
      label: "Consumables",
      icon: "🍲",
      resources: ["food"],
    },
    power: {
      label: "Power",
      icon: "⚡",
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

  // Extension points for future systems (tutorial-moon.EXT.1)
  // Uncomment and extend when implementing:
  //
  // POPULATION: {
  //   maxPopulation: 1000,
  //   initialPopulation: 0,
  //   growthRate: 0.01,       // per tick
  //   birthRate: 0.001,
  //   deathRate: 0.0005,
  // },
  //
  // MORALE: {
  //   initial: 50,
  //   max: 100,
  //   decayPerTick: 0.02,
  //   // Affects: production efficiency, population growth, event frequency
  // },
  //
  // RESEARCH: {
  //   pointsPerTick: 0,
  //   techTree: [],            // Array of technology objects
  // },
  //
  // POLITICS: {
  //   initialPoints: 0,
  //   pointsPerTick: 0,
  //   edicts: [],              // Available policy decisions
  // },
  //
  // EVENTS: {
  //   pool: [],                // Random event definitions
  //   checkInterval: 10,       // ticks between event checks
  //   baseChance: 0.1,        // base probability per check
  // },
  //
  // COLONIES: {
  //   list: [],                // Array of colony objects (extends DESTINATIONS)
  //   // Each colony: { id, name, resources, population, buildings, ... }
  // },
};