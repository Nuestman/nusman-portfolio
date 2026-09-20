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

/** Value for `<input type="datetime-local">` in the browser's local zone. */
export function toDatetimeLocalValue(value: Date | null | undefined): string {
  if (!value) {
    return "";
  }
  const local = new Date(value.getTime() - value.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

/** Parse `datetime-local` form value into a Date, or null if empty/invalid. */
export function parseDatetimeLocal(value: string | null | undefined): Date | null {
  const raw = value?.trim() ?? "";
  if (!raw) {
    return null;
  }
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
}

export function formatEventWhen(value: Date | null | undefined): string {
  if (!value) {
    return "Time TBD";
  }
  return value.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Short relative / clock time for chat lists and bubbles. */
export function formatChatTime(value: Date, now = new Date()): string {
  const ms = now.getTime() - value.getTime();
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 1) {
    return "Just now";
  }
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h`;
  }
  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days}d`;
  }
  return value.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function formatChatStamp(value: Date): string {
  const sameDay =
    value.toDateString() === new Date().toDateString();
  const time = value.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  if (sameDay) {
    return time;
  }
  return `${value.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })} · ${time}`;
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }
  return `${parts[0]!.slice(0, 1)}${parts[1]!.slice(0, 1)}`.toUpperCase();
}

export function displayText(value: string | null | undefined): string {
  const text = value?.trim() ?? "";
  return text.length > 0 ? text : "—";
}

export function displayYesNo(value: boolean): string {
  return value ? "Yes" : "No";
}

function startOfLocalDay(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

/** Calendar-day label for project timeline groups. */
export function formatTimelineDay(value: Date, now = new Date()): string {
  const day = startOfLocalDay(value).getTime();
  const today = startOfLocalDay(now).getTime();
  const diffDays = Math.round((today - day) / 86_400_000);
  if (diffDays === 0) {
    return "Today";
  }
  if (diffDays === 1) {
    return "Yesterday";
  }
  return value.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: value.getFullYear() === now.getFullYear() ? undefined : "numeric",
  });
}

export function formatTimelineTime(value: Date): string {
  return value.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function timelineDayKey(value: Date): string {
  const day = startOfLocalDay(value);
  return `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
}
