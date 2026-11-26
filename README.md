# TeddyPups U.A.E. — website clone

A pixel-accurate clone of [puppy.instabizweb.com](https://puppy.instabizweb.com/), built as a technical assignment with **Next.js (App Router)** and **Tailwind CSS**.

The original is an illustrated, animation-heavy puppy shop: the home page tells a "morning to night" story as you scroll, with a mascot (Teddy), a sideways-scrolling hallway of doors, a WhatsApp phone mock-up, a passport book and more. This clone reproduces its design, layout, responsiveness and behaviour across all 55 pages.

**Live site:** https://blutec.utsavgoyal.tech (also at https://blutec-assignment.vercel.app)  
**Repository:** https://github.com/Utsav202004/blutec-assignment

> The full build log (every prompt, decision and challenge) is in [PROMPTS.md](PROMPTS.md). The initial site audit is in [ANALYSIS.md](ANALYSIS.md).

---

## Tech stack

| | |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, React Server Components, Turbopack, `cacheComponents`) |
| UI | React 19, TypeScript 5 |
| Styling | Tailwind CSS v4 (CSS-first `@theme` tokens) plus per-area component CSS in `app/styles/` |
| Fonts | Fraunces, Figtree and Shantell Sans via `next/font/google` (self-hosted at build time) |
| Images | `next/image` (AVIF/WebP, responsive `srcset`, blur placeholders, focal points) |
| Forms | Client-side validation + a Next.js Route Handler (`/api/enquiry`) that re-validates on the server |
| Tooling | ESLint (`eslint-config-next`), Prettier, Lighthouse |
| Hosting | Vercel |

There are no UI or animation libraries. Interactions use native browser features (`<dialog>`, `IntersectionObserver`, CSS scroll-driven animations, `clip-path`) plus small React components.

## Pages

| Route | What's on it |
|---|---|
| `/` | Hero with photo line-up, pinned door hallway, two ways to meet, scroll-driven WhatsApp journey, puppy passport, family photo wall, FAQ teaser, front-door CTA |
| `/puppies` | Sketchbook listing with sticker-chip filters synced to the URL (`?breed=`, `?gender=`, `?origin=`, `?collection=`) |
| `/puppies/[slug]` | 42 statically generated puppy pages: gallery and full-screen viewer, specs, steps, enquiry form, previous/next |
| `/how-it-works` | Accessible "In Dubai / Imported" tabs, promise, delivery, why choose us |
| `/happy-families` | 64 polaroids with a full-screen viewer |
| `/gone-home` | "Tickets home" for puppies that have found families |
| `/faq` | Cork-board FAQ with live search, highlighting and an accordion |
| `/contact` | Letter-style form ("Dear TeddyPups, my name is ___") with a posting animation |

## Features

- **Responsive** at every breakpoint. Page heights match the original at 375 / 768 / 1024 / 1440px. Phones get a full-screen menu and a sticky WhatsApp/Call bar.
- **Roaming Teddy:** on the home page one Teddy walks from section to section as you scroll. He takes each section's pose, hops out from behind the quilt, walks on the spot in the pinned hallway, leaves fading paw prints, asks "coming?" if you stop mid-way, opens the front door when he arrives, and responds to taps. On phones he peeks up from alternating screen edges. He also has gestures: blinking and tail wags, head tilts under the night sky, yawns in his basket, happy eyes when you hover, glancing (eyes only) towards your pointer or focused links, "ooh, photos!" as the WhatsApp chat fills in, and random tap tricks (jump, woof, hearts, sneeze). The static Teddys on the other pages do the same tap tricks.
- **Animations:** a page-change "curtain", a pinned horizontal scroll section, a rotating hero photo line-up, scroll-in reveals, page-turn gallery transitions, idle mascot animations. All of them respect `prefers-reduced-motion`.
- **Accessibility:** a skip link, a native `<dialog>` for menus and viewers (focus trap, Esc), WAI-ARIA tabs, `aria-expanded` accordions with `inert` collapsed panels, labelled form fields with `aria-invalid` / `aria-describedby`, and focus moved to errors and confirmations.
- **Performance:** every page is statically prerendered, images are optimised, the LCP image is prioritised, and non-critical fonts aren't preloaded.

### Lighthouse (production build)

| Page | Mobile perf | Desktop perf | A11y | Best practices | SEO |
|---|---|---|---|---|---|
| Home and content pages | 100 | 100 | 100 | 100 | 100 |
| Puppies listing | 100 live on Vercel (98 locally) | 100 | 100 | 100 | 100 |
| Puppy detail | 96 live on Vercel (85 simulated / 98 real throttling locally) | 99 | 100 | 100 | 100 |

## Project structure

```
app/
  layout.tsx            Root layout: fonts, header, footer, page curtain, WhatsApp bar
  page.tsx              Home page (composes components/home/*)
  globals.css           Tailwind import, design tokens (@theme), utilities, buttons
  styles/*.css          Component CSS, one file per area (header, hero, meet, journey…)
  puppies/              Listing page + [slug] detail pages (generateStaticParams)
  how-it-works/ happy-families/ gone-home/ faq/ contact/
  api/enquiry/route.ts  POST endpoint for enquiries (validates, logs)
components/
  layout/               SiteHeader, MobileMenu, SiteFooter, WhatsAppBar, PageCurtain
  home/                 One component per home-page section
  pages/                Page bodies for the content pages
  puppies/ puppy/       Listing filters + cards, detail gallery + enquiry form
  how/ faq/ contact/ families/   Interactive pieces for those pages
  illustrations/        Teddy the mascot (4 poses + a walking rig), stars
  teddy/                RoamingTeddy: the scroll-driven Teddy that visits each section
  ui/                   PawIcon, ScrollReveal, PhotoViewer
lib/
  site.ts               Brand name, contact details, WhatsApp link helper, navigation
  puppies.ts            Typed puppy data + helpers (filters, blurbs, prev/next)
  sketch.ts             Seeded generator for the hand-drawn card shapes
  teddy-journey.ts      Geometry for the roaming Teddy (stops, scroll holds, travel path)
  teddy-cue.ts          Lets page sections cue Teddy (e.g. the chat's "ooh, photos!")
  enquiry.ts            Shared form validation (browser + server)
  faqs.ts               FAQ content
  data/*.json           Puppy and family-photo data
public/assets/
  media/                All photos and videos, stored locally (no hot-linking)
  brand/ cursor/        Logo and paw cursor
```

## Running locally

Requirements: **Node.js 20.9+** (developed on Node 26) and npm.

```bash
git clone https://github.com/Utsav202004/blutec-assignment.git
cd blutec-assignment
npm install
npm run dev
```

Open http://localhost:3000.

Other scripts:

```bash
npm run build   # production build (prerenders all 55 pages)
npm run start   # serve the production build on :3000
npm run lint    # ESLint
```

**Configuration:** contact details, the WhatsApp number and social links live in [`lib/site.ts`](lib/site.ts). Set `NEXT_PUBLIC_SITE_URL` to your deployed URL so Open Graph image links are absolute (optional; defaults to `http://localhost:3000`).

> Tip: if you add a new `@import` to `app/globals.css` while `npm run dev` is running, restart the dev server. Turbopack doesn't always pick up newly imported files. If a production build ever shows stale CSS, delete `.next` and rebuild.

## Deployment (Vercel)

This project is deployed on Vercel with the GitHub repo connected: every push to `main` redeploys production automatically, and pull requests get preview URLs. The custom domain `blutec.utsavgoyal.tech` points to it via a CNAME record.

**Option A: from GitHub (recommended)**

1. Push this repository to GitHub.
2. In [Vercel](https://vercel.com/new), click **Add New → Project** and import the repository.
3. Vercel detects Next.js automatically. Keep the defaults (build `next build`, output `.next`).
4. Optional: under **Environment Variables**, add `NEXT_PUBLIC_SITE_URL` = `https://<your-project>.vercel.app`.
5. Click **Deploy**. Every push to `main` then redeploys automatically, and pull requests get preview URLs.

**Option B: Vercel CLI**

```bash
npx vercel login
npx vercel          # preview deployment
npx vercel --prod   # production deployment
```

## Notes

- **Content and design** (copy, photos, illustrations, layout) belong to the original site and were reproduced for this assignment only. The data and media were exported from the original's public pages and stored locally in `public/assets/media`.
- **Contact details are placeholders** (`+971 50 000 0000`, `hello@example.com`). The original's WhatsApp link points to a third party, so it wasn't copied.
- **Enquiry forms** validate in the browser and on the server, but `/api/enquiry` only logs a submission. Connect an email service or CRM in [`app/api/enquiry/route.ts`](app/api/enquiry/route.ts) to deliver them.
- **Teddy's rig:** the original animates Teddy with a fully posable skeleton. The clone uses four drawn poses plus a walk cycle, and animates the named parts of each drawing (head, eyes, mouth, ears, tail) with CSS for his gestures. The result looks and behaves the same.
