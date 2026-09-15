import type { ReactNode } from "react";
import { PortalHeader } from "@/components/portal-header";
import { requirePortalPerson } from "@/lib/current-person";
import { cn } from "@/lib/utils";

const WIDTHS = {
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "6xl": "max-w-[1400px]",
} as const;

export async function PortalShell({
  children,
  width = "3xl",
  mainClassName,
}: {
  children: ReactNode;
  width?: keyof typeof WIDTHS;
  mainClassName?: string;
}) {
  const { person } = await requirePortalPerson();

  return (
    <div className="min-h-full">
      <a
        href="#portal-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:text-dark-950"
      >
        Skip to content
      </a>
      <PortalHeader personName={person.name} />
      <main
        id="portal-main"
        className={cn(
          "mx-auto space-y-8 px-4 py-10",
          WIDTHS[width],
          mainClassName,
        )}
      >
        {children}
      </main>
    </div>
  );
}
