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
