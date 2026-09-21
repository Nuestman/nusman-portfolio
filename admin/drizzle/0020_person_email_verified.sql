ALTER TABLE "people" ADD COLUMN IF NOT EXISTS "email_verified_at" timestamptz;
--> statement-breakpoint
ALTER TABLE "people" ADD COLUMN IF NOT EXISTS "email_verify_token_hash" text;
--> statement-breakpoint
ALTER TABLE "people" ADD COLUMN IF NOT EXISTS "email_verify_expires_at" timestamptz;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "people_email_verify_token_hash_uidx"
  ON "people" ("email_verify_token_hash")
  WHERE "email_verify_token_hash" IS NOT NULL;
--> statement-breakpoint
UPDATE "people" AS p
SET "email_verified_at" = COALESCE(d."verified_at", d."completed_at", now())
FROM "inbound_lead_drafts" AS d
WHERE p."email" IS NOT NULL
  AND lower(p."email") = lower(d."email")
  AND (d."verified_at" IS NOT NULL OR d."completed_at" IS NOT NULL)
  AND p."email_verified_at" IS NULL;
