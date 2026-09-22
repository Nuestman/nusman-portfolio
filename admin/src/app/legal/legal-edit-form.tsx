"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { fieldClassName, labelClassName } from "@/lib/forms";
import { linkClassName } from "@/lib/links";
import { paragraphsToTextarea } from "@/lib/legal-documents";
import { cn } from "@/lib/utils";
import {
  updateLegalDocumentAction,
  type FormState,
} from "@/app/legal/actions";

const initialState: FormState = { error: null };

const tightFieldClassName = cn(fieldClassName, "px-3 py-2 text-sm");
const tightLabelClassName = cn(labelClassName, "mb-1");

type SectionDraft = {
  id: string;
  title: string;
  body: string;
};

export function LegalEditForm({
  slug,
  title,
  lastUpdated,
  intro,
  sections,
}: {
  slug: string;
  title: string;
  lastUpdated: string;
  intro: string;
  sections: { id: string; title: string; paragraphs: string[] }[];
}) {
  const [state, action, pending] = useActionState(
    updateLegalDocumentAction,
    initialState,
  );
  const [drafts, setDrafts] = useState<SectionDraft[]>(() =>
    sections.map((section) => ({
      id: section.id,
      title: section.title,
      body: paragraphsToTextarea(section.paragraphs),
    })),
  );

  function addSection() {
    setDrafts((prev) => [
      ...prev,
      { id: "", title: "", body: "" },
    ]);
  }

  function removeSection(index: number) {
    setDrafts((prev) => prev.filter((_, i) => i !== index));
  }

  function updateDraft(
    index: number,
    field: keyof SectionDraft,
    value: string,
  ) {
    setDrafts((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  }

  return (
    <form action={action} className="mx-auto max-w-2xl space-y-4">
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="sectionCount" value={drafts.length} />

      {state.error ? (
        <p className="rounded-lg bg-amber-100 px-3 py-2 text-sm text-amber-900">
          {state.error}
        </p>
      ) : null}

      <div>
        <label htmlFor="title" className={tightLabelClassName}>
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          maxLength={200}
          defaultValue={title}
          className={tightFieldClassName}
        />
      </div>

      <div>
        <label htmlFor="lastUpdated" className={tightLabelClassName}>
          Last updated
        </label>
        <input
          id="lastUpdated"
          name="lastUpdated"
          required
          maxLength={80}
          defaultValue={lastUpdated}
          placeholder="September 2026"
          className={tightFieldClassName}
        />
      </div>

      <div>
        <label htmlFor="intro" className={tightLabelClassName}>
          Intro
        </label>
        <textarea
          id="intro"
          name="intro"
          required
          rows={4}
          maxLength={4000}
          defaultValue={intro}
          className={tightFieldClassName}
        />
      </div>

      <div className="space-y-4 border-t border-gray-100 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-heading text-xl text-dark-950">Sections</h2>
          <Button type="button" variant="outline" onClick={addSection}>
            Add section
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          Use a blank line between paragraphs in each section body.
        </p>

        {drafts.map((draft, index) => (
          <div
            key={`section-${index}-${draft.id || "new"}`}
            className="space-y-2 rounded-xl border border-gray-200 bg-gray-50/50 p-4"
          >
            <input
              type="hidden"
              name={`sectionId_${index}`}
              value={draft.id}
            />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor={`sectionTitle_${index}`}
                className={tightLabelClassName}
              >
                Section {index + 1} title
              </label>
              {drafts.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removeSection(index)}
                  className="text-sm text-gray-600 underline hover:text-dark-950"
                >
                  Remove
                </button>
              ) : null}
            </div>
            <input
              id={`sectionTitle_${index}`}
              name={`sectionTitle_${index}`}
              required
              maxLength={200}
              value={draft.title}
              onChange={(event) =>
                updateDraft(index, "title", event.target.value)
              }
              className={tightFieldClassName}
            />
            <label
              htmlFor={`sectionBody_${index}`}
              className={tightLabelClassName}
            >
              Paragraphs
            </label>
            <textarea
              id={`sectionBody_${index}`}
              name={`sectionBody_${index}`}
              required
              rows={6}
              value={draft.body}
              onChange={(event) =>
                updateDraft(index, "body", event.target.value)
              }
              className={tightFieldClassName}
            />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <Button type="submit" disabled={pending || drafts.length === 0}>
          {pending ? "Saving…" : "Save"}
        </Button>
        <Link href="/legal" className={linkClassName("back")}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
