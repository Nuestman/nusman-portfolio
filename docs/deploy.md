# Deploy

The site is a Vite React SPA. Production host is Vercel (`vercel.json`).

## Build

```bash
npm install
npm run build
npm run preview   # http://localhost:4173
```

Output directory: `dist`.

## Vercel

1. Import the GitHub repo in Vercel.
2. Framework preset: Vite.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add `VITE_FORMSPREE_ID` in Project → Settings → Environment Variables if the contact form should POST to Formspree.

Node.js: `package.json` sets `"engines": { "node": "24.x" }` so Vercel stays on 24 and does not jump to the next major. Set Project Settings → Node.js Version to **24.x** so it matches.

SPA routes (`/about`, `/resume`, `/contact`, `/start`, `/portfolio`, 404) are rewritten to `index.html`. Hashed files under `/assets/` are cached for one year.

## Environment

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_FORMSPREE_ID` | No | Formspree form id. Without it, the form opens a mailto draft. |
| `VITE_DESK_INBOUND_URL` | No | Desk inbound API for `/start`. Defaults to Desk `/api/inbound-lead`. |
| `VITE_PORTAL_URL` | No | Portal link in nav/footer. Local default `portal.localhost:3000`. |

Copy `.env.example` to `.env` for local values. Do not commit `.env`.

## Desk (admin)

Desk is **not** a `/admin` route on nusman.dev. It is a second Vercel project on `desk.nusman.dev`.

Vercel only lists Root Directory folders that already exist on the GitHub branch the project is watching. `admin/` is new — it will not appear until you push it.

1. Push `admin/` (and the Desk docs) to GitHub. Do **not** commit `admin/.env.local`.
2. In Vercel: **Add New Project** → same GitHub repo (`Nuestman/nusman-portfolio`). Do **not** change Root Directory on the existing Vite project.
3. **Root Directory:** `admin`. Framework preset: **Next.js**. Project Node.js Version: **24.x** (matches `admin/package.json` `engines.node`).
4. In Build & Development Settings, leave overrides **off**. Do not set Output Directory to `dist` (that belongs to the public Vite app). Desk uses `admin/vercel.json` (`framework: nextjs`).
5. If this project was created from the Vite import, it may still have Output Directory `dist`. Clear that override, set Framework to Next.js, and redeploy.
6. If the picker is empty, set the new project’s Git branch to `development` (or merge `admin/` into `main` if production watches `main`), then refresh.
7. Environment variables (same names as `admin/.env.example`):

| Variable | Required | Purpose |
| --- | --- | --- |
| `ADMIN_EMAIL` | Yes | Owner login. Creates / matches the owner `users` row. |
| `ADMIN_PASSWORD` | Yes | Bootstrap until a scrypt hash exists on that row. |
| `ADMIN_NAME` | No | Display name on seed. Defaults to Numan Usman. |
| `AUTH_SECRET` | Yes | JWT signing key (Desk + Portal). At least 16 characters. |
| `DATABASE_URL` | Yes | Neon **nusmandotdev** pooled URL. Never another product’s database. |
| `DATABASE_URL_UNPOOLED` | If Neon asks | Unpooled URL for migrations. |
| `RESEND_API_KEY` | No | Magic-link email and practice alerts (messages, schedule, milestones, stages, inbound, portal access). Without it, copy magic links from Desk. |
| `PORTAL_FROM_EMAIL` | No | Verified Resend From (domain sender). Required when `RESEND_API_KEY` is set. |
| `PORTAL_APP_URL` | No | Magic-link origin. Local: `http://portal.localhost:3000`. Prod default `https://portal.nusman.dev`. |
| `LEAD_NOTIFY_TO` | No | Alert inbox for `/start` leads. Defaults to `ADMIN_EMAIL`. |
| `DESK_FROM_EMAIL` | No | From-address for Desk/lead alerts (falls back to `PORTAL_FROM_EMAIL`). |
| `PRACTICE_CONTACT_EMAIL` | No | Contact line in client emails (defaults to `ADMIN_EMAIL`). |
| `DESK_APP_URL` | No | Desk base URL in alert links. |
| `INBOUND_ALLOWED_ORIGINS` | No | Comma-separated Origins for `POST /api/inbound-lead`. |
| `FORCE_PORTAL` | Local only | `1` treats this process as the Portal host. Do not set in Desk `.env.local`. |

8. Domains on this project: `desk.nusman.dev` (operators) and `portal.nusman.dev` (clients). Same Root Directory `admin`.
9. Optional Portal mail: `RESEND_API_KEY`, verified `PORTAL_FROM_EMAIL` (domain sender, not unverified personal mail). Powers magic links plus message / schedule / milestone / stage / inbound / portal-access alerts (on-brand HTML + CID logo). Without them, Desk still creates a copy-paste magic link.
10. Optional local Portal: open `portal.localhost:3000` (same `npm run dev`). Avoid `FORCE_PORTAL=1` in Desk `.env.local`.

From `admin/`, `npm run db:migrate` applies schema through `0020_person_email_verified.sql`. Neon automatic snapshots are not enabled on this project plan, so download a copy from Desk `/export` after a real job starts (JSON, YAML, CSV zip with `journal.csv`, Markdown, or HTML). After a new migration, deploy the Desk/Portal app so production matches the new columns.

`npm install` / `npm run build` copies TinyMCE into `admin/public/tinymce` (gitignored). `/avatars/` and `/tinymce/` are public static. Uploaded photos are stored in the database and served at `/profile/photo/[id]` behind a Desk session. Do not commit `admin/.env.local`.

If you pointed the **existing** nusman.dev project at `admin/`, put it back: Root Directory empty, Framework Vite, Output Directory `dist`. Desk + Portal must be their own Vercel project.

Local Desk: `cd admin && npm run dev` → http://localhost:3000.  
Local Portal: `FORCE_PORTAL=1` on another port, or `portal.localhost:3000`.  
Plans: [desk.md](./desk.md), [portal.md](./portal.md). Status: [desk-status.md](./desk-status.md).
