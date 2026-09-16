-- Separate from 0010 so the new enum value `plan` is committed before use.
UPDATE "projects" SET "current_gate" = 'discover' WHERE "current_gate" = 'intake';--> statement-breakpoint
UPDATE "projects" SET "current_gate" = 'plan' WHERE "current_gate" IN ('propose', 'agree');
