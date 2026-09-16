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
| `/` | Home — hero, What I Do, skills, process, testimonials, collaborations, FAQ |
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
| [docs/desk.md](docs/desk.md) | Living plan for Desk (desk.nusman.dev) |
| [docs/portal.md](docs/portal.md) | Living plan for the client portal (portal.nusman.dev) |
| [docs/desk-status.md](docs/desk-status.md) | What’s live on Desk / Portal vs still open |
| [docs/archive/](docs/archive/) | Snapshots of plans before major changes |
| [docs/style-guide.md](docs/style-guide.md) | Brand tokens for the public site and Desk |
| [docs/deploy.md](docs/deploy.md) | Vercel: public Vite app and Desk/Portal Next app |
| [docs/changelog.md](docs/changelog.md) | What changed (Sep 2026 review, then Desk / Portal) |

## Deploy

See [docs/deploy.md](docs/deploy.md). Public site: Vercel, `npm run build`, output `dist`. Desk and Portal are one Vercel project (`admin/`, `desk.nusman.dev` + `portal.nusman.dev`) — see that same file.

## License

MIT — see [LICENSE](LICENSE).

## Contact

- Email: nuestman@icloud.com
- LinkedIn: https://www.linkedin.com/in/numan-usman/
- GitHub: https://github.com/Nuestman
