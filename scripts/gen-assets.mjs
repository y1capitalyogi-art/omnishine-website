import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const pub = path.join(process.cwd(), 'public');
const svg = fs.readFileSync(path.join(pub, 'favicon.svg'));

await sharp(svg).resize(32, 32).png().toFile(path.join(pub, 'favicon-32.png'));
await sharp(svg).resize(192, 192).png().toFile(path.join(pub, 'favicon-192.png'));
await sharp(svg).resize(512, 512).png().toFile(path.join(pub, 'favicon-512.png'));
await sharp(svg).resize(180, 180).png().toFile(path.join(pub, 'apple-touch-icon.png'));

// OG social card 1200x630
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#172554"/>
      <stop offset="0.6" stop-color="#1e3a8a"/>
      <stop offset="1" stop-color="#1d4ed8"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#fde68a" stop-opacity="0.6"/>
      <stop offset="1" stop-color="#fbbf24" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="star" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#fde68a"/>
      <stop offset="1" stop-color="#fbbf24"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="960" cy="170" r="280" fill="url(#glow)"/>
  <g transform="translate(600 240)">
    <path d="M0 -100 L25 -30 L95 -20 L40 25 L55 95 L0 55 L-55 95 L-40 25 L-95 -20 L-25 -30 Z"
          fill="url(#star)" stroke="#d97706" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="0" cy="0" r="14" fill="#ffffff"/>
  </g>
  <text x="600" y="460" font-family="Georgia, serif" font-size="86" font-weight="700" fill="#ffffff" text-anchor="middle" letter-spacing="-2">Omni Shine</text>
  <text x="600" y="510" font-family="Arial, sans-serif" font-size="28" fill="#fbbf24" text-anchor="middle" letter-spacing="1">PROFESSIONAL CLEANING · OLDHAM</text>
  <text x="600" y="570" font-family="Arial, sans-serif" font-size="22" fill="#e2e8f0" text-anchor="middle">omnishine.co.uk · Family-run · Eco-friendly · Weekends included</text>
</svg>`;
await sharp(Buffer.from(og)).png().toFile(path.join(pub, 'og-default.png'));

console.log('assets generated:');
for (const f of ['favicon-32.png','favicon-192.png','favicon-512.png','apple-touch-icon.png','og-default.png']) {
  const s = fs.statSync(path.join(pub, f));
  console.log(` - ${f} (${(s.size/1024).toFixed(1)} kB)`);
}
