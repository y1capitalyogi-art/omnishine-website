# OmniShine Rebuild — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a new `omnishine.co.uk` as an Astro static site on Cloudflare Pages with best-in-class SEO, AEO, CRO, Local SEO, compliance honesty, and a working Turnstile-protected contact form that emails via Resend.

**Architecture:** Astro 5 SSG + Tailwind CSS v4 → Cloudflare Pages. A single Pages Function at `/api/quote` handles POST submissions: validates with Zod, verifies Turnstile, sends two Resend emails (team + submitter auto-reply), returns JSON. No database, no CMS, no hydration on static pages.

**Tech Stack:** Astro 5, Tailwind CSS v4, Lucide icons, Inter + Fraunces fonts, Cloudflare Pages, Cloudflare Pages Functions, Cloudflare Turnstile, Resend API, Cloudflare Web Analytics, `@astrojs/sitemap`.

---

## File Structure (created during this plan)

```
omnishine/
├── .github/workflows/ci.yml                 # Lint + build check on PR
├── .gitignore
├── .node-version                            # 22
├── astro.config.mjs
├── tailwind.config.js
├── package.json
├── package-lock.json
├── tsconfig.json
├── README.md
├── docs/
│   ├── OPERATIONS.md                        # How to edit copy, add reviews, change prices
│   └── superpowers/                         # spec + plan already here
├── public/
│   ├── favicon.svg
│   ├── favicon-32.png
│   ├── favicon-192.png
│   ├── apple-touch-icon.png
│   ├── og-default.png                       # 1200x630 social card
│   ├── robots.txt
│   └── llms.txt
├── src/
│   ├── content/
│   │   ├── site.ts                          # One source of truth: name, email, areas, hours, prices
│   │   └── reviews.ts                       # Reviews array (starts with one pending)
│   ├── layouts/
│   │   ├── Base.astro                       # html, head, meta, schema slot
│   │   └── Page.astro                       # Base + header + footer + breadcrumbs
│   ├── components/
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── Hero.astro
│   │   ├── TrustStrip.astro
│   │   ├── ServiceCard.astro
│   │   ├── AreaCard.astro
│   │   ├── ReviewCard.astro
│   │   ├── FaqItem.astro                    # <details> for zero-JS a11y
│   │   ├── FaqList.astro                    # Emits FAQPage schema
│   │   ├── QuoteForm.astro                  # Turnstile + honeypot
│   │   ├── StickyCtaMobile.astro
│   │   ├── Breadcrumbs.astro
│   │   └── Icon.astro                       # Thin Lucide wrapper
│   ├── lib/
│   │   └── schema.ts                        # JSON-LD builders
│   ├── pages/
│   │   ├── index.astro                      # Home
│   │   ├── services/
│   │   │   ├── domestic-cleaning-oldham.astro
│   │   │   ├── commercial-cleaning-oldham.astro
│   │   │   ├── deep-cleaning-oldham.astro
│   │   │   ├── end-of-tenancy-cleaning-oldham.astro
│   │   │   └── after-builders-cleaning-oldham.astro
│   │   ├── areas/
│   │   │   ├── index.astro                  # Area hub
│   │   │   ├── shaw.astro
│   │   │   ├── royton.astro
│   │   │   ├── chadderton.astro
│   │   │   ├── saddleworth.astro
│   │   │   └── rochdale.astro
│   │   ├── pricing.astro
│   │   ├── about.astro
│   │   ├── faq.astro
│   │   ├── contact.astro
│   │   ├── privacy.astro
│   │   ├── terms.astro
│   │   ├── complaints.astro
│   │   └── cookies.astro
│   └── styles/
│       └── globals.css
├── functions/
│   └── api/
│       └── quote.ts                          # Cloudflare Pages Function
└── tests/
    └── e2e/
        └── form.spec.ts                      # Playwright smoke test of form submission
```

---

## Task 1: Repo, Node, Astro scaffold

**Files:**
- Create: `/Users/yogi/omnishine/package.json`
- Create: `/Users/yogi/omnishine/.gitignore`
- Create: `/Users/yogi/omnishine/.node-version`
- Create: `/Users/yogi/omnishine/astro.config.mjs`
- Create: `/Users/yogi/omnishine/tsconfig.json`
- Create: `/Users/yogi/omnishine/tailwind.config.js`
- Create: `/Users/yogi/omnishine/src/styles/globals.css`

- [ ] **Step 1.1: Ensure Node 22 is active**

Run: `node --version`
Expected: `v22.x.x`. If not, `nvm install 22 && nvm use 22`.

- [ ] **Step 1.2: Init Astro project non-interactively**

Run from `/Users/yogi/omnishine`:
```bash
npm create astro@latest -- --template minimal --typescript strict --install --no-git --yes .
```
Expected: dependencies install, creates `src/pages/index.astro`, `astro.config.mjs`.

- [ ] **Step 1.3: Install Tailwind v4, sitemap, image, and icon deps**

```bash
npm install -D tailwindcss@^4 @tailwindcss/vite @astrojs/sitemap @astrojs/check typescript
npm install @astrojs/image sharp lucide zod
```

- [ ] **Step 1.4: Write `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://omnishine.co.uk',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()] },
});
```

- [ ] **Step 1.5: Write `src/styles/globals.css` (Tailwind v4 entry + design tokens)**

```css
@import "tailwindcss";

@theme {
  --color-navy-900: #1e3a8a;
  --color-navy-700: #1d4ed8;
  --color-navy-500: #3b82f6;
  --color-gold-400: #fbbf24;
  --color-gold-500: #f59e0b;
  --color-ink: #0f172a;
  --color-muted: #64748b;
  --color-bg: #ffffff;
  --color-bg-soft: #f8fafc;
  --color-success: #059669;
  --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
  --font-display: 'Fraunces', ui-serif, Georgia, serif;
}

html { scroll-behavior: smooth; }
body { font-family: var(--font-sans); color: var(--color-ink); background: var(--color-bg); }
h1, h2, h3, h4 { font-family: var(--font-display); font-weight: 600; letter-spacing: -0.02em; }

/* Visible focus for keyboard users only */
:focus-visible { outline: 2px solid var(--color-gold-500); outline-offset: 3px; border-radius: 4px; }

@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

- [ ] **Step 1.6: Write `.node-version` and `.gitignore`**

`.node-version`:
```
22
```

`.gitignore`:
```
node_modules
dist
.astro
.env
.env.*
!.env.example
.DS_Store
.wrangler
```

- [ ] **Step 1.7: Smoke test**

```bash
npm run dev
```
Open `http://localhost:4321/`. Expect default Astro page. Kill the dev server.

- [ ] **Step 1.8: Commit**

```bash
cd /Users/yogi/omnishine
git init -b main
git add .
git commit -m "chore: scaffold Astro 5 + Tailwind v4"
```

---

## Task 2: Site constants + content source-of-truth

**Files:**
- Create: `src/content/site.ts`
- Create: `src/content/reviews.ts`

- [ ] **Step 2.1: Write `src/content/site.ts`**

```ts
export const site = {
  name: 'Omni Shine Cleaning',
  shortName: 'OmniShine',
  tagline: 'Professional cleaning you can count on',
  heroHeadline: 'Professional Cleaning Services in Oldham',
  heroSub: 'Family-run cleaners serving Oldham, Shaw, Royton, Saddleworth, Rochdale and 10+ surrounding towns. Eco-friendly products, weekend availability, free quotes.',
  url: 'https://omnishine.co.uk',
  email: 'info@omnishine.co.uk',
  ownerEmail: 'sangitachavda11@gmail.com',
  founder: 'Sangita Chavda',
  foundingYear: 2026,
  address: {
    locality: 'Oldham',
    region: 'Greater Manchester',
    country: 'GB',
  },
  geo: { lat: 53.5444, lng: -2.1169 },
  hours: [
    { days: ['Mon','Tue','Wed','Thu','Fri'], open: '17:00', close: '21:00' },
    { days: ['Sat','Sun'], open: '08:00', close: '21:00' },
  ],
  areas: [
    'Oldham','Shaw','Royton','Chadderton','Failsworth','Lees','Uppermill',
    'Saddleworth','Springhead','Greenfield','Grotton','Moorside','Rochdale','Delph',
  ],
  services: [
    { slug: 'domestic-cleaning-oldham', name: 'Domestic Cleaning', from: 18, unit: '/ hour', blurb: 'Regular, one-off, spring and move-in cleans for homes across Oldham.' },
    { slug: 'commercial-cleaning-oldham', name: 'Commercial Cleaning', from: 22, unit: '/ hour', blurb: 'Offices, retail units and shared workspaces — evenings and weekends.' },
    { slug: 'deep-cleaning-oldham', name: 'Deep Cleaning', from: 150, unit: 'from', blurb: 'Top-to-bottom deep cleans — kitchens, bathrooms, carpets, windows.' },
    { slug: 'end-of-tenancy-cleaning-oldham', name: 'End of Tenancy', from: 180, unit: 'from', blurb: 'Deposit-back cleans that meet letting-agent standards.' },
    { slug: 'after-builders-cleaning-oldham', name: 'After Builders', from: 200, unit: 'from', blurb: 'Dust, debris and residue removal after renovations and builds.' },
  ],
  trustChips: ['Family-run', 'Oldham-based', 'Eco-friendly', 'Weekend availability'],
  paymentsAccepted: ['Bank transfer', 'Cash', 'Card', 'Stripe link'],
  googleBusinessUrl: 'https://www.google.com/maps/place/Omni+Shine+Cleaning/data=!4m2!3m1!1s0x0:0x8b0c17c468c5a93c',
} as const;

export type ServiceSlug = (typeof site.services)[number]['slug'];
```

- [ ] **Step 2.2: Write `src/content/reviews.ts`**

```ts
export type Review = {
  author: string;
  company?: string;
  location?: string;
  rating: 1|2|3|4|5;
  date: string; // ISO
  body: string;
  status: 'approved' | 'pending';
};

// Owner to approve exact wording before we mark status = 'approved' and wrap in schema.
export const reviews: Review[] = [
  {
    author: 'Electiva Marketing Limited',
    company: 'Electiva Marketing Limited',
    location: 'Oldham',
    rating: 5,
    date: '2026-02-10',
    body: 'Sangita and the Omni Shine team have been looking after our office for months — reliable, thorough, and genuinely nice to deal with. Everything sparkles after every visit.',
    status: 'pending',
  },
];

export const approvedReviews = () => reviews.filter(r => r.status === 'approved');
```

- [ ] **Step 2.3: Commit**

```bash
git add src/content
git commit -m "chore: add site and reviews content modules"
```

---

## Task 3: Design assets (logo SVG, OG image, favicons, fonts)

**Files:**
- Create: `public/favicon.svg`
- Create: `public/favicon-32.png`, `public/favicon-192.png`, `public/apple-touch-icon.png`
- Create: `public/og-default.png`
- Create: `public/fonts/` (self-hosted woff2 files)

- [ ] **Step 3.1: Write `public/favicon.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#1e3a8a"/>
  <path d="M32 14 L35 29 L50 32 L35 35 L32 50 L29 35 L14 32 L29 29 Z" fill="#fbbf24"/>
  <circle cx="32" cy="32" r="4" fill="#fff"/>
</svg>
```

- [ ] **Step 3.2: Generate PNG favicons and OG image**

Create `scripts/gen-assets.mjs`:
```js
import sharp from 'sharp';
import fs from 'node:fs';
const svg = fs.readFileSync('public/favicon.svg');
await sharp(svg).resize(32, 32).png().toFile('public/favicon-32.png');
await sharp(svg).resize(192, 192).png().toFile('public/favicon-192.png');
await sharp(svg).resize(180, 180).png().toFile('public/apple-touch-icon.png');

// OG card 1200x630, gradient + wordmark
const og = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1e3a8a"/>
      <stop offset="1" stop-color="#3b82f6"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <path d="M600 180 L620 300 L740 320 L620 340 L600 460 L580 340 L460 320 L580 300 Z" fill="#fbbf24"/>
  <text x="600" y="540" font-family="Georgia, serif" font-size="72" font-weight="700" fill="#fff" text-anchor="middle">Omni Shine</text>
  <text x="600" y="590" font-family="Arial, sans-serif" font-size="28" fill="#fbbf24" text-anchor="middle">Professional cleaning in Oldham</text>
</svg>`;
await sharp(Buffer.from(og)).png().toFile('public/og-default.png');
console.log('assets generated');
```

Run:
```bash
node scripts/gen-assets.mjs
```
Expected: 4 PNG files written.

- [ ] **Step 3.3: Self-host Inter + Fraunces**

Download woff2 subsets (latin) from Google Fonts Helper or `fontsource-plus`:
```bash
npm install @fontsource-variable/inter @fontsource-variable/fraunces
```

Import in `src/styles/globals.css` at the top:
```css
@import "@fontsource-variable/inter";
@import "@fontsource-variable/fraunces";
```

- [ ] **Step 3.4: Commit**

```bash
git add public scripts package.json package-lock.json src/styles
git commit -m "feat: add logo, OG image, favicons, self-hosted fonts"
```

---

## Task 4: Schema builders

**Files:**
- Create: `src/lib/schema.ts`

- [ ] **Step 4.1: Write schema builders**

```ts
import { site } from '../content/site';

export function localBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${site.url}#business`,
    name: site.name,
    url: site.url,
    email: site.email,
    image: `${site.url}/og-default.png`,
    logo: `${site.url}/favicon.svg`,
    description: site.heroSub,
    priceRange: '££',
    address: {
      '@type': 'PostalAddress',
      addressLocality: site.address.locality,
      addressRegion: site.address.region,
      addressCountry: site.address.country,
    },
    geo: { '@type': 'GeoCoordinates', latitude: site.geo.lat, longitude: site.geo.lng },
    areaServed: site.areas.map(a => ({ '@type': 'Place', name: a })),
    openingHoursSpecification: site.hours.map(h => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.days.map(d => ({Mon:'Monday',Tue:'Tuesday',Wed:'Wednesday',Thu:'Thursday',Fri:'Friday',Sat:'Saturday',Sun:'Sunday'}[d])),
      opens: h.open,
      closes: h.close,
    })),
    founder: { '@type': 'Person', name: site.founder },
    foundingDate: String(site.foundingYear),
    paymentAccepted: site.paymentsAccepted.join(', '),
    sameAs: [site.googleBusinessUrl],
  };
}

export function serviceSchema(s: typeof site.services[number]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: s.name,
    description: s.blurb,
    provider: { '@id': `${site.url}#business` },
    areaServed: site.areas.map(a => ({ '@type': 'Place', name: a })),
    offers: {
      '@type': 'Offer',
      price: s.from,
      priceCurrency: 'GBP',
      priceSpecification: { '@type': 'PriceSpecification', price: s.from, priceCurrency: 'GBP', description: s.unit },
    },
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((x, i) => ({
      '@type': 'ListItem', position: i + 1, name: x.name, item: x.url,
    })),
  };
}

export function faqSchema(qas: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: qas.map(qa => ({
      '@type': 'Question', name: qa.q,
      acceptedAnswer: { '@type': 'Answer', text: qa.a },
    })),
  };
}
```

- [ ] **Step 4.2: Commit**

```bash
git add src/lib
git commit -m "feat: JSON-LD schema builders"
```

---

## Task 5: Layouts (Base + Page)

**Files:**
- Create: `src/layouts/Base.astro`
- Create: `src/layouts/Page.astro`

- [ ] **Step 5.1: Write `src/layouts/Base.astro`**

```astro
---
import '../styles/globals.css';
import { site } from '../content/site';

interface Props {
  title: string;
  description: string;
  path: string;
  schemas?: object[];
  ogImage?: string;
  noindex?: boolean;
}

const { title, description, path, schemas = [], ogImage = `${site.url}/og-default.png`, noindex = false } = Astro.props;
const canonical = new URL(path, site.url).toString();
---
<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>{title}</title>
  <meta name="description" content={description}/>
  <link rel="canonical" href={canonical}/>
  {noindex && <meta name="robots" content="noindex"/>}
  <link rel="icon" type="image/svg+xml" href="/favicon.svg"/>
  <link rel="apple-touch-icon" href="/apple-touch-icon.png"/>
  <meta name="theme-color" content="#1e3a8a"/>
  <meta property="og:type" content="website"/>
  <meta property="og:site_name" content={site.shortName}/>
  <meta property="og:locale" content="en_GB"/>
  <meta property="og:url" content={canonical}/>
  <meta property="og:title" content={title}/>
  <meta property="og:description" content={description}/>
  <meta property="og:image" content={ogImage}/>
  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:title" content={title}/>
  <meta name="twitter:description" content={description}/>
  <meta name="twitter:image" content={ogImage}/>
  {schemas.map(s => (
    <script type="application/ld+json" set:html={JSON.stringify(s)}/>
  ))}
  <!-- Cloudflare Web Analytics (cookieless) -->
  <script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token":"TO_BE_SET"}'></script>
</head>
<body class="bg-white text-slate-900 antialiased">
  <a href="#main" class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:bg-white focus:px-3 focus:py-2 focus:rounded-md focus:ring-2 focus:ring-amber-500">Skip to content</a>
  <slot/>
</body>
</html>
```

- [ ] **Step 5.2: Write `src/layouts/Page.astro`**

```astro
---
import Base from './Base.astro';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import StickyCtaMobile from '../components/StickyCtaMobile.astro';

interface Props {
  title: string;
  description: string;
  path: string;
  schemas?: object[];
  ogImage?: string;
  noindex?: boolean;
}
const props = Astro.props;
---
<Base {...props}>
  <Header/>
  <main id="main">
    <slot/>
  </main>
  <Footer/>
  <StickyCtaMobile/>
</Base>
```

- [ ] **Step 5.3: Commit**

```bash
git add src/layouts
git commit -m "feat: Base and Page layouts with head/schema"
```

---

## Task 6: Shared components (Header, Footer, Hero, TrustStrip, StickyCta, Breadcrumbs, Icon)

**Files:**
- Create each file under `src/components/`

- [ ] **Step 6.1: `Icon.astro` (thin Lucide wrapper)**

```astro
---
import * as icons from 'lucide';
interface Props { name: string; class?: string; size?: number; }
const { name, class: cls = '', size = 24 } = Astro.props;
const fn = (icons as any)[name[0].toUpperCase() + name.slice(1)];
const svg = fn ? fn.toSvg({ width: size, height: size, 'stroke-width': 1.75 }) : '';
---
<span class={cls} set:html={svg}/>
```

- [ ] **Step 6.2: `Header.astro`**

```astro
---
import { site } from '../content/site';
const nav = [
  { href: '/', label: 'Home' },
  { href: '/pricing/', label: 'Pricing' },
  { href: '/areas/', label: 'Areas' },
  { href: '/about/', label: 'About' },
  { href: '/faq/', label: 'FAQ' },
  { href: '/contact/', label: 'Contact' },
];
---
<header class="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200">
  <div class="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
    <a href="/" class="flex items-center gap-2 font-display text-xl font-semibold text-navy-900">
      <img src="/favicon.svg" alt="" width="32" height="32"/>
      <span>Omni Shine</span>
    </a>
    <nav aria-label="Primary" class="hidden md:block">
      <ul class="flex gap-6 text-sm font-medium text-slate-700">
        {nav.map(n => <li><a href={n.href} class="hover:text-navy-900">{n.label}</a></li>)}
      </ul>
    </nav>
    <a href="/contact/" class="inline-flex items-center gap-1 rounded-md bg-gold-400 px-4 py-2 text-sm font-semibold text-navy-900 shadow-sm hover:bg-gold-500">Get a Free Quote</a>
  </div>
</header>
```

- [ ] **Step 6.3: `Footer.astro`**

```astro
---
import { site } from '../content/site';
---
<footer class="mt-24 bg-navy-900 text-slate-100">
  <div class="mx-auto max-w-6xl px-4 py-12 grid gap-10 md:grid-cols-4">
    <div>
      <div class="flex items-center gap-2 font-display text-xl font-semibold text-white">
        <img src="/favicon.svg" alt="" width="28" height="28"/> Omni Shine
      </div>
      <p class="mt-3 text-sm text-slate-300 max-w-xs">
        Family-run cleaning service in Oldham and surrounding towns. Founded {site.foundingYear} by {site.founder}.
      </p>
      <p class="mt-3 text-sm"><a href={`mailto:${site.email}`} class="underline">{site.email}</a></p>
    </div>
    <div>
      <h3 class="text-sm font-semibold text-white">Services</h3>
      <ul class="mt-3 space-y-2 text-sm">
        {site.services.map(s => <li><a href={`/services/${s.slug}/`} class="hover:underline">{s.name}</a></li>)}
      </ul>
    </div>
    <div>
      <h3 class="text-sm font-semibold text-white">Areas</h3>
      <ul class="mt-3 space-y-2 text-sm">
        <li><a href="/areas/" class="hover:underline">All areas</a></li>
        <li><a href="/areas/shaw/" class="hover:underline">Shaw</a></li>
        <li><a href="/areas/royton/" class="hover:underline">Royton</a></li>
        <li><a href="/areas/chadderton/" class="hover:underline">Chadderton</a></li>
        <li><a href="/areas/saddleworth/" class="hover:underline">Saddleworth</a></li>
        <li><a href="/areas/rochdale/" class="hover:underline">Rochdale</a></li>
      </ul>
    </div>
    <div>
      <h3 class="text-sm font-semibold text-white">Company</h3>
      <ul class="mt-3 space-y-2 text-sm">
        <li><a href="/about/" class="hover:underline">About</a></li>
        <li><a href="/contact/" class="hover:underline">Contact</a></li>
        <li><a href="/privacy/" class="hover:underline">Privacy</a></li>
        <li><a href="/terms/" class="hover:underline">Terms</a></li>
        <li><a href="/complaints/" class="hover:underline">Complaints</a></li>
        <li><a href="/cookies/" class="hover:underline">Cookies</a></li>
      </ul>
    </div>
  </div>
  <div class="border-t border-white/10">
    <p class="mx-auto max-w-6xl px-4 py-4 text-xs text-slate-400">&copy; {new Date().getFullYear()} Omni Shine Cleaning. All rights reserved.</p>
  </div>
</footer>
```

- [ ] **Step 6.4: `Hero.astro`**

```astro
---
import { site } from '../content/site';
interface Props { headline?: string; sub?: string; chips?: readonly string[]; }
const { headline = site.heroHeadline, sub = site.heroSub, chips = site.trustChips } = Astro.props;
---
<section class="relative isolate overflow-hidden bg-gradient-to-br from-navy-900 via-navy-700 to-navy-500 text-white">
  <div class="mx-auto max-w-6xl px-4 py-20 md:py-28 text-center">
    <h1 class="font-display text-4xl md:text-6xl font-semibold tracking-tight">{headline}</h1>
    <p class="mx-auto mt-5 max-w-2xl text-lg text-slate-100/90">{sub}</p>
    <div class="mt-8 flex justify-center">
      <a href="/contact/" class="inline-flex items-center gap-2 rounded-md bg-gold-400 px-6 py-3 text-base font-semibold text-navy-900 shadow-lg hover:bg-gold-500">
        Get a Free Quote
      </a>
    </div>
    <ul class="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-200">
      {chips.map(c => <li class="flex items-center gap-1">✦ {c}</li>)}
    </ul>
  </div>
</section>
```

- [ ] **Step 6.5: `TrustStrip.astro`**

```astro
---
import { site } from '../content/site';
---
<section class="border-y border-slate-200 bg-slate-50">
  <div class="mx-auto max-w-6xl px-4 py-4 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm font-medium text-slate-600">
    {site.trustChips.map(c => <span>✦ {c}</span>)}
  </div>
</section>
```

- [ ] **Step 6.6: `StickyCtaMobile.astro`**

```astro
<div class="fixed bottom-0 inset-x-0 z-30 md:hidden bg-white/95 backdrop-blur border-t border-slate-200">
  <a href="/contact/" class="block mx-3 my-3 text-center rounded-md bg-gold-400 py-3 text-sm font-semibold text-navy-900 shadow">Get a Free Quote</a>
</div>
<div class="md:hidden h-20"></div>
```

- [ ] **Step 6.7: `Breadcrumbs.astro`**

```astro
---
interface Props { items: { name: string; href?: string }[] }
const { items } = Astro.props;
---
<nav aria-label="Breadcrumb" class="mx-auto max-w-6xl px-4 py-4 text-sm text-slate-500">
  <ol class="flex flex-wrap gap-2">
    {items.map((it, i) => (
      <li class="flex items-center gap-2">
        {i > 0 && <span aria-hidden="true">›</span>}
        {it.href ? <a href={it.href} class="hover:underline">{it.name}</a> : <span class="text-slate-700">{it.name}</span>}
      </li>
    ))}
  </ol>
</nav>
```

- [ ] **Step 6.8: `ServiceCard.astro`, `AreaCard.astro`, `ReviewCard.astro`**

`ServiceCard.astro`:
```astro
---
interface Props { href: string; name: string; blurb: string; from: number; unit: string; }
const { href, name, blurb, from, unit } = Astro.props;
---
<a href={href} class="group block rounded-2xl border border-slate-200 p-6 hover:border-gold-400 hover:shadow-md transition">
  <h3 class="font-display text-xl text-navy-900">{name}</h3>
  <p class="mt-2 text-slate-600 text-sm">{blurb}</p>
  <p class="mt-4 text-sm"><span class="font-semibold text-navy-900">From £{from}</span> <span class="text-slate-500">{unit}</span></p>
  <span class="mt-4 inline-flex items-center text-sm font-medium text-navy-700 group-hover:text-navy-900">Learn more →</span>
</a>
```

`AreaCard.astro`:
```astro
---
interface Props { href: string; name: string; }
const { href, name } = Astro.props;
---
<a href={href} class="block rounded-xl border border-slate-200 bg-white p-4 text-center hover:border-gold-400 hover:shadow-sm transition">
  <span class="font-semibold text-navy-900">{name}</span>
  <span class="block text-xs text-slate-500">Cleaners in {name}</span>
</a>
```

`ReviewCard.astro`:
```astro
---
interface Props { author: string; company?: string; body: string; rating: number; date: string; }
const { author, company, body, rating, date } = Astro.props;
---
<figure class="rounded-2xl border border-slate-200 p-6 bg-white">
  <div aria-label={`${rating} out of 5`} class="text-gold-500">{'★'.repeat(rating)}{'☆'.repeat(5-rating)}</div>
  <blockquote class="mt-3 text-slate-700">&ldquo;{body}&rdquo;</blockquote>
  <figcaption class="mt-4 text-sm text-slate-600">
    <span class="font-semibold text-navy-900">{author}</span>{company && author !== company ? ` — ${company}` : ''}
    <time datetime={date} class="block text-slate-500">{new Date(date).toLocaleDateString('en-GB', {month:'short', year:'numeric'})}</time>
  </figcaption>
</figure>
```

- [ ] **Step 6.9: Commit**

```bash
git add src/components
git commit -m "feat: shared components (header/footer/hero/cards/breadcrumbs)"
```

---

## Task 7: FAQ components + global FAQ content

**Files:**
- Create: `src/components/FaqItem.astro`
- Create: `src/components/FaqList.astro`
- Create: `src/content/faq.ts`

- [ ] **Step 7.1: Write `src/content/faq.ts`**

```ts
export const faqs = [
  { q: 'How much does end-of-tenancy cleaning cost in Oldham?',
    a: 'End-of-tenancy cleans start from £180 for a 1-bed flat and scale with property size. We provide a fixed quote after a short postcode + bedroom-count form — no surprises.' },
  { q: 'How much does regular domestic cleaning cost per hour?',
    a: 'Domestic cleaning is £18 per hour with a 2-hour minimum. We bring all eco-friendly products and equipment.' },
  { q: 'What areas around Oldham do you cover?',
    a: 'Oldham, Shaw, Royton, Chadderton, Failsworth, Lees, Uppermill, Saddleworth, Springhead, Greenfield, Grotton, Moorside, Rochdale and Delph. If you\'re just outside, ask — we often still cover it.' },
  { q: 'Are you insured?',
    a: 'Omni Shine is a newly founded business (2026) and we will confirm our current insurance position with you in writing before any booking is confirmed. We do not publish unverified insurance claims on this site.' },
  { q: 'Do you bring your own cleaning products?',
    a: 'Yes — eco-friendly products and all equipment are included. Fragrance-free options are available on request for sensitive households.' },
  { q: 'Do you clean on weekends?',
    a: 'Yes — Saturday and Sunday from 8am to 9pm. Weekday slots run 5pm–9pm.' },
  { q: 'How do I get a quote?',
    a: 'Fill in the short quote form with your postcode, service type and message. During our opening hours we reply within 2 working hours.' },
  { q: 'What payment methods do you accept?',
    a: 'Bank transfer, cash, card, and Stripe links. Invoices are issued for commercial work.' },
] as const;
```

- [ ] **Step 7.2: `FaqItem.astro` and `FaqList.astro`**

`FaqItem.astro`:
```astro
---
interface Props { q: string; a: string; }
const { q, a } = Astro.props;
---
<details class="group border-b border-slate-200 py-4">
  <summary class="flex cursor-pointer items-center justify-between font-semibold text-navy-900">
    {q}
    <span aria-hidden="true" class="transition group-open:rotate-45 text-xl">+</span>
  </summary>
  <p class="mt-3 text-slate-700">{a}</p>
</details>
```

`FaqList.astro`:
```astro
---
import FaqItem from './FaqItem.astro';
interface Props { items: readonly { q: string; a: string }[] }
const { items } = Astro.props;
---
<div class="mx-auto max-w-3xl">
  {items.map(it => <FaqItem q={it.q} a={it.a} />)}
</div>
```

- [ ] **Step 7.3: Commit**

```bash
git add src/content/faq.ts src/components/FaqItem.astro src/components/FaqList.astro
git commit -m "feat: FAQ content + components"
```

---

## Task 8: Quote form component + Turnstile + honeypot

**Files:**
- Create: `src/components/QuoteForm.astro`

- [ ] **Step 8.1: Write `QuoteForm.astro`**

```astro
---
import { site } from '../content/site';
const services = site.services.map(s => s.name);
const TURNSTILE_SITEKEY = import.meta.env.PUBLIC_TURNSTILE_SITEKEY ?? '1x00000000000000000000AA';
---
<form id="quote-form" class="mx-auto max-w-xl space-y-4" method="POST" action="/api/quote" novalidate>
  <div>
    <label for="name" class="block text-sm font-semibold text-slate-700">Your name</label>
    <input id="name" name="name" required minlength="2" maxlength="80" autocomplete="name" class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-navy-700 focus:ring-2 focus:ring-navy-500"/>
  </div>
  <div>
    <label for="email" class="block text-sm font-semibold text-slate-700">Email</label>
    <input id="email" name="email" type="email" required maxlength="120" autocomplete="email" class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-navy-700 focus:ring-2 focus:ring-navy-500"/>
  </div>
  <div>
    <label for="postcode" class="block text-sm font-semibold text-slate-700">Postcode</label>
    <input id="postcode" name="postcode" required minlength="2" maxlength="10" autocomplete="postal-code" class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-navy-700 focus:ring-2 focus:ring-navy-500" placeholder="e.g. OL1 1AA"/>
  </div>
  <div>
    <label for="service" class="block text-sm font-semibold text-slate-700">Service</label>
    <select id="service" name="service" required class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 bg-white">
      <option value="">Choose a service…</option>
      {services.map(s => <option value={s}>{s}</option>)}
      <option value="Other">Other / not sure</option>
    </select>
  </div>
  <div>
    <label for="message" class="block text-sm font-semibold text-slate-700">Message <span class="text-slate-400 text-xs font-normal">(optional)</span></label>
    <textarea id="message" name="message" rows="4" maxlength="1500" class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"></textarea>
  </div>

  <!-- honeypot (hidden from users, bots fill it) -->
  <div class="hidden" aria-hidden="true"><label>Website<input name="company_site" tabindex="-1" autocomplete="off"/></label></div>

  <label class="flex gap-2 text-sm text-slate-600">
    <input type="checkbox" name="consent" required class="mt-1"/>
    <span>I agree to the <a href="/privacy/" class="underline">privacy policy</a> and consent to being contacted about my enquiry.</span>
  </label>

  <div class="cf-turnstile" data-sitekey={TURNSTILE_SITEKEY} data-size="flexible"></div>

  <button type="submit" class="w-full rounded-md bg-gold-400 px-4 py-3 text-base font-semibold text-navy-900 shadow hover:bg-gold-500 disabled:opacity-50">
    Send my quote request
  </button>

  <p id="form-result" role="status" aria-live="polite" class="text-sm"></p>
  <p class="text-xs text-slate-500">We reply within 2 working hours during opening times (Mon–Fri 5pm–9pm, Sat–Sun 8am–9pm).</p>
</form>

<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
<script>
  const form = document.getElementById('quote-form');
  const result = document.getElementById('form-result');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    result.textContent = 'Sending…';
    result.className = 'text-sm text-slate-500';
    const fd = new FormData(form);
    const res = await fetch('/api/quote', { method: 'POST', body: fd });
    if (res.ok) {
      form.reset();
      form.innerHTML = '<div class="rounded-xl bg-emerald-50 border border-emerald-200 p-6 text-emerald-900"><h3 class="font-semibold">Thanks! We got your request.</h3><p class="mt-2 text-sm">We\'ll reply to you shortly during opening hours. A copy has been sent to your inbox.</p></div>';
    } else {
      const body = await res.json().catch(() => ({}));
      result.textContent = body.error || 'Something went wrong. Please email info@omnishine.co.uk directly.';
      result.className = 'text-sm text-red-700';
    }
  });
</script>
```

- [ ] **Step 8.2: Commit**

```bash
git add src/components/QuoteForm.astro
git commit -m "feat: QuoteForm with Turnstile + honeypot + consent"
```

---

## Task 9: Homepage

**Files:**
- Create: `src/pages/index.astro`

- [ ] **Step 9.1: Write `src/pages/index.astro`**

```astro
---
import Page from '../layouts/Page.astro';
import Hero from '../components/Hero.astro';
import TrustStrip from '../components/TrustStrip.astro';
import ServiceCard from '../components/ServiceCard.astro';
import AreaCard from '../components/AreaCard.astro';
import ReviewCard from '../components/ReviewCard.astro';
import FaqList from '../components/FaqList.astro';
import QuoteForm from '../components/QuoteForm.astro';
import { site } from '../content/site';
import { approvedReviews } from '../content/reviews';
import { faqs } from '../content/faq';
import { localBusinessSchema, faqSchema } from '../lib/schema';

const topFaqs = faqs.slice(0, 4);
const schemas = [localBusinessSchema(), faqSchema(topFaqs as any)];
---
<Page
  title="Professional Cleaning Services in Oldham | Omni Shine"
  description="Family-run cleaners serving Oldham, Shaw, Royton, Saddleworth, Rochdale and 10+ surrounding towns. Eco-friendly, weekend availability, free quotes."
  path="/"
  schemas={schemas}
>
  <Hero/>
  <TrustStrip/>

  <section class="mx-auto max-w-6xl px-4 py-16">
    <h2 class="font-display text-3xl text-navy-900 text-center">Our cleaning services in Oldham</h2>
    <p class="mt-2 text-center text-slate-600">Pick a service — or tell us what you need and we'll build the right plan.</p>
    <div class="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {site.services.map(s => (
        <ServiceCard href={`/services/${s.slug}/`} name={s.name} blurb={s.blurb} from={s.from} unit={s.unit} />
      ))}
    </div>
  </section>

  <section class="bg-slate-50 py-16">
    <div class="mx-auto max-w-6xl px-4">
      <h2 class="font-display text-3xl text-navy-900 text-center">Areas we cover around Oldham</h2>
      <p class="mt-2 text-center text-slate-600">Fourteen towns across Oldham and Rochdale boroughs.</p>
      <div class="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {site.areas.map(a => <AreaCard href={`/areas/${a.toLowerCase()}/`} name={a}/>)}
      </div>
      <div class="mt-8 text-center"><a href="/areas/" class="text-navy-700 font-medium hover:underline">See all areas →</a></div>
    </div>
  </section>

  <section class="mx-auto max-w-6xl px-4 py-16">
    <h2 class="font-display text-3xl text-navy-900 text-center">Why people choose Omni Shine</h2>
    <div class="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <div><h3 class="font-semibold text-navy-900">Family-run, local</h3><p class="mt-2 text-sm text-slate-600">Founded in Oldham in {site.foundingYear} by Sangita Chavda. You deal with the owner directly.</p></div>
      <div><h3 class="font-semibold text-navy-900">Eco-friendly by default</h3><p class="mt-2 text-sm text-slate-600">Plant-based products that actually work. Fragrance-free on request.</p></div>
      <div><h3 class="font-semibold text-navy-900">Weekends included</h3><p class="mt-2 text-sm text-slate-600">Saturday and Sunday 8am–9pm — no weekend surcharges.</p></div>
      <div><h3 class="font-semibold text-navy-900">Honest pricing</h3><p class="mt-2 text-sm text-slate-600">Transparent hourly and fixed rates on our <a href="/pricing/" class="underline">pricing page</a>.</p></div>
    </div>
  </section>

  {approvedReviews().length > 0 && (
    <section class="bg-slate-50 py-16">
      <div class="mx-auto max-w-6xl px-4">
        <h2 class="font-display text-3xl text-navy-900 text-center">What our clients say</h2>
        <div class="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {approvedReviews().map(r => <ReviewCard {...r}/>)}
        </div>
      </div>
    </section>
  )}

  <section class="mx-auto max-w-6xl px-4 py-16">
    <h2 class="font-display text-3xl text-navy-900 text-center">Questions we get asked a lot</h2>
    <div class="mt-10"><FaqList items={topFaqs}/></div>
    <div class="mt-6 text-center"><a href="/faq/" class="text-navy-700 font-medium hover:underline">See all FAQs →</a></div>
  </section>

  <section id="quote" class="bg-navy-900 text-white py-20">
    <div class="mx-auto max-w-6xl px-4">
      <h2 class="font-display text-3xl text-center">Get your free quote</h2>
      <p class="mt-2 text-center text-slate-200">Quick form, no spam. We reply within 2 working hours.</p>
      <div class="mt-10 rounded-2xl bg-white text-slate-900 p-6 md:p-10">
        <QuoteForm/>
      </div>
    </div>
  </section>
</Page>
```

- [ ] **Step 9.2: Build + preview**

```bash
npm run build && npm run preview
```
Open preview URL. Verify: hero renders, all sections visible, nav links work (will 404 until pages built — ok for now), no console errors.

- [ ] **Step 9.3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: homepage"
```

---

## Task 10: Service page template + 5 service pages

**Files:**
- Create: `src/pages/services/domestic-cleaning-oldham.astro`
- Create: `src/pages/services/commercial-cleaning-oldham.astro`
- Create: `src/pages/services/deep-cleaning-oldham.astro`
- Create: `src/pages/services/end-of-tenancy-cleaning-oldham.astro`
- Create: `src/pages/services/after-builders-cleaning-oldham.astro`

- [ ] **Step 10.1: Write domestic-cleaning-oldham.astro (full, real copy)**

```astro
---
import Page from '../../layouts/Page.astro';
import Breadcrumbs from '../../components/Breadcrumbs.astro';
import QuoteForm from '../../components/QuoteForm.astro';
import FaqList from '../../components/FaqList.astro';
import { site } from '../../content/site';
import { serviceSchema, breadcrumbSchema, faqSchema } from '../../lib/schema';

const s = site.services.find(x => x.slug === 'domestic-cleaning-oldham')!;
const url = `${site.url}/services/${s.slug}/`;
const localFaqs = [
  { q: 'How often can you come?', a: 'Weekly, fortnightly, monthly, or a one-off. You pick the cadence — we turn up.' },
  { q: 'Will the same cleaner come each visit?', a: 'Yes, wherever possible. Continuity matters for trust and so we learn your preferences.' },
  { q: 'Do I need to be home?', a: 'No. Most clients give us a key or a key-safe code. We leave everything as we found it.' },
];
const schemas = [
  serviceSchema(s),
  breadcrumbSchema([
    { name: 'Home', url: `${site.url}/` },
    { name: 'Services', url: `${site.url}/services/` },
    { name: s.name, url },
  ]),
  faqSchema(localFaqs),
];
---
<Page
  title="Domestic Cleaning in Oldham | Omni Shine Cleaning"
  description="Weekly, fortnightly and one-off domestic cleaning across Oldham. £18/hr, eco-friendly products, weekend availability. Family-run, free quotes."
  path={`/services/${s.slug}/`}
  schemas={schemas}
>
  <Breadcrumbs items={[{name:'Home',href:'/'},{name:'Services',href:'/services/'},{name: s.name}]}/>

  <section class="mx-auto max-w-3xl px-4 py-10">
    <h1 class="font-display text-4xl md:text-5xl text-navy-900">Domestic Cleaning in Oldham</h1>
    <p class="mt-4 text-lg text-slate-700">Reliable, friendly home cleaning across Oldham and surrounding towns — from £{s.from}{s.unit}. Eco-friendly products, weekend slots, and the same cleaner each visit wherever possible.</p>

    <div class="mt-8 rounded-xl bg-slate-50 border border-slate-200 p-6">
      <h2 class="font-semibold text-navy-900">What's included</h2>
      <ul class="mt-3 grid gap-2 text-slate-700 md:grid-cols-2">
        <li>✦ Dusting, vacuuming, mopping</li>
        <li>✦ Kitchen surfaces, hob, sink</li>
        <li>✦ Bathroom clean and sanitise</li>
        <li>✦ Bed-changing (if sheets left out)</li>
        <li>✦ Waste removal and tidy-down</li>
        <li>✦ Eco-friendly products included</li>
      </ul>
    </div>

    <h2 class="mt-12 font-display text-2xl text-navy-900">How it works</h2>
    <ol class="mt-4 space-y-3 list-decimal pl-6 text-slate-700">
      <li>Tell us your postcode, property size and how often.</li>
      <li>We confirm a fixed hourly quote (usually £{s.from}{s.unit}).</li>
      <li>We turn up on time, every time — or we refund the visit.</li>
    </ol>

    <h2 class="mt-12 font-display text-2xl text-navy-900">Cleaning services around Oldham</h2>
    <p class="mt-2 text-slate-700">We cover {site.areas.slice(0,-1).join(', ')} and {site.areas.at(-1)}. <a href="/areas/" class="underline">See all areas</a>.</p>

    <h2 class="mt-12 font-display text-2xl text-navy-900">Common questions</h2>
    <div class="mt-4"><FaqList items={localFaqs}/></div>

    <div class="mt-12 rounded-2xl bg-white border border-slate-200 p-6 md:p-10 shadow-sm">
      <h2 class="font-display text-2xl text-navy-900">Get your free quote</h2>
      <p class="mt-1 text-slate-600">Takes 30 seconds. No obligation.</p>
      <div class="mt-6"><QuoteForm/></div>
    </div>
  </section>
</Page>
```

- [ ] **Step 10.2: Write the other 4 service pages**

Each follows the same template as 10.1. Replace slug, name, headline, meta description, "What's included" bullets, and localFaqs for each. Content for each (real copy):

**commercial-cleaning-oldham.astro:**
- Title: "Commercial & Office Cleaning in Oldham | Omni Shine"
- Description: "Office, retail and shared-workspace cleaning in Oldham. Evenings and weekends from £22/hr. Discreet, vetted, eco-friendly. Free quotes."
- What's included: desks/surfaces wiped, kitchens and washrooms, bins, hoovering, weekly/daily schedules
- FAQs: "Can you work outside office hours?" / "Can you invoice us monthly?" / "Do you have references?"

**deep-cleaning-oldham.astro:**
- Title: "Deep Cleaning in Oldham | One-Off Top-to-Bottom | Omni Shine"
- Description: "Top-to-bottom deep cleans from £150. Kitchens, bathrooms, carpets, windows — ideal for spring cleans and pre-sale prep."
- What's included: full list from kitchen degrease to limescale to skirtings
- FAQs: "How long does a deep clean take?" / "Do you move furniture?" / "Can you do just kitchen or just bathroom?"

**end-of-tenancy-cleaning-oldham.astro:**
- Title: "End of Tenancy Cleaning in Oldham | From £180 | Omni Shine"
- Description: "Deposit-back cleans in Oldham — from £180. Meets letting-agent standards with 72-hour re-clean guarantee."
- What's included: entire flat spec, oven deep clean, inside cupboards, limescale removal
- FAQs: "Do you guarantee I'll get my deposit back?" / "Do you clean carpets?" / "Can you come at short notice?"

**after-builders-cleaning-oldham.astro:**
- Title: "After-Builders Cleaning in Oldham | From £200 | Omni Shine"
- Description: "Post-renovation cleans in Oldham. Dust, debris, paint spots, residue — we return the space to clients move-in ready."
- What's included: dust removal, full wet wipe-down, window cleaning, fixture polish, floor protection removal
- FAQs: "Will you dispose of leftover debris?" / "How soon can you start after a build?" / "Do you handle multiple visits?"

- [ ] **Step 10.3: Build + spot-check each**

```bash
npm run build && npm run preview
```
Visit each `/services/.../` page. Verify H1, breadcrumbs, schema visible in view-source.

- [ ] **Step 10.4: Commit**

```bash
git add src/pages/services
git commit -m "feat: 5 service pages (domestic, commercial, deep, end-of-tenancy, after-builders)"
```

---

## Task 11: Areas hub + 5 area pages

**Files:**
- Create: `src/pages/areas/index.astro`
- Create: `src/pages/areas/shaw.astro`, `royton.astro`, `chadderton.astro`, `saddleworth.astro`, `rochdale.astro`

- [ ] **Step 11.1: Write `src/pages/areas/index.astro` (hub)**

```astro
---
import Page from '../../layouts/Page.astro';
import Breadcrumbs from '../../components/Breadcrumbs.astro';
import AreaCard from '../../components/AreaCard.astro';
import { site } from '../../content/site';
import { breadcrumbSchema } from '../../lib/schema';
const schemas = [breadcrumbSchema([
  { name:'Home', url:`${site.url}/` },
  { name:'Areas we cover', url:`${site.url}/areas/` },
])];
---
<Page title="Areas We Cover Around Oldham | Omni Shine Cleaning"
      description="Cleaning services across Oldham, Shaw, Royton, Chadderton, Failsworth, Saddleworth, Rochdale and 8 more towns around Greater Manchester."
      path="/areas/" schemas={schemas}>
  <Breadcrumbs items={[{name:'Home',href:'/'},{name:'Areas we cover'}]}/>
  <section class="mx-auto max-w-5xl px-4 py-10">
    <h1 class="font-display text-4xl text-navy-900">Areas we cover around Oldham</h1>
    <p class="mt-4 text-slate-700 max-w-2xl">We operate across 14 towns in the Oldham and Rochdale boroughs. Pick your area for local detail — or get a free quote and we'll confirm we cover you.</p>
    <div class="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {site.areas.map(a => <AreaCard href={`/areas/${a.toLowerCase()}/`} name={a}/>)}
    </div>
  </section>
</Page>
```

- [ ] **Step 11.2: Write `src/pages/areas/shaw.astro` (template — repeat for others)**

```astro
---
import Page from '../../layouts/Page.astro';
import Breadcrumbs from '../../components/Breadcrumbs.astro';
import QuoteForm from '../../components/QuoteForm.astro';
import { site } from '../../content/site';
import { breadcrumbSchema } from '../../lib/schema';

const area = 'Shaw';
const url = `${site.url}/areas/${area.toLowerCase()}/`;
const schemas = [breadcrumbSchema([
  { name:'Home', url:`${site.url}/` },
  { name:'Areas', url:`${site.url}/areas/` },
  { name: area, url },
])];
---
<Page title={`Cleaners in ${area} | Omni Shine Cleaning`}
      description={`Reliable domestic, commercial and deep cleaning in ${area}, Oldham. Family-run, eco-friendly, weekend availability. Free quotes.`}
      path={`/areas/${area.toLowerCase()}/`} schemas={schemas}>
  <Breadcrumbs items={[{name:'Home',href:'/'},{name:'Areas',href:'/areas/'},{name: area}]}/>
  <section class="mx-auto max-w-3xl px-4 py-10">
    <h1 class="font-display text-4xl text-navy-900">Cleaners in {area}</h1>
    <p class="mt-4 text-slate-700">
      Omni Shine is based minutes from {area} and cleans homes, offices and rentals across the area every week.
      We offer weekly/fortnightly domestic cleaning from £18/hr, end-of-tenancy cleans from £180, and deep cleans from £150.
    </p>

    <h2 class="mt-10 font-display text-2xl text-navy-900">Services available in {area}</h2>
    <ul class="mt-4 grid gap-2 text-slate-700 md:grid-cols-2">
      {site.services.map(s => <li>✦ <a href={`/services/${s.slug}/`} class="underline">{s.name}</a></li>)}
    </ul>

    <h2 class="mt-10 font-display text-2xl text-navy-900">Why {area} clients pick us</h2>
    <p class="mt-2 text-slate-700">Local presence means fast turn-around, reliable weekly slots, and no travel-time charges. Eco-friendly products included, weekends available, and the same cleaner on your recurring visits.</p>

    <div class="mt-12 rounded-2xl bg-white border border-slate-200 p-6 md:p-10 shadow-sm">
      <h2 class="font-display text-2xl text-navy-900">Free quote for {area}</h2>
      <div class="mt-6"><QuoteForm/></div>
    </div>
  </section>
</Page>
```

- [ ] **Step 11.3: Duplicate for royton, chadderton, saddleworth, rochdale — change `area` constant and one unique local sentence each**

For each, add one genuinely-local sentence (e.g. Saddleworth = "including the Saddleworth villages of Uppermill, Greenfield and Delph"; Rochdale = "we cross the M627 regularly for Rochdale clients"). No copy-paste-only duplicates.

- [ ] **Step 11.4: Commit**

```bash
git add src/pages/areas
git commit -m "feat: areas hub + 5 area pages"
```

---

## Task 12: About, Pricing, FAQ, Contact pages

**Files:**
- Create: `src/pages/about.astro`, `pricing.astro`, `faq.astro`, `contact.astro`

- [ ] **Step 12.1: Write `src/pages/about.astro`**

```astro
---
import Page from '../layouts/Page.astro';
import Breadcrumbs from '../components/Breadcrumbs.astro';
import { site } from '../content/site';
import { breadcrumbSchema } from '../lib/schema';
const schemas = [breadcrumbSchema([{name:'Home', url:`${site.url}/`},{name:'About', url:`${site.url}/about/`}])];
---
<Page title="About Omni Shine Cleaning | Family-Run Oldham Cleaners"
      description="Omni Shine is a family-run cleaning service founded in Oldham in 2026 by Sangita Chavda. Meet the team and our values."
      path="/about/" schemas={schemas}>
  <Breadcrumbs items={[{name:'Home',href:'/'},{name:'About'}]}/>
  <section class="mx-auto max-w-3xl px-4 py-10 prose prose-slate">
    <h1>About Omni Shine</h1>
    <p>Omni Shine Cleaning is a family-run cleaning service founded in Oldham in {site.foundingYear} by <strong>{site.founder}</strong>. We started the business for one reason: we think Oldham deserves cleaners who turn up on time, do a genuinely thorough job, and treat clients' homes with respect.</p>

    <h2>Our values</h2>
    <ul>
      <li><strong>Show up.</strong> On time, every time. If we're late we tell you.</li>
      <li><strong>Eco-friendly first.</strong> Plant-based products are our default. Chemical cleaners only on request.</li>
      <li><strong>Honest pricing.</strong> We publish our rates — no surprises.</li>
      <li><strong>Own our mistakes.</strong> If something's not right, we re-do it within 72 hours.</li>
    </ul>

    <h2>Coverage</h2>
    <p>We cover {site.areas.length} towns around Oldham, including {site.areas.slice(0, -1).join(', ')} and {site.areas.at(-1)}.</p>

    <h2>Get in touch</h2>
    <p>Drop us a note at <a href={`mailto:${site.email}`}>{site.email}</a> or use our <a href="/contact/">contact form</a>. We reply within two working hours during opening times.</p>
  </section>
</Page>
```

- [ ] **Step 12.2: Write `src/pages/pricing.astro`**

```astro
---
import Page from '../layouts/Page.astro';
import Breadcrumbs from '../components/Breadcrumbs.astro';
import { site } from '../content/site';
import { breadcrumbSchema, faqSchema } from '../lib/schema';
const priceFaqs = [
  { q: 'Is there a minimum booking?', a: 'Yes — two hours minimum for hourly services. Fixed-price jobs (deep, end-of-tenancy, after-builders) are priced per property.' },
  { q: 'Are weekend rates higher?', a: 'No — Saturday and Sunday are standard rates, no surcharge.' },
  { q: 'Do you charge travel?', a: 'Not within our 14-town service area. Outside that we quote travel per-mile on request.' },
];
const schemas = [
  breadcrumbSchema([{name:'Home',url:`${site.url}/`},{name:'Pricing',url:`${site.url}/pricing/`}]),
  faqSchema(priceFaqs),
];
---
<Page title="Cleaning Prices in Oldham | Transparent Rates | Omni Shine"
      description="Clear, transparent cleaning prices in Oldham. Domestic from £18/hr, end-of-tenancy from £180, deep from £150. No hidden fees."
      path="/pricing/" schemas={schemas}>
  <Breadcrumbs items={[{name:'Home',href:'/'},{name:'Pricing'}]}/>
  <section class="mx-auto max-w-3xl px-4 py-10">
    <h1 class="font-display text-4xl text-navy-900">Cleaning prices in Oldham</h1>
    <p class="mt-4 text-slate-700">No quote-hiding. Here's what we actually charge for cleaning across Oldham and surrounding towns.</p>

    <div class="mt-10 overflow-hidden rounded-2xl border border-slate-200">
      <table class="w-full text-left">
        <thead class="bg-slate-50 text-sm text-slate-700">
          <tr><th class="p-4">Service</th><th class="p-4">From</th><th class="p-4">Unit</th></tr>
        </thead>
        <tbody class="text-slate-800">
          {site.services.map(s => (
            <tr class="border-t border-slate-200">
              <td class="p-4 font-medium"><a href={`/services/${s.slug}/`} class="underline">{s.name}</a></td>
              <td class="p-4">£{s.from}</td>
              <td class="p-4 text-sm text-slate-600">{s.unit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <h2 class="mt-12 font-display text-2xl text-navy-900">Pricing FAQs</h2>
    <div class="mt-4">
      {priceFaqs.map(f => (
        <details class="group border-b border-slate-200 py-4">
          <summary class="cursor-pointer font-semibold text-navy-900">{f.q}</summary>
          <p class="mt-3 text-slate-700">{f.a}</p>
        </details>
      ))}
    </div>
  </section>
</Page>
```

- [ ] **Step 12.3: Write `src/pages/faq.astro`**

```astro
---
import Page from '../layouts/Page.astro';
import Breadcrumbs from '../components/Breadcrumbs.astro';
import FaqList from '../components/FaqList.astro';
import { site } from '../content/site';
import { breadcrumbSchema, faqSchema } from '../lib/schema';
import { faqs } from '../content/faq';
const schemas = [
  breadcrumbSchema([{name:'Home',url:`${site.url}/`},{name:'FAQ',url:`${site.url}/faq/`}]),
  faqSchema(faqs as any),
];
---
<Page title="Cleaning FAQs for Oldham | Omni Shine"
      description="Answers to common questions about cleaning in Oldham — costs, coverage, products, insurance, payment, weekends and more."
      path="/faq/" schemas={schemas}>
  <Breadcrumbs items={[{name:'Home',href:'/'},{name:'FAQ'}]}/>
  <section class="mx-auto max-w-3xl px-4 py-10">
    <h1 class="font-display text-4xl text-navy-900">Cleaning FAQs</h1>
    <p class="mt-4 text-slate-700">Questions we hear often — with direct answers. Missing yours? <a href="/contact/" class="underline">Drop us a line</a>.</p>
    <div class="mt-10"><FaqList items={faqs}/></div>
  </section>
</Page>
```

- [ ] **Step 12.4: Write `src/pages/contact.astro`**

```astro
---
import Page from '../layouts/Page.astro';
import Breadcrumbs from '../components/Breadcrumbs.astro';
import QuoteForm from '../components/QuoteForm.astro';
import { site } from '../content/site';
import { breadcrumbSchema } from '../lib/schema';
const schemas = [breadcrumbSchema([{name:'Home',url:`${site.url}/`},{name:'Contact',url:`${site.url}/contact/`}])];
---
<Page title="Contact Omni Shine Cleaning | Get a Free Quote in Oldham"
      description="Contact Omni Shine Cleaning in Oldham. Free quotes within 2 working hours during opening times. Email info@omnishine.co.uk."
      path="/contact/" schemas={schemas}>
  <Breadcrumbs items={[{name:'Home',href:'/'},{name:'Contact'}]}/>
  <section class="mx-auto max-w-3xl px-4 py-10">
    <h1 class="font-display text-4xl text-navy-900">Get your free quote</h1>
    <p class="mt-4 text-slate-700">Tell us your postcode and service and we'll reply within 2 working hours during opening times. Or email <a class="underline" href={`mailto:${site.email}`}>{site.email}</a>.</p>

    <div class="mt-10 rounded-2xl border border-slate-200 p-6 md:p-10"><QuoteForm/></div>

    <div class="mt-10 grid gap-6 md:grid-cols-2 text-sm text-slate-700">
      <div>
        <h2 class="font-display text-xl text-navy-900">Opening hours</h2>
        <ul class="mt-2">
          <li>Mon–Fri: 5pm–9pm</li>
          <li>Sat–Sun: 8am–9pm</li>
        </ul>
      </div>
      <div>
        <h2 class="font-display text-xl text-navy-900">Service area</h2>
        <p class="mt-2">{site.areas.join(', ')}.</p>
      </div>
    </div>
  </section>
</Page>
```

- [ ] **Step 12.5: Commit**

```bash
git add src/pages/about.astro src/pages/pricing.astro src/pages/faq.astro src/pages/contact.astro
git commit -m "feat: about, pricing, faq, contact pages"
```

---

## Task 13: Legal pages (privacy, terms, complaints, cookies)

**Files:**
- Create: `src/pages/privacy.astro`, `terms.astro`, `complaints.astro`, `cookies.astro`

- [ ] **Step 13.1: Write `src/pages/privacy.astro`**

```astro
---
import Page from '../layouts/Page.astro';
import { site } from '../content/site';
---
<Page title="Privacy Policy | Omni Shine Cleaning"
      description="How Omni Shine Cleaning handles your personal data under UK GDPR."
      path="/privacy/">
  <section class="mx-auto max-w-3xl px-4 py-10 prose prose-slate">
    <h1>Privacy policy</h1>
    <p><em>Last updated: {new Date().toLocaleDateString('en-GB',{year:'numeric',month:'long',day:'numeric'})}.</em></p>

    <h2>1. Who we are</h2>
    <p>Omni Shine Cleaning is a cleaning service based in Oldham, Greater Manchester, founded and operated by {site.founder}. You can contact us at <a href={`mailto:${site.email}`}>{site.email}</a>.</p>

    <h2>2. What we collect</h2>
    <p>When you use our contact form we collect your name, email address, postcode, chosen service, any message you provide, and the timestamp. We do not use tracking cookies. Our analytics provider, Cloudflare Web Analytics, is privacy-preserving and does not identify individual visitors.</p>

    <h2>3. Why we collect it</h2>
    <p>We use this information solely to reply to your enquiry and, if you become a client, to arrange and deliver the service. We do not sell or share your data with third parties for marketing.</p>

    <h2>4. Where we send it</h2>
    <p>Form submissions are delivered by email via our transactional email provider (Resend, Inc.). Emails are sent to {site.email} and Bcc to the business owner's private mailbox. A confirmation copy is also emailed to you.</p>

    <h2>5. How long we keep it</h2>
    <p>Enquiry emails are retained for up to 24 months unless you become a regular client, in which case we keep the correspondence for as long as the service relationship lasts plus 24 months.</p>

    <h2>6. Your rights under UK GDPR</h2>
    <p>You have the right to access, rectify, erase, restrict or port your data, and to object to processing. To exercise any of these rights, email us at <a href={`mailto:${site.email}`}>{site.email}</a>.</p>

    <h2>7. Security</h2>
    <p>Your submission is transmitted over HTTPS and handled by Cloudflare Pages and Resend. We use Cloudflare Turnstile and a honeypot field to prevent spam and abuse.</p>

    <h2>8. Complaints</h2>
    <p>If you're not satisfied with how we've handled your data you can complain to the Information Commissioner's Office at <a href="https://ico.org.uk/">ico.org.uk</a>.</p>
  </section>
</Page>
```

- [ ] **Step 13.2: Write `src/pages/terms.astro`**

```astro
---
import Page from '../layouts/Page.astro';
import { site } from '../content/site';
---
<Page title="Terms & Conditions | Omni Shine Cleaning"
      description="Terms and conditions for Omni Shine Cleaning services in Oldham."
      path="/terms/">
  <section class="mx-auto max-w-3xl px-4 py-10 prose prose-slate">
    <h1>Terms &amp; conditions</h1>
    <p><em>Last updated: {new Date().toLocaleDateString('en-GB',{year:'numeric',month:'long',day:'numeric'})}.</em></p>

    <h2>1. These terms</h2>
    <p>These terms apply to cleaning services provided by {site.name} ("we", "us"). By booking you agree to them.</p>

    <h2>2. Quotes and pricing</h2>
    <p>Quotes are valid for 30 days. Hourly services are charged to the nearest 15 minutes after the first hour. Fixed-price services (deep cleaning, end-of-tenancy, after-builders) assume standard condition; exceptional dirt, pet residue or hoarded waste may attract a supplement, agreed in writing before work starts.</p>

    <h2>3. Payment</h2>
    <p>We accept bank transfer, cash, card and Stripe links. Invoices are due within 7 days of issue unless agreed otherwise.</p>

    <h2>4. Cancellations</h2>
    <p>Please give 24 hours' notice of cancellation. Less notice may be charged at 50% of the booking value to cover the lost slot.</p>

    <h2>5. Re-clean guarantee</h2>
    <p>If any area does not meet our standard we will return and re-clean it at no charge, provided you notify us within 72 hours of the original clean.</p>

    <h2>6. Liability</h2>
    <p>We take reasonable care. Our liability for any claim is limited to the value of the individual booking. We will not be liable for indirect or consequential loss. Nothing in these terms limits liability that cannot be limited under UK law.</p>

    <h2>7. Keys and access</h2>
    <p>Where we hold a key or access code we store it with no address or name attached. We will return keys on request within 7 days.</p>

    <h2>8. Products and equipment</h2>
    <p>We supply eco-friendly products and equipment. If you have allergies, tell us in writing and we'll use fragrance-free alternatives.</p>

    <h2>9. Governing law</h2>
    <p>These terms are governed by the laws of England and Wales.</p>

    <h2>10. Contact</h2>
    <p>Email <a href={`mailto:${site.email}`}>{site.email}</a>.</p>
  </section>
</Page>
```

- [ ] **Step 13.3: Write `src/pages/complaints.astro`**

```astro
---
import Page from '../layouts/Page.astro';
import { site } from '../content/site';
---
<Page title="Complaints Procedure | Omni Shine Cleaning"
      description="How to complain if something goes wrong, and how we promise to respond."
      path="/complaints/">
  <section class="mx-auto max-w-3xl px-4 py-10 prose prose-slate">
    <h1>Complaints procedure</h1>
    <p>We aim to give a top-quality service. If something's wrong, we want to know and we want to put it right.</p>

    <h2>Step 1 — tell us</h2>
    <p>Email <a href={`mailto:${site.email}`}>{site.email}</a> within 72 hours of the issue. Include a brief description and photos if you have them.</p>

    <h2>Step 2 — we respond</h2>
    <p>We'll acknowledge within 2 working hours during opening times and propose a remedy within 3 working days. Most issues are resolved with a free re-clean.</p>

    <h2>Step 3 — independent review</h2>
    <p>If we can't agree a resolution, you're free to seek independent advice from <a href="https://www.citizensadvice.org.uk/">Citizens Advice</a>. Data-specific complaints can be raised with the <a href="https://ico.org.uk/">Information Commissioner's Office</a>.</p>
  </section>
</Page>
```

- [ ] **Step 13.4: Write `src/pages/cookies.astro`**

```astro
---
import Page from '../layouts/Page.astro';
---
<Page title="Cookies Policy | Omni Shine Cleaning"
      description="Omni Shine Cleaning does not use tracking cookies. Here's the detail."
      path="/cookies/">
  <section class="mx-auto max-w-3xl px-4 py-10 prose prose-slate">
    <h1>Cookies policy</h1>
    <p><strong>Short version:</strong> we don't use tracking cookies on this site.</p>
    <p>Our analytics provider, Cloudflare Web Analytics, is cookieless and does not track individual visitors. Our contact-form protection, Cloudflare Turnstile, may set a short-lived functional cookie on submission to verify you're not a bot — this is strictly necessary and exempt from consent under UK PECR.</p>
    <p>If you disable all cookies in your browser, the site will still work normally.</p>
  </section>
</Page>
```

- [ ] **Step 13.5: Commit**

```bash
git add src/pages/privacy.astro src/pages/terms.astro src/pages/complaints.astro src/pages/cookies.astro
git commit -m "feat: privacy, terms, complaints, cookies pages"
```

---

## Task 14: robots.txt + llms.txt

**Files:**
- Create: `public/robots.txt`
- Create: `public/llms.txt`

- [ ] **Step 14.1: Write `public/robots.txt`**

```
User-agent: *
Allow: /
Disallow: /api/

Sitemap: https://omnishine.co.uk/sitemap-index.xml
```

- [ ] **Step 14.2: Write `public/llms.txt`**

```
# Omni Shine Cleaning
> Family-run professional cleaning service in Oldham, Greater Manchester. Founded 2026 by Sangita Chavda. Serves Oldham and 13 surrounding towns. Contact form only — no phone. Email: info@omnishine.co.uk.

## Services
- Domestic cleaning: from £18/hr
- Commercial cleaning: from £22/hr
- Deep cleaning: from £150
- End of tenancy cleaning: from £180
- After-builders cleaning: from £200

## Areas served
Oldham, Shaw, Royton, Chadderton, Failsworth, Lees, Uppermill, Saddleworth, Springhead, Greenfield, Grotton, Moorside, Rochdale, Delph.

## Hours
Mon–Fri 5pm–9pm, Sat–Sun 8am–9pm.

## Key pages
- Home: https://omnishine.co.uk/
- Pricing: https://omnishine.co.uk/pricing/
- FAQ: https://omnishine.co.uk/faq/
- Contact: https://omnishine.co.uk/contact/
- Areas: https://omnishine.co.uk/areas/
```

- [ ] **Step 14.3: Commit**

```bash
git add public/robots.txt public/llms.txt
git commit -m "feat: robots.txt + llms.txt"
```

---

## Task 15: Cloudflare Pages Function for contact form

**Files:**
- Create: `functions/api/quote.ts`
- Create: `.env.example`

- [ ] **Step 15.1: Write `.env.example`**

```
# Cloudflare Pages Function secrets — add via Cloudflare dashboard
RESEND_API_KEY=re_xxx
TURNSTILE_SECRET_KEY=0x0000000000000000000000000000000000000000
FROM_EMAIL="Omni Shine <info@omnishine.co.uk>"

# Build-time only (public)
PUBLIC_TURNSTILE_SITEKEY=0x0000000000000000000000000000000000000000
```

- [ ] **Step 15.2: Write `functions/api/quote.ts`**

```ts
// Cloudflare Pages Function: POST /api/quote
// Validates, verifies Turnstile, sends two emails via Resend.
import { z } from 'zod';

interface Env {
  RESEND_API_KEY: string;
  TURNSTILE_SECRET_KEY: string;
  FROM_EMAIL: string;
}

const Body = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120),
  postcode: z.string().trim().min(2).max(10),
  service: z.string().trim().min(2).max(80),
  message: z.string().trim().max(1500).optional().default(''),
  consent: z.string().optional(), // "on" when checked
  company_site: z.string().optional().default(''), // honeypot
  'cf-turnstile-response': z.string().min(1),
});

async function verifyTurnstile(token: string, secret: string, ip: string | null): Promise<boolean> {
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret, response: token, remoteip: ip ?? '' }),
  });
  const json = await res.json() as { success: boolean };
  return json.success === true;
}

async function sendEmail(env: Env, to: string[], bcc: string[], subject: string, html: string, replyTo?: string): Promise<Response> {
  return fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'authorization': `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({ from: env.FROM_EMAIL, to, bcc, subject, html, reply_to: replyTo }),
  });
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
}

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const { request, env } = ctx;
  const form = await request.formData();
  const raw = Object.fromEntries(form) as Record<string, string>;

  const parsed = Body.safeParse(raw);
  if (!parsed.success) return Response.json({ error: 'Please check your details and try again.' }, { status: 400 });
  const d = parsed.data;

  // Honeypot: silently accept and drop
  if (d.company_site.trim() !== '') return Response.json({ ok: true });

  // Consent required
  if (d.consent !== 'on') return Response.json({ error: 'Please tick the consent box.' }, { status: 400 });

  // Turnstile
  const ip = request.headers.get('CF-Connecting-IP');
  const ok = await verifyTurnstile(d['cf-turnstile-response'], env.TURNSTILE_SECRET_KEY, ip);
  if (!ok) return Response.json({ error: 'Spam check failed. Please reload and try again.' }, { status: 400 });

  const teamHtml = `
    <h2>New Omni Shine quote request</h2>
    <p><b>Name:</b> ${esc(d.name)}<br>
       <b>Email:</b> ${esc(d.email)}<br>
       <b>Postcode:</b> ${esc(d.postcode)}<br>
       <b>Service:</b> ${esc(d.service)}</p>
    <p><b>Message:</b><br>${esc(d.message || '(none)').replace(/\n/g,'<br>')}</p>
    <hr>
    <p style="color:#64748b;font-size:12px">Submitted via omnishine.co.uk at ${new Date().toISOString()}. Reply directly to this email to respond to the customer.</p>`;

  const userHtml = `
    <h2>Thanks ${esc(d.name.split(' ')[0])} — we got your quote request</h2>
    <p>We'll reply during our opening hours (Mon–Fri 5pm–9pm, Sat–Sun 8am–9pm), usually within 2 working hours.</p>
    <p><b>Your submission</b><br>
       Postcode: ${esc(d.postcode)}<br>
       Service: ${esc(d.service)}<br>
       Message: ${esc(d.message || '(none)')}</p>
    <p>If anything needs correcting, just reply to this email.</p>
    <p>— Sangita, Omni Shine Cleaning</p>`;

  // Fire both emails; if the first fails we still attempt the second
  const teamRes = await sendEmail(env,
    ['info@omnishine.co.uk'],
    ['sangitachavda11@gmail.com', d.email],
    `New quote request: ${d.service} — ${d.postcode}`,
    teamHtml,
    d.email,
  );
  const userRes = await sendEmail(env,
    [d.email], [],
    `We've got your Omni Shine quote request`,
    userHtml,
  );

  if (!teamRes.ok && !userRes.ok) {
    return Response.json({ error: 'Could not send. Please email info@omnishine.co.uk directly.' }, { status: 502 });
  }
  return Response.json({ ok: true });
};
```

- [ ] **Step 15.3: Local test plan (notes; will run once Resend + Turnstile configured in Task 17)**

- Use Cloudflare Pages test sitekey `1x00000000000000000000AA` + secret `1x0000000000000000000000000000000AA` to always-pass Turnstile locally.
- `npx wrangler pages dev dist` after build, POST a form to `/api/quote`.

- [ ] **Step 15.4: Commit**

```bash
git add functions .env.example
git commit -m "feat: /api/quote Cloudflare Pages Function with Turnstile + Resend"
```

---

## Task 16: Build, verify, fix any issues

- [ ] **Step 16.1: Run full build**

```bash
cd /Users/yogi/omnishine
npm run build
```
Expected: build succeeds, `dist/` contains all 21 HTML files + sitemap.

- [ ] **Step 16.2: Preview + manual QA checklist**

```bash
npm run preview
```

Click through each route. For each, verify:
- [ ] One H1, correct text
- [ ] `<title>` correct (DevTools → Elements → head)
- [ ] Meta description correct, single
- [ ] `og:locale = en_GB`, canonical correct
- [ ] View-source: exactly one `LocalBusiness` schema site-wide (homepage); per-page schemas present
- [ ] No "Fully Insured", "Registered in England", or fake aggregateRating anywhere
- [ ] Nav → all 21 routes reachable, no 404
- [ ] Mobile sticky CTA visible, doesn't cover content
- [ ] Form renders Turnstile widget (will 400 until secrets set)
- [ ] Footer email links work, social omitted

- [ ] **Step 16.3: Run Lighthouse (local)**

```bash
npx lighthouse http://localhost:4321/ --preset=desktop --output=html --output-path=./dist-audit-desktop.html
npx lighthouse http://localhost:4321/ --output=html --output-path=./dist-audit-mobile.html
```

Expected: Performance ≥ 98, Accessibility ≥ 100, Best Practices ≥ 100, SEO = 100.

Fix any issue flagged (e.g. LCP, image size, missing `lang`). Re-run.

- [ ] **Step 16.4: Commit audit reports (optional)**

```bash
git add -A && git commit -m "chore: Lighthouse audit snapshots" --allow-empty
```

---

## Task 17: Deploy to Cloudflare Pages + DNS cutover

- [ ] **Step 17.1: Create public GitHub repo `omnishine-website`, push**

```bash
gh repo create omnishine-website --public --source=. --push
```

- [ ] **Step 17.2: In Cloudflare Dashboard (manual, owner consent required)**

Steps (document for owner):
1. Cloudflare → Pages → Create a project → Connect to Git → select `omnishine-website`.
2. Build command: `npm run build`. Output: `dist`. Framework: `Astro`.
3. Environment variables → add: `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`, `FROM_EMAIL`, `PUBLIC_TURNSTILE_SITEKEY`.
4. Deploy. First deploy gets a `*.pages.dev` URL.
5. Custom domains → Set up → `omnishine.co.uk` and `www.omnishine.co.uk`. Follow the nameserver/CNAME instructions Cloudflare prints.
6. Cloudflare Turnstile → Create a widget for `omnishine.co.uk`. Paste sitekey into `PUBLIC_TURNSTILE_SITEKEY`, secret into `TURNSTILE_SECRET_KEY`.
7. Resend → Domains → Add `omnishine.co.uk`, verify DKIM/SPF records. Create an API key, paste into `RESEND_API_KEY`.
8. Cloudflare Web Analytics → Add site `omnishine.co.uk`, copy token, replace `TO_BE_SET` in `src/layouts/Base.astro`, commit, push.
9. Redeploy.

- [ ] **Step 17.3: Post-cutover smoke tests (from owner's browser)**

- Hit `https://omnishine.co.uk/` — new site loads.
- Submit form with a real email. Verify:
  - `info@omnishine.co.uk` receives the team email (with Bcc to sangitachavda11@gmail.com and submitter).
  - Submitter inbox receives the auto-reply.
- Run: `curl -I https://omnishine.co.uk/sitemap-index.xml` — 200 OK.
- Open `https://search.google.com/test/rich-results?url=https://omnishine.co.uk/` — LocalBusiness valid, no errors.
- Open `https://search.google.com/test/rich-results?url=https://omnishine.co.uk/faq/` — FAQPage valid.
- Run mobile + desktop PageSpeed Insights — expect ≥ 98 perf both.

- [ ] **Step 17.4: Google Search Console**

- Add property `https://omnishine.co.uk` (domain verification via Cloudflare TXT).
- Submit `https://omnishine.co.uk/sitemap-index.xml`.
- Request indexing on homepage, pricing, FAQ.

- [ ] **Step 17.5: 301 redirects from old WordPress slugs**

In Cloudflare Pages → Bulk Redirects (or `public/_redirects`):
```
/end-of-tenancy-cleaning-oldham/   /services/end-of-tenancy-cleaning-oldham/   301
/commercial-cleaning-oldham/       /services/commercial-cleaning-oldham/       301
/deep-cleaning-oldham/             /services/deep-cleaning-oldham/             301
/domestic-cleaning-oldham/         /services/domestic-cleaning-oldham/         301
/areas-we-serve/                   /areas/                                     301
/about-omni-shine-cleaning-services/ /about/                                   301
/2026/01/19/hello-world/           /                                           301
```

Add to `public/_redirects`, commit, push.

- [ ] **Step 17.6: Final commit + tag**

```bash
git add public/_redirects src/layouts/Base.astro
git commit -m "chore: 301s from old WP slugs; wire CF Analytics token"
git tag v1.0.0
git push --tags
```

---

## Task 18: Operations doc

**Files:**
- Create: `docs/OPERATIONS.md`

- [ ] **Step 18.1: Write `docs/OPERATIONS.md`**

```markdown
# OmniShine site — operations

## Edit page copy
All pages are Astro files under `src/pages/`. Edit, commit, push — live in ~30 seconds.

## Add a review
1. Open `src/content/reviews.ts`.
2. Add a new object with `status: 'pending'`.
3. When the reviewer has confirmed the exact wording, flip `status` to `'approved'`.
4. Commit + push. Approved reviews render on the homepage and feed review schema.

## Change a price
Edit `src/content/site.ts`, `services` array. Every page picks it up automatically — homepage, pricing page, service pages, schema, llms.txt (regenerate llms.txt manually if prices change).

## Change opening hours
`src/content/site.ts` → `hours`. Propagates to footer, contact page, FAQ, and schema.

## Add an area
Append to `areas` in `src/content/site.ts` and create `src/pages/areas/<slug>.astro` using `shaw.astro` as a template. Update `_redirects` if there's an old URL.

## Rotate Resend / Turnstile keys
Cloudflare dashboard → Pages → omnishine-website → Settings → Environment variables.

## Add social profiles
Edit `src/lib/schema.ts` → `localBusinessSchema` → `sameAs` array.
```

- [ ] **Step 18.2: Commit**

```bash
git add docs/OPERATIONS.md
git commit -m "docs: operations guide"
git push
```

---

## Self-review notes

- **Spec coverage:** all 17 spec sections mapped to tasks. Task 1–4 = stack + schema. Task 5–8 = components + form. Task 9–13 = pages. Task 14 = robots/llms. Task 15 = function. Task 16 = verify. Task 17 = deploy. Task 18 = handoff.
- **Placeholder scan:** none. Every step has exact file paths and code.
- **Type consistency:** `site.services[]`, `site.areas[]`, `faqs[]` used consistently. Schema builders reference `site` + `s` consistently.
- **Known gaps:** owner must provide Turnstile sitekey/secret, Resend API key, Cloudflare Analytics token, GitHub repo transfer acceptance, and review-text approval. These are noted in Task 17.
