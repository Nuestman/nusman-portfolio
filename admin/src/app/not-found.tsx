import { headers } from "next/headers";
import Link from "next/link";
import { buttonClassName } from "@/components/ui/button";
import { hostLooksLikePortal } from "@/lib/portal-host";

export default async function NotFound() {
  const headerList = await headers();
  const isPortal = hostLooksLikePortal(headerList.get("host"));

  const product = isPortal ? "Portal" : "Desk";
  const primaryHref = "/";
  const primaryLabel = isPortal ? "Back to home" : "Back to Today";
  const secondaryHref = "/login";
  const secondaryLabel = "Sign in";

  return (
    <main className="flex min-h-full items-center justify-center px-4 py-16">
      <div className="max-w-xl text-center">
        {/* eslint-disable-next-line @next/next/no-img-element -- static portrait asset */}
        <img
          src="/images/portraits/numan-caricature-404.png"
          alt="Usman sitting downcast holding a 404 sign"
          className="mx-auto mb-6 h-56 w-auto object-contain sm:h-72"
          width={288}
          height={288}
        />
        <h1 className="section-heading text-dark-950 mb-6">
          This page does not exist
        </h1>
        <p className="mb-8 text-gray-600">
          The link may be outdated, or that route is not on {product}.
        </p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link href={primaryHref} className={buttonClassName("default", "lg")}>
            {primaryLabel}
          </Link>
          <Link
            href={secondaryHref}
            className={buttonClassName("outline", "lg")}
          >
            {secondaryLabel}
          </Link>
        </div>
      </div>
    </main>
  );
}
