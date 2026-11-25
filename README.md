# TeddyPups U.A.E. — website clone

A pixel-accurate clone of [puppy.instabizweb.com](https://puppy.instabizweb.com/), built as a technical assignment with **Next.js (App Router)** and **Tailwind CSS**.

The original is an illustrated, animation-heavy puppy shop: the home page tells a "morning to night" story as you scroll, with a mascot (Teddy), a sideways-scrolling hallway of doors, a WhatsApp phone mock-up, a passport book and more. This clone reproduces its design, layout, responsiveness and behaviour across all 55 pages.

**Live site:** _add your Vercel URL here after deploying_

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
- **Animations:** a page-change "curtain", a pinned horizontal scroll section, scroll-in reveals, page-turn gallery transitions, idle mascot animations. All of them respect `prefers-reduced-motion`.
- **Accessibility:** a skip link, a native `<dialog>` for menus and viewers (focus trap, Esc), WAI-ARIA tabs, `aria-expanded` accordions with `inert` collapsed panels, labelled form fields with `aria-invalid` / `aria-describedby`, and focus moved to errors and confirmations.
- **Performance:** every page is statically prerendered, images are optimised, the LCP image is prioritised, and non-critical fonts aren't preloaded.

### Lighthouse (production build)

| Page | Mobile perf | Desktop perf | A11y | Best practices | SEO |
|---|---|---|---|---|---|
| Home and content pages | 100 | 100 | 100 | 100 | 100 |
| Puppies listing | 98 | 100 | 100 | 100 | 100 |
| Puppy detail | 85 simulated / 98 real throttling | 99 | 100 | 100 | 100 |

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
  illustrations/        Teddy the mascot (4 poses), stars
  ui/                   PawIcon, ScrollReveal, PhotoViewer
lib/
  site.ts               Brand name, contact details, WhatsApp link helper, navigation
  puppies.ts            Typed puppy data + helpers (filters, blurbs, prev/next)
  sketch.ts             Seeded generator for the hand-drawn card shapes
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
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
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
- **Simplified on purpose:** the original moves one animated Teddy between sections with a custom JS rig. The clone renders a static pose in each section, with idle animations and a speech bubble on tap.
