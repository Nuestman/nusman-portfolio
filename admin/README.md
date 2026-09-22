# Desk

Private workbench for the nusman.dev practice, plus the client portal. Version **2.8.0**. Plan: [../docs/desk-2.0.md](../docs/desk-2.0.md). Portal: [../docs/portal.md](../docs/portal.md). Status: [../docs/desk-status.md](../docs/desk-status.md). Visual: [../docs/style-guide.md](../docs/style-guide.md).

Requires Node **24.x** and npm `>=10`. Vercel follows `engines.node` in this file. Set the project’s Node.js Version to **24.x**. Domains: `desk.nusman.dev` and `portal.nusman.dev`.

```bash
cd admin
cp .env.example .env.local   # ADMIN_EMAIL, ADMIN_PASSWORD, AUTH_SECRET, DATABASE_URL
npm run dev                  # http://localhost:3000 · Portal: http://portal.localhost:3000
```

From the repo root (after `npm install` in root and in `admin/`):

```bash
npm run dev:desk   # Desk/Portal only
npm run dev:all    # public site (5173) + Desk/Portal (3000) together
```

`AUTH_SECRET` must be at least 16 characters. Optional `ADMIN_NAME` defaults to Numan Usman on seed.

TinyMCE (GPL) is copied from `node_modules` into `public/tinymce` on `postinstall` / `predev` / `prebuild`. That folder is gitignored — do not commit it.

For Resend (magic links + alerts): set `RESEND_API_KEY` and a **verified** `PORTAL_FROM_EMAIL` (see `.env.example`). Without them, Desk can still copy magic links. Practice emails use an on-brand HTML wrapper with a CID-attached logo (`email-brand.ts`).

Database (Neon **nusmandotdev** only):

```bash
npm run db:generate   # after schema edits
npm run db:migrate    # through 0020_person_email_verified.sql
npm run db:seed       # owner row from ADMIN_EMAIL; hashes password if empty
```

This app is a **separate** Vercel project. Root Directory: `admin`. Domains: `desk.nusman.dev` + `portal.nusman.dev`. Do not point the public-site Vercel project here. Do not commit `.env.local`.
