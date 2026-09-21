ALTER TABLE "inbound_lead_drafts" ADD COLUMN IF NOT EXISTS "problem" text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE "inbound_lead_drafts" ADD COLUMN IF NOT EXISTS "want_built" text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE "inbound_lead_drafts" ADD COLUMN IF NOT EXISTS "who_for" text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE "inbound_lead_drafts" ADD COLUMN IF NOT EXISTS "success_looks_like" text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE "inbound_lead_drafts" ADD COLUMN IF NOT EXISTS "timeline" text;
--> statement-breakpoint
ALTER TABLE "inbound_lead_drafts" ADD COLUMN IF NOT EXISTS "budget" text;
--> statement-breakpoint
DROP INDEX IF EXISTS "inbound_lead_drafts_resume_token_hash_uidx";
--> statement-breakpoint
ALTER TABLE "inbound_lead_drafts" DROP COLUMN IF EXISTS "resume_token_hash";
