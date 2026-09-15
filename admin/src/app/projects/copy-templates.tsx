"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { CopyTemplate } from "@/lib/templates";

async function writeClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.left = "-9999px";
    document.body.appendChild(field);
    field.select();
    const ok = document.execCommand("copy");
    field.remove();
    return ok;
  }
}

export function CopyButton({ text, label }: { text: string; label: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

  async function copy() {
    const wrote = await writeClipboard(text);
    setStatus(wrote ? "copied" : "failed");
    window.setTimeout(() => setStatus("idle"), 2000);
  }

  const caption =
    status === "copied" ? "Copied" : status === "failed" ? "Copy failed" : label;

  return (
    <Button type="button" variant="outline" size="sm" onClick={() => void copy()}>
      {caption}
    </Button>
  );
}

export function CopyTemplates({ templates }: { templates: CopyTemplate[] }) {
  return (
    <ul className="space-y-6">
      {templates.map((template) => (
        <li key={template.id} className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-heading text-xl text-dark-950">
                {template.title}
              </h3>
              <p className="text-sm text-gray-600">{template.hint}</p>
            </div>
            <CopyButton text={template.text} label="Copy" />
          </div>
          <pre className="whitespace-pre-wrap rounded-xl bg-gray-200 p-4 text-sm text-gray-700">
            {template.text}
          </pre>
        </li>
      ))}
    </ul>
  );
}
