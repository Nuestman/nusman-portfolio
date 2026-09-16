ALTER TYPE "public"."project_gate" ADD VALUE IF NOT EXISTS 'plan';--> statement-breakpoint
ALTER TABLE "project_qualify" ADD COLUMN IF NOT EXISTS "budget_note" text;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "project_milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"key" text NOT NULL,
	"label" text NOT NULL,
	"stage" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"done_at" timestamp with time zone,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "project_milestones" ADD CONSTRAINT "project_milestones_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "project_milestones_project_key_idx" ON "project_milestones" USING btree ("project_id","key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "project_milestones_project_id_idx" ON "project_milestones" USING btree ("project_id");
