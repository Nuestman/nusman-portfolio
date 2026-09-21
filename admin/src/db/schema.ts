import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const CLIENT_SOURCES = [
  "referral",
  "family_friends",
  "work_colleague",
  "social_media",
  "inbound",
  "repeat",
  "other",
] as const;
export type ClientSource = (typeof CLIENT_SOURCES)[number];

export const CLIENT_KINDS = ["client", "practice"] as const;
export type ClientKind = (typeof CLIENT_KINDS)[number];

export const PERSON_ROLES = ["buyer", "user", "other"] as const;
export type PersonRole = (typeof PERSON_ROLES)[number];

/** Full DB enum — includes legacy intake / propose / agree for old rows. */
export const PROJECT_GATES = [
  "qualify",
  "intake",
  "discover",
  "propose",
  "agree",
  "plan",
  "build",
  "launch",
] as const;
export type ProjectGate = (typeof PROJECT_GATES)[number];

/** Active process strip: Qualify → Discover → Plan → Build → Launch. */
export const PROCESS_GATES = [
  "qualify",
  "discover",
  "plan",
  "build",
  "launch",
] as const;
export type ProcessGate = (typeof PROCESS_GATES)[number];

export const PROJECT_STATUSES = [
  "inactive",
  "active",
  "paused",
  "won",
  "lost",
  "done",
] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const OPTION_KINDS = ["light", "recommended", "later"] as const;
export type OptionKind = (typeof OPTION_KINDS)[number];

export const WORK_KINDS = ["client", "product"] as const;
export type WorkKind = (typeof WORK_KINDS)[number];

export const QUALIFY_OUTCOMES = [
  "undecided",
  "real",
  "favour",
  "no",
] as const;
export type QualifyOutcome = (typeof QUALIFY_OUTCOMES)[number];

export const CHANGE_STATUSES = ["parked", "priced", "done"] as const;
export type ChangeStatus = (typeof CHANGE_STATUSES)[number];

export const USER_ROLES = ["owner", "operator"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const PORTAL_MESSAGE_AUTHORS = ["client", "operator"] as const;
export type PortalMessageAuthor = (typeof PORTAL_MESSAGE_AUTHORS)[number];

export const PROJECT_EVENT_KINDS = [
  "call",
  "meeting",
  "demo",
  "other",
] as const;
export type ProjectEventKind = (typeof PROJECT_EVENT_KINDS)[number];

export const PROJECT_EVENT_STATUSES = [
  "requested",
  "proposed",
  "confirmed",
  "cancelled",
  "completed",
] as const;
export type ProjectEventStatus = (typeof PROJECT_EVENT_STATUSES)[number];

export const PROJECT_EVENT_ACTORS = ["operator", "client"] as const;
export type ProjectEventActor = (typeof PROJECT_EVENT_ACTORS)[number];

export const clientSourceEnum = pgEnum("client_source", CLIENT_SOURCES);
export const clientKindEnum = pgEnum("client_kind", CLIENT_KINDS);
export const personRoleEnum = pgEnum("person_role", PERSON_ROLES);
export const projectGateEnum = pgEnum("project_gate", PROJECT_GATES);
export const projectStatusEnum = pgEnum("project_status", PROJECT_STATUSES);
export const optionKindEnum = pgEnum("option_kind", OPTION_KINDS);
export const workKindEnum = pgEnum("work_kind", WORK_KINDS);
export const qualifyOutcomeEnum = pgEnum("qualify_outcome", QUALIFY_OUTCOMES);
export const changeStatusEnum = pgEnum("change_status", CHANGE_STATUSES);
export const userRoleEnum = pgEnum("user_role", USER_ROLES);
export const portalMessageAuthorEnum = pgEnum(
  "portal_message_author",
  PORTAL_MESSAGE_AUTHORS,
);
export const projectEventKindEnum = pgEnum(
  "project_event_kind",
  PROJECT_EVENT_KINDS,
);
export const projectEventStatusEnum = pgEnum(
  "project_event_status",
  PROJECT_EVENT_STATUSES,
);
export const projectEventActorEnum = pgEnum(
  "project_event_actor",
  PROJECT_EVENT_ACTORS,
);

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
  title: text("title"),
  phone: text("phone"),
  imageUrl: text("image_url"),
  imageData: text("image_data"),
  imageMime: text("image_mime"),
  passwordHash: text("password_hash"),
  totpSecret: text("totp_secret"),
  totpEnabled: boolean("totp_enabled").notNull().default(false),
  totpRecoveryHashes: jsonb("totp_recovery_hashes").$type<string[]>(),
  role: userRoleEnum("role").notNull().default("operator"),
  active: boolean("active").notNull().default(true),
  ...timestamps,
});

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    userAgent: text("user_agent"),
    ip: text("ip"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("sessions_user_id_idx").on(table.userId),
    index("sessions_expires_at_idx").on(table.expiresAt),
  ],
);

export const clients = pgTable("clients", {
  id: uuid("id").defaultRandom().primaryKey(),
  kind: clientKindEnum("kind").notNull().default("client"),
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
    portalEnabled: boolean("portal_enabled").notNull().default(false),
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
    emailVerifyTokenHash: text("email_verify_token_hash"),
    emailVerifyExpiresAt: timestamp("email_verify_expires_at", {
      withTimezone: true,
    }),
    ...timestamps,
  },
  (table) => [
    index("people_client_id_idx").on(table.clientId),
    uniqueIndex("people_email_verify_token_hash_uidx")
      .on(table.emailVerifyTokenHash)
      .where(sql`${table.emailVerifyTokenHash} is not null`),
  ],
);

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "restrict" }),
    workKind: workKindEnum("work_kind").notNull().default("client"),
    title: text("title").notNull(),
    problemSentence: text("problem_sentence"),
    wantBuilt: text("want_built"),
    successLooksLike: text("success_looks_like"),
    currentGate: projectGateEnum("current_gate").notNull().default("qualify"),
    status: projectStatusEnum("status").notNull().default("active"),
    budgetNote: text("budget_note"),
    deadlineNote: text("deadline_note"),
    portalIntakeOpen: boolean("portal_intake_open").notNull().default(false),
    ...timestamps,
  },
  (table) => [
    index("projects_client_id_idx").on(table.clientId),
    index("projects_current_gate_idx").on(table.currentGate),
    index("projects_status_idx").on(table.status),
    index("projects_work_kind_idx").on(table.workKind),
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
    clientVisible: boolean("client_visible").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("project_notes_project_id_idx").on(table.projectId)],
);

export const activities = pgTable("activities", {
  id: uuid("id").defaultRandom().primaryKey(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

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

export const projectQualify = pgTable("project_qualify", {
  projectId: uuid("project_id")
    .primaryKey()
    .references(() => projects.id, { onDelete: "cascade" }),
  outcome: qualifyOutcomeEnum("outcome").notNull().default("undecided"),
  whoFor: text("who_for"),
  painToday: text("pain_today"),
  neededBy: text("needed_by"),
  budgetNote: text("budget_note"),
  callAt: text("call_at"),
  notes: text("notes"),
  ...timestamps,
});

export const projectMilestones = pgTable(
  "project_milestones",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    key: text("key").notNull(),
    label: text("label").notNull(),
    stage: text("stage").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    doneAt: timestamp("done_at", { withTimezone: true }),
    note: text("note"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("project_milestones_project_key_idx").on(
      table.projectId,
      table.key,
    ),
    index("project_milestones_project_id_idx").on(table.projectId),
  ],
);

export const projectIntakeAnswers = pgTable(
  "project_intake_answers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    theme: text("theme").notNull(),
    ask: text("ask").notNull(),
    answer: text("answer"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("project_intake_answers_project_theme_idx").on(
      table.projectId,
      table.theme,
    ),
  ],
);

export const projectDiscovery = pgTable("project_discovery", {
  projectId: uuid("project_id")
    .primaryKey()
    .references(() => projects.id, { onDelete: "cascade" }),
  callAt: text("call_at"),
  attendees: text("attendees"),
  currentProcess: text("current_process"),
  lastExample: text("last_example"),
  inScope: text("in_scope"),
  outOfScope: text("out_of_scope"),
  devicesLanguage: text("devices_language"),
  privacyNotes: text("privacy_notes"),
  ...timestamps,
});

export const projectAgreements = pgTable("project_agreements", {
  projectId: uuid("project_id")
    .primaryKey()
    .references(() => projects.id, { onDelete: "cascade" }),
  parties: text("parties"),
  outcome: text("outcome"),
  scope: text("scope"),
  money: text("money"),
  time: text("time"),
  changes: text("changes"),
  support: text("support"),
  workplace: text("workplace"),
  depositPaid: boolean("deposit_paid").notNull().default(false),
  confirmed: boolean("confirmed").notNull().default(false),
  ...timestamps,
});

export const projectChangeRequests = pgTable(
  "project_change_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    status: changeStatusEnum("status").notNull().default("parked"),
    ...timestamps,
  },
  (table) => [
    index("project_change_requests_project_id_idx").on(table.projectId),
  ],
);

export const projectDemos = pgTable(
  "project_demos",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    happenedAt: text("happened_at"),
    notes: text("notes").notNull(),
    ...timestamps,
  },
  (table) => [index("project_demos_project_id_idx").on(table.projectId)],
);

export const projectLaunch = pgTable("project_launch", {
  projectId: uuid("project_id")
    .primaryKey()
    .references(() => projects.id, { onDelete: "cascade" }),
  trained: boolean("trained").notNull().default(false),
  guideLeft: boolean("guide_left").notNull().default(false),
  remainingInvoiced: boolean("remaining_invoiced").notNull().default(false),
  maintenanceOffered: boolean("maintenance_offered").notNull().default(false),
  handoverNote: text("handover_note"),
  ...timestamps,
});

export const auditEvents = pgTable(
  "audit_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    actorEmail: text("actor_email"),
    action: text("action").notNull(),
    summary: text("summary").notNull(),
    before: jsonb("before"),
    after: jsonb("after"),
    reason: text("reason"),
    entityType: text("entity_type"),
    entityId: uuid("entity_id"),
    projectId: uuid("project_id").references(() => projects.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("audit_events_created_at_idx").on(table.createdAt),
    index("audit_events_project_id_idx").on(table.projectId),
  ],
);

export const portalMagicLinks = pgTable(
  "portal_magic_links",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    personId: uuid("person_id")
      .notNull()
      .references(() => people.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("portal_magic_links_person_id_idx").on(table.personId)],
);

export const portalSessions = pgTable(
  "portal_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    personId: uuid("person_id")
      .notNull()
      .references(() => people.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    userAgent: text("user_agent"),
    ip: text("ip"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("portal_sessions_person_id_idx").on(table.personId),
    index("portal_sessions_expires_at_idx").on(table.expiresAt),
  ],
);

export const portalMessages = pgTable(
  "portal_messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    personId: uuid("person_id").references(() => people.id, {
      onDelete: "set null",
    }),
    authorKind: portalMessageAuthorEnum("author_kind").notNull(),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("portal_messages_project_id_idx").on(table.projectId)],
);

export const projectEvents = pgTable(
  "project_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    kind: projectEventKindEnum("kind").notNull(),
    title: text("title").notNull(),
    status: projectEventStatusEnum("status").notNull().default("proposed"),
    startsAt: timestamp("starts_at", { withTimezone: true }),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    location: text("location"),
    notes: text("notes"),
    createdByKind: projectEventActorEnum("created_by_kind").notNull(),
    personId: uuid("person_id").references(() => people.id, {
      onDelete: "set null",
    }),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    index("project_events_project_starts_at_idx").on(
      table.projectId,
      table.startsAt,
    ),
  ],
);

export const NOTIFICATION_AUDIENCES = ["desk", "portal"] as const;
export type NotificationAudience = (typeof NOTIFICATION_AUDIENCES)[number];

export const NOTIFICATION_KINDS = [
  "message",
  "schedule",
  "milestone",
  "stage",
  "project_started",
  "portal_access",
  "inbound",
  "manual",
  "system",
] as const;
export type NotificationKind = (typeof NOTIFICATION_KINDS)[number];

export const notificationAudienceEnum = pgEnum(
  "notification_audience",
  NOTIFICATION_AUDIENCES,
);
export const notificationKindEnum = pgEnum(
  "notification_kind",
  NOTIFICATION_KINDS,
);

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    audience: notificationAudienceEnum("audience").notNull(),
    kind: notificationKindEnum("kind").notNull().default("system"),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    personId: uuid("person_id").references(() => people.id, {
      onDelete: "cascade",
    }),
    clientId: uuid("client_id").references(() => clients.id, {
      onDelete: "set null",
    }),
    projectId: uuid("project_id").references(() => projects.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    body: text("body").notNull(),
    href: text("href"),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdByUserId: uuid("created_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    ...timestamps,
  },
  (table) => [
    index("notifications_desk_user_idx").on(
      table.audience,
      table.userId,
      table.createdAt,
    ),
    index("notifications_portal_person_idx").on(
      table.audience,
      table.personId,
      table.createdAt,
    ),
    index("notifications_read_at_idx").on(table.readAt),
  ],
);

/** Public /start onboarding — Desk project is created inactive; verify activates. */
export const inboundLeadDrafts = pgTable(
  "inbound_lead_drafts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull(),
    name: text("name").notNull(),
    phone: text("phone"),
    organisation: text("organisation"),
    source: clientSourceEnum("source").notNull(),
    sourceOther: text("source_other"),
    problem: text("problem").notNull().default(""),
    wantBuilt: text("want_built").notNull().default(""),
    whoFor: text("who_for").notNull().default(""),
    successLooksLike: text("success_looks_like").notNull().default(""),
    timeline: text("timeline"),
    budget: text("budget"),
    verifyTokenHash: text("verify_token_hash").notNull(),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    projectId: uuid("project_id").references(() => projects.id, {
      onDelete: "set null",
    }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("inbound_lead_drafts_verify_token_hash_uidx").on(
      table.verifyTokenHash,
    ),
    uniqueIndex("inbound_lead_drafts_email_open_uidx")
      .on(table.email)
      .where(sql`${table.completedAt} is null`),
    index("inbound_lead_drafts_email_idx").on(table.email),
    index("inbound_lead_drafts_expires_at_idx").on(table.expiresAt),
    index("inbound_lead_drafts_project_id_idx").on(table.projectId),
  ],
);
