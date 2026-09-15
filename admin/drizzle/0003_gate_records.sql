CREATE TYPE "public"."qualify_outcome" AS ENUM('undecided', 'real', 'favour', 'no');--> statement-breakpoint
CREATE TYPE "public"."change_status" AS ENUM('parked', 'priced', 'done');--> statement-breakpoint
CREATE TABLE "project_qualify" (
	"project_id" uuid PRIMARY KEY NOT NULL,
	"outcome" "qualify_outcome" DEFAULT 'undecided' NOT NULL,
	"who_for" text,
	"pain_today" text,
	"needed_by" text,
	"call_at" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_intake_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"theme" text NOT NULL,
	"ask" text NOT NULL,
	"answer" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_discovery" (
	"project_id" uuid PRIMARY KEY NOT NULL,
	"call_at" text,
	"attendees" text,
	"current_process" text,
	"last_example" text,
	"in_scope" text,
	"out_of_scope" text,
	"devices_language" text,
	"privacy_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_agreements" (
	"project_id" uuid PRIMARY KEY NOT NULL,
	"parties" text,
	"outcome" text,
	"scope" text,
	"money" text,
	"time" text,
	"changes" text,
	"support" text,
	"workplace" text,
	"deposit_paid" boolean DEFAULT false NOT NULL,
	"confirmed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_change_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"body" text NOT NULL,
	"status" "change_status" DEFAULT 'parked' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_demos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"happened_at" text,
	"notes" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_launch" (
	"project_id" uuid PRIMARY KEY NOT NULL,
	"trained" boolean DEFAULT false NOT NULL,
	"guide_left" boolean DEFAULT false NOT NULL,
	"remaining_invoiced" boolean DEFAULT false NOT NULL,
	"maintenance_offered" boolean DEFAULT false NOT NULL,
	"handover_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "project_qualify" ADD CONSTRAINT "project_qualify_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_intake_answers" ADD CONSTRAINT "project_intake_answers_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_discovery" ADD CONSTRAINT "project_discovery_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_agreements" ADD CONSTRAINT "project_agreements_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_change_requests" ADD CONSTRAINT "project_change_requests_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_demos" ADD CONSTRAINT "project_demos_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_launch" ADD CONSTRAINT "project_launch_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "project_intake_answers_project_theme_idx" ON "project_intake_answers" USING btree ("project_id","theme");--> statement-breakpoint
CREATE INDEX "project_change_requests_project_id_idx" ON "project_change_requests" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_demos_project_id_idx" ON "project_demos" USING btree ("project_id");
