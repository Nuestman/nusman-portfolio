import type { ReactNode } from "react";
import { DeskHeader } from "@/components/desk-header";
import { requireSessionUser, userAvatarSrc } from "@/lib/current-user";
import { cn } from "@/lib/utils";

const WIDTHS = {
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "6xl": "max-w-[1400px]",
} as const;

export async function DeskShell({
  children,
  width = "6xl",
  beforeMain,
  mainClassName,
}: {
  email?: string | null;
  children: ReactNode;
  width?: keyof typeof WIDTHS;
  beforeMain?: ReactNode;
  mainClassName?: string;
}) {
  const user = await requireSessionUser();

  return (
    <div className="min-h-full">
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
      />
      {beforeMain}
      <main
        id="desk-main"
        className={cn("mx-auto space-y-8 px-4 py-10", WIDTHS[width], mainClassName)}
      >
        {children}
      </main>
    </div>
  );
}
