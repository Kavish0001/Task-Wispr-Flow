import express from 'express'

const app = express()
app.use(express.json())

const missions = [
  { id: 'signal-noise', index: '01', title: 'Signal / Noise', level: 'Entry', time: '06 min', status: 'ready', brief: 'A suspicious message reaches the studio inbox. Read the context, detect the cues, and choose the safest next step.', tags: ['Social engineering', 'Verification'], color: 'cyan' },
  { id: 'access-window', index: '02', title: 'Access Window', level: 'Entry', time: '08 min', status: 'locked', brief: 'Map what a new team member should be able to access — and what should remain protected.', tags: ['Least privilege', 'Identity'], color: 'amber' },
  { id: 'relay', index: '03', title: 'The Relay', level: 'Fresh', time: '10 min', status: 'locked', brief: 'Follow a fictional alert across a small network and decide what evidence matters first.', tags: ['Triage', 'Observability'], color: 'violet' }
]

// The central mission director runs bounded, educational roles. It never reaches live systems.
const roles = ['scene-director', 'evidence-guide', 'safety-reviewer', 'debrief-writer']
app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'mission-orchestrator' }))
app.get('/api/missions', (_req, res) => res.json({ missions }))
app.post('/api/missions/:id/brief', (req, res) => {
  const mission = missions.find((item) => item.id === req.params.id)
  if (!mission) return res.status(404).json({ error: 'Mission not found' })
  res.json({ missionId: mission.id, agents: roles.map((role, order) => ({ role, order, state: 'queued' })), boundary: 'Fictional, defensive learning environment only.' })
})

app.listen(8787, () => console.log('Human Operations mission orchestrator on :8787'))
