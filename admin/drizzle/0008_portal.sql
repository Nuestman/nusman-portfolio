CREATE TYPE "public"."portal_message_author" AS ENUM('client', 'operator');--> statement-breakpoint
ALTER TABLE "people" ADD COLUMN "portal_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "portal_intake_open" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "project_notes" ADD COLUMN "client_visible" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE TABLE "portal_magic_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"person_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "portal_magic_links_token_hash_unique" UNIQUE("token_hash")
);--> statement-breakpoint
CREATE TABLE "portal_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"person_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"user_agent" text,
	"ip" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE "portal_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"person_id" uuid,
	"author_kind" "portal_message_author" NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
ALTER TABLE "portal_magic_links" ADD CONSTRAINT "portal_magic_links_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portal_sessions" ADD CONSTRAINT "portal_sessions_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portal_messages" ADD CONSTRAINT "portal_messages_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portal_messages" ADD CONSTRAINT "portal_messages_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "portal_magic_links_person_id_idx" ON "portal_magic_links" USING btree ("person_id");--> statement-breakpoint
CREATE INDEX "portal_sessions_person_id_idx" ON "portal_sessions" USING btree ("person_id");--> statement-breakpoint
CREATE INDEX "portal_sessions_expires_at_idx" ON "portal_sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "portal_messages_project_id_idx" ON "portal_messages" USING btree ("project_id");
