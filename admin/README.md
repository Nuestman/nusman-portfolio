# Desk

Private workbench for the nusman.dev practice. Plan: [../docs/desk.md](../docs/desk.md). Visual: [../docs/style-guide.md](../docs/style-guide.md).

```bash
cd admin
cp .env.example .env.local   # ADMIN_EMAIL, ADMIN_PASSWORD, AUTH_SECRET, DATABASE_URL
npm run dev                  # http://localhost:3000
```

Database (Neon **nusmandotdev** only):

```bash
npm run db:generate   # after schema edits
npm run db:migrate
npm run db:seed       # operator row from ADMIN_EMAIL
```

This app is a **separate** Vercel project. Root Directory: `admin`. Domain: `desk.nusman.dev`. Do not point the public-site Vercel project here.
