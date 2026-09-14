import Image from "next/image";
import { credentialsConfigured } from "@/lib/auth";
import { safeInternalPath } from "@/lib/paths";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

type LoginPageProps = {
  searchParams: Promise<{ from?: string | string[] }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const fromRaw = Array.isArray(params.from) ? params.from[0] : params.from;
  const from = safeInternalPath(fromRaw);
  const ready = credentialsConfigured();

  return (
    <main className="flex min-h-full items-center justify-center px-4 py-16">
      <div className="relative w-full max-w-md">
        <div
          className="absolute inset-x-4 -inset-y-6 rounded-3xl bg-gray-200"
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
            <h1 className="font-heading text-2xl text-dark-950">Desk</h1>
            <p className="text-sm text-gray-600">
              Private workbench for the nusman.dev practice.
            </p>
          </CardHeader>
          <CardContent>
            {ready ? (
              <LoginForm from={from} />
            ) : (
              <p className="rounded-lg bg-amber-100 px-4 py-3 text-sm text-amber-900">
                Set ADMIN_EMAIL, ADMIN_PASSWORD, and AUTH_SECRET in the Desk
                environment before signing in.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
