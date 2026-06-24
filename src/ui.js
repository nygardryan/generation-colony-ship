// tutorial-moon.ARCH.3 — UI/rendering separated from simulation logic

/**
 * Renders the current game phase (intro, selecting, traveling, complete).
 * tutorial-moon.INTRO.1 — Introduction screen
 * tutorial-moon.DEST.1 — Destination selection screen
 * tutorial-moon.TRAVEL.1-4 — Travel screen with countdown + resources
 * tutorial-moon.COMPLETE.1 — Completion screen
 */
function render(state) {
  switch (state.phase) {
    case "intro":     renderIntro(); break;
    case "selecting": renderDestinations(state); break;
    case "traveling": renderTravel(state); break;
    case "complete":  renderComplete(state); break;
  }
}

// ── Intro ──────────────────────────────────────────
// tutorial-moon.INTRO.1 — Shows introduction explaining the colony ship
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
// tutorial-moon.DEST.1 — Destination selection screen
// tutorial-moon.DEST.2 — Moon is the only available destination
function renderDestinations(state) {
  const app = document.getElementById("app");
  const destinations = CONFIG.DESTINATIONS;

  let cards = Object.values(destinations).map((dest) => {
    // tutorial-moon.DEST.2 — Moon as only option
    const isAvailable = dest.id === "moon"; // Only Moon available in v1
    return `
      <div class="dest-card ${isAvailable ? "available" : "locked"}">
        <div class="dest-header">
          <span class="dest-icon">${isAvailable ? "🌕" : "🔒"}</span>
          <h3>${dest.name}</h3>
        </div>
        <p class="dest-desc">${dest.description}</p>
        <div class="dest-meta">
          <span>Travel time: ${dest.travelTime}s</span>
        </div>
        ${isAvailable
          ? `<button class="btn btn-primary" onclick="startVoyage('${dest.id}')">
               Launch to ${dest.name}
             </button>`
          : `<span class="locked-label">Coming Soon</span>`
        }
      </div>
    `;
  }).join("");

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

// ── Travel ─────────────────────────────────────────
// tutorial-moon.TRAVEL.1 — 60 second voyage
// tutorial-moon.TRAVEL.3 — Remaining travel time countdown
// tutorial-moon.TRAVEL.4 — Current destination displayed
function renderTravel(state) {
  const app = document.getElementById("app");
  const dest = CONFIG.DESTINATIONS[state.destinationId];
  const elapsed = state.travelTimeTotal - state.travelTimeRemaining;
  const progress = (elapsed / state.travelTimeTotal) * 100;

  // tutorial-moon.RES.1 — Build resource groups
  const resourceSections = Object.entries(CONFIG.RESOURCE_GROUPS).map(([groupKey, group]) => {
    const items = group.resources.map((resKey) => {
      const meta = CONFIG.RESOURCE_META[resKey];
      const value = state.resources[resKey];
      const isConsumed = dest.consumptionPerSecond[resKey] > 0;
      return `
        <div class="resource-item ${isConsumed ? "consumed" : ""}">
          <span class="res-icon">${meta.icon}</span>
          <span class="res-label">${meta.label}</span>
          <span class="res-value" id="res-${resKey}">${value.toFixed(meta.decimals)}</span>
          ${isConsumed ? `<span class="res-rate">-${dest.consumptionPerSecond[resKey]}/s</span>` : ""}
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

  app.innerHTML = `
    <div class="screen travel-screen">
      <div class="travel-header">
        <div class="destination-badge">🌕 ${state.destinationName}</div>
        <div class="timer" id="timer">${state.travelTimeRemaining}s</div>
      </div>
      <!-- tutorial-moon.TRAVEL.1 — Progress bar -->
      <div class="progress-bar-container">
        <div class="progress-bar" id="progress-bar" style="width: ${progress}%"></div>
      </div>
      <div class="resources-panel">
        ${resourceSections}
      </div>
    </div>
  `;
}

/**
 * Updates resource values during travel (called each tick).
 * tutorial-moon.RES.9 — Resource values update in real time
 */
function updateResourceDisplay(state) {
  for (const [resKey, meta] of Object.entries(CONFIG.RESOURCE_META)) {
    const el = document.getElementById(`res-${resKey}`);
    if (el) {
      el.textContent = state.resources[resKey].toFixed(meta.decimals);
    }
  }
  // tutorial-moon.TRAVEL.3 — Update timer
  const timerEl = document.getElementById("timer");
  if (timerEl) {
    timerEl.textContent = `${state.travelTimeRemaining}s`;
  }
  // Update progress bar
  const progressBar = document.getElementById("progress-bar");
  if (progressBar) {
    const elapsed = state.travelTimeTotal - state.travelTimeRemaining;
    const progress = (elapsed / state.travelTimeTotal) * 100;
    progressBar.style.width = `${progress}%`;
  }
}

// ── Complete ───────────────────────────────────────
// tutorial-moon.COMPLETE.1 — Success screen
// tutorial-moon.COMPLETE.2 — Moon colony established
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

// ── Global UI Actions ──────────────────────────────

// tutorial-moon.INTRO.2 — Proceed to destination selection
function showDestinations() {
  state.phase = "selecting";
  render(state);
}

// tutorial-moon.DEST.3 — Gap resolution: Back button from destination selection
function backToIntro() {
  state.phase = "intro";
  render(state);
}

// tutorial-moon.DEST.3 — Begin voyage to selected destination
// tutorial-moon.TRAVEL.1 — Start the 60-second travel
function startVoyage(destinationId) {
  state = createGameState(destinationId);
  startTravel(state);
  render(state);

  // tutorial-moon.TRAVEL.2 — Real-time resource consumption loop
  travelInterval = setInterval(() => {
    // tutorial-moon.RES.7, RES.10 — Apply consumption, floor at zero
    tick(state);
    updateResourceDisplay(state);

    // tutorial-moon.TRAVEL.5 — Check for completion
    if (state.phase === "complete") {
      clearInterval(travelInterval);
      travelInterval = null;
      render(state);
    }
  }, 1000);
}

// Gap resolution: Play Again
function playAgain() {
  if (travelInterval) {
    clearInterval(travelInterval);
    travelInterval = null;
  }
  state = resetState();
  render(state);
}