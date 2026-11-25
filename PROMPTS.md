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

---

## Prompt 3 — "Yes, start Phase 3" (2026-11-25)

> Yes, start Phase 3

### Phase 3 (part 1) — Global layout, Hero, Meet the pups
**What was built**
- `components/layout/`: `SiteHeader` (fixed, transparent over the home hero, gains a background + scalloped hem on scroll, hides when scrolling down), `MobileMenu`, `WhatsAppBar` (sticky on phones) and `SiteFooter` (night sky, moon, twinkling stars, Teddy in a basket).
- `components/home/Hero.tsx` + `HeroLineup.tsx`: headline, CTAs, arched photo windows over a scalloped quilt, and Teddy peeking up with a "peekaboo!" bubble.
- `components/home/MeetThePups.tsx`: the door hallway. On desktop the section is pinned and scrolls sideways; on mobile it's a 2-column grid.
- `components/illustrations/Teddy.tsx`: the mascot with 4 poses (peek, sit, snug, bow).
- `lib/data/puppies.json`, `lib/data/family-photos.json` and `lib/puppies.ts`: typed data plus helpers.
- 127 photos/videos (72 MB) downloaded into `public/assets/media/` (local copies, not hot-linked).

**Key decisions**
- **Used the reference's own data and markup as the spec.** The original is a Next.js site, so its HTML and React Server Component payload already contain structured data: all 15 puppies (breed, age, focal points, blur placeholders, every photo/video) and 64 family photos. I wrote small Python scripts (kept outside the repo) to:
  1. export that data to JSON and rewrite every media URL to a local `/assets/media/<id>.<ext>` path;
  2. extract the CSS rules for each component from the compiled stylesheet into readable files under `app/styles/` (`header.css`, `hero.css`, `meet.css`, …);
  3. convert the server-rendered SVG illustrations (the Teddy mascot, basket, quilt) into JSX.

  Eyeballing would never reproduce hand-drawn SVG paths or easing curves pixel-for-pixel, so this was the only practical route to "pixel-accurate".
- **Component CSS files instead of only Tailwind classes.** The original mixes Tailwind utilities (kept as-is in the JSX) with bespoke component CSS that uses custom properties (`--peek`, `--tilt`, `--door`), `clip-path` animations and `@supports (animation-timeline: view())`. These don't fit utility classes well, so they live in plain CSS imported from `globals.css`.
- **Native `<dialog>` for the mobile menu.** It gives focus trapping, Esc-to-close and an inert background for free. The original's circular clip-path reveal animation is kept. Closing waits for the animation, with a timeout fallback.
- **Pinned door hallway, measured rather than guessed.** I read the original's live values in the browser: section height = `distance / 1.25 + 100vh`, the track moves 1.25px per 1px scrolled, and a door opens once its left edge passes 38vw. My implementation produces the same translateX values (0 / −1375 / −3250 / −4032px at scroll 900/2000/3500/4700) and the same open-door pattern.
- **Mascot simplified on purpose.** The original drives one animated Teddy between "stops" with a custom JS rig. The clone renders a static pose at each stop, with CSS idle animations (breathing, blinking, ear twitch) and a speech bubble on tap. Same look, far less code. A scroll-following Teddy can be added later if there's time.
- **`next/image` everywhere**, using each photo's focal point (`object-position`) and blur placeholder from the data.

**Challenges**
- **Next 16 `cacheComponents` rejected `new Date()`** for the footer year during prerender, and also rejected it in a client component. Fixed with a tiny `"use cache"` server component, which bakes the year in at build time.
- **A CSS file was silently dropped.** My keyframe de-duplication left a stray `}` in `meet.css`, so Tailwind discarded the whole file without a dev-server error. Found it by compiling each CSS file on its own with the Tailwind CLI. I now validate every stylesheet that way.
- **Testing a scroll-driven layout in a background browser tab.** `scroll-behavior: smooth` plus a hidden pane meant scroll positions never settled. Tests now use `behavior: 'instant'`. The hallway updates directly in the scroll handler (no `requestAnimationFrame`), so it never lags.
- **Mobile hero Teddy was hidden.** The original hides mascot stops below 768px unless they carry `data-lane`. Added a `lane` prop.

---

## Prompt 4 — "Yes, continue" (2026-11-25)

> Yes, continue

### Phase 3 (part 2) — Rest of the home page + page curtain
**What was built**
- `TwoWays` (signpost, showroom window, plane flying Korea → Dubai)
- `Journey` (steps + WhatsApp phone mock-up)
- `Passport` (open passport book with stamps, sunset skyline)
- `HappyFamilies` (brick facade at dusk, photo wall, street lamp)
- `FaqTeaser` (night sky Q&A)
- `WelcomeHome` (front door CTA)
- `components/layout/PageCurtain.tsx`: the quilt "curtain" that drops while Teddy runs across, on first load and on every page change.
- `components/ui/ScrollReveal.tsx`: a generic scroll-in reveal driven by `data-reveal` / `data-armed` / `data-revealed` attributes.

**Key decisions**
- **A section generator instead of hand-typing ~120KB of markup.** `gen_section.py` (scratchpad tool) takes a server-rendered section of the original and outputs a React component:
  - Teddy blocks become `<Teddy pose=… />`;
  - `<img>` becomes `next/image` with the local file, focal point and placeholder colour;
  - internal `<a>` becomes `<Link>`;
  - WhatsApp/phone links become `whatsappLink()` / `site.phoneHref`.

  I then hand-edited each output to add behaviour. A companion script ports each section's CSS **plus every `@keyframes` it references**, de-duplicates them and validates the file with the Tailwind CLI.
- **Journey interactivity rebuilt in React.** An `IntersectionObserver` with a thin band in the middle of the viewport (`rootMargin: -45% 0px -45% 0px`) decides the active step. When a new step is reached, a "typing…" indicator shows for 650ms, then that step's messages pop in. The showroom video has a working play/pause button.
- **Reveal attributes, not wrapper components.** `ScrollReveal` renders nothing. It sets `data-armed` on mount (so the content stays visible without JS) and `data-revealed` on scroll, which is exactly what the original's CSS keys off.
- **The curtain covers before navigating.** A capture-phase click listener intercepts internal links to *other pages*: cover (300ms), then `router.push()`, then lift once the new pathname renders. Query-only changes (e.g. `/puppies?breed=…` filters) and `#hash` links skip the curtain. It's server-rendered, so the intro covers the very first paint, like the original.

**Verification**
- **Desktop 1440px:** every home section's top offset and height matches the original within 1px (e.g. Journey 6133/1697, Passport 7830/922, Front door 10972/1021).
- **Mobile 375px:** all 8 section heights and the footer height are identical to the original (748, 3036, 1281, 1516, 1258, 1695, 954, 967, footer 1303).
- Side-by-side screenshots of each section match the original.

**Challenges**
- **Turbopack doesn't pick up newly added `@import`s in `globals.css`.** The sections rendered unstyled (Passport was 6795px tall instead of 922px). The standalone Tailwind build was correct, so the dev server needed a restart. Worth knowing for anyone working on the repo.
- **ESLint caught issues in the copied content:** unescaped apostrophes in copy, and a `setState` called synchronously inside an effect. Fixed with `&apos;` and timer-based state updates.
- **A first curtain version used `useSearchParams`,** which (with `cacheComponents`) forces a Suspense boundary, so the intro wouldn't be in the server HTML. Switched to tracking `pathname` only, and filters deliberately skip the curtain.

---

## Prompt 5 — "Yes, continue" (2026-11-25)

> Yes, continue

### Phase 3 (part 3) — Puppies listing + 42 puppy detail pages
**What was built**
- `app/puppies/page.tsx`: the "Teddy's sketchbook" hero, sticker-chip filters, a grid of hand-drawn puppy cards, and the "Already gone home" strip.
- `components/puppies/PuppyBrowser.tsx`: filters synced to the URL, the live count, and an empty state.
- `components/puppies/SketchCard.tsx` + `lib/sketch.ts`: each card's wobbly watercolour wash, masked photo, ink outline and doodles.
- `app/puppies/[slug]/page.tsx`: 42 statically generated pages (15 available + 27 gone home).
- `components/puppy/PuppyGallery.tsx`: carousel, thumbnails and a full-screen viewer.
- `components/puppy/EnquiryForm.tsx` + `lib/enquiry.ts` + `app/api/enquiry/route.ts`: the enquiry form, its validation and a server endpoint.
- `components/puppy/StoryRibbon.tsx`: a bookmark ribbon that fills as you scroll.
- Data for the 27 gone-home puppies, parsed from their detail pages, plus 72 more local media files (204 in total).

**Key decisions**
- **Filters reverse-engineered from behaviour, then verified.** I clicked through a fixed sequence of chips on the original and logged the URL, the count text and which chips were pressed after each click. I ran the identical script on the clone, and the two logs match exactly. Rules:
  - "Imported" (`?origin=`) and "Korean Teacup" (`?collection=`) toggle independently;
  - breed and boy/girl are single-choice toggles;
  - "Everywhere" clears everything;
  - "Clear filters" appears only when a filter is active;
  - `?origin=local` (linked from the home page) shows the "No puppies match just now" empty state.
- **Server-rendered cards, client-side filtering.** The cards are server components passed into the client `PuppyBrowser` as a map of slug → card, so the browser only decides which to show. The filter UI reads the URL, so it sits in `<Suspense>`, and the fallback is the same grid unfiltered: no layout jump while it hydrates.
- **Procedural "sketch" shapes instead of copying 20 sets of SVG paths.** The original generates a unique hand-drawn circle per card. `lib/sketch.ts` does the same: a seeded PRNG (mulberry32 keyed by the slug) plus a radius wobble made of summed sines, smoothed with Catmull-Rom curves. The doodle shapes (paw, heart, sparkle, swirl, dots, motion lines) are copied from the original's SVG. Being deterministic, it renders identically on server and client.
- **Detail pages are fully static.** `generateStaticParams` prerenders all 42 slugs. Next 16 wants `params` read inside `<Suspense>`, so the page streams its content into a placeholder, exactly the structure the original uses.
- **Enquiry form.** The original posts to a private server action, so I built:
  - one shared `validateEnquiry()`, used both in the browser (instant errors, focus moves to the first bad field, `aria-invalid` / `aria-describedby`) and in `/api/enquiry` (never trust the client);
  - a honeypot field for bots;
  - the original's "Message received!" envelope card on success.

  The API route only validates and logs, and the code comment says where to plug in email/CRM delivery.
- **Gallery.** Prev/next with wrap-around, thumbnails, a native `<dialog>` full-screen viewer with arrow keys, swipe on touch, and video playback.

**Verification**
- `/puppies` page height is identical to the original at 1440px (2970px) and 375px (4337px).
- The filter click log is identical to the original's.
- Detail pages compared side by side (available and gone-home variants), including prev/next targets and the pre-filled message.
- Gallery test: next → 2/11, prev ×2 → 11/11 (wraps), thumbnail 5 → 5/11, viewer + →→ → 7/11, close → page scroll unlocked.
- Form test: empty submit → 2 errors and focus on name; bad phone/email → 2 errors and focus on phone; valid → "Message received!". The API returns 422 with field errors for bad data.
- Curtain on a real navigation: `covering → covered → (route changes) → lifting → idle` in ~900ms, landing at the top of the new page.

**Challenges**
- **The original's detail pages and filter panel are streamed or client-only,** so they weren't in the downloaded HTML. I read the hidden `<div id="S:0">` stream block, and pulled the filter panel's live DOM from the browser.
- **Validation messages aren't in the original's client JS** (validation happens in a server action), so I wrote clear, friendly messages of my own.
- **Bugs caught by testing:** two quick "previous" clicks moved only one photo (stale state; fixed with functional `setState`), and page scroll stayed locked after closing the viewer (fixed by unlocking on close as well as on the dialog's `close` event). The page-turn animation also ran on first load; it now runs only after the reader changes photo.
- **Next 16 route types (`PageProps<"/puppies/[slug]">`) are generated,** so `next typegen` has to run before `tsc` for dynamic routes.
