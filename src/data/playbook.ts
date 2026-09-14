export const PLAYBOOK_PATH = '/playbook'

export type PlaybookGateId =
  | 'qualify'
  | 'intake'
  | 'discover'
  | 'propose'
  | 'agree'
  | 'build'
  | 'launch'

export type PlaybookTodoStatus = 'pending' | 'in_progress' | 'completed'

export type PlaybookTodo = {
  id: string
  content: string
  status: PlaybookTodoStatus
}

export type PlaybookGate = {
  id: PlaybookGateId
  label: string
  publicStep: string
  youDo: string
  theyDo: string
  exitWhen: string
}

export const playbookGates: PlaybookGate[] = [
  {
    id: 'qualify',
    label: '0. Qualify',
    publicStep: 'Before Discover',
    youDo: '15-min screen. Decide if this is a real project, a favour, or a no.',
    theyDo: 'Say who it is for, the pain, and when they need it.',
    exitWhen: 'You know buyer vs user, and whether to book discovery.',
  },
  {
    id: 'intake',
    label: '1. Intake',
    publicStep: 'Discover & Plan',
    youDo: 'Send the 8-question brief. Do not design yet.',
    theyDo: 'Write answers. Involve dad if he is the user.',
    exitWhen: 'Written problem, users, current workaround, and success look like.',
  },
  {
    id: 'discover',
    label: '2. Discover',
    publicStep: 'Discover & Plan',
    youDo: '45–60 min call. Watch the current process if you can.',
    theyDo: 'Show how dad actually works today. Name the decision-maker.',
    exitWhen: 'You can restate the problem in one sentence they agree with.',
  },
  {
    id: 'propose',
    label: '3. Propose',
    publicStep: 'Discover & Plan',
    youDo: 'Offer 2–3 options: light / recommended / later. Price and timeline.',
    theyDo: 'Choose a package. Push back on scope, not on process.',
    exitWhen: 'One option is selected. Out-of-scope is written down.',
  },
  {
    id: 'agree',
    label: '4. Agree',
    publicStep: 'Discover & Plan',
    youDo: 'One-page agreement + deposit before any build.',
    theyDo: 'Sign (or WhatsApp confirm) and pay deposit.',
    exitWhen: 'Money and scope are locked. Colleague is a client, not a favour.',
  },
  {
    id: 'build',
    label: '5. Build & Test',
    publicStep: 'Build & Test',
    youDo: 'Weekly demo. Change requests go on a list, not into the sprint.',
    theyDo: 'Use the demo. Give feedback in one channel.',
    exitWhen: 'Agreed features work for dad on his phone/device.',
  },
  {
    id: 'launch',
    label: '6. Launch & Support',
    publicStep: 'Launch & Support',
    youDo: 'Train dad, leave a simple guide, time-box support.',
    theyDo: 'Run it without you for a week. Pay remaining balance.',
    exitWhen: 'Handover done. Optional paid maintenance is offered.',
  },
]

export const playbookThisWeek: PlaybookTodo[] = [
  {
    id: 'message',
    content: 'Send the framing reply: discovery first, not a build yet',
    status: 'pending',
  },
  {
    id: 'qualify-call',
    content: 'Book a 15-min qualify chat (colleague only is fine)',
    status: 'pending',
  },
  {
    id: 'workplace',
    content: 'Keep it off work systems unless this is official AGAHF work',
    status: 'pending',
  },
  {
    id: 'intake',
    content: 'Send the 8-question intake after she confirms it is real',
    status: 'pending',
  },
  {
    id: 'dad',
    content: 'Insist dad joins discovery if he is the person who will use it',
    status: 'pending',
  },
  {
    id: 'options',
    content: 'Write 2–3 options + price before opening a code editor',
    status: 'pending',
  },
]

export const playbookQuestions = [
  {
    theme: 'Problem',
    ask: 'What is broken or slow today?',
    why: 'If they start with features, pull back to the pain.',
  },
  {
    theme: 'Who',
    ask: 'Who uses it, who pays, who decides?',
    why: 'Colleague may pay; dad may be the real user.',
  },
  {
    theme: 'Today',
    ask: 'How is it done now? Paper, Excel, WhatsApp, memory?',
    why: 'Ask them to show, not describe.',
  },
  {
    theme: 'Frequency',
    ask: 'How often? Daily, weekly, only when something goes wrong?',
    why: 'Volume drives whether a system is worth it.',
  },
  {
    theme: 'Success',
    ask: 'In 90 days, what would make you say this was worth it?',
    why: 'One sentence. Write it down and read it back.',
  },
  {
    theme: 'Constraints',
    ask: 'Budget range, deadline, devices, language, offline, literacy?',
    why: "Dad's phone and comfort matter more than your stack.",
  },
  {
    theme: 'Data',
    ask: 'What is private? Patient, money, family, IDs?',
    why: 'If it touches AGAHF/patient data, stop and treat it as work/legal.',
  },
  {
    theme: 'Risk',
    ask: 'What happens if this is late, wrong, or abandoned?',
    why: 'Tells you whether to recommend a spreadsheet first.',
  },
] as const

export const playbookAgenda = [
  { mins: '5', block: 'Restate why you are here. Confirm buyer vs user.' },
  { mins: '10', block: 'Current process. Screen-share or photograph the notebook/Excel/WhatsApp thread.' },
  { mins: '10', block: 'Walk the last real example end to end. Where did it break?' },
  { mins: '8', block: 'Success, devices, language, literacy, privacy.' },
  { mins: '7', block: 'Constraints: money range, date, who will maintain it after you.' },
  { mins: '5', block: 'Read back one problem sentence. Book a date to send options.' },
] as const

export const playbookOptions = [
  {
    title: 'Light',
    badge: null,
    body: 'Spreadsheet, WhatsApp flow, or a tiny form. Fast, cheap, tests whether dad will actually use anything. Often the right first product.',
  },
  {
    title: 'Recommended',
    badge: 'Default',
    body: 'Smallest system that removes the pain for 90 days. One user, one job, phone-first. This is what you should want to sell.',
  },
  {
    title: 'Later',
    badge: null,
    body: 'Extra modules she will mention (reports, staff logins, inventory, payments). Park them. Price them only if she insists they are now.',
  },
] as const

export const playbookAgreement = [
  { clause: 'Parties', detail: 'You, her, and whether dad is a user only.' },
  { clause: 'Outcome', detail: 'The success sentence from discovery.' },
  { clause: 'Scope', detail: 'Bullet list of screens/jobs. Explicit out-of-scope.' },
  { clause: 'Money', detail: 'Total, deposit (40–50%), balance on handover.' },
  { clause: 'Time', detail: 'Start date, demo cadence, target launch.' },
  { clause: 'Changes', detail: 'New ideas go to a list and are priced separately.' },
  { clause: 'Support', detail: 'e.g. 14 days of fixes, then optional paid care.' },
  { clause: 'Workplace', detail: 'Personal project; no AGAHF accounts, data, or hours.' },
] as const

export const playbookHabits = [
  {
    habit: 'Channel',
    doThis: 'One thread: WhatsApp or email. Put decisions in writing.',
    stopDoing: 'Verbal promises in the corridor, then code at night.',
  },
  {
    habit: 'File',
    doThis: 'One folder per client: intake, notes, options, agreement, invoices.',
    stopDoing: 'Scattering briefs across chat and memory.',
  },
  {
    habit: 'Time',
    doThis: 'Discovery is a product. 15 + 45 min, then a written options note.',
    stopDoing: "Unscoped 'let me just try something' evenings.",
  },
  {
    habit: 'Demos',
    doThis: 'Weekly working software dad can tap. Ask him, not only her.',
    stopDoing: 'Big-bang reveal after weeks of silence.',
  },
  {
    habit: 'Changes',
    doThis: 'Smile, write it down, price it. Ship the agreed slice first.',
    stopDoing: 'Sneaking extras in because you work together.',
  },
  {
    habit: 'Close',
    doThis: 'Train, one-page guide, remaining invoice, optional maintenance.',
    stopDoing: 'Infinite unpaid WhatsApp support.',
  },
] as const

export const playbookFirstReply = `Thanks for thinking of me.

Before I build anything, I run a short discovery so we solve the right problem — especially if your dad will be the one using it.

Can we do 15 minutes this week? I only need:
1. Who it is for (you, your dad, or both)
2. What is painful today
3. When you need it by

If it looks like a real project, I will send a few written questions, then we can include your dad on a longer call. After that I will come back with options, a timeline, and a price — no commitment until you choose one.`

export const playbookIntakeMessage = [
  'Quick intake — reply under each line:',
  '',
  ...playbookQuestions.map(
    (item, index) => `${index + 1}. ${item.theme} — ${item.ask}`,
  ),
].join('\n')

export const playbookAfterCallMessage = `Thanks for the call.

Here is what I heard:
1. Problem: [one sentence]
2. In scope: [list]
3. Out of scope: [list]

I will send options (light / recommended / later) with timeline and price by [date]. No build starts until you pick one and we agree in writing.`

export function cyclePlaybookTodoStatus(status: PlaybookTodoStatus): PlaybookTodoStatus {
  switch (status) {
    case 'pending':
      return 'in_progress'
    case 'in_progress':
      return 'completed'
    case 'completed':
      return 'pending'
    default: {
      const _exhaustive: never = status
      return _exhaustive
    }
  }
}

export function isPlaybookGateId(value: string): value is PlaybookGateId {
  return playbookGates.some((gate) => gate.id === value)
}
