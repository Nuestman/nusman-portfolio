# Desk — admin app plan

Living plan for **Desk** — Numan Usman’s private workbench at **desk.nusman.dev**. Update this file when a decision changes. Visual rules: [style-guide.md](./style-guide.md).

Public site: `https://nusman.dev` (this repo’s root Vite app).  
Admin: `https://desk.nusman.dev` (`admin/` in this same repo).  
Database: Neon project **nusmandotdev** (`sparkling-art-67399165`, `aws-eu-west-2`, Postgres 18). Empty as of 14 Sep 2026. This is the **only** database Desk uses. Other Neon projects (Mineaid, Uventory, church, etc.) are separate products to migrate onto Desk later — not to query from here.

---

## Why this exists

nusman.dev is the public face. Desk is the official place the freelance/practice work actually runs: clients, people, projects, gates, notes, then activities.

This is **not** an AGAHF system, not Mineaid, not clinical records, and not a merge of other repos. AGAHF is the day job (and has been a client). Mineaid, Uventory, Uventorybiz, church management, and the rest are Numan’s own side products. They stay on their own databases until a later migration onto Desk.

The gap: work has usually started the moment someone asked — no intake, no written scope, no deposit rule — then bottlenecks. The colleague-and-dad job is **not** the first client. It is the first engagement to run through a written process. Desk is the workbench so every job after this (and older ones, when migrated) uses that process.

Favours, corridor promises, and the `/playbook` notes box are not the operating system.

## Non-goals (v1)

- Not a page on nusman.dev. No admin link in public nav or footer.
- Not AGAHF, Mineaid, Uventory, or any other existing app/database. Desk does not read those systems.
- Not a client portal. Clients do not log in. This is Numan’s workbench.
- Not a rewrite of the marketing site.
- Not `npx neon@latest init` in the **repo root**. That would mix `DATABASE_URL` into the public Vite app.

---

## Locked decisions

| Topic | Decision |
|---|---|
| Location | `admin/` in this repo. No new GitHub repo. |
| Public site | Unchanged root Vite + current Vercel project. |
| Admin host | Second Vercel project, **Root Directory = `admin`**, domain `desk.nusman.dev`. |
| Framework | Next.js App Router in `admin/` (React + TS we already use; server routes so the DB never reaches the browser). |
| Styling | Same brand as the public site. Follow [style-guide.md](./style-guide.md). Copy tokens into `admin/`; do not import marketing CSS at runtime. |
| Data | Neon `nusmandotdev` only. Other Neon projects stay isolated until a later migration onto Desk. |
| ORM | Drizzle + SQL migrations in `admin/drizzle`. |
| Auth | You-only login. Email + password (or magic link) via a server auth library. No “secret URL” as security. |
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
- No caricatures, no `section-heading` banners, no marketing gradients on chrome
- Screen titles `font-heading text-3xl md:text-4xl`

If marketing and Desk disagree, the style guide wins.

---

## Domain model (v1)

Public process stays three words. Internally a **project** moves through seven gates from the playbook:

`qualify → intake → discover → propose → agree → build → launch`

### Tables

**users**  
Operators of Desk. v1: one row (Numan). Auth library may own this table; do not duplicate if it already provides users/sessions.

**clients**  
The hiring party (person or org paying / commissioning the work).

- name, email, phone
- organisation (optional)
- source (referral, inbound, repeat, other)
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
- title
- problem_sentence (the one sentence both sides can repeat)
- success_looks_like
- current_gate: the seven ids above
- status: `active` | `paused` | `won` | `lost` | `done`
- budget_note, deadline_note (text in v1, not a billing system)
- timestamps

**project_notes**  
Dated notes on a project (calls, WhatsApp decisions, scope changes).

- project_id
- body
- created_at

**project_options** (can ship in the same migration, UI in a later slice)

- project_id
- kind: `light` | `recommended` | `later`
- summary, price_note, timeline_note, in_scope, out_of_scope
- selected: boolean

Leave **activities** off v1 schema unless it is a thin `project_notes` feed. A personal activity log (non-client work) is phase 6.

### Rules encoded in data

- A project without a client is invalid.
- If the daily user is not the buyer, there must be a `people` row with role `user` before the project can leave `discover`.
- `build` is not allowed until `agree` (enforce in UI first; add a DB check if people skip it).

---

## Screens (v1)

| Route | Purpose |
|---|---|
| `/login` | Sign in |
| `/` | Today: active projects, current gate, this-week style checklist per active project |
| `/clients` | List + add |
| `/clients/[id]` | Client, people, their projects |
| `/projects` | List, filter by gate/status |
| `/projects/[id]` | Problem sentence, gate switcher, notes, options |
| `/projects/new` | Pick/create client, title, first gate = qualify |

Copy blocks from the playbook (first reply, eight questions, after-call follow-up) live as **templates you can copy**, not as a second CMS.

`/playbook` on the public site stays a private scratch page until Desk can replace it. Do not delete it in the first admin PR.

---

## Auth and security

- All routes except `/login` require a session.
- One operator account, created by seed or env (`ADMIN_EMAIL` + hashed password, or invite-once).
- Session cookies, httpOnly, secure on production.
- Database only in server code (Server Actions or Route Handlers).
- Vercel env: `DATABASE_URL`, `DATABASE_URL_UNPOOLED` if needed, auth secret.
- Desk is still findable if someone guesses the host. Login is the control. Rate-limit login later if needed.

---

## Delivery phases

Do not skip order. Each phase should be usable before the next starts.

### Phase 0 — this plan

This file. Agreed.

### Phase 1 — empty desk

Scaffold Next.js in `admin/`. Brand tokens, login shell, signed-in empty home. Deploy to Vercel with root `admin`, attach `desk.nusman.dev`. No Neon yet besides confirming env names.

### Phase 2 — database

Done locally. From `admin/`, **nusmandotdev** is linked via `DATABASE_URL`. Drizzle schema + `drizzle/0000_init.sql`. Operator seeded. Home page queries project count.

### Phase 3 — clients and people

CRUD for clients; add people with buyer/user roles. Use any current job (including colleague-and-dad) to prove the flow.

Routes: `/clients`, `/clients/new`, `/clients/[id]`, `/clients/[id]/people/[personId]/edit`.

### Phase 4 — projects and gates

Create a project, store the problem sentence, move gates, write notes. Gate UI matches the playbook labels.

### Phase 5 — options and templates

Light / recommended / later. Copy-to-clipboard for intake and follow-up.

### Phase 6 — activities

Project timeline (notes already cover much of this) plus an optional personal activity log. Only after 3–5 are in daily use.

### Phase 7 — harden

Backups/branching on Neon, 2FA if auth supports it, export, tighten Vercel.

### Phase 8 — migrate existing products (later)

After Desk is the daily workbench, bring Mineaid, Uventory, church, and other nusman.dev products onto it as records (and only then talk about data import). Until then those apps and databases stay where they are.

---

## Public site vs Desk

| | nusman.dev | desk.nusman.dev |
|---|---|---|
| Who | Anyone | Numan |
| Job | Trust and contact | Run the nusman.dev practice |
| Data | Static | Neon `nusmandotdev` only |
| Playbook | `/playbook` scratch (unlisted) | Source of workflow after phase 4 |

Do not add Desk links to `Header` / `Footer` / `sitemap.xml`.

---

## How we work from this doc

1. One phase per stretch of work. Name the phase in the commit.
2. If a new table or screen appears, edit **this file first**, then code.
3. Acceptance for phases 3–5: can a live job run on Desk (intake → gates → notes) without starting build from a chat message?
4. Root site CI (`tsc && vite build`) must stay green and unaware of admin TypeScript.

---

## Immediate next step (phase 4)

Phase 3 is clients and people: list, add, edit, delete clients; add people as buyer / daily user / other.

Phase 4 is projects and gates: create a project on a client, store the problem sentence, move gates, write notes.
