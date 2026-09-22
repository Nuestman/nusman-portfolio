# Changelog

## 21 Sep 2026 — Desk 2.7.0 / Portal 1.7 · public 4.3.0

### Desk / Portal (`admin/` → **2.7.0**)

- **Person email confirmation** — migration `0020_person_email_verified` (`people.email_verified_at` + 48h confirm token). Portal needs a confirmed email **and** `portal_enabled`. Desk blocks Portal enable until then (**Confirm email** / **Resend confirmation**). Confirm from Desk emails a notice; Resend sends the verify link. Login on an unconfirmed address sends verify instead of a magic link (`/auth/verify-email`). Changing the person email clears confirmation. Inbound email confirm still activates the project and now marks matching people verified. Only inbound-confirmed drafts were backfilled — Desk-added people start unverified.
- **Person profiles** — Desk `/clients/[id]/people/[personId]` (stacked You card, details, hiring party, projects, notes, Portal access). Name in the people list opens the profile. Portal `/profile` uses the same layout (organisation + that client’s projects; client-facing stage labels).
- **What we’re building** — migration `0019_project_want_built`. Brief / Qualify / Portal brief show the field (copied from inbound drafts / old notes where present).
- **Locked brief** — more client-facing fields (who it is for, needed by, budget, call/meet, notes); empty values use the unset mark + **Incomplete info** badge; Fill details while intake is open.
- **Account menu** — signed-in name at the top of the panel; chip `aria-label` uses the name.
- **Narrow layout** — Desk/Portal `main` is a `minmax(0,1fr)` grid; table cards (`TableFrame`) isolate min-content with `contain: layout paint` so tables scroll inside the card without widening the document canvas (empty strip beside `body` in Firefox). Hiring party emails wrap inside the card. `PAGE_FRAME_CLASS` stays width/gutter only so flex headers (Portal home) still sit in a row.

Public site **4.3.0** is unchanged.

---

## 21 Sep 2026 — Desk 2.6.0 / Portal 1.6 · public 4.3.0

### Desk / Portal (`admin/` → **2.6.0**)

- **Inbound on submit** — `/start` creates the client, buyer, and project immediately (`inactive`). Confirming email (visitor link or Desk) activates that same project and sends the receipt. Re-submit of the same open email reuses the project (one open draft per email — `0018_inbound_draft_email_open`). Direct `POST /api/inbound-lead` uses the same path as `/draft`.
- **Pending email** — client and project pages show a banner with **Confirm email** and **Resend confirmation** (Desk session actions; not a public inbound subroute). Stage moves stay locked while inactive.
- **Project status `inactive`** — migration `0017_project_status_inactive`. Lists highlight inactive clients/projects (`data-inactive` gold wash + Inactive pill).
- **Hiring party** — redesigned client view (name, gold org, source pill, notes). Empty organisation, source, email, phone, and notes stay visible as “—” so missing details are not hidden.

### Public site (**4.3.0**)

- `/start` — submit lands the request on Desk as inactive, then asks for email confirm. `/start/continue` only activates (idempotent). Copy matches that flow.

---

## 21 Sep 2026 — Desk 2.5.0 / Portal 1.5 · public 4.2.0

### Desk / Portal (`admin/` → **2.5.0**)

- **Inbound draft → verify** — migrations `0015_inbound_lead_drafts` + `0016_inbound_draft_brief`. Public `/start` saves the full brief as a draft; confirm-link `POST /api/inbound-lead/verify` creates the Desk lead and sends the receipt. Resend rotates the verify token. Direct `POST /api/inbound-lead` remains for trusted callers.
- **Client source** — migration `0014_client_source_social` (`social_media`). Other and Social media require a detail line.
- **Shared selects** — `NOT_SURE_YET` stored as text (not blank) for timeline/budget on Portal start and Qualify; week-based timeline (+ Flexible / Enter manually); GH₵ budget ranges.
- **Portal / Desk chrome** — marketing home URL via `marketingPublicBaseUrl()`; PageSpread profile split from `md` (768px).

### Public site (**4.2.0**)

- `/start` — four-step brief (About you [incl. source] → Challenge → Outcome → Timing & budget), then post-submit “confirm your email”; `/start/continue` verifies and lands the lead. Gold progress indicator (step label + bar + checkpoints). Email + phone on one row. Timeline/budget default to “Not sure yet”.

---

## 20 Sep 2026 — Desk 2.4.0 / Portal 1.4 · public 4.1.3

### Desk / Portal (`admin/` → **2.4.0**)

- **Canvas** — Desk and Portal share a `max-w-[1400px]` frame (`PAGE_FRAME_CLASS`). PageSpread (intro + optional rail) on most screens; Portal brief / questions stay a centered `max-w-3xl` reading column.
- **Project page** — work column plus sticky notes timeline (`project-timeline` + `scroll-chain`). Card titles are gold Odibee; card header actions are outline buttons.
- **You card** — shared `profile-you-view`: Desk stacks in the rail; Portal splits photo + large type. Missing photos use `/avatars/default-user.png` (gold circle, white silhouette, no ring).
- **Account chrome** — avatar chip includes the notifications bell and unread count; Notifications row in the menu shows the same bubble.
- **Portal Progress** — stage heading, gold bar, problem/success panel, gold-spine checkpoints (done / current / upcoming). No strikethrough list.
- **Portal schedule** — project schedule matches Desk cards; confirm / decline / cancel with `next` return.
- **Project brief vs questions** — `/projects/[id]/brief` is the locked client document (package, deadline, problem, success, in/out scope; empty fields show “—”). `/projects/[id]/intake` is the questions form only, and only while intake is open. Dual-mode alias under Desk `/projects/[id]/brief`.
- **Messages** — Plain / rich composer (`MessageComposer`). Rich mode is self-hosted TinyMCE 8 GPL (`licenseKey="gpl"`), copied to `public/tinymce` on install/build (gitignored). Toolbar: headings, bold/italic/underline/strike, lists, checklist, blockquote, code sample, link, table. HTML is sanitized on save and on render (`sanitize-html`); inbox previews and email alerts use plain-text excerpts.
- **Client source** — migration `0013_client_source_expand` (`family_friends`, `work_colleague`). Public `/start` and Desk client form share heard-about options.
- **Shared selects** — `form-options.ts`: week-based timeline (+ Flexible / Enter manually), GH₵ budget ranges on Qualify, Portal start-project, and public `/start`; operator titles on Profile.

### Public site (**4.1.3**)

- `/start` — GH₵ budget; timeline in weeks + Flexible + Enter manually; Social media source (asks which platform); no “(optional)” labels on phone / org / timeline / budget.

---

## 17 Sep 2026 — Desk 2.2.0 / Portal 1.2 · public 4.1.2

### Desk / Portal (`admin/` → **2.2.0**)

- **In-app notifications** — migration `0012_notifications`; Desk + Portal `/notifications` (feed + table views). System events that email also write inbox rows; Desk can compose manual notices. Edit only if you sent it; Portal is mark-read / delete only.
- **Email branding** — shared HTML wrapper + CID-attached square logo (`email-brand.ts`); stage and milestone alerts use the same on-brand layout and logging.
- **Chrome** — Notifications and Playbook live in the account menu (not main nav). Portal account menu includes Notifications.

### Public site (**4.1.2**)

- **What I Do** intro copy kept; section intros removed from FAQ, What Clients Say, and What I Work With.
- Testimonials heading: **What Clients Say**.
- Portfolio link hidden from header, footer, and sitemap until case studies ship (`/portfolio` route kept).
- Dedicated `/resume` page from CV content; About links to it; PDF download lives on the resume page.

---

## 16 Sep 2026 — Desk 2.1.0 / Portal 1.1 · public 4.1.1

### Desk / Portal (`admin/` → **2.1.0**)

- **Process milestones** — `project_milestones` (`0010`); sequential tick/reopen; seeded defaults including “Qualified — real job”. Qualify outcome **Real** auto-completes that milestone (and reopens when leaving Real if later checkpoints are still open).
- **Gate remap** — `0011`: intake → discover; propose/agree → plan. Playbook / GateSwitcher follow the thinner process.
- **Qualify “no”** — disqualifies the job (Lost), locks pipeline; reopening Qualify restores Active.
- **Email (Resend)** — shared mailer (`mail.ts` / `notify-email.ts`): magic links, inbound lead receipt, portal access, messages, schedule, milestones. Verified `PORTAL_FROM_EMAIL` required (not personal iCloud unless verified in Resend).
- **Desk Messages** — compose new conversation (`/messages/new`); inbox workspace polish.
- **Portal** — start a project (`/projects/new`); Messages hub aligned with Desk; project detail soft-nav 404 fixed (dual-mode `/projects*` + `shouldServePortalUi`; see [portal.md](./portal.md#later--routing-cleanup-best-practice)).
- Magic links always finish on the Portal origin (`PORTAL_APP_URL` / `portal.localhost`).

### Public site (**4.1.1**)

- Homepage section renamed **What I Do** (component `WhatIDo`).

---

## 16 Sep 2026 — Desk 2.0.0

Surfaces model locked in [desk-2.0.md](./desk-2.0.md). Desk **2.0.0** ships:

- **Project page reshape** — current gate first, Earlier stages, timeline, portal strip; GateSwitcher chips only  
- **Scheduler** — `0009_project_events`; Desk + Portal `/schedule` hubs (Cards / Calendar via `react-big-calendar`); per-project schedule; confirm / decline / cancel / request; Today **Next 7 days** teaser  
- On-brand confirm dialogs (no native browser alerts)  

---

## 15 Sep 2026 — Desk 1.3.0 / Portal 1.0 · public 4.1.0

### Desk / Portal (`admin/` → **1.3.0**)

- **Portal 1.0** on the same Next app as Desk (`portal.nusman.dev` / `portal.localhost`). Magic-link login for `people`, progress, intake when open, messages. Migration `0008_portal.sql`.
- **Desk `/messages`** inbox + `/messages/[projectId]` chat UI (conversation list, bubbles, composer). Project “Client portal” card links out instead of nesting replies.
- **Portal chrome** matches Desk header (account chip → Profile / Sign out). Portal `/profile` is read-only person details.
- **Options:** Desk package cards show price, timeline, in/out scope; client summary is required and cannot be the Desk coaching starter. Portal shows **Your package** with client-facing fields only.
- Standalone “Numan” addressing → **Usman** in UI copy (full name **Numan Usman** unchanged).
- **Public inbound:** `POST /api/inbound-lead` from nusman.dev `/start` (CORS, honeypot, rate limit) creates client, buyer, qualify project, note, audit, optional Resend alert.

Prior plan snapshot: [archive/desk-1.1.md](./archive/desk-1.1.md). Living portal plan: [portal.md](./portal.md). Status: [desk-status.md](./desk-status.md).

### Public site (**4.1.0**)

- `/start` — Start a project form → Desk inbound API. Hero + ReadyToBuild CTAs point here; Contact stays Formspree/mailto.
- Portal link in header/footer (`VITE_PORTAL_URL`). Hero accent **Usman.**

---

## 15 Sep 2026 — Desk 1.1.0

Auth harden (Phase 13).

- Env `ADMIN_PASSWORD` is bootstrap-only: after the owner hash exists, only the scrypt hash signs in.
- Proxy, pages, and mutations require a live `sessions` row; revoked cookies stop working immediately.
- Optional TOTP authenticator on Profile (QR setup, recovery codes). Login asks for a code after the password when enabled. `drizzle/0007_totp.sql`.
- Node pinned to `24.x`; `allowScripts` for install-script deps; esbuild override for the nested advisory.
- Vercel CI: layout types without `LayoutProps`, no `setState` in effects for menus / confirm portals.

Status: [desk-status.md](./desk-status.md). Plan: [desk.md](./desk.md).

---

## 15 Sep 2026 — Desk 1.0.0

Private workbench at `desk.nusman.dev` (`admin/`, Next.js). Neon **nusmandotdev** only.

Hiring jobs with gate records, Journal (route `/log`), audit with before/after and confirm-on-delete, multi-format export, own products as records, operator Profile with photo and devices (`sessions`), account menu in the header (grey chip; Profile / Journal / Sign out). Phases 0–12.

What’s live vs still open: [desk-status.md](./desk-status.md). Plan: [desk.md](./desk.md).

---

## 13 Sep 2026 — Review fixes

Live checks used `http://localhost:5173`.

### High

**Testimonials 404.** Avatars pointed at `/images/about-imgs/…`, which is not in `public/`. The PNG files are not in the repo. The carousel now uses initials plus the AngloGold logo (and a UVTI text badge). Prev/next and dots have accessible names.

**Unused story photos.** Four large photos were unused; `About.tsx` duplicated About page copy. Shared `src/data/story.ts` now drives four About tabs with photos. Dead `About.tsx` was removed. `story-emnurse.jpg` is lowercase for Linux/Vercel.

**Contact form honesty.** The mailto fallback used to say “sent successfully”; failures were `console.error` only. There are now three statuses: Formspree success, mailto draft opened, or a visible error. Fields have labels. Set `VITE_FORMSPREE_ID` on Vercel for server submit.

**SEO URLs.** Open Graph, Twitter, and JSON-LD pointed at GitHub. Canonical, OG, Twitter, JSON-LD, `robots.txt`, and `sitemap.xml` use `https://nusman.dev`. Each route sets its own `document.title`.

**PWA manifest.** Empty name; icons at `/android-chrome-*.png`. Name is `Numan Usman`; icons live under `/favicon/`.

**No 404.** Unknown paths rendered an empty layout. `NotFoundPage` handles `*`.

**Footer placeholder social links.** Instagram and Twitter `#` links were removed. GitHub, LinkedIn, and Facebook remain, each with `aria-label`.

### Medium

Skip link, form labels, FAQ and menu ARIA, testimonial controls, hero `aria-live`, `prefers-reduced-motion`, and Framer `MotionConfig reducedMotion="user"`.

Removed unused `formatDate` / `debounce` / `throttle` and `@types/react-router-dom` v5 (React Router 7 ships types).

What I Can Do, My Process, and FAQ CTAs use `<Link>`. HIPAA wording was replaced with privacy-conscious copy. FAQ testing claim matches lint, TypeScript, and unit tests.

### Low

Google Fonts load only from `index.html`. Routes besides Home are lazy-loaded. Portfolio is an honest “case studies coming” page and a first-class nav item. Tailwind content paths only scan `src/` and `index.html`. `npm run lint:fix` and `npm test` added. Vitest 5; `npm audit` reports 0.
