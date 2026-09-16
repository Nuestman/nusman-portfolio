import { headers } from "next/headers";
import { getPortalSessionPerson } from "@/lib/current-person";
import { hostLooksLikePortal } from "@/lib/portal-host";

/**
 * Soft navigations match the desk filesystem route (`/projects/[id]`) even when
 * proxy rewrites the document request to `/portal/...`. Detect Portal intent so
 * the desk page module can render Portal UI instead of 404/login.
 */
export async function shouldServePortalUi(): Promise<boolean> {
  const headerList = await headers();
  if (hostLooksLikePortal(headerList.get("host"))) {
    return true;
  }

  // Local same-origin: a live portal session means this browser is in Portal mode.
  if (process.env.NODE_ENV !== "production") {
    const session = await getPortalSessionPerson().catch(() => null);
    return Boolean(session);
  }

  return false;
}
