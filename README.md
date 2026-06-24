# Generation Colony Ship

An incremental idle/management game about a generation colony ship spreading humanity through space. Built with spec-driven development — every requirement traced via ACID identifiers.

## Quick Start

Serve the `src/` directory with any HTTP server:

```bash
cd src && python3 -m http.server 8080
```

Then open http://localhost:8080/

## Run Tests

Open `tests.html` in a browser, or serve via HTTP and navigate to `/tests.html`.

## Architecture

- **`src/config.js`** — All configurable constants (starting values, consumption rates, resource groups). Extension points marked for future systems.
- **`src/engine.js`** — Pure simulation logic. No DOM access. Functions: `createGameState()`, `tick()`, `startTravel()`, `resetState()`.
- **`src/ui.js`** — DOM rendering and user interaction. Reads state, never mutates engine internals directly.
- **`src/index.html`** — Entry point.
- **`src/tests.html`** — ACID-referenced test suite (26 tests, all passing).

## Spec

`features/tutorial-moon.feature.yaml` — YAML spec with ACID identifiers tracing every requirement through code and tests.

## Current Feature: Tutorial Moon

Humanity's first colonization mission. 60-second voyage from Earth to The Moon with real-time resource management.

## Extension Points (Future)

See `src/config.js` and `src/engine.js` for commented extension points:
- Population & demographics
- Morale & societal stability
- Research & technology
- Politics & edicts
- Random events & crises
- Colonies & planetary management