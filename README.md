# OmniShine.co.uk

Production source for [omnishine.co.uk](https://omnishine.co.uk). Astro 5 static site, deployed to Cloudflare Pages.

## Scripts
- `npm run dev` — local dev at `http://localhost:4321/`
- `npm run build` — static build to `./dist`
- `npm run preview` — serve the built site
- `npm run gen-assets` — regenerate favicons and OG image from `public/favicon.svg`
- `npm run typecheck` — run `astro check`

## Deploy
Pushes to `main` auto-deploy via Cloudflare Pages. Environment variables for the contact form live in the Pages dashboard; see `.env.example`.

## Operations
See [docs/OPERATIONS.md](docs/OPERATIONS.md) for day-to-day edits (prices, reviews, areas, hours).
