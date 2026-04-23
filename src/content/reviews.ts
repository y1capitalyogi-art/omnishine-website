export type Review = {
  author: string;
  company?: string;
  location?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  date: string;
  body: string;
  status: 'approved' | 'pending';
};

// Owner must confirm the exact wording before flipping status to 'approved'.
// Only approved reviews are rendered on the site and wrapped in Review schema.
export const reviews: Review[] = [
  {
    author: 'Electiva Marketing Limited',
    company: 'Electiva Marketing Limited',
    location: 'Oldham',
    rating: 5,
    date: '2026-02-10',
    body: 'Sangita and the Omni Shine team have been looking after our office for months — reliable, thorough, and genuinely nice to deal with. Everything sparkles after every visit and nothing is ever out of place.',
    status: 'pending',
  },
];

export const approvedReviews = () => reviews.filter(r => r.status === 'approved');
