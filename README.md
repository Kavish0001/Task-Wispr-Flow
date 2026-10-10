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

`public/models/` contains the supplied cinematic `.glb` assets and is versioned with the project, so the full 3D experience is available after a normal clone. `ARCHIVE/` stays ignored and is reserved for private planning or local source material.

The app still has a procedural teal reactor fallback if a model cannot load.

## Agent model

See [docs/agent-orchestration.md](docs/agent-orchestration.md). The initial API has deterministic orchestration placeholders, so the project remains runnable without API keys or a third-party AI service.
