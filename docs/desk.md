# Desk — admin app plan

Living plan for **Desk** — Numan Usman’s private workbench at **desk.nusman.dev**. Update this file when a decision changes. Visual rules: [style-guide.md](./style-guide.md). What’s live vs still open: [desk-status.md](./desk-status.md). Client portal: [portal.md](./portal.md). Snapshot before Portal: [archive/desk-1.1.md](./archive/desk-1.1.md).

**Next major cut (surfaces, project page reshape, Portal scheduler):** [desk-2.0.md](./desk-2.0.md) — **that file wins** where it conflicts with this one.

Public site: `https://nusman.dev` (this repo’s root Vite app).  
Admin: `https://desk.nusman.dev` and `https://portal.nusman.dev` (same `admin/` Next app, host-based).  
Database: Neon project **nusmandotdev** (`sparkling-art-67399165`, `aws-eu-west-2`, Postgres 18). In use as of 15 Sep 2026. This is the **only** database Desk and Portal use. Other Neon projects (Mineaid, Uventory, church, etc.) are separate products to migrate onto Desk later — not to query from here.

---

## Why this exists

nusman.dev is the public face. Desk is the official place the freelance/practice work actually runs: clients, people, projects, gates, notes, then the journal.

This is **not** an AGAHF system, not Mineaid, not clinical records, and not a merge of other repos. AGAHF is the day job (and has been a client). Mineaid, Uventory, Uventorybiz, church management, and the rest are Usman’s own side products. They stay on their own databases until a later migration onto Desk.

The gap: work has usually started the moment someone asked — no intake, no written scope, no deposit rule — then bottlenecks. The colleague-and-dad job is **not** the first client. It is the first engagement to run through a written process. Desk is the workbench so every job after this (and older ones, when migrated) uses that process.

Favours, corridor promises, and a notes box on a public page are not the operating system.

## Non-goals (Desk)

- Not a page on nusman.dev. Desk itself is not linked from public nav or footer. Clients reach **Portal** via [portal.nusman.dev](https://portal.nusman.dev) (linked from the public site). Public **Start a project** (`/start` on nusman.dev) posts `POST /api/inbound-lead/draft`, which creates the Desk client + inactive project, then email confirm (`/verify`) or a Desk operator activates it — it does not expose Desk UI.
- Not AGAHF, Mineaid, Uventory, or any other existing app/database. Desk does not query those systems. Own products appear on Desk as records only until a later data import.
- Not where clients log in. Clients use **Portal** ([portal.md](./portal.md)). Desk is Usman’s (and operators’) workbench.
- Not a rewrite of the marketing site.
- Not `npx neon@latest init` in the **repo root**. That would mix `DATABASE_URL` into the public Vite app.

---

## Locked decisions

| Topic | Decision |
|---|---|
| Location | `admin/` in this repo. No new GitHub repo. |
| Public site | Unchanged root Vite + current Vercel project. |
| Admin host | Second Vercel project, **Root Directory = `admin`**, domains `desk.nusman.dev` and `portal.nusman.dev`. |
| Framework | Next.js App Router in `admin/` (React + TS we already use; server routes so the DB never reaches the browser). |
| Styling | Same brand as the public site. Follow [style-guide.md](./style-guide.md). Copy tokens into `admin/`; do not import marketing CSS at runtime. |
| Data | Neon `nusmandotdev` only. Other Neon projects stay isolated. Phase 8 records the products on Desk; it does not import their databases. |
| ORM | Drizzle + SQL migrations in `admin/drizzle`. |
| Auth (Desk) | Operators in `users`. Env `ADMIN_EMAIL` / `ADMIN_PASSWORD` bootstraps the owner. Session rows can be revoked. |
| Auth (Portal) | Clients as `people` via magic link. See [portal.md](./portal.md). |
| Secrets | `admin/.env.local` (gitignored). Same names on the Vercel admin project. Never `VITE_*` for the database. |
| SEO | `noindex, nofollow`. Not in the public sitemap. |

---

## How the database is linked

Phase 2 used Cursor’s Neon MCP to pull `DATABASE_URL` / `DATABASE_URL_UNPOOLED` into `admin/.env.local` for **nusmandotdev** only. `npx neon@latest init` was not run, so the Next app was not re-scaffolded.

If you later want the Neon CLI link, run it from `admin/` only, skip templates, and do not run it in the portfolio root. `.neon` is gitignored.

---

## Repo layout (target)

```
numanusman/                 public site (existing Vercel project)
  src/
  public/
  vercel.json               SPA rewrite — do not point this at admin
  docs/desk.md              this plan
  docs/desk-status.md       what’s live vs still open
  docs/style-guide.md       brand tokens for site + Desk
  admin/                    desk.nusman.dev (new Vercel project)
    src/app/                Next.js App Router
    src/db/                 Drizzle schema + client
    drizzle/                migrations
    .env.local              DATABASE_URL, AUTH secrets (not committed)
```

Root `npm run build` must keep building **only** the public site. Admin has its own `admin/package.json` scripts. Do not merge admin into the root Vite `tsc` graph.

---

## Visual direction

Follow **[style-guide.md](./style-guide.md)**. Short version for Desk:

- Gold `#B98C1B` and ink `#150F00`, Inter body, Odibee headings
- Gold primary buttons, white `rounded-2xl` cards, `bg-gray-50` pages
- In-line links gold + underline at rest (`linkClassName`). Nav is Odibee, no underline
- Logo in chrome. Operator photo is the last nav item and opens Profile, Journal, and Sign out. No marketing caricatures, collab marquee, or gradients on chrome. Minimal footer under signed-in shells shows surface + app version
- Screen titles use the public `section-heading` size (`text-5xl md:text-6xl lg:text-7xl`)
- Card titles stay `font-heading text-2xl`. Do not use `section-heading` inside tables.

If marketing and Desk disagree, the style guide wins.

---

## Domain model (v1)

Public process stays three words. Internally a **project** moves through seven gates from the playbook:

`qualify → intake → discover → propose → agree → build → launch`

### Tables

**users**  
Operators of Desk. More than one is allowed. The seeded owner is Usman; other operators can be added from Profile.

- email (unique), name
- title, phone (optional)
- image_url (static `/avatars/…` or Vercel Blob URL) or legacy image_data + image_mime
- password_hash (scrypt). Until set, the owner can still use `ADMIN_PASSWORD`
- totp_secret, totp_enabled, totp_recovery_hashes (optional authenticator)
- role: `owner` | `operator`
- active (deactivate instead of delete)
- timestamps

**sessions**  
Signed-in devices. Needed once there is more than one operator, so a password change or “sign out other devices” can kill a cookie before it expires.

- user_id
- expires_at
- user_agent, ip (optional, for the devices list)
- created_at

The httpOnly cookie is still a JWT (`desk_session`) that carries email, user id, and session id. The proxy verifies the JWT and that the `sessions` row is still live (Neon HTTP). Dropping the row revokes that device immediately.

**clients**  
The hiring party (person or org paying / commissioning the work), or the practice row that owns products.

- kind: `client` | `practice` (v1: one practice row, hidden from the Clients list)
- name, email, phone
- organisation (optional)
- source (referral, family_friends, work_colleague, social_media, inbound, repeat, other)
- notes
- timestamps

**people**  
Humans attached to a client (buyer vs daily user vs other).

- client_id
- name, email, phone
- role: `buyer` | `user` | `other`
- is_decision_maker
- notes

**projects**

- client_id
- work_kind: `client` | `product` (hiring work vs own product)
- title
- problem_sentence (the one sentence both sides can repeat)
- want_built (“What we’re building”)
- success_looks_like
- who_for
- qualify_outcome: `undecided` | `real` | `favour` | `no` (hiring screen)
- current_gate: the seven ids above
- status: `inactive` | `active` | `paused` | `won` | `lost` | `done`
- budget_note, deadline_note, call_at, qualify_notes
- portal_intake_open
- timestamps

**project_notes**  
Dated notes on a project (calls, WhatsApp decisions, scope changes).

- project_id
- body
- created_at

**project_options** (Propose)

- project_id
- kind: `light` | `recommended` | `later`
- summary (client-facing; Desk coaching starters must be rewritten before save/choose), price_note, timeline_note, in_scope, out_of_scope
- selected: boolean

Chosen package fields (except raw coaching starters) show on Portal as **Your package**.

**project_intake_answers** (Intake)

One row per theme for the eight questions (Problem, Who, Today, Frequency, Success, Constraints, Data, Risk). Seeded when a hiring project is opened.

- project_id + theme (unique)
- ask (the question text)
- answer

**project_discovery** (Discover, 1:1)

- call_at, attendees
- current_process, last_example
- in_scope, out_of_scope
- devices_language, privacy_notes

The problem sentence stays on `projects` (read back after the call). The discovery agenda stays playbook reference, not a second checklist table.

**project_agreements** (Agree, 1:1)

Clause fields matching the playbook: parties, outcome, scope, money, time, changes, support, workplace.

- deposit_paid, confirmed (signed or WhatsApp)

**project_change_requests** (Build)

- project_id, body
- status: `parked` | `priced` | `done`

**project_demos** (Build)

- project_id, happened_at (text), notes

**project_launch** (Launch, 1:1)

- trained, guide_left, remaining_invoiced, maintenance_offered
- handover_note

**activities** (phase 6)

Personal / non-client journal. Not AGAHF work, not a second notes box on a project.

- body
- created_at

**audit_events** (phase 10–11)

Append-only trail of Desk mutations. Not the journal, not the project timeline.

- actor_email
- action (short code, e.g. `project.update`)
- summary (one line you can read)
- before, after (JSON snapshots; edits keep the previous values)
- reason (optional, on deletes)
- entity_type, entity_id (optional)
- project_id (optional, set null if the project is later deleted)
- created_at

`/audit` lists events. `/audit/[id]` is the detail. No edit or delete. Failed logins are recorded without the password.

Deletes need a confirm step (type the project/product title for those records). An optional reason is stored on the audit row.

Project history stays a thin `project_notes` feed (timeline). Gate moves and the chosen option write a short note there so the job has a dated trail. Qualify, intake, discovery, agreement, changes, demos, and launch are real records on the job — not a CMS of playbook prose.

Own products skip qualify → agree (sales/discovery). They still use Build (changes, demos), Launch, and the timeline.

Every list table has an Actions column (Edit + Remove). Playbook and Style tables are specimens only.

### Rules encoded in data

- A project without a client is invalid.
- Leaving Qualify toward Intake requires outcome `real`.
- Leaving Intake toward Discover requires written Problem and Success answers.
- If the daily user is not the buyer, there must be a `people` row with role `user` before the project can leave `discover`.
- Write the problem sentence before leaving Discover.
- Choose a package before leaving Propose.
- `build` is not allowed until `agree`. Leaving Agree toward Build requires deposit paid and written confirm.
- Won, lost, done, and inactive stay on their gate. Inactive inbound jobs wait on email confirm (visitor or Desk).
- Deleting a project or product requires typing its title. Other deletes still need a confirm step. Optional reason is stored on the audit row.

---

## Screens (v1)

| Route | Purpose |
|---|---|
| `/api/inbound-lead` | Public POST — same as `/draft` |
| `/api/inbound-lead/draft` | Public `/start` — create inactive Desk lead + send verify email |
| `/api/inbound-lead/verify` | Confirm link — activate existing project + receipt |
| `/api/inbound-lead/resend` | Rotate verify token for an open draft |
| `/api/legal/[slug]` | Public GET — Privacy / Terms JSON (CORS) |
| `/login` | Sign in |
| `/` | Today: active projects, current gate, journal, templates |
| `/log` | Journal: personal work that is not a client job |
| `/log/[id]/edit` | Edit a journal line |
| `/audit` | Append-only trail of Desk actions |
| `/audit/[id]` | One audit event: previous values, new values, reason |
| `/clients` | List + add |
| `/clients/[id]` | Client, people, their projects |
| `/projects` | Hiring jobs. Filter by gate/status |
| `/projects/[id]` | Gate plus read-only records. Edit on a card reveals that form |
| `/messages` | Portal conversation inbox (one thread per hiring project) |
| `/messages/[projectId]` | Conversation view + reply |
| `/projects/new` | Pick/create client, title, first gate = qualify |
| `/projects/[id]/notes/[noteId]/edit` | Edit a timeline note |
| `/projects/[id]/changes/[changeId]/edit` | Edit a change request |
| `/projects/[id]/demos/[demoId]/edit` | Edit a demo |
| `/products` | Own products as Desk records. Apps and databases stay where they are |
| `/products/new` | Add an own product (attaches to the practice row) |
| `/playbook` | Discovery playbook (reference). Live jobs stay on Clients / Projects / Journal |
| `/style` | Live brand specimens — every section in style-guide.md |
| `/export` | Download JSON, YAML, CSV zip, Markdown, or HTML (operators, jobs, journal, gates, audit; no secrets or devices) |
| `/profile` | Signed-in operator: photo, details, password, authenticator, other operators, devices |
| `/profile/photo/[id]` | Legacy DB uploads (session required). New photos are Blob URLs on `image_url` |

Copy blocks from the playbook (first reply, eight questions, after-call follow-up) live as **templates you can copy**. Answers, discovery notes, agreement clauses, change requests, demos, and launch checks live on the project. The project page shows those records first; an Edit (or Add) control opens the form. List rows still edit on their own routes.

The public `/playbook` scratch page is gone. The playbook lives on Desk only. Public `robots.txt` still disallows `/playbook`.

---

## Chrome

Main nav: Today, Audit, Clients, Projects, Schedule, Messages, Products, Style, Export. **Journal, Notifications, and Playbook are not in the main nav** — they live in the account menu with Profile and Sign out.

The last nav item is the operator photo in a grey chip (`bg-gray-100`, same fill as a secondary button). No gold ring except focus. It opens Notifications, Playbook, Profile, Journal, and Sign out.

Header layout:

- `<500px`: hamburger, square logo
- `500px`–`1023px`: stacked centred logo + wrapping nav (logo in normal flow, never absolutely positioned)
- `1024px+`: one row, logo left, nav right; links wrap if they cannot fit

The public `/avatars/` folder is not behind the login proxy. New Profile uploads are public Vercel Blob URLs. Legacy DB photos go through `/profile/photo/[id]` and need a session.

---

## Auth and security

- All routes except `/login` require a session. Favicons, logos, and `/avatars/` are public.
- Operators live in `users`. Env `ADMIN_EMAIL` / `ADMIN_PASSWORD` / optional `ADMIN_NAME` bootstraps the owner. Other operators are added from `/profile` (owner only). Deactivate instead of delete. The owner row cannot be deactivated.
- Passwords are scrypt hashes on the user row, minimum 8 characters. Env `ADMIN_PASSWORD` bootstraps the owner only while `password_hash` is empty. After the first successful env login writes the hash, that env password no longer signs in. Reset a forgotten owner password by clearing `password_hash` in Neon (or adding another owner) — not by reusing the env value.
- Cookie `desk_session` is a JWT (HS256, 14 days) carrying email, user id (`uid`), and session id (`sid`). Each sign-in writes a `sessions` row. Logout, password change, and “sign out other devices” drop rows. The proxy and all pages/actions require a live `sessions` row. A JWT without `sid`, or whose row was deleted or expired, is rejected and the cookie is cleared. You must sign in again.
- Two-factor: optional TOTP authenticator on Profile. After password, login asks for a 6-digit code (or a one-time recovery code). Secrets and recovery hashes stay in `users`; they are not exported.
- Photos: PNG, JPEG, or WebP under 400 KB. New uploads → Vercel Blob (`image_url`). Seeded static `/avatars/numan.png` still fine. Legacy `image_data` + `image_mime` via `/profile/photo/[id]`. Server actions allow a 1 MB body so a photo plus fields can post.
- Exports omit `password_hash` and `image_data`. Device rows (`sessions`) are not exported.
- Database only in server code (Server Actions or Route Handlers).
- Vercel env: `DATABASE_URL`, `DATABASE_URL_UNPOOLED` if needed, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `AUTH_SECRET` (at least 16 characters), optional `ADMIN_NAME`.
- Desk is still findable if someone guesses the host. Login is the control. Failed logins are rate-limited in memory (5 tries / 15 minutes per IP, per server instance). Authenticator (TOTP) is optional per operator.

---

## Delivery phases

Do not skip order. Each phase should be usable before the next starts.

### Phase 0 — this plan

This file. Agreed.

### Phase 1 — empty desk

Done, then tightened: compact sticky chrome, shared `DeskShell`, branded login / 404 / error, favicons, Odibee nav. Deploy to Vercel with root `admin`, attach `desk.nusman.dev`.

### Phase 2 — database

Done, then tightened: cached Drizzle client, `loadFromDb` for missing/error, shared database notice, operator seed from `ADMIN_EMAIL` / optional `ADMIN_NAME`. `drizzle/0000_init.sql` plus later migrations.

### Phase 3 — clients and people

Done, then tightened: practice rows redirect to Products and cannot be edited from Clients; people list buyers first with email/phone; client list shows people and project counts. Autocomplete on name, email, and phone.

Routes: `/clients`, `/clients/new`, `/clients/[id]`, `/clients/[id]/people/[personId]`, `/clients/[id]/people/[personId]/edit`.

### Phase 4 — projects and gates

Done, then tightened: one gate at a time in both directions; problem sentence required to leave Discover (hiring work); won/lost/done stay on their gate; creating a project stamps `Opened at 0. Qualify.` Gate notices drop from the URL after they show. Own products skip the daily-user and problem-sentence rules.

Routes: `/projects`, `/projects/new`, `/projects/[id]`. Today lists active projects and the current gate. Client detail lists that client's projects.

Move one gate at a time. Build is blocked until Agree. Leaving Discover requires a daily-user person when the buyer is not the only person.

### Phase 5 — options and templates

Done, then tightened: leaving Propose requires a chosen package (hiring work); the chosen package cannot be removed until another is chosen; own products do not show sales packages. Copy shows a failure if the clipboard is blocked.

### Phase 6 — activities

Done, then tightened: Today and `/log` share the same list. The journal stays off the project timeline. Apply `npm run db:migrate` from `admin/` (same Neon as production).

### Phase 7 — harden

Done, then tightened: login is rate-limited (5 failures / 15 minutes per IP, in memory). `/export` downloads JSON, YAML, CSV (zip of tables), Markdown, and HTML. HTML can be printed to PDF. Neon automatic snapshots are not enabled on this project plan — keep an export after a real job starts. Authenticator (TOTP) is optional on Profile.

### Phase 8 — own products as records

Done, then tightened: `/products` uses the same database missing/error path as the rest of Desk. New product records start at Launch and stamp a timeline line. Today, Clients, and Projects stay hiring work. Desk still does not query those other databases. Data import is later.

### Phase 9 — gate records and table CRUD

Done: list tables have an Actions column. Clients, people, projects, products, notes, options, and journal lines can be edited and removed. A client with a project has Edit only on the list. Hiring jobs store qualify, the eight intake answers, discovery, agreement, change requests, demos, and launch. Qualify, intake, and agree leave-blocks apply only when leaving that gate, so older jobs already past them are not frozen. Own products skip sales/discovery forms. `drizzle/0003_gate_records.sql`.

### Phase 10 — project view and audit

Done: project and product detail cards show the record first. Edit (or Add) reveals the form; Cancel puts the record back. Mutations write `audit_events`. `/audit` is read-only. The journal on `/log` is unchanged. `drizzle/0004_audit_events.sql`.

### Phase 11 — audit detail and delete confirm

Done: edits store previous and new values. Click an audit row for the detail. Deletes (and gate moves / choosing a package) ask first. Deleting a project or product means typing its title. Optional delete reason is stored on the audit row. `drizzle/0005_audit_detail.sql`.

### Phase 12 — profile and operators

Done: `/profile` is the signed-in operator. Users store a photo, title, phone, role, active flag, password hash, and optional TOTP. Owners can add other operators. `sessions` records devices so they can be revoked. Journal (personal work) is labelled Journal in the UI; the route stays `/log`. The header photo is a grey chip at the end of the nav and opens Profile, Journal, and Sign out. `drizzle/0006_users_profile.sql`, `drizzle/0007_totp.sql`.

### Phase 13 — session gate and 2FA

Done: env password is bootstrap-only. Proxy, pages, and mutations require a live `sessions` row. Optional authenticator on Profile. `drizzle/0007_totp.sql`.

### Phase 14 — client portal

Done (with Portal): same `admin/` app serves **portal.nusman.dev**. Clients (`people`) sign in with magic links; progress, intake when open, and messages. Desk invites and visibility controls. Plan: [portal.md](./portal.md). Prior Desk-only plan: [archive/desk-1.1.md](./archive/desk-1.1.md). `drizzle/0008_portal.sql`.

---

## Open gaps (v1)

Full checklist: [desk-status.md](./desk-status.md). Short version:

- Owner cannot reset another operator’s password from the UI, or edit their profile. Deactivate / reactivate only.
- Expired `sessions` rows are not swept.
- Login rate-limit is per server instance (in memory). Authenticator is optional, not required.
- Neon automatic snapshots are off. Keep `/export` after a real job starts.
- Product databases (Mineaid, Uventory, church, …) are not imported. Do not point Desk at their `DATABASE_URL`.
- Cursor’s in-IDE browser injects `data-cursor-ref` and can show a false hydration overlay. Check in a normal browser.

---

## Public site vs Desk

| | nusman.dev | desk.nusman.dev |
|---|---|---|
| Who | Anyone | Usman |
| Job | Trust and contact | Run the nusman.dev practice |
| Data | Static | Neon `nusmandotdev` only |
| Playbook | Gone (robots still disallow `/playbook`) | `/playbook` reference on Desk |

Do not add Desk links to `Header` / `Footer` / `sitemap.xml`.

---

## How we work from this doc

1. One phase per stretch of work. Name the phase in the commit.
2. If a new table or screen appears, edit **this file first**, then code. Keep [desk-status.md](./desk-status.md) in step with what is live.
3. Acceptance for phases 3–5: can a live job run on Desk (intake → gates → notes) without starting build from a chat message?
4. Root site CI (`tsc && vite build`) must stay green and unaware of admin TypeScript.

---

## Immediate next step

Desk **2.8.7** is the current cut (qualify folded into `projects` — one Brief; Portal Organisation; lean Portal — brief, messages, schedule, profile, organisation, start → call request; discovery on Desk; `/welcome` greets organisation; Desk `/projects/[id]/edit`; private Vercel Blob; unread Messages badges; legal CMS; person email confirm before Portal; surfaces follow [desk-2.0.md](./desk-2.0.md)). Invite a person from Desk (confirm email first), rewrite package summaries for clients, unlock the brief when the client should edit it, keep an export after a real job starts. Later: Portal routing cleanup ([portal.md](./portal.md#later--routing-cleanup-best-practice)); form-shaped readonly panels; import product databases — only when you choose to, and never by pointing Desk at their `DATABASE_URL`.
