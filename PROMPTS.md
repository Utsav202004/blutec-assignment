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

---

## Prompt 6 — "Yes, continue" (2026-11-25)

> Yes, continue

### Phase 3 (part 4) — How it works, Happy families, Gone home, FAQ, Contact
**What was built**
- `app/{how-it-works,happy-families,gone-home,faq,contact}/page.tsx`: thin route files with the original's titles and meta descriptions. They render page components in `components/pages/`.
- `components/how/TwoWaysHome.tsx`: the "In Dubai / Imported" tab switch. It follows the WAI-ARIA tabs pattern (`role="tab"`, `aria-selected`, roving `tabIndex`, arrow-key navigation, hidden panels), and its sliding thumb is driven by a `--at` CSS variable.
- `components/families/PhotoWall.tsx` + `components/ui/PhotoViewer.tsx`: 64 taped polaroids built from `family-photos.json`, plus a reusable full-screen viewer (arrow keys, swipe, Esc, captions).
- `components/pages/GoneHomePage.tsx`: 27 "tickets home" built from the gone-home puppy data.
- `components/faq/NoticeBoard.tsx` + `lib/faqs.ts`: the cork-board FAQ with live search.
- `components/contact/LetterForm.tsx`: the "Dear TeddyPups, my name is ___" letter form, with a sealing → posting → sent animation.

**Key decisions**
- **Generated first, then data-driven.** The generator from earlier phases now also converts bare Teddy illustrations, telling the pose apart by the head's transform. Repeated content (64 photos, 27 tickets, 9 FAQs) was then replaced with `.map()` over data files. That took Happy families from ~3,000 generated lines to under 100, and Gone home from ~1,600 to ~120. The original's cycling tilts, tape colours and reveal delays are kept as small arrays.
- **Behaviour matched by reading the original's client bundle.** The FAQ board and the letter form are client-rendered on the original, so I read its JS to get the exact rules, then wrote my own components:
  - **FAQ:** search filters by question + answer, matches are wrapped in `<mark>`, notes whose *answer* matches unfold automatically, the count switches between "9 notes on the board" and "N notes found", there's an empty-state note, and it's a single-open accordion otherwise. Collapsed answers are `inert`.
  - **Letter form:** phases writing → sealing (750ms) → posting (1s) → sent. The layout height is held steady during the animation, focus moves to the confirmation, and errors are listed at the top of the letter with the first bad blank focused. It reuses `validateEnquiry()` and `/api/enquiry`.
- **Removed things that shouldn't be cloned:**
  - the original's Cloudflare email-obfuscation link (`/cdn-cgi/l/email-protection…`);
  - its third-party WhatsApp number;
  - the agency URL it used as the "Open in Google Maps" link.

  All of these now come from `lib/site.ts`.
- **A systematic CSS audit instead of eyeballing.** A script collects every class used in the components and checks which ones the original styles but my compiled CSS doesn't. It found exactly one: `measure` (max-width 62ch), which explained a 30px difference on How it works.

**Verification**
- Page heights are identical to the original on all five pages, at both 1440px and 375px:

  | Page | 1440px | 375px |
  |---|---|---|
  | How it works | 3792 | 6675 |
  | Happy families | 8169 | 31032 |
  | Gone home | 2369 | 5949 |
  | FAQ | 1681 | 1785 |
  | Contact | 1255 | 2278 |

- **Tabs:** clicking switches panels and the thumb; ArrowLeft moves both selection and focus.
- **FAQ:** a second note closes the first; "korea" → "2 notes found", 2 highlights, 2 unfolded; "zzzz" → empty state; clearing restores "9 notes on the board".
- **Contact:** an empty submit lists 2 errors and focuses the name blank; a valid submit goes sealing → posting (~800ms) → sent (~1.8s), with focus on the confirmation.
- **Photo wall:** photo 46 opens with its caption, → moves to 47/64, and Close/Esc both unlock page scroll.

**Challenges**
- **Gone home was 104px shorter.** The ticket's route label isn't always "TeddyPups": showroom puppies say "Dubai showroom", which wraps to two lines. Found it by comparing ticket heights one by one against the original.
- **The viewer left page scroll locked after closing.** The unlock relied on the dialog's asynchronous `close` event. Esc is now handled through the synchronous `cancel` event, and scroll is unlocked whenever the viewer's state is closed. The same fix went into the puppy gallery.

---

## Prompt 7 — "phase 5" (2026-11-25)

> phase 5

### Phase 5 — Testing (responsiveness, Lighthouse, console)
All tests ran against a **production build** (`next build && next start`), not the dev server.

**Responsiveness at 375 / 768 / 1024 / 1440px**
- For every main route I measured the `<main>` height at each width, on the clone and on the original, and checked that the page never scrolls sideways (`scrollWidth ≤ viewport`). There is no horizontal overflow anywhere.
- **Two real bugs found by the comparison:**
  1. **At 768px every inner page was exactly 12px shorter.** 12px = 4.75rem − 4rem, the header height. I had applied the phone header height below 1024px, but the original switches at **767px**. Fixed in `globals.css`.
  2. **The home page was 6px short at 1024px.** The original's script rounds each door to a whole pixel width (`--door-w: 154px`, where the CSS clamp gives 153.59px) and rounds the pinned scroll range. With both rounded in `MeetThePups.tsx`, the hallway length and section height now match.
- **After the fixes,** all 7 routes are identical to the original at 768 and 1024px, as they already were at 375 and 1440px.

**Lighthouse** (v13, scripted with a warm-up run so on-demand image optimisation isn't measured)

| Page | Mobile perf | Desktop perf | Accessibility | Best practices | SEO |
|---|---|---|---|---|---|
| Home | 100 | 100 | 100 | 100 | 100 |
| Puppies | 98 | 100 | 100 | 100 | 100 |
| Puppy detail (available / gone home) | 85 (simulated) · 98 (real throttling) | 99 | 100 | 100 | 100 |
| How it works / Happy families / Gone home / FAQ / Contact | 100 | 100 | 100 | 100 | 100 |

**Fixes made from the audits**
- **Layout shift on puppy pages (CLS 0.17 → 0).** The content was streaming into a Suspense placeholder after first paint and pushing the footer down. Every slug is prerendered, so the page now uses Next 16's documented `export const instant = false` and renders as plain static HTML.
- **The LCP image wasn't high priority.** Next 16 deprecated `priority`, so I switched to `loading="eager"` + `fetchPriority="high"`, per the bundled Image docs.
- **Two full-size images (~240 KB each) bypassed the optimiser:** a video poster and an SVG `<image>`. Both now point at resized `/_next/image` variants.
- **Stopped preloading the handwriting font.** Shantell Sans with its variable axes is 171 KB and only used for small accents, yet it was preloaded ahead of the photos and heading font. `preload: false` keeps `display: swap` while removing it from the critical path.
- **Puppy-page LCP, investigated properly:** the real LCP is 93 ms locally, and the photo is preloaded at high priority and finishes almost immediately. The 4.4 s figure comes from Lighthouse's *simulated* slow-4G model. Re-running with real (DevTools) throttling gives performance 98 and LCP 1.8 s.
- **An early run showed 3.1 s of blocking time on home.** It was a cold-start outlier (first image optimisation and a cold Chrome). Warm runs show 10–30 ms, so the script now always warms each page up first.

**Console errors**
- Lighthouse's `errors-in-console` audit passes with 0 errors on all 14 runs (8 page types, mobile + desktop).
- A fresh browser load of the home page has an empty console.
- I clicked through filters, gallery, viewer, tabs, FAQ and the contact form without errors.

**Challenges**
- **Stale production CSS.** After changing `globals.css`, a normal `next build` still shipped the old media query: Turbopack's build cache had kept the old CSS. Deleting `.next` fixed it, so every measured build after that was a clean build.
- **The browser cache made old builds look current.** The browser pane kept serving cached HTML from earlier builds, which produced misleading "preloaded but not used" warnings for files that no longer existed. A cache-busting query string gave a clean read.
- **Sharing the browser with the user.** You were using the preview pane during testing, so I moved my checks to background tabs and finished the last ones headlessly with Lighthouse.

---

## Prompt 8 — "Start Phase 6" (2026-11-25)

> Start Phase 6

### Phase 6 — README, GitHub, Vercel
**What was done**
- **Rewrote `README.md`:** what the project is, the tech stack, a pages table, features (responsive, animations, accessibility, performance), the Lighthouse results, the annotated project structure, how to run it locally, two deployment options (GitHub import or Vercel CLI), and notes on placeholders, simplifications and content ownership.
- **Pre-flight checks before going public:**
  - a clean production build (55 pages) and lint;
  - no `.env`, keys or local settings tracked (`.claude/settings.local.json` is git-ignored);
  - no file over 20 MB (the largest video is 6.5 MB, well under GitHub's 100 MB limit);
  - no local machine paths in tracked files.
- **Created the public GitHub repo** [Utsav202004/blutec-assignment](https://github.com/Utsav202004/blutec-assignment) with the GitHub CLI and pushed `main` (7 commits).

**Key decisions**
- **Asked before publishing.** A public repo is outward-facing and the commits carry your name and email, so I confirmed the repo name and visibility first.
- **Vercel login stays with you.** The deploy needs your Vercel account, so you run `vercel login` yourself and I run the deploy afterwards. (I never type credentials.)
- **Kept the 78 MB of media in git.** It's under GitHub's limits, Vercel serves `public/` as static files, and the brief asked for local copies rather than hot-linked images, so Git LFS or an external CDN would only add complexity.

---

## Prompt 9 — "logged in" (2026-11-25)

> logged in

### Phase 6 (continued) — Vercel deployment
**What was done**
- `vercel link --project blutec-assignment` created and linked the Vercel project. The CLI wrote a short-lived OIDC token to `.env.local`, which is git-ignored by the existing `.env*` rule.
- `vercel deploy --prod` built the site on Vercel and put it live at **https://blutec-assignment.vercel.app**.
- Added `NEXT_PUBLIC_SITE_URL=https://blutec-assignment.vercel.app` as a production environment variable and redeployed, so Open Graph image URLs are absolute (checked: `og:image` = `https://blutec-assignment.vercel.app/assets/media/…`).

**Verification on the live site**
- All main routes return 200 (home, puppies, a puppy page, how it works, happy families, gone home, FAQ, contact), local media is served from `/assets/media`, and an unknown URL returns 404.
- **Enquiry API:** invalid data → `422` with field errors; honeypot filled → silently accepted. The server-side validation works in production.
- **Lighthouse (mobile) on the live URL:** Home 100, Puppies 100, Puppy detail 96, FAQ 100, with Accessibility, Best practices and SEO at 100 on every page. Vercel's CDN (HTTP/2, Brotli, edge-cached static HTML) improved on the local numbers (puppy page 85 → 96).
- **Browser check at 1440px:** home page height 11993px (same as the original), the door hallway scrolls and opens, and the console is clean.

**Notes**
- The deploy was made from the CLI, so pushing to GitHub does not redeploy yet. Running `vercel git connect` (or connecting the repo in the Vercel dashboard) turns on automatic deploys for every push, plus preview URLs for pull requests.

