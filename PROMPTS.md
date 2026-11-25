# Prompt log & decisions

A running log of the prompts given to Claude Code and the key decisions/challenges at each step.

---

## Prompt 1 — Project brief (2026-11-25)

> I'm building a pixel-accurate clone of this website as a technical assignment: https://puppy.instabizweb.com/
> Goal: match the original's design, layout, responsiveness and functionality as closely as possible, then deploy it.
> Work in phases (Analysis → Setup → Build → Functionality → Testing → Deployment) and check in after each one. Keep a PROMPTS.md logging each prompt and key decisions. Use local copies of images in /public.

### Phase 1 — Analysis
**What was done**
- Opened the site in a browser at 1440px and 375px, scrolled every section and visited every route (home, puppies, puppy detail, how it works, happy families, gone home, FAQ, contact).
- Downloaded the HTML/CSS to read the exact design tokens instead of eyeballing them.

**Key findings / decisions**
- The reference is itself built with Next.js + Tailwind v4. Its CSS exposes the theme as variables (`--color-toffee`, `--font-display`, …), so we can copy the exact hex values, fonts (Fraunces, Figtree, Shantell Sans) and easing curves into our Tailwind theme.
- The home page is a "morning to night" scroll story with many custom illustrations and scroll-linked animations. That is the hardest part of the clone.
- Desktop nav shows from 1024px; below that there's a full-screen menu and a sticky WhatsApp/Call bar.

**Challenges**
- A route-change "curtain" loader hides the page for about 2s, so screenshots taken straight after navigating came out blank. Fixed by waiting before capturing.
- The "Meet the pups" section is 4,000px tall on desktop because it pins the section and scrolls the doors sideways. On mobile it's a plain 2-column grid, so it needs two different layouts.

Full checklist: [ANALYSIS.md](ANALYSIS.md)

---

## Prompt 2 — "Prioritized plan" (2026-11-25)

> Prioritized plan

(Chosen scope: make Home, Puppies, Puppy detail and the mobile menu pixel-close first. Build the other pages faithfully, but start with simpler versions of the most elaborate animations and polish them if time allows.)

### Phase 2 — Setup
**What was done**
- Scaffolded with `create-next-app` (Next.js 16.4, React 19.3, TypeScript, Tailwind CSS v4, ESLint, App Router, Turbopack).
- Created the folder structure: `app/`, `components/{layout,ui,home,illustrations}`, `lib/`, `public/assets/{images,videos,cursor,brand}`.
- Moved design tokens into Tailwind's `@theme` block in `app/globals.css`.
- Added `lib/site.ts` as the single source for contact details and navigation.
- Downloaded the logo, favicon/apple icon and paw cursor locally.

**Key decisions**
- **Tailwind v4 `@theme` instead of `tailwind.config.js`.** v4 is CSS-first: each `--color-*`, `--font-*` and `--ease-*` variable automatically becomes a utility (`bg-toffee`, `font-display`, `ease-pounce`). The values are copied exactly from the reference's compiled CSS.
- **Fonts through `next/font/google`.** Fraunces, Figtree and Shantell Sans are self-hosted at build time, which means no runtime request to Google, no layout shift, and a better Lighthouse score. Fraunces loads its `SOFT`/`WONK`/`opsz` axes and Shantell its `BNCE`/`INFM` axes. Without those axes the chunky "plush" headings and the bouncy handwriting don't match the original.
- **Same utility names as the reference** (`font-plush`, `font-scrawl`, `gutter`, `.btn-primary`, …), registered with Tailwind v4's `@utility`. This keeps visual parity easy to check against the original's CSS.
- **Placeholder contact details.** The reference's WhatsApp link points to a real third-party number, so the clone uses a placeholder (`+971 50 000 0000`, `hello@example.com`). It can be changed in one place.
- **Scaffolded in a temporary folder, then moved in.** npm package names can't contain spaces or capitals, and the project folder is called "Blutec Assignment".

**Challenges**
- Next.js 16 ships its docs inside `node_modules/next/dist/docs` and has new conventions (`LayoutProps` global type, `cacheComponents`). I checked the bundled font docs/types before writing the layout.
