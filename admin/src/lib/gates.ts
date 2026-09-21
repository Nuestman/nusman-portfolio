import {
  PROCESS_GATES,
  PROJECT_GATES,
  type PersonRole,
  type ProcessGate,
  type ProjectGate,
  type ProjectStatus,
  type QualifyOutcome,
  type WorkKind,
} from "@/db/schema";

export type GateGuide = {
  id: ProcessGate;
  label: string;
  publicStep: string;
  youDo: string;
  theyDo: string;
  exitWhen: string;
};

export const GATE_GUIDES: GateGuide[] = [
  {
    id: "qualify",
    label: "1. Qualify",
    publicStep: "Qualifying",
    youDo: "Confirm this is a real job — real client, real problem they want fixed.",
    theyDo: "Say who it is for, the pain, timeline, and budget hints (oral or /start).",
    exitWhen: "Outcome is a real project and you are ready for discovery.",
  },
  {
    id: "discover",
    label: "2. Discover",
    publicStep: "Discovery",
    youDo: "Capture the eight themes after the call (or via portal form), estimate, and lock commitment.",
    theyDo: "Show how work is done today; agree problem and success in writing.",
    exitWhen: "Problem and Success are written; enough to plan and price.",
  },
  {
    id: "plan",
    label: "3. Plan",
    publicStep: "Planning",
    youDo: "Align objectives, scope, timeline, budget, and package before any build.",
    theyDo: "Choose a package and confirm the written plan.",
    exitWhen: "Shared plan and chosen package — ready to build.",
  },
  {
    id: "build",
    label: "4. Build",
    publicStep: "Building",
    youDo: "Deliver against the plan. Demo regularly. Park change requests.",
    theyDo: "Use demos and give feedback in one channel.",
    exitWhen: "Agreed features work for the daily user.",
  },
  {
    id: "launch",
    label: "5. Launch",
    publicStep: "Launch & support",
    youDo: "Train, hand over a simple guide, time-box support.",
    theyDo: "Run it without you. Pay remaining balance if owed.",
    exitWhen: "Handover done.",
  },
];

export function isProjectGate(value: string): value is ProjectGate {
  return (PROJECT_GATES as readonly string[]).includes(value);
}

export function isProcessGate(value: string): value is ProcessGate {
  return (PROCESS_GATES as readonly string[]).includes(value);
}

/** Map legacy gates onto the active process strip. */
export function toProcessGate(gate: ProjectGate): ProcessGate {
  switch (gate) {
    case "qualify":
      return "qualify";
    case "intake":
    case "discover":
      return "discover";
    case "propose":
    case "agree":
    case "plan":
      return "plan";
    case "build":
      return "build";
    case "launch":
      return "launch";
    default: {
      const _exhaustive: never = gate;
      return _exhaustive;
    }
  }
}

const GATE_BY_ID = Object.fromEntries(
  GATE_GUIDES.map((guide) => [guide.id, guide]),
) as Record<ProcessGate, GateGuide>;

export function gateGuide(gate: ProjectGate): GateGuide {
  return GATE_BY_ID[toProcessGate(gate)];
}

export function processGateIndex(gate: ProcessGate): number {
  return PROCESS_GATES.indexOf(gate);
}

/** @deprecated Prefer processGateIndex(toProcessGate(gate)) */
export function gateIndex(gate: ProjectGate): number {
  return processGateIndex(toProcessGate(gate));
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
  "plan",
  "user",
  "problem",
  "option",
  "status",
  "qualify",
  "discover",
] as const;

export type GateMoveBlock = (typeof GATE_MOVE_BLOCKS)[number];

export function gatesLocked(status: ProjectStatus): boolean {
  return (
    status === "inactive" ||
    status === "won" ||
    status === "lost" ||
    status === "done"
  );
}

export function gateMoveBlockMessage(code: GateMoveBlock): string {
  switch (code) {
    case "skip":
      return "Move one stage at a time. Do not skip.";
    case "plan":
      return "Build is not allowed until Plan is complete.";
    case "user":
      return "If the daily user is not the buyer, add a daily-user person before leaving Discover.";
    case "problem":
      return "Write the problem sentence before leaving Discover.";
    case "option":
      return "Choose a package before leaving Plan.";
    case "status":
      return "Inactive, won, lost, and done projects stay on their stage. Confirm the email or change status first.";
    case "qualify":
      return "Record the qualify outcome as a real project before you leave Qualify.";
    case "discover":
      return "Write the Problem and Success discovery answers before you leave Discover.";
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
}): GateMoveBlock | null {
  const { from, to, people } = args;
  if (from === to) {
    return null;
  }

  if (args.status && gatesLocked(args.status)) {
    return "status";
  }

  if (!isProcessGate(to)) {
    return "skip";
  }

  const fromP = toProcessGate(from);
  const toP = toProcessGate(to);
  const fromI = processGateIndex(fromP);
  const toI = processGateIndex(toP);
  if (Math.abs(toI - fromI) > 1) {
    return "skip";
  }

  const planI = processGateIndex("plan");
  if (toI > planI && fromI < planI) {
    return "plan";
  }

  const hiringWork = (args.workKind ?? "client") === "client";
  if (!hiringWork) {
    return null;
  }

  if (fromP === "qualify" && toI > fromI && args.qualifyOutcome !== "real") {
    return "qualify";
  }

  if (
    fromP === "discover" &&
    toI > fromI &&
    (!args.intakeProblemAnswer?.trim() || !args.intakeSuccessAnswer?.trim())
  ) {
    return "discover";
  }

  const discoverI = processGateIndex("discover");
  if (toI > discoverI && !dailyUserRecordedWhenNeeded(people)) {
    return "user";
  }

  if (toI > discoverI && !args.problemSentence?.trim()) {
    return "problem";
  }

  if (fromP === "plan" && toI > fromI && args.hasSelectedOption === false) {
    return "option";
  }

  return null;
}
