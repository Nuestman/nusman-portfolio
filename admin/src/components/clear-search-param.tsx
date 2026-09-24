"use client";

import { useEffect } from "react";

/** Strip a query key from the URL without a navigation (keeps client state). */
export function ClearSearchParam({ name }: { name: string }) {
  useEffect(() => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has(name)) {
      return;
    }
    url.searchParams.delete(name);
    const next = `${url.pathname}${url.search}${url.hash}`;
    window.history.replaceState(window.history.state, "", next);
  }, [name]);

  return null;
}
