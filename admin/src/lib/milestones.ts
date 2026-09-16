import type { ProcessGate } from "@/db/schema";

export type MilestoneSeed = {
  key: string;
  label: string;
  stage: ProcessGate;
  sortOrder: number;
};

/** Default checkpoints seeded on every new hiring project. */
export const DEFAULT_MILESTONES: readonly MilestoneSeed[] = [
  {
    key: "qualified",
    label: "Qualified — real job",
    stage: "qualify",
    sortOrder: 10,
  },
  {
    key: "discovery_done",
    label: "Discovery done",
    stage: "discover",
    sortOrder: 20,
  },
  {
    key: "estimate_shared",
    label: "Estimate shared",
    stage: "discover",
    sortOrder: 30,
  },
  {
    key: "payment_locked",
    label: "Payment / commitment locked",
    stage: "discover",
    sortOrder: 40,
  },
  {
    key: "plan_agreed",
    label: "Plan agreed",
    stage: "plan",
    sortOrder: 50,
  },
  {
    key: "build_started",
    label: "Build started",
    stage: "build",
    sortOrder: 60,
  },
  {
    key: "mid_build",
    label: "Mid-build check-in",
    stage: "build",
    sortOrder: 70,
  },
  {
    key: "ready_to_launch",
    label: "Ready to launch",
    stage: "build",
    sortOrder: 80,
  },
  {
    key: "launched",
    label: "Launched",
    stage: "launch",
    sortOrder: 90,
  },
] as const;
