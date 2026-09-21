import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const tableFrameClassName =
  "table-scroll grid min-w-0 max-w-full grid-cols-[minmax(0,1fr)] overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm";

export const tableClassName = "desk-table";

/**
 * Tables keep their own min-content width (and scroll inside this frame).
 * The inner `w-0 min-w-full` box stops that min-content from widening the
 * document canvas — Firefox otherwise paints empty space beside `body`.
 */
export function TableFrame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(tableFrameClassName, className)}>
      <div className="w-0 min-w-full">{children}</div>
    </div>
  );
}

export function inactiveRowProps(inactive: boolean) {
  return inactive ? ({ "data-inactive": true } as const) : {};
}
