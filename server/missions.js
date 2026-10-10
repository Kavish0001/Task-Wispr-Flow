// Server-side copy of src/data/missions.js (answer key included). Kept standalone so the
// server Docker image does not depend on the frontend source. Keep in sync manually.
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
      'Dear Employee,',
      'Our security systems detected unusual sign-in activity on your account. To protect company data, your access will be RESTRICTED within 2 hours unless you complete identity verification.',
      'Please verify your credentials immediately using the secure portal below:',
      '__LINK__',
      'Do not contact the help desk regarding this notice — they cannot process verification requests. Failure to comply will be reported to your manager.',
      'Regards,\nIT Security Team\nNorthstar Logistics',
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

export const missions = [
  impostor,
  { id: '002', slug: null, title: 'Open Door', category: 'Access control', difficulty: 'Beginner', estimatedMinutes: '8–12', description: 'A temporary contractor can see far more than their project requires. Map the permissions and right-size the access.', locked: true },
  { id: '003', slug: null, title: 'Red Relay', category: 'Identity & sign-in', difficulty: 'Intermediate', estimatedMinutes: '10–15', description: 'Unfamiliar sign-in alerts on a service account. Compare context, capture facts, hand off the incident.', locked: true },
]
