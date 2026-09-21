import { cn } from "@/lib/utils";
import { isBlank } from "@/lib/text";

type MarkedSize = "lead" | "body" | "meta";

function filledClass(size: MarkedSize): string {
  switch (size) {
    case "lead":
      return "font-heading text-2xl leading-snug text-dark-950 sm:text-3xl";
    case "body":
      return "whitespace-pre-wrap text-base leading-relaxed text-gray-800";
    case "meta":
      return "text-sm text-gray-800";
    default: {
      const exhaustive: never = size;
      return exhaustive;
    }
  }
}

function UnsetMark() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
      className="shrink-0 text-red-600"
    >
      <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
  );
}

export function MarkedValue({
  value,
  size = "body",
  className,
}: {
  value: string | null | undefined;
  size?: MarkedSize;
  className?: string;
}) {
  const text = value?.trim() ?? "";
  if (!isBlank(text)) {
    return (
      <p className={cn(filledClass(size), className ?? "mt-2")}>{text}</p>
    );
  }
  return (
    <p
      className={cn(
        "flex items-center gap-1.5 text-sm text-gray-500",
        className ?? "mt-2",
      )}
    >
      <UnsetMark />
      Not set
    </p>
  );
}
