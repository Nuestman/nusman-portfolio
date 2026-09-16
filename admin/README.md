# Desk

Private workbench for the nusman.dev practice, plus the client portal. Version **2.1.0**. Plan: [../docs/desk-2.0.md](../docs/desk-2.0.md). Portal: [../docs/portal.md](../docs/portal.md). Status: [../docs/desk-status.md](../docs/desk-status.md). Visual: [../docs/style-guide.md](../docs/style-guide.md).

Requires Node **24.x** and npm `>=10`. Vercel follows `engines.node` in this file. Set the project’s Node.js Version to **24.x**. Domains: `desk.nusman.dev` and `portal.nusman.dev`.

```bash
cd admin
cp .env.example .env.local   # ADMIN_EMAIL, ADMIN_PASSWORD, AUTH_SECRET, DATABASE_URL
npm run dev                  # http://localhost:3000 · Portal: http://portal.localhost:3000
```

`AUTH_SECRET` must be at least 16 characters. Optional `ADMIN_NAME` defaults to Numan Usman on seed.

For Resend (magic links + alerts): set `RESEND_API_KEY` and a **verified** `PORTAL_FROM_EMAIL` (see `.env.example`). Without them, Desk can still copy magic links.

Database (Neon **nusmandotdev** only):

```bash
npm run db:generate   # after schema edits
npm run db:migrate    # through 0011_process_gate_remap.sql
npm run db:seed       # owner row from ADMIN_EMAIL; hashes password if empty
```

This app is a **separate** Vercel project. Root Directory: `admin`. Domains: `desk.nusman.dev` + `portal.nusman.dev`. Do not point the public-site Vercel project here. Do not commit `.env.local`.
