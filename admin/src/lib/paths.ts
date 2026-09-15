/** Same-origin path only. Reject protocol-relative and scheme-bearing values. */
export function safeInternalPath(value: string | undefined | null): string {
  if (!value) {
    return "/";
  }

  const trimmed = value.trim();
  if (
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    trimmed.includes("\\") ||
    trimmed.includes("://") ||
    trimmed.includes("\0")
  ) {
    return "/";
  }

  const pathOnly = trimmed.split("?")[0] ?? "/";
  if (pathOnly === "/login" || pathOnly.startsWith("/login/")) {
    return "/";
  }

  return trimmed;
}
