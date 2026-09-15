"use client";

import { useEffect } from "react";
import { FormError } from "@/components/form-error";

export function QueryNotice({ message }: { message: string | null }) {
  useEffect(() => {
    if (!message) {
      return;
    }

    const url = new URL(window.location.href);
    if (!url.searchParams.has("notice")) {
      return;
    }

    url.searchParams.delete("notice");
    const next = `${url.pathname}${url.search}${url.hash}`;
    window.history.replaceState(window.history.state, "", next);
  }, [message]);

  return <FormError>{message}</FormError>;
}
