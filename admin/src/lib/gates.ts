import {
  PROJECT_GATES,
  type PersonRole,
  type ProjectGate,
  type ProjectStatus,
  type QualifyOutcome,
  type WorkKind,
} from "@/db/schema";

export type GateGuide = {
  id: ProjectGate;
  label: string;
  publicStep: string;
  youDo: string;
  theyDo: string;
  exitWhen: string;
};

export const GATE_GUIDES: GateGuide[] = [
  {
    id: "qualify",
    label: "0. Qualify",
    publicStep: "Before Discover",
    youDo: "15-min screen. Decide if this is a real project, a favour, or a no.",
    theyDo: "Say who it is for, the pain, and when they need it.",
    exitWhen: "You know buyer vs user, and whether to book discovery.",
  },
  {
    id: "intake",
    label: "1. Intake",
    publicStep: "Discover & Plan",
    youDo: "Send the 8-question brief. Do not design yet.",
    theyDo: "Write answers. Involve the daily user if they are not the buyer.",
    exitWhen: "Written problem, users, current workaround, and success look like.",
  },
  {
    id: "discover",
    label: "2. Discover",
    publicStep: "Discover & Plan",
    youDo: "45–60 min call. Watch the current process if you can.",
    theyDo: "Show how the daily user actually works today. Name the decision-maker.",
    exitWhen: "You can restate the problem in one sentence they agree with.",
  },
  {
    id: "propose",
    label: "3. Propose",
    publicStep: "Discover & Plan",
    youDo: "Offer 2–3 options: light / recommended / later. Price and timeline.",
    theyDo: "Choose a package. Push back on scope, not on process.",
    exitWhen: "One option is selected. Out-of-scope is written down.",
  },
  {
    id: "agree",
    label: "4. Agree",
    publicStep: "Discover & Plan",
    youDo: "One-page agreement + deposit before any build.",
    theyDo: "Sign (or WhatsApp confirm) and pay deposit.",
    exitWhen: "Money and scope are locked. They are a client, not a favour.",
  },
  {
    id: "build",
    label: "5. Build & Test",
    publicStep: "Build & Test",
    youDo: "Weekly demo. Change requests go on a list, not into the sprint.",
    theyDo: "Use the demo. Give feedback in one channel.",
    exitWhen: "Agreed features work for the daily user on their device.",
  },
  {
    id: "launch",
    label: "6. Launch & Support",
    publicStep: "Launch & Support",
    youDo: "Train the daily user, leave a simple guide, time-box support.",
    theyDo: "Run it without you for a week. Pay remaining balance.",
    exitWhen: "Handover done. Optional paid maintenance is offered.",
  },
];

export function isProjectGate(value: string): value is ProjectGate {
  return (PROJECT_GATES as readonly string[]).includes(value);
}

const GATE_BY_ID = Object.fromEntries(
  GATE_GUIDES.map((guide) => [guide.id, guide]),
) as Record<ProjectGate, GateGuide>;

export function gateGuide(gate: ProjectGate): GateGuide {
  return GATE_BY_ID[gate];
}

export function gateIndex(gate: ProjectGate): number {
  return PROJECT_GATES.indexOf(gate);
}

export function dailyUserRecordedWhenNeeded(
  people: Array<{ role: PersonRole }>,
): boolean {
  const hasBuyer = people.some((person) => person.role === "buyer");
  const hasUser = people.some((person) => person.role === "user");
  if (hasBuyer && people.length > 1 && !hasUser) {
    return false;
  }
  return true;
}

export const GATE_MOVE_BLOCKS = [
  "skip",
  "agree",
  "user",
  "problem",
  "option",
  "status",
  "qualify",
  "intake",
  "deposit",
] as const;

export type GateMoveBlock = (typeof GATE_MOVE_BLOCKS)[number];

export function gatesLocked(status: ProjectStatus): boolean {
  return status === "won" || status === "lost" || status === "done";
}

export function gateMoveBlockMessage(code: GateMoveBlock): string {
  switch (code) {
    case "skip":
      return "Move one gate at a time. Do not skip.";
    case "agree":
      return "Build is not allowed until agree.";
    case "user":
      return "If the daily user is not the buyer, add a daily-user person before leaving Discover.";
    case "problem":
      return "Write the problem sentence before leaving Discover.";
    case "option":
      return "Choose a package before leaving Propose.";
    case "status":
      return "Won, lost, and done projects stay on their gate. Change status first.";
    case "qualify":
      return "Record the qualify outcome as a real project before you leave Qualify.";
    case "intake":
      return "Write the Problem and Success answers before you leave Intake.";
    case "deposit":
      return "Deposit and written confirm before you leave Agree.";
    default: {
      const _exhaustive: never = code;
      return _exhaustive;
    }
  }
}

export function isGateMoveBlock(value: string): value is GateMoveBlock {
  return (GATE_MOVE_BLOCKS as readonly string[]).includes(value);
}

export function gateMoveBlock(args: {
  from: ProjectGate;
  to: ProjectGate;
  people: Array<{ role: PersonRole }>;
  problemSentence?: string | null;
  status?: ProjectStatus;
  workKind?: WorkKind;
  hasSelectedOption?: boolean;
  qualifyOutcome?: QualifyOutcome | null;
  intakeProblemAnswer?: string | null;
  intakeSuccessAnswer?: string | null;
  depositPaid?: boolean;
  agreementConfirmed?: boolean;
}): GateMoveBlock | null {
  const { from, to, people } = args;
  if (from === to) {
    return null;
  }

  if (args.status && gatesLocked(args.status)) {
    return "status";
  }

  const fromI = gateIndex(from);
  const toI = gateIndex(to);
  if (Math.abs(toI - fromI) > 1) {
    return "skip";
  }

  const agreeI = gateIndex("agree");
  if (toI > agreeI && fromI < agreeI) {
    return "agree";
  }

  const hiringWork = (args.workKind ?? "client") === "client";
  if (!hiringWork) {
    return null;
  }

  if (from === "qualify" && toI > fromI && args.qualifyOutcome !== "real") {
    return "qualify";
  }

  if (
    from === "intake" &&
    toI > fromI &&
    (!args.intakeProblemAnswer?.trim() || !args.intakeSuccessAnswer?.trim())
  ) {
    return "intake";
  }

  const discoverI = gateIndex("discover");
  if (toI > discoverI && !dailyUserRecordedWhenNeeded(people)) {
    return "user";
  }

  if (toI > discoverI && !args.problemSentence?.trim()) {
    return "problem";
  }

  const proposeI = gateIndex("propose");
  if (toI > proposeI && args.hasSelectedOption === false) {
    return "option";
  }

  if (
    from === "agree" &&
    toI > fromI &&
    (!args.depositPaid || !args.agreementConfirmed)
  ) {
    return "deposit";
  }

  return null;
}
