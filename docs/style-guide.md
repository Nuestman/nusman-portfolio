# Nusman visual style guide

Brand system for **nusman.dev** (public site) and **desk.nusman.dev** (workbench). Tokens live in `tailwind.config.js` and `src/index.css`. Desk copies these tokens into `admin/` rather than importing the marketing CSS at runtime.

If marketing and Desk drift, Desk follows this guide. Update this file when a token or rule changes.

---

## Brand

Numan Usman — gold on near-black, Inter for reading, Odibee Sans for voice. The public site is warm and personal (caricatures, large type, motion). Desk is the same brand used as a tool: quieter, denser, no marketing theatre.

| Surface | URL | Tone |
|---|---|---|
| Public site | nusman.dev | Trust, story, contact |
| Desk | desk.nusman.dev | Work: clients, projects, process |
| Logo | `/logos/nusman-logo-wide.png` (nav), `/logos/nusman-logo-square.png` (footer / OG) | White tile behind square logo on dark footers |

Favicons live under `/favicon/`.

---

## Colour

Primary gold is **`#B98C1B`** (`gold-500`). Ink is **`#150F00`** (`dark-950` and `gold-950` — same hex).

### Gold

| Token | Hex | Use |
|---|---|---|
| `gold-50` | `#fefce8` | Soft page tint, selected table row |
| `gold-100` | `#fef9c3` | Warm highlight |
| `gold-200` | `#fef08a` | Rare |
| `gold-300` | `#fde047` | Gradient highlight on dark cards |
| `gold-400` | `#facc15` | Icons on dark |
| **`gold-500`** | **`#B98C1B`** | **Primary actions, links hover, focus ring, brand** |
| `gold-600` | `#a16207` | Button hover, heading hover |
| `gold-700` | `#854d0e` | Pressed / strong hover |
| `gold-800` | `#713f12` | Rare |
| `gold-900` | `#633c12` | Rare |
| `gold-950` | `#150F00` | Same as ink; prefer `dark-950` for text |

### Dark / ink

| Token | Hex | Use |
|---|---|---|
| `dark-950` | `#150F00` | Headings, body on light, dark section fills |
| `dark-900`–`dark-500` | zinc-like scale | Secondary text if needed; prefer gray utilities below |

### Neutrals (Tailwind gray)

Default Tailwind gray. **`gray-200`** (`#e5e7eb`) is a brand-adjacent fill we already use — keep using it.

| Class | Hex | Use |
|---|---|---|
| `bg-white` | `#ffffff` | Cards, inputs |
| `bg-gray-50` | `#f9fafb` | Page ground, table headers |
| `bg-gray-100` | `#f3f4f6` | Secondary button rest state |
| **`bg-gray-200`** | **`#e5e7eb`** | **Quiet fills: process wells, icon tiles, progress tracks, secondary hover** |
| `border-gray-200` | `#e5e7eb` | Card, table, input, and chip borders |
| `text-gray-500` | `#6b7280` | Meta / labels |
| `text-gray-600` / `text-gray-700` | `#4b5563` / `#374151` | Supporting copy |
| `text-white` / `text-white/80` | — | Copy on `dark-950` |
| `text-white/60` | — | Footer meta |

On the public site, `bg-gray-200` is the How I Work well behind the three steps, a Skills icon wrap, the playbook gate track, and `secondary` button hover. Desk should use it the same way: structure behind content, not a competing accent.

### Semantic CSS variables (`src/index.css`)

Marketing already maps shadcn-style HSL vars. Primary tracks gold (`45 86% 40%`). Ring matches gold. Radius `--radius: 0.5rem`.

### Rules

- One accent: gold. Do not add a second brand colour (blue, purple, “dashboard teal”).
- Status may use existing traffic colours sparingly: green for done, amber for in progress, red for destructive only.
- Do not rainbow-code every gate. Gates are type + a gold active state, not seven different hues.
- Dark sections (`bg-dark-950`) use gold type or white/75 body, gold-400 icons.
- Never put gold-500 large fills behind gold-500 text.

---

## Typography

| Role | Family | Tailwind |
|---|---|---|
| Body | Inter | `font-sans` (default on `body`) |
| Voice / headings / nav | Odibee Sans | `font-heading` |
| Display | Odibee Sans | `font-display` (same stack) |

Load from Google Fonts (public `index.html` already does):

- Inter: 300–900
- Odibee Sans

`.font-heading` forces weight 400 (Odibee has one cut). Do not bold Odibee with `font-bold` expecting a heavier file — size and colour carry hierarchy.

### Scale

**Public marketing**

| Use | Classes |
|---|---|
| Page section title | `section-heading` → `text-5xl md:text-6xl lg:text-7xl font-heading text-dark-950` |
| Hero name accent | `gradient-text` on the word “Numan.” |
| Subhead / rotating line | `text-2xl sm:text-3xl md:text-4xl font-heading` |
| Body | `text-lg` or `text-xl` `text-gray-700` / `text-dark-950/75` |
| Nav | `font-heading text-lg` (CSS bumps this to 1.5rem) |
| Card title | `text-2xl font-semibold` (Inter) or `font-heading text-2xl` |

**Desk (workbench)**

Do not use `section-heading` on every screen. It is a landing-page size.

| Use | Classes |
|---|---|
| Screen title | `font-heading text-3xl md:text-4xl text-dark-950` |
| Card / panel title | `font-heading text-2xl text-dark-950` |
| Body | `text-sm md:text-base text-gray-700` |
| Table | `text-sm` |
| Meta / labels | `text-sm text-gray-500` |

Name accent on marketing only: `gradient-text` (`from-gold-500 to-gold-600`). Desk does not need gradient headlines.

---

## Layout and space

- Page padding: `container mx-auto px-4`.
- Marketing sections: `py-20` or `py-24`.
- Desk pages: `px-4 py-8` (or similar), max width `max-w-6xl` for lists, `max-w-3xl` for forms.
- Page ground: `bg-gray-50` or `gradient-bg` (`from-white via-gray-50 to-gold-50`). Desk: flat `bg-gray-50` is enough.
- Grid gaps: `gap-4` for cards, `gap-6`–`gap-8` for marketing splits.
- Header is fixed; public content uses `pt-20`. Desk nav should not steal a full hero — compact top bar or sidebar.

---

## Shape

| Element | Radius |
|---|---|
| Buttons (default) | `rounded-md` (8px from `--radius`) |
| Marketing CTAs (Let’s talk) | `rounded-full` |
| Cards | `rounded-2xl` |
| Inputs | `rounded-lg` |
| Pills / jump chips | `rounded-full` |
| Unusual service tiles | `rounded-tl-[1.75rem] rounded-tr-md rounded-bl-md rounded-br-[1.75rem]` — **marketing only** |

Desk: cards `rounded-2xl`, buttons `rounded-md`, pills `rounded-full`. Do not use the diagonal service-tile radius on forms or tables.

Shadows: `shadow-sm` on cards. Marketing may use `shadow-lg` on hover. No neon glow, no heavy drop shadows.

---

## Components

### Buttons

From `src/components/ui/button.tsx`.

| Variant | Look |
|---|---|
| `default` | `bg-gold-500 text-white hover:bg-gold-600` — primary |
| `outline` | Gold border, gold text, fill gold on hover |
| `secondary` | Gray-100 |
| `ghost` | Hover gray-100 |
| `link` | Gold, underline on hover |
| `destructive` | Red-500 — delete only |

Sizes: `sm` `h-9`, `default` `h-10`, `lg` `h-11 px-8` (marketing), `icon` square.

Focus: gold ring (`focus-visible:ring-2 focus-visible:ring-ring`).

One primary button per view. Secondary is outline or secondary gray.

### Cards

`rounded-2xl border border-gray-200 bg-white text-dark-950 shadow-sm`. Header `p-6`, content `p-6 pt-0`. Titles `text-2xl`. Descriptions `text-sm text-gray-600`.

On dark: invert to `bg-white/[0.06]` or `bg-dark-950` with `text-white`. Desk home widgets stay on white.

### Inputs

Public contact pattern:

```
w-full px-4 py-3 bg-white/90 border border-gray-200 rounded-lg
focus:ring-2 focus:ring-gold-500 focus:border-gold-500
```

Labels: `text-sm font-medium text-dark-950 mb-2`. Required fields stay required. Errors: red-700 text, red-100 panel — never silent.

### Links

- Default text: `text-dark-950 hover:text-gold-500`
- Active nav: `text-gold-500`
- On dark: `text-white/80 hover:text-gold-400`

### Tables (Desk)

White frame, `rounded-2xl border border-gray-200`, header `bg-gray-50 text-gray-600`, cells `px-4 py-3`, row borders `border-gray-100`. Selected / current row: `bg-gold-50`. Do not zebra in gold.

### Pills / chips

`rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm`. Active: gold border or `bg-gold-500 text-white`.

---

## Motion

Public site uses Framer Motion with `MotionConfig reducedMotion="user"`. Honour `prefers-reduced-motion` (already in `index.css`).

| Context | Motion |
|---|---|
| Marketing | Fade/slide on scroll (`duration` 0.4–0.8) is allowed |
| Desk | Almost none. No floating caricatures, no marquees, no hero cycles |
| Shared | Hover colour transitions `duration-300` are enough |

Scrollbar: 8px, gold thumb, gray track.

---

## Imagery

**Public:** caricature portraits in `public/images/portraits/`, story photos, logos. They are part of the marketing voice.

**Desk:** logo in the chrome only. No caricatures, collab marquee, or testimonial avatars. Empty states: short sentence + gold button, not an illustration unless we add one later on purpose.

---

## Voice in the UI

- Direct. “Clients”, “Projects”, “Send the intake”, not “Let’s embark on your journey”.
- Process language matches the site: Discover & Plan, Build & Test, Launch & Support; internally the seven gates.
- Ghana English is fine. No fake startup jargon.
- Errors say what happened and what to do.

---

## Accessibility

- Text on gold-500 is white.
- Icon-only controls need `aria-label` (see public header menu, testimonial prev/next).
- Focus visible, never `outline-none` without a ring.
- Reduced motion: no essential information only in animation.

---

## Do / don’t

**Do**

- Gold for the one action that matters
- `dark-950` for type on light
- Odibee for titles and nav, Inter for data
- Copy tokens into Desk; keep both apps on this palette

**Don’t**

- Introduce a second accent colour
- Use `section-heading` inside Desk tables
- Put caricatures on login or project forms
- Mix another product’s UI (Mineaid, Uventory, etc.) into this brand
- Ship gradients on Desk chrome (marketing `gradient-text` / `gradient-bg` only)

---

## Implementing in Desk

1. Copy gold/dark/font tokens from `tailwind.config.js`.
2. Copy Inter + Odibee `<link>`s and the `font-heading` / focus / scrollbar rules (not collab-marquee).
3. Recreate `Button` and `Card` with the same variants.
4. Screen titles at Desk scale, not `section-heading`.
5. Check a list page, a form, and login against this file before calling a slice done.
