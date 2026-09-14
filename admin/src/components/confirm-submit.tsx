"use client";

import { type MouseEvent } from "react";
import { Button } from "@/components/ui/button";

export function ConfirmSubmit({
  message,
  label,
  size = "sm",
}: {
  message: string;
  label: string;
  size?: "sm" | "default";
}) {
  function onClick(event: MouseEvent<HTMLButtonElement>) {
    if (!window.confirm(message)) {
      event.preventDefault();
    }
  }

  return (
    <Button variant="destructive" size={size} type="submit" onClick={onClick}>
      {label}
    </Button>
  );
}
