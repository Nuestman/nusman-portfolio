-- Keep the newest open draft per email so the unique index can apply.
WITH ranked AS (
  SELECT
    id,
    row_number() OVER (PARTITION BY email ORDER BY created_at DESC) AS rn
  FROM inbound_lead_drafts
  WHERE completed_at IS NULL
)
UPDATE inbound_lead_drafts AS d
SET completed_at = now(), updated_at = now()
FROM ranked
WHERE d.id = ranked.id AND ranked.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS "inbound_lead_drafts_email_open_uidx" ON "inbound_lead_drafts" USING btree ("email") WHERE "completed_at" is null;
CREATE INDEX IF NOT EXISTS "inbound_lead_drafts_project_id_idx" ON "inbound_lead_drafts" USING btree ("project_id");
