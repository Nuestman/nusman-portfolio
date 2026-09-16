import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PortalHeroBackdrop } from "@/components/portal-hero-backdrop";
import { QueryNotice } from "@/components/query-notice";
import { linkClassName } from "@/lib/links";
import { PortalLoginForm } from "./login-form";

export const dynamic = "force-dynamic";

type PortalLoginPageProps = {
  searchParams: Promise<{ notice?: string | string[] }>;
};

export default async function PortalLoginPage({
  searchParams,
}: PortalLoginPageProps) {
  const params = await searchParams;
  const noticeRaw = Array.isArray(params.notice)
    ? params.notice[0]
    : params.notice;

  return (
    <div className="relative min-h-dvh overflow-hidden bg-gray-50">
      <PortalHeroBackdrop />
      <main className="relative z-10 grid min-h-dvh place-items-center px-4 py-16">
        <div className="relative w-full max-w-md">
          <div
            className="absolute inset-x-4 -inset-y-6 rounded-3xl bg-gray-200/80"
            aria-hidden="true"
          />
          <Card className="relative">
            <CardHeader className="items-center text-center">
              <Image
                src="/logos/nusman-logo-square.png"
                alt="Numan Usman"
                width={72}
                height={72}
                className="mb-2 h-16 w-16 object-contain"
              />
              <h1 className="font-heading text-2xl text-dark-950">Portal</h1>
              <p className="text-sm text-gray-600">
                Progress, discovery, and messages for your project.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {noticeRaw === "invalid-link" ? (
                <QueryNotice message="That link is invalid or expired. Request a new one." />
              ) : null}
              <PortalLoginForm />
              <p className="text-center text-sm">
                <Link href="/" className={linkClassName("back")}>
                  ← Back to Portal
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
