import Link from "next/link";
import { getSessionEmail } from "@/lib/auth";
import { DeskShell } from "@/components/desk-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonClassName } from "@/components/ui/button";
import { EXPORT_FORMATS, exportFormatLabel } from "@/lib/export-formats";
import { linkClassName } from "@/lib/links";

export const dynamic = "force-dynamic";

export default async function ExportPage() {
  const email = await getSessionEmail();

  return (
    <DeskShell email={email} width="3xl">
        <div>
          <h1 className="section-heading">Export</h1>
          <p className="mt-2 text-gray-700">
            A copy of operators, clients, people, projects, notes, options,
            journal, gate records, and audit. Passwords, photos, device rows,
            and env secrets are not included.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Download</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Keep a file off this laptop after a real job starts. Neon automatic
              snapshots are not enabled on this project plan. CSV is a zip of one
              spreadsheet per table. HTML can be printed to PDF.
            </p>
            <div className="flex flex-wrap gap-3">
              {EXPORT_FORMATS.map((format) => (
                <a
                  key={format}
                  href={`/export/download?format=${format}`}
                  className={buttonClassName(
                    format === "json" ? "default" : "outline",
                  )}
                >
                  {exportFormatLabel(format)}
                </a>
              ))}
            </div>
            <p>
              <Link href="/" className={linkClassName("back")}>
                ← Today
              </Link>
            </p>
          </CardContent>
        </Card>
    </DeskShell>
  );
}
