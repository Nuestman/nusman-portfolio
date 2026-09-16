# Portal — client app plan

Living plan for the **client portal** at **portal.nusman.dev**. Same Next app as Desk (`admin/`), same Neon **nusmandotdev**, same brand ([style-guide.md](./style-guide.md)). Update this file when a decision changes.

Operator workbench: [desk.md](./desk.md). Prior Desk plan (no portal): [archive/desk-1.1.md](./archive/desk-1.1.md).

**Next major cut (thin portal + scheduler):** [desk-2.0.md](./desk-2.0.md) — **that file wins** where it conflicts with this one.

---

## Why this exists

Clients need a place to see progress, answer intake questions, and leave messages without seeing Desk (audit, journal, export, other clients).

Desk stays Usman’s workbench. Portal is invite-only for `people` on a client.

---

## Locked decisions

| Topic | Decision |
|---|---|
| Host | `portal.nusman.dev` on the **same** Vercel project as Desk (`admin/`) |
| App | Same Next.js App Router codebase; host-based routing in production |
| Auth | Magic link to a **person** email. No portal passwords in v1 |
| Data | Neon `nusmandotdev` only. Scoped by `person.client_id` |
| Design | Same tokens as Desk. Quieter chrome; no Audit / Export / Journal |
| SEO | `noindex`. Not linked from the public marketing site |

---

## Non-goals (v1)

- Client passwords or TOTP
- Seeing other clients, own products, Audit, Journal, Export
- Editing agreement, deposit, change requests, or moving gates
- Public signup into the portal (invite-only; marketing may link the Portal URL)

---

## Auth

1. On Desk, enable portal for a person (`people.portal_enabled`) who has an email.
2. Operator sends or copies a magic link (Resend when `RESEND_API_KEY` is set; otherwise **Copy link** on the person).
3. Link hits `/auth/magic?token=…` on the Portal host → `portal_sessions` + cookie `portal_session`.
4. Logout drops the session row and cookie.

Magic link rows: hashed token, person_id, expires_at, used_at. One-time use.

---

## What clients see

| Route | Purpose |
|---|---|
| `/` | Public landing |
| `/login` | Email → request magic link |
| `/auth/magic` | Consume token |
| `/profile` | Person details (read-only) |
| `/projects` | Hiring projects for this client |
| `/projects/new` | Start a project (brief → Desk at Qualify) |
| `/projects/[id]` | Progress, milestones, your package (client-facing fields only), client-visible notes |
| `/projects/[id]/intake` | Edit intake when open |
| `/projects/[id]/schedule` | Project-scoped schedule |
| `/messages`, `/messages/[projectId]` | Messages hub + thread |
| `/schedule` | Client schedule hub |

---

## Schema

- Migration `0008_portal`: `portal_magic_links`, `portal_sessions`, `portal_messages`; `people.portal_enabled`, `projects.portal_intake_open`, `project_notes.client_visible`
- Later Desk migrations also affect Portal surfaces: `0009_project_events` (schedule), `0010`/`0011` (milestones + gate remap) — see [desk-status.md](./desk-status.md)

---

## Later — routing cleanup (best practice)

**Symptom (fixed pragmatically Sep 2026):** Portal `/projects/[id]` soft-nav 404s after magic links / host fixes worked. Full refresh was fine; list → detail Link clicks were not.

**Cause:** Public URLs (`/projects`, `/projects/[id]`, …) exist in **two** App Router trees (`app/projects/…` and `app/portal/projects/…`). Proxy rewrite to `/portal/…` works on document loads; soft navigations resolve the **desk** module from the browser URL and collide with the rewrite.

**Current workaround (keep until cleanup):** For `/login` and `/projects*`, proxy uses `NextResponse.next()` (no rewrite). Desk pages branch with `shouldServePortalUi()` (`admin/src/lib/serve-portal.ts`) and render Portal UI. Thin aliases exist for intake/schedule under `app/projects/[id]/…`. Proxy also short-circuits already-rewritten `/portal/…` paths so rewrite re-entry cannot loop. Desk-only paths use careful prefixes (`/log` and `/log/…` only — never `startsWith("/log")`, which matched `/login` and caused `ERR_TOO_MANY_REDIRECTS` on Portal login).

**Preferred later fix (pick one):**

1. **One module per public URL** — host/session chooses Desk vs Portal UI inside a single page tree; drop duplicate `app/portal/projects/[id]` (and peers) + stop rewriting those paths, **or**
2. **No overlapping paths** — Portal-only URL prefixes that Desk does not also own, **or**
3. **Separate apps** — Portal not sharing Desk’s `/projects/[id]` in the same App Router tree.

Do not add more dual-mode + rewrite pairs for `/messages`, `/schedule`, etc., without either extending the same pattern or doing this cleanup.

---

## Local development

One server. Host picks Desk vs Portal.

```bash
cd admin
npm run dev
```

| App | Open this |
|---|---|
| Desk | http://localhost:3000 |
| Portal | http://portal.localhost:3000 |

1. Desk: sign in as operator.
2. Person → Portal access → enable → **Create magic link** → **Copy link**.
3. Link looks like `http://portal.localhost:3000/auth/magic?token=…`
4. Open it on the Portal host.

`.env.local` (admin):

```bash
PORTAL_APP_URL=http://portal.localhost:3000
```

Public site `.env` (optional):

```bash
VITE_PORTAL_URL=http://portal.localhost:3000
```

Production uses `portal.nusman.dev`. Tokens are **one-time** — a failed open burns the link.

---

## Production

Add domain `portal.nusman.dev` on the same Vercel project as Desk. Magic links use `https://portal.nusman.dev` (or set `PORTAL_APP_URL`).

---

## Delivery phases

1. Docs + archive — done  
2. Migration 0008 — done  
3. Host-aware proxy + portal shell — done  
4. Magic link — done  
5. Progress pages — done  
6. Intake + messages + Desk controls — done  
7. Desk messages inbox + chat UI — done  
8. Client-facing package summaries — done  
9. Portal profile / account chip — done  
10. Start project, messages hub, Resend alerts, `/projects*` soft-nav dual-mode — done (Portal **1.1** / Desk **2.1.0**)  

---

## Packages (options)

Desk writes **client summary**, price, timeline, in scope, out of scope. Playbook “starters” are Desk coaching only and are rejected if saved as the summary. Portal **Your package** hides starter text and shows the client fields for the selected option.
