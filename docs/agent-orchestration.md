# Agent orchestration

Operation: HUMAN is built by one coordinating agent plus specialist agents with strict file ownership.
No AI runs inside the product — orchestration is how the codebase is built and reviewed.

| Agent | Owns | Delivered |
|---|---|---|
| **Coordinator** | `src/`, `index.html`, `vite.config.js`, deploy | Routing, Mission 001 player, sandbox lab, design system, integration, GitHub Pages deploy |
| **Backend** | `server/`, `docs/api.md` | Express mission API with server-authoritative scoring, bearer-token attempt ownership, validation, rate limiting, CORS allowlist |
| **Security & QA** (read-only) | — | Prioritised defect list; coordinator applied the fixes |

## Rules
1. Contracts first: mission data shape (`src/data/missions.js`) and API (`docs/api.md`).
2. One owner per file — agents never edit the same files concurrently.
3. Every agent reports changed files and the tests it actually ran.
4. The coordinator reviews and integrates; nothing is merged blind.

## QA findings fixed in this round
- Lab VFS lookups used plain object keys (`cat __proto__` crashed the app) → own-property lookups + try/catch.
- Score could be inflated by reviewing evidence after seeing answers → evidence is frozen when the learner first proceeds.
- Replay did not reset the timer; step changes did not move focus/scroll; stale state in rapid terminal commands.
- Lab answers too strict (`<bounce@…>` rejected) → normalised input.
- Pages build used absolute `/` paths → configurable `BASE_PATH`.

## Next phase
- Wire the frontend to the API (currently scores locally; API is in-memory).
- Django + PostgreSQL per the master plan; real container labs behind a separate orchestration service (never the web process, never the Docker socket).
