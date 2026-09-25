import { zipStore } from "@/lib/zip";

export const EXPORT_FORMATS = ["json", "yaml", "csv", "md", "html"] as const;
export type ExportFormat = (typeof EXPORT_FORMATS)[number];

export type DeskExport = {
  exportedAt: string;
  users: unknown[];
  clients: unknown[];
  people: unknown[];
  projects: unknown[];
  notes: unknown[];
  options: unknown[];
  activities: unknown[];
  intake: unknown[];
  discovery: unknown[];
  agreements: unknown[];
  changes: unknown[];
  demos: unknown[];
  launch: unknown[];
  audit: unknown[];
};

const TABLES = [
  { key: "users", file: "users.csv", heading: "Operators" },
  { key: "clients", file: "clients.csv", heading: "Clients" },
  { key: "people", file: "people.csv", heading: "People" },
  { key: "projects", file: "projects.csv", heading: "Projects" },
  { key: "notes", file: "notes.csv", heading: "Timeline notes" },
  { key: "options", file: "options.csv", heading: "Options" },
  { key: "activities", file: "journal.csv", heading: "Journal" },
  { key: "intake", file: "intake.csv", heading: "Intake answers" },
  { key: "discovery", file: "discovery.csv", heading: "Discovery" },
  { key: "agreements", file: "agreements.csv", heading: "Agreements" },
  { key: "changes", file: "changes.csv", heading: "Change requests" },
  { key: "demos", file: "demos.csv", heading: "Demos" },
  { key: "launch", file: "launch.csv", heading: "Launch" },
  { key: "audit", file: "audit.csv", heading: "Audit" },
] as const;

export function isExportFormat(value: string): value is ExportFormat {
  return (EXPORT_FORMATS as readonly string[]).includes(value);
}

export function exportFormatLabel(format: ExportFormat): string {
  switch (format) {
    case "json":
      return "JSON";
    case "yaml":
      return "YAML";
    case "csv":
      return "CSV";
    case "md":
      return "Markdown";
    case "html":
      return "HTML";
    default: {
      const _exhaustive: never = format;
      return _exhaustive;
    }
  }
}

export function exportFileName(format: ExportFormat, day: string): string {
  switch (format) {
    case "json":
      return `desk-export-${day}.json`;
    case "yaml":
      return `desk-export-${day}.yaml`;
    case "csv":
      return `desk-export-${day}.zip`;
    case "md":
      return `desk-export-${day}.md`;
    case "html":
      return `desk-export-${day}.html`;
    default: {
      const _exhaustive: never = format;
      return _exhaustive;
    }
  }
}

export function exportContentType(format: ExportFormat): string {
  switch (format) {
    case "json":
      return "application/json; charset=utf-8";
    case "yaml":
      return "application/yaml; charset=utf-8";
    case "csv":
      return "application/zip";
    case "md":
      return "text/markdown; charset=utf-8";
    case "html":
      return "text/html; charset=utf-8";
    default: {
      const _exhaustive: never = format;
      return _exhaustive;
    }
  }
}

export function jsonSafe<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function renderExport(
  payload: DeskExport,
  format: ExportFormat,
): string | Uint8Array {
  const data = jsonSafe(payload);
  switch (format) {
    case "json":
      return `${JSON.stringify(data, null, 2)}\n`;
    case "yaml":
      return `${toYaml(data)}\n`;
    case "csv":
      return zipStore(
        TABLES.map((table) => ({
          name: table.file,
          body: rowsToCsv(asRows(data[table.key])),
        })),
      );
    case "md":
      return toMarkdown(data);
    case "html":
      return toHtml(data);
    default: {
      const _exhaustive: never = format;
      return _exhaustive;
    }
  }
}

function asRows(value: unknown): Array<Record<string, unknown>> {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter(
    (row): row is Record<string, unknown> =>
      Boolean(row) && typeof row === "object" && !Array.isArray(row),
  );
}

function rowsToCsv(rows: Array<Record<string, unknown>>): string {
  if (rows.length === 0) {
    return "";
  }
  const headers = Object.keys(rows[0] ?? {});
  const lines = [
    headers.map(csvCell).join(","),
    ...rows.map((row) => headers.map((key) => csvCell(row[key])).join(",")),
  ];
  return `${lines.join("\r\n")}\r\n`;
}

function csvCell(value: unknown): string {
  const text =
    value == null
      ? ""
      : typeof value === "object"
        ? JSON.stringify(value)
        : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function toYaml(value: unknown, indent = 0): string {
  const pad = "  ".repeat(indent);
  if (value === null) {
    return "null";
  }
  if (typeof value === "boolean" || typeof value === "number") {
    return String(value);
  }
  if (typeof value === "string") {
    return yamlString(value);
  }
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return "[]";
    }
    return value
      .map((item) => {
        if (item && typeof item === "object" && !Array.isArray(item)) {
          const nested = toYaml(item, indent + 1);
          const lines = nested.split("\n");
          const first = (lines[0] ?? "").replace(/^\s+/, "");
          const head = `${pad}- ${first}`;
          const tail = lines.slice(1).join("\n");
          return tail ? `${head}\n${tail}` : head;
        }
        if (Array.isArray(item)) {
          return `${pad}-\n${toYaml(item, indent + 1)}`;
        }
        return `${pad}- ${toYaml(item, 0)}`;
      })
      .join("\n");
  }
  if (typeof value === "object") {
    const entries = Object.entries(value);
    if (entries.length === 0) {
      return "{}";
    }
    return entries
      .map(([key, nested]) => {
        const rendered = toYaml(nested, indent + 1);
        const complex =
          nested &&
          typeof nested === "object" &&
          ((Array.isArray(nested) && nested.length > 0) ||
            (!Array.isArray(nested) && Object.keys(nested).length > 0));
        if (complex) {
          return `${pad}${key}:\n${rendered}`;
        }
        return `${pad}${key}: ${rendered}`;
      })
      .join("\n");
  }
  return yamlString(String(value));
}

function yamlString(value: string): string {
  if (
    value === "" ||
    /[:#\n&*!|>%@`'"{}[\],]|^\s|\s$|^(?:true|false|null|~|\d)/i.test(value)
  ) {
    return JSON.stringify(value);
  }
  return value;
}

function toMarkdown(data: DeskExport): string {
  const sections = [
    `# Desk export`,
    ``,
    `Exported ${data.exportedAt}.`,
    ``,
  ];
  for (const table of TABLES) {
    const rows = asRows(data[table.key]);
    sections.push(`## ${table.heading}`, ``);
    if (rows.length === 0) {
      sections.push(`_None._`, ``);
      continue;
    }
    for (const row of rows) {
      const title = String(
        row.name ?? row.title ?? row.kind ?? row.id ?? "Item",
      );
      sections.push(`### ${title}`, ``);
      for (const [key, value] of Object.entries(row)) {
        if (value == null || value === "") {
          continue;
        }
        const text = String(value).replace(/\n/g, "\n  ");
        sections.push(`- **${key}:** ${text}`);
      }
      sections.push(``);
    }
  }
  return `${sections.join("\n")}\n`;
}

function toHtml(data: DeskExport): string {
  const tables = TABLES.map((table) => {
    const rows = asRows(data[table.key]);
    if (rows.length === 0) {
      return `<section><h2>${escapeHtml(table.heading)}</h2><p>None.</p></section>`;
    }
    const headers = Object.keys(rows[0] ?? {});
    const head = headers
      .map((key) => `<th>${escapeHtml(key)}</th>`)
      .join("");
    const body = rows
      .map((row) => {
        const cells = headers
          .map(
            (key) =>
              `<td>${escapeHtml(row[key] == null ? "" : String(row[key]))}</td>`,
          )
          .join("");
        return `<tr>${cells}</tr>`;
      })
      .join("");
    return `<section><h2>${escapeHtml(table.heading)}</h2><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></section>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Desk export ${escapeHtml(data.exportedAt.slice(0, 10))}</title>
  <style>
    body { font-family: Inter, system-ui, sans-serif; color: #150F00; margin: 2rem; }
    h1 { font-size: 2rem; }
    h2 { margin-top: 2rem; }
    table { border-collapse: collapse; width: 100%; font-size: 0.875rem; }
    th, td { border: 1px solid #e5e7eb; padding: 0.5rem 0.75rem; text-align: left; vertical-align: top; white-space: pre-wrap; }
    th { background: #f3f4f6; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  <h1>Desk export</h1>
  <p>Exported ${escapeHtml(data.exportedAt)}.</p>
  ${tables}
</body>
</html>
`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
