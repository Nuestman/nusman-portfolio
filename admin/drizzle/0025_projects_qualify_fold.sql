-- Fold project_qualify into projects (single brief source of truth).
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "qualify_outcome" "qualify_outcome" DEFAULT 'undecided' NOT NULL;
--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "who_for" text;
--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "call_at" text;
--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "qualify_notes" text;
--> statement-breakpoint
UPDATE "projects" AS p
SET
  "qualify_outcome" = q."outcome",
  "who_for" = q."who_for",
  "call_at" = q."call_at",
  "qualify_notes" = q."notes",
  "problem_sentence" = CASE
    WHEN coalesce(trim(p."problem_sentence"), '') = '' THEN q."pain_today"
    ELSE p."problem_sentence"
  END,
  "deadline_note" = CASE
    WHEN coalesce(trim(p."deadline_note"), '') = '' THEN q."needed_by"
    ELSE p."deadline_note"
  END,
  "budget_note" = CASE
    WHEN coalesce(trim(p."budget_note"), '') = '' THEN q."budget_note"
    ELSE p."budget_note"
  END,
  "updated_at" = now()
FROM "project_qualify" AS q
WHERE q."project_id" = p."id";
--> statement-breakpoint
DROP TABLE IF EXISTS "project_qualify";
