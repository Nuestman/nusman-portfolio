import type { ReactNode } from "react";
import { AppFooter } from "@/components/app-footer";
import { DeskHeader } from "@/components/desk-header";
import { countUnreadDeskNotifications } from "@/db/queries";
import { requireSessionUser, userAvatarSrc } from "@/lib/current-user";
import { PAGE_FRAME_CLASS } from "@/lib/layout";
import { cn } from "@/lib/utils";

export async function DeskShell({
  children,
  beforeMain,
  mainClassName,
}: {
  email?: string | null;
  children: ReactNode;
  beforeMain?: ReactNode;
  mainClassName?: string;
}) {
  const user = await requireSessionUser();
  const unreadCount = await countUnreadDeskNotifications(user.id);

  return (
    <div className="flex min-h-dvh min-w-0 flex-col">
      <a
        href="#desk-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:text-dark-950"
      >
        Skip to content
      </a>
      <DeskHeader
        profile={{
          name: user.name,
          imageSrc: userAvatarSrc(user),
        }}
        unreadCount={unreadCount}
      />
      {beforeMain}
      <main
        id="desk-main"
        className={cn(
          PAGE_FRAME_CLASS,
          "grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)] content-start space-y-8 py-10",
          mainClassName,
        )}
      >
        {children}
      </main>
      <AppFooter surface="desk" />
    </div>
  );
}
