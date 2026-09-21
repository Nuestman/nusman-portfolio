ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "want_built" text;
--> statement-breakpoint
UPDATE "projects" AS p
SET "want_built" = d."want_built"
FROM "inbound_lead_drafts" AS d
WHERE d."project_id" = p."id"
  AND coalesce(trim(d."want_built"), '') <> ''
  AND coalesce(trim(p."want_built"), '') = '';
--> statement-breakpoint
UPDATE "projects" AS p
SET "want_built" = trim(both E' \n\t' from split_part(split_part(n."body", 'Want built:', 2), E'\nWho for:', 1))
FROM (
  SELECT DISTINCT ON ("project_id")
    "project_id",
    "body"
  FROM "project_notes"
  WHERE "body" LIKE '%Want built:%'
  ORDER BY "project_id", "created_at" ASC
) AS n
WHERE n."project_id" = p."id"
  AND coalesce(trim(p."want_built"), '') = ''
  AND coalesce(trim(split_part(split_part(n."body", 'Want built:', 2), E'\nWho for:', 1)), '') <> '';
