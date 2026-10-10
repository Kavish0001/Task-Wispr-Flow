# Operation: HUMAN

> Trust is the vulnerability.

A cinematic, beginner-friendly cybersecurity training platform. Investigate fictional incidents, inspect evidence, make decisions, and get a debrief that explains why.

**Live demo:** https://kavish0001.github.io/Task-Wispr-Flow/

## What works
- **Landing, Missions, Labs, About** pages (hash routing — deep links work on static hosting).
- **Mission 001: The Impostor** — playable end to end: briefing → evidence desk (click parts of a fake email and raw headers) → two decisions with feedback and retry → scored debrief with missed warning signs → replay.
- **Lab 01: Header Forensics** — a browser-sandboxed terminal (`ls`, `cat`, `grep`, `head`, `wc`, `submit`, `hint`…) over in-memory case files. It does **not** execute anything on a real machine.
- **3D exhibits** — GLB models lazy-loaded and auto-framed; procedural fallback if a model fails.
- **Mission API** (`server/`) — server-authoritative scoring, see [docs/api.md](docs/api.md). Not yet wired to the frontend.

All domains use the reserved `.invalid` TLD; no link in a mission is clickable.

## Limitations (honest)
- Progress lives only in the browser tab; no accounts, nothing persisted.
- The API stores attempts in memory; Django/PostgreSQL from the master plan is not built yet.
- Real container labs are not implemented.

## Run locally
```bash
npm install
npm run dev            # http://localhost:5173
cd server && npm install && npm start   # optional API on :8787
```
Or with Docker: `docker compose up --build` → http://localhost:8080

## Deploy
- Vercel: import the repo, framework "Vite", no env vars needed.
- GitHub Pages: `BASE_PATH=/Task-Wispr-Flow/ npm run build`, publish `dist/` to the `gh-pages` branch.

Design language: paper-collage dossier style carried over from [My-portfollio](https://github.com/Kavish0001/My-portfollio). Build process: [docs/agent-orchestration.md](docs/agent-orchestration.md).
