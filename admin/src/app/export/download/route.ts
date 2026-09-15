import { NextResponse } from "next/server";
import { getSessionEmail } from "@/lib/auth";
import { recordAuditSafe } from "@/lib/audit";
import { databaseConfigured } from "@/db";
import { exportDesk } from "@/db/queries";
import {
  exportContentType,
  exportFileName,
  isExportFormat,
  renderExport,
  type ExportFormat,
} from "@/lib/export-formats";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const email = await getSessionEmail();
  if (!email) {
    const login = new URL("/login", request.url);
    login.searchParams.set("from", "/export");
    return NextResponse.redirect(login);
  }

  if (!databaseConfigured()) {
    return NextResponse.json(
      { error: "Database is not linked." },
      { status: 503 },
    );
  }

  const requested = new URL(request.url).searchParams.get("format") ?? "json";
  if (!isExportFormat(requested)) {
    return NextResponse.json({ error: "Unknown format." }, { status: 400 });
  }
  const format: ExportFormat = requested;

  try {
    const payload = await exportDesk();
    await recordAuditSafe({
      action: "export.download",
      summary: `Downloaded ${format} export.`,
      entityType: "export",
      actorEmail: email,
      after: { format },
    });
    const day = payload.exportedAt.slice(0, 10);
    const rendered = renderExport(payload, format);
    const body = typeof rendered === "string" ? rendered : Buffer.from(rendered);
    return new NextResponse(body, {
      headers: {
        "Content-Type": exportContentType(format),
        "Content-Disposition": `attachment; filename="${exportFileName(format, day)}"`,
      },
    });
  } catch (error) {
    console.error("Desk export failed", error);
    return NextResponse.json({ error: "Could not export." }, { status: 500 });
  }
}
