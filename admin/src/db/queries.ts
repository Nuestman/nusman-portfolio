import { and, asc, count, desc, eq, gte, inArray, isNull, lte, ne, or, sql, type SQL } from "drizzle-orm";
import { getDb } from "./index";
import {
  OPTION_KINDS,
  activities,
  auditEvents,
  clients,
  people,
  portalMagicLinks,
  portalMessages,
  portalSessions,
  projectAgreements,
  projectChangeRequests,
  projectDemos,
  projectDiscovery,
  projectEvents,
  projectIntakeAnswers,
  projectLaunch,
  projectNotes,
  projectOptions,
  projectQualify,
  projects,
  sessions,
  users,
} from "./schema";
import type {
  ChangeStatus,
  ClientKind,
  ClientSource,
  OptionKind,
  PersonRole,
  PortalMessageAuthor,
  ProjectEventActor,
  ProjectEventKind,
  ProjectEventStatus,
  ProjectGate,
  ProjectStatus,
  QualifyOutcome,
  UserRole,
  WorkKind,
} from "./schema";
import { INTAKE_QUESTIONS } from "@/lib/templates";
import { KNOWN_PRODUCTS } from "@/lib/products";

export async function countProjects(workKind: WorkKind = "client") {
  const db = getDb();
  const [row] = await db
    .select({ value: count() })
    .from(projects)
    .where(eq(projects.workKind, workKind));
  return row?.value ?? 0;
}

export async function countClients() {
  const db = getDb();
  const [row] = await db
    .select({ value: count() })
    .from(clients)
    .where(eq(clients.kind, "client"));
  return row?.value ?? 0;
}

export async function getOperator() {
  const db = getDb();
  const [owner] = await db
    .select()
    .from(users)
    .where(eq(users.role, "owner"))
    .limit(1);
  if (owner) {
    return owner;
  }
  const [operator] = await db.select().from(users).limit(1);
  return operator ?? null;
}

const USER_PUBLIC = {
  id: users.id,
  email: users.email,
  name: users.name,
  title: users.title,
  phone: users.phone,
  imageUrl: users.imageUrl,
  role: users.role,
  active: users.active,
  totpEnabled: users.totpEnabled,
  createdAt: users.createdAt,
  updatedAt: users.updatedAt,
} as const;

export type PublicUser = {
  id: string;
  email: string;
  name: string;
  title: string | null;
  phone: string | null;
  imageUrl: string | null;
  role: UserRole;
  active: boolean;
  totpEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export function publicUserSnapshot(user: {
  id: string;
  email: string;
  name: string;
  title: string | null;
  phone: string | null;
  imageUrl: string | null;
  role: UserRole;
  active: boolean;
  totpEnabled?: boolean;
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    title: user.title,
    phone: user.phone,
    imageUrl: user.imageUrl,
    role: user.role,
    active: user.active,
    totpEnabled: Boolean(user.totpEnabled),
  };
}

export async function listUsers() {
  const db = getDb();
  return db
    .select(USER_PUBLIC)
    .from(users)
    .orderBy(users.createdAt);
}

export async function getUserById(id: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  return row ?? null;
}

export async function getUserByEmail(email: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return row ?? null;
}

export async function createUser(values: {
  email: string;
  name: string;
  title: string | null;
  phone: string | null;
  passwordHash: string;
  role?: UserRole;
  imageUrl?: string | null;
}) {
  const db = getDb();
  const [row] = await db
    .insert(users)
    .values({
      email: values.email,
      name: values.name,
      title: values.title,
      phone: values.phone,
      passwordHash: values.passwordHash,
      role: values.role ?? "operator",
      imageUrl: values.imageUrl ?? null,
    })
    .returning(USER_PUBLIC);
  if (!row) {
    throw new Error("Could not create user");
  }
  return row;
}

export async function updateUser(
  id: string,
  values: {
    email: string;
    name: string;
    title: string | null;
    phone: string | null;
    imageUrl?: string | null;
    imageData?: string | null;
    imageMime?: string | null;
    passwordHash?: string;
  },
) {
  const db = getDb();
  await db
    .update(users)
    .set({
      email: values.email,
      name: values.name,
      title: values.title,
      phone: values.phone,
      updatedAt: new Date(),
      ...(values.imageUrl !== undefined ? { imageUrl: values.imageUrl } : {}),
      ...(values.imageData !== undefined ? { imageData: values.imageData } : {}),
      ...(values.imageMime !== undefined ? { imageMime: values.imageMime } : {}),
      ...(values.passwordHash !== undefined
        ? { passwordHash: values.passwordHash }
        : {}),
    })
    .where(eq(users.id, id));
}

export async function setUserPasswordHash(id: string, passwordHash: string) {
  const db = getDb();
  await db
    .update(users)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(users.id, id));
}

export async function setUserTotp(
  id: string,
  values: {
    totpSecret: string | null;
    totpEnabled: boolean;
    totpRecoveryHashes: string[] | null;
  },
) {
  const db = getDb();
  await db
    .update(users)
    .set({
      totpSecret: values.totpSecret,
      totpEnabled: values.totpEnabled,
      totpRecoveryHashes: values.totpRecoveryHashes,
      updatedAt: new Date(),
    })
    .where(eq(users.id, id));
}

export async function setUserActive(id: string, active: boolean) {
  const db = getDb();
  await db
    .update(users)
    .set({ active, updatedAt: new Date() })
    .where(eq(users.id, id));
}

export async function createSessionRow(values: {
  userId: string;
  expiresAt: Date;
  userAgent: string | null;
  ip: string | null;
}) {
  const db = getDb();
  const [row] = await db.insert(sessions).values(values).returning({
    id: sessions.id,
  });
  if (!row) {
    throw new Error("Could not create session");
  }
  return row.id;
}

export async function getSessionRow(id: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, id))
    .limit(1);
  return row ?? null;
}

export async function listSessionsForUser(userId: string) {
  const db = getDb();
  return db
    .select()
    .from(sessions)
    .where(eq(sessions.userId, userId))
    .orderBy(desc(sessions.createdAt));
}

export async function deleteSession(id: string) {
  const db = getDb();
  await db.delete(sessions).where(eq(sessions.id, id));
}

export async function deleteOtherSessions(userId: string, keepId: string) {
  const db = getDb();
  await db
    .delete(sessions)
    .where(and(eq(sessions.userId, userId), ne(sessions.id, keepId)));
}

export async function deleteSessionsForUser(userId: string) {
  const db = getDb();
  await db.delete(sessions).where(eq(sessions.userId, userId));
}

export async function listClients() {
  const db = getDb();
  const rows = await db
    .select()
    .from(clients)
    .where(eq(clients.kind, "client"))
    .orderBy(desc(clients.updatedAt));

  if (rows.length === 0) {
    return [];
  }

  const ids = rows.map((row) => row.id);
  const [projectRows, personRows] = await Promise.all([
    db
      .select({ clientId: projects.clientId, value: count() })
      .from(projects)
      .where(inArray(projects.clientId, ids))
      .groupBy(projects.clientId),
    db
      .select({ clientId: people.clientId, value: count() })
      .from(people)
      .where(inArray(people.clientId, ids))
      .groupBy(people.clientId),
  ]);

  const projectCount = new Map(
    projectRows.map((row) => [row.clientId, row.value]),
  );
  const personCount = new Map(
    personRows.map((row) => [row.clientId, row.value]),
  );

  return rows.map((row) => ({
    ...row,
    projectCount: projectCount.get(row.id) ?? 0,
    personCount: personCount.get(row.id) ?? 0,
  }));
}

export async function getOrCreatePracticeClient() {
  const db = getDb();
  const [existing] = await db
    .select()
    .from(clients)
    .where(eq(clients.kind, "practice"))
    .limit(1);
  if (existing) {
    return existing;
  }

  const operator = await getOperator();
  const [row] = await db
    .insert(clients)
    .values({
      kind: "practice",
      name: "nusman.dev",
      organisation: "Numan Usman",
      source: "other",
      notes: "Practice owner. Own products attach here. Not a hiring party.",
    })
    .returning();
  if (!row) {
    throw new Error("Could not create practice");
  }

  await db.insert(people).values({
    clientId: row.id,
    name: operator?.name ?? "Numan Usman",
    email: operator?.email ?? null,
    role: "buyer",
    isDecisionMaker: true,
    notes: "Operator.",
  });
  return row;
}

export async function getClient(id: string) {
  const db = getDb();
  const [row] = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
  return row ?? null;
}

export async function createClient(values: {
  kind?: ClientKind;
  name: string;
  email: string | null;
  phone: string | null;
  organisation: string | null;
  source: ClientSource | null;
  notes: string | null;
}) {
  const db = getDb();
  const [row] = await db.insert(clients).values(values).returning({ id: clients.id });
  if (!row) {
    throw new Error("Could not create client");
  }
  return row.id;
}

export async function updateClient(
  id: string,
  values: {
    name: string;
    email: string | null;
    phone: string | null;
    organisation: string | null;
    source: ClientSource | null;
    notes: string | null;
  },
) {
  const db = getDb();
  await db
    .update(clients)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(clients.id, id));
}

export async function countProjectsForClient(clientId: string) {
  const db = getDb();
  const [row] = await db
    .select({ value: count() })
    .from(projects)
    .where(eq(projects.clientId, clientId));
  return row?.value ?? 0;
}

export async function deleteClient(id: string) {
  const db = getDb();
  await db.delete(clients).where(eq(clients.id, id));
}

export async function listPeople(clientId: string) {
  const db = getDb();
  return db
    .select()
    .from(people)
    .where(eq(people.clientId, clientId))
    .orderBy(
      sql`case when ${people.role} = 'buyer' then 0 when ${people.role} = 'user' then 1 else 2 end`,
      people.name,
    );
}

export async function listPeopleByClientIds(clientIds: string[]) {
  if (clientIds.length === 0) {
    return [];
  }
  const db = getDb();
  return db
    .select({
      id: people.id,
      clientId: people.clientId,
      name: people.name,
      role: people.role,
    })
    .from(people)
    .where(inArray(people.clientId, clientIds))
    .orderBy(people.name);
}

export async function getPerson(id: string) {
  const db = getDb();
  const [row] = await db.select().from(people).where(eq(people.id, id)).limit(1);
  return row ?? null;
}

export async function createPerson(values: {
  clientId: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: PersonRole;
  isDecisionMaker: boolean;
  notes: string | null;
}) {
  const db = getDb();
  await db.insert(people).values(values);
}

export async function updatePerson(
  id: string,
  values: {
    name: string;
    email: string | null;
    phone: string | null;
    role: PersonRole;
    isDecisionMaker: boolean;
    notes: string | null;
    portalEnabled?: boolean;
  },
) {
  const db = getDb();
  await db
    .update(people)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(people.id, id));
}

export async function deletePerson(id: string) {
  const db = getDb();
  await db.delete(people).where(eq(people.id, id));
}

export async function listProjects(filters?: {
  gate?: ProjectGate;
  status?: ProjectStatus;
  workKind?: WorkKind;
}) {
  const db = getDb();
  const conditions: SQL[] = [
    eq(projects.workKind, filters?.workKind ?? "client"),
  ];
  if (filters?.gate) {
    conditions.push(eq(projects.currentGate, filters.gate));
  }
  if (filters?.status) {
    conditions.push(eq(projects.status, filters.status));
  }

  return db
    .select({
      id: projects.id,
      title: projects.title,
      currentGate: projects.currentGate,
      status: projects.status,
      workKind: projects.workKind,
      clientId: projects.clientId,
      clientName: clients.name,
      updatedAt: projects.updatedAt,
    })
    .from(projects)
    .innerJoin(clients, eq(projects.clientId, clients.id))
    .where(and(...conditions))
    .orderBy(desc(projects.updatedAt));
}

export async function listActiveProjects() {
  return listProjects({ status: "active", workKind: "client" });
}

export async function listProductProjects() {
  return listProjects({ workKind: "product" });
}

export async function listProjectsForClient(clientId: string) {
  const db = getDb();
  return db
    .select()
    .from(projects)
    .where(eq(projects.clientId, clientId))
    .orderBy(desc(projects.updatedAt));
}

export async function getProject(id: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, id))
    .limit(1);
  return row ?? null;
}

export async function createProject(values: {
  clientId: string;
  title: string;
  problemSentence: string | null;
  successLooksLike: string | null;
  workKind?: WorkKind;
  currentGate?: ProjectGate;
  status?: ProjectStatus;
  deadlineNote?: string | null;
}) {
  const db = getDb();
  const [row] = await db
    .insert(projects)
    .values({
      clientId: values.clientId,
      title: values.title,
      problemSentence: values.problemSentence,
      successLooksLike: values.successLooksLike,
      workKind: values.workKind ?? "client",
      currentGate: values.currentGate ?? "qualify",
      status: values.status ?? "active",
      deadlineNote: values.deadlineNote,
    })
    .returning({ id: projects.id });
  if (!row) {
    throw new Error("Could not create project");
  }
  if ((values.workKind ?? "client") === "client") {
    await ensureIntakeAnswers(row.id);
  }
  return row.id;
}

export async function recordKnownProducts() {
  const practice = await getOrCreatePracticeClient();
  const db = getDb();
  const existing = await db
    .select({ title: projects.title })
    .from(projects)
    .where(
      and(eq(projects.clientId, practice.id), eq(projects.workKind, "product")),
    );
  const titles = new Set(existing.map((row) => row.title.toLowerCase()));
  const created: string[] = [];

  for (const product of KNOWN_PRODUCTS) {
    if (titles.has(product.title.toLowerCase())) {
      continue;
    }
    const id = await createProject({
      clientId: practice.id,
      title: product.title,
      problemSentence:
        "Own product. App and database stay on their own Neon project until a later import.",
      successLooksLike: null,
      workKind: "product",
      currentGate: "launch",
      status: product.status,
      deadlineNote: `Neon project: ${product.neonName}`,
    });
    await addNote(
      id,
      `Recorded as an own product. Database stays on Neon project ${product.neonName}.`,
    );
    created.push(product.title);
  }

  return created;
}

export async function updateProject(
  id: string,
  values: {
    title: string;
    problemSentence: string | null;
    successLooksLike: string | null;
    budgetNote: string | null;
    deadlineNote: string | null;
    status: ProjectStatus;
  },
) {
  const db = getDb();
  await db
    .update(projects)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(projects.id, id));
}

export async function updateProjectGate(id: string, currentGate: ProjectGate) {
  const db = getDb();
  await db
    .update(projects)
    .set({ currentGate, updatedAt: new Date() })
    .where(eq(projects.id, id));
}

export async function deleteProject(id: string) {
  const db = getDb();
  await db.delete(projects).where(eq(projects.id, id));
}

export async function listNotes(projectId: string) {
  const db = getDb();
  return db
    .select()
    .from(projectNotes)
    .where(eq(projectNotes.projectId, projectId))
    .orderBy(desc(projectNotes.createdAt));
}

export async function addNote(
  projectId: string,
  body: string,
  clientVisible = false,
) {
  const db = getDb();
  await db.insert(projectNotes).values({ projectId, body, clientVisible });
}

export async function getNote(id: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(projectNotes)
    .where(eq(projectNotes.id, id))
    .limit(1);
  return row ?? null;
}

export async function updateNote(
  id: string,
  body: string,
  clientVisible?: boolean,
) {
  const db = getDb();
  await db
    .update(projectNotes)
    .set({
      body,
      ...(clientVisible !== undefined ? { clientVisible } : {}),
    })
    .where(eq(projectNotes.id, id));
}

export async function setNoteClientVisible(id: string, clientVisible: boolean) {
  const db = getDb();
  await db
    .update(projectNotes)
    .set({ clientVisible })
    .where(eq(projectNotes.id, id));
}

export async function deleteNote(id: string) {
  const db = getDb();
  await db.delete(projectNotes).where(eq(projectNotes.id, id));
}

export async function listOptions(projectId: string) {
  const db = getDb();
  const rows = await db
    .select()
    .from(projectOptions)
    .where(eq(projectOptions.projectId, projectId));
  return rows.sort(
    (a, b) => OPTION_KINDS.indexOf(a.kind) - OPTION_KINDS.indexOf(b.kind),
  );
}

export async function getOption(id: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(projectOptions)
    .where(eq(projectOptions.id, id))
    .limit(1);
  return row ?? null;
}

export async function findOptionByKind(projectId: string, kind: OptionKind) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(projectOptions)
    .where(
      and(
        eq(projectOptions.projectId, projectId),
        eq(projectOptions.kind, kind),
      ),
    )
    .limit(1);
  return row ?? null;
}

type OptionFields = {
  kind: OptionKind;
  summary: string;
  priceNote: string | null;
  timelineNote: string | null;
  inScope: string | null;
  outOfScope: string | null;
};

export async function createOption(
  projectId: string,
  values: OptionFields,
) {
  const db = getDb();
  const [row] = await db
    .insert(projectOptions)
    .values({ projectId, ...values })
    .returning({ id: projectOptions.id });
  if (!row) {
    throw new Error("Could not create option");
  }
  return row.id;
}

export async function updateOption(id: string, values: Omit<OptionFields, "kind">) {
  const db = getDb();
  await db
    .update(projectOptions)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(projectOptions.id, id));
}

export async function deleteOption(id: string) {
  const db = getDb();
  await db.delete(projectOptions).where(eq(projectOptions.id, id));
}

export async function selectOption(projectId: string, optionId: string) {
  const db = getDb();
  await db
    .update(projectOptions)
    .set({ selected: false, updatedAt: new Date() })
    .where(eq(projectOptions.projectId, projectId));
  await db
    .update(projectOptions)
    .set({ selected: true, updatedAt: new Date() })
    .where(
      and(
        eq(projectOptions.id, optionId),
        eq(projectOptions.projectId, projectId),
      ),
    );
}

export async function listActivities(limit?: number) {
  const db = getDb();
  const query = db
    .select()
    .from(activities)
    .orderBy(desc(activities.createdAt));
  if (limit === undefined) {
    return query;
  }
  return query.limit(limit);
}

export async function addActivity(body: string) {
  const db = getDb();
  await db.insert(activities).values({ body });
}

export async function updateActivity(id: string, body: string) {
  const db = getDb();
  await db.update(activities).set({ body }).where(eq(activities.id, id));
}

export async function getActivity(id: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(activities)
    .where(eq(activities.id, id))
    .limit(1);
  return row ?? null;
}

export async function deleteActivity(id: string) {
  const db = getDb();
  await db.delete(activities).where(eq(activities.id, id));
}

function sortIntakeAnswers<T extends { theme: string }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => {
    const aIndex = INTAKE_QUESTIONS.findIndex((item) => item.theme === a.theme);
    const bIndex = INTAKE_QUESTIONS.findIndex((item) => item.theme === b.theme);
    return aIndex - bIndex;
  });
}

export async function listIntakeAnswers(projectId: string) {
  const db = getDb();
  const rows = await db
    .select()
    .from(projectIntakeAnswers)
    .where(eq(projectIntakeAnswers.projectId, projectId));
  return sortIntakeAnswers(rows);
}

export async function ensureIntakeAnswers(projectId: string) {
  const existing = await listIntakeAnswers(projectId);
  const have = new Set(existing.map((row) => row.theme));
  const missing = INTAKE_QUESTIONS.filter((item) => !have.has(item.theme));
  if (missing.length === 0) {
    return existing;
  }

  const db = getDb();
  await db.insert(projectIntakeAnswers).values(
    missing.map((item) => ({
      projectId,
      theme: item.theme,
      ask: item.ask,
      answer: null,
    })),
  );
  return listIntakeAnswers(projectId);
}

export async function saveIntakeAnswers(
  projectId: string,
  answers: Array<{ theme: string; ask: string; answer: string | null }>,
) {
  const db = getDb();
  const existing = await listIntakeAnswers(projectId);
  const byTheme = new Map(existing.map((row) => [row.theme, row]));
  const now = new Date();

  for (const item of answers) {
    const row = byTheme.get(item.theme);
    if (row) {
      await db
        .update(projectIntakeAnswers)
        .set({
          ask: item.ask,
          answer: item.answer,
          updatedAt: now,
        })
        .where(eq(projectIntakeAnswers.id, row.id));
    } else {
      await db.insert(projectIntakeAnswers).values({
        projectId,
        theme: item.theme,
        ask: item.ask,
        answer: item.answer,
      });
    }
  }
}

export async function getQualify(projectId: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(projectQualify)
    .where(eq(projectQualify.projectId, projectId))
    .limit(1);
  return row ?? null;
}

export async function upsertQualify(
  projectId: string,
  values: {
    outcome: QualifyOutcome;
    whoFor: string | null;
    painToday: string | null;
    neededBy: string | null;
    callAt: string | null;
    notes: string | null;
  },
) {
  const db = getDb();
  const existing = await getQualify(projectId);
  if (existing) {
    await db
      .update(projectQualify)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(projectQualify.projectId, projectId));
    return;
  }
  await db.insert(projectQualify).values({ projectId, ...values });
}

export async function getDiscovery(projectId: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(projectDiscovery)
    .where(eq(projectDiscovery.projectId, projectId))
    .limit(1);
  return row ?? null;
}

export async function upsertDiscovery(
  projectId: string,
  values: {
    callAt: string | null;
    attendees: string | null;
    currentProcess: string | null;
    lastExample: string | null;
    inScope: string | null;
    outOfScope: string | null;
    devicesLanguage: string | null;
    privacyNotes: string | null;
  },
) {
  const db = getDb();
  const existing = await getDiscovery(projectId);
  if (existing) {
    await db
      .update(projectDiscovery)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(projectDiscovery.projectId, projectId));
    return;
  }
  await db.insert(projectDiscovery).values({ projectId, ...values });
}

export async function getAgreement(projectId: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(projectAgreements)
    .where(eq(projectAgreements.projectId, projectId))
    .limit(1);
  return row ?? null;
}

export async function upsertAgreement(
  projectId: string,
  values: {
    parties: string | null;
    outcome: string | null;
    scope: string | null;
    money: string | null;
    time: string | null;
    changes: string | null;
    support: string | null;
    workplace: string | null;
    depositPaid: boolean;
    confirmed: boolean;
  },
) {
  const db = getDb();
  const existing = await getAgreement(projectId);
  if (existing) {
    await db
      .update(projectAgreements)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(projectAgreements.projectId, projectId));
    return;
  }
  await db.insert(projectAgreements).values({ projectId, ...values });
}

export async function listChangeRequests(projectId: string) {
  const db = getDb();
  return db
    .select()
    .from(projectChangeRequests)
    .where(eq(projectChangeRequests.projectId, projectId))
    .orderBy(desc(projectChangeRequests.createdAt));
}

export async function getChangeRequest(id: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(projectChangeRequests)
    .where(eq(projectChangeRequests.id, id))
    .limit(1);
  return row ?? null;
}

export async function createChangeRequest(
  projectId: string,
  values: { body: string; status: ChangeStatus },
) {
  const db = getDb();
  const [row] = await db
    .insert(projectChangeRequests)
    .values({ projectId, ...values })
    .returning({ id: projectChangeRequests.id });
  if (!row) {
    throw new Error("Could not create change request");
  }
  return row.id;
}

export async function updateChangeRequest(
  id: string,
  values: { body: string; status: ChangeStatus },
) {
  const db = getDb();
  await db
    .update(projectChangeRequests)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(projectChangeRequests.id, id));
}

export async function deleteChangeRequest(id: string) {
  const db = getDb();
  await db.delete(projectChangeRequests).where(eq(projectChangeRequests.id, id));
}

export async function listDemos(projectId: string) {
  const db = getDb();
  return db
    .select()
    .from(projectDemos)
    .where(eq(projectDemos.projectId, projectId))
    .orderBy(desc(projectDemos.createdAt));
}

export async function getDemo(id: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(projectDemos)
    .where(eq(projectDemos.id, id))
    .limit(1);
  return row ?? null;
}

export async function createDemo(
  projectId: string,
  values: { happenedAt: string | null; notes: string },
) {
  const db = getDb();
  const [row] = await db
    .insert(projectDemos)
    .values({ projectId, ...values })
    .returning({ id: projectDemos.id });
  if (!row) {
    throw new Error("Could not create demo");
  }
  return row.id;
}

export async function updateDemo(
  id: string,
  values: { happenedAt: string | null; notes: string },
) {
  const db = getDb();
  await db
    .update(projectDemos)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(projectDemos.id, id));
}

export async function deleteDemo(id: string) {
  const db = getDb();
  await db.delete(projectDemos).where(eq(projectDemos.id, id));
}

export async function listProjectEvents(projectId: string) {
  const db = getDb();
  return db
    .select()
    .from(projectEvents)
    .where(eq(projectEvents.projectId, projectId))
    .orderBy(desc(projectEvents.startsAt), desc(projectEvents.createdAt));
}

export async function listDeskScheduleEvents() {
  const db = getDb();
  return db
    .select({
      id: projectEvents.id,
      projectId: projectEvents.projectId,
      kind: projectEvents.kind,
      title: projectEvents.title,
      status: projectEvents.status,
      startsAt: projectEvents.startsAt,
      endsAt: projectEvents.endsAt,
      location: projectEvents.location,
      notes: projectEvents.notes,
      createdByKind: projectEvents.createdByKind,
      createdAt: projectEvents.createdAt,
      projectTitle: projects.title,
      clientId: clients.id,
      clientName: clients.name,
    })
    .from(projectEvents)
    .innerJoin(projects, eq(projects.id, projectEvents.projectId))
    .innerJoin(clients, eq(clients.id, projects.clientId))
    .where(eq(projects.workKind, "client"))
    .orderBy(asc(projectEvents.startsAt), desc(projectEvents.createdAt));
}

/** Open events for Today: client requests + items starting in the next N days. */
export async function listUpcomingDeskScheduleEvents(withinDays = 7) {
  const db = getDb();
  const now = new Date();
  const until = new Date(now.getTime() + withinDays * 24 * 60 * 60 * 1000);
  return db
    .select({
      id: projectEvents.id,
      projectId: projectEvents.projectId,
      kind: projectEvents.kind,
      title: projectEvents.title,
      status: projectEvents.status,
      startsAt: projectEvents.startsAt,
      endsAt: projectEvents.endsAt,
      projectTitle: projects.title,
      clientId: clients.id,
      clientName: clients.name,
    })
    .from(projectEvents)
    .innerJoin(projects, eq(projects.id, projectEvents.projectId))
    .innerJoin(clients, eq(clients.id, projects.clientId))
    .where(
      and(
        eq(projects.workKind, "client"),
        inArray(projectEvents.status, ["requested", "proposed", "confirmed"]),
        or(
          eq(projectEvents.status, "requested"),
          and(
            gte(projectEvents.startsAt, now),
            lte(projectEvents.startsAt, until),
          ),
          and(
            isNull(projectEvents.startsAt),
            inArray(projectEvents.status, ["proposed", "confirmed"]),
          ),
        ),
      ),
    )
    .orderBy(asc(projectEvents.startsAt), desc(projectEvents.createdAt))
    .limit(8);
}

export async function listPortalScheduleEventsForClient(clientId: string) {
  const db = getDb();
  return db
    .select({
      id: projectEvents.id,
      projectId: projectEvents.projectId,
      kind: projectEvents.kind,
      title: projectEvents.title,
      status: projectEvents.status,
      startsAt: projectEvents.startsAt,
      endsAt: projectEvents.endsAt,
      location: projectEvents.location,
      notes: projectEvents.notes,
      createdAt: projectEvents.createdAt,
      projectTitle: projects.title,
    })
    .from(projectEvents)
    .innerJoin(projects, eq(projects.id, projectEvents.projectId))
    .where(
      and(eq(projects.clientId, clientId), eq(projects.workKind, "client")),
    )
    .orderBy(asc(projectEvents.startsAt), desc(projectEvents.createdAt));
}

export async function getProjectEvent(id: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(projectEvents)
    .where(eq(projectEvents.id, id))
    .limit(1);
  return row ?? null;
}

export async function createProjectEvent(
  projectId: string,
  values: {
    kind: ProjectEventKind;
    title: string;
    status: ProjectEventStatus;
    startsAt: Date | null;
    endsAt: Date | null;
    location: string | null;
    notes: string | null;
    createdByKind: ProjectEventActor;
    personId?: string | null;
  },
) {
  const db = getDb();
  const [row] = await db
    .insert(projectEvents)
    .values({
      projectId,
      kind: values.kind,
      title: values.title,
      status: values.status,
      startsAt: values.startsAt,
      endsAt: values.endsAt,
      location: values.location,
      notes: values.notes,
      createdByKind: values.createdByKind,
      personId: values.personId ?? null,
      confirmedAt: values.status === "confirmed" ? new Date() : null,
      cancelledAt: values.status === "cancelled" ? new Date() : null,
    })
    .returning({ id: projectEvents.id });
  if (!row) {
    throw new Error("Could not create project event");
  }
  return row.id;
}

export async function updateProjectEvent(
  id: string,
  values: {
    kind: ProjectEventKind;
    title: string;
    status: ProjectEventStatus;
    startsAt: Date | null;
    endsAt: Date | null;
    location: string | null;
    notes: string | null;
  },
) {
  const db = getDb();
  const existing = await getProjectEvent(id);
  if (!existing) {
    return;
  }

  const confirmedAt =
    values.status === "confirmed"
      ? (existing.confirmedAt ?? new Date())
      : null;
  const cancelledAt =
    values.status === "cancelled"
      ? (existing.cancelledAt ?? new Date())
      : null;

  await db
    .update(projectEvents)
    .set({
      ...values,
      confirmedAt,
      cancelledAt,
      updatedAt: new Date(),
    })
    .where(eq(projectEvents.id, id));
}

export async function setProjectEventStatus(
  id: string,
  status: ProjectEventStatus,
) {
  const db = getDb();
  const existing = await getProjectEvent(id);
  if (!existing) {
    return;
  }

  await db
    .update(projectEvents)
    .set({
      status,
      confirmedAt:
        status === "confirmed" ? (existing.confirmedAt ?? new Date()) : null,
      cancelledAt:
        status === "cancelled" ? (existing.cancelledAt ?? new Date()) : null,
      updatedAt: new Date(),
    })
    .where(eq(projectEvents.id, id));
}

export async function deleteProjectEvent(id: string) {
  const db = getDb();
  await db.delete(projectEvents).where(eq(projectEvents.id, id));
}

export async function getLaunch(projectId: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(projectLaunch)
    .where(eq(projectLaunch.projectId, projectId))
    .limit(1);
  return row ?? null;
}

export async function upsertLaunch(
  projectId: string,
  values: {
    trained: boolean;
    guideLeft: boolean;
    remainingInvoiced: boolean;
    maintenanceOffered: boolean;
    handoverNote: string | null;
  },
) {
  const db = getDb();
  const existing = await getLaunch(projectId);
  if (existing) {
    await db
      .update(projectLaunch)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(projectLaunch.projectId, projectId));
    return;
  }
  await db.insert(projectLaunch).values({ projectId, ...values });
}

export async function getProjectGateWork(projectId: string) {
  const [qualify, intake, discovery, agreement, changes, demos, launch] =
    await Promise.all([
      getQualify(projectId),
      ensureIntakeAnswers(projectId),
      getDiscovery(projectId),
      getAgreement(projectId),
      listChangeRequests(projectId),
      listDemos(projectId),
      getLaunch(projectId),
    ]);

  return { qualify, intake, discovery, agreement, changes, demos, launch };
}

export async function addAuditEvent(values: {
  actorEmail: string | null;
  action: string;
  summary: string;
  entityType: string | null;
  entityId: string | null;
  projectId: string | null;
  before?: unknown;
  after?: unknown;
  reason?: string | null;
}) {
  const db = getDb();
  await db.insert(auditEvents).values(values);
}

export async function getAuditEvent(id: string) {
  const db = getDb();
  const [row] = await db
    .select({
      id: auditEvents.id,
      createdAt: auditEvents.createdAt,
      actorEmail: auditEvents.actorEmail,
      action: auditEvents.action,
      summary: auditEvents.summary,
      before: auditEvents.before,
      after: auditEvents.after,
      reason: auditEvents.reason,
      entityType: auditEvents.entityType,
      entityId: auditEvents.entityId,
      projectId: auditEvents.projectId,
      projectTitle: projects.title,
    })
    .from(auditEvents)
    .leftJoin(projects, eq(auditEvents.projectId, projects.id))
    .where(eq(auditEvents.id, id))
    .limit(1);
  return row ?? null;
}

export async function listAuditEvents(limit = 200) {
  const db = getDb();
  return db
    .select({
      id: auditEvents.id,
      createdAt: auditEvents.createdAt,
      actorEmail: auditEvents.actorEmail,
      action: auditEvents.action,
      summary: auditEvents.summary,
      entityType: auditEvents.entityType,
      entityId: auditEvents.entityId,
      projectId: auditEvents.projectId,
      projectTitle: projects.title,
    })
    .from(auditEvents)
    .leftJoin(projects, eq(auditEvents.projectId, projects.id))
    .orderBy(desc(auditEvents.createdAt))
    .limit(limit);
}

export async function exportDesk() {
  const db = getDb();
  const [
    userRows,
    clientRows,
    personRows,
    projectRows,
    noteRows,
    optionRows,
    activityRows,
    qualifyRows,
    intakeRows,
    discoveryRows,
    agreementRows,
    changeRows,
    demoRows,
    launchRows,
    auditRows,
  ] = await Promise.all([
    db.select().from(users),
    db.select().from(clients).orderBy(clients.name),
    db.select().from(people).orderBy(people.name),
    db.select().from(projects).orderBy(projects.title),
    db.select().from(projectNotes).orderBy(desc(projectNotes.createdAt)),
    db.select().from(projectOptions),
    db.select().from(activities).orderBy(desc(activities.createdAt)),
    db.select().from(projectQualify),
    db.select().from(projectIntakeAnswers),
    db.select().from(projectDiscovery),
    db.select().from(projectAgreements),
    db.select().from(projectChangeRequests).orderBy(desc(projectChangeRequests.createdAt)),
    db.select().from(projectDemos).orderBy(desc(projectDemos.createdAt)),
    db.select().from(projectLaunch),
    db.select().from(auditEvents).orderBy(desc(auditEvents.createdAt)),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    users: userRows.map((row) => ({
      id: row.id,
      email: row.email,
      name: row.name,
      title: row.title,
      phone: row.phone,
      imageUrl: row.imageUrl,
      role: row.role,
      active: row.active,
      totpEnabled: row.totpEnabled,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })),
    clients: clientRows,
    people: personRows,
    projects: projectRows,
    notes: noteRows,
    options: optionRows,
    activities: activityRows,
    qualify: qualifyRows,
    intake: intakeRows,
    discovery: discoveryRows,
    agreements: agreementRows,
    changes: changeRows,
    demos: demoRows,
    launch: launchRows,
    audit: auditRows,
  };
}

export async function setPersonPortalEnabled(id: string, portalEnabled: boolean) {
  const db = getDb();
  await db
    .update(people)
    .set({ portalEnabled, updatedAt: new Date() })
    .where(eq(people.id, id));
}

export async function setProjectPortalIntakeOpen(
  id: string,
  portalIntakeOpen: boolean,
) {
  const db = getDb();
  await db
    .update(projects)
    .set({ portalIntakeOpen, updatedAt: new Date() })
    .where(eq(projects.id, id));
}

export async function findPortalPersonByEmail(email: string) {
  const db = getDb();
  const normalized = email.trim().toLowerCase();
  const [row] = await db
    .select({
      person: people,
      client: clients,
    })
    .from(people)
    .innerJoin(clients, eq(people.clientId, clients.id))
    .where(
      and(
        eq(people.portalEnabled, true),
        eq(clients.kind, "client"),
        sql`lower(${people.email}) = ${normalized}`,
      ),
    )
    .limit(1);
  return row ?? null;
}

export async function findClientPersonByEmail(email: string) {
  const db = getDb();
  const normalized = email.trim().toLowerCase();
  const [row] = await db
    .select({
      person: people,
      client: clients,
    })
    .from(people)
    .innerJoin(clients, eq(people.clientId, clients.id))
    .where(
      and(eq(clients.kind, "client"), sql`lower(${people.email}) = ${normalized}`),
    )
    .limit(1);
  return row ?? null;
}

export async function getPortalPerson(id: string) {
  const db = getDb();
  const [row] = await db
    .select({
      person: people,
      client: clients,
    })
    .from(people)
    .innerJoin(clients, eq(people.clientId, clients.id))
    .where(and(eq(people.id, id), eq(clients.kind, "client")))
    .limit(1);
  return row ?? null;
}

export async function createPortalMagicLink(values: {
  personId: string;
  tokenHash: string;
  expiresAt: Date;
}) {
  const db = getDb();
  const [row] = await db
    .insert(portalMagicLinks)
    .values(values)
    .returning({ id: portalMagicLinks.id });
  if (!row) {
    throw new Error("Could not create magic link");
  }
  return row.id;
}

export async function getPortalMagicLinkByHash(tokenHash: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(portalMagicLinks)
    .where(eq(portalMagicLinks.tokenHash, tokenHash))
    .limit(1);
  return row ?? null;
}

export async function markPortalMagicLinkUsed(id: string) {
  const db = getDb();
  await db
    .update(portalMagicLinks)
    .set({ usedAt: new Date() })
    .where(eq(portalMagicLinks.id, id));
}

export async function createPortalSessionRow(values: {
  personId: string;
  expiresAt: Date;
  userAgent: string | null;
  ip: string | null;
}) {
  const db = getDb();
  const [row] = await db.insert(portalSessions).values(values).returning({
    id: portalSessions.id,
  });
  if (!row) {
    throw new Error("Could not create portal session");
  }
  return row.id;
}

export async function getPortalSessionRow(id: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(portalSessions)
    .where(eq(portalSessions.id, id))
    .limit(1);
  return row ?? null;
}

export async function deletePortalSession(id: string) {
  const db = getDb();
  await db.delete(portalSessions).where(eq(portalSessions.id, id));
}

export async function listPortalProjectsForClient(clientId: string) {
  const db = getDb();
  return db
    .select()
    .from(projects)
    .where(
      and(eq(projects.clientId, clientId), eq(projects.workKind, "client")),
    )
    .orderBy(desc(projects.updatedAt));
}

export async function getPortalProjectForPerson(
  projectId: string,
  clientId: string,
) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(projects)
    .where(
      and(
        eq(projects.id, projectId),
        eq(projects.clientId, clientId),
        eq(projects.workKind, "client"),
      ),
    )
    .limit(1);
  return row ?? null;
}

export async function listClientVisibleNotes(projectId: string) {
  const db = getDb();
  return db
    .select()
    .from(projectNotes)
    .where(
      and(
        eq(projectNotes.projectId, projectId),
        eq(projectNotes.clientVisible, true),
      ),
    )
    .orderBy(desc(projectNotes.createdAt));
}

export async function getSelectedOption(projectId: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(projectOptions)
    .where(
      and(
        eq(projectOptions.projectId, projectId),
        eq(projectOptions.selected, true),
      ),
    )
    .limit(1);
  return row ?? null;
}

export async function listPortalMessages(projectId: string) {
  const db = getDb();
  return db
    .select({
      id: portalMessages.id,
      projectId: portalMessages.projectId,
      personId: portalMessages.personId,
      authorKind: portalMessages.authorKind,
      body: portalMessages.body,
      createdAt: portalMessages.createdAt,
      authorName: people.name,
    })
    .from(portalMessages)
    .leftJoin(people, eq(people.id, portalMessages.personId))
    .where(eq(portalMessages.projectId, projectId))
    .orderBy(portalMessages.createdAt);
}

export async function countPortalMessages(projectId: string) {
  const db = getDb();
  const [row] = await db
    .select({ value: count() })
    .from(portalMessages)
    .where(eq(portalMessages.projectId, projectId));
  return row?.value ?? 0;
}

export async function listPortalConversations() {
  const db = getDb();
  const rows = await db
    .select({
      projectId: projects.id,
      projectTitle: projects.title,
      clientId: clients.id,
      clientName: clients.name,
      lastAt: portalMessages.createdAt,
      lastBody: portalMessages.body,
      lastAuthorKind: portalMessages.authorKind,
    })
    .from(portalMessages)
    .innerJoin(projects, eq(projects.id, portalMessages.projectId))
    .innerJoin(clients, eq(clients.id, projects.clientId))
    .where(eq(projects.workKind, "client"))
    .orderBy(desc(portalMessages.createdAt));

  const counts = new Map<string, number>();
  for (const row of rows) {
    counts.set(row.projectId, (counts.get(row.projectId) ?? 0) + 1);
  }

  const conversations: Array<{
    projectId: string;
    projectTitle: string;
    clientId: string;
    clientName: string;
    lastAt: Date;
    lastBody: string;
    lastAuthorKind: PortalMessageAuthor;
    messageCount: number;
  }> = [];
  const seen = new Set<string>();
  for (const row of rows) {
    if (seen.has(row.projectId)) {
      continue;
    }
    seen.add(row.projectId);
    conversations.push({
      projectId: row.projectId,
      projectTitle: row.projectTitle,
      clientId: row.clientId,
      clientName: row.clientName,
      lastAt: row.lastAt,
      lastBody: row.lastBody,
      lastAuthorKind: row.lastAuthorKind,
      messageCount: counts.get(row.projectId) ?? 0,
    });
  }
  return conversations;
}

export async function addPortalMessage(values: {
  projectId: string;
  personId: string | null;
  authorKind: PortalMessageAuthor;
  body: string;
}) {
  const db = getDb();
  const [row] = await db
    .insert(portalMessages)
    .values(values)
    .returning({ id: portalMessages.id });
  if (!row) {
    throw new Error("Could not create portal message");
  }
  return row.id;
}
