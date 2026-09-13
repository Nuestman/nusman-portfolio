# Numan Usman — Portfolio

Personal site for Numan Usman, emergency nurse and web developer in Obuasi, Ghana.

Live site: [nusman.dev](https://nusman.dev)

## Stack

- React 18 and TypeScript
- Vite 7
- Tailwind CSS
- React Router 7
- Framer Motion
- Radix Slot (Button) and a small Card set
- Vercel

## Routes

| Path | Page |
| --- | --- |
| `/` | Home — hero, services, skills, process, testimonials, collaborations, FAQ |
| `/about` | Background, education, and photo story tabs |
| `/portfolio` | Current stack; case studies coming later |
| `/contact` | Contact details and form |
| any other path | 404 |

## Scripts

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run preview
npm run lint
npm run lint:fix
npm test
```

## Contact form

Copy `.env.example` to `.env` and set `VITE_FORMSPREE_ID` to your Formspree form id. Also set that variable in Vercel for production.

Without it, the form opens a mailto draft to `nuestman@icloud.com` and says so — it does not claim the message was already sent.

## Project layout

```
src/
  components/   layout and homepage sections
  data/         shared story copy and image paths
  hooks/        per-route title and meta
  lib/          cn()
  pages/        route screens
public/         logos, favicon, story photos, robots, sitemap
```

## Docs

| File | What it is |
| --- | --- |
| [docs/deploy.md](docs/deploy.md) | Vercel build, env, and SPA rewrites |
| [docs/changelog.md](docs/changelog.md) | What changed in the Sep 2026 review |

## Deploy

See [docs/deploy.md](docs/deploy.md). Short version: Vercel, `npm run build`, output `dist`.

## License

MIT — see [LICENSE](LICENSE).

## Contact

- Email: nuestman@icloud.com
- LinkedIn: https://www.linkedin.com/in/numan-usman/
- GitHub: https://github.com/Nuestman
