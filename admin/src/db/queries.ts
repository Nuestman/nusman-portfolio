import { count, desc, eq } from "drizzle-orm";
import { getDb } from "./index";
import { clients, people, projects, users } from "./schema";
import type { ClientSource, PersonRole } from "./schema";

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
