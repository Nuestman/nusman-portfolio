ALTER TABLE "audit_events" ADD COLUMN "before" jsonb;--> statement-breakpoint
ALTER TABLE "audit_events" ADD COLUMN "after" jsonb;--> statement-breakpoint
ALTER TABLE "audit_events" ADD COLUMN "reason" text;
