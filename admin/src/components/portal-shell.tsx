import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppFooter } from "@/components/app-footer";
import { PortalHeader } from "@/components/portal-header";
import {
  countUnreadPortalMessageNotifications,
  countUnreadPortalNotifications,
} from "@/db/queries";
import { requirePortalPerson } from "@/lib/current-person";
import { PAGE_FRAME_CLASS } from "@/lib/layout";
import { personAvatarSrcOrNull } from "@/lib/person-avatar";
import { cn } from "@/lib/utils";

export async function PortalShell({
  children,
  mainClassName,
}: {
  children: ReactNode;
  mainClassName?: string;
}) {
  const { person } = await requirePortalPerson();
  if (!person.portalOnboardingCompletedAt) {
    redirect("/welcome");
  }

  const [unreadCount, unreadMessageCount] = await Promise.all([
    countUnreadPortalNotifications(person.id),
    countUnreadPortalMessageNotifications(person.id),
  ]);

  return (
    <div className="flex min-h-dvh min-w-0 flex-col">
      <a
        href="#portal-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:text-dark-950"
      >
        Skip to content
      </a>
      <PortalHeader
        personName={person.name}
        personImageSrc={personAvatarSrcOrNull(person)}
        unreadCount={unreadCount}
        unreadMessageCount={unreadMessageCount}
      />
      <main
        id="portal-main"
        className={cn(
          PAGE_FRAME_CLASS,
          "grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)] content-start space-y-8 py-10",
          mainClassName,
        )}
      >
        {children}
      </main>
      <AppFooter surface="portal" />
    </div>
  );
}
