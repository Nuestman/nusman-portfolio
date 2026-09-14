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

const INTAKE_QUESTIONS = [
  { theme: "Problem", ask: "What is broken or slow today?" },
  { theme: "Who", ask: "Who uses it, who pays, who decides?" },
  { theme: "Today", ask: "How is it done now? Paper, Excel, WhatsApp, memory?" },
  {
    theme: "Frequency",
    ask: "How often? Daily, weekly, only when something goes wrong?",
  },
  {
    theme: "Success",
    ask: "In 90 days, what would make you say this was worth it?",
  },
  {
    theme: "Constraints",
    ask: "Budget range, deadline, devices, language, offline, literacy?",
  },
  { theme: "Data", ask: "What is private? Patient, money, family, IDs?" },
  { theme: "Risk", ask: "What happens if this is late, wrong, or abandoned?" },
] as const;

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
