import packageJson from "../../package.json";
import { PAGE_FRAME_CLASS } from "@/lib/layout";
import { cn } from "@/lib/utils";

type AppFooterProps = {
  surface: "desk" | "portal";
  className?: string;
};

export function AppFooter({ surface, className }: AppFooterProps) {
  const year = new Date().getFullYear();
  const label = surface === "desk" ? "Desk" : "Portal";

  return (
    <footer
      className={cn(
        "shrink-0 border-t border-gray-200 bg-gray-50",
        className,
      )}
    >
      <div
        className={cn(
          PAGE_FRAME_CLASS,
          "flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3 text-sm text-gray-500",
        )}
      >
        <p>
          {label} {packageJson.version}
        </p>
        <p>&copy; {year} N. Usman</p>
      </div>
    </footer>
  );
}
