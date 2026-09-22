import { writeFileSync } from "fs";
import { LEGAL_SEED_DOCS } from "../src/lib/legal-seed-data";

function dollarQuote(tag: string, value: string): string {
  let t = tag;
  while (value.includes(`$${t}$`)) {
    t = `${tag}_x`;
  }
  return `$${t}$${value}$${t}$`;
}

const lines: string[] = [];
lines.push('CREATE TABLE IF NOT EXISTS "site_legal_documents" (');
lines.push('  "slug" text PRIMARY KEY,');
lines.push('  "title" text NOT NULL,');
lines.push('  "last_updated" text NOT NULL,');
lines.push('  "intro" text NOT NULL,');
lines.push('  "sections" jsonb NOT NULL,');
lines.push(
  '  "updated_by_user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,',
);
lines.push('  "updated_at" timestamptz NOT NULL DEFAULT now()');
lines.push(");");

for (const doc of LEGAL_SEED_DOCS) {
  lines.push("--> statement-breakpoint");
  const sectionsJson = JSON.stringify(doc.sections);
  lines.push(
    'INSERT INTO "site_legal_documents" ("slug", "title", "last_updated", "intro", "sections")',
  );
  lines.push("VALUES (");
  lines.push(`  ${dollarQuote("slug", doc.slug)},`);
  lines.push(`  ${dollarQuote("title", doc.title)},`);
  lines.push(`  ${dollarQuote("upd", doc.lastUpdated)},`);
  lines.push(`  ${dollarQuote("intro", doc.intro)},`);
  lines.push(`  ${dollarQuote("sec", sectionsJson)}::jsonb`);
  lines.push(")");
  lines.push('ON CONFLICT ("slug") DO NOTHING;');
}

writeFileSync(
  new URL("../drizzle/0021_site_legal_documents.sql", import.meta.url),
  `${lines.join("\n")}\n`,
);
console.log("wrote 0021_site_legal_documents.sql");
