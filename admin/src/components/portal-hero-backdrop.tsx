import Image from "next/image";

/** Shared portal landing/login atmosphere. */
export function PortalHeroBackdrop() {
  return (
    <div className="absolute inset-0">
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_20%,rgba(185,140,27,0.14),transparent_50%)]"
        aria-hidden="true"
      />
      <Image
        src="/images/portraits/numan-caricature-portal-hero-desktop.png"
        alt=""
        fill
        priority
        className="portal-fade object-cover object-[75%_center] sm:object-[70%_center] lg:object-right"
        sizes="100vw"
      />
      <div
        className="absolute inset-0 hidden bg-gradient-to-r from-gray-50 via-gray-50/85 to-transparent sm:block lg:via-gray-50/70"
        aria-hidden="true"
      />
    </div>
  );
}
