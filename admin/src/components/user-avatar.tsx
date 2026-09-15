export function userInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

export function UserAvatar({
  name,
  src,
  size,
  className,
}: {
  name: string;
  src: string | null;
  /** Fixed pixel size. Omit to fill the parent (use with a sized wrapper). */
  size?: number;
  className?: string;
}) {
  const fill = size == null;
  const dimClass = fill ? "h-full w-full" : undefined;
  const dimStyle = fill
    ? undefined
    : { width: size, height: size, fontSize: Math.round(size * 0.38) };
  const merged = [dimClass, "rounded-full object-cover", className]
    .filter(Boolean)
    .join(" ");

  if (src) {
    return (
      // Uploaded photos are served from an authenticated route.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        width={fill ? undefined : size}
        height={fill ? undefined : size}
        className={merged}
        style={dimStyle}
      />
    );
  }

  return (
    <span
      className={[
        "inline-flex items-center justify-center rounded-full bg-gold-500 font-medium text-white",
        fill ? "text-4xl sm:text-5xl" : null,
        dimClass,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={fill ? undefined : dimStyle}
      aria-hidden="true"
    >
      {userInitials(name)}
    </span>
  );
}
