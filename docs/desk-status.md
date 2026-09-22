# Desk status

Checked 21 Sep 2026 against the code in `admin/`. Product version: **2.7.0** (`admin/package.json`). Product rules: [desk-2.0.md](./desk-2.0.md) (wins) and [desk.md](./desk.md). Portal: [portal.md](./portal.md). Archive: [archive/desk-1.1.md](./archive/desk-1.1.md). Visual: [style-guide.md](./style-guide.md). Deploy: [deploy.md](./deploy.md). Update this file when something ships or an open item is closed.

Desk **2.7.0** / Portal **1.7** are usable. Public site **4.3.0** posts `/start` into Desk as an **inactive** project; email confirm (or Desk confirm) activates it. Portal sign-in requires a **confirmed** person email.

---

## Live

Hiring jobs with gate records, **process milestones**, table-row edit/remove, playbook on Desk, multi-format export, own products as records, an audit trail with before/after, operator profiles, sessions for device revoke, **Portal** (confirmed person email + magic link + start project), **Messages** inbox (plain / rich TinyMCE composer), **Schedule** hubs (Cards/Calendar), **Resend alerts** (on-brand HTML + CID logo; messages, schedule, milestones, stages, inbound receipt, portal access, person email confirm), **in-app notifications** (feed + table; unread on the account bell), **inbound leads** from public `/start` (creates inactive client + project on submit; email or Desk confirm activates; heard-about source; timeline/budget including “Not sure yet”), **hiring party** view with empty fields shown as “—” and long emails wrapping in the card, inactive rows highlighted in lists, **person profiles** on Desk and Portal, **What we’re building** on the brief, and a **1400px** Desk/Portal canvas that does not grow a side strip from table min-width (PageSpread, gold card titles, outline header actions, sticky project timeline).

### Routes

| Route | Status |
|---|---|
| `/login` | Live. Env bootstrap only until owner hash exists; optional TOTP after password |
| `/` | Today — active projects + **Next 7 days** schedule teaser |
| `/log`, `/log/[id]/edit` | Live. UI says **Journal**; URL stays `/log` |
| `/audit`, `/audit/[id]` | Live. Row click opens detail |
| `/clients` … `/clients/[id]/people/[personId]` · `/edit` | Live. Person **profile** on Desk (`/profile` layout: stacked You card + Details, Organisation, Projects, Notes, Portal access). Name in the people list opens the profile; Edit is on the You card and in the row. Organisation lists the hiring party; Projects lists every job on that client. Person `/edit` still has the form + magic link. Portal enable is blocked until the person’s email is confirmed (**Confirm email** / **Resend confirmation**). Unconfirmed emails are marked on the people list. Hiring party shows empty fields. Inactive clients highlighted. Pending-email banner + Desk confirm / resend |
| `/schedule` | Live. Hub: Cards / Calendar; create/edit still on project |
| `/projects` … gate records, notes, options, changes, demos, **milestones** | Live. Current gate first; earlier stages collapsed; timeline; **Schedule** (`project_events`); portal strip; Qualify Real ↔ qualified milestone. Inactive status + pending-email banner |
| `/messages`, `/messages/new`, `/messages/[projectId]` | Live. Chat-style portal conversation inbox; compose/reply with plain or rich (TinyMCE) |
| `/notifications`, `/notifications/new`, `/notifications/[id]/edit` | Live. Feed + table; compose + edit only if you sent it |
| `/products`, `/products/new` | Live. Own-product records only |
| `/playbook` | Live on Desk. Public scratch page is gone |
| `/style` | Live specimens. Live header is the account-menu specimen |
| `/export`, `/export/download` | Live. JSON, YAML, CSV zip, Markdown, HTML |
| `/profile` | Live. Self-edit, password, optional authenticator, devices; owner adds / deactivates operators. You card uses the default gold/white avatar when no photo |
| `/profile/photo/[id]` | Live. Session required. Static photos: `/avatars/` (default `/avatars/default-user.png`) |
| `/api/inbound-lead` | Live. Same as `/draft` (CORS + honeypot + rate limit) |
| `/api/inbound-lead/draft` | Live. Public `/start` creates inactive client + project; sends verify email (debug URL when Resend unset) |
| `/api/inbound-lead/verify` | Live. Confirm link activates the existing project + receipt (idempotent) |
| `/api/inbound-lead/resend` | Live. New verify token for an open draft |

### Portal host (`portal.*` / `portal.localhost`)

| Route | Status |
|---|---|
| `/`, `/login`, `/auth/magic`, `/auth/verify-email` | Live. Magic links finish on Portal origin. Unconfirmed emails cannot sign in; login sends a confirm link instead |
| `/profile` | Live. Read-only `/profile` layout: stacked You card + Details, Organisation, Projects (client-facing stage labels; Start a project) |
| `/projects`, `/projects/new`, `/projects/[id]` | Live. List, start project, Progress (gold path), package, updates |
| `/projects/[id]/brief` | Live. Locked client brief (project name header, package, deadline, problem, what we’re building, success, who it is for, needed by, budget, call/meet, notes, scope; empty fields “Not set.”; Incomplete info badge; Fill details while intake is open) |
| `/projects/[id]/intake` | Live. Questions form only while intake is open; otherwise points at the brief |
| `/projects/[id]/schedule` | Live. Project cards with confirm / decline / cancel |
| `/messages`, `/messages/[projectId]` | Live. Hub + thread; same plain / rich composer as Desk |
| `/notifications` | Live. Feed + table — mark read / delete only (account menu) |
| `/schedule` | Live. Wide hub: Cards / Calendar; confirm/decline/cancel; request |

`/projects*` uses dual-mode pages (no proxy rewrite) so soft-nav does not 404 — aliases include intake, schedule, and **brief**. Cleanup note in [portal.md](./portal.md#later--routing-cleanup-best-practice).

### Schema

Migrations on Neon **nusmandotdev** (`sparkling-art-67399165`) only:

| File | What |
|---|---|
| `0000_init` | Core tables including `users` |
| `0001_activities` | Personal journal (`activities`) |
| `0002_work_kind` | Hiring vs own-product |
| `0003_gate_records` | Qualify, intake, discovery, agree, changes, demos, launch |
| `0004_audit_events` | Audit trail |
| `0005_audit_detail` | `before` / `after` jsonb, optional `reason` |
| `0006_users_profile` | User profile columns + `sessions` |
| `0007_totp` | Optional authenticator columns on `users` |
| `0008_portal` | Portal magic links, sessions, messages; note/intake/person flags |
| `0009_project_events` | Scheduler events |
| `0010_process_milestones` | `project_milestones`; `plan` gate enum; qualify `budget_note` |
| `0011_process_gate_remap` | Remap intake→discover, propose/agree→plan |
| `0012_notifications` | `notifications` inbox for Desk + Portal |
| `0013_client_source_expand` | `client_source` enum: `family_friends`, `work_colleague` |
| `0014_client_source_social` | `client_source` enum: `social_media` |
| `0015_inbound_lead_drafts` | Public `/start` email-verify drafts + tokens |
| `0016_inbound_draft_brief` | Draft stores full brief |
| `0017_project_status_inactive` | `project_status` enum: `inactive` |
| `0018_inbound_draft_email_open` | One open inbound draft per email; draft↔project index |
| `0019_project_want_built` | `projects.want_built` — “What we’re building” on Desk/Portal brief |
| `0020_person_email_verified` | `people.email_verified_at` + confirm token; Portal requires confirmed email |

Apply from `admin/` with `npm run db:migrate`. Do not point `DATABASE_URL` at Mineaid, Uventory, church, or any other Neon project.

### Auth (as built)

- Cookie `desk_session`: JWT HS256, 14 days, claims `email`, `uid`, `sid`.
- Cookie `portal_session`: JWT for a `people` row; magic links are one-time. Person must have `portal_enabled` **and** `email_verified_at`. Changing the email clears confirmation.
- Proxy and all Desk pages/actions require a live `sessions` row. Revoked or expired cookies are cleared.
- Env `ADMIN_PASSWORD` only works while the owner’s `password_hash` is empty (bootstrap). After that, hash only.
- Optional TOTP on Profile. After password, login asks for a 6-digit code or a one-time recovery code. `drizzle/0007_totp.sql`.
- Public without Desk login: `/_next/*`, favicons, `/logos/`, `/favicon/`, `/avatars/`, `/tinymce/`, `POST /api/inbound-lead`. Portal public: `/login`, `/auth/magic`, `/auth/verify-email`.
- Photos: PNG / JPEG / WebP, max 400 KB. `image_url` (seeded `/avatars/numan.png`) or `image_data` + `image_mime`. Server actions body limit 1 MB.
- Exports omit `password_hash`, `image_data`, and TOTP secrets. `sessions` is not exported.
- Login failures: 5 per IP per 15 minutes, in memory, per server instance.

### Chrome (as built)

Main nav: Today, Audit, Clients, Projects, **Schedule**, Messages, Products, Style, Export.

Account menu (last nav item): grey chip (`bg-gray-100 hover:bg-gray-200`), circular photo (default gold fill + white silhouette, **no gold ring at rest**). Badge includes the notifications bell and unread count. Menu opens with the **signed-in name**, then **Notifications** (unread on that row too), **Playbook**, Profile, Journal, Sign out. Inline SVG icons. Journal, Notifications, and Playbook are not in the main nav.

Portal header mirrors Desk chrome; account chip opens the signed-in name, Notifications, Profile, and Sign out.

Pages use `PAGE_FRAME_CLASS` (`max-w-[1400px]`). Desk/Portal `main` is a `minmax(0,1fr)` grid so list content cannot widen the canvas; table cards (`TableFrame`) scroll inside the card (`contain: layout paint`). Card titles are `font-heading text-2xl text-gold-500`. Card header actions (Add, Edit, Open) are `outline` buttons.

Header: hamburger `<500px`; stacked centred logo + wrapping nav `500–1023px` (logo in normal flow); one row `1024px+`.

Deletes and other critical actions confirm first. Project and product delete requires typing the title. Confirm dialogs portal to `document.body` so table `overflow-hidden` does not clip them.

---

## Open gaps

These are leftover product work, not bugs in the last UI pass.

### Operators

- Owner can add, deactivate, and reactivate operators. There is **no** UI to edit another operator’s name, photo, phone, or title.
- Owner cannot set or reset another operator’s password. That person uses their own Profile after the owner-created password.
- Users are not deleted. Deactivate only. The owner row cannot be deactivated.
- If `password_hash` is still empty, the owner signs in with `ADMIN_PASSWORD`; the first successful env login writes the hash. After that the env password no longer works. Change-password on Profile needs a hash. `npm run db:seed` also hashes when the column is empty.

### Sessions

- Expired `sessions` / `portal_sessions` rows are not swept. They stop working; they stay in the table until revoked or the person/user is removed.
- Cookies without a live `sid` are rejected. Sign in again after a revoke or after upgrading from an older cookie.

### Portal / messages

- No unread badges on new portal **messages** (notifications unread on the account bell is live).
- Several readonly panels still look like forms (`InfoList`): Agreement, Discovery answers, Call notes & scope, Launch, Portal Your package, classic project, audit. Hiring party is redesigned. Redesign the rest later — not part of 2.7.0.
- Operator replies do not store which operator wrote them (`author_kind` only).
- Chosen package with leftover coaching text in `summary` must be rewritten on Desk before Choose / before Portal looks complete.
- **Routing cleanup (later):** collapse Desk/Portal overlapping `/projects*` trees so soft-nav does not need dual-mode. See [portal.md](./portal.md#later--routing-cleanup-best-practice).
- **Stages vs milestones (later):** the process strip (Qualify → … → Launch) and the milestone checklist read as two copies of the same progress story. Decide one client-facing progress model (stage-only, milestones-only, or a single merged control) and stop maintaining both as parallel UI. Keep Qualify Real ↔ `qualified` sync until that cleanup; do not add more stage↔milestone pairs until then.

### Security (intentional for v1)

- Authenticator is optional, not required for every operator.
- Login / inbound rate-limits are per instance (in memory). Multiple Vercel instances do not share the counter.
- Desk and Portal are findable if someone guesses the host. Login / invite is the control.

### Data / ops

- Neon automatic snapshots are off on this project plan. Download `/export` after a real job starts.
- Product databases are **not** imported. Do not copy their `DATABASE_URL` into Desk.
- CSV zip file for journal lines is `journal.csv`. Audit action codes for those rows are still `log.create` / `log.update` / `log.delete` (machine names; the UI says Journal).

### Tooling (not an app bug)

Cursor’s in-IDE browser injects `data-cursor-ref` on DOM nodes. That can show a React hydration overlay in the Cursor browser. Check the same page in Chrome or Edge before treating it as a Desk bug.

---

## Next

Not a new phase unless you choose one:

1. Invite a real client to Portal; rewrite any package summaries that still use coaching starters.
2. Keep an export after a real job starts.
3. Add other operators from Profile when you need them.
4. Later, import product databases — only when you choose to, and never by pointing Desk at their `DATABASE_URL`.

Possible later work if you ask for it: Portal routing cleanup (one module per public URL — [portal.md](./portal.md#later--routing-cleanup-best-practice)); stages/milestones duplication cleanup (one progress model); unread badges on messages; form-shaped readonly `InfoList` panels; operator identity on replies; owner edit / password-reset for other operators; sweep expired sessions; require authenticator for all operators; Neon snapshots; product-data import.
