import { revalidatePath } from "next/cache";
import { getSessionEmail } from "@/lib/auth";
import { addAuditEvent } from "@/db/queries";
import { readOptional, readTrimmed } from "@/lib/forms";

export type JsonValue = Record<string, unknown> | unknown[] | string | number | boolean | null;

export type AuditInput = {
  action: string;
  summary: string;
  entityType?: string | null;
  entityId?: string | null;
  projectId?: string | null;
  actorEmail?: string | null;
  before?: unknown;
  after?: unknown;
  reason?: string | null;
};

export function auditSnapshot(value: unknown): JsonValue | null {
  if (value == null) {
    return null;
  }

  const raw: unknown = JSON.parse(
    JSON.stringify(value, (_key, item: unknown) => {
      if (item instanceof Date) {
        return item.toISOString();
      }
      return item;
    }),
  );

  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const copy = { ...(raw as Record<string, unknown>) };
    delete copy.createdAt;
    delete copy.updatedAt;
    return copy;
  }

  return raw as JsonValue;
}

export function deleteWasConfirmed(formData: FormData): boolean {
  return formData.get("confirmed") === "on";
}

export function typedNameMatches(formData: FormData, expected: string): boolean {
  return readTrimmed(formData, "confirmName") === expected.trim();
}

export function readDeleteReason(formData: FormData): string | null {
  return readOptional(formData, "reason");
}

export async function recordAudit(input: AuditInput): Promise<void> {
  const actorEmail = input.actorEmail ?? (await getSessionEmail());
  await addAuditEvent({
    actorEmail,
    action: input.action,
    summary: input.summary,
    entityType: input.entityType ?? null,
    entityId: input.entityId ?? null,
    projectId: input.projectId ?? null,
    before: auditSnapshot(input.before ?? null),
    after: auditSnapshot(input.after ?? null),
    reason: input.reason ?? null,
  });
  revalidatePath("/audit");
}

export async function recordAuditSafe(input: AuditInput): Promise<void> {
  try {
    await recordAudit(input);
  } catch (error) {
    console.error("Desk audit write failed", error);
  }
}
