CREATE TYPE "public"."client_kind" AS ENUM('client', 'practice');--> statement-breakpoint
CREATE TYPE "public"."work_kind" AS ENUM('client', 'product');--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "kind" "client_kind" DEFAULT 'client' NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "work_kind" "work_kind" DEFAULT 'client' NOT NULL;--> statement-breakpoint
CREATE INDEX "projects_work_kind_idx" ON "projects" USING btree ("work_kind");
