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

SPA routes (`/about`, `/portfolio`, `/contact`, 404) are rewritten to `index.html`. Hashed files under `/assets/` are cached for one year.

## Environment

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_FORMSPREE_ID` | No | Formspree form id. Without it, the form opens a mailto draft. |

Copy `.env.example` to `.env` for local values. Do not commit `.env`.

## Desk (admin)

Desk is **not** a `/admin` route on nusman.dev. It is a second Vercel project on `desk.nusman.dev`.

Vercel only lists Root Directory folders that already exist on the GitHub branch the project is watching. `admin/` is new — it will not appear until you push it.

1. Push `admin/` (and the Desk docs) to GitHub. Do **not** commit `admin/.env.local`.
2. In Vercel: **Add New Project** → same GitHub repo (`Nuestman/nusman-portfolio`). Do **not** change Root Directory on the existing Vite project.
3. Framework: Next.js. **Root Directory:** `admin`.
4. If the picker is empty, set the new project’s Git branch to `development` (or merge `admin/` into `main` if production watches `main`), then refresh.
5. Environment variables (same names as `admin/.env.example`): `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `AUTH_SECRET`, `DATABASE_URL`, `DATABASE_URL_UNPOOLED`.
6. Domain: `desk.nusman.dev` on this new project only.

Local: `cd admin && npm run dev` → http://localhost:3000. Plan: [desk.md](./desk.md).
