<div align="center">

# Operation: HUMAN

**Trust is the vulnerability.**

An interactive cybersecurity training platform for beginners.
You investigate fictional incidents, examine the evidence, make a decision, and get a debrief that explains *why*.

### [▶ Play the live demo](https://kavish0001.github.io/Task-Wispr-Flow/)

![React](https://img.shields.io/badge/React-19-171513?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-build-171513?style=flat-square&logo=vite)
![Three.js](https://img.shields.io/badge/Three.js-3D-171513?style=flat-square&logo=threedotjs)
![Express](https://img.shields.io/badge/Express-API-171513?style=flat-square&logo=express)
![Status](https://img.shields.io/badge/status-hackathon%20MVP-0f7d6c?style=flat-square)

</div>

---

## Why

Most breaches start with a person, not a zero-day. Reading a list of "phishing red flags" doesn't build the habit of
*checking*. Operation: HUMAN puts you at the investigator's desk: nothing is revealed until you look for it, and
nothing is scored until you commit to a decision.

## What you can do

### 🗂 Mission 001 — *The Impostor*
An employee at a fictional company receives an "urgent account verification" email from "IT Security".

| Step | What happens |
|---|---|
| **1. Briefing** | Incident file, fictional organisation, objectives, estimated time. |
| **2. Evidence desk** | A realistic inbox view. Click the sender, reply-to, link, body text and **raw headers** to log six pieces of evidence in the inspector. |
| **3. Decisions** | *Is it legitimate?* and *What should the employee do?* Answers stay hidden until you submit. Feedback explains why every other option is risky. You can retry, but your score keeps your first answer. |
| **4. Debrief** | Score out of 100, warning signs caught, **warning signs missed** (with explanations), the key lesson, replay. |

**Scoring is deterministic:** 50 points for evidence (frozen the moment you move on to decide) + 20 for the verdict + 30 for the action, both first try only.

### 💻 Lab 01 — *Header Forensics*
A hands-on terminal that uses the same case. Pull apart the email, prove it was spoofed, and find out who already clicked.

```text
analyst@lab:/$ grep spf case/suspicious.eml
        spf=fail smtp.mailfrom=acct-review.invalid;
analyst@lab:/$ grep POST case/proxy.log
2026-10-14T08:01:29Z 10.4.12.37 POST http://northstar-portal.acct-review.invalid/login 302
analyst@lab:/$ submit 10.4.12.37
✔ Correct — task 3/5 solved.
```

Commands: `ls` `cd` `cat` `head` `grep [-i]` `wc -l` `pwd` `whoami` `objectives` `hint` `submit <answer>` `clear`, plus ↑/↓ history.

> The terminal is a **browser sandbox**: a small command interpreter over in-memory files. It never runs anything on a real machine and has no network access, so it is safe to host publicly.

### 💾 Progress
Completed missions (with best score) and solved lab tasks are remembered **in your browser** (`localStorage`). There are no accounts yet. Clearing site data resets everything.

## Design

The visual language comes from [My-portfollio](https://github.com/Kavish0001/My-portfollio): paper collage, typewriter
monospace, ink borders, hard offset shadows, tape strips and ruled paper. Here it becomes an **investigation dossier**,
with a teal signal colour for the accent. Mission cards look like case files, the decision screen like a form,
the debrief like a stamped report.

3D exhibits (`public/models/*.glb`) are lazy-loaded in a separate chunk and auto-framed with drei `<Bounds>`. If a
model fails to load, a procedural shape takes its place.

Accessibility: keyboard-operable evidence and decisions, visible focus rings, focus moves to the heading on each
step change, `aria-live` inspector and terminal, and `prefers-reduced-motion` respected.

## Architecture

```text
Browser ──► React SPA (Vite, hash routing)
              ├─ src/data/missions.js   mission content as data (evidence, decisions, feedback)
              ├─ src/mission.jsx        reusable mission player + scoreMission()
              ├─ src/data/labs.js       lab files + runCommand() sandbox interpreter
              ├─ src/lab.jsx            terminal UI
              ├─ src/progress.js        per-browser progress (localStorage)
              └─ src/hero-model.jsx     lazy 3D stage
        ┄┄►  Mission API (server/, Express)  ← built, not yet wired to the UI
              server-authoritative scoring · bearer-token attempt ownership
              input validation · rate limit · CORS allowlist · no stack traces
```

Adding a mission means adding a data object. The briefing, evidence desk, decision and debrief components are shared.

The API contract is documented in **[docs/api.md](docs/api.md)**: `GET /api/missions`, `POST /api/missions/:slug/attempts`,
`POST /api/attempts/:id/evidence`, `/decisions` and `/complete`. Public mission data never includes the answer key.

## Project structure

```text
├─ src/
│  ├─ main.jsx            routes + pages (Home, Missions, Labs, About)
│  ├─ mission.jsx         Mission player
│  ├─ lab.jsx             Lab terminal
│  ├─ progress.js         localStorage progress
│  ├─ hero-model.jsx      React Three Fiber model stage
│  ├─ app.css             design system
│  └─ data/               missions.js, labs.js
├─ server/                Express mission API (index.js, missions.js)
├─ public/models/         GLB 3D assets
├─ docs/                  api.md, agent-orchestration.md
├─ Dockerfile, nginx.conf, docker-compose.yml
└─ vite.config.js         BASE_PATH-aware build
```

## Run locally

Requires **Node 20+**.

```bash
git clone https://github.com/Kavish0001/Task-Wispr-Flow.git
cd Task-Wispr-Flow
npm install
npm run dev                 # → http://localhost:5173
```

Optional: start the mission API in a second terminal.

```bash
cd server
npm install
npm start                   # → http://localhost:8787/api/health
```

Or start the whole stack with Docker:

```bash
docker compose up --build   # → http://localhost:8080
```

## Deploy

| Target | How |
|---|---|
| **GitHub Pages** (current demo) | `BASE_PATH=/Task-Wispr-Flow/ npm run build`, copy `dist/index.html` to `dist/404.html`, publish `dist/` to the `gh-pages` branch. |
| **Vercel / Netlify** | Import the repo, framework *Vite*, build `npm run build`, output `dist`. No env vars needed. |
| **API** | Any Node host (Render, Fly, Railway). Set `CORS_ORIGINS` to the frontend URL. See [docs/api.md](docs/api.md) for all env vars. |

## How it was built

One coordinating agent plus specialist agents, each with its own files:
a **backend agent** (`server/`, `docs/api.md`) and a read-only **security & QA agent** whose findings were fixed
before release (for example, a prototype-key crash in the lab filesystem and a score-inflation path).
Details are in **[docs/agent-orchestration.md](docs/agent-orchestration.md)**. No AI runs inside the product.

## Safety

- Every domain uses the reserved **`.invalid`** TLD. Organisations and people are fictional; IPs are private (10.x) or documentation (198.51.100.x) ranges.
- The phishing link is an inert button. Its real destination is only ever shown as text.
- No `dangerouslySetInnerHTML`. All content renders as React text.
- No secrets in the repo. `.env*` files are git-ignored.

## Limitations

- The frontend scores locally; the API isn't wired in yet.
- The API stores attempts **in memory**, so a restart clears them.
- No accounts, and no progress sync across devices.
- Only Mission 001 and Lab 01 are playable. The other cards are clearly marked *Coming soon* or *Planned*.

## Roadmap

- [ ] Wire the frontend to the API, using server scoring when it's available
- [ ] Django REST Framework + PostgreSQL, user accounts, persisted attempts
- [ ] Missions 002 *Open Door* (access control) and 003 *Red Relay* (identity)
- [ ] Real container labs behind a separate orchestration service: per-user isolation, resource limits, no egress, auto-cleanup, xterm.js. Never in the web process, never via the Docker socket.

---

<div align="center"><sub>Fictional training scenarios only · No live targets</sub></div>
