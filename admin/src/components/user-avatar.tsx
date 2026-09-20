import { DEFAULT_AVATAR_SRC } from "@/lib/avatars";
import { cn } from "@/lib/utils";

export function UserAvatar({
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
  const imageSrc = src?.trim() ? src : DEFAULT_AVATAR_SRC;
  const isDefault = imageSrc === DEFAULT_AVATAR_SRC;

  return (
    <span
      className={cn(
        "overflow-hidden rounded-full",
        fill ? "block h-full w-full" : "inline-block",
        isDefault && "bg-gold-500",
        className,
      )}
      style={fill ? undefined : { width: size, height: size }}
    >
      {/* Uploaded photos are served from an authenticated route. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageSrc}
        alt=""
        width={fill ? undefined : size}
        height={fill ? undefined : size}
        className="block h-full w-full object-cover"
      />
    </span>
  );
}
