# Changelog

## 13 Sep 2026 — Review fixes

Live checks used `http://localhost:5173`.

### High

**Testimonials 404.** Avatars pointed at `/images/about-imgs/…`, which is not in `public/`. The PNG files are not in the repo. The carousel now uses initials plus the AngloGold logo (and a UVTI text badge). Prev/next and dots have accessible names.

**Unused story photos.** Four large photos were unused; `About.tsx` duplicated About page copy. Shared `src/data/story.ts` now drives four About tabs with photos. Dead `About.tsx` was removed. `story-emnurse.jpg` is lowercase for Linux/Vercel.

**Contact form honesty.** The mailto fallback used to say “sent successfully”; failures were `console.error` only. There are now three statuses: Formspree success, mailto draft opened, or a visible error. Fields have labels. Set `VITE_FORMSPREE_ID` on Vercel for server submit.

**SEO URLs.** Open Graph, Twitter, and JSON-LD pointed at GitHub. Canonical, OG, Twitter, JSON-LD, `robots.txt`, and `sitemap.xml` use `https://nusman.dev`. Each route sets its own `document.title`.

**PWA manifest.** Empty name; icons at `/android-chrome-*.png`. Name is `Numan Usman`; icons live under `/favicon/`.

**No 404.** Unknown paths rendered an empty layout. `NotFoundPage` handles `*`.

**Footer placeholder social links.** Instagram and Twitter `#` links were removed. GitHub, LinkedIn, and Facebook remain, each with `aria-label`.

### Medium

Skip link, form labels, FAQ and menu ARIA, testimonial controls, hero `aria-live`, `prefers-reduced-motion`, and Framer `MotionConfig reducedMotion="user"`.

Removed unused `formatDate` / `debounce` / `throttle` and `@types/react-router-dom` v5 (React Router 7 ships types).

What I Can Do, My Process, and FAQ CTAs use `<Link>`. HIPAA wording was replaced with privacy-conscious copy. FAQ testing claim matches lint, TypeScript, and unit tests.

### Low

Google Fonts load only from `index.html`. Routes besides Home are lazy-loaded. Portfolio is an honest “case studies coming” page and a first-class nav item. Tailwind content paths only scan `src/` and `index.html`. `npm run lint:fix` and `npm test` added. Vitest 5; `npm audit` reports 0.
