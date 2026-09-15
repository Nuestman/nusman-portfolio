# Desk

Private workbench for the nusman.dev practice. Version **1.0.0**. Plan: [../docs/desk.md](../docs/desk.md). Status: [../docs/desk-status.md](../docs/desk-status.md). Visual: [../docs/style-guide.md](../docs/style-guide.md).

Requires Node `^20.19.0 || >=22.12.0` and npm `>=10` (same as the public site).

```bash
cd admin
cp .env.example .env.local   # ADMIN_EMAIL, ADMIN_PASSWORD, AUTH_SECRET, DATABASE_URL
npm run dev                  # http://localhost:3000
```

`AUTH_SECRET` must be at least 16 characters. Optional `ADMIN_NAME` defaults to Numan Usman on seed.

Database (Neon **nusmandotdev** only):

```bash
npm run db:generate   # after schema edits
npm run db:migrate    # through 0006_users_profile.sql
npm run db:seed       # owner row from ADMIN_EMAIL; hashes password if empty
```

This app is a **separate** Vercel project. Root Directory: `admin`. Domain: `desk.nusman.dev`. Do not point the public-site Vercel project here. Do not commit `.env.local`.
