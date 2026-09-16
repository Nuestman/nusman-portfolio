"use client";

import type { ReactNode } from "react";

/** Collapsed past-gate records — readable, not the main scroll. */
export function EarlierStages({ children }: { children: ReactNode }) {
  if (!children) {
    return null;
  }

  return (
    <details className="rounded-xl border border-gray-200 bg-white open:pb-4">
      <summary className="cursor-pointer list-none px-6 py-4 font-heading text-2xl text-dark-950 marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="flex items-center justify-between gap-4">
          Earlier stages
          <span className="text-sm font-sans font-normal text-gray-500">
            Show / hide
          </span>
        </span>
      </summary>
      <div className="space-y-8 border-t border-gray-100 px-6 pt-6">
        {children}
      </div>
    </details>
  );
}
