/** Same-origin path only. Reject protocol-relative and scheme-bearing values. */
export function safeInternalPath(value: string | undefined | null): string {
  if (!value) {
    return "/";
  }

  if (
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    value.includes("://")
  ) {
    return "/";
  }

  return value;
}
