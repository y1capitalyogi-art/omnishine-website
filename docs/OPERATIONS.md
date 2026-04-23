# Omni Shine site — operations guide

## How to edit page copy
All pages live under `src/pages/`. Edit the `.astro` file, commit, push — live in ~30 seconds (Cloudflare Pages rebuilds automatically).

## How to add a review
1. Open `src/content/reviews.ts`.
2. Add a new object with `status: 'pending'`.
3. Once the reviewer has confirmed the wording, flip `status` to `'approved'`.
4. Commit + push. Approved reviews render on the homepage and feed the `Review` schema automatically. Once ≥3 are approved, `AggregateRating` also populates.

## How to change a price
Edit `src/content/site.ts`, `services` array. Every page picks it up automatically — homepage, pricing page, service pages, and schema. Also regenerate `public/llms.txt` by editing it to match.

## How to change opening hours
`src/content/site.ts` → `hours`. Propagates to footer, contact page, FAQ, and schema.

## How to add an area
Append to `areas` in `src/content/site.ts` and (optionally) to `areaPages` for a dedicated page. Create `src/pages/areas/<slug>.astro` using `shaw.astro` as a template. Update `_redirects` if there's an old URL.

## How to rotate secrets
Cloudflare dashboard → Pages → `omnishine-website` → Settings → Environment variables.

## How to add social profiles
Edit `src/content/site.ts` → add URLs. Then update `src/lib/schema.ts` → `localBusinessSchema` → `sameAs` array to include them.

## How to verify deployment is healthy
- Hit `https://omnishine.co.uk/` — homepage loads.
- View source → confirm schema JSON-LD blocks.
- Submit test quote → confirm delivery to `info@omnishine.co.uk` and `sangitachavda11@gmail.com`.
- Run Lighthouse in Chrome DevTools — expect 100 SEO, ≥98 performance.
- Paste `https://omnishine.co.uk/faq/` into [Google Rich Results Test](https://search.google.com/test/rich-results).

## If the form stops working
1. Check Cloudflare Pages → Functions → `/api/quote` logs for errors.
2. Confirm `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`, `FROM_EMAIL` are set in Production env.
3. Confirm the Resend sending domain (`omnishine.co.uk`) still shows Verified.
4. Fall back: email directly to `info@omnishine.co.uk` while you fix.
