import Image from "next/image";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { listPortalProjectsForClient } from "@/db/queries";
import { PortalHeroBackdrop } from "@/components/portal-hero-backdrop";
import { requirePortalPerson } from "@/lib/current-person";
import { PAGE_FRAME_CLASS } from "@/lib/layout";
import { marketingPublicBaseUrl } from "@/lib/portal-host";
import { WelcomeWizard } from "./welcome-wizard";
import { portalOnboardingNextPath } from "./next-path";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Welcome",
};

type WelcomePageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function PortalWelcomePage({
  searchParams,
}: WelcomePageProps) {
  const { person, client } = await requirePortalPerson();
  const params = await searchParams;
  const nextPath = portalOnboardingNextPath(params.next);

  if (person.portalOnboardingCompletedAt) {
    redirect(nextPath);
  }

  const projects = await listPortalProjectsForClient(client.id);
  const projectTitle = projects[0]?.title ?? null;
  const marketingSite = marketingPublicBaseUrl();

  return (
    <div className="relative min-h-dvh overflow-hidden bg-gray-50">
      <PortalHeroBackdrop />
      <header className="relative z-10">
        <div
          className={`flex items-center justify-between py-5 ${PAGE_FRAME_CLASS}`}
        >
          <a
            href={marketingSite}
            className="flex h-12 shrink-0 items-center"
            aria-label="Numan Usman — public site"
          >
            <Image
              src="/logos/nusman-logo-wide.png"
              alt=""
              width={252}
              height={48}
              className="h-10 w-auto object-contain"
              style={{ width: "auto" }}
              priority
            />
          </a>
          <p className="text-sm text-gray-600">Quick tour</p>
        </div>
      </header>
      <main
        className={`relative z-10 flex min-h-[calc(100dvh-5rem)] items-start py-10 sm:items-center sm:py-16 ${PAGE_FRAME_CLASS}`}
      >
        <WelcomeWizard
          personName={person.name}
          projectTitle={projectTitle}
          nextPath={nextPath}
        />
      </main>
    </div>
  );
}
