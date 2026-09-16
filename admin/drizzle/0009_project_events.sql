CREATE TYPE "public"."project_event_kind" AS ENUM('call', 'meeting', 'demo', 'other');--> statement-breakpoint
CREATE TYPE "public"."project_event_status" AS ENUM('requested', 'proposed', 'confirmed', 'cancelled', 'completed');--> statement-breakpoint
CREATE TYPE "public"."project_event_actor" AS ENUM('operator', 'client');--> statement-breakpoint
CREATE TABLE "project_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"kind" "project_event_kind" NOT NULL,
	"title" text NOT NULL,
	"status" "project_event_status" DEFAULT 'proposed' NOT NULL,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"location" text,
	"notes" text,
	"created_by_kind" "project_event_actor" NOT NULL,
	"person_id" uuid,
	"confirmed_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
ALTER TABLE "project_events" ADD CONSTRAINT "project_events_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_events" ADD CONSTRAINT "project_events_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "project_events_project_starts_at_idx" ON "project_events" USING btree ("project_id","starts_at");
