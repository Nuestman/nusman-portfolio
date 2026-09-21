import Link from "next/link";
import { getSessionEmail } from "@/lib/auth";
import { databaseConfigured } from "@/db";
import { listActiveProjects } from "@/db/queries";
import { DeskShell } from "@/components/desk-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GATE_GUIDES, toProcessGate } from "@/lib/gates";
import {
  AGREEMENT_CLAUSES,
  DISCOVERY_AGENDA,
  FIRST_REPLY,
  INTAKE_MESSAGE,
  INTAKE_QUESTIONS,
  PRACTICE_HABITS,
  THIS_WEEK_REMINDERS,
  afterCallMessage,
  optionStarter,
} from "@/lib/templates";
import { OPTION_KINDS, type ProjectGate } from "@/db/schema";
import { optionKindLabel } from "@/lib/labels";
import { linkClassName } from "@/lib/links";
import { PAGE_FRAME_CLASS } from "@/lib/layout";
import { tableClassName, TableFrame } from "@/lib/tables";
import { cn } from "@/lib/utils";
import { CopyButton } from "@/app/projects/copy-templates";

export const dynamic = "force-dynamic";

const JUMP_LINKS = [
  { href: "#this-week", label: "This week" },
  { href: "#reply", label: "Reply" },
  { href: "#people", label: "People" },
  { href: "#gates", label: "Gates" },
  { href: "#intake", label: "Intake" },
  { href: "#call", label: "Call" },
  { href: "#propose", label: "Propose" },
  { href: "#agree", label: "Agree" },
  { href: "#habits", label: "Habits" },
] as const;

export default async function PlaybookPage() {
  const email = await getSessionEmail();
  let activeGate: (typeof GATE_GUIDES)[number]["id"] | null = null;
  if (databaseConfigured()) {
    try {
      const active = await listActiveProjects();
      const raw = active[0]?.currentGate as ProjectGate | undefined;
      activeGate = raw ? toProcessGate(raw) : null;
    } catch (error) {
      console.error("Desk playbook gate query failed", error);
    }
  }
  const current = GATE_GUIDES.find((gate) => gate.id === activeGate) ?? null;
  const currentIndex = current
    ? GATE_GUIDES.findIndex((gate) => gate.id === current.id)
    : -1;

  return (
    <DeskShell
      email={email}
      mainClassName="space-y-12"
      beforeMain={
        <div className="sticky top-[var(--desk-header-height)] z-30 border-b border-gray-200 bg-white">
          <nav
            aria-label="Playbook sections"
            className={`${PAGE_FRAME_CLASS} overflow-x-auto contain-layout contain-paint py-3`}
          >
            <div className="w-0 min-w-full">
            <ul className="flex min-w-max gap-2">
              {JUMP_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={linkClassName("chip")}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            </div>
          </nav>
        </div>
      }
    >
        <header className="space-y-4">
          <h1 className="section-heading">Client discovery playbook</h1>
          <p className="text-lg leading-relaxed text-gray-700">
            Jobs run on Today, Clients, and Projects. This page is the written
            process — copy, gates, and habits — so nothing starts from a chat
            message. Public promise: Discover & Plan → Build & Test → Launch
            & Support.
          </p>
        </header>

        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5">
          <h2 className="mb-2 font-heading text-2xl text-dark-950">
            Treat them as a real client
          </h2>
          <p className="leading-relaxed text-gray-800">
            Workplace rapport is the risk, not the advantage. Favours skip discovery, skip deposit,
            and expand forever. Keep it off AGAHF time, devices, and data unless this is official
            work. If the daily user is not the buyer, a briefing from the buyer alone is not discovery.
          </p>
        </div>

        <section id="this-week" className="scroll-mt-[calc(var(--desk-header-height)+3.5rem)] space-y-4">
          <h2 className="section-heading">Do this week</h2>
          <p className="text-gray-600">
            Tick these off in the job, not here.{" "}
            <Link href="/" className={linkClassName("inline")}>
              Today
            </Link>
            {" · "}
            <Link href="/log" className={linkClassName("inline")}>
              Journal
            </Link>
            .
          </p>
          <ul className="space-y-2">
            {THIS_WEEK_REMINDERS.map((item) => (
              <li
                key={item}
                className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-700"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section id="reply" className="scroll-mt-[calc(var(--desk-header-height)+3.5rem)] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="section-heading">Send this first</h2>
            <CopyButton text={FIRST_REPLY} label="Copy reply" />
          </div>
          <p className="text-gray-700">
            Do not ask “what should I build?” Do not offer a free prototype.
            You run a process. They are hiring it.
          </p>
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp / email reply</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap font-sans leading-relaxed text-gray-800">
                {FIRST_REPLY}
              </pre>
            </CardContent>
          </Card>
        </section>

        <section id="people" className="scroll-mt-[calc(var(--desk-header-height)+3.5rem)] space-y-4">
          <h2 className="section-heading">Two people, two jobs</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <p className="text-sm font-medium text-gold-600">Buyer / liaison</p>
                <CardTitle>Buyer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-gray-700">
                <p>Pays, chases, and translates. Often over-specifies because they are not the daily user.</p>
                <p className="text-gray-600">
                  Ask for budget, deadline, and what “done” means. Do not let them design the daily user’s workflow from memory.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <p className="text-sm font-medium text-gold-600">User</p>
                <CardTitle>Daily user</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-gray-700">
                <p>If they will tap the screens, they must be in discovery — even 20 minutes on a call.</p>
                <p className="text-gray-600">
                  Watch them do today’s method. Note literacy, language, phone, and what they already trust. Build for that.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="gates" className="scroll-mt-[calc(var(--desk-header-height)+3.5rem)] space-y-4">
          <h2 className="section-heading">The seven gates</h2>
          <p className="text-gray-600">
            Live gate lives on the project. You do not enter Build until Agree is done.
            {current ? ` Current job is at ${current.label}.` : ""}
          </p>
          <div className="flex h-3 overflow-hidden rounded-full bg-gray-200" aria-hidden="true">
            <div className="w-2/3 bg-gold-500" title="Discover & Plan" />
            <div className="w-1/6 bg-gold-700" title="Build & Test" />
            <div className="w-1/6 bg-gray-400" title="Launch & Support" />
          </div>
          <p className="text-sm text-gray-500">4 plan · 1 build · 1 launch</p>
          <TableFrame>
            <table className={tableClassName}>
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Gate</th>
                  <th className="px-4 py-3 font-medium">Maps to site</th>
                  <th className="px-4 py-3 font-medium">Exit rule</th>
                </tr>
              </thead>
              <tbody>
                {GATE_GUIDES.map((gate, index) => (
                  <tr
                    key={gate.id}
                    data-current={gate.id === current?.id ? true : undefined}
                    className={cn(
                      currentIndex >= 0 &&
                        index < currentIndex &&
                        "text-gray-500",
                    )}
                  >
                    <td className="px-4 py-3 font-medium text-dark-950">{gate.label}</td>
                    <td className="px-4 py-3">{gate.publicStep}</td>
                    <td className="px-4 py-3">{gate.exitWhen}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableFrame>
          {current ? (
            <Card>
              <CardHeader>
                <p className="text-sm font-medium text-gold-600">{current.publicStep}</p>
                <CardTitle>{current.label}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="mb-1 font-semibold text-dark-950">You</h3>
                  <p className="text-gray-700">{current.youDo}</p>
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-dark-950">They</h3>
                  <p className="text-gray-700">{current.theyDo}</p>
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-dark-950">Leave this gate when</h3>
                  <p className="font-medium text-gray-900">{current.exitWhen}</p>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </section>

        <section id="intake" className="scroll-mt-[calc(var(--desk-header-height)+3.5rem)] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="section-heading">Intake — eight questions</h2>
            <CopyButton text={INTAKE_MESSAGE} label="Copy questions" />
          </div>
          <p className="text-gray-700">
            Send after the 15-min qualify. Written answers beat a chat dump. If they cannot answer
            “who uses it” and “what success looks like,” you do not have a project yet.
          </p>
          <TableFrame>
            <table className={tableClassName}>
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Theme</th>
                  <th className="px-4 py-3 font-medium">Ask</th>
                  <th className="px-4 py-3 font-medium">Why</th>
                </tr>
              </thead>
              <tbody>
                {INTAKE_QUESTIONS.map((item) => (
                  <tr key={item.theme} className="border-t border-gray-100 align-top">
                    <td className="px-4 py-3 font-medium text-dark-950">{item.theme}</td>
                    <td className="px-4 py-3">{item.ask}</td>
                    <td className="px-4 py-3 text-gray-600">{item.why}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableFrame>
        </section>

        <section id="call" className="scroll-mt-[calc(var(--desk-header-height)+3.5rem)] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="section-heading">Discovery call — 45 minutes</h2>
            <CopyButton text={afterCallMessage()} label="Copy follow-up" />
          </div>
          <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
            <TableFrame>
              <table className={tableClassName}>
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="w-16 px-4 py-3 font-medium">Mins</th>
                    <th className="px-4 py-3 font-medium">Block</th>
                  </tr>
                </thead>
                <tbody>
                  {DISCOVERY_AGENDA.map((item) => (
                    <tr key={item.block} className="border-t border-gray-100 align-top">
                      <td className="px-4 py-3 font-medium">{item.mins}</td>
                      <td className="px-4 py-3">{item.block}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableFrame>
            <div className="rounded-2xl border border-gray-200 bg-gray-200 p-5">
              <h3 className="mb-2 font-heading text-2xl text-dark-950">After the call</h3>
              <p className="leading-relaxed text-gray-800">
                Same day, send: (1) the problem sentence, (2) what is in / out, (3) when the options
                note will arrive. That message is the start of the project file.
              </p>
            </div>
          </div>
        </section>

        <section id="propose" className="scroll-mt-[calc(var(--desk-header-height)+3.5rem)] space-y-4">
          <h2 className="section-heading">Propose three shapes, not one quote</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {OPTION_KINDS.map((kind) => (
              <Card key={kind}>
                <CardHeader>
                  {kind === "recommended" ? (
                    <p className="text-sm font-medium text-gold-600">Default</p>
                  ) : null}
                  <CardTitle>{optionKindLabel(kind)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{optionStarter(kind)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-gray-600">
            Every option needs: what is included, what is not, timeline, price, deposit, and who
            provides content/data. If you cannot name a non-goal, the scope is not ready.
          </p>
        </section>

        <section id="agree" className="scroll-mt-[calc(var(--desk-header-height)+3.5rem)] space-y-4">
          <h2 className="section-heading">Agree — one page, then deposit</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <TableFrame>
              <table className={tableClassName}>
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">Clause</th>
                    <th className="px-4 py-3 font-medium">Keep it plain</th>
                  </tr>
                </thead>
                <tbody>
                  {AGREEMENT_CLAUSES.map((item) => (
                    <tr key={item.clause} className="border-t border-gray-100 align-top">
                      <td className="px-4 py-3 font-medium text-dark-950">{item.clause}</td>
                      <td className="px-4 py-3">{item.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableFrame>
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
              <h3 className="mb-2 font-heading text-2xl text-dark-950">Do not start the build unpaid</h3>
              <p className="leading-relaxed text-gray-800">
                Someone who “trusts you” is the easiest person to undercharge. Deposit is respect,
                not distrust. If they cannot pay a deposit, it is not a project — it is a maybe.
              </p>
            </div>
          </div>
        </section>

        <section id="habits" className="scroll-mt-[calc(var(--desk-header-height)+3.5rem)] space-y-4">
          <h2 className="section-heading">Fine-tune the business, not just this job</h2>
          <p className="text-gray-700">
            Extra gates stay on this page. After each client, reuse the same message, eight
            questions, agenda, and one-pager.
          </p>
          <TableFrame>
            <table className={tableClassName}>
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Habit</th>
                  <th className="px-4 py-3 font-medium">Do this every client</th>
                  <th className="px-4 py-3 font-medium">Stop doing</th>
                </tr>
              </thead>
              <tbody>
                {PRACTICE_HABITS.map((item) => (
                  <tr key={item.habit} className="border-t border-gray-100 align-top">
                    <td className="px-4 py-3 font-medium text-dark-950">{item.habit}</td>
                    <td className="px-4 py-3">{item.doThis}</td>
                    <td className="px-4 py-3 text-gray-600">{item.stopDoing}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableFrame>
        </section>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <h2 className="mb-2 font-heading text-2xl text-dark-950">
            If this is actually AGAHF / clinical work
          </h2>
          <p className="leading-relaxed text-gray-800">
            Patient data, incident reports, first-aid posts, or anything that should live on
            foundation systems is not a side project. That needs official approval, hosting, and
            access control. Do not mix family-and-favour energy with clinical records.
          </p>
        </div>

        <section className="space-y-4">
          <h2 className="section-heading">What good looks like</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="p-5">
                <p className="font-heading text-2xl text-gold-500">1 sentence</p>
                <p className="mt-2 text-sm text-gray-600">
                  Shared problem statement both of you can repeat
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="font-heading text-2xl text-gold-500">3 options</p>
                <p className="mt-2 text-sm text-gray-600">
                  Written before any repository is created
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="font-heading text-2xl text-gold-500">User present</p>
                <p className="mt-2 text-sm text-gray-600">
                  At least once before you design screens
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
    </DeskShell>
  );
}
