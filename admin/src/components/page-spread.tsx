import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageSpread({
  intro,
  rail,
  children,
  className,
  /** When to split intro/rail vs main. Default `lg` (1024). Profile uses `md` (768). */
  splitFrom = "lg",
}: {
  intro: ReactNode;
  /** Sits under the intro in the left column (not sticky). */
  rail?: ReactNode;
  children?: ReactNode;
  className?: string;
  splitFrom?: "lg" | "md";
}) {
  const columns =
    splitFrom === "md"
      ? "md:grid-cols-[minmax(16rem,22rem)_minmax(0,1fr)] md:gap-10 xl:grid-cols-[minmax(18rem,26rem)_minmax(0,1fr)]"
      : "lg:grid-cols-[minmax(16rem,22rem)_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[minmax(18rem,26rem)_minmax(0,1fr)]";

  const stickyTop =
    splitFrom === "md"
      ? "md:sticky md:top-[calc(var(--desk-header-height)+1.5rem)]"
      : "lg:sticky lg:top-[calc(var(--desk-header-height)+1.5rem)]";

  return (
    <div className={cn("grid items-start gap-8", columns, className)}>
      <div className="space-y-8">
        <header className={rail ? undefined : stickyTop}>{intro}</header>
        {rail}
      </div>
      <div className="min-w-0 space-y-8">{children}</div>
    </div>
  );
}
