# Changelog

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
