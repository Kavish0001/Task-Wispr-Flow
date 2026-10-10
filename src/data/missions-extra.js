// Missions 004–006. Same data contract as src/data/missions.js; all names, domains and IPs are fictional.

export const tailgate = {
  id: '004',
  slug: '004-tailgate',
  title: 'Tailgate',
  category: 'Physical security',
  difficulty: 'Beginner',
  estimatedMinutes: '6–8',
  incident: 'INC-2026-0703',
  company: 'Northstar Logistics (fictional)',
  description: 'Someone in a hi-vis vest is carrying boxes toward the badge door and asks you to hold it. Would you?',
  briefing: 'At 08:52 a person in a hi-vis vest followed staff through the secure side door at the Harbour Road office. Facilities, reception and the badge system all left a trace. Decide what really happened and what staff should have done.',
  objectives: ['Recognise tailgating and pretexting in person', 'Check visitors against bookings and approved vendors', 'Read badge logs for one-badge, two-people entries', 'Choose a polite, safe response that does not rely on confrontation'],
  artifact: 'records',
  recordsTitle: 'SITE SECURITY · Harbour Road office · Side door B',
  records: [
    { heading: 'Badge reader — door B', rows: [
      { label: '08:52:10', value: 'Badge #4471 (a.mensah) — access granted — door-open sensor: 2 people detected', evidence: 'twoin' },
      { label: '08:52:41', value: 'Door held open 31 s (alarm threshold 15 s)', evidence: 'held' },
    ] },
    { heading: 'Reception & bookings', rows: [
      { label: 'Visitor log', value: 'No visitor signed in between 08:30 and 09:30', evidence: 'nobooking' },
      { label: 'Claimed company', value: '"FastFix Facilities — here for the server-room aircon"', evidence: 'vendor' },
      { label: 'Approved vendors', value: 'CoolAir Services (HVAC), BrightClean (cleaning). FastFix is not listed.' },
    ] },
    { heading: 'Staff statements', rows: [
      { label: 'a.mensah', value: '"He had his hands full and said he was late, so I held the door. Seemed rude not to."', evidence: 'pretext' },
      { label: 'Floor 2 kitchen', value: 'Visitor asked where the server room was and photographed the whiteboard with the Wi-Fi password', evidence: 'recon' },
    ] },
  ],
  evidence: [
    { id: 'twoin', title: 'One badge, two people', type: 'Access log', content: 'Single badge swipe, sensor counted two entries', explanation: 'Tailgating is exactly this: one authorised badge carrying an unauthorised person through.', indicator: 'Tailgating entry' },
    { id: 'held', title: 'Door held open', type: 'Access log', content: '31 seconds against a 15-second threshold', explanation: 'A door held past its alarm limit means someone deliberately kept it open for another person.', indicator: 'Propped door' },
    { id: 'nobooking', title: 'No visitor booking', type: 'Process', content: 'No sign-in at reception', explanation: 'Genuine contractors are booked and sign in. Skipping reception means nobody verified who they were.', indicator: 'Bypassed reception' },
    { id: 'vendor', title: 'Unknown vendor', type: 'Pretext', content: 'FastFix Facilities is not an approved vendor', explanation: 'The claimed company is not on the vendor list, and the real HVAC supplier is CoolAir.', indicator: 'Unverified vendor' },
    { id: 'pretext', title: 'Social pressure', type: 'Pretext', content: 'Hands full, running late, politeness exploited', explanation: 'Carrying boxes and being in a hurry are classic props: they make holding the door feel like basic courtesy.', indicator: 'Courtesy exploited' },
    { id: 'recon', title: 'Reconnaissance', type: 'Behaviour', content: 'Asked for the server room, photographed Wi-Fi password', explanation: 'A real technician knows where they are going. Photographing credentials is information gathering.', indicator: 'On-site reconnaissance' },
  ],
  decisions: [
    { id: 'verdict', question: 'What was this?', correctOptionId: 'tailgate', points: 20, options: [
      { id: 'contractor', label: 'A contractor who forgot to sign in', feedback: 'The vendor is not approved and they gathered credentials. That is not a forgetful contractor.' },
      { id: 'tailgate', label: 'A tailgating intrusion using a contractor pretext', feedback: 'Correct. A false identity, social pressure and reconnaissance once inside.' },
      { id: 'harmless', label: 'Harmless. They only looked around.', feedback: 'They photographed the Wi-Fi password and located the server room. That is preparation, not sightseeing.' },
    ] },
    { id: 'action', question: 'What should a staff member do when asked to hold the door?', correctOptionId: 'redirect', points: 30, options: [
      { id: 'hold', label: 'Hold it: refusing would be rude', feedback: 'Unsafe. Politeness is exactly the vulnerability this attack relies on.' },
      { id: 'redirect', label: 'Politely decline, direct them to reception to sign in, and tell security if they push back', feedback: 'Correct. It is friendly, needs no confrontation, and puts verification where it belongs.' },
      { id: 'confront', label: 'Block the door and demand ID yourself', feedback: 'Risky. Never put yourself in physical danger. Redirect and report instead.' },
      { id: 'ignore', label: 'Let them in but keep an eye on them', feedback: 'Once they are in, you cannot watch them everywhere. Verification has to happen at the door.' },
    ] },
  ],
  lesson: 'Badges protect a door only if each person uses their own. It is always polite to say: "Reception will sign you in, it is just round the corner."',
  evidencePoints: 50,
}

export const ghostInvoice = {
  id: '005',
  slug: '005-ghost-invoice',
  title: 'Ghost Invoice',
  category: 'Business email compromise',
  difficulty: 'Intermediate',
  estimatedMinutes: '8–10',
  incident: 'INC-2026-0788',
  company: 'Northstar Logistics (fictional)',
  description: 'The CEO needs a confidential payment sent to a supplier’s new bank account. Today. Before anyone asks questions.',
  briefing: 'Accounts payable received an urgent request, apparently from the CEO, to wire €48,600 to a supplier’s "updated" bank account. The payment is queued for 15:00. Review the email before the money leaves.',
  objectives: ['Spot look-alike executive domains', 'Recognise secrecy and authority pressure', 'Identify disguised attachments without opening them', 'Apply out-of-band verification for payment changes'],
  artifact: 'email',
  email: {
    fromName: 'Daniel Reyes (CEO)',
    fromAddress: 'daniel.reyes@northstar-logistics.invalid',
    replyTo: 'd.reyes.office@freemail.invalid',
    to: 'accounts.payable@northstar.invalid',
    subject: 'Confidential: supplier payment needed today',
    date: 'Fri, 17 Oct 2026 13:06:44 +0000',
    linkLabel: 'Updated_Bank_Details.pdf',
    linkTarget: 'Updated_Bank_Details.pdf.html (412 KB, HTML document)',
    body: [
      { text: 'Hi team,' },
      { text: 'I need a payment of €48,600 sent to Meridian Freight before 15:00 today. They have moved banks and the old account is closed. The new details are attached.', evidence: 'urgency' },
      { link: true },
      { text: 'This is linked to an acquisition we have not announced. Please keep it strictly between us and do not discuss it with anyone else in finance.', evidence: 'process' },
      { text: 'I am in back-to-back meetings and cannot take calls. Just confirm by email when it is done.\n\nDaniel' },
    ],
    headers: [
      'Return-Path: <bounce@northstar-logistics.invalid>',
      'Authentication-Results: mx.northstar.invalid; spf=pass smtp.mailfrom=northstar-logistics.invalid; dmarc=pass',
      'X-Domain-Age: northstar-logistics.invalid registered 3 days ago',
      'X-Originating-IP: 192.0.2.140',
    ],
  },
  evidence: [
    { id: 'sender', title: 'Look-alike domain', type: 'Identity', field: 'fromAddress', content: 'northstar-logistics.invalid, not northstar.invalid', explanation: 'One extra word makes a convincing copy of the real domain. Read the domain right to left, character by character.', indicator: 'Look-alike executive domain' },
    { id: 'replyto', title: 'Free-mail reply-to', type: 'Routing', field: 'replyTo', content: 'Replies go to d.reyes.office@freemail.invalid', explanation: 'A CEO does not route payment confirmations to a personal free-mail account.', indicator: 'External reply-to' },
    { id: 'urgency', title: 'Deadline + bank change', type: 'Pressure', field: 'body', content: '€48,600, new account, before 15:00 today', explanation: 'Changed bank details plus a same-day deadline is the core pattern of invoice fraud.', indicator: 'Urgent bank change' },
    { id: 'link', title: 'Disguised attachment', type: 'File', field: 'link', content: 'Shown: Updated_Bank_Details.pdf → Actual: .pdf.html', explanation: 'A double extension hides an HTML page, often a fake sign-in form. It is not a PDF.', indicator: 'Double-extension attachment' },
    { id: 'process', title: 'Secrecy & no calls', type: 'Context', field: 'body', content: '"Keep it between us", "cannot take calls"', explanation: 'Secrecy isolates you from colleagues who would spot it, and "no calls" blocks the one check that would expose it.', indicator: 'Secrecy blocks verification' },
    { id: 'headers', title: 'New domain, real auth', type: 'Technical', field: 'headers', content: 'spf=pass, dmarc=pass, but the domain is 3 days old', explanation: 'SPF and DMARC passing only proves the mail came from the attacker’s own domain. A brand-new domain is the tell.', indicator: 'Freshly registered domain' },
  ],
  decisions: [
    { id: 'verdict', question: 'What is this request?', correctOptionId: 'bec', points: 20, options: [
      { id: 'legit', label: 'A genuine but unusual CEO request', feedback: 'The domain is a 3-day-old copy and replies go to free-mail. This is not the CEO.' },
      { id: 'bec', label: 'Business email compromise: CEO impersonation for invoice fraud', feedback: 'Correct. Impersonation, urgency, secrecy and a bank-detail change.' },
      { id: 'spam', label: 'Generic spam', feedback: 'It names a real supplier, a real amount and your team. This is targeted fraud.' },
    ] },
    { id: 'action', question: 'What should accounts payable do?', correctOptionId: 'verify', points: 30, options: [
      { id: 'pay', label: 'Pay it, since it came from the CEO', feedback: 'Unsafe. Wire transfers are rarely recoverable once sent.' },
      { id: 'reply', label: 'Reply asking the CEO to confirm', feedback: 'The reply goes to the attacker’s free-mail inbox, and they will happily confirm.' },
      { id: 'verify', label: 'Hold the payment, call the CEO and Meridian Freight on numbers already on file, and report to security', feedback: 'Correct. Out-of-band verification on known numbers defeats this every time.' },
      { id: 'open', label: 'Open the attachment to check the bank details', feedback: 'The "PDF" is an HTML page. Opening it is how credentials get stolen.' },
    ] },
  ],
  lesson: 'Any change to payment details is verified by phone on a number you already have, never with contact details from the request itself. Secrecy is a red flag, not a reason to comply.',
  evidencePoints: 50,
}

export const quietDrive = {
  id: '006',
  slug: '006-quiet-drive',
  title: 'Quiet Drive',
  category: 'Malware & removable media',
  difficulty: 'Intermediate',
  estimatedMinutes: '8–12',
  incident: 'INC-2026-0851',
  company: 'Northstar Logistics (fictional)',
  description: 'A USB stick labelled "Salary Review 2026, Confidential" was found in the car park. Someone was curious.',
  briefing: 'Endpoint monitoring raised an alert on a finance workstation minutes after a USB drive was connected. The drive was found in the staff car park that morning. Reconstruct what ran and decide how to respond.',
  objectives: ['Recognise baiting with removable media', 'Spot file-type masquerading', 'Read endpoint alerts for execution and beaconing', 'Contain without destroying evidence'],
  artifact: 'records',
  recordsTitle: 'ENDPOINT ALERT · FIN-WS-022 · user: l.novak',
  records: [
    { heading: 'Device', rows: [
      { label: '09:14:02', value: 'USB mass storage connected. Volume label "SALARY REVIEW 2026 – CONFIDENTIAL"', evidence: 'bait' },
      { label: 'Policy', value: 'Removable media: ALLOWED for finance group (exception granted 2024)', evidence: 'policy' },
    ] },
    { heading: 'Files opened', rows: [
      { label: '09:14:19', value: 'Salary_Review_2026.xlsx.lnk opened (shortcut with spreadsheet icon)', evidence: 'lnk' },
    ] },
    { heading: 'Process tree', rows: [
      { label: '09:14:20', value: 'explorer.exe → powershell.exe -w hidden -enc SQBFAFgAIAAoAE4AZQB3AC0ATwBi…', evidence: 'ps' },
    ] },
    { heading: 'Network', rows: [
      { label: '09:14:23', value: 'Outbound HTTPS to 203.0.113.9:443, repeating every 60 s since', evidence: 'beacon' },
      { label: '09:15:40', value: 'Same host queried the file server for "\\\\fs01\\finance\\payroll"', evidence: 'lateral' },
    ] },
  ],
  evidence: [
    { id: 'bait', title: 'Bait label', type: 'Social engineering', content: '"Salary Review 2026 – Confidential"', explanation: 'Baiting relies on curiosity. A label promising other people’s salaries is designed to be plugged in.', indicator: 'Curiosity bait' },
    { id: 'policy', title: 'USB allowed', type: 'Control gap', content: 'Exception lets finance use removable media', explanation: 'An old exception left the control off for exactly the team an attacker would target.', indicator: 'Stale policy exception' },
    { id: 'lnk', title: 'Masqueraded file', type: 'File', content: '.xlsx.lnk with a spreadsheet icon', explanation: 'It is a shortcut that runs a command, dressed up as a spreadsheet. Hidden extensions make this easy to miss.', indicator: 'File-type masquerade' },
    { id: 'ps', title: 'Hidden PowerShell', type: 'Execution', content: 'powershell -w hidden -enc …', explanation: 'A hidden window and an encoded command are classic signs of a malicious script trying not to be read.', indicator: 'Encoded hidden script' },
    { id: 'beacon', title: 'Beaconing', type: 'Network', content: 'HTTPS to 203.0.113.9 every 60 s', explanation: 'Regular check-ins to an unknown host mean the machine is now talking to an attacker’s command server.', indicator: 'Command-and-control beacon' },
    { id: 'lateral', title: 'Reaching for payroll', type: 'Network', content: 'Queried \\\\fs01\\finance\\payroll', explanation: 'The attacker is already looking beyond this machine toward sensitive data.', indicator: 'Lateral discovery' },
  ],
  decisions: [
    { id: 'verdict', question: 'What happened on FIN-WS-022?', correctOptionId: 'malware', points: 20, options: [
      { id: 'nothing', label: 'Nothing. It was just a spreadsheet.', feedback: 'It was a shortcut that launched hidden PowerShell and started beaconing.' },
      { id: 'malware', label: 'A baiting attack that installed a remote-access implant', feedback: 'Correct. Bait, masquerade, execution, command-and-control, then discovery.' },
      { id: 'av', label: 'Antivirus scanning the drive', feedback: 'Antivirus does not run encoded PowerShell in a hidden window or call an unknown server every minute.' },
    ] },
    { id: 'action', question: 'What is the right first response?', correctOptionId: 'isolate', points: 30, options: [
      { id: 'spare', label: 'Plug the USB into a spare laptop to see what else is on it', feedback: 'That infects a second machine. Suspicious media goes to the security team, sealed.' },
      { id: 'wipe', label: 'Wipe and reinstall the workstation immediately', feedback: 'That destroys the evidence needed to know what was taken and whether other machines are affected.' },
      { id: 'isolate', label: 'Network-isolate the workstation (leave it powered on), bag the USB, alert security, and block 203.0.113.9', feedback: 'Correct. Cut the attacker’s link, preserve memory and disk evidence, and contain the infrastructure.' },
      { id: 'unplug', label: 'Just remove the USB and carry on', feedback: 'The implant is already running. Removing the drive changes nothing.' },
    ] },
  ],
  lesson: 'Never plug in media you found. If something has already run, isolate the machine from the network but keep it powered on, so investigators can see what the attacker did.',
  evidencePoints: 50,
}

export const upcoming = [
  { id: '007', slug: null, title: 'Deep Voice', category: 'Vishing & deepfakes', difficulty: 'Advanced', estimatedMinutes: '10–15', description: 'A voicemail from the CFO sounds exactly right. The request does not. Spot a synthetic voice by its context.', locked: true },
]
