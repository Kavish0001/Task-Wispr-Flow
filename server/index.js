import express from 'express'
import { randomBytes, randomUUID, timingSafeEqual } from 'node:crypto'
import { missions } from './missions.js'

// Mission API with server-authoritative scoring. Storage is in-memory only (no database yet):
// attempts are lost on restart and are not shared between instances.

const PORT = Number(process.env.PORT) || 8787
const MAX_ATTEMPTS = Number(process.env.MAX_ATTEMPTS) || 5000
const ATTEMPT_TTL_MS = 2 * 60 * 60 * 1000
const RATE_WINDOW_MS = 60 * 1000
const RATE_MAX = Number(process.env.RATE_LIMIT_PER_MIN) || 120
const CORS_ORIGINS = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',').map((s) => s.trim()).filter(Boolean)

const playable = missions.filter((m) => m.slug && !m.locked)
const bySlug = new Map(playable.map((m) => [m.slug, m]))

// ---- public projections (never expose correctOptionId / feedback) ----
const summary = (m) => ({
  id: m.id, slug: m.slug, title: m.title, category: m.category, difficulty: m.difficulty,
  estimatedMinutes: m.estimatedMinutes, description: m.description, locked: Boolean(m.locked || !m.slug),
})
const maxScore = (m) => m.evidencePoints + m.decisions.reduce((s, d) => s + d.points, 0)
const details = (m) => ({
  ...summary(m),
  incident: m.incident, company: m.company, briefing: m.briefing, objectives: m.objectives,
  email: m.email, evidence: m.evidence, lesson: m.lesson,
  evidencePoints: m.evidencePoints, maxScore: maxScore(m),
  decisions: m.decisions.map((d) => ({
    id: d.id, question: d.question, points: d.points,
    options: d.options.map((o) => ({ id: o.id, label: o.label })),
  })),
})

// ---- in-memory attempt store ----
const attempts = new Map() // id -> attempt (Map keeps insertion order => oldest first)
function pruneAttempts() {
  const now = Date.now()
  for (const [id, a] of attempts) if (now - a.createdAt > ATTEMPT_TTL_MS) attempts.delete(id)
  while (attempts.size >= MAX_ATTEMPTS) attempts.delete(attempts.keys().next().value)
}

// Same formula as the frontend's scoreMission(): evidence share + first-answer correctness.
function score(m, a) {
  const per = m.evidencePoints / m.evidence.length
  const evidence = Math.round(a.evidence.size * per)
  const decisions = m.decisions.reduce((s, d) => s + (a.answers.get(d.id) === d.correctOptionId ? d.points : 0), 0)
  return { evidence, decisions, total: evidence + decisions, max: maxScore(m) }
}

// ---- app ----
const app = express()
app.disable('x-powered-by')
if (process.env.TRUST_PROXY === '1') app.set('trust proxy', 1)

app.use((req, res, next) => {
  res.set({ 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' })
  const origin = req.headers.origin
  const allowed = Boolean(origin && CORS_ORIGINS.includes(origin))
  if (allowed) {
    res.set({
      'Access-Control-Allow-Origin': origin, Vary: 'Origin',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '600',
    })
  }
  if (req.method === 'OPTIONS') return res.sendStatus(allowed ? 204 : 403)
  next()
})

// Simple fixed-window rate limit per IP.
const hits = new Map()
app.use((req, res, next) => {
  const now = Date.now()
  const key = req.ip || 'unknown'
  let h = hits.get(key)
  if (!h || now - h.start > RATE_WINDOW_MS) {
    if (hits.size > 10000) hits.clear()
    h = { start: now, count: 0 }
    hits.set(key, h)
  }
  if (++h.count > RATE_MAX) {
    res.set('Retry-After', String(Math.ceil((h.start + RATE_WINDOW_MS - now) / 1000)))
    return res.status(429).json({ error: 'Too many requests' })
  }
  next()
})

app.use(express.json({ limit: '10kb' }))

const bad = (res, msg) => res.status(400).json({ error: msg })
const isId = (v) => typeof v === 'string' && v.length > 0 && v.length <= 64

// Resolves the attempt and checks the bearer token owns it (constant-time compare).
function loadAttempt(req, res, next) {
  const a = attempts.get(req.params.id)
  if (!a) return res.status(404).json({ error: 'Attempt not found' })
  const m = /^Bearer ([A-Za-z0-9_-]{16,128})$/.exec(req.get('authorization') || '')
  const given = m ? Buffer.from(m[1]) : Buffer.alloc(0)
  const expected = Buffer.from(a.token)
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return res.status(403).json({ error: 'Forbidden' })
  }
  req.attempt = a
  req.mission = bySlug.get(a.slug)
  next()
}
const requireOpen = (req, res, next) =>
  req.attempt.completedAt ? res.status(409).json({ error: 'Attempt already completed' }) : next()

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'operation-human-api', storage: 'memory' }))

app.get('/api/missions', (_req, res) => res.json({ missions: missions.map(summary) }))

app.get('/api/missions/:slug', (req, res) => {
  const m = bySlug.get(req.params.slug)
  if (!m) return res.status(404).json({ error: 'Mission not found' })
  res.json({ mission: details(m) })
})

app.post('/api/missions/:slug/attempts', (req, res) => {
  const m = bySlug.get(req.params.slug)
  if (!m) return res.status(404).json({ error: 'Mission not found' })
  pruneAttempts()
  const attempt = {
    id: randomUUID(), token: randomBytes(32).toString('base64url'), slug: m.slug,
    createdAt: Date.now(), completedAt: null, evidence: new Set(), answers: new Map(),
  }
  attempts.set(attempt.id, attempt)
  res.status(201).json({ attemptId: attempt.id, token: attempt.token, mission: m.slug })
})

app.post('/api/attempts/:id/evidence', loadAttempt, requireOpen, (req, res) => {
  const { evidenceId } = req.body || {}
  if (!isId(evidenceId)) return bad(res, 'evidenceId is required')
  if (!req.mission.evidence.some((e) => e.id === evidenceId)) return bad(res, 'Unknown evidenceId')
  req.attempt.evidence.add(evidenceId)
  res.json({ evidenceId, examined: [...req.attempt.evidence], total: req.mission.evidence.length })
})

app.post('/api/attempts/:id/decisions', loadAttempt, requireOpen, (req, res) => {
  const { decisionId, optionId } = req.body || {}
  if (!isId(decisionId) || !isId(optionId)) return bad(res, 'decisionId and optionId are required')
  const d = req.mission.decisions.find((x) => x.id === decisionId)
  if (!d) return bad(res, 'Unknown decisionId')
  const opt = d.options.find((o) => o.id === optionId)
  if (!opt) return bad(res, 'Unknown optionId')
  const counted = !req.attempt.answers.has(d.id)
  if (counted) req.attempt.answers.set(d.id, opt.id) // only the first answer per decision is scored
  res.json({ decisionId: d.id, optionId: opt.id, correct: opt.id === d.correctOptionId, feedback: opt.feedback, counted })
})

app.post('/api/attempts/:id/complete', loadAttempt, (req, res) => {
  const m = req.mission
  const a = req.attempt
  const missing = m.decisions.filter((d) => !a.answers.has(d.id)).map((d) => d.id)
  if (missing.length) return res.status(400).json({ error: 'All decisions must be answered', missing })
  if (!a.completedAt) a.completedAt = Date.now()
  res.json({
    attemptId: a.id, mission: m.slug, score: score(m, a),
    examined: [...a.evidence],
    decisions: m.decisions.map((d) => ({ id: d.id, chosen: a.answers.get(d.id), correct: a.answers.get(d.id) === d.correctOptionId })),
    completedAt: new Date(a.completedAt).toISOString(),
  })
})

app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }))

// Generic error handler: never leaks stack traces.
app.use((err, _req, res, _next) => {
  if (err?.type === 'entity.too.large') return res.status(413).json({ error: 'Payload too large' })
  if (err?.type === 'entity.parse.failed') return bad(res, 'Invalid JSON')
  console.error('Unhandled error:', err?.message)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => console.log(`Operation: HUMAN mission API on :${PORT}`))
