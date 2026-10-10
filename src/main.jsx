import React, { Suspense, lazy, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './app.css'
import { missions, impostor } from './data/missions.js'
import { labs, headerLab } from './data/labs.js'
import { MissionPlayer } from './mission.jsx'
import { LabTerminal } from './lab.jsx'

const ModelStage = lazy(() => import('./hero-model.jsx'))

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

function Model({ file, className = '' }) {
  return (
    <div className={`model-frame ${className}`} aria-hidden="true">
      <span className="tape tape-l" /><span className="tape tape-r" />
      <Suspense fallback={<div className="model-loading">LOADING EXHIBIT…</div>}><ModelStage file={file} /></Suspense>
    </div>
  )
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
        <Model file="reactor_model.glb" className="hero-model" />
      </section>

      <section className="band">
        <h2 className="section-title"><span>01</span> How missions work</h2>
        <ol className="steps">
          {[['Brief', 'Read the incident file and your objectives.'], ['Investigate', 'Open each evidence item. Nothing is clickable that could hurt you.'], ['Decide', 'Commit to a verdict and a response before any answer is revealed.'], ['Debrief', 'See what you caught, what you missed, and why it matters.'], ['Lab', 'Go hands-on in a sandboxed terminal with the same case files.']].map(([t, d], i) => (
            <li key={t} className="paper"><b>0{i + 1}</b><strong>{t}</strong><p>{d}</p></li>
          ))}
        </ol>
      </section>

      <section className="band">
        <h2 className="section-title"><span>02</span> Featured case</h2>
        <MissionCard m={impostor} featured />
      </section>
    </>
  )
}

function MissionCard({ m, featured }) {
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
        <div><dt>Status</dt><dd className={m.locked ? 'locked' : 'ok'}>{m.locked ? 'Coming soon' : 'Available'}</dd></div>
      </dl>
      {!m.locked && <span className="btn primary small">Open case file →</span>}
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
      <p className="lede">Browser-based investigations. One live case; more files are being declassified.</p>
      <div className="card-grid">{missions.map((m) => <MissionCard key={m.id} m={m} />)}</div>
    </section>
  )
}

function LabsHub() {
  return (
    <section className="band page-top">
      <p className="stamp">FIELD LABS</p>
      <h1 className="page-h">Labs</h1>
      <p className="lede">Hands-on terminal exercises. Lab 01 runs in a browser sandbox — a virtual filesystem with no network and no real shell.</p>
      <div className="card-grid">
        {labs.map((l) => {
          const inner = (<><span className="tape tape-c" /><div className="file-tab">LAB</div><h3>{l.title}</h3><p>{l.description}</p>
            <dl className="meta"><div><dt>Track</dt><dd>{l.category}</dd></div><div><dt>Difficulty</dt><dd>{l.difficulty}</dd></div><div><dt>Time</dt><dd>{l.estimatedMinutes} min</dd></div><div><dt>Status</dt><dd className={l.locked ? 'locked' : 'ok'}>{l.locked ? 'Planned' : 'Available'}</dd></div></dl>
            {!l.locked && <span className="btn primary small">Launch terminal →</span>}</>)
          return l.locked ? <article key={l.title} className="case-card locked-card" aria-disabled="true">{inner}</article> : <a key={l.title} className="case-card" href={`#/labs/${l.slug}`}>{inner}</a>
        })}
      </div>
    </section>
  )
}

function About() {
  return (
    <section className="band page-top about">
      <p className="stamp">MEMO</p>
      <h1 className="page-h">About the operation</h1>
      <div className="two-col">
        <div className="paper prose">
          <p>Most breaches start with a person, not a zero-day. Operation: HUMAN teaches beginners to spot manipulation by <b>doing</b>: you investigate fictional incidents, weigh evidence, commit to a decision, and get a debrief that explains the why.</p>
          <p>Every scenario is synthetic. Domains use the reserved <code>.invalid</code> TLD and no link in a mission is ever live. The lab terminal is a sandbox interpreter over in-memory files — it does not execute commands on any machine.</p>
          <p><b>Status:</b> progress is kept only in this browser tab. There are no accounts yet, and nothing is saved to a server. Isolated container labs are planned behind a separate orchestration service.</p>
        </div>
        <Model file="atom_04_tetra.glb" className="side-model" />
      </div>
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
  else if (route === `/missions/${impostor.slug}`) page = <MissionPlayer key={route} mission={impostor} Model={Model} />
  else if (route === '/labs') page = <LabsHub />
  else if (route === `/labs/${headerLab.slug}`) page = <LabTerminal key={route} lab={headerLab} />
  else if (route === '/about') page = <About />
  else page = <NotFound />
  return (
    <>
      <div className="grain" aria-hidden="true" />
      <Header route={route} />
      <main className="main">{page}</main>
      <footer className="site-footer">Operation: HUMAN · Fictional training scenarios only · No live targets</footer>
    </>
  )
}

createRoot(document.getElementById('root')).render(<App />)
