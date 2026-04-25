import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const pub = path.join(process.cwd(), 'public');
const svg = fs.readFileSync(path.join(pub, 'favicon.svg'));

// Favicons (PNG variants)
await sharp(svg).resize(32, 32).png({ compressionLevel: 9 }).toFile(path.join(pub, 'favicon-32.png'));
await sharp(svg).resize(192, 192).png({ compressionLevel: 9 }).toFile(path.join(pub, 'favicon-192.png'));
await sharp(svg).resize(512, 512).png({ compressionLevel: 9 }).toFile(path.join(pub, 'favicon-512.png'));
await sharp(svg).resize(180, 180).png({ compressionLevel: 9 }).toFile(path.join(pub, 'apple-touch-icon.png'));

// OG social card 1200x630, design language matches favicon
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0c1340"/>
      <stop offset="0.45" stop-color="#172554"/>
      <stop offset="1" stop-color="#1d4ed8"/>
    </linearGradient>
    <radialGradient id="halo" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#fde68a" stop-opacity="0.45"/>
      <stop offset="1" stop-color="#fbbf24" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="sparkle" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fef3c7"/>
      <stop offset="0.5" stop-color="#fbbf24"/>
      <stop offset="1" stop-color="#d97706"/>
    </linearGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>

  <!-- Decorative blobs -->
  <circle cx="980" cy="120" r="220" fill="url(#halo)"/>
  <circle cx="160" cy="540" r="180" fill="url(#halo)" opacity="0.6"/>

  <!-- Main sparkle group -->
  <g transform="translate(600 250)">
    <!-- Glow -->
    <circle cx="0" cy="0" r="160" fill="url(#halo)"/>
    <!-- Main 4-point shine -->
    <path d="M0 -130 L26 -26 L130 0 L26 26 L0 130 L-26 26 L-130 0 L-26 -26 Z"
          fill="url(#sparkle)"
          stroke="#92400e"
          stroke-width="2.5"
          stroke-linejoin="round"
          stroke-opacity="0.5"/>
    <!-- Constellation accents -->
    <path d="M150 -110 L156 -90 L176 -84 L156 -78 L150 -58 L144 -78 L124 -84 L144 -90 Z"
          fill="#fde68a" opacity="0.95"/>
    <path d="M-160 80 L-155 96 L-139 100 L-155 104 L-160 120 L-165 104 L-181 100 L-165 96 Z"
          fill="#fde68a" opacity="0.8"/>
    <circle cx="180" cy="50" r="6" fill="#fde68a" opacity="0.8"/>
    <circle cx="-130" cy="-100" r="4" fill="#fde68a" opacity="0.7"/>
  </g>

  <!-- Wordmark -->
  <text x="600" y="500" font-family="Georgia, 'Times New Roman', serif" font-size="92" font-weight="700" fill="#ffffff" text-anchor="middle" letter-spacing="-2">Omni Shine</text>
  <text x="600" y="546" font-family="Arial, Helvetica, sans-serif" font-size="26" letter-spacing="3" fill="#fbbf24" text-anchor="middle">PROFESSIONAL CLEANING · OLDHAM</text>
  <text x="600" y="588" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="#cbd5e1" text-anchor="middle">omnishine.co.uk · Family-run · Eco-friendly · Weekends included</text>
</svg>`;
await sharp(Buffer.from(og)).png({ compressionLevel: 9 }).toFile(path.join(pub, 'og-default.png'));

console.log('assets generated:');
for (const f of ['favicon-32.png','favicon-192.png','favicon-512.png','apple-touch-icon.png','og-default.png']) {
  const s = fs.statSync(path.join(pub, f));
  console.log(` - ${f} (${(s.size/1024).toFixed(1)} kB)`);
}
