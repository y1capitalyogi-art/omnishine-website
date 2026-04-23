import { site, type Service } from '../content/site';
import { approvedReviews } from '../content/reviews';

const dayName: Record<string, string> = {
  Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday',
  Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday',
};

export function localBusinessSchema() {
  const reviews = approvedReviews();

  const base: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${site.url}/#business`,
    name: site.name,
    alternateName: site.shortName,
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
    geo: {
      '@type': 'GeoCoordinates',
      latitude: site.geo.lat,
      longitude: site.geo.lng,
    },
    areaServed: site.areas.map(a => ({ '@type': 'Place', name: a })),
    openingHoursSpecification: site.hours.map(h => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.days.map(d => dayName[d]),
      opens: h.open,
      closes: h.close,
    })),
    founder: { '@type': 'Person', name: site.founder },
    foundingDate: String(site.foundingYear),
    paymentAccepted: site.paymentsAccepted.join(', '),
    currenciesAccepted: 'GBP',
    knowsLanguage: 'en-GB',
    sameAs: [site.googleBusinessUrl],
  };

  if (reviews.length > 0) {
    base.review = reviews.map(r => ({
      '@type': 'Review',
      reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5 },
      author: { '@type': r.company ? 'Organization' : 'Person', name: r.author },
      datePublished: r.date,
      reviewBody: r.body,
    }));
  }

  if (reviews.length >= 3) {
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    base.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: avg.toFixed(1),
      reviewCount: reviews.length,
      bestRating: 5,
    };
  }

  return base;
}

export function serviceSchema(s: Service) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${site.url}/services/${s.slug}/#service`,
    name: s.name,
    description: s.blurb,
    provider: { '@id': `${site.url}/#business` },
    areaServed: site.areas.map(a => ({ '@type': 'Place', name: a })),
    serviceType: s.name,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'GBP',
      price: s.from,
      availability: 'https://schema.org/InStock',
      priceSpecification: {
        '@type': 'PriceSpecification',
        price: s.from,
        priceCurrency: 'GBP',
        description: s.unit,
      },
    },
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((x, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: x.name,
      item: x.url,
    })),
  };
}

export function faqSchema(qas: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: qas.map(qa => ({
      '@type': 'Question',
      name: qa.q,
      acceptedAnswer: { '@type': 'Answer', text: qa.a },
    })),
  };
}

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${site.url}/#org`,
    name: site.name,
    url: site.url,
    logo: `${site.url}/favicon.svg`,
    founder: { '@type': 'Person', name: site.founder },
    foundingDate: String(site.foundingYear),
    contactPoint: {
      '@type': 'ContactPoint',
      email: site.email,
      contactType: 'customer service',
      areaServed: 'GB',
      availableLanguage: 'en-GB',
    },
    sameAs: [site.googleBusinessUrl],
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${site.url}/#website`,
    url: site.url,
    name: site.name,
    inLanguage: 'en-GB',
    publisher: { '@id': `${site.url}/#org` },
  };
}
