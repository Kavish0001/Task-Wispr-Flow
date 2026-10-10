import React, { useEffect, useRef, useState } from 'react'
import { loadProgress, saveProgress } from './progress.js'

const STEPS = ['Briefing', 'Evidence', 'Decision', 'Debrief']

// Deterministic scoring: evidence examined + first-attempt correctness per decision.
export function scoreMission(mission, examined, firstAnswers) {
  const per = mission.evidencePoints / mission.evidence.length
  const evidence = Math.round(examined.length * per)
  const decisions = mission.decisions.reduce((s, d) => s + (firstAnswers[d.id] === d.correctOptionId ? d.points : 0), 0)
  return { evidence, decisions, total: evidence + decisions, max: mission.evidencePoints + mission.decisions.reduce((s, d) => s + d.points, 0) }
}

function Progress({ step }) {
  return (
    <ol className="progress" aria-label="Mission progress">
      {STEPS.map((s, i) => <li key={s} className={i === step ? 'now' : i < step ? 'done' : ''} aria-current={i === step ? 'step' : undefined}>{i < step ? '✓' : `0${i + 1}`} {s}</li>)}
    </ol>
  )
}

function EmailView({ email, examined, onInspect }) {
  const mark = (id) => (examined.includes(id) ? 'hl seen' : 'hl')
  return (
    <div className="email paper">
      <div className="email-bar"><span>INBOX · maya.chen</span><span>{email.date}</span></div>
      <dl className="email-head">
        <div><dt>From</dt><dd><button className={mark('sender')} onClick={() => onInspect('sender')}>{email.fromName} &lt;{email.fromAddress}&gt;</button></dd></div>
        <div><dt>Reply-To</dt><dd><button className={mark('replyto')} onClick={() => onInspect('replyto')}>{email.replyTo}</button></dd></div>
        <div><dt>To</dt><dd>{email.to}</dd></div>
        <div><dt>Subject</dt><dd><strong>{email.subject}</strong></dd></div>
      </dl>
      <div className="email-body">
        {email.body.map((p, i) => p.link
          ? <p key={i}><button className={`${mark('link')} fake-link`} onClick={() => onInspect('link')} title="Inspect link — it will not open">{email.linkLabel}</button><span className="inert">(inert — inspect only)</span></p>
          : <p key={i} style={{ whiteSpace: 'pre-line' }}>{p.evidence ? <button className={mark(p.evidence)} onClick={() => onInspect(p.evidence)}>{p.text}</button> : p.text}</p>)}
      </div>
      <details className="headers" onToggle={(e) => e.currentTarget.open && onInspect('headers')}>
        <summary>View raw headers</summary>
        <pre>{email.headers.join('\n')}</pre>
      </details>
    </div>
  )
}

function RecordsView({ mission, examined, onInspect }) {
  return (
    <div className="email paper records">
      <div className="email-bar"><span>{mission.recordsTitle}</span><span>READ-ONLY</span></div>
      {mission.records.map((sec) => (
        <section key={sec.heading} className="record-sec">
          <h4>{sec.heading}</h4>
          <dl>
            {sec.rows.map((r) => (
              <div key={r.label + r.value}>
                <dt>{r.label}</dt>
                <dd>{r.evidence ? <button className={examined.includes(r.evidence) ? 'hl seen' : 'hl'} onClick={() => onInspect(r.evidence)}>{r.value}</button> : r.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  )
}

export function MissionPlayer({ mission }) {
  const [step, setStep] = useState(0)
  const [examined, setExamined] = useState([])
  const [active, setActive] = useState(null)
  const [decisionIdx, setDecisionIdx] = useState(0)
  const [selected, setSelected] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [firstAnswers, setFirstAnswers] = useState({})
  const [startedAt, setStartedAt] = useState(() => Date.now())
  // Evidence is scored as it stood when the learner first left the desk; later review is free.
  const [scoredEvidence, setScoredEvidence] = useState(null)
  const headRef = useRef(null)
  useEffect(() => { window.scrollTo(0, 0); headRef.current?.focus({ preventScroll: true }) }, [step, decisionIdx])

  const inspect = (id) => { setActive(id); setExamined((e) => (e.includes(id) ? e : [...e, id])) }
  const activeItem = mission.evidence.find((e) => e.id === active)
  const decision = mission.decisions[decisionIdx]

  const submit = () => {
    if (!selected) return
    setSubmitted(true)
    setFirstAnswers((a) => (decision.id in a ? a : { ...a, [decision.id]: selected }))
  }
  const retry = () => { setSelected(null); setSubmitted(false) }
  const next = () => {
    retry()
    if (decisionIdx + 1 < mission.decisions.length) setDecisionIdx(decisionIdx + 1)
    else setStep(3)
  }
  const replay = () => { setStep(0); setExamined([]); setActive(null); setDecisionIdx(0); setFirstAnswers({}); setScoredEvidence(null); setStartedAt(Date.now()); retry() }
  const toDecision = () => { setScoredEvidence((s) => s ?? examined); setStep(2) }

  const score = scoreMission(mission, scoredEvidence ?? examined, firstAnswers)
  useEffect(() => {
    if (step !== 3) return
    const prev = loadProgress()['mission:' + mission.id] || {}
    saveProgress('mission:' + mission.id, { completed: true, best: Math.max(prev.best || 0, score.total), last: score.total, completedAt: new Date().toISOString() })
  }, [step]) // eslint-disable-line react-hooks/exhaustive-deps
  const missed = mission.evidence.filter((e) => !examined.includes(e.id))

  return (
    <section className="band page-top mission">
      <div className="mission-head">
        <div><p className="stamp">{mission.incident} · MISSION {mission.id}</p><h1 className="page-h" ref={headRef} tabIndex={-1}>{mission.title}</h1></div>
        <Progress step={step} />
      </div>

      {step === 0 && (
        <div className="two-col">
          <div className="paper dossier">
            <span className="tape tape-c" />
            <p className="file-tab">INCIDENT BRIEF</p>
            <dl className="meta">
              <div><dt>Incident</dt><dd>{mission.incident}</dd></div>
              <div><dt>Organisation</dt><dd>{mission.company}</dd></div>
              <div><dt>Category</dt><dd>{mission.category}</dd></div>
              <div><dt>Est. time</dt><dd>{mission.estimatedMinutes} min</dd></div>
            </dl>
            <p className="brief-text">{mission.briefing}</p>
            <h3>Objectives</h3>
            <ul className="checklist">{mission.objectives.map((o) => <li key={o}>{o}</li>)}</ul>
            <button className="btn primary" onClick={() => setStep(1)}>Start investigation →</button>
          </div>
          <aside className="kpis">
            <div className="kpi"><p className="eyebrow">Evidence items</p><b>{mission.evidence.length}</b><i /></div>
            <div className="kpi"><p className="eyebrow">Decisions</p><b>{mission.decisions.length}</b><i /></div>
            <div className="kpi primary"><p className="eyebrow">Max score</p><b>{mission.evidencePoints + mission.decisions.reduce((s, d) => s + d.points, 0)}</b><i /></div>
          </aside>
        </div>
      )}

      {step === 1 && (
        <>
          <p className="instructions">Select each highlighted item{mission.artifact === 'email' ? ' (and the raw headers)' : ''} to log it as evidence. <b>{examined.length}/{mission.evidence.length}</b> examined.</p>
          <div className="desk">
            {mission.artifact === 'email' ? <EmailView email={mission.email} examined={examined} onInspect={inspect} /> : <RecordsView mission={mission} examined={examined} onInspect={inspect} />}
            <aside className="inspector paper" aria-live="polite">
              <p className="file-tab">EVIDENCE INSPECTOR</p>
              {activeItem ? (
                <div className="inspect-card" key={activeItem.id}>
                  <span className="chip">{activeItem.type}</span>
                  <h3>{activeItem.title}</h3>
                  <code className="evidence-raw">{activeItem.content}</code>
                  <p>{activeItem.explanation}</p>
                  {activeItem.id === 'link' && <p className="note">Destination shown as text. Real investigators hover or copy — never click.</p>}
                </div>
              ) : <p className="muted">Select something in the email to inspect it.</p>}
              <h4>Evidence log</h4>
              <ul className="ev-list">
                {mission.evidence.map((e) => (
                  <li key={e.id}><button className={examined.includes(e.id) ? 'seen' : ''} onClick={() => inspect(e.id)}>{examined.includes(e.id) ? '✓' : '○'} {e.title}</button></li>
                ))}
              </ul>
              <button className="btn primary" onClick={toDecision} disabled={examined.length < 3}>
                {examined.length < 3 ? `Examine ${3 - examined.length} more to continue` : 'Proceed to decision →'}
              </button>
            </aside>
          </div>
        </>
      )}

      {step === 2 && (
        <div className="two-col">
          <div className="paper decision">
            <p className="file-tab">DECISION {decisionIdx + 1} / {mission.decisions.length}</p>
            <h2>{decision.question}</h2>
            <fieldset disabled={submitted}>
              <legend className="sr-only">{decision.question}</legend>
              {decision.options.map((o) => {
                const state = submitted ? (o.id === decision.correctOptionId ? 'right' : o.id === selected ? 'wrong' : '') : ''
                return (
                  <label key={o.id} className={`option ${selected === o.id ? 'picked' : ''} ${state}`}>
                    <input type="radio" name={decision.id} value={o.id} checked={selected === o.id} onChange={() => setSelected(o.id)} />
                    <span>{o.label}</span>
                  </label>
                )
              })}
            </fieldset>
            {!submitted && <button className="btn primary" onClick={submit} disabled={!selected}>Submit decision</button>}
            {submitted && (
              <div className={`feedback ${selected === decision.correctOptionId ? 'good' : 'bad'}`} role="status">
                <strong>{selected === decision.correctOptionId ? 'SAFE DECISION' : 'UNSAFE DECISION'}</strong>
                <p>{decision.options.find((o) => o.id === selected).feedback}</p>
                <details><summary>Why the other options are risky</summary>
                  <ul>{decision.options.filter((o) => o.id !== selected).map((o) => <li key={o.id}><b>{o.label}:</b> {o.feedback}</li>)}</ul>
                </details>
                <div className="actions">
                  {selected !== decision.correctOptionId && <button className="btn" onClick={retry}>Retry (score keeps first answer)</button>}
                  <button className="btn" onClick={() => setStep(1)}>Review evidence (no score change)</button>
                  <button className="btn primary" onClick={next}>{decisionIdx + 1 < mission.decisions.length ? 'Next decision →' : 'Open debrief →'}</button>
                </div>
              </div>
            )}
          </div>
          <aside className="paper mini-log">
            <p className="file-tab">YOUR EVIDENCE</p>
            <ul className="ev-list">{mission.evidence.filter((e) => examined.includes(e.id)).map((e) => <li key={e.id}>✓ {e.indicator}</li>)}</ul>
          </aside>
        </div>
      )}

      {step === 3 && (
        <div className="debrief">
          <div className="paper score-card">
            <span className="tape tape-c" />
            <p className="file-tab">DEBRIEF · {score.total >= 80 ? 'CASE CLOSED' : 'CASE CLOSED WITH GAPS'}</p>
            <div className="score"><b>{score.total}</b><span>/ {score.max}</span></div>
            <dl className="meta">
              <div><dt>Evidence (before deciding)</dt><dd>{(scoredEvidence ?? examined).length}/{mission.evidence.length} · {score.evidence} pts</dd></div>
              <div><dt>Decisions (1st try)</dt><dd>{mission.decisions.filter((d) => firstAnswers[d.id] === d.correctOptionId).length}/{mission.decisions.length} · {score.decisions} pts</dd></div>
              <div><dt>Time</dt><dd>{Math.max(1, Math.round((Date.now() - startedAt) / 60000))} min</dd></div>
            </dl>
            <blockquote>{mission.lesson}</blockquote>
            <div className="actions">
              <button className="btn" onClick={replay}>Replay mission</button>
              <a className="btn" href="#/missions">Return to missions</a>
              {mission.id === '001' && <a className="btn primary" href="#/labs/header-forensics">Continue in the lab →</a>}
            </div>
          </div>
          <div className="paper">
            <h3>Warning signs caught</h3>
            <ul className="checklist">{mission.evidence.filter((e) => examined.includes(e.id)).map((e) => <li key={e.id}>{e.indicator}</li>)}</ul>
            {missed.length > 0 && (<><h3>Missed warning signs</h3><ul className="missed">{missed.map((e) => <li key={e.id}><b>{e.indicator}</b> — {e.explanation}</li>)}</ul></>)}
            <h3>Objectives</h3>
            <ul className="checklist">{mission.objectives.map((o) => <li key={o}>{o}</li>)}</ul>
          </div>
        </div>
      )}
    </section>
  )
}
