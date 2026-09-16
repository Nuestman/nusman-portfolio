# Portal — client app plan

Living plan for the **client portal** at **portal.nusman.dev**. Same Next app as Desk (`admin/`), same Neon **nusmandotdev**, same brand ([style-guide.md](./style-guide.md)). Update this file when a decision changes.

Operator workbench: [desk.md](./desk.md). Prior Desk plan (no portal): [archive/desk-1.1.md](./archive/desk-1.1.md).

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
| `/projects/[id]` | Progress, your package (client-facing fields only), client-visible notes |
| `/projects/[id]/intake` | Edit intake when open |
| `/projects/[id]/messages` | Message thread (client). Operators use Desk `/messages` |

---

## Schema (migration `0008_portal`)

- `portal_magic_links`, `portal_sessions`, `portal_messages`
- `people.portal_enabled`, `projects.portal_intake_open`, `project_notes.client_visible`

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

---

## Packages (options)

Desk writes **client summary**, price, timeline, in scope, out of scope. Playbook “starters” are Desk coaching only and are rejected if saved as the summary. Portal **Your package** hides starter text and shows the client fields for the selected option.
