// Browser-sandboxed lab: a virtual filesystem and a small command interpreter.
// Nothing here executes on a real machine; commands only read the in-memory files below.

const eml = `Return-Path: <bounce@acct-review.invalid>
Received: from mail.acct-review.invalid (198.51.100.23)
        by mx.northstar.invalid; Tue, 14 Oct 2026 07:52:18 +0000
Authentication-Results: mx.northstar.invalid;
        spf=fail smtp.mailfrom=acct-review.invalid;
        dkim=none; dmarc=fail header.from=northstar-support.invalid
From: "IT Security" <security@northstar-support.invalid>
Reply-To: verify@acct-review.invalid
To: maya.chen@northstar.invalid
Subject: URGENT: Account Verification Required
X-Mailer: BulkSend 4.2

Your access will be RESTRICTED within 2 hours.
Verify now: http://northstar-portal.acct-review.invalid/login?u=maya.chen`

const proxy = `2026-10-14T07:58:02Z 10.4.12.19 GET https://intranet.northstar.invalid/home 200
2026-10-14T07:58:40Z 10.4.12.22 GET https://mail.northstar.invalid/inbox 200
2026-10-14T08:01:11Z 10.4.12.37 GET http://northstar-portal.acct-review.invalid/login?u=j.ortiz 200
2026-10-14T08:01:29Z 10.4.12.37 POST http://northstar-portal.acct-review.invalid/login 302
2026-10-14T08:03:45Z 10.4.12.41 GET https://intranet.northstar.invalid/it/help 200
2026-10-14T08:05:02Z 10.4.12.19 GET https://docs.northstar.invalid/q3 200`

const dir = `# Northstar internal directory (excerpt)
IT Help Desk        ext. 4400   helpdesk@northstar.invalid
Security Team       ext. 4410   security@northstar.invalid
Phish reports       report-phish@northstar.invalid
Workstation 10.4.12.37  ->  j.ortiz (Finance)
Workstation 10.4.12.19  ->  m.chen (Operations)`

export const headerLab = {
  slug: 'header-forensics',
  title: 'Header Forensics',
  category: 'Email forensics · Terminal',
  difficulty: 'Beginner',
  estimatedMinutes: '10',
  description: 'Use a sandboxed terminal to pull apart the Impostor email, prove it is spoofed, and find out who already clicked.',
  files: {
    'case/README.txt': 'Case INC-2026-0417. Files: suspicious.eml, proxy.log, directory.txt\nType `objectives` to see your tasks and `submit <answer>` to answer.',
    'case/suspicious.eml': eml,
    'case/proxy.log': proxy,
    'case/directory.txt': dir,
  },
  tasks: [
    { id: 't1', prompt: 'Which domain does Return-Path point to?', answer: ['acct-review.invalid', 'bounce@acct-review.invalid'], hint: 'grep Return-Path case/suspicious.eml' },
    { id: 't2', prompt: 'What was the SPF result?', answer: ['fail'], hint: 'grep spf case/suspicious.eml' },
    { id: 't3', prompt: 'Which internal IP submitted credentials (POST) to the phishing site?', answer: ['10.4.12.37'], hint: 'grep POST case/proxy.log' },
    { id: 't4', prompt: 'Which user owns that workstation?', answer: ['j.ortiz'], hint: 'grep 10.4.12.37 case/directory.txt' },
    { id: 't5', prompt: 'Which address should the phish be reported to?', answer: ['report-phish@northstar.invalid'], hint: 'cat case/directory.txt' },
  ],
}

export const labs = [
  headerLab,
  { slug: null, title: 'Log Triage', category: 'Detection · Terminal', difficulty: 'Intermediate', estimatedMinutes: '15', description: 'Isolated container lab with real shell tooling. Requires the lab orchestration service.', locked: true },
]

function resolve(files, cwd, p) {
  if (!p) return cwd
  let path = p.startsWith('/') ? p.slice(1) : (cwd ? cwd + '/' + p : p)
  const parts = []
  for (const s of path.split('/')) { if (!s || s === '.') continue; if (s === '..') parts.pop(); else parts.push(s) }
  return parts.join('/')
}
const getFile = (files, p) => (Object.prototype.hasOwnProperty.call(files, p) && typeof files[p] === 'string' ? files[p] : null)
const isDir = (files, p) => p === '' || Object.keys(files).some((f) => f.startsWith(p + '/'))

export function runCommand(lab, state, line) {
  const { files } = lab
  const [cmd, ...args] = line.trim().split(/\s+/)
  const out = (text) => ({ ...state, output: text })
  switch (cmd) {
    case undefined: case '': return out('')
    case 'help':
      return out('Commands: ls [dir], cd <dir>, cat <file>, head <file>, grep [-i] <pattern> <file>, wc -l <file>, pwd, whoami, objectives, hint, submit <answer> (answers the next open task), clear')
    case 'whoami': return out('analyst (sandboxed — no network, no real shell)')
    case 'pwd': return out('/' + state.cwd)
    case 'ls': {
      const target = resolve(files, state.cwd, args[0])
      if (!isDir(files, target)) return getFile(files, target) != null ? out(args[0]) : out(`ls: ${args[0]}: No such file or directory`)
      const prefix = target ? target + '/' : ''
      const names = new Set(Object.keys(files).filter((f) => f.startsWith(prefix)).map((f) => { const rest = f.slice(prefix.length); return rest.includes('/') ? rest.split('/')[0] + '/' : rest }))
      return out([...names].join('   '))
    }
    case 'cd': {
      const target = args[0] ? resolve(files, state.cwd, args[0]) : ''
      return isDir(files, target) ? { ...state, cwd: target, output: '' } : out(`cd: ${args[0]}: Not a directory`)
    }
    case 'cat': case 'head': {
      if (!args[0]) return out(`${cmd}: missing file operand`)
      const f = getFile(files, resolve(files, state.cwd, args[0]))
      if (f == null) return out(`${cmd}: ${args[0]}: No such file`)
      return out(cmd === 'head' ? f.split('\n').slice(0, 10).join('\n') : f)
    }
    case 'wc': {
      const f = getFile(files, resolve(files, state.cwd, args[args.length - 1]))
      return f == null ? out('wc: no such file') : out(`${f.split('\n').length} ${args[args.length - 1]}`)
    }
    case 'grep': {
      const ci = args[0] === '-i'; const rest = ci ? args.slice(1) : args
      if (rest.length < 2) return out('usage: grep [-i] <pattern> <file>')
      const pattern = rest.slice(0, -1).join(' ').replace(/^["']|["']$/g, '')
      const f = getFile(files, resolve(files, state.cwd, rest[rest.length - 1]))
      if (f == null) return out(`grep: ${rest[rest.length - 1]}: No such file`)
      const needle = ci ? pattern.toLowerCase() : pattern
      return out(f.split('\n').filter((l) => (ci ? l.toLowerCase() : l).includes(needle)).join('\n') || '(no matches)')
    }
    case 'objectives':
      return out(lab.tasks.map((t, i) => `${state.solved.includes(t.id) ? '[x]' : '[ ]'} ${i + 1}. ${t.prompt}`).join('\n'))
    case 'hint': {
      const next = lab.tasks.find((t) => !state.solved.includes(t.id))
      return out(next ? `Try: ${next.hint}` : 'All tasks solved.')
    }
    case 'submit': {
      const next = lab.tasks.find((t) => !state.solved.includes(t.id))
      if (!next) return out('All tasks already solved.')
      const answer = args.join(' ').trim().toLowerCase().replace(/[<>"']/g, '').replace(/\.$/, '')
      if (!answer) return out('usage: submit <answer>')
      if (next.answer.includes(answer)) {
        const solved = [...state.solved, next.id]
        const after = lab.tasks.find((t) => !solved.includes(t.id))
        return { ...state, solved, output: `✔ Correct — task ${solved.length}/${lab.tasks.length} solved.${after ? `\nNext: ${after.prompt}` : '\nLab complete. Report filed.'}` }
      }
      return out(`✘ "${args.join(' ')}" is not right for: ${next.prompt}`)
    }
    default: return out(`${cmd}: command not found (type 'help')`)
  }
}
