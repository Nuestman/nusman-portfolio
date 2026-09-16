import { neon } from "@neondatabase/serverless";
import { isUuid } from "@/lib/ids";

export async function portalSessionIsLive(sessionId: string): Promise<boolean> {
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
    FROM portal_sessions AS s
    INNER JOIN people AS p ON p.id = s.person_id
    WHERE s.id = ${sessionId}::uuid
      AND s.expires_at > now()
      AND p.portal_enabled = true
    LIMIT 1
  `;
  return rows.length > 0;
}
