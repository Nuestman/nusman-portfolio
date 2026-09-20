import type { Metadata } from "next";
import { shouldServePortalUi } from "@/lib/serve-portal";

export const PORTAL_APP_TITLE = "Portal · Numan Usman";
export const DESK_APP_TITLE = "Desk · Numan Usman";

const PORTAL_DESCRIPTION =
  "Client portal for progress, discovery, schedule, and messages with the nusman.dev practice.";

/** Absolute tab title for Portal (optional page segment). */
export function portalPageTitle(page?: string): string {
  if (!page) {
    return PORTAL_APP_TITLE;
  }
  return `${page} · ${PORTAL_APP_TITLE}`;
}

/**
 * Metadata for routes that live in the Desk tree but may render Portal UI
 * (dual-mode `/login` and `/projects*`). Desk keeps the root layout title.
 */
export async function dualModeMetadata(page?: string): Promise<Metadata> {
  if (!(await shouldServePortalUi())) {
    return {};
  }
  return {
    title: portalPageTitle(page),
    description: PORTAL_DESCRIPTION,
  };
}
