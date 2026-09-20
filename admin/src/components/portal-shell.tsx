import type { ReactNode } from "react";
import { PortalHeader } from "@/components/portal-header";
import { countUnreadPortalNotifications } from "@/db/queries";
import { requirePortalPerson } from "@/lib/current-person";
import { PAGE_FRAME_CLASS } from "@/lib/layout";
import { cn } from "@/lib/utils";

export async function PortalShell({
  children,
  mainClassName,
}: {
  children: ReactNode;
  mainClassName?: string;
}) {
  const { person } = await requirePortalPerson();
  const unreadCount = await countUnreadPortalNotifications(person.id);

  return (
    <div className="min-h-full">
      <a
        href="#portal-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:text-dark-950"
      >
        Skip to content
      </a>
      <PortalHeader personName={person.name} unreadCount={unreadCount} />
      <main
        id="portal-main"
        className={cn(PAGE_FRAME_CLASS, "space-y-8 py-10", mainClassName)}
      >
        {children}
      </main>
    </div>
  );
}
