import React, { useEffect, useRef, useState } from 'react'
import { runCommand } from './data/labs.js'

export function LabTerminal({ lab }) {
  const [state, setState] = useState({ cwd: '', solved: [], output: '' })
  const [lines, setLines] = useState([
    { kind: 'sys', text: `Operation: HUMAN sandbox — ${lab.title}` },
    { kind: 'sys', text: "Simulated terminal. No network, no real shell. Type 'help', then 'cat case/README.txt'." },
  ])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState([])
  const [hIdx, setHIdx] = useState(-1)
  const endRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => { endRef.current?.scrollIntoView({ block: 'nearest' }) }, [lines])

  // State lives in a ref too, so rapid commands never read a stale closure.
  const stateRef = useRef(state)
  const exec = (cmd) => {
    if (cmd.trim() === 'clear') { setLines([]); return }
    const prev = stateRef.current
    let next
    try { next = runCommand(lab, prev, cmd) } catch { next = { ...prev, output: 'error: command failed' } }
    stateRef.current = next
    setState(next)
    setLines((l) => [...l, { kind: 'cmd', text: `analyst@lab:/${prev.cwd}$ ${cmd}` }, ...(next.output ? [{ kind: 'out', text: String(next.output) }] : [])])
  }
  const onKey = (e) => {
    if (e.nativeEvent.isComposing) return
    if (e.key === 'Enter') { exec(input); if (input.trim()) setHistory((h) => [input, ...h]); setInput(''); setHIdx(-1) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); const i = Math.min(hIdx + 1, history.length - 1); if (history[i] != null) { setHIdx(i); setInput(history[i]) } }
    else if (e.key === 'ArrowDown') { e.preventDefault(); const i = hIdx - 1; setHIdx(Math.max(i, -1)); setInput(i < 0 ? '' : history[i]) }
  }
  const done = state.solved.length === lab.tasks.length

  return (
    <section className="band page-top lab">
      <p className="stamp">LAB · {lab.category}</p>
      <h1 className="page-h">{lab.title}</h1>
      <div className="lab-grid">
        <div className="terminal" onClick={() => inputRef.current?.focus()}>
          <div className="term-bar"><i /><i /><i /><span>sandbox://{lab.slug}</span></div>
          <div className="term-body" role="log" aria-live="polite">
            {lines.map((l, i) => <pre key={i} className={l.kind}>{l.text}</pre>)}
            <div className="prompt-line">
              <label htmlFor="term-in">analyst@lab:/{state.cwd}$</label>
              <input id="term-in" ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={onKey} autoComplete="off" spellCheck="false" autoFocus />
            </div>
            <div ref={endRef} />
          </div>
        </div>
        <aside className="paper tasks">
          <p className="file-tab">TASKS {state.solved.length}/{lab.tasks.length}</p>
          <ol>
            {lab.tasks.map((t) => <li key={t.id} className={state.solved.includes(t.id) ? 'done' : ''}>{state.solved.includes(t.id) ? '✓ ' : ''}{t.prompt}</li>)}
          </ol>
          <p className="muted">Answer with <code>submit &lt;answer&gt;</code>. Stuck? Type <code>hint</code>.</p>
          <div className="quick">
            {['ls case', 'cat case/suspicious.eml', 'grep POST case/proxy.log', 'hint'].map((c) => <button key={c} className="btn small" onClick={() => exec(c)}>{c}</button>)}
          </div>
          {done && <div className="feedback good" role="status"><strong>LAB COMPLETE</strong><p>You proved the email was spoofed, found the compromised user and the correct reporting channel. Next step in real life: reset j.ortiz's password and revoke sessions.</p><a className="btn primary" href="#/missions">Back to missions</a></div>}
        </aside>
      </div>
    </section>
  )
}
