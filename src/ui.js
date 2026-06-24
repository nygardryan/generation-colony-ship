// tutorial-moon.ARCH.3 — UI/rendering separated from simulation logic
// tutorial-moon.UI.1 — Tab navigation

let activeTab = "resources"; // resources, population, status, systems, build

function render(state) {
  switch (state.phase) {
    case "intro":     renderIntro(); break;
    case "selecting": renderDestinations(state); break;
    case "traveling": renderTravel(state); break;
    case "complete":  renderComplete(state); break;
  }
}

// ── Intro ──────────────────────────────────────────
// tutorial-moon.INTRO.1 — Introduction
function renderIntro() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="screen intro-screen">
      <div class="intro-content">
        <div class="ship-icon">🚀</div>
        <h1>${CONFIG.INTRO_TITLE}</h1>
        <p class="subtitle">${CONFIG.INTRO_SUBTITLE}</p>
        <div class="flavor-text">
          <p>You are the administrator of a generation colony ship — 
             a mobile ark carrying humanity's hope across the void.</p>
          <p>Resources are finite. Every decision matters. 
             The stars are waiting.</p>
        </div>
        <button class="btn btn-primary" onclick="showDestinations()">
          Begin Mission
        </button>
      </div>
    </div>
  `;
}

// ── Destination Selection ──────────────────────────
// tutorial-moon.DEST.1 — Destination screen
function renderDestinations(state) {
  const app = document.getElementById("app");
  let cards = Object.values(CONFIG.DESTINATIONS).map(dest => `
    <div class="dest-card available">
      <div class="dest-header">
        <span class="dest-icon">🌕</span>
        <h3>${dest.name}</h3>
      </div>
      <p class="dest-desc">${dest.description}</p>
      <div class="dest-meta">
        <span>Travel time: ${dest.travelTime}s | Population: ${CONFIG.POPULATION.initial}</span>
      </div>
      <button class="btn btn-primary" onclick="startVoyage('${dest.id}')">
        Launch to ${dest.name}
      </button>
    </div>
  `).join("");

  app.innerHTML = `
    <div class="screen dest-screen">
      <div class="dest-header-bar">
        <h2>Select Destination</h2>
        <button class="btn btn-secondary btn-small" onclick="backToIntro()">← Back</button>
      </div>
      <div class="dest-grid">${cards}</div>
    </div>
  `;
}

// ── Travel (Tabbed Interface) ──────────────────────
// tutorial-moon.UI.1 — Tab navigation for different panels
// tutorial-moon.TRAVEL.1 — 60-second voyage screen
function renderTravel(state) {
  const app = document.getElementById("app");
  const elapsed = state.travelTimeTotal - state.travelTimeRemaining;
  const progress = (elapsed / state.travelTimeTotal) * 100;
  const moraleColor = getMoraleColor(state.morale);

  app.innerHTML = `
    <div class="screen travel-screen">
      <!-- Header -->
      <div class="travel-header">
        <div class="travel-header-left">
          <div class="destination-badge">🌕 ${state.destinationName}</div>
          <div class="population-badge" title="Colonists">👥 ${state.population}</div>
        </div>
        <div class="travel-header-right">
          <div class="morale-indicator" style="color:${moraleColor}">
            😊 ${state.morale}
          </div>
          <div class="timer" id="timer">${state.travelTimeRemaining}s</div>
        </div>
      </div>

      <!-- Progress bar -->
      <div class="progress-bar-container">
        <div class="progress-bar" id="progress-bar" style="width: ${progress}%"></div>
      </div>

      <!-- Tab Navigation -->
      <div class="tab-nav">
        <button class="tab-btn ${activeTab === 'resources' ? 'active' : ''}" onclick="switchTab('resources')">📦 Resources</button>
        <button class="tab-btn ${activeTab === 'population' ? 'active' : ''}" onclick="switchTab('population')">👥 Population</button>
        <button class="tab-btn ${activeTab === 'status' ? 'active' : ''}" onclick="switchTab('status')">⚠️ Status</button>
        <button class="tab-btn ${activeTab === 'systems' ? 'active' : ''}" onclick="switchTab('systems')">⚙️ Systems</button>
        <button class="tab-btn ${activeTab === 'build' ? 'active' : ''}" onclick="switchTab('build')">🔨 Build</button>
      </div>

      <!-- Tab Content -->
      <div class="tab-content" id="tab-content">
        ${renderTabContent(state)}
      </div>

      <!-- Pause Overlay -->
      ${state.paused && state.statuses.find(s => s.id === "low-food") ? renderPausePopup(state) : ""}
    </div>
  `;
}

// tutorial-moon.UI.2-6 — Tab content rendering
function renderTabContent(state) {
  switch (activeTab) {
    case "resources":  return renderResourcesTab(state);
    case "population": return renderPopulationTab(state);
    case "status":     return renderStatusTab(state);
    case "systems":    return renderSystemsTab(state);
    case "build":      return renderBuildTab(state);
    default:           return renderResourcesTab(state);
  }
}

// tutorial-moon.UI.2 — Resources tab (default)
function renderResourcesTab(state) {
  const dest = CONFIG.DESTINATIONS[state.destinationId];
  return Object.entries(CONFIG.RESOURCE_GROUPS).map(([groupKey, group]) => {
    const items = group.resources.map(resKey => {
      const meta = CONFIG.RESOURCE_META[resKey];
      const value = state.resources[resKey];
      const consumption = dest.consumptionPerSecond[resKey];
      let rateDisplay = "";
      if (consumption) {
        if (consumption.type === "perCapita") {
          rateDisplay = `<span class="res-rate">-${state.population * consumption.rate}/s</span>`;
        } else {
          rateDisplay = `<span class="res-rate">-${consumption.rate}/s</span>`;
        }
      }
      // Check if farm produces this
      const farm = CONFIG.BUILDINGS.farm;
      let prodDisplay = "";
      if (resKey === "food" && state.buildings.farm > 0) {
        prodDisplay = `<span class="res-prod">+${farm.foodPerTick * state.buildings.farm}/s</span>`;
      }
      if (farm.inputsPerTick[resKey] && state.buildings.farm > 0) {
        prodDisplay = `<span class="res-consumed">-${farm.inputsPerTick[resKey] * state.buildings.farm}/s</span>`;
      }
      return `
        <div class="resource-item">
          <span class="res-icon">${meta.icon}</span>
          <span class="res-label">${meta.label}</span>
          <span class="res-value" id="res-${resKey}">${value.toFixed(meta.decimals)}</span>
          ${rateDisplay} ${prodDisplay}
        </div>
      `;
    }).join("");

    return `
      <div class="resource-group">
        <h4 class="group-label">${group.icon} ${group.label}</h4>
        ${items}
      </div>
    `;
  }).join("");
}

// tutorial-moon.UI.3 — Population tab
function renderPopulationTab(state) {
  const moraleColor = getMoraleColor(state.morale);
  const progress = 1 - (state.travelTimeRemaining / state.travelTimeTotal);

  return `
    <div class="tab-panel">
      <div class="panel-section">
        <h3>👥 Colonists</h3>
        <div class="stat-row">
          <span>Total Population</span>
          <span class="stat-value">${state.population}</span>
        </div>
        <div class="stat-row">
          <span>Food Consumption</span>
          <span class="stat-value">${state.population * CONFIG.DESTINATIONS[state.destinationId].consumptionPerSecond.food.rate}/s</span>
        </div>
        <div class="stat-row">
          <span>Water Consumption</span>
          <span class="stat-value">${state.population * CONFIG.DESTINATIONS[state.destinationId].consumptionPerSecond.water.rate}/s</span>
        </div>
      </div>
      <div class="panel-section">
        <h3>😊 Morale</h3>
        <div class="morale-bar-container">
          <div class="morale-bar" style="width: ${((state.morale - CONFIG.MORALE.min) / (CONFIG.MORALE.max - CONFIG.MORALE.min)) * 100}%; background: ${moraleColor};"></div>
        </div>
        <div class="stat-row">
          <span>Status</span>
          <span class="stat-value" style="color:${moraleColor}">
            ${state.morale >= 50 ? "Content" : state.morale >= 0 ? "Uneasy" : "Hostile"}
          </span>
        </div>
        ${state.morale < 0 ? '<div class="status-badge status-warning">⚠️ Hostile populace — danger of uprising</div>' : ''}
      </div>
    </div>
  `;
}

// tutorial-moon.UI.4 — Status tab
function renderStatusTab(state) {
  if (state.statuses.length === 0) {
    return `<div class="tab-panel"><p class="empty-state">✅ No active statuses. All systems nominal.</p></div>`;
  }

  return `
    <div class="tab-panel">
      <h3>⚠️ Active Statuses</h3>
      ${state.statuses.map(s => `
        <div class="status-card status-${s.type}">
          <div class="status-title">${s.title}</div>
          <div class="status-message">${s.message}</div>
        </div>
      `).join("")}
    </div>
  `;
}

// tutorial-moon.UI.5 — Systems tab
function renderSystemsTab(state) {
  const farmCount = state.buildings.farm || 0;
  const shipIntegrity = state.travelTimeRemaining > 0 ? "Nominal" : "Docked";
  const lifeSupport = state.resources.food > 0 ? "Active" : "Critical";

  return `
    <div class="tab-panel">
      <h3>⚙️ Ship Systems</h3>
      <div class="panel-section">
        <div class="stat-row">
          <span>Navigation</span>
          <span class="stat-value">${shipIntegrity}</span>
        </div>
        <div class="stat-row">
          <span>Life Support</span>
          <span class="stat-value">${lifeSupport}</span>
        </div>
        <div class="stat-row">
          <span>Agriculture</span>
          <span class="stat-value">${farmCount > 0 ? `${farmCount} Farm(s) Online` : "Not Installed"}</span>
        </div>
        ${farmCount > 0 ? `
        <div class="stat-row">
          <span>Food Production</span>
          <span class="stat-value">+${CONFIG.BUILDINGS.farm.foodPerTick * farmCount}/s</span>
        </div>
        <div class="stat-row">
          <span>Resource Consumption</span>
          <span class="stat-value">N₂: ${CONFIG.BUILDINGS.farm.inputsPerTick.nitrogen * farmCount}/s | ⚡: ${CONFIG.BUILDINGS.farm.inputsPerTick.energy * farmCount}/s | 💧: ${CONFIG.BUILDINGS.farm.inputsPerTick.water * farmCount}/s</span>
        </div>
        ` : ''}
      </div>
    </div>
  `;
}

// tutorial-moon.UI.6 — Build tab
function renderBuildTab(state) {
  const farm = CONFIG.BUILDINGS.farm;
  const canBuild = Object.entries(farm.cost).every(([res, cost]) => (state.resources[res] || 0) >= cost);
  const hasFarm = state.buildings.farm > 0;

  return `
    <div class="tab-panel">
      <h3>🔨 Construction</h3>
      ${hasFarm ? `
      <div class="built-notice">
        ✅ Farm (${state.buildings.farm}) — Operational
        <div class="farm-stats">
          Producing +${farm.foodPerTick * state.buildings.farm} food/s
          Consuming ${Object.entries(farm.inputsPerTick).map(([k, v]) => `${CONFIG.RESOURCE_META[k].icon}${v * state.buildings.farm}/s`).join(' ')}
        </div>
      </div>
      <div class="build-divider"></div>
      ` : ''}
      <div class="build-card">
        <div class="build-header">
          <span class="build-icon">🌾</span>
          <div>
            <div class="build-name">Farm</div>
            <div class="build-desc">${farm.description}</div>
          </div>
        </div>
        <div class="build-costs">
          ${Object.entries(farm.cost).map(([res, cost]) => {
            const meta = CONFIG.RESOURCE_META[res];
            const has = state.resources[res] || 0;
            const sufficient = has >= cost;
            return `<div class="cost-item ${sufficient ? 'cost-met' : 'cost-unmet'}">
              ${meta.icon} ${meta.label}: ${cost}
              <span class="cost-balance">(${has.toFixed(meta.decimals)})</span>
            </div>`;
          }).join("")}
        </div>
        <div class="build-effects">
          <div class="effect-item effect-in">Consumes: ${Object.entries(farm.inputsPerTick).map(([k, v]) => `${CONFIG.RESOURCE_META[k].icon} ${v}/s`).join(' ')}</div>
          <div class="effect-item effect-out">Produces: 🍞 +${farm.foodPerTick}/s</div>
        </div>
        <button class="btn btn-primary ${!canBuild ? 'btn-disabled' : ''}" 
                onclick="handleBuildFarm()"
                ${!canBuild ? 'disabled' : ''}>
          ${canBuild ? '🔨 Build Farm' : '⛔ Insufficient Resources'}
        </button>
      </div>
    </div>
  `;
}

// tutorial-moon.STATUS.2-4 — Pause popup for tutorial event
function renderPausePopup(state) {
  const lowFoodStatus = state.statuses.find(s => s.id === "low-food");
  if (!lowFoodStatus) return "";

  return `
    <div class="pause-overlay" id="pause-overlay">
      <div class="pause-popup">
        <div class="popup-icon">⚠️</div>
        <h2>${lowFoodStatus.title}</h2>
        <p>${lowFoodStatus.message}</p>
        <div class="popup-advice">
          <p><strong>How to proceed:</strong></p>
          <ol>
            <li>Open the <strong>Build</strong> tab</li>
            <li>Build a <strong>Farm</strong> (costs ${Object.entries(CONFIG.BUILDINGS.farm.cost).map(([k, v]) => `${CONFIG.RESOURCE_META[k].icon} ${v}`).join(', ')})</li>
            <li>The farm will produce food to sustain the colony</li>
          </ol>
        </div>
        ${state.buildings.farm > 0 ? `
          <button class="btn btn-primary" onclick="dismissPopup()">
            Continue Mission
          </button>
        ` : ''}
      </div>
    </div>
  `;
}

// ── Completion ─────────────────────────────────────
// tutorial-moon.COMPLETE.1 — Success screen
function renderComplete(state) {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="screen complete-screen">
      <div class="complete-content">
        <div class="success-icon">🌙</div>
        <h1>Mission Complete</h1>
        <h2>Moon Colony Established</h2>
        <div class="stats-summary">
          <p>Humanity has taken its first step beyond Earth.</p>
          <p>The ${state.destinationName} colony is operational.</p>
          <p>👥 ${state.population} colonists | 😊 Morale: ${state.morale}</p>
        </div>
        <div class="final-resources">
          <h3>Remaining Resources</h3>
          <div class="final-grid">
            ${Object.entries(CONFIG.RESOURCE_META).map(([key, meta]) => `
              <div class="final-item">
                <span>${meta.icon} ${meta.label}</span>
                <span>${state.resources[key].toFixed(meta.decimals)}</span>
              </div>
            `).join("")}
          </div>
        </div>
        <button class="btn btn-primary" onclick="playAgain()">
          Play Again
        </button>
      </div>
    </div>
  `;
}

// ── Helpers ─────────────────────────────────────────
function getMoraleColor(morale) {
  if (morale >= 50) return "#34d399";
  if (morale >= 0) return "#f59e0b";
  return "#ef4444";
}

// ── Global UI Actions ──────────────────────────────

function showDestinations() {
  state.phase = "selecting";
  render(state);
}

function backToIntro() {
  state.phase = "intro";
  render(state);
}

// tutorial-moon.TRAVEL.1 — Start voyage
function startVoyage(destinationId) {
  state = createGameState(destinationId);
  startTravel(state);
  activeTab = "resources";
  render(state);

  travelInterval = setInterval(() => {
    tick(state);
    if (state.paused) {
      // tutorial-moon.STATUS.4 — Timer paused during event popup
      render(state); // Re-render to show pause overlay
      updateResourceDisplay(state);
      return;
    }
    render(state); // Full re-render each tick for now (simplifies tab/status updates)
    updateResourceDisplay(state);

    if (state.phase === "complete") {
      clearInterval(travelInterval);
      travelInterval = null;
      render(state);
    }
  }, 1000);
}

// tutorial-moon.RES.9 — Live resource updates
function updateResourceDisplay(state) {
  for (const [resKey, meta] of Object.entries(CONFIG.RESOURCE_META)) {
    const el = document.getElementById(`res-${resKey}`);
    if (el) el.textContent = state.resources[resKey].toFixed(meta.decimals);
  }
  const timerEl = document.getElementById("timer");
  if (timerEl) timerEl.textContent = `${state.travelTimeRemaining}s`;
  const progressBar = document.getElementById("progress-bar");
  if (progressBar) {
    const elapsed = state.travelTimeTotal - state.travelTimeRemaining;
    progressBar.style.width = `${(elapsed / state.travelTimeTotal) * 100}%`;
  }
}

// tutorial-moon.UI.1 — Tab switching
function switchTab(tab) {
  activeTab = tab;
  if (state && state.phase === "traveling") {
    render(state);
    updateResourceDisplay(state);
  }
}

// tutorial-moon.BUILD.2 — Build farm handler
function handleBuildFarm() {
  if (!state || state.phase !== "traveling") return;
  const result = buildFarm(state);
  if (result.success) {
    render(state);
    updateResourceDisplay(state);
  }
}

// tutorial-moon.STATUS.5 — Dismiss popup
function dismissPopup() {
  state.paused = false;
  state.statuses = state.statuses.filter(s => s.id !== "low-food");
  render(state);
  updateResourceDisplay(state);
}

// tutorial-moon.COMPLETE — Play again
function playAgain() {
  if (travelInterval) { clearInterval(travelInterval); travelInterval = null; }
  activeTab = "resources";
  state = resetState();
  render(state);
}