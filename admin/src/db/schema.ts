import {
  boolean,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const CLIENT_SOURCES = [
  "referral",
  "inbound",
  "repeat",
  "other",
] as const;
export type ClientSource = (typeof CLIENT_SOURCES)[number];

export const PERSON_ROLES = ["buyer", "user", "other"] as const;
export type PersonRole = (typeof PERSON_ROLES)[number];

export const PROJECT_GATES = [
  "qualify",
  "intake",
  "discover",
  "propose",
  "agree",
  "build",
  "launch",
] as const;
export type ProjectGate = (typeof PROJECT_GATES)[number];

export const PROJECT_STATUSES = [
  "active",
  "paused",
  "won",
  "lost",
  "done",
] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const OPTION_KINDS = ["light", "recommended", "later"] as const;
export type OptionKind = (typeof OPTION_KINDS)[number];

export const clientSourceEnum = pgEnum("client_source", CLIENT_SOURCES);
export const personRoleEnum = pgEnum("person_role", PERSON_ROLES);
export const projectGateEnum = pgEnum("project_gate", PROJECT_GATES);
export const projectStatusEnum = pgEnum("project_status", PROJECT_STATUSES);
export const optionKindEnum = pgEnum("option_kind", OPTION_KINDS);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
};

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  ...timestamps,
});

export const clients = pgTable("clients", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  organisation: text("organisation"),
  source: clientSourceEnum("source"),
  notes: text("notes"),
  ...timestamps,
});

export const people = pgTable(
  "people",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    email: text("email"),
    phone: text("phone"),
    role: personRoleEnum("role").notNull(),
    isDecisionMaker: boolean("is_decision_maker").notNull().default(false),
    notes: text("notes"),
    ...timestamps,
  },
  (table) => [index("people_client_id_idx").on(table.clientId)],
);

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "restrict" }),
    title: text("title").notNull(),
    problemSentence: text("problem_sentence"),
    successLooksLike: text("success_looks_like"),
    currentGate: projectGateEnum("current_gate").notNull().default("qualify"),
    status: projectStatusEnum("status").notNull().default("active"),
    budgetNote: text("budget_note"),
    deadlineNote: text("deadline_note"),
    ...timestamps,
  },
  (table) => [
    index("projects_client_id_idx").on(table.clientId),
    index("projects_current_gate_idx").on(table.currentGate),
    index("projects_status_idx").on(table.status),
  ],
);

export const projectNotes = pgTable(
  "project_notes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("project_notes_project_id_idx").on(table.projectId)],
);

export const projectOptions = pgTable(
  "project_options",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    kind: optionKindEnum("kind").notNull(),
    summary: text("summary").notNull(),
    priceNote: text("price_note"),
    timelineNote: text("timeline_note"),
    inScope: text("in_scope"),
    outOfScope: text("out_of_scope"),
    selected: boolean("selected").notNull().default(false),
    ...timestamps,
  },
  (table) => [index("project_options_project_id_idx").on(table.projectId)],
);
