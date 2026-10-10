# Human Operations

**Wispr Flow Hacker House** — cinematic, story-led cybersecurity learning for beginners, freshers, and curious newcomers.

## Run on your own computer

This repository needs only Docker on the machine where you run it:

```bash
docker compose up --build
```

Open [http://localhost:8080](http://localhost:8080). Stop it with `docker compose down`.

The Compose stack builds a React/Vite client and a small Node mission-orchestrator API. Nothing was installed or run on this laptop.

## 3D source assets

`ARCHIVE/` is intentionally ignored by Git and Docker. It contains the supplied `.glb` source models and stays local. To activate the supplied 3D scene on your own computer, copy these files into `public/models/` before running Docker:

```text
ARCHIVE/reactor_model.glb    → public/models/reactor_model.glb
ARCHIVE/atom_02_binary.glb   → public/models/atom_02_binary.glb
ARCHIVE/atom_03_tri.glb      → public/models/atom_03_tri.glb
ARCHIVE/atom_04_tetra.glb    → public/models/atom_04_tetra.glb
```

The directory ignores model files but retains its `.gitkeep`, so the models are never committed. The app has a procedural teal reactor fallback whenever those files are absent.

## Agent model

See [docs/agent-orchestration.md](docs/agent-orchestration.md). The initial API has deterministic orchestration placeholders, so the project remains runnable without API keys or a third-party AI service.
