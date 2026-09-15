export const GOLD_SWATCHES = [
  { token: "gold-50", hex: "#FEFCE8", className: "bg-gold-50", use: "Soft tint, current table row" },
  { token: "gold-100", hex: "#FEF9C3", className: "bg-gold-100", use: "Warm highlight" },
  { token: "gold-200", hex: "#FEF08A", className: "bg-gold-200", use: "Rare" },
  { token: "gold-300", hex: "#FDE047", className: "bg-gold-300", use: "Gradient highlight on dark cards" },
  { token: "gold-400", hex: "#FACC15", className: "bg-gold-400", use: "Icons on dark" },
  {
    token: "gold-500",
    hex: "#B98C1B",
    className: "bg-gold-500",
    use: "Primary actions, links, focus, brand",
    invert: true,
  },
  {
    token: "gold-600",
    hex: "#A16207",
    className: "bg-gold-600",
    use: "Button hover, heading hover",
    invert: true,
  },
  {
    token: "gold-700",
    hex: "#854D0E",
    className: "bg-gold-700",
    use: "Pressed / strong hover",
    invert: true,
  },
  {
    token: "gold-800",
    hex: "#713F12",
    className: "bg-gold-800",
    use: "Rare",
    invert: true,
  },
  {
    token: "gold-900",
    hex: "#633C12",
    className: "bg-gold-900",
    use: "Rare",
    invert: true,
  },
  {
    token: "gold-950",
    hex: "#150F00",
    className: "bg-gold-950",
    use: "Same as ink; prefer dark-950 for text",
    invert: true,
  },
] as const;

export const INK_SWATCHES = [
  {
    token: "dark-950",
    hex: "#150F00",
    className: "bg-dark-950",
    use: "Headings, body on light, dark section fills",
    invert: true,
  },
  {
    token: "dark-900",
    hex: "#18181B",
    className: "bg-dark-900",
    use: "Secondary if needed; prefer gray",
    invert: true,
  },
  {
    token: "dark-700",
    hex: "#3F3F46",
    className: "bg-dark-700",
    use: "Secondary if needed; prefer gray",
    invert: true,
  },
  {
    token: "dark-500",
    hex: "#71717A",
    className: "bg-dark-500",
    use: "Secondary if needed; prefer gray",
    invert: true,
  },
] as const;

export const NEUTRAL_SWATCHES = [
  { token: "white", hex: "#FFFFFF", className: "bg-white", use: "Cards, inputs" },
  { token: "gray-50", hex: "#F9FAFB", className: "bg-gray-50", use: "Page ground, table headers, zebra, row hover" },
  { token: "gray-100", hex: "#F3F4F6", className: "bg-gray-100", use: "Secondary button rest" },
  { token: "gray-200", hex: "#E5E7EB", className: "bg-gray-200", use: "Quiet fills, borders" },
  { token: "gray-500", hex: "#6B7280", className: "bg-gray-500", use: "Meta / labels", invert: true },
  { token: "gray-600", hex: "#4B5563", className: "bg-gray-600", use: "Supporting copy", invert: true },
  { token: "gray-700", hex: "#374151", className: "bg-gray-700", use: "Supporting copy", invert: true },
] as const;

export const TYPE_SPECIMENS = [
  {
    label: "Screen title",
    sample: "Clients",
    className: "section-heading",
    note: "Odibee. section-heading. Desk and public. Not inside tables or on buttons.",
  },
  {
    label: "Card title",
    sample: "People",
    className: "font-heading text-2xl text-dark-950",
    note: "Odibee. font-heading text-2xl. Login stays this size.",
  },
  {
    label: "Nav",
    sample: "Today  Projects  Style",
    className: "font-heading text-lg text-dark-950",
    note: "Odibee. 1.5rem. Ink at rest, gold when active. No underline.",
  },
  {
    label: "Public subhead",
    sample: "Discover & Plan",
    className: "text-2xl sm:text-3xl md:text-4xl font-heading text-dark-950",
    note: "Odibee. Marketing rotating line / subhead.",
  },
  {
    label: "Body",
    sample: "The hiring party — person or organisation paying for the work.",
    className: "text-sm md:text-base text-gray-700",
    note: "Inter. Desk body. Public often text-lg or text-xl.",
  },
  {
    label: "Meta",
    sample: "nuestman@icloud.com",
    className: "text-sm text-gray-500",
    note: "Inter. Labels and timestamps.",
  },
] as const;

export const STYLE_JUMP_LINKS = [
  { href: "#brand", label: "Brand" },
  { href: "#colour", label: "Colour" },
  { href: "#type", label: "Type" },
  { href: "#layout", label: "Layout" },
  { href: "#shape", label: "Shape" },
  { href: "#nav", label: "Nav" },
  { href: "#links", label: "Links" },
  { href: "#buttons", label: "Buttons" },
  { href: "#cards", label: "Cards" },
  { href: "#forms", label: "Forms" },
  { href: "#table", label: "Table" },
  { href: "#pills", label: "Pills" },
  { href: "#motion", label: "Motion" },
  { href: "#imagery", label: "Imagery" },
  { href: "#voice", label: "Voice" },
  { href: "#access", label: "Access" },
  { href: "#rules", label: "Rules" },
] as const;

export const BRAND_SURFACES = [
  ["Public site", "nusman.dev", "Trust, story, contact"],
  ["Desk", "desk.nusman.dev", "Work: clients, projects, process"],
  ["Wide logo", "/logos/nusman-logo-wide.png", "Nav"],
  ["Square logo", "/logos/nusman-logo-square.png", "Footer, OG, login, compact header"],
] as const;

export const COLOUR_RULES = [
  "One accent: gold. Do not add a second brand colour (blue, purple, dashboard teal).",
  "Status may use traffic colours sparingly: green for done, amber for in progress, red for destructive only.",
  "Do not rainbow-code every gate. Gates are type plus a gold active state, not seven hues.",
  "Dark sections (bg-dark-950) use gold type or white/75 body, gold-400 icons.",
  "Never put gold-500 large fills behind gold-500 text. Text on gold-500 is white.",
] as const;

export const TYPE_FAMILIES = [
  ["Body", "Inter", "font-sans (default on body). Load 300–900."],
  ["Voice / headings / nav", "Odibee Sans", "font-heading. One cut: weight 400."],
  ["Display", "Odibee Sans", "font-display — same stack."],
] as const;

export const TYPE_PUBLIC_SCALE = [
  ["Page section title", "section-heading → text-5xl md:text-6xl lg:text-7xl font-heading text-dark-950"],
  ["Hero name accent", "gradient-text on the word “Numan.” Marketing only."],
  ["Subhead / rotating line", "text-2xl sm:text-3xl md:text-4xl font-heading"],
  ["Body", "text-lg or text-xl text-gray-700 / text-dark-950/75"],
  ["Nav", "font-heading text-lg (CSS bumps this to 1.5rem)"],
  ["Card title", "text-2xl font-semibold (Inter) or font-heading text-2xl"],
] as const;

export const TYPE_DESK_SCALE = [
  ["Screen title", "section-heading, same as public"],
  ["Playbook section title", "section-heading"],
  ["Card / panel title", "font-heading text-2xl text-dark-950"],
  ["Body", "text-sm md:text-base text-gray-700"],
  ["Table", "text-sm"],
  ["Meta / labels", "text-sm text-gray-500"],
  ["Login title", "font-heading text-2xl — compact card, not section-heading"],
] as const;

export const LAYOUT_RULES = [
  ["Page padding", "container mx-auto px-4. Desk main: px-4 py-10."],
  ["Marketing sections", "py-20 or py-24."],
  ["Desk chrome / lists", "max-w-[1400px], same as the public container."],
  ["Desk forms", "max-w-3xl."],
  ["Page ground", "Public: bg-gray-50 or gradient-bg. Desk: flat bg-gray-50."],
  ["Grid gaps", "gap-4 for cards, gap-6–gap-8 for marketing splits."],
  ["Header", "py-4, logo h-12. Nav Odibee 1.5rem."],
  ["Breakpoints", "<500px hamburger. 500–1023 stacked. 1024+ one row."],
] as const;

export const SHAPE_RULES = [
  ["Buttons (default)", "rounded-md (8px from --radius)"],
  ["Marketing CTAs", "rounded-full (Let’s talk)"],
  ["Cards", "rounded-2xl"],
  ["Inputs", "rounded-lg"],
  ["Pills / jump chips", "rounded-full"],
  [
    "Unusual service tiles",
    "rounded-tl-[1.75rem] rounded-tr-md rounded-bl-md rounded-br-[1.75rem] — marketing only",
  ],
] as const;

export const BUTTON_VARIANTS = [
  ["default", "bg-gold-500 text-white hover:bg-gold-600 — primary"],
  ["outline", "Gold border, gold text, fill gold on hover"],
  ["secondary", "Gray-100 rest, gray-200 hover"],
  ["ghost", "Hover gray-100"],
  ["link", "Gold + underline at rest, gold-600 on hover. Not a filled control."],
  ["destructive", "Red-500 — delete only"],
] as const;

export const LINK_KINDS = [
  ["inline", "Links inside sentences", "Gold + underline, gold-600 on hover"],
  ["back", "← Clients above a title", "Same as inline, text-sm"],
  ["table", "Names in lists and tables", "Same as inline, font-medium"],
  ["nav / navActive", "Header items", "Odibee 1.5rem. No underline. Gold when current."],
  ["chip / chipActive", "Jump chips and list filters", "Pill. Rest white; active gold fill."],
  ["Button variant=link", "A button that should look like inline", "Same gold underline. Not a route."],
] as const;

export const MOTION_RULES = [
  ["Marketing", "Fade/slide on scroll (duration 0.4–0.8) is allowed. Framer Motion with reducedMotion=user."],
  ["Desk", "Almost none. No floating caricatures, no marquees, no hero cycles."],
  ["Shared", "Hover colour transitions duration-300 are enough."],
  ["Scrollbar", "8px, gold thumb, gray track."],
] as const;

export const ACCESS_RULES = [
  "Text on gold-500 is white.",
  "Icon-only controls need aria-label (public header menu, testimonial prev/next).",
  "Focus visible, never outline-none without a ring. Gold ring.",
  "Reduced motion: no essential information only in animation. Honour prefers-reduced-motion.",
  "Skip-to-content stays screen-reader only until focused.",
] as const;

export const VOICE_DO = [
  "Gold for the one action that matters.",
  "dark-950 for type on light.",
  "Odibee for titles and nav, Inter for data.",
  "Gold + underline for Desk links in copy.",
  "“Clients”, “Projects”, “Send the intake”.",
  "Process language: Discover & Plan, Build & Test, Launch & Support; internally the seven gates.",
  "Ghana English is fine. No fake startup jargon.",
  "Errors say what happened and what to do.",
] as const;

export const VOICE_DONT = [
  "A second accent colour.",
  "section-heading inside Desk tables or on buttons.",
  "Caricatures on login or project forms.",
  "Body-coloured links that only turn gold on hover.",
  "Another product’s UI (Mineaid, Uventory) mixed into this brand.",
  "Gradients on Desk chrome (marketing gradient-text / gradient-bg only).",
  "Diagonal service-tile radius on forms or tables.",
  "Neon glow or heavy drop shadows.",
] as const;

export const IMPLEMENTING_STEPS = [
  "Copy gold/dark/font tokens from tailwind.config.js into admin.",
  "Copy Inter + Odibee and the font-heading / focus / scrollbar rules (not collab-marquee).",
  "Recreate Button and Card with the same variants.",
  "Screen titles use section-heading, same as public pages. Not inside tables.",
  "Use linkClassName and desk-table. Do not scatter gold or zebra classes by hand.",
  "Check a list page, a form, and login against this page before calling a slice done.",
] as const;
