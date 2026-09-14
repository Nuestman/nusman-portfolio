import { and, count, desc, eq, type SQL } from "drizzle-orm";
import { getDb } from "./index";
import {
  OPTION_KINDS,
  clients,
  people,
  projectNotes,
  projectOptions,
  projects,
  users,
} from "./schema";
import type {
  ClientSource,
  OptionKind,
  PersonRole,
  ProjectGate,
  ProjectStatus,
} from "./schema";

export async function countProjects() {
  const db = getDb();
  const [row] = await db.select({ value: count() }).from(projects);
  return row?.value ?? 0;
}

export async function countClients() {
  const db = getDb();
  const [row] = await db.select({ value: count() }).from(clients);
  return row?.value ?? 0;
}

export async function getOperator() {
  const db = getDb();
  const [operator] = await db.select().from(users).limit(1);
  return operator ?? null;
}

export async function listClients() {
  const db = getDb();
  return db.select().from(clients).orderBy(desc(clients.updatedAt));
}

export async function getClient(id: string) {
  const db = getDb();
  const [row] = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
  return row ?? null;
}

export async function createClient(values: {
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
    .orderBy(people.createdAt);
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
}) {
  const db = getDb();
  const conditions: SQL[] = [];
  if (filters?.gate) {
    conditions.push(eq(projects.currentGate, filters.gate));
  }
  if (filters?.status) {
    conditions.push(eq(projects.status, filters.status));
  }

  const query = db
    .select({
      id: projects.id,
      title: projects.title,
      currentGate: projects.currentGate,
      status: projects.status,
      clientId: projects.clientId,
      clientName: clients.name,
      updatedAt: projects.updatedAt,
    })
    .from(projects)
    .innerJoin(clients, eq(projects.clientId, clients.id));

  const filtered =
    conditions.length === 0 ? query : query.where(and(...conditions));
  return filtered.orderBy(desc(projects.updatedAt));
}

export async function listActiveProjects() {
  return listProjects({ status: "active" });
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
}) {
  const db = getDb();
  const [row] = await db
    .insert(projects)
    .values({
      ...values,
      currentGate: "qualify",
      status: "active",
    })
    .returning({ id: projects.id });
  if (!row) {
    throw new Error("Could not create project");
  }
  return row.id;
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

export async function listNotes(projectId: string) {
  const db = getDb();
  return db
    .select()
    .from(projectNotes)
    .where(eq(projectNotes.projectId, projectId))
    .orderBy(desc(projectNotes.createdAt));
}

export async function addNote(projectId: string, body: string) {
  const db = getDb();
  await db.insert(projectNotes).values({ projectId, body });
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
