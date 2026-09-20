"use client";

import { useState } from "react";
import { ConfirmDelete } from "@/components/confirm-submit";
import { EditLink } from "@/components/table-actions";
import { Button } from "@/components/ui/button";
import { NoteForm } from "@/app/projects/note-form";
import { deleteNoteAction } from "@/app/projects/actions";
import {
  formatTimelineDay,
  formatTimelineTime,
  timelineDayKey,
} from "@/lib/text";
import { cn } from "@/lib/utils";

export type TimelineNote = {
  id: string;
  body: string;
  createdAt: Date | string;
  clientVisible: boolean;
};

type TimelineVariant = "desk" | "portal";

function asDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

function timelineCopy(variant: TimelineVariant): {
  title: string;
  empty: string;
} {
  switch (variant) {
    case "desk":
      return {
        title: "Timeline",
        empty: "No timeline yet. Add a call, WhatsApp note, or stage move.",
      };
    case "portal":
      return {
        title: "Updates",
        empty: "No client updates yet.",
      };
    default: {
      const exhaustive: never = variant;
      return exhaustive;
    }
  }
}

function groupNotes(notes: TimelineNote[]) {
  const groups: { key: string; label: string; notes: TimelineNote[] }[] = [];
  for (const note of notes) {
    const createdAt = asDate(note.createdAt);
    const key = timelineDayKey(createdAt);
    const last = groups[groups.length - 1];
    if (last && last.key === key) {
      last.notes.push(note);
    } else {
      groups.push({
        key,
        label: formatTimelineDay(createdAt),
        notes: [note],
      });
    }
  }
  return groups;
}

export function ProjectTimeline({
  projectId,
  notes,
  hint,
  variant,
}: {
  projectId: string;
  notes: TimelineNote[];
  hint?: string;
  variant: TimelineVariant;
}) {
  const [adding, setAdding] = useState(false);
  const copy = timelineCopy(variant);
  const groups = groupNotes(notes);
  const isDesk = variant === "desk";

  return (
    <section aria-labelledby="timeline-heading" className="min-w-0">
      <div className="sticky top-[var(--desk-header-height)] z-10 bg-gray-50 pb-4 xl:top-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="timeline-heading"
              className="font-heading text-2xl text-gold-500"
            >
              {copy.title}
            </h2>
            {hint ? <p className="mt-1 text-sm text-gray-600">{hint}</p> : null}
          </div>
          {isDesk ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAdding((current) => !current)}
            >
              {adding ? "Cancel" : "Add"}
            </Button>
          ) : null}
        </div>
        {isDesk && adding ? (
          <div className="mt-5 rounded-2xl border border-gold-200/80 bg-gold-50/70 p-4">
            <NoteForm projectId={projectId} rows={3} />
          </div>
        ) : null}
      </div>

      {notes.length === 0 && !adding ? (
        <div className="relative mt-8 pl-9">
          <span
            className="absolute bottom-1 left-[7px] top-2 w-px bg-gradient-to-b from-gold-400 to-transparent"
            aria-hidden
          />
          <span
            className="absolute left-0 top-0 h-[15px] w-[15px] rounded-full border-2 border-gold-500 bg-white"
            aria-hidden
          />
          <p className="text-sm leading-relaxed text-gray-600">{copy.empty}</p>
        </div>
      ) : (
        <div className="relative mt-8">
          <span
            className="absolute bottom-4 left-[7px] top-2 w-px bg-gradient-to-b from-gold-500 via-gold-300 to-gold-100"
            aria-hidden
          />
          <ol>
          {groups.map((group, groupIndex) => (
            <li
              key={group.key}
              className={cn(groupIndex > 0 ? "mt-9" : null)}
            >
              <div className="relative mb-4 flex items-center gap-3 pl-9">
                <span
                  className="absolute left-0 top-0.5 flex h-[15px] w-[15px] items-center justify-center"
                  aria-hidden
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-gold-500 ring-4 ring-gold-100" />
                </span>
                <p
                  className="text-[11px] font-medium uppercase tracking-[0.16em] text-gold-700"
                  suppressHydrationWarning
                >
                  {group.label}
                </p>
                <span className="h-px flex-1 bg-gold-100" aria-hidden />
              </div>
              <ul className="space-y-5 pl-9">
                {group.notes.map((note) => {
                  const createdAt = asDate(note.createdAt);
                  return (
                  <li key={note.id} className="relative min-w-0">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <time
                        dateTime={createdAt.toISOString()}
                        className="text-xs text-gray-500"
                        suppressHydrationWarning
                      >
                        {formatTimelineTime(createdAt)}
                      </time>
                      {isDesk && note.clientVisible ? (
                        <span className="rounded-full bg-gold-100 px-2 py-0.5 text-[11px] font-medium text-gold-800">
                          Portal
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-dark-950">
                      {note.body}
                    </p>
                    {isDesk ? (
                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        <EditLink
                          href={`/projects/${projectId}/notes/${note.id}/edit`}
                        />
                        <form action={deleteNoteAction}>
                          <input type="hidden" name="id" value={note.id} />
                          <input
                            type="hidden"
                            name="projectId"
                            value={projectId}
                          />
                          <ConfirmDelete
                            label="Remove"
                            message="Remove this note?"
                          />
                        </form>
                      </div>
                    ) : null}
                  </li>
                  );
                })}
              </ul>
            </li>
          ))}
          </ol>
        </div>
      )}
    </section>
  );
}
