import Image from "next/image";
import Link from "next/link";
import { buttonClassName } from "@/components/ui/button";
import { PortalHeroBackdrop } from "@/components/portal-hero-backdrop";
import { getPortalSessionPerson } from "@/lib/current-person";

export const dynamic = "force-dynamic";

const MARKETING_SITE = "https://nusman.dev";

export default async function PortalLandingPage() {
  const session = await getPortalSessionPerson().catch(() => null);
  const signedIn = Boolean(session);

  return (
    <div className="relative min-h-dvh overflow-hidden bg-gray-50">
      <PortalHeroBackdrop />

      <header className="relative z-10 mx-auto flex w-full max-w-[1400px] items-center justify-between px-4 py-5">
        <a
          href={MARKETING_SITE}
          className="flex h-12 items-center"
          aria-label="Numan Usman — back to nusman.dev"
        >
          <Image
            src="/logos/nusman-logo-wide.png"
            alt=""
            width={252}
            height={48}
            className="h-10 w-auto object-contain"
            priority
          />
        </a>
        {signedIn ? (
          <Link href="/projects" className={buttonClassName("default", "sm")}>
            Your projects
          </Link>
        ) : (
          <Link href="/login" className={buttonClassName("default", "sm")}>
            Sign in
          </Link>
        )}
      </header>

      <main className="relative z-10 mx-auto flex min-h-[calc(100dvh-5rem)] w-full max-w-[1400px] items-end px-4 pb-16 pt-10 sm:items-center sm:pb-24">
        <div className="max-w-xl rounded-2xl bg-gray-50/85 px-5 py-6 shadow-[0_0_0_1px_rgba(21,15,0,0.04)] backdrop-blur-sm sm:bg-transparent sm:p-0 sm:shadow-none sm:backdrop-blur-none">
          <p className="portal-rise font-heading text-3xl text-gold-500 sm:text-4xl lg:text-5xl">
            nusman
          </p>
          <h1 className="portal-rise-delay mt-2 font-heading text-6xl leading-none text-dark-950 sm:text-7xl lg:text-8xl">
            Clients&apos; Portal
          </h1>
          <p className="portal-fade mt-5 max-w-md text-xl text-gray-700">
            A quiet place to follow your project, share your insights, and talk
            with Usman.
          </p>
          <div className="portal-fade mt-8 flex flex-wrap gap-3">
            {signedIn ? (
              <Link
                href="/projects"
                className={buttonClassName("default", "lg")}
              >
                Open your projects
              </Link>
            ) : (
              <Link href="/login" className={buttonClassName("default", "lg")}>
                Sign in
              </Link>
            )}
            <a
              href={MARKETING_SITE}
              className={buttonClassName("secondary", "lg")}
            >
              Go Home
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
