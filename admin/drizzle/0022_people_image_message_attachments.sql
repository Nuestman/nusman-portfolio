ALTER TABLE "people" ADD COLUMN IF NOT EXISTS "image_url" text;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "portal_message_attachments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "message_id" uuid NOT NULL REFERENCES "portal_messages"("id") ON DELETE cascade,
  "project_id" uuid NOT NULL REFERENCES "projects"("id") ON DELETE cascade,
  "client_id" uuid NOT NULL REFERENCES "clients"("id") ON DELETE cascade,
  "blob_url" text NOT NULL,
  "blob_pathname" text NOT NULL,
  "original_filename" text NOT NULL,
  "content_type" text NOT NULL,
  "byte_size" integer NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "portal_message_attachments_message_id_idx"
  ON "portal_message_attachments" ("message_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "portal_message_attachments_project_id_idx"
  ON "portal_message_attachments" ("project_id");
