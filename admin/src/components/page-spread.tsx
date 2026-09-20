import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageSpread({
  intro,
  rail,
  children,
  className,
}: {
  intro: ReactNode;
  /** Sits under the intro in the left column (not sticky). */
  rail?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid items-start gap-8 lg:grid-cols-[minmax(16rem,22rem)_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[minmax(18rem,26rem)_minmax(0,1fr)]",
        className,
      )}
    >
      <div className="space-y-8">
        <header
          className={
            rail
              ? undefined
              : "lg:sticky lg:top-[calc(var(--desk-header-height)+1.5rem)]"
          }
        >
          {intro}
        </header>
        {rail}
      </div>
      <div className="min-w-0 space-y-8">{children}</div>
    </div>
  );
}
