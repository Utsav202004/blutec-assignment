# Phase 1 — Reference site analysis

Reference: https://puppy.instabizweb.com/ ("TeddyPups U.A.E.")
Observed: 2026-11-25. The reference itself is a Next.js + Tailwind v4 site, so the stack maps 1:1.

## Design tokens

### Fonts (all Google Fonts, variable)
- [ ] **Fraunces** (100–900) — display headings (`--font-display`)
- [ ] **Figtree** (300–900) — body / UI (`--font-sans`)
- [ ] **Shantell Sans** — handwritten accents, e.g. "every puppy is family", "where to, friend?" (`--font-hand`)

### Colour palette
| Token | Hex | Use |
|---|---|---|
| toffee | `#c2622b` | primary accent, active nav |
| toffee-deep | `#a24a1a` | primary buttons, focus/accent-color |
| toffee-ink | `#8e3f15` | button shadow / pressed |
| honey | `#f2be6b` | mobile menu bg, warm highlights |
| honey-soft | `#fbe3b4` | section backgrounds |
| cocoa | `#2a170e` | text, night sections, footer |
| cocoa-soft | `#5a3a28` | secondary text, evening wall |
| milk | `#fffdf8` | page background, light text |
| sky / sky-deep | `#bfddf5` / `#2f6e9e` | accents (plane, imported) |
| blush | `#f9cdbf` | cheeks / soft accents |
| WhatsApp green | ~`#3a7d55` | WhatsApp buttons |

### Spacing / layout
- [ ] Tailwind default 4px spacing scale; containers up to `7xl` (80rem)
- [ ] Fluid side gutter: `--gutter: clamp(1rem, 4vw, 3.5rem)`
- [ ] Header height 4.75rem desktop / 4rem mobile; mobile bottom bar 4rem + safe-area
- [ ] Radii: xl / 2xl / 3xl, pill buttons with a solid "drop" shadow underneath
- [ ] Custom easings: `pounce cubic-bezier(.34,1.56,.64,1)`, `silk (.22,1,.36,1)`, `snap (.7,0,.2,1)`

### Breakpoints used
- [ ] < 640 (mobile), 640–767, 768 (tablet), 1024 (desktop nav appears), 1280, 1680
- [ ] `prefers-reduced-motion` respected in ~13 places, hover effects gated on `(hover:hover) and (pointer:fine)`

## Global components
- [ ] **Page curtain loader** — honey diamond-pattern screen with a walking puppy + "every puppy is family", plays on every route change
- [ ] **Header** (fixed): round logo + "TeddyPups", nav (Home, Puppies, Happy families, How it works, FAQ, Visit & contact) with active underline squiggle, green "WhatsApp us" pill; scalloped bottom edge
- [ ] **Mobile header** (<1024): logo + "🐾 Menu" pill button
- [ ] **Mobile full-screen menu**: honey background, "where to, friend?", large Fraunces links (staggered in), Close button, WhatsApp CTA + phone; animated in/out
- [ ] **Mobile sticky bottom bar**: "WhatsApp us" + "Call"
- [ ] **Footer** (night scene, moon + stars): "Home, at last." + blurb, puppy-in-basket illustration, Explore links, Say hello (WhatsApp, email, address, Instagram/TikTok/Facebook pills), © line + "every puppy is family"
- [ ] **Paw-print trail** following scroll + a mascot puppy that walks along the page
- [ ] Buttons: primary toffee pill, outline pill, WhatsApp green pill, all with press-down shadow

## Pages & sections

### 1. Home `/` — a scroll story that goes from morning to night
- [ ] **Hero** — tagline, H1 "Premium teacup puppies in Dubai", copy, 2 CTAs; row of arched photo windows over a scalloped wall, centre puppy peeking ("peekaboo!")
- [ ] **Meet the pups** — desktop: pinned section with horizontal scroll of 15 arched doors (name, details, "Available" tag), puppy walks along the floor; doors open to reveal photo. Mobile: 2-column grid with open doors. "See all available puppies" / "Meet them all"
- [ ] **Two ways to meet your puppy** — signpost ("Puppies in Dubai" / "Imported for you"), shop-front with photo (left), plane flying Korea→Dubai on dotted path (right), 2 CTAs
- [ ] **Your puppy journey** — 3 numbered steps that highlight on scroll, sticky phone mock-up showing a WhatsApp chat that fills with messages/photos as you scroll; "How it works" CTA
- [ ] **Why families trust TeddyPups** — open "puppy passport" book with 4 stamp-style features; sunset skyline below
- [ ] **Happy families** (dusk) — heading + quote card, brick wall with 8 framed photos/captions, street lamp, door; "See every happy family"
- [ ] **Questions, answered** (night) — 3 FAQ items, "Read all questions"
- [ ] **Ready to meet your new best friend?** — house front door ("welcome home" mat), lamp, plants; WhatsApp + Visit & contact CTAs

### 2. Puppies `/puppies`
- [ ] Hero "Available puppies" ("from Teddy's sketchbook"), self-portrait sketch circle
- [ ] **Filter panel**: where (Everywhere / Imported / Korean Teacup), breed (Maltipoo, Pomeranian, Poodle, Cavapoo, Shih Tzu), boy or girl — synced to URL query (`?breed=`, `?origin=`)
- [ ] Live count "15 puppies looking for a home"
- [ ] Grid of circular sketch-style puppy cards (photo, Available tag, "▶ video" badge, name, breed · sex · age), 4 cols desktop
- [ ] "Already gone home" strip (5 cards) → `/gone-home`

### 3. Puppy detail `/puppies/[slug]` (15 puppies)
- [ ] Breadcrumb, numbered handwritten section labels (1 hello, it's me … 4 dear TeddyPups…)
- [ ] **Media carousel**: photos + video, prev/next arrows, "1 / 2" counter, thumbnails
- [ ] Info card: Available badge, name, breed, spec grid (Breed, Boy or girl, Age, Where), "Ask about X on WhatsApp", "Send an enquiry" (scrolls to form)
- [ ] "What comes with X" checklist
- [ ] "The way home" 4-step timeline (local vs imported variant)
- [ ] **Enquiry form**: name*, phone*, email, area, message, honeypot "Website" field; validation
- [ ] Previous / next pup navigation

### 4. How it works `/how-it-works`
- [ ] Hero + 4 anchor chips (Two ways home, Promise, Delivery & collection `#delivery`, Why choose us)
- [ ] **Two ways home tabs**: "In Dubai" / "Imported" toggle switching content + 4 steps (showroom illustration)
- [ ] Puppy promise (passport style, 3 items)
- [ ] Delivery & collection (4 cards incl. Korea → Dubai route)
- [ ] Why choose us (feature list)

### 5. Happy families `/happy-families`
- [ ] Hero, "64 moments and counting", testimonial card
- [ ] Wall/grid of photos with captions (polaroids) — likely lightbox / staggered reveal

### 6. Gone home `/gone-home`
- [ ] Hero + "See available puppies", "tickets home" booth illustration, grid of adopted puppies

### 7. FAQ `/faq`
- [ ] Cork-board hero, **search box** ("sniff out a question") filtering notes live, "9 notes on the board" count
- [ ] Accordion of 9 pinned-note questions
- [ ] "Ask your own question" CTA

### 8. Contact `/contact`
- [ ] Hero, WhatsApp button, call/email
- [ ] **Letter-style form** ("Dear TeddyPups, my name is ___ …") with inline inputs, puppy `<select>` (15 options), message, honeypot, "Post my letter" → envelope/stamp "sent" animation
- [ ] "Visit us in Downtown Dubai" card + "Open in Google Maps"

## Interactions & animations checklist
- [ ] Route-change curtain loader
- [ ] Mobile menu open/close with staggered links, body scroll lock, Esc to close
- [ ] Scroll-pinned horizontal door gallery (desktop) with walking puppy
- [ ] Scroll-driven chat mock-up + step highlighting
- [ ] Plane bob / dotted flight path, sunset → night colour shift, twinkling stars
- [ ] Puppy idle animations (blink, ear twitch, tail wag, peek)
- [ ] Hover: lift / tilt on cards and doors, button press-down
- [ ] Media carousel (arrows, thumbnails, video)
- [ ] Filters with URL sync, FAQ live search + accordion
- [ ] Form validation (required, phone format) with success state animation
- [ ] Smooth anchor scrolling (`#delivery`, "Send an enquiry")
- [ ] Reduced-motion fallbacks

## Assets
- ~129 photos + 8 videos on the homepage alone (served from `/media/...`); download into `public/assets/`.
- Illustrations (puppy mascot, doors, signpost, plane, passport, house) are custom SVG/CSS and will be rebuilt as React SVG components.

## Scope notes / risks
- This is an animation-heavy site with 8 route types and ~25 pages. Highest-effort pieces: home scroll story (pinned door gallery, chat phone), mascot SVG animations, page curtain.
- WhatsApp links point to a placeholder number; forms have no real backend, so we'll do client-side validation plus a mock success state (or a Next.js route handler that logs the submission).
