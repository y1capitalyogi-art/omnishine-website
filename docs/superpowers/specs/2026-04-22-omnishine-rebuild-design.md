# OmniShine.co.uk — Full Rebuild Design

**Date:** 2026-04-22
**Owner:** Sangita Chavda (founder)
**Status:** Approved design — ready for implementation plan

## 1. Goal

Rebuild `omnishine.co.uk` from scratch as a compliant, SEO/AEO/CRO-optimised static site that is honest about what the business currently is (newly founded 2026, sole operator, no insurance or Companies House registration confirmed yet) while positioning strongly for local search intent in Oldham and surrounding areas.

## 2. Non-goals

- No blog / editorial content in v1 (add later if SEO budget allows).
- No online booking or payments on the site (contact form only, per owner).
- No e-commerce, accounts, or customer portal.
- No AI chatbot.
- No multi-language.

## 3. Ground truth (facts available as of build date)

| Field | Value |
|---|---|
| Business name | Omni Shine Cleaning |
| Domain | omnishine.co.uk |
| Founder | Sangita Chavda |
| Founded | 2026 |
| Legal structure | Not yet decided (treat as sole trader, no Companies House number) |
| Registered address | None (service-area business) |
| Service area | Oldham + Shaw, Royton, Chadderton, Failsworth, Lees, Uppermill, Saddleworth, Springhead, Greenfield, Grotton, Moorside, Rochdale, Delph |
| Phone | None yet — contact form only |
| Email (public) | info@omnishine.co.uk |
| Email (owner) | sangitachavda11@gmail.com |
| ICO registration | Not confirmed — site will not claim it |
| Public liability insurance | Not confirmed — site will not claim it |
| VAT | Not registered |
| Payments accepted | Bank transfer, cash, card, Stripe link |
| Hours | Mon–Fri 17:00–21:00; Sat–Sun 08:00–21:00 |
| Google Business Profile | Exists (cid `0x8b0c17c468c5a93c`) |
| Social profiles | None confirmed |
| Reviews | One — Electiva Marketing Limited (copy to be drafted, flagged as drafted reconstruction for owner approval before publish) |

**Claims to STRIP from current site** (can't substantiate):
- "Fully Insured"
- "Registered in England"
- `aggregateRating 5.0 / 15 reviews` schema
- `sameAs: https://x.com/`

## 4. Tech stack

- **Framework:** Astro 5 (pure SSG, no hydration cost on static pages)
- **Styling:** Tailwind CSS v4 (JIT, no runtime)
- **Icons:** Lucide (inline SVG)
- **Fonts:** Inter (body) + Fraunces (display), self-hosted woff2, `font-display: swap`
- **Image optimisation:** Astro's `<Image>` (generates AVIF + WebP, lazy-loaded)
- **Hosting:** Cloudflare Pages (free tier, global CDN, free TLS, HTTP/3)
- **Form handler:** Cloudflare Pages Function → Resend API
- **Anti-spam:** Cloudflare Turnstile (invisible challenge)
- **Analytics:** Cloudflare Web Analytics (cookieless, privacy-friendly)
- **DNS:** Cloudflare (owner to transfer nameservers or use existing if already on CF)
- **CI:** GitHub repo + Cloudflare Pages Git integration (push to main → auto deploy)

## 5. Information architecture

```
/                                       Home
/services/domestic-cleaning-oldham/     Domestic
/services/commercial-cleaning-oldham/   Commercial
/services/deep-cleaning-oldham/         Deep
/services/end-of-tenancy-cleaning-oldham/   End of tenancy
/services/after-builders-cleaning-oldham/   After builders (new, high-intent)
/areas/                                 Area hub
/areas/shaw/                            Area page
/areas/royton/
/areas/chadderton/
/areas/saddleworth/
/areas/rochdale/
/pricing/                               Transparent price guide
/about/                                 Founder story
/faq/                                   AEO-optimised Q&A
/contact/                               Contact form
/privacy/
/terms/
/complaints/
/cookies/                               (minimal — we're cookieless)
/sitemap.xml                            Auto-generated
/robots.txt
/llms.txt                               AI crawler directives
```

Total: 21 pages.

## 6. Design system

### Palette (preserved + refined)
- `--navy-900: #1e3a8a` (primary, brand)
- `--navy-700: #1d4ed8`
- `--gold-400: #fbbf24` (accent, CTAs)
- `--gold-500: #f59e0b` (hover)
- `--ink: #0f172a` (body text)
- `--muted: #64748b` (secondary text)
- `--bg: #ffffff`
- `--bg-soft: #f8fafc`
- `--success: #059669`

### Typography
- Display: `Fraunces`, serif, 600–700 weight, for h1/h2
- Body: `Inter`, sans-serif, 400/500/600
- Scale: 14/16/18/20/24/30/36/48/60px (Tailwind default extended)
- Line-height: 1.6 body, 1.15 display
- Max measure: 65ch for prose

### Components (shared)
- `<Header>` — logo left, nav right, sticky, becomes solid on scroll
- `<Hero>` — full-bleed gradient, H1 + sub + single primary CTA + 4 trust chips
- `<TrustStrip>` — "Family-run · Oldham-based · Eco-friendly · Weekend availability"
- `<ServiceCard>` — icon + title + 1-line + "Learn more" link
- `<AreaCard>` — suburb name + "Cleaners in {area}" link
- `<ReviewCard>` — quote + name + company + date
- `<FaqItem>` — `<details>` for zero-JS accessibility + schema
- `<QuoteForm>` — name / email / postcode / service / message + Turnstile + consent checkbox
- `<Footer>` — 4-column grid: services / areas / company / legal + honest micro-copy
- `<StickyCtaMobile>` — fixed bottom "Get a free quote" on mobile only

### Logo
Custom SVG wordmark "Omni Shine" with small sparkle glyph. Used for:
- `favicon.svg` (inline data URI in head for instant render)
- `favicon-32.png`, `favicon-192.png`, `apple-touch-icon.png`
- `og-default.png` (1200×630, text + gradient)

## 7. Per-page content strategy (SEO/AEO)

Each page has:
- Unique `<title>`, 50–60 chars, format `{Service} in {City} | Omni Shine Cleaning`
- Unique meta description 150–160 chars, first-person, includes CTA
- One H1 with primary keyword
- H2s structured as answerable questions (AEO)
- Breadcrumb schema
- Per-page JSON-LD (`Service`, `FAQPage`, or `LocalBusiness`)
- 600–900 words of genuinely useful copy (no fluff; service specifics, pricing ranges, what's included, what's not)
- Internal links to 2–3 related pages
- Final section: inline quote form or CTA to `/contact/`

### Homepage skeleton
1. Hero: "Professional Cleaning Services in Oldham" + sub + primary CTA
2. Trust strip
3. Services grid (5 cards)
4. Areas we cover (grid of all suburbs, linking to area hubs)
5. Why choose us (4 value props — truthful)
6. Pricing teaser → link to `/pricing/`
7. Reviews (currently 1 — Electiva)
8. FAQ (top 4 questions, links to full `/faq/`)
9. Quote form
10. Footer

### FAQ content (AEO-focused)
Direct-answer format — first sentence is the answer. Candidates:
- How much does end-of-tenancy cleaning cost in Oldham? (from £180)
- How much does domestic cleaning cost per hour in Oldham? (£18/hr)
- Are you insured? (**Truthful answer**: we are a new business and will confirm our insurance status on request before any booking — no false claim.)
- Do you bring your own cleaning products? (Yes — eco-friendly by default, fragrance-free on request)
- What areas do you cover? (list)
- Do you clean on weekends? (Yes — Sat/Sun 8am–9pm)
- How do I get a quote? (fill form, reply within 2 working hours during opening hours)
- Are you DBS-checked? (Truthful answer based on actual state at launch)

## 8. SEO technical

- One canonical URL per page
- No trailing-slash / trailing-slash mixed — all canonical paths end with `/`
- All pages `<meta robots="index, follow">` except privacy/terms/complaints (still indexable — footer pages are fine to index)
- `hreflang="en-gb"` on `<html lang="en-GB">`
- `og:locale = en_GB`, `og:image` = per-page where meaningful, else default
- `twitter:card = summary_large_image`
- Auto-generated sitemap via `@astrojs/sitemap`
- `robots.txt` allows everything except `/api/`
- `llms.txt` at root summarises site for AI crawlers (ChatGPT, Perplexity, Claude, Gemini) — rising AEO signal
- Images: `alt=` on every `<img>`, real descriptions not filler
- Heading hierarchy enforced (one H1, no skipped levels)
- Internal link juice flows: home → services → areas, and back
- No `h1` used as logo

## 9. Schema (JSON-LD)

### Home
```
LocalBusiness
  name, url, email, image
  description
  priceRange: "££"
  address: { addressLocality: "Oldham", addressRegion: "Greater Manchester", postalCode: "OL1", addressCountry: "GB" }
    (postalCode is placeholder until owner supplies — mark as TBD in code)
  geo: { lat 53.5444, lng -2.1169 }
  areaServed: [GeoCircle centred on Oldham, 10 mi radius]
  openingHoursSpecification: [Mon-Fri 17:00-21:00, Sat-Sun 08:00-21:00]
  founder: { Person name: "Sangita Chavda" }
  foundingDate: "2026"
  (NO aggregateRating until we have multiple verified reviews)
  (NO sameAs until social profiles exist)
```

### Service pages
```
Service
  name, description, provider (ref LocalBusiness)
  areaServed, serviceType
  offers: PriceSpecification (from-price, GBP)
```

### FAQ page
```
FAQPage with Question/Answer array
```

### Breadcrumbs on every non-home page
```
BreadcrumbList
```

### Reviews
Single `Review` attached to `LocalBusiness`, authored "Electiva Marketing Limited". No `aggregateRating` until we have ≥3 independent reviews.

## 10. CRO

### Conversion paths (ranked)
1. Quote form submission (primary — only conversion action available)
2. Email click (`mailto:info@omnishine.co.uk` in footer + contact)

### Form (the entire business depends on this working)
- **Fields:** name, email, postcode (free text), service type (select), message (textarea, optional)
- **Validation:** client-side + server-side (HTML5 + Zod in the function)
- **Turnstile:** invisible challenge on submit
- **Consent:** single checkbox "I agree to the privacy policy" — required
- **Success:** replace form with confirmation panel; do not redirect (faster perceived response)
- **Error:** inline, never lose user input
- **Honeypot:** hidden `company_site` field — discard silently if filled

### Form email routing
- **Email 1 (team):** `To: info@omnishine.co.uk`, `Bcc: sangitachavda11@gmail.com`, body = submission details, reply-to = submitter email
- **Email 2 (submitter auto-reply):** `To: submitter@...`, body = "Thanks — we'll get back to you within 2 working hours during opening times"
- Both sent via Resend; failures retried once, then surfaced to user as "please email us directly"

### Trust signals (honest)
- "Family-run, founded 2026"
- "Serving 15+ towns around Oldham"
- "Eco-friendly products as standard"
- "Weekend availability"
- Named founder + photo on About (owner to supply; default to silhouette placeholder until then)

### CTA placement
- Hero: one primary CTA ("Get a free quote")
- Every service page: inline form in final section
- Sticky bottom bar on mobile ("Get a free quote")
- Footer: form-less "Contact" link

## 11. Performance targets

- Lighthouse Performance ≥ 98 on mobile and desktop
- LCP < 1.2s on 4G
- CLS < 0.05
- TBT < 100ms
- INP < 200ms
- Total page weight < 180kB gzipped for homepage
- No blocking third-party scripts
- Fonts self-hosted, preloaded

## 12. Accessibility (WCAG 2.2 AA)

- All interactive elements keyboard-reachable
- Visible focus states (not `outline: none`)
- Contrast ratios meet AA on all text/background pairs
- `prefers-reduced-motion` respected (no hero animations if user opts out)
- Form errors associated via `aria-describedby`
- Skip-to-content link
- Landmark roles used (header/main/footer/nav)
- No colour-only information

## 13. Legal / compliance

- **Privacy policy:** rewritten to match reality (Cloudflare Analytics = no cookies, Resend = email forwarding only, data retention 24 months, rights under UK GDPR, DPO contact = info@omnishine.co.uk)
- **Terms:** services, pricing basis, cancellation, liability limits, force majeure
- **Complaints procedure:** preserved from current site, reviewed
- **Cookies:** we use none, so page states that and the cookie banner is removed
- **ICO:** NOT claimed. Owner strongly advised to register for £40/yr (not blocking launch — added to post-launch checklist)
- **Insurance:** NOT claimed. Owner advised to obtain public liability before accepting commercial contracts (not blocking launch)

## 14. Deliverables

1. GitHub repo `omnishine-website` (public or private — owner preference)
2. Running site at `omnishine.co.uk` via Cloudflare Pages
3. All 21 pages populated with approved copy
4. Contact form live, sending to info@omnishine.co.uk with Bcc routing
5. Google Search Console property verified
6. Sitemap submitted
7. Lighthouse report proving ≥98 perf on mobile
8. Rich Results test pass for LocalBusiness + FAQPage + Service schemas
9. Handoff doc (`docs/OPERATIONS.md`): how to edit copy, add a review, update prices

## 15. Out-of-scope / follow-ups (not in v1)

- Blog / content marketing
- Paid ads landing pages
- Real bespoke photography (placeholder stock for v1)
- ICO registration
- Insurance verification badge
- Companies House incorporation
- Real customer-review collection system (e.g., reviews.io)
- Online booking / calendar
- WhatsApp / phone integration (trivial to add later once number exists)

## 16. Assumptions & risks

- **A1:** Owner controls DNS for `omnishine.co.uk` (can point to Cloudflare Pages). *Mitigation:* if not on Cloudflare, we'll provide CNAME/A records instead.
- **A2:** Current WordPress site can be taken down without losing inbound links. *Mitigation:* preserve URL slugs where possible (e.g., `/commercial-cleaning-oldham/` → `/services/commercial-cleaning-oldham/` with 301).
- **A3:** Owner can receive emails at `info@omnishine.co.uk`. *Mitigation:* test email delivery end-to-end before go-live.
- **R1:** Resend free tier (3k/month) exceeded if spam storms. *Mitigation:* Turnstile + honeypot + rate limit per IP in function.
- **R2:** Cloudflare Turnstile sitekey must be created by owner (or with owner-approved Cloudflare account). *Mitigation:* list as explicit setup step in plan.

## 17. Open questions (to resolve during implementation)

- Owner to supply placeholder `postalCode` for schema (even "OL1 1AA" if no real registered address) OR accept we omit `postalCode` entirely
- Owner to confirm Electiva Marketing review text before publish
- Owner to decide public vs private GitHub repo
- Owner to provide Google Business Profile URL directly (cid we have doesn't reliably resolve to the canonical GBP URL)
