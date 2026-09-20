"use client";

import { useState, type ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setEditing((current) => !current)}
          >
            {editing ? "Cancel" : editLabel}
          </Button>
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
