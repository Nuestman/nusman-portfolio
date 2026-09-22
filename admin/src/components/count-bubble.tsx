function unreadLabel(count: number): string {
  if (count > 99) {
    return "99+";
  }
  return String(count);
}

/** Gold pill for unread / count affordances (nav, account, conversation list). */
export function CountBubble({
  count,
  className,
}: {
  count: number;
  className?: string;
}) {
  if (count < 1) {
    return null;
  }
  return (
    <span
      aria-hidden="true"
      className={
        className ??
        "absolute -right-1.5 -top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-500 px-1 text-[10px] font-semibold leading-none text-white"
      }
    >
      {unreadLabel(count)}
    </span>
  );
}

export const countBubbleInlineClassName =
  "inline-flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-gold-500 px-1 text-[10px] font-semibold leading-none text-white";
