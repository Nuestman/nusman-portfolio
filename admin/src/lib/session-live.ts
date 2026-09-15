import { neon } from "@neondatabase/serverless";
import { isUuid } from "@/lib/ids";

export async function sessionIsLive(sessionId: string): Promise<boolean> {
  if (!isUuid(sessionId)) {
    return false;
  }

  const url = process.env.DATABASE_URL;
  if (!url) {
    return false;
  }

  const sql = neon(url);
  const rows = await sql`
    SELECT 1
    FROM sessions
    WHERE id = ${sessionId}::uuid
      AND expires_at > now()
    LIMIT 1
  `;
  return rows.length > 0;
}
