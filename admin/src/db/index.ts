import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

type DeskDb = ReturnType<typeof drizzle<typeof schema>>;

let cached: DeskDb | null = null;

export function databaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export function getDb() {
  if (cached) {
    return cached;
  }

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  cached = drizzle(neon(url), { schema });
  return cached;
}

export type DeskLoad<T> =
  | { kind: "missing" }
  | { kind: "error" }
  | { kind: "ok"; data: T };

export async function loadFromDb<T>(run: () => Promise<T>): Promise<DeskLoad<T>> {
  if (!databaseConfigured()) {
    return { kind: "missing" };
  }

  try {
    return { kind: "ok", data: await run() };
  } catch (error) {
    console.error("Desk database query failed", error);
    return { kind: "error" };
  }
}
