import { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

const fallbackMissions = [
  { id: 'signal-noise', index: '01', title: 'Signal / Noise', level: 'Entry', time: '06 min', status: 'ready', brief: 'A suspicious message reaches the studio inbox. Read the context, detect the cues, and choose the safest next step.', tags: ['Social engineering', 'Verification'], color: 'cyan' },
  { id: 'access-window', index: '02', title: 'Access Window', level: 'Entry', time: '08 min', status: 'locked', brief: 'Map what a new team member should be able to access — and what should remain protected.', tags: ['Least privilege', 'Identity'], color: 'amber' },
  { id: 'relay', index: '03', title: 'The Relay', level: 'Fresh', time: '10 min', status: 'locked', brief: 'Follow a fictional alert across a small network and decide what evidence matters first.', tags: ['Triage', 'Observability'], color: 'violet' }
]

function App() {
  const [missions, setMissions] = useState(fallbackMissions)
  const [selected, setSelected] = useState(fallbackMissions[0])
  const [mode, setMode] = useState('map')
  const [pulse, setPulse] = useState(0)

  useEffect(() => {
    fetch('/api/missions').then((res) => res.ok ? res.json() : null).then((data) => {
      if (data?.missions?.length) { setMissions(data.missions); setSelected(data.missions[0]) }
    }).catch(() => {})
  }, [])

  const detail = useMemo(() => selected || missions[0], [selected, missions])
  const launch = () => { setMode('briefing'); setPulse((n) => n + 1) }

  return <main className={`app ${mode === 'briefing' ? 'briefing' : ''}`}>
    <div className="film-grain" />
    <div className="scanlines" />
    <nav>
      <a className="mark" href="#top" aria-label="Human Operations home"><i /> HUMAN <span>OPERATIONS</span></a>
      <div className="nav-links"><a href="#missions">Missions</a><a href="#method">Method</a><button className="profile">K / 00</button></div>
    </nav>

    <section className="hero" id="top">
      <div className="hero-copy">
        <p className="eyebrow">HACKER HOUSE // ORIENTATION</p>
        <h1>Learn to read<br /><em>the signal.</em></h1>
        <p className="lede">Cinematic cyber missions for people who learn through atmosphere, story, and sharp visual cues.</p>
        <div className="hero-actions"><button className="primary" onClick={launch}>Enter operation <b>→</b></button><button className="text-button" onClick={() => document.getElementById('missions').scrollIntoView({ behavior: 'smooth' })}>View mission map</button></div>
      </div>
      <div className="reactor" aria-hidden="true">
        <div className="orbit orbit-a" /><div className="orbit orbit-b" /><div className="orbit orbit-c" />
        <div className="core"><span /><span /><span /></div>
        <div className="reactor-label"><b>H.O. // CORE_01</b><small>EDUCATIONAL SIMULATION</small></div>
      </div>
      <div className="coordinates">19° 07' 48.0" N&nbsp;&nbsp; 72° 52' 48.0" E<br />LOCAL // 23:48:02</div>
    </section>

    <section className="mission-section" id="missions">
      <header><div><p className="eyebrow">SELECT A TRANSMISSION</p><h2>Mission map</h2></div><p className="progress">01 <span>/ 03</span> <i /></p></header>
      <div className="mission-layout">
        <div className="mission-list">{missions.map((mission) => <button key={mission.id} className={`mission ${detail.id === mission.id ? 'active' : ''} ${mission.status}`} onClick={() => setSelected(mission)}>
          <span className="mission-number">{mission.index}</span><span className="mission-name">{mission.title}<small>{mission.level} · {mission.time}</small></span><span className="mission-state">{mission.status === 'ready' ? 'OPEN' : 'LOCKED'}</span><b>↗</b>
        </button>)}</div>
        <article className={`mission-detail ${detail.color}`}>
          <div className="detail-grid" /><p className="eyebrow">MISSION_{detail.index} // {detail.status}</p><h3>{detail.title}</h3><p>{detail.brief}</p><div className="tags">{detail.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><button className="primary small" onClick={launch} disabled={detail.status !== 'ready'}>{detail.status === 'ready' ? 'Begin briefing →' : 'Awaiting clearance'}</button>
        </article>
      </div>
    </section>

    <section className="method" id="method"><p className="eyebrow">THE HUMAN METHOD</p><div className="method-grid"><h2>Context before<br /><em>commands.</em></h2><p>Every operation starts with a scene, an observed signal, and a decision. You build a mental model before touching a tool.</p><ul><li><b>01</b> Observe the story</li><li><b>02</b> Find the evidence</li><li><b>03</b> Make a safe call</li></ul></div></section>

    {mode === 'briefing' && <div className="briefing-panel" key={pulse}><button className="close" onClick={() => setMode('map')} aria-label="Close briefing">×</button><p className="eyebrow">LIVE BRIEFING // {detail.index}</p><h2>{detail.title}</h2><p>Your objective: identify the cues, explain your decision, and protect the fictional team. No live targets. No real credentials. Just clear thinking.</p><div className="briefing-status"><span /> SCENE LOADED <i /> READY FOR YOUR CALL</div><button className="primary" onClick={() => setMode('map')}>Start simulation →</button></div>}
    <footer>HUMAN OPERATIONS <span>STAY CURIOUS. VERIFY EVERYTHING.</span></footer>
  </main>
}

createRoot(document.getElementById('root')).render(<App />)
