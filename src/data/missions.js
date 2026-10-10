import { tailgate, ghostInvoice, quietDrive, upcoming } from './missions-extra.js'

// Mission content is pure data. Every domain uses the reserved .invalid TLD; no link is ever clickable.

export const impostor = {
  id: '001',
  slug: '001-the-impostor',
  title: 'The Impostor',
  category: 'Social engineering',
  difficulty: 'Beginner',
  estimatedMinutes: '5–10',
  incident: 'INC-2026-0417',
  company: 'Northstar Logistics (fictional)',
  description:
    'An employee has received a message that appears to come from internal IT. Something about the request does not add up. Examine the evidence before the attacker gets what they want.',
  briefing:
    'An employee has reported an urgent account-verification email. The sender claims to represent internal IT. Your task is to determine whether the message is legitimate and recommend the safest response.',
  objectives: [
    'Inspect sender identity and reply-to information',
    'Identify urgency and authority manipulation',
    'Inspect a suspicious link without visiting it',
    'Distinguish evidence from assumptions',
    'Choose the correct reporting and escalation action',
  ],
  artifact: 'email',
  email: {
    fromName: 'IT Security',
    fromAddress: 'security@northstar-support.invalid',
    replyTo: 'verify@acct-review.invalid',
    to: 'maya.chen@northstar.invalid',
    subject: 'URGENT: Account Verification Required',
    date: 'Tue, 14 Oct 2026 07:52:18 +0000',
    linkLabel: 'https://portal.northstar.invalid/verify',
    linkTarget: 'http://northstar-portal.acct-review.invalid/login?u=maya.chen',
    body: [
      { text: 'Dear Employee,' },
      { text: 'Our security systems detected unusual sign-in activity on your account. To protect company data, your access will be RESTRICTED within 2 hours unless you complete identity verification.', evidence: 'urgency' },
      { text: 'Please verify your credentials immediately using the secure portal below:' },
      { link: true },
      { text: 'Do not contact the help desk regarding this notice — they cannot process verification requests. Failure to comply will be reported to your manager.', evidence: 'process' },
      { text: 'Regards,\nIT Security Team\nNorthstar Logistics' },
    ],
    headers: [
      'Return-Path: <bounce@acct-review.invalid>',
      'Received: from mail.acct-review.invalid (198.51.100.23)',
      'Authentication-Results: mx.northstar.invalid; spf=fail; dkim=none; dmarc=fail',
      'X-Mailer: BulkSend 4.2',
    ],
  },
  evidence: [
    {
      id: 'sender',
      title: 'Sender identity',
      type: 'Identity',
      field: 'fromAddress',
      content: 'Display name "IT Security" — address security@northstar-support.invalid',
      explanation:
        'The display name looks official, but the real domain is northstar-support.invalid, not the company domain northstar.invalid. Anyone can type any display name.',
      indicator: 'Look-alike sender domain',
    },
    {
      id: 'replyto',
      title: 'Reply-to address',
      type: 'Routing',
      field: 'replyTo',
      content: 'Reply-To: verify@acct-review.invalid',
      explanation:
        'Replies go to a third, unrelated domain. Legitimate internal IT notices do not route answers to an outside verification service.',
      indicator: 'Mismatched reply-to',
    },
    {
      id: 'urgency',
      title: 'Urgency & threats',
      type: 'Pressure',
      field: 'body',
      content: '"RESTRICTED within 2 hours" · "Failure to comply will be reported to your manager"',
      explanation:
        'A short deadline plus a threat from authority is a classic pressure tactic: it is designed to make you act before you think.',
      indicator: 'Artificial urgency + authority',
    },
    {
      id: 'link',
      title: 'Link destination',
      type: 'URL',
      field: 'link',
      content: 'Shown: portal.northstar.invalid/verify → Actual: northstar-portal.acct-review.invalid/login',
      explanation:
        'The visible text and the real destination differ. The registered domain is acct-review.invalid — "northstar-portal" is just a subdomain the attacker controls. It also uses plain http.',
      indicator: 'Deceptive link target',
    },
    {
      id: 'process',
      title: 'Verification process',
      type: 'Context',
      field: 'body',
      content: '"Do not contact the help desk" · asks for credentials by link',
      explanation:
        'Real IT never asks you to avoid the help desk, and never requests passwords through an emailed link. Cutting off verification channels is a red flag.',
      indicator: 'Blocks independent verification',
    },
    {
      id: 'headers',
      title: 'Message headers',
      type: 'Technical',
      field: 'headers',
      content: 'spf=fail · dmarc=fail · Return-Path bounce@acct-review.invalid',
      explanation:
        'Authentication failed: the sending server is not authorised to send for that domain, and bounces go to the attacker-controlled domain.',
      indicator: 'Failed SPF / DMARC',
    },
  ],
  decisions: [
    {
      id: 'verdict',
      question: 'Based on the evidence, what is this message?',
      correctOptionId: 'phish',
      points: 20,
      options: [
        { id: 'legit', label: 'A legitimate IT security notice', feedback: 'Unsafe. The sender domain, reply-to, link destination and failed authentication all contradict a genuine internal message.' },
        { id: 'phish', label: 'A credential-phishing attempt impersonating IT', feedback: 'Correct. Multiple independent indicators point to impersonation designed to steal credentials.' },
        { id: 'spam', label: 'Harmless marketing spam', feedback: 'Not quite. It targets a named employee and asks for credentials — that is phishing, not marketing.' },
      ],
    },
    {
      id: 'action',
      question: 'What should the employee do next?',
      correctOptionId: 'verify-report',
      points: 30,
      options: [
        { id: 'click', label: 'Open the supplied link and follow the instructions', feedback: 'Unsafe. The link leads to an attacker-controlled domain built to capture credentials.' },
        { id: 'reply', label: 'Reply to the message asking for clarification', feedback: 'Unsafe. Replies go to verify@acct-review.invalid — you would be talking to the attacker and confirming your address is active.' },
        { id: 'verify-report', label: 'Verify via an independently obtained official contact and report through the approved channel', feedback: 'Correct. Use a contact you already trust (intranet, badge, phone directory) and report so the security team can protect everyone.' },
        { id: 'ignore', label: 'Ignore and delete it without reporting', feedback: 'Better than clicking, but incomplete. Others likely got the same email — reporting lets the team block it and warn them.' },
      ],
    },
  ],
  lesson:
    'Display names can be misleading. Verify unexpected requests using a trusted contact method rather than relying on links or contact details supplied in the suspicious message.',
  evidencePoints: 50,
}

export const openDoor = {
  id: '002',
  slug: '002-open-door',
  title: 'Open Door',
  category: 'Access control',
  difficulty: 'Beginner',
  estimatedMinutes: '6–10',
  incident: 'INC-2026-0522',
  company: 'Northstar Logistics (fictional)',
  description: 'A temporary contractor can see far more than their project ever needed. Review the account before someone else uses it.',
  briefing: 'Quarterly access review flagged contractor account r.vale. Their website project ended two weeks ago. Review the record, decide what is wrong, and recommend the right fix.',
  objectives: ['Apply the principle of least privilege', 'Spot stale accounts that outlive their purpose', 'Recognise risky sign-in context', 'Choose a proportionate, documented response'],
  artifact: 'records',
  recordsTitle: 'IDENTITY CONSOLE · r.vale@northstar.invalid',
  records: [
    { heading: 'Account', rows: [
      { label: 'Type', value: 'External contractor — Website redesign' },
      { label: 'Contract end', value: '30 Sep 2026 (14 days ago) — account still ENABLED', evidence: 'stale' },
      { label: 'Manager', value: 'p.okafor (Marketing)' },
      { label: 'MFA', value: 'Not enrolled', evidence: 'mfa' },
    ] },
    { heading: 'Group memberships', rows: [
      { label: 'Web-Design', value: 'Read/Write — matches project' },
      { label: 'Finance-Share', value: 'Read/Write — payroll exports, invoices', evidence: 'finance' },
      { label: 'Prod-DB-Admin', value: 'Administrator on production customer database', evidence: 'admin' },
    ] },
    { heading: 'Recent activity', rows: [
      { label: '12 Oct 03:41', value: 'Sign-in from new device, 198.51.100.77 (unfamiliar network)', evidence: 'signin' },
      { label: '12 Oct 03:44', value: 'Downloaded 2,318 files from Finance-Share', evidence: 'download' },
    ] },
  ],
  evidence: [
    { id: 'stale', title: 'Stale account', type: 'Lifecycle', content: 'Contract ended 14 days ago; account still enabled', explanation: 'Accounts must be disabled when the work ends. A forgotten account is an unlocked door nobody is watching.', indicator: 'Account outlived its purpose' },
    { id: 'finance', title: 'Finance access', type: 'Privilege', content: 'Finance-Share read/write for a web designer', explanation: 'A website contractor has no reason to see payroll or invoices. This breaks least privilege.', indicator: 'Excess data access' },
    { id: 'admin', title: 'Production admin', type: 'Privilege', content: 'Prod-DB-Admin membership', explanation: 'Administrator rights on customer data are the highest-impact permission here, and the least justified.', indicator: 'Unjustified admin rights' },
    { id: 'mfa', title: 'No MFA', type: 'Authentication', content: 'MFA not enrolled', explanation: 'Without MFA, a single leaked password is enough to take over the account.', indicator: 'Missing MFA' },
    { id: 'signin', title: 'Odd sign-in', type: 'Activity', content: 'New device, 03:41, unfamiliar network, after the contract ended', explanation: 'Activity after offboarding, at night, from a new device is a strong compromise signal.', indicator: 'Post-contract sign-in' },
    { id: 'download', title: 'Bulk download', type: 'Activity', content: '2,318 files pulled from Finance-Share in 3 minutes', explanation: 'Mass download right after a suspicious sign-in suggests data is being taken.', indicator: 'Possible exfiltration' },
  ],
  decisions: [
    { id: 'verdict', question: 'What is the core problem?', correctOptionId: 'lp', points: 20, options: [
      { id: 'fine', label: 'Nothing — contractors need broad access to be productive', feedback: 'Unsafe. Broad access is exactly what turned a finished contract into an open door.' },
      { id: 'mfa-only', label: 'Only the missing MFA', feedback: 'Partly. MFA matters, but the account should not exist and should never have had finance or admin rights.' },
      { id: 'lp', label: 'An over-privileged, stale account that now shows signs of misuse', feedback: 'Correct. Least privilege and lifecycle both failed, and the activity log suggests someone is using it.' },
    ] },
    { id: 'action', question: 'What should happen next?', correctOptionId: 'contain', points: 30, options: [
      { id: 'ask', label: 'Email the contractor to ask whether the sign-in was them', feedback: 'Too slow, and you may be emailing the attacker. Contain first, then ask through known channels.' },
      { id: 'contain', label: 'Disable the account, revoke sessions, remove excess groups, and escalate the download to the security team with the log', feedback: 'Correct. Contain, preserve evidence, escalate, and fix the root cause in the access review.' },
      { id: 'delete', label: 'Delete the account and its logs right away', feedback: 'Deleting logs destroys the evidence the security team needs to know what was taken.' },
      { id: 'wait', label: 'Note it for the next quarterly review', feedback: 'Unsafe. Data is leaving now; waiting three months is not a response.' },
    ] },
  ],
  lesson: 'Give people only the access their work needs, and remove it the day the work ends. When an unused account wakes up, contain first and preserve the evidence.',
  evidencePoints: 50,
}

export const redRelay = {
  id: '003',
  slug: '003-red-relay',
  title: 'Red Relay',
  category: 'Identity & MFA',
  difficulty: 'Intermediate',
  estimatedMinutes: '8–12',
  incident: 'INC-2026-0611',
  company: 'Northstar Logistics (fictional)',
  description: 'At 2 a.m. an employee’s phone would not stop buzzing with sign-in prompts. Then “IT” sent a chat message with a simple fix.',
  briefing: 'Finance analyst j.ortiz woke to a stream of MFA push prompts, followed by a chat from "IT Helpdesk" asking them to approve one. They did. Work out what happened and what must happen now.',
  objectives: ['Recognise MFA fatigue (push bombing)', 'Spot helpdesk impersonation in chat', 'Read sign-in logs for impossible context', 'Find persistence an attacker leaves behind', 'Choose the right containment steps'],
  artifact: 'records',
  recordsTitle: 'SIGN-IN & MAILBOX AUDIT · j.ortiz@northstar.invalid',
  records: [
    { heading: 'Authenticator app', rows: [
      { label: '02:10 → 02:16', value: '14 push requests denied or ignored', evidence: 'bombing' },
      { label: '02:17', value: 'Push request APPROVED', evidence: 'approved' },
    ] },
    { heading: 'Chat', rows: [
      { label: '02:15 · "IT Helpdesk"', value: '"We are fixing a sync fault on your account. Approve the next prompt and the alerts will stop." Sender tenant: nstar-helpdesk.invalid (external)', evidence: 'chat' },
    ] },
    { heading: 'Sign-in log', rows: [
      { label: '02:17', value: 'Success · new Linux device · 203.0.113.50 · 6,400 km from usual location', evidence: 'location' },
      { label: '18:02 (prev. day)', value: 'Success · usual laptop · office network' },
    ] },
    { heading: 'Mailbox rules', rows: [
      { label: '02:21 · created', value: 'Rule "." forwards all mail containing "invoice" to archive@mail-drop.invalid, then deletes it', evidence: 'rule' },
    ] },
  ],
  evidence: [
    { id: 'bombing', title: 'Push bombing', type: 'Authentication', content: '14 prompts in 6 minutes at 2 a.m.', explanation: 'A flood of prompts means someone already has the password and is trying to wear the user down until they approve.', indicator: 'MFA fatigue attack' },
    { id: 'chat', title: 'Fake helpdesk', type: 'Social engineering', content: 'External tenant posing as IT, asks to approve a prompt', explanation: 'Real IT never asks you to approve a prompt you did not start. The sender is from an outside tenant.', indicator: 'Helpdesk impersonation' },
    { id: 'approved', title: 'Approved prompt', type: 'Authentication', content: 'Approval at 02:17', explanation: 'The single approval handed the attacker a valid session. MFA was bypassed by persuasion, not by breaking it.', indicator: 'Fatigue approval' },
    { id: 'location', title: 'Impossible context', type: 'Sign-in', content: 'New Linux device, 6,400 km away', explanation: 'The user was asleep at home; this sign-in came from an unfamiliar device across the world.', indicator: 'Anomalous sign-in' },
    { id: 'rule', title: 'Forwarding rule', type: 'Persistence', content: 'Invoice mail forwarded externally then deleted', explanation: 'Hidden inbox rules let attackers keep reading mail, and set up invoice fraud, even after a password reset.', indicator: 'Mailbox persistence' },
  ],
  decisions: [
    { id: 'verdict', question: 'What happened to this account?', correctOptionId: 'compromise', points: 20, options: [
      { id: 'glitch', label: 'An authenticator glitch that IT fixed', feedback: 'No. The helpdesk message came from an external tenant and the session that followed came from a new device abroad.' },
      { id: 'compromise', label: 'Account takeover via MFA fatigue and a fake helpdesk', feedback: 'Correct. Password already stolen, prompts used as pressure, approval obtained through impersonation.' },
      { id: 'travel', label: 'The user was travelling and forgot', feedback: 'The user was asleep at home and reported the prompts. The evidence contradicts this.' },
    ] },
    { id: 'action', question: 'What must the security team do now?', correctOptionId: 'contain', points: 30, options: [
      { id: 'reset', label: 'Reset the password and close the ticket', feedback: 'Incomplete. Active sessions and the forwarding rule survive a password reset.' },
      { id: 'contain', label: 'Revoke all sessions, reset the password, remove the inbox rule, re-register MFA with number matching, and check for invoice fraud', feedback: 'Correct. Kill the session, remove persistence, harden MFA, and look for damage already done.' },
      { id: 'reply', label: 'Reply to the helpdesk chat to find out who they are', feedback: 'Engaging the attacker tips them off. Report and block the external tenant instead.' },
      { id: 'disable-mfa', label: 'Turn off MFA for this user so the prompts stop', feedback: 'Unsafe. That removes the one control that slowed the attacker down.' },
    ] },
  ],
  lesson: 'Never approve a sign-in prompt you did not start. A flood of prompts means your password is already stolen. Report it immediately; a fast report turns an incident into a near miss.',
  evidencePoints: 50,
}

export const playableMissions = [impostor, openDoor, redRelay, tailgate, ghostInvoice, quietDrive]

export const missions = [...playableMissions, ...upcoming]

// Aggregate numbers shown on the home page, computed from the content itself.
const minutes = (m) => m.estimatedMinutes.split('–').map(Number)
export const stats = {
  missions: playableMissions.length,
  evidence: playableMissions.reduce((n, m) => n + m.evidence.length, 0),
  decisions: playableMissions.reduce((n, m) => n + m.decisions.length, 0),
  skills: new Set(playableMissions.map((m) => m.category)).size,
  minutesMin: playableMissions.reduce((n, m) => n + minutes(m)[0], 0),
  minutesMax: playableMissions.reduce((n, m) => n + (minutes(m)[1] || minutes(m)[0]), 0),
  maxScore: playableMissions.length * 100,
}
