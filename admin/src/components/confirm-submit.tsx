"use client";

import { useEffect, useId, useRef, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { fieldClassName, labelClassName } from "@/lib/forms";

export function ConfirmClick({
  message,
  className,
  children,
}: {
  message: string;
  className?: string;
  children: string;
}) {
  function onClick(event: MouseEvent<HTMLButtonElement>) {
    if (!window.confirm(message)) {
      event.preventDefault();
    }
  }

  return (
    <button type="submit" className={className} onClick={onClick}>
      {children}
    </button>
  );
}

export function ConfirmDelete({
  label,
  message,
  confirmValue,
  size = "sm",
}: {
  label: string;
  message: string;
  confirmValue?: string;
  size?: "sm" | "default";
}) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [reason, setReason] = useState("");
  const wrapRef = useRef<HTMLSpanElement>(null);
  const titleId = useId();
  const nameId = useId();
  const reasonId = useId();
  const expected = confirmValue?.trim() ?? "";
  const nameOk = expected.length === 0 || typed.trim() === expected;

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        setTyped("");
        setReason("");
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function close() {
    setOpen(false);
    setTyped("");
    setReason("");
  }

  function submitConfirmed() {
    const form = wrapRef.current?.closest("form");
    if (!form || !nameOk) {
      return;
    }
    form.requestSubmit();
  }

  const dialog =
    open
      ? createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button
              type="button"
              className="absolute inset-0 bg-dark-950/40"
              aria-label="Cancel"
              onClick={close}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className="relative z-10 w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <h2 id={titleId} className="font-heading text-2xl text-dark-950">
                Confirm
              </h2>
              <p className="mt-3 text-sm text-gray-700">{message}</p>
              {expected ? (
                <div className="mt-5">
                  <label htmlFor={nameId} className={labelClassName}>
                    Type {expected} to confirm
                  </label>
                  <input
                    id={nameId}
                    value={typed}
                    onChange={(event) => setTyped(event.target.value)}
                    autoComplete="off"
                    autoFocus
                    className={fieldClassName}
                  />
                </div>
              ) : null}
              <div className="mt-5">
                <label htmlFor={reasonId} className={labelClassName}>
                  Reason (optional)
                </label>
                <textarea
                  id={reasonId}
                  rows={3}
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  autoFocus={!expected}
                  className={fieldClassName}
                  placeholder="Why this is being removed"
                />
              </div>
              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <Button type="button" variant="secondary" onClick={close}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={!nameOk}
                  onClick={submitConfirmed}
                >
                  {label}
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <span ref={wrapRef}>
      {open ? (
        <>
          <input type="hidden" name="confirmed" value="on" />
          {expected ? (
            <input type="hidden" name="confirmName" value={typed} />
          ) : null}
          {reason.trim() ? (
            <input type="hidden" name="reason" value={reason.trim()} />
          ) : null}
        </>
      ) : null}
      <Button
        variant="destructive"
        size={size}
        type="button"
        onClick={() => setOpen(true)}
      >
        {label}
      </Button>
      {dialog}
    </span>
  );
}
