"use client";

import { useEffect } from "react";

/** Scroll the latest bubble into view when opening a conversation. */
export function ScrollThreadLatest() {
  useEffect(() => {
    document
      .getElementById("thread-latest")
      ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, []);
  return null;
}
