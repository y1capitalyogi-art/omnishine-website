export const site = {
  name: 'Omni Shine Cleaning',
  shortName: 'OmniShine',
  tagline: 'Professional cleaning you can count on',
  heroHeadline: 'Professional Cleaning Services in Oldham',
  heroSub: 'Family-run cleaners serving Oldham, Saddleworth, Rochdale, Middleton, Ashton-under-Lyne and 12 more surrounding towns. Eco-friendly products, weekend availability, free quotes — no obligation.',
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
    { days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const, open: '17:00', close: '21:00' },
    { days: ['Sat', 'Sun'] as const, open: '08:00', close: '21:00' },
  ],
  areas: [
    'Oldham', 'Shaw', 'Royton', 'Chadderton', 'Failsworth', 'Lees', 'Uppermill',
    'Saddleworth', 'Springhead', 'Greenfield', 'Grotton', 'Moorside', 'Rochdale', 'Delph',
    'Middleton', 'Ashton-under-Lyne', 'Mossley',
  ] as const,
  services: [
    {
      slug: 'domestic-cleaning-oldham',
      name: 'Domestic Cleaning',
      short: 'Domestic',
      from: 18,
      unit: '/ hour',
      icon: 'home',
      blurb: 'Regular, one-off, spring and move-in cleans for homes across Oldham.',
    },
    {
      slug: 'commercial-cleaning-oldham',
      name: 'Commercial Cleaning',
      short: 'Commercial',
      from: 22,
      unit: '/ hour',
      icon: 'briefcase',
      blurb: 'Offices, retail and shared workspaces — evenings and weekends.',
    },
    {
      slug: 'deep-cleaning-oldham',
      name: 'Deep Cleaning',
      short: 'Deep',
      from: 150,
      unit: 'from',
      icon: 'sparkles',
      blurb: 'Top-to-bottom deep cleans — kitchens, bathrooms, carpets, windows.',
    },
    {
      slug: 'end-of-tenancy-cleaning-oldham',
      name: 'End of Tenancy',
      short: 'End of tenancy',
      from: 180,
      unit: 'from',
      icon: 'key',
      blurb: 'Deposit-back cleans that meet letting-agent standards.',
    },
    {
      slug: 'after-builders-cleaning-oldham',
      name: 'After Builders',
      short: 'After builders',
      from: 200,
      unit: 'from',
      icon: 'hard-hat',
      blurb: 'Dust, debris and residue removal after renovations and builds.',
    },
  ] as const,
  trustChips: ['Family-run', 'Oldham-based', 'Eco-friendly', 'Weekends included'] as const,
  paymentsAccepted: ['Bank transfer', 'Cash', 'Card', 'Stripe link'] as const,
  googleBusinessUrl: 'https://www.google.com/maps/place/Omni+Shine+Cleaning/data=!4m2!3m1!1s0x0:0x8b0c17c468c5a93c',
  // Areas that get dedicated pages (slug = lowercase with hyphens). Stays in sync with src/pages/areas/*.
  areaPages: [
    'Shaw', 'Royton', 'Chadderton', 'Saddleworth', 'Rochdale',
    'Failsworth', 'Lees', 'Uppermill', 'Springhead',
    'Greenfield', 'Grotton', 'Moorside', 'Delph',
    'Middleton', 'Ashton-under-Lyne', 'Mossley',
  ] as const,
  // Service × area combo pages — full slug under /services/
  serviceAreaCombos: [
    { slug: 'end-of-tenancy-cleaning-saddleworth', label: 'End of tenancy in Saddleworth' },
    { slug: 'end-of-tenancy-cleaning-rochdale', label: 'End of tenancy in Rochdale' },
    { slug: 'end-of-tenancy-cleaning-middleton', label: 'End of tenancy in Middleton' },
    { slug: 'domestic-cleaning-royton', label: 'Domestic cleaning in Royton' },
    { slug: 'deep-cleaning-saddleworth', label: 'Deep cleaning in Saddleworth' },
    { slug: 'commercial-cleaning-ashton-under-lyne', label: 'Commercial cleaning in Ashton-under-Lyne' },
  ] as const,
  // Cloudflare Turnstile public sitekey (safe to commit — public by design).
  // The matching secret lives in Cloudflare Pages env vars only.
  turnstileSitekey: '0x4AAAAAADDBzalRSeJq3Wu9',
} as const;

export type ServiceSlug = (typeof site.services)[number]['slug'];
export type Service = (typeof site.services)[number];
