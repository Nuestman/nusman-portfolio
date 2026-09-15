export function snippet(value: string | null | undefined, max = 80): string {
  const text = value?.replace(/\s+/g, " ").trim() ?? "";
  if (!text) {
    return "—";
  }
  if (text.length <= max) {
    return text;
  }
  return `${text.slice(0, max).trimEnd()}…`;
}

export function formatStamp(value: Date): string {
  return value.toISOString().slice(0, 16).replace("T", " ");
}

export function displayText(value: string | null | undefined): string {
  const text = value?.trim() ?? "";
  return text.length > 0 ? text : "—";
}

export function displayYesNo(value: boolean): string {
  return value ? "Yes" : "No";
}
