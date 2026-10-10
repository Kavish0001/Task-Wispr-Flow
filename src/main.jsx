import React, { Suspense, lazy, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './app.css'
import { missions, impostor, playableMissions, stats } from './data/missions.js'
import { labs, headerLab } from './data/labs.js'
import { MissionPlayer } from './mission.jsx'
import { LabTerminal } from './lab.jsx'
import { loadProgress } from './progress.js'

const Backdrop = lazy(() => import('./hero-model.jsx'))

function useRoute() {
  const read = () => window.location.hash.replace(/^#/, '') || '/'
  const [route, setRoute] = useState(read)
  useEffect(() => {
    const on = () => { setRoute(read()); window.scrollTo(0, 0) }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return route
}

function Header({ route }) {
  const links = [['/', 'Home'], ['/missions', 'Missions'], ['/labs', 'Labs'], ['/about', 'About']]
  return (
    <header className="site-header">
      <a className="brand" href="#/"><span className="brand-mark">H</span>Operation: HUMAN</a>
      <nav className="section-nav" aria-label="Primary">
        {links.map(([to, label]) => {
          const active = to === '/' ? route === '/' : route.startsWith(to)
          return <a key={to} href={'#' + to} aria-current={active ? 'page' : undefined}>{label}</a>
        })}
      </nav>
    </header>
  )
}

function Landing() {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="stamp">CLASSIFIED // TRAINING DOSSIER</p>
          <h1>The human is the attack surface.</h1>
          <p className="lede">Investigate the signals. Question the evidence. Learn to recognize the vulnerabilities hidden in everyday decisions.</p>
          <div className="actions">
            <a className="btn primary" href={`#/missions/${impostor.slug}`}>Enter the operation →</a>
            <a className="btn" href="#/missions">Explore missions</a>
          </div>
          <p className="tagline">Trust is the vulnerability.</p>
        </div>
        <aside className="hero-panel">
          <p className="eyebrow">Operation status</p>
          <div className="kpi"><p className="eyebrow">Playable missions</p><b>{stats.missions}</b><i /></div>
          <div className="kpi"><p className="eyebrow">Evidence items to inspect</p><b>{stats.evidence}</b><i /></div>
          <div className="kpi primary"><p className="eyebrow">Live targets</p><b>0</b><i /></div>
        </aside>
      </section>

      <Metrics />

      <section className="band">
        <h2 className="section-title"><span>02</span> How missions work</h2>
        <ol className="steps">
          {[['Brief', 'Read the incident file and your objectives.'], ['Investigate', 'Open each evidence item. Nothing is clickable that could hurt you.'], ['Decide', 'Commit to a verdict and a response before any answer is revealed.'], ['Debrief', 'See what you caught, what you missed, and why it matters.'], ['Lab', 'Go hands-on in a sandboxed terminal with the same case files.']].map(([t, d], i) => (
            <li key={t} className="paper"><b>0{i + 1}</b><strong>{t}</strong><p>{d}</p></li>
          ))}
        </ol>
      </section>

      <section className="band">
        <h2 className="section-title"><span>03</span> Start here</h2>
        <div className="card-grid featured-pair">
          <MissionCard m={impostor} featured />
          <LabCard l={headerLab} />
        </div>
      </section>
    </>
  )
}

function Metrics() {
  const progress = loadProgress()
  const done = playableMissions.filter((m) => progress['mission:' + m.id]?.completed)
  const best = done.reduce((n, m) => n + (progress['mission:' + m.id].best || 0), 0)
  const openLabs = labs.filter((l) => !l.locked)
  const labTasks = openLabs.reduce((n, l) => n + l.tasks.length, 0)
  const labSolved = openLabs.reduce((n, l) => n + (progress['lab:' + l.slug]?.solved?.length || 0), 0)
  const pct = Math.round((done.length / playableMissions.length) * 100)
  return (
    <section className="band">
      <h2 className="section-title"><span>01</span> By the numbers</h2>
      <div className="metrics">
        <div className="kpi"><p className="eyebrow">Missions</p><b>{stats.missions}</b><i /><small>{missions.length - stats.missions} more in development</small></div>
        <div className="kpi"><p className="eyebrow">Skill areas</p><b>{stats.skills}</b><i /><small>phishing to malware</small></div>
        <div className="kpi"><p className="eyebrow">Evidence items</p><b>{stats.evidence}</b><i /><small>each one explained</small></div>
        <div className="kpi"><p className="eyebrow">Decisions</p><b>{stats.decisions}</b><i /><small>feedback on every option</small></div>
        <div className="kpi"><p className="eyebrow">Lab tasks</p><b>{labTasks}</b><i /><small>sandboxed terminal</small></div>
        <div className="kpi"><p className="eyebrow">Training time</p><b>{stats.minutesMin}–{stats.minutesMax}</b><i /><small>minutes, end to end</small></div>
      </div>
      <div className="you paper">
        <p className="eyebrow">Your progress · this browser</p>
        <div className="you-row">
          <div><b>{done.length}<span>/{stats.missions}</span></b><small>missions closed</small></div>
          <div><b>{best}<span>/{stats.maxScore}</span></b><small>best total score</small></div>
          <div><b>{done.length ? Math.round(best / done.length) : '—'}</b><small>average per mission</small></div>
          <div><b>{labSolved}<span>/{labTasks}</span></b><small>lab tasks solved</small></div>
        </div>
        <div className="bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Missions completed"><span style={{ width: pct + '%' }} /></div>
        <div className="you-cases">
          {playableMissions.map((m) => {
            const rec = progress['mission:' + m.id]
            return <a key={m.id} href={`#/missions/${m.slug}`} className={rec?.completed ? 'done' : ''}><span>{m.id}</span>{m.title}<em>{rec?.completed ? `${rec.best}/100` : 'open'}</em></a>
          })}
        </div>
      </div>
    </section>
  )
}

function StatusValue({ locked, rec, lockedText, total }) {
  if (locked) return <dd className="locked">{lockedText}</dd>
  if (rec?.completed) return <dd className="ok">✓ Completed{rec.best != null ? ` · best ${rec.best}/100` : ''}</dd>
  if (rec?.solved?.length) return <dd className="ok">In progress · {rec.solved.length}/{total}</dd>
  return <dd className="ok">Available</dd>
}

function MissionCard({ m, featured }) {
  const rec = loadProgress()['mission:' + m.id]
  const body = (
    <>
      <span className="tape tape-c" />
      <div className="file-tab">MISSION {m.id}</div>
      <h3>{m.title}</h3>
      <p>{m.description}</p>
      <dl className="meta">
        <div><dt>Category</dt><dd>{m.category}</dd></div>
        <div><dt>Difficulty</dt><dd>{m.difficulty}</dd></div>
        <div><dt>Time</dt><dd>{m.estimatedMinutes} min</dd></div>
        <div><dt>Status</dt><StatusValue locked={m.locked} rec={rec} lockedText="Coming soon" /></div>
      </dl>
      {!m.locked && <span className="btn primary small">{rec?.completed ? 'Replay case →' : 'Open case file →'}</span>}
    </>
  )
  return m.locked
    ? <article className={`case-card locked-card`} aria-disabled="true">{body}</article>
    : <a className={`case-card ${featured ? 'featured' : ''}`} href={`#/missions/${m.slug}`}>{body}</a>
}

function Hub() {
  return (
    <section className="band page-top">
      <p className="stamp">CASE ARCHIVE</p>
      <h1 className="page-h">Missions</h1>
      <p className="lede">Browser-based investigations. Pick a case file, examine the evidence, and make the call.</p>
      <div className="card-grid">{missions.map((m) => <MissionCard key={m.id} m={m} />)}</div>
    </section>
  )
}

function LabCard({ l }) {
  const inner = (<><span className="tape tape-c" /><div className="file-tab">LAB</div><h3>{l.title}</h3><p>{l.description}</p>
    <dl className="meta"><div><dt>Track</dt><dd>{l.category}</dd></div><div><dt>Difficulty</dt><dd>{l.difficulty}</dd></div><div><dt>Time</dt><dd>{l.estimatedMinutes} min</dd></div><div><dt>Status</dt><StatusValue locked={l.locked} rec={loadProgress()['lab:' + l.slug]} lockedText="Planned" total={l.tasks?.length} /></div></dl>
    {!l.locked && <span className="btn primary small">Launch terminal →</span>}</>)
  return l.locked ? <article className="case-card locked-card" aria-disabled="true">{inner}</article> : <a className="case-card" href={`#/labs/${l.slug}`}>{inner}</a>
}

function LabsHub() {
  return (
    <section className="band page-top">
      <p className="stamp">FIELD LABS</p>
      <h1 className="page-h">Labs</h1>
      <p className="lede">Hands-on terminal exercises. Lab 01 runs in a browser sandbox — a virtual filesystem with no network and no real shell.</p>
      <div className="card-grid">
        {labs.map((l) => <LabCard key={l.title} l={l} />)}
      </div>
    </section>
  )
}

function About() {
  const principles = [
    ['Learn by doing', 'You never read a list of red flags. You find them yourself in realistic evidence, then defend your decision.'],
    ['Evidence before answers', 'Nothing is revealed until you commit. Retries are allowed, but the score remembers your first call.'],
    ['Safe by design', 'Every domain uses the reserved .invalid TLD, links are inert, and the lab terminal never touches a real machine.'],
    ['Honest scoring', 'Deterministic: up to 50 points for evidence (frozen when you move on), 20 for the verdict, 30 for the action.'],
  ]
  const roadmap = [
    ['Live', `${stats.missions} browser missions, sandbox lab, per-browser progress`],
    ['Built', 'Mission API with server-side scoring and attempt ownership (not yet wired to the UI)'],
    ['Next', 'Accounts and saved progress (Django + PostgreSQL)'],
    ['Planned', 'Isolated container labs behind a separate orchestration service'],
  ]
  return (
    <section className="band page-top about">
      <p className="stamp">ABOUT THE OPERATION</p>
      <h1 className="page-h">Security training that trusts you to think.</h1>
      <p className="lede">Most incidents start with a person: a click, a held door, an approved prompt. Operation: HUMAN puts beginners at the investigator’s desk so they learn to notice those moments before they happen for real.</p>

      <div className="metrics about-metrics">
        <div className="kpi"><p className="eyebrow">Missions</p><b>{stats.missions}</b><i /></div>
        <div className="kpi"><p className="eyebrow">Skill areas</p><b>{stats.skills}</b><i /></div>
        <div className="kpi"><p className="eyebrow">Evidence items</p><b>{stats.evidence}</b><i /></div>
        <div className="kpi primary"><p className="eyebrow">Accounts needed</p><b>0</b><i /></div>
      </div>

      <h2 className="section-title"><span>01</span> Principles</h2>
      <div className="principles">
        {principles.map(([t, d], i) => <div key={t} className="paper"><p className="eyebrow">0{i + 1}</p><h3>{t}</h3><p className="muted">{d}</p></div>)}
      </div>

      <h2 className="section-title"><span>02</span> What you will learn</h2>
      <div className="paper table-wrap">
        <table className="skill-table">
          <thead><tr><th>Mission</th><th>Skill area</th><th>Level</th><th>You practise</th></tr></thead>
          <tbody>
            {playableMissions.map((m) => (
              <tr key={m.id}>
                <td><a href={`#/missions/${m.slug}`}><span className="mono">{m.id}</span> {m.title}</a></td>
                <td>{m.category}</td>
                <td><span className="badge">{m.difficulty}</span></td>
                <td className="muted">{m.objectives.slice(0, 2).join(' · ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="two-col about-split">
        <div>
          <h2 className="section-title"><span>03</span> Safety model</h2>
          <ul className="checklist done-list">
            <li>All organisations, people, domains and IPs are fictional (<code>.invalid</code> domains, documentation IP ranges).</li>
            <li>Suspicious links and attachments are buttons that only reveal their destination as text.</li>
            <li>The lab is a command interpreter over in-memory files, with no network and no real shell.</li>
            <li>No AI, no tracking, no accounts. Progress stays in your browser.</li>
          </ul>
        </div>
        <div>
          <h2 className="section-title"><span>04</span> Status</h2>
          <dl className="roadmap">
            {roadmap.map(([k, v]) => <div key={k}><dt><span className={`dot ${k.toLowerCase()}`} />{k}</dt><dd>{v}</dd></div>)}
          </dl>
        </div>
      </div>

      <div className="paper credits">
        <p className="eyebrow">Built with</p>
        <p className="muted">React + Vite · three.js (reactor and atom models) · Express mission API · Design structure from PayZ, colours from the 3D models. Open source on <a href="https://github.com/Kavish0001/Task-Wispr-Flow">GitHub</a>.</p>
      </div>

      <div className="actions"><a className="btn primary" href={`#/missions/${impostor.slug}`}>Start Mission 001 →</a><a className="btn" href="#/missions">Browse all missions</a></div>
    </section>
  )
}

function NotFound() {
  return <section className="band page-top"><h1 className="page-h">File not found</h1><a className="btn" href="#/">Back to base</a></section>
}

function App() {
  const route = useRoute()
  let page
  if (route === '/') page = <Landing />
  else if (route === '/missions') page = <Hub />
  else if (playableMissions.some((m) => route === `/missions/${m.slug}`)) page = <MissionPlayer key={route} mission={playableMissions.find((m) => route === `/missions/${m.slug}`)} />
  else if (route === '/labs') page = <LabsHub />
  else if (route === `/labs/${headerLab.slug}`) page = <LabTerminal key={route} lab={headerLab} />
  else if (route === '/about') page = <About />
  else page = <NotFound />
  return (
    <>
      <Suspense fallback={null}><Backdrop /></Suspense>
      <div className="grain" aria-hidden="true" />
      <Header route={route} />
      <div className="crumbs" aria-hidden="true"><span>OPERATION: HUMAN</span>{route.split('/').filter(Boolean).map((c) => <span key={c}>/ {c.replace(/-/g, ' ').toUpperCase()}</span>)}</div>
      <main className="main">{page}</main>
      <footer className="site-footer">Operation: HUMAN · Fictional training scenarios only · No live targets</footer>
    </>
  )
}

createRoot(document.getElementById('root')).render(<App />)
