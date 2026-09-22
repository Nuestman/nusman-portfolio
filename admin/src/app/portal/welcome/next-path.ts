import { safeInternalPath } from "@/lib/paths";

/** Safe post-tour destination (never bounce back to /welcome or login). */
export function portalOnboardingNextPath(
  raw: string | null | undefined,
): string {
  const path = safeInternalPath(raw);
  if (
    path === "/" ||
    path === "/welcome" ||
    path.startsWith("/welcome?") ||
    path.startsWith("/login")
  ) {
    return "/projects";
  }
  return path;
}
