CREATE TYPE "public"."client_source" AS ENUM('referral', 'inbound', 'repeat', 'other');--> statement-breakpoint
CREATE TYPE "public"."option_kind" AS ENUM('light', 'recommended', 'later');--> statement-breakpoint
CREATE TYPE "public"."person_role" AS ENUM('buyer', 'user', 'other');--> statement-breakpoint
CREATE TYPE "public"."project_gate" AS ENUM('qualify', 'intake', 'discover', 'propose', 'agree', 'build', 'launch');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('active', 'paused', 'won', 'lost', 'done');--> statement-breakpoint
CREATE TABLE "clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"organisation" text,
	"source" "client_source",
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "people" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"role" "person_role" NOT NULL,
	"is_decision_maker" boolean DEFAULT false NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"kind" "option_kind" NOT NULL,
	"summary" text NOT NULL,
	"price_note" text,
	"timeline_note" text,
	"in_scope" text,
	"out_of_scope" text,
	"selected" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"title" text NOT NULL,
	"problem_sentence" text,
	"success_looks_like" text,
	"current_gate" "project_gate" DEFAULT 'qualify' NOT NULL,
	"status" "project_status" DEFAULT 'active' NOT NULL,
	"budget_note" text,
	"deadline_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "people" ADD CONSTRAINT "people_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_notes" ADD CONSTRAINT "project_notes_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_options" ADD CONSTRAINT "project_options_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "people_client_id_idx" ON "people" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "project_notes_project_id_idx" ON "project_notes" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_options_project_id_idx" ON "project_options" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "projects_client_id_idx" ON "projects" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "projects_current_gate_idx" ON "projects" USING btree ("current_gate");--> statement-breakpoint
CREATE INDEX "projects_status_idx" ON "projects" USING btree ("status");