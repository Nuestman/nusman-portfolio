"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Nested scroller that hands leftover wheel delta to the page. */
export function ScrollChain({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }

    function onWheel(event: WheelEvent) {
      const node = ref.current;
      if (!node) {
        return;
      }
      if (node.scrollHeight <= node.clientHeight + 1) {
        return;
      }
      const atTop = node.scrollTop <= 0;
      const atBottom =
        node.scrollTop + node.clientHeight >= node.scrollHeight - 1;
      if ((event.deltaY < 0 && atTop) || (event.deltaY > 0 && atBottom)) {
        event.preventDefault();
        window.scrollBy({ top: event.deltaY });
      }
    }

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
    };
  }, []);

  return (
    <div ref={ref} className={cn("overscroll-auto", className)}>
      {children}
    </div>
  );
}
