# Nusman visual style guide

Brand system for **nusman.dev** (public site) and **desk.nusman.dev** (workbench). Tokens live in `tailwind.config.js` and `src/index.css`. Desk copies these tokens into `admin/` rather than importing the marketing CSS at runtime.

The live specimens page is Desk **`/style`**. Keep this file and that page in step.

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
| Hero name accent | `gradient-text` on the word “Usman.” |
| Subhead / rotating line | `text-2xl sm:text-3xl md:text-4xl font-heading` |
| Body | `text-lg` or `text-xl` `text-gray-700` / `text-dark-950/75` |
| Nav | `font-heading text-lg` (CSS bumps this to 1.5rem) |
| Card title | `text-2xl font-semibold` (Inter) or `font-heading text-2xl` |

**Desk (workbench)**

Same large Odibee titles as the public site. Tables and form labels stay small.

| Use | Classes |
|---|---|
| Screen title | `section-heading` → `text-5xl md:text-6xl lg:text-7xl font-heading text-dark-950` |
| Playbook section title | `section-heading` |
| Card / panel title | `font-heading text-2xl text-gold-500` |
| Body | `text-sm md:text-base text-gray-700` |
| Table | `text-sm` |
| Meta / labels | `text-sm text-gray-500` |

Do not use `section-heading` inside tables or on buttons. Login stays a compact card (`font-heading text-2xl`).

Name accent on marketing only: `gradient-text` (`from-gold-500 to-gold-600`). Desk does not need gradient headlines.

---

## Layout and space

- Page padding: `container mx-auto px-4`.
- Marketing sections: `py-20` or `py-24`.
- Desk / Portal chrome and pages: `PAGE_FRAME_CLASS` — `px-4 sm:px-6 lg:px-8`, `max-w-[1400px]`.
- Most screens: PageSpread (intro ~22–26rem, optional rail under intro, main fills the rest).
- Portal brief / questions: centered `max-w-3xl` (`PAGE_NARROW_CLASS`). Brief is a locked document; questions are a separate form.
- Page ground: `bg-gray-50` or `gradient-bg` (`from-white via-gray-50 to-gold-50`). Desk: flat `bg-gray-50` is enough.
- Grid gaps: `gap-4` for cards, `gap-6`–`gap-8` for marketing splits.
- Header matches the public bar: `py-4`, logo `h-12`. Nav Odibee is `1.5rem` (`.font-heading.text-lg`). Hamburger below `500px`.

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
| `link` | Gold + underline at rest, gold-600 on hover. Not a filled control. |
| `destructive` | Red-500 — delete only |

Sizes: `sm` `h-9`, `default` `h-10`, `lg` `h-11 px-8` (marketing), `icon` square.

Focus: gold ring (`focus-visible:ring-2 focus-visible:ring-ring`).

One primary button per view. Secondary is outline or secondary gray. Card header actions (Add, Edit, Open) use `outline`.

### Cards

`rounded-2xl border border-gray-200 bg-white text-dark-950 shadow-sm`. Header `p-6`, content `p-6 pt-0`. Titles `font-heading text-2xl text-gold-500`. Descriptions `text-sm text-gray-600`.

On dark: invert to `bg-white/[0.06]` or `bg-dark-950` with `text-white`. Desk home widgets stay on white.

### Inputs

Public contact pattern:

```
w-full px-4 py-3 bg-white/90 border border-gray-200 rounded-lg
focus:ring-2 focus:ring-gold-500 focus:border-gold-500
```

Labels: `text-sm font-medium text-dark-950 mb-2`. Required fields stay required. Errors: red-700 text, red-100 panel — never silent.

Desk / Portal messages use `MessageComposer`: default **Plain text**, optional **Rich text** (self-hosted TinyMCE, Inter, gold links, no menubar/branding). Persist and render through `sanitize-html`. Do not drop a second rich-text library on notes or forms.

### Nav

Header items: `linkClassName("nav")` / `linkClassName("navActive")` in `admin/src/lib/links.ts`.

| State | Look |
|---|---|
| Rest | Odibee `font-heading text-lg` (1.5rem), ink `text-dark-950`. No underline |
| Hover | Gold `text-gold-500`. Still no underline |
| Current page | Gold `text-gold-500`. No hover shift |

Do not underline nav. Underlines are for links in copy and tables. The live header is the specimen; `/style` #nav shows rest / hover / current.

Compact (`<500px`): hamburger, square logo, no “Desk” wordmark. `500px`–`1023px`: stacked centred logo + wrapping nav (logo stays in normal flow, never absolutely positioned). `1024px+`: one row (logo + nav).

### Account menu (Desk)

Last nav item. Identity, not a marketing caricature.

- Chip: `bg-gray-100 hover:bg-gray-200` (same fill as `secondary`), circular photo, **no gold ring at rest**. Gold ring only on `focus-visible`. Missing photos use `/avatars/default-user.png` — gold-500 fill, white silhouette, no ring.
- Badge includes the notifications bell and unread count. The Notifications menu row shows the same bubble.
- Menu: signed-in name, then Notifications, Playbook, Profile, Journal, Sign out. Ink rows, grey hover. Inline SVG icons — not lucide, not Framer.
- Journal, Notifications, and Playbook live here, not in the main nav. Portal account menu: signed-in name, Notifications, Profile, Sign out.

The live header is the specimen. `/style` #nav describes it in copy and does not mount a dummy dropdown.

### Links

Desk text links are gold and underlined **at rest**. They must not look like body copy until hover.

Use `linkClassName(kind)` — do not scatter `text-gold-500 underline` by hand.

| Kind | Use | Look |
|---|---|---|
| `inline` | Links inside sentences | Gold + underline, gold-600 on hover |
| `back` | `← Clients` above a title | Same as inline, `text-sm` |
| `table` | Names in lists and tables | Same as inline, `font-medium` |
| `chip` / `chipActive` | Jump chips and list filters | Pill. Rest: white, gold border on hover. Active: gold fill, white text |
| Button `variant="link"` | A `<button>` that should look like inline | Same gold underline. Not a route |

Gold fill or outline that navigates (`buttonClassName()`) is a **button**, not a text link. Skip-to-content stays screen-reader only until focused.

Public site on dark chrome: `text-white/80 hover:text-gold-400`. Public body links can stay the marketing pattern; Desk in-line links must stay gold.

Live specimens: Desk `/style` #links.

### Tables (Desk)

White frame: `desk-table` inside `rounded-2xl border border-gray-200 bg-white shadow-sm`. Header `bg-gray-50 text-gray-600`. Cells `px-4 py-3`. Even rows and hover: `gray-50`. Current row: `gold-50` (`data-current`). Inactive row: gold wash (`data-inactive`) plus an Inactive pill on the name. Names in cells use `linkClassName("table")`. Last column is Actions: Edit (`linkClassName("back")`) and Remove. Playbook, Style, and Audit tables have no Actions column.

Use `tableFrameClassName` and `tableClassName` from `admin/src/lib/tables.ts`. Do not scatter zebra or hover classes on each `<tr>`.

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

**Desk / Portal:** logo in the chrome, plus the signed-in person’s photo on Profile and as the last header nav item (account menu). That photo is identity, not marketing. Users without a photo use `/avatars/default-user.png` (gold circle, white silhouette, no ring). No collab marquee or testimonial avatars. Empty states: short sentence + gold button, not an illustration unless we add one later on purpose.

---

## Voice in the UI

- Direct. “Clients”, “Projects”, “Send the intake”, not “Let’s embark on your journey”.
- Process language matches the site: Discover & Plan, Build & Test, Launch & Support; internally the seven gates.
- Personal work is **Journal**, never Log (that word collides with sign-in and Audit). The route stays `/log`.
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
- Gold + underline for Desk links in copy
- Copy tokens into Desk; keep both apps on this palette

**Don’t**

- Introduce a second accent colour
- Use `section-heading` inside Desk tables
- Put caricatures on login or project forms (the operator photo belongs on Profile / the account menu)
- Gold-ring the account photo or default avatar at rest (grey chip; default is gold fill + white silhouette, no ring)
- Put Journal in the main nav
- Make body links look like body text (ink until hover)
- Mix another product’s UI (Mineaid, Uventory, etc.) into this brand
- Ship gradients on Desk chrome (marketing `gradient-text` / `gradient-bg` only)

---

## Implementing in Desk

1. Copy gold/dark/font tokens from `tailwind.config.js`.
2. Copy Inter + Odibee `<link>`s and the `font-heading` / focus / scrollbar rules (not collab-marquee).
3. Recreate `Button` and `Card` with the same variants. Tables use `desk-table`.
4. Screen titles use `section-heading`, same as public pages. Not inside tables.
5. Check a list page, a form, login, and the header account chip against this file before calling a slice done. The Desk `/style` page is the visual check — it must list every section in this file. The live header is the specimen for the account menu.
