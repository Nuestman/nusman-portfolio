import { count } from "drizzle-orm";
import { getDb } from "./index";
import { projects, users } from "./schema";

export async function countProjects() {
  const db = getDb();
  const [row] = await db.select({ value: count() }).from(projects);
  return row?.value ?? 0;
}

export async function getOperator() {
  const db = getDb();
  const [operator] = await db.select().from(users).limit(1);
  return operator ?? null;
}
