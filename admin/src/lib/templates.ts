import { OPTION_KINDS, type OptionKind } from "@/db/schema";

export type CopyTemplate = {
  id: string;
  title: string;
  hint: string;
  text: string;
};

export const FIRST_REPLY = `Thanks for thinking of me.

Before I build anything, I run a short discovery so we solve the right problem — especially if someone else will be the one using it.

Can we do 15 minutes this week? I only need:
1. Who it is for
2. What is painful today
3. When you need it by

If it looks like a real project, I will send a few written questions, then we can include the daily user on a longer call. After that I will come back with options, a timeline, and a price — no commitment until you choose one.`;

export const INTAKE_QUESTIONS = [
  {
    theme: "Problem",
    ask: "What is broken or slow today?",
    why: "If they start with features, pull back to the pain.",
  },
  {
    theme: "Who",
    ask: "Who uses it, who pays, who decides?",
    why: "The buyer may pay; the daily user may be someone else.",
  },
  {
    theme: "Today",
    ask: "How is it done now? Paper, Excel, WhatsApp, memory?",
    why: "Ask them to show, not describe.",
  },
  {
    theme: "Frequency",
    ask: "How often? Daily, weekly, only when something goes wrong?",
    why: "Volume drives whether a system is worth it.",
  },
  {
    theme: "Success",
    ask: "In 90 days, what would make you say this was worth it?",
    why: "One sentence. Write it down and read it back.",
  },
  {
    theme: "Constraints",
    ask: "Budget range, deadline, devices, language, offline, literacy?",
    why: "The daily user's phone and comfort matter more than your stack.",
  },
  {
    theme: "Data",
    ask: "What is private? Patient, money, family, IDs?",
    why: "If it touches AGAHF or patient data, stop and treat it as work/legal.",
  },
  {
    theme: "Risk",
    ask: "What happens if this is late, wrong, or abandoned?",
    why: "Tells you whether to recommend a spreadsheet first.",
  },
] as const;

export type IntakeTheme = (typeof INTAKE_QUESTIONS)[number]["theme"];

export function isIntakeTheme(value: string): value is IntakeTheme {
  return INTAKE_QUESTIONS.some((item) => item.theme === value);
}

export const INTAKE_MESSAGE = [
  "Quick intake — reply under each line:",
  "",
  ...INTAKE_QUESTIONS.map(
    (item, index) => `${index + 1}. ${item.theme} — ${item.ask}`,
  ),
].join("\n");

export function afterCallMessage(problemSentence?: string | null): string {
  const problem = problemSentence?.trim() || "[one sentence]";
  return `Thanks for the call.

Here is what I heard:
1. Problem: ${problem}
2. In scope: [list]
3. Out of scope: [list]

I will send options (light / recommended / later) with timeline and price by [date]. No build starts until you pick one and we agree in writing.`;
}

export function deskCopyTemplates(
  problemSentence?: string | null,
): CopyTemplate[] {
  return [
    {
      id: "reply",
      title: "First reply",
      hint: "Qualify. Discovery first, not a build.",
      text: FIRST_REPLY,
    },
    {
      id: "intake",
      title: "Eight questions",
      hint: "Intake. Send after they confirm it is real.",
      text: INTAKE_MESSAGE,
    },
    {
      id: "after-call",
      title: "After the call",
      hint: "Discover. Fill in scope, then send options.",
      text: afterCallMessage(problemSentence),
    },
  ];
}

const OPTION_STARTERS: Record<OptionKind, string> = {
  light:
    "Spreadsheet, WhatsApp flow, or a tiny form. Fast, cheap, tests whether they will actually use anything. Often the right first product.",
  recommended:
    "Smallest system that removes the pain for 90 days. One user, one job, phone-first. This is what you should want to sell.",
  later:
    "Extra modules they will mention (reports, staff logins, inventory, payments). Park them. Price them only if they insist they are now.",
};

export function optionStarter(kind: OptionKind): string {
  return OPTION_STARTERS[kind];
}

export function unusedOptionKinds(used: readonly OptionKind[]): OptionKind[] {
  return OPTION_KINDS.filter((kind) => !used.includes(kind));
}

export const DISCOVERY_AGENDA = [
  { mins: "5", block: "Restate why you are here. Confirm buyer vs user." },
  {
    mins: "10",
    block:
      "Current process. Screen-share or photograph the notebook/Excel/WhatsApp thread.",
  },
  {
    mins: "10",
    block: "Walk the last real example end to end. Where did it break?",
  },
  { mins: "8", block: "Success, devices, language, literacy, privacy." },
  {
    mins: "7",
    block: "Constraints: money range, date, who will maintain it after you.",
  },
  {
    mins: "5",
    block: "Read back one problem sentence. Book a date to send options.",
  },
] as const;

export const AGREEMENT_CLAUSES = [
  { clause: "Parties", detail: "You, the buyer, and whether the daily user is a user only." },
  { clause: "Outcome", detail: "The success sentence from discovery." },
  { clause: "Scope", detail: "Bullet list of screens/jobs. Explicit out-of-scope." },
  { clause: "Money", detail: "Total, deposit (40–50%), balance on handover." },
  { clause: "Time", detail: "Start date, demo cadence, target launch." },
  { clause: "Changes", detail: "New ideas go to a list and are priced separately." },
  { clause: "Support", detail: "e.g. 14 days of fixes, then optional paid care." },
  { clause: "Workplace", detail: "Personal project; no AGAHF accounts, data, or hours." },
] as const;

export const PRACTICE_HABITS = [
  {
    habit: "Channel",
    doThis: "One thread: WhatsApp or email. Put decisions in writing.",
    stopDoing: "Verbal promises in the corridor, then code at night.",
  },
  {
    habit: "File",
    doThis: "One folder per client: intake, notes, options, agreement, invoices.",
    stopDoing: "Scattering briefs across chat and memory.",
  },
  {
    habit: "Time",
    doThis: "Discovery is a product. 15 + 45 min, then a written options note.",
    stopDoing: "Unscoped “let me just try something” evenings.",
  },
  {
    habit: "Demos",
    doThis: "Weekly working software the daily user can tap. Ask them, not only the buyer.",
    stopDoing: "Big-bang reveal after weeks of silence.",
  },
  {
    habit: "Changes",
    doThis: "Smile, write it down, price it. Ship the agreed slice first.",
    stopDoing: "Sneaking extras in because you work together.",
  },
  {
    habit: "Close",
    doThis: "Train, one-page guide, remaining invoice, optional maintenance.",
    stopDoing: "Infinite unpaid WhatsApp support.",
  },
] as const;

export const THIS_WEEK_REMINDERS = [
  "Send the framing reply: discovery first, not a build yet.",
  "Book a 15-min qualify chat.",
  "Keep it off work systems unless this is official AGAHF work.",
  "Send the 8-question intake after they confirm it is real.",
  "Insist the daily user joins discovery if they are not the buyer.",
  "Write 2–3 options and a price before opening a code editor.",
] as const;
