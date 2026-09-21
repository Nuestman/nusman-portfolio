CREATE TABLE IF NOT EXISTS "inbound_lead_drafts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"phone" text,
	"organisation" text,
	"source" "client_source" NOT NULL,
	"source_other" text,
	"verify_token_hash" text NOT NULL,
	"resume_token_hash" text,
	"verified_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"project_id" uuid,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "inbound_lead_drafts" ADD CONSTRAINT "inbound_lead_drafts_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "inbound_lead_drafts_verify_token_hash_uidx" ON "inbound_lead_drafts" USING btree ("verify_token_hash");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "inbound_lead_drafts_resume_token_hash_uidx" ON "inbound_lead_drafts" USING btree ("resume_token_hash");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "inbound_lead_drafts_email_idx" ON "inbound_lead_drafts" USING btree ("email");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "inbound_lead_drafts_expires_at_idx" ON "inbound_lead_drafts" USING btree ("expires_at");
