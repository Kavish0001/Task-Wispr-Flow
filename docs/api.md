# Operation: HUMAN mission API

Source: `server/index.js` (Express 5, ESM). Mission content and answer key: `server/missions.js`, a copy of `src/data/missions.js` kept inside `server/` so the Docker image is self-contained. If you change mission content, update both files.

## Status and limitations

- **In-memory storage only, no database yet.** Attempts disappear on restart and are not shared between instances. At most `MAX_ATTEMPTS` (default 5000) are kept; the oldest are evicted first and attempts expire after 2 hours.
- **The frontend does not use this API yet.** It still scores locally (`scoreMission` in `src/mission.jsx`). The server uses the same formula, so moving the frontend over should not change any scores.
- Scoring happens on the server. Correct answers (`correctOptionId`) and option feedback are never sent before an answer. Feedback is returned only for the option the player chose.

## Run

```
cd server && npm install && npm start      # listens on PORT (default 8787)
```

| Env var | Default | Purpose |
|---|---|---|
| `PORT` | `8787` | Listen port |
| `CORS_ORIGINS` | `http://localhost:5173` | Comma-separated allowlist of browser origins |
| `RATE_LIMIT_PER_MIN` | `120` | Requests per IP per 60 s fixed window (in-memory) |
| `MAX_ATTEMPTS` | `5000` | Cap on attempts held in memory |
| `TRUST_PROXY` | unset | Set to `1` behind one reverse proxy so the rate limit sees real client IPs |

## Conventions

- JSON bodies, limited to 10 kb (`413` if larger). Malformed JSON returns `400`.
- Errors are always `{ "error": "message" }`, never with a stack trace.
- Attempt endpoints need `Authorization: Bearer <token>`, using the token returned when the attempt was created.
- Status codes: `400` invalid body or unknown id in the body, `403` token missing or not the attempt's owner, `404` unknown mission or attempt, `409` attempt already completed, `429` rate limited (`Retry-After` header set), `500` generic.

## Endpoints

### `GET /api/health`
```json
{ "status": "ok", "service": "operation-human-api", "storage": "memory" }
```

### `GET /api/missions`
Public metadata for every mission, locked ones included.
```json
{ "missions": [
  { "id": "001", "slug": "001-the-impostor", "title": "The Impostor", "category": "Social engineering",
    "difficulty": "Beginner", "estimatedMinutes": "5–10", "description": "...", "locked": false },
  { "id": "002", "slug": null, "title": "Open Door", "locked": true, "...": "..." }
] }
```

### `GET /api/missions/:slug`
Public details for a playable mission: briefing, objectives, email, evidence, lesson, `evidencePoints`, `maxScore`, and decisions. Each decision has only `id`, `question`, `points` and `options[{id,label}]`. `404` if the slug is unknown or the mission is locked.

### `POST /api/missions/:slug/attempts`
No body. Returns `201`:
```json
{ "attemptId": "b4413567-f5f0-4ee8-8538-4328f1d3dd05", "token": "3UZsCbcN...", "mission": "001-the-impostor" }
```
The token is 32 random bytes in base64url. Keep it on the client, for example in memory or sessionStorage.

### `POST /api/attempts/:id/evidence`
```
Authorization: Bearer <token>
{ "evidenceId": "sender" }
```
```json
{ "evidenceId": "sender", "examined": ["sender"], "total": 6 }
```
Idempotent: examining the same item again does not add points. Unknown id returns `400 {"error":"Unknown evidenceId"}`.
Evidence ids for 001: `sender`, `replyto`, `urgency`, `link`, `process`, `headers`.

### `POST /api/attempts/:id/decisions`
```
Authorization: Bearer <token>
{ "decisionId": "verdict", "optionId": "phish" }
```
```json
{ "decisionId": "verdict", "optionId": "phish", "correct": true,
  "feedback": "Correct. Multiple independent indicators point to ...", "counted": true }
```
Only the first answer for each decision is scored. Later answers still return `correct` and `feedback` with `"counted": false`, so players can retry for learning.
Decisions for 001: `verdict` (options `legit`, `phish`, `spam`; 20 pts) and `action` (options `click`, `reply`, `verify-report`, `ignore`; 30 pts).

### `POST /api/attempts/:id/complete`
```
Authorization: Bearer <token>
```
If any decision is unanswered, returns `400 {"error":"All decisions must be answered","missing":["action"]}`. Otherwise returns `200`:
```json
{ "attemptId": "b4413567-...", "mission": "001-the-impostor",
  "score": { "evidence": 33, "decisions": 20, "total": 53, "max": 100 },
  "examined": ["sender","replyto","urgency","link"],
  "decisions": [ { "id": "verdict", "chosen": "phish", "correct": true },
                 { "id": "action", "chosen": "click", "correct": false } ],
  "completedAt": "2026-10-10T17:18:22.355Z" }
```
Score formula: `evidence = round(examined * evidencePoints / evidenceCount)`. `decisions` is the sum of `points` for each decision whose first answer was correct. `max = evidencePoints + sum(decision points)`, which is 100 for mission 001. After completion, calling `complete` again returns the same result, and `evidence` and `decisions` return `409`.
