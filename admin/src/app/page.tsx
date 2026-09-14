import Image from "next/image";
import { getSessionEmail } from "@/lib/auth";
import { databaseConfigured } from "@/db";
import { countProjects, getOperator } from "@/db/queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { logout } from "./login/actions";

export const dynamic = "force-dynamic";

const PROCESS_STEPS = [
  {
    title: "Discover & Plan",
    body: "Align on the goal, constraints, and a clear plan.",
  },
  {
    title: "Build & Test",
    body: "Develop, test, and share progress as we go.",
  },
  {
    title: "Launch & Support",
    body: "Ship it, walk them through it, and stay available.",
  },
] as const;

type DeskStats =
  | { kind: "missing" }
  | { kind: "ok"; projectCount: number; operatorName: string | null }
  | { kind: "error" };

async function loadDeskStats(): Promise<DeskStats> {
  if (!databaseConfigured()) {
    return { kind: "missing" };
  }

  try {
    const [projectCount, operator] = await Promise.all([
      countProjects(),
      getOperator(),
    ]);
    return {
      kind: "ok",
      projectCount,
      operatorName: operator?.name ?? null,
    };
  } catch (error) {
    console.error("Desk database query failed", error);
    return { kind: "error" };
  }
}

function DeskStatusCopy({ stats }: { stats: DeskStats }) {
  switch (stats.kind) {
    case "missing":
      return (
        <>
          <p>Neon is not linked in this environment yet.</p>
          <p className="text-sm text-gray-500">
            Set DATABASE_URL for this environment, then apply migrations.
          </p>
        </>
      );
    case "error":
      return (
        <>
          <p>Could not read the database.</p>
          <p className="text-sm text-gray-500">
            Check DATABASE_URL and that the first migration has been applied.
          </p>
        </>
      );
    case "ok":
      return (
        <>
          <p>
            {stats.projectCount === 0
              ? "No clients or projects yet. That is expected."
              : `${stats.projectCount} project${stats.projectCount === 1 ? "" : "s"} on the books.`}
          </p>
          <p className="text-sm text-gray-500">
            {stats.operatorName
              ? `Operator: ${stats.operatorName}. Next: add a client.`
              : "Database connected. Seed the operator, then add a client."}
          </p>
        </>
      );
    default: {
      const _exhaustive: never = stats;
      return _exhaustive;
    }
  }
}

export default async function HomePage() {
  const email = await getSessionEmail();
  const stats = await loadDeskStats();

  return (
    <div className="min-h-full">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <Image
              src="/logos/nusman-logo-wide.png"
              alt="Numan Usman"
              width={160}
              height={40}
              className="h-10 w-auto"
              style={{ width: "auto", height: "auto" }}
            />
            <span className="font-heading text-2xl text-gold-500">Desk</span>
          </div>
          <div className="flex items-center gap-3">
            {email ? (
              <p className="hidden text-sm text-gray-500 sm:block">{email}</p>
            ) : null}
            <form action={logout}>
              <Button variant="secondary" type="submit">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 space-y-8">
        <div>
          <h1 className="font-heading text-3xl text-dark-950 md:text-4xl">Today</h1>
          <p className="mt-2 max-w-2xl text-gray-700">
            This is the workbench. Clients, projects, and the seven gates land in
            the next phases. Nothing starts from a chat message.
          </p>
        </div>

        <div className="relative">
          <div
            className="absolute inset-x-[6%] inset-y-0 rounded-3xl bg-gray-200"
            aria-hidden="true"
          />
          <div className="relative grid gap-4 px-2 py-8 md:grid-cols-3">
            {PROCESS_STEPS.map((step) => (
              <Card key={step.title}>
                <CardHeader>
                  <CardTitle>{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{step.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Empty desk</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-gray-700">
            <DeskStatusCopy stats={stats} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
