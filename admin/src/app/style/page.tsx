import type { ReactNode } from "react";
import Image from "next/image";
import { getSessionEmail } from "@/lib/auth";
import { DeskShell } from "@/components/desk-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fieldClassName, labelClassName } from "@/lib/forms";
import { linkClassName } from "@/lib/links";
import { PAGE_FRAME_CLASS } from "@/lib/layout";
import { tableClassName, tableFrameClassName } from "@/lib/tables";
import { cn } from "@/lib/utils";
import {
  ACCESS_RULES,
  BRAND_SURFACES,
  BUTTON_VARIANTS,
  COLOUR_RULES,
  GOLD_SWATCHES,
  IMPLEMENTING_STEPS,
  INK_SWATCHES,
  LAYOUT_RULES,
  LINK_KINDS,
  MOTION_RULES,
  NEUTRAL_SWATCHES,
  SHAPE_RULES,
  STYLE_JUMP_LINKS,
  TYPE_DESK_SCALE,
  TYPE_FAMILIES,
  TYPE_PUBLIC_SCALE,
  TYPE_SPECIMENS,
  VOICE_DO,
  VOICE_DONT,
} from "@/lib/style-guide";

export const dynamic = "force-dynamic";

const SECTION =
  "scroll-mt-[calc(var(--desk-header-height)+3.5rem)] space-y-6";

function Swatch({
  token,
  hex,
  className,
  use,
  invert = false,
}: {
  token: string;
  hex: string;
  className: string;
  use: string;
  invert?: boolean;
}) {
  return (
    <li className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div
        className={cn(
          "flex h-24 items-end px-4 py-3",
          className,
          invert ? "text-white" : "text-dark-950",
        )}
      >
        <p className="font-heading text-lg">{token}</p>
      </div>
      <div className="space-y-1 px-4 py-3 text-sm">
        <p className="font-medium text-dark-950">{hex}</p>
        <p className="text-gray-600">{use}</p>
      </div>
    </li>
  );
}

function SpecTable({
  headers,
  rows,
  firstColumnCode = false,
}: {
  headers: readonly string[];
  rows: readonly (readonly ReactNode[])[];
  firstColumnCode?: boolean;
}) {
  return (
    <div className={tableFrameClassName}>
      <table className={tableClassName}>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className={
                    cellIndex === 0
                      ? "font-medium text-dark-950"
                      : "text-gray-700"
                  }
                >
                  {firstColumnCode && cellIndex === 0 ? (
                    <code className="text-sm">{cell}</code>
                  ) : (
                    cell
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function StylePage() {
  const email = await getSessionEmail();

  return (
    <DeskShell
      email={email}
      mainClassName="space-y-12"
      beforeMain={
        <div className="sticky top-[var(--desk-header-height)] z-30 border-b border-gray-200 bg-white">
          <nav
            aria-label="Style sections"
            className={`${PAGE_FRAME_CLASS} overflow-x-auto py-3`}
          >
            <ul className="flex min-w-max gap-2">
              {STYLE_JUMP_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className={linkClassName("chip")}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      }
    >
      <div>
        <h1 className="section-heading">Style</h1>
        <p className="mt-2 max-w-2xl text-gray-700">
          Live specimens for the Nusman brand. Same tokens as{" "}
          <code className="text-sm text-dark-950">docs/style-guide.md</code>.
          Public site is warm and personal. Desk is the same brand used as a
          tool — quieter, denser, no marketing theatre.
        </p>
      </div>

      <section id="brand" className={SECTION}>
        <h2 className="section-heading">Brand</h2>
        <p className="text-gray-700">
          Numan Usman — gold on near-black, Inter for reading, Odibee Sans for
          voice. Favicons live under{" "}
          <code className="text-sm text-dark-950">/favicon/</code>.
        </p>
        <SpecTable
          headers={["Surface", "Where", "Tone"]}
          rows={BRAND_SURFACES}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Wide — nav</p>
            <Image
              src="/logos/nusman-logo-wide.png"
              alt="Numan Usman"
              width={220}
              height={64}
              className="mt-4 h-12 w-auto object-contain"
              style={{ width: "auto" }}
            />
          </div>
          <div className="rounded-2xl border border-gray-200 bg-dark-950 p-6 shadow-sm">
            <p className="text-sm text-white/60">Square — white tile on dark</p>
            <div className="mt-4 inline-flex rounded-lg bg-white p-2">
              <Image
                src="/logos/nusman-logo-square.png"
                alt="Numan Usman square logo"
                width={64}
                height={64}
                className="h-16 w-16 object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="colour" className={SECTION}>
        <h2 className="section-heading">Colour</h2>
        <p className="text-gray-700">
          Primary gold is{" "}
          <code className="text-sm text-dark-950">#B98C1B</code> (
          <code className="text-sm text-dark-950">gold-500</code>). Ink is{" "}
          <code className="text-sm text-dark-950">#150F00</code> (
          <code className="text-sm text-dark-950">dark-950</code> and{" "}
          <code className="text-sm text-dark-950">gold-950</code> — same hex).
          Neutrals are default Tailwind gray.{" "}
          <code className="text-sm text-dark-950">gray-200</code> is a
          brand-adjacent fill: structure behind content, not a second accent.
        </p>
        <h3 className="font-heading text-2xl text-dark-950">Gold</h3>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GOLD_SWATCHES.map((swatch) => (
            <Swatch key={swatch.token} {...swatch} />
          ))}
        </ul>
        <h3 className="font-heading text-2xl text-dark-950">Ink</h3>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {INK_SWATCHES.map((swatch) => (
            <Swatch key={swatch.token} {...swatch} />
          ))}
        </ul>
        <h3 className="font-heading text-2xl text-dark-950">Neutrals</h3>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {NEUTRAL_SWATCHES.map((swatch) => (
            <Swatch key={swatch.token} {...swatch} />
          ))}
        </ul>
        <div className="rounded-2xl bg-dark-950 p-6 text-white">
          <p className="font-heading text-2xl text-gold-500">On dark</p>
          <p className="mt-2 text-white/80">
            Gold type or white/80 body. Icons gold-400. Footer meta white/60.
          </p>
          <p className="mt-3 text-sm text-white/60">
            Semantic vars: primary tracks gold (45 86% 40%). Ring matches gold.
            Radius --radius: 0.5rem.
          </p>
        </div>
        <ul className="space-y-2 text-gray-700">
          {COLOUR_RULES.map((rule) => (
            <li
              key={rule}
              className="rounded-xl border border-gray-200 bg-white px-4 py-3"
            >
              {rule}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-green-600 px-3 py-1.5 text-sm text-white">
            Done
          </span>
          <span className="rounded-full bg-amber-100 px-3 py-1.5 text-sm text-amber-950">
            In progress
          </span>
          <span className="rounded-full bg-red-500 px-3 py-1.5 text-sm text-white">
            Destructive
          </span>
        </div>
      </section>

      <section id="type" className={SECTION}>
        <h2 className="section-heading">Type</h2>
        <p className="text-gray-700">
          <code className="text-sm text-dark-950">.font-heading</code> forces
          weight 400. Odibee has one cut. Do not bold it expecting a heavier
          file — size and colour carry hierarchy.
        </p>
        <SpecTable
          headers={["Role", "Family", "Tailwind"]}
          rows={TYPE_FAMILIES}
        />
        <ul className="space-y-6">
          {TYPE_SPECIMENS.map((item) => (
            <li
              key={item.label}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className={cn("mt-3", item.className)}>{item.sample}</p>
              <p className="mt-3 text-sm text-gray-600">{item.note}</p>
            </li>
          ))}
        </ul>
        <h3 className="font-heading text-2xl text-dark-950">Public marketing</h3>
        <SpecTable headers={["Use", "Classes"]} rows={TYPE_PUBLIC_SCALE} />
        <h3 className="font-heading text-2xl text-dark-950">Desk</h3>
        <SpecTable headers={["Use", "Classes"]} rows={TYPE_DESK_SCALE} />
      </section>

      <section id="layout" className={SECTION}>
        <h2 className="section-heading">Layout</h2>
        <SpecTable headers={["Rule", "Value"]} rows={LAYOUT_RULES} />
      </section>

      <section id="shape" className={SECTION}>
        <h2 className="section-heading">Shape</h2>
        <p className="text-gray-700">
          Desk: cards rounded-2xl, buttons rounded-md, pills rounded-full.
          Shadows: shadow-sm on cards. Marketing may use shadow-lg on hover. No
          neon glow.
        </p>
        <SpecTable headers={["Element", "Radius"]} rows={SHAPE_RULES} />
        <div className="flex flex-wrap items-end gap-4">
          <div className="rounded-md bg-gold-500 px-4 py-2 text-sm text-white">
            Button
          </div>
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm">
            Input
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-4 text-sm shadow-sm">
            Card
          </div>
          <div className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm">
            Pill
          </div>
        </div>
      </section>

      <section id="nav" className={SECTION}>
        <h2 className="section-heading">Nav</h2>
        <p className="text-gray-700">
          Header items:{" "}
          <code className="text-sm text-dark-950">linkClassName(&quot;nav&quot;)</code>
          {" / "}
          <code className="text-sm text-dark-950">
            linkClassName(&quot;navActive&quot;)
          </code>
          . The live header is the specimen. Compact (&lt;500px): hamburger,
          square logo, no “Desk” wordmark. 500px–1023px: stacked centred logo +
          wrapping nav. 1024px+: one row (logo + nav). The operator photo is a
          grey chip at the end of the nav and opens Profile, Journal, and Sign
          out.
        </p>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <ul className="flex flex-wrap items-end gap-8">
            <li className="space-y-2">
              <p className="text-sm text-gray-500">Rest</p>
              <p className={linkClassName("nav")}>Projects</p>
            </li>
            <li className="space-y-2">
              <p className="text-sm text-gray-500">Hover</p>
              <p className="font-heading text-lg font-medium text-gold-500">
                Playbook
              </p>
            </li>
            <li className="space-y-2">
              <p className="text-sm text-gray-500">Current page</p>
              <p className={linkClassName("navActive")}>Style</p>
            </li>
          </ul>
        </div>
      </section>

      <section id="links" className={SECTION}>
        <h2 className="section-heading">Links</h2>
        <p className="text-gray-700">
          Desk text links are gold and underlined at rest. Use{" "}
          <code className="text-sm text-dark-950">linkClassName</code>. Gold
          fill that navigates is a button. Public on dark chrome: text-white/80
          hover:text-gold-400.
        </p>
        <SpecTable
          headers={["Kind", "Use", "Look"]}
          rows={LINK_KINDS}
          firstColumnCode
        />
        <ul className="space-y-6">
          <li className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Inline</p>
            <p className="mt-3 text-gray-700">
              Tick these off in the job, not here.{" "}
              <a href="#links" className={linkClassName("inline")}>
                Today
              </a>
              {" · "}
              <a href="#links" className={linkClassName("inline")}>
                Journal
              </a>
              .
            </p>
          </li>
          <li className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Back</p>
            <p className="mt-3">
              <a href="#links" className={linkClassName("back")}>
                ← Clients
              </a>
            </p>
          </li>
          <li className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Table name</p>
            <p className="mt-3">
              <a href="#links" className={linkClassName("table")}>
                Practice system
              </a>
            </p>
          </li>
          <li className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Button as text</p>
            <p className="mt-3">
              <Button variant="link">Open journal</Button>
            </p>
          </li>
          <li className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Chip</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a href="#links" className={linkClassName("chip")}>
                All gates
              </a>
              <a href="#links" className={linkClassName("chipActive")}>
                2. Discover
              </a>
            </div>
          </li>
        </ul>
      </section>

      <section id="buttons" className={SECTION}>
        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-gray-600">
              One primary per view. Gold fill is the action. Outline or gray
              for the rest. Red only to delete. Sizes: sm h-9, default h-10, lg
              h-11 px-8 (marketing). Focus: gold ring.
            </p>
            <SpecTable
              headers={["Variant", "Look"]}
              rows={BUTTON_VARIANTS}
              firstColumnCode
            />
            <div className="flex flex-wrap gap-3">
              <Button>Primary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
              <Button variant="destructive">Delete</Button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Small</Button>
              <Button>Default</Button>
              <Button size="lg">Large</Button>
              <Button disabled>Disabled</Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section id="cards" className={SECTION}>
        <Card>
          <CardHeader>
            <CardTitle>Cards</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              <code className="text-sm text-dark-950">rounded-2xl</code>,
              gray-200 border, white fill,{" "}
              <code className="text-sm text-dark-950">shadow-sm</code>. Header{" "}
              <code className="text-sm text-dark-950">p-6</code>, content{" "}
              <code className="text-sm text-dark-950">p-6 pt-0</code>. Titles
              Odibee at 2xl in gold-500. Descriptions text-sm text-gray-600. Desk home
              widgets stay on white. Header-right actions use outline sm.
            </p>
            <div className="rounded-xl bg-gray-200 p-4 text-sm">
              Quiet fills use gray-200, not a second accent.
            </div>
            <div className="rounded-2xl bg-dark-950 p-6 text-white">
              <p className="font-heading text-2xl">On dark</p>
              <p className="mt-2 text-sm text-white/80">
                Invert to bg-white/[0.06] or bg-dark-950 with text-white.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section id="forms" className={SECTION}>
        <Card>
          <CardHeader>
            <CardTitle>Forms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-sm text-gray-600">
              <code className="text-sm text-dark-950">
                w-full px-4 py-3 bg-white border border-gray-200 rounded-lg
                focus:ring-2 focus:ring-gold-500 focus:border-gold-500
              </code>
              . Labels: text-sm font-medium text-dark-950 mb-2. Required fields
              stay required. Errors: red-700 text, red-100 panel — never silent.
            </p>
            <div>
              <label htmlFor="style-name" className={labelClassName}>
                Name
              </label>
              <input
                id="style-name"
                name="style-name"
                defaultValue="Thanks Nkunim"
                className={fieldClassName}
                autoComplete="off"
                required
              />
            </div>
            <div>
              <label htmlFor="style-notes" className={labelClassName}>
                Notes
              </label>
              <textarea
                id="style-notes"
                name="style-notes"
                rows={3}
                className={fieldClassName}
                defaultValue="Errors use a red panel. Never fail silently."
              />
            </div>
            <p
              className="rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700"
              role="status"
            >
              Email does not look right.
            </p>
          </CardContent>
        </Card>
      </section>

      <section id="table" className={SECTION}>
        <h2 className="section-heading">Tables</h2>
        <p className="text-gray-700">
          White frame, rounded-2xl, gray-200 border. Header gray-50. Cells px-4
          py-3. Even rows and hover: gray-50. Current row: gold-50. Inactive
          row: gold wash via{" "}
          <code className="text-sm text-dark-950">data-inactive</code>. Do not
          zebra in gold. Use{" "}
          <code className="text-sm text-dark-950">desk-table</code>. Names in
          cells use table links. Last column is Actions (Edit / Remove).
        </p>
        <div className={tableFrameClassName}>
          <table className={tableClassName}>
            <thead>
              <tr>
                <th>Project</th>
                <th>Gate</th>
                <th>Status</th>
                <th className="text-right">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <a href="#table" className={linkClassName("table")}>
                    Practice system
                  </a>
                </td>
                <td className="text-gray-700">1. Qualify</td>
                <td className="text-gray-700">Active</td>
                <td className="text-right">
                  <a href="#table" className={linkClassName("back")}>
                    Edit
                  </a>
                </td>
              </tr>
              <tr data-current={true}>
                <td>
                  <a href="#table" className={linkClassName("table")}>
                    Thanks Nkunim
                  </a>
                </td>
                <td className="text-gray-700">2. Discover</td>
                <td className="text-gray-700">Active</td>
                <td className="text-right">
                  <a href="#table" className={linkClassName("back")}>
                    Edit
                  </a>
                </td>
              </tr>
              <tr>
                <td>
                  <a href="#table" className={linkClassName("table")}>
                    Mineaid
                  </a>
                </td>
                <td className="text-gray-700">6. Launch & Support</td>
                <td className="text-gray-700">Active</td>
                <td className="text-right">
                  <a href="#table" className={linkClassName("back")}>
                    Edit
                  </a>
                </td>
              </tr>
              <tr>
                <td>
                  <a href="#table" className={linkClassName("table")}>
                    Uventory
                  </a>
                </td>
                <td className="text-gray-700">5. Build</td>
                <td className="text-gray-700">Paused</td>
                <td className="text-right">
                  <a href="#table" className={linkClassName("back")}>
                    Edit
                  </a>
                </td>
              </tr>
              <tr data-inactive={true}>
                <td>
                  <span className="inline-flex flex-wrap items-center gap-2">
                    <a href="#table" className={linkClassName("table")}>
                      Inbound brief
                    </a>
                    <span className="inline-flex rounded-full border border-gray-200 bg-gray-100 px-2 py-0.5 text-[11px] font-medium tracking-wide text-gray-600">
                      Inactive
                    </span>
                  </span>
                </td>
                <td className="text-gray-700">1. Qualify</td>
                <td className="text-gray-700">Inactive</td>
                <td className="text-right">
                  <a href="#table" className={linkClassName("back")}>
                    Edit
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-gray-600">
          Second row is current (gold-50). Last row is inactive (gold wash).
          Hover any other row for gray-50 — the same tint as even zebra rows,
          not gold.
        </p>
      </section>

      <section id="pills" className={SECTION}>
        <h2 className="section-heading">Pills</h2>
        <p className="text-gray-700">
          rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm.
          Active: gold fill, white text. Disabled / skipped: gray-100, gray-500.
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-gold-500 bg-gold-500 px-3 py-1.5 text-sm text-white">
            2. Discover
          </span>
          <button
            type="button"
            className="cursor-pointer rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-dark-950 hover:border-gold-500"
          >
            1. Qualify
          </button>
          <span
            title="Move one stage at a time. Do not skip."
            className="rounded-full border border-gray-200 bg-gray-100 px-3 py-1.5 text-sm text-gray-500"
          >
            3. Plan
          </span>
        </div>
      </section>

      <section id="motion" className={SECTION}>
        <h2 className="section-heading">Motion</h2>
        <p className="text-gray-700">
          Public uses Framer Motion with{" "}
          <code className="text-sm text-dark-950">
            MotionConfig reducedMotion=&quot;user&quot;
          </code>
          . Desk does not.
        </p>
        <SpecTable headers={["Context", "Motion"]} rows={MOTION_RULES} />
      </section>

      <section id="imagery" className={SECTION}>
        <h2 className="section-heading">Imagery</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Public</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-700">
              Caricature portraits in public/images/portraits/, story photos,
              logos. They are part of the marketing voice.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Desk</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-700">
              Logo in the chrome. The operator photo is identity: Profile, and
              the last nav item (account menu). Users without a photo use
              /avatars/default-user.png — gold-500 fill, white silhouette, no ring. The
              account badge shows the notification bell and unread count.
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="voice" className={SECTION}>
        <h2 className="section-heading">Voice</h2>
        <p className="text-gray-700">
          Direct. Process language matches the site. Ghana English is fine.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Do</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-700">
              {VOICE_DO.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Don’t</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-700">
              {VOICE_DONT.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="access" className={SECTION}>
        <h2 className="section-heading">Access</h2>
        <ul className="space-y-2 text-gray-700">
          {ACCESS_RULES.map((rule) => (
            <li
              key={rule}
              className="rounded-xl border border-gray-200 bg-white px-4 py-3"
            >
              {rule}
            </li>
          ))}
        </ul>
      </section>

      <section id="rules" className={SECTION}>
        <h2 className="section-heading">Using this</h2>
        <p className="text-gray-700">
          If marketing and Desk drift, Desk follows this guide. Tokens live in
          admin globals — do not import marketing CSS at runtime. Check a list
          page, a form, and login against this page before calling a slice done.
        </p>
        <ol className="list-decimal space-y-2 pl-5 text-gray-700">
          {IMPLEMENTING_STEPS.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>
    </DeskShell>
  );
}
