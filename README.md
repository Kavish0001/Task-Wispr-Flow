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

`ARCHIVE/` is intentionally ignored by Git and Docker. It contains the supplied `.glb` source models and stays local. When you are ready to use a model in the browser, copy the chosen file into `public/models/` on your own computer; keep that directory ignored if the models should not be published.

## Agent model

See [docs/agent-orchestration.md](docs/agent-orchestration.md). The initial API has deterministic orchestration placeholders, so the project remains runnable without API keys or a third-party AI service.
