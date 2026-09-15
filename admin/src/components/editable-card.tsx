"use client";

import { useState, type ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { linkClassName } from "@/lib/links";

export function EditableCard({
  title,
  hint,
  editLabel = "Edit",
  showEdit = true,
  always,
  view,
  form,
}: {
  title: string;
  hint?: string;
  editLabel?: string;
  showEdit?: boolean;
  always?: ReactNode;
  view?: ReactNode;
  form?: ReactNode;
}) {
  const [editing, setEditing] = useState(false);
  const canEdit = showEdit && Boolean(form);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
        <CardTitle>{title}</CardTitle>
        {canEdit ? (
          <button
            type="button"
            className={linkClassName("back")}
            onClick={() => setEditing((current) => !current)}
          >
            {editing ? "Cancel" : editLabel}
          </button>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4">
        {hint ? <p className="text-sm text-gray-600">{hint}</p> : null}
        {always}
        {canEdit && editing ? form : view}
      </CardContent>
    </Card>
  );
}
