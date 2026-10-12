import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const outputDir = path.resolve('public/assets/parts');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Base Ear SVG with outer helix on the RIGHT (x=125-135), canal / attachment on the LEFT (x=28-45)
// This is naturally the RIGHT EAR (on viewer's right / cheek on left).
const baseEarRightPath = `
  <path d="M 50 35 C 70 12, 115 15, 125 55 C 135 95, 115 145, 95 175 C 80 198, 55 205, 42 195 C 28 185, 30 155, 38 140 C 45 125, 40 100, 35 75 C 30 50, 40 40, 50 35 Z" fill="url(#earSkin)" stroke="#4E1F10" stroke-width="4.5" stroke-linejoin="round" />
  <path d="M 52 40 C 72 22, 105 25, 112 55 C 118 85, 105 130, 88 160 C 75 180, 55 185, 48 180" stroke="#CF7550" stroke-width="8" stroke-linecap="round" fill="none" opacity="0.8" />
  <path d="M 52 40 C 72 22, 105 25, 112 55 C 118 85, 105 130, 88 160 C 75 180, 55 185, 48 180" stroke="#4E1F10" stroke-width="3.5" stroke-linecap="round" fill="none" />
  <path d="M 55 85 C 65 70, 82 72, 85 90 C 88 110, 75 135, 58 135 C 48 135, 45 115, 48 100 Z" fill="url(#earCavity)" stroke="#4E1F10" stroke-width="3.5" />
  <path d="M 85 65 C 78 85, 78 110, 72 135 C 70 142, 60 148, 52 148" stroke="#4E1F10" stroke-width="3.5" stroke-linecap="round" fill="none" />
  <path d="M 85 65 C 92 75, 95 95, 88 120" stroke="#CF7550" stroke-width="5" stroke-linecap="round" fill="none" opacity="0.7" />
  <path d="M 40 102 C 48 106, 52 118, 48 126" stroke="#4E1F10" stroke-width="3" stroke-linecap="round" fill="none" />
  <path d="M 58 175 C 68 182, 75 180, 80 172" stroke="#4E1F10" stroke-width="3.5" stroke-linecap="round" fill="none" />
`;

// 1. Ear Left SVG (Viewer's Left Ear - outer rim curves OUTWARD to the left, canal faces right towards the head)
// Requires horizontal reflection scale(-1, 1) translate(-140, 0)
const earLeftSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 210" width="280" height="420" fill="none">
  <defs>
    <radialGradient id="earSkin_l" cx="45%" cy="40%" r="55%">
      <stop offset="0%" stop-color="#FED7C3" />
      <stop offset="70%" stop-color="#F8BA9A" />
      <stop offset="100%" stop-color="#E28965" />
    </radialGradient>
    <radialGradient id="earCavity_l" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#B34426" />
      <stop offset="100%" stop-color="#7E240F" />
    </radialGradient>
  </defs>
  <g transform="scale(-1, 1) translate(-140, 0)">
    ${baseEarRightPath.replace(/url\(#earSkin\)/g, 'url(#earSkin_l)').replace(/url\(#earCavity\)/g, 'url(#earCavity_l)')}
  </g>
</svg>`;

// 2. Ear Right SVG (Viewer's Right Ear - outer rim curves OUTWARD to the right, canal faces left towards the head)
// No reflection needed
const earRightSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 210" width="280" height="420" fill="none">
  <defs>
    <radialGradient id="earSkin_r" cx="45%" cy="40%" r="55%">
      <stop offset="0%" stop-color="#FED7C3" />
      <stop offset="70%" stop-color="#F8BA9A" />
      <stop offset="100%" stop-color="#E28965" />
    </radialGradient>
    <radialGradient id="earCavity_r" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#B34426" />
      <stop offset="100%" stop-color="#7E240F" />
    </radialGradient>
  </defs>
  <g>
    ${baseEarRightPath.replace(/url\(#earSkin\)/g, 'url(#earSkin_r)').replace(/url\(#earCavity\)/g, 'url(#earCavity_r)')}
  </g>
</svg>`;

// 3. Eye Left SVG
const eyeLeftSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 180" width="440" height="360" fill="none">
  <defs>
    <radialGradient id="blueIrisGrad_l" cx="45%" cy="40%" r="55%">
      <stop offset="0%" stop-color="#45B6EF" />
      <stop offset="55%" stop-color="#2185C5" />
      <stop offset="90%" stop-color="#115482" />
      <stop offset="100%" stop-color="#0A3655" />
    </radialGradient>
  </defs>
  <path d="M 32 92 C 40 48, 85 28, 125 28 C 165 28, 195 55, 202 92 C 185 62, 155 52, 125 52 C 90 52, 50 65, 32 92 Z" fill="#FDE6D2" stroke="#421F11" stroke-width="3.5" />
  <path d="M 62 48 L 60 70" stroke="#421F11" stroke-width="2.5" />
  <path d="M 85 36 L 85 58" stroke="#421F11" stroke-width="2.5" />
  <path d="M 108 30 L 108 53" stroke="#421F11" stroke-width="2.5" />
  <path d="M 132 30 L 132 53" stroke="#421F11" stroke-width="2.5" />
  <path d="M 155 38 L 153 60" stroke="#421F11" stroke-width="2.5" />
  <path d="M 178 50 L 175 72" stroke="#421F11" stroke-width="2.5" />

  <path d="M 45 68 C 25 58, 10 65, 5 70" stroke="#111827" stroke-width="4" stroke-linecap="round" />
  <path d="M 60 48 C 45 35, 30 40, 20 48" stroke="#111827" stroke-width="4.5" stroke-linecap="round" />
  <path d="M 85 35 C 75 18, 58 20, 48 30" stroke="#111827" stroke-width="4.5" stroke-linecap="round" />
  <path d="M 112 28 C 110 8, 92 10, 85 18" stroke="#111827" stroke-width="4.5" stroke-linecap="round" />
  <path d="M 138 29 C 145 10, 160 12, 165 22" stroke="#111827" stroke-width="4.5" stroke-linecap="round" />
  <path d="M 165 38 C 180 22, 195 28, 202 38" stroke="#111827" stroke-width="4.5" stroke-linecap="round" />
  <path d="M 188 55 C 205 45, 218 52, 222 65" stroke="#111827" stroke-width="4.5" stroke-linecap="round" />

  <path d="M 22 105 C 38 68, 85 58, 125 58 C 165 58, 200 78, 208 105 C 195 138, 155 145, 125 145 C 80 145, 35 135, 22 105 Z" fill="#FFFFFF" stroke="#421F11" stroke-width="4" />
  <ellipse cx="125" cy="104" rx="42" ry="42" fill="url(#blueIrisGrad_l)" />
  <circle cx="125" cy="104" r="41" stroke="#0E4268" stroke-width="2.5" />
  <circle cx="125" cy="104" r="30" stroke="#5ED0FF" stroke-width="2" opacity="0.6" />
  <circle cx="125" cy="104" r="22" fill="#0A0F14" />
  <circle cx="114" cy="94" r="9" fill="#FFFFFF" />
  <circle cx="138" cy="116" r="4.5" fill="#FFFFFF" />
  <path d="M 22 105 C 38 68, 85 58, 125 58 C 165 58, 200 78, 208 105" stroke="#111827" stroke-width="6" stroke-linecap="round" fill="none" />

  <path d="M 35 115 C 48 140, 85 156, 125 156 C 165 156, 195 140, 202 115 C 190 138, 155 145, 125 145 C 85 145, 45 135, 35 115 Z" fill="#FDE6D2" stroke="#421F11" stroke-width="3.5" />
  <path d="M 65 125 L 67 142" stroke="#421F11" stroke-width="2.5" />
  <path d="M 88 132 L 90 150" stroke="#421F11" stroke-width="2.5" />
  <path d="M 112 135 L 112 155" stroke="#421F11" stroke-width="2.5" />
  <path d="M 138 135 L 138 155" stroke="#421F11" stroke-width="2.5" />
  <path d="M 162 132 L 160 150" stroke="#421F11" stroke-width="2.5" />
  <path d="M 182 125 L 180 142" stroke="#421F11" stroke-width="2.5" />

  <path d="M 45 132 L 38 145" stroke="#111827" stroke-width="3.5" stroke-linecap="round" />
  <path d="M 70 145 L 65 160" stroke="#111827" stroke-width="3.5" stroke-linecap="round" />
  <path d="M 95 152 L 92 168" stroke="#111827" stroke-width="3.5" stroke-linecap="round" />
  <path d="M 125 156 L 125 174" stroke="#111827" stroke-width="3.5" stroke-linecap="round" />
  <path d="M 155 152 L 158 168" stroke="#111827" stroke-width="3.5" stroke-linecap="round" />
  <path d="M 180 145 L 185 160" stroke="#111827" stroke-width="3.5" stroke-linecap="round" />
  <path d="M 200 132 L 208 145" stroke="#111827" stroke-width="3.5" stroke-linecap="round" />
</svg>`;

// 4. Eye Right SVG
const eyeRightSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 180" width="440" height="360" fill="none">
  <defs>
    <radialGradient id="blueIrisGrad_r" cx="45%" cy="40%" r="55%">
      <stop offset="0%" stop-color="#45B6EF" />
      <stop offset="55%" stop-color="#2185C5" />
      <stop offset="90%" stop-color="#115482" />
      <stop offset="100%" stop-color="#0A3655" />
    </radialGradient>
  </defs>
  <g transform="scale(-1, 1) translate(-220, 0)">
    <path d="M 32 92 C 40 48, 85 28, 125 28 C 165 28, 195 55, 202 92 C 185 62, 155 52, 125 52 C 90 52, 50 65, 32 92 Z" fill="#FDE6D2" stroke="#421F11" stroke-width="3.5" />
    <path d="M 62 48 L 60 70" stroke="#421F11" stroke-width="2.5" />
    <path d="M 85 36 L 85 58" stroke="#421F11" stroke-width="2.5" />
    <path d="M 108 30 L 108 53" stroke="#421F11" stroke-width="2.5" />
    <path d="M 132 30 L 132 53" stroke="#421F11" stroke-width="2.5" />
    <path d="M 155 38 L 153 60" stroke="#421F11" stroke-width="2.5" />
    <path d="M 178 50 L 175 72" stroke="#421F11" stroke-width="2.5" />

    <path d="M 45 68 C 25 58, 10 65, 5 70" stroke="#111827" stroke-width="4" stroke-linecap="round" />
    <path d="M 60 48 C 45 35, 30 40, 20 48" stroke="#111827" stroke-width="4.5" stroke-linecap="round" />
    <path d="M 85 35 C 75 18, 58 20, 48 30" stroke="#111827" stroke-width="4.5" stroke-linecap="round" />
    <path d="M 112 28 C 110 8, 92 10, 85 18" stroke="#111827" stroke-width="4.5" stroke-linecap="round" />
    <path d="M 138 29 C 145 10, 160 12, 165 22" stroke="#111827" stroke-width="4.5" stroke-linecap="round" />
    <path d="M 165 38 C 180 22, 195 28, 202 38" stroke="#111827" stroke-width="4.5" stroke-linecap="round" />
    <path d="M 188 55 C 205 45, 218 52, 222 65" stroke="#111827" stroke-width="4.5" stroke-linecap="round" />

    <path d="M 22 105 C 38 68, 85 58, 125 58 C 165 58, 200 78, 208 105 C 195 138, 155 145, 125 145 C 80 145, 35 135, 22 105 Z" fill="#FFFFFF" stroke="#421F11" stroke-width="4" />
    <ellipse cx="125" cy="104" rx="42" ry="42" fill="url(#blueIrisGrad_r)" />
    <circle cx="125" cy="104" r="41" stroke="#0E4268" stroke-width="2.5" />
    <circle cx="125" cy="104" r="30" stroke="#5ED0FF" stroke-width="2" opacity="0.6" />
    <circle cx="125" cy="104" r="22" fill="#0A0F14" />
    <circle cx="114" cy="94" r="9" fill="#FFFFFF" />
    <circle cx="138" cy="116" r="4.5" fill="#FFFFFF" />
    <path d="M 22 105 C 38 68, 85 58, 125 58 C 165 58, 200 78, 208 105" stroke="#111827" stroke-width="6" stroke-linecap="round" fill="none" />

    <path d="M 35 115 C 48 140, 85 156, 125 156 C 165 156, 195 140, 202 115 C 190 138, 155 145, 125 145 C 85 145, 45 135, 35 115 Z" fill="#FDE6D2" stroke="#421F11" stroke-width="3.5" />
    <path d="M 65 125 L 67 142" stroke="#421F11" stroke-width="2.5" />
    <path d="M 88 132 L 90 150" stroke="#421F11" stroke-width="2.5" />
    <path d="M 112 135 L 112 155" stroke="#421F11" stroke-width="2.5" />
    <path d="M 138 135 L 138 155" stroke="#421F11" stroke-width="2.5" />
    <path d="M 162 132 L 160 150" stroke="#421F11" stroke-width="2.5" />
    <path d="M 182 125 L 180 142" stroke="#421F11" stroke-width="2.5" />

    <path d="M 45 132 L 38 145" stroke="#111827" stroke-width="3.5" stroke-linecap="round" />
    <path d="M 70 145 L 65 160" stroke="#111827" stroke-width="3.5" stroke-linecap="round" />
    <path d="M 95 152 L 92 168" stroke="#111827" stroke-width="3.5" stroke-linecap="round" />
    <path d="M 125 156 L 125 174" stroke="#111827" stroke-width="3.5" stroke-linecap="round" />
    <path d="M 155 152 L 158 168" stroke="#111827" stroke-width="3.5" stroke-linecap="round" />
    <path d="M 180 145 L 185 160" stroke="#111827" stroke-width="3.5" stroke-linecap="round" />
    <path d="M 200 132 L 208 145" stroke="#111827" stroke-width="3.5" stroke-linecap="round" />
  </g>
</svg>`;

// 5. Nose SVG
const noseSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 170" width="300" height="340" fill="none">
  <defs>
    <radialGradient id="noseSkinGrad_f" cx="50%" cy="60%" r="50%">
      <stop offset="0%" stop-color="#FED7C3" />
      <stop offset="65%" stop-color="#F7B290" />
      <stop offset="100%" stop-color="#E08660" />
    </radialGradient>
    <linearGradient id="noseBridgeGrad_f" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FED7C3" />
      <stop offset="100%" stop-color="#F5A884" />
    </linearGradient>
  </defs>
  <path d="M 58 10 L 92 10 L 96 90 L 54 90 Z" fill="url(#noseBridgeGrad_f)" />
  <path d="M 58 10 C 58 45, 52 75, 45 105" stroke="#4E1F10" stroke-width="3.5" stroke-linecap="round" fill="none" />
  <path d="M 92 10 C 92 45, 98 75, 105 105" stroke="#4E1F10" stroke-width="3.5" stroke-linecap="round" fill="none" />
  <path d="M 45 105 C 22 105, 18 140, 45 148 C 58 148, 62 135, 55 115 Z" fill="url(#noseSkinGrad_f)" stroke="#4E1F10" stroke-width="3.5" />
  <path d="M 105 105 C 128 105, 132 140, 105 148 C 92 148, 88 135, 95 115 Z" fill="url(#noseSkinGrad_f)" stroke="#4E1F10" stroke-width="3.5" />
  <path d="M 45 105 C 45 80, 105 80, 105 105 C 105 135, 92 152, 75 152 C 58 152, 45 135, 45 105 Z" fill="url(#noseSkinGrad_f)" stroke="#4E1F10" stroke-width="3.5" />
  <ellipse cx="75" cy="118" rx="10" ry="14" fill="#FFFFFF" opacity="0.65" />
  <path d="M 46 138 C 50 145, 62 145, 66 138 C 66 134, 52 134, 46 138 Z" fill="#652412" stroke="#4E1F10" stroke-width="2.5" />
  <path d="M 84 138 C 88 145, 100 145, 104 138 C 104 134, 90 134, 84 138 Z" fill="#652412" stroke="#4E1F10" stroke-width="2.5" />
  <path d="M 40 142 Q 75 160 110 142" stroke="#4E1F10" stroke-width="3.5" stroke-linecap="round" fill="none" />
</svg>`;

// 6. Mouth SVG
const mouthSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="480" height="280" fill="none">
  <defs>
    <radialGradient id="lipGrad_f" cx="50%" cy="40%" r="55%">
      <stop offset="0%" stop-color="#FFA692" />
      <stop offset="60%" stop-color="#F87960" />
      <stop offset="100%" stop-color="#DE4F38" />
    </radialGradient>
    <linearGradient id="cavityGrad_f" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#6C1420" />
      <stop offset="100%" stop-color="#450811" />
    </linearGradient>
  </defs>
  <path d="M 22 55 Q 120 40 218 55 Q 215 110 120 110 Q 25 110 22 55 Z" fill="url(#cavityGrad_f)" />
  <path d="M 55 90 Q 120 70 185 90 Q 170 110 120 110 Q 70 110 55 90 Z" fill="#F47285" />
  <g id="upper-teeth">
    <path d="M 38 52 Q 120 42 202 52 Q 195 72 120 74 Q 45 72 38 52 Z" fill="#FFFFFF" stroke="#E5E7EB" stroke-width="1.5" />
    <path d="M 68 50 L 67 67" stroke="#D1D5DB" stroke-width="2" stroke-linecap="round" />
    <path d="M 94 48 L 93 72" stroke="#D1D5DB" stroke-width="2" stroke-linecap="round" />
    <path d="M 120 47 L 120 74" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" />
    <path d="M 146 48 L 147 72" stroke="#D1D5DB" stroke-width="2" stroke-linecap="round" />
    <path d="M 172 50 L 173 67" stroke="#D1D5DB" stroke-width="2" stroke-linecap="round" />
  </g>
  <path d="M 18 55 C 40 38, 70 30, 95 34 C 110 37, 120 45, 120 45 C 120 45, 130 37, 145 34 C 170 30, 200 38, 222 55 C 190 44, 150 48, 120 52 C 90 48, 50 44, 18 55 Z" fill="url(#lipGrad_f)" stroke="#421008" stroke-width="3.5" stroke-linejoin="round" />
  <path d="M 18 55 C 35 90, 70 128, 120 128 C 170 128, 205 90, 222 55 C 195 95, 160 108, 120 108 C 80 108, 45 95, 18 55 Z" fill="url(#lipGrad_f)" stroke="#421008" stroke-width="3.5" stroke-linejoin="round" />
  <path d="M 75 114 Q 120 124 165 114" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" fill="none" opacity="0.85" />
  <path d="M 14 52 Q 22 56 26 62" stroke="#421008" stroke-width="3.5" stroke-linecap="round" />
  <path d="M 226 52 Q 218 56 214 62" stroke="#421008" stroke-width="3.5" stroke-linecap="round" />
</svg>`;

// 7. Eyes Pair SVG (Left eye on left, Right eye on right)
const eyesPairSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 180" width="920" height="360" fill="none">
  <g transform="translate(0, 0)">
    ${eyeLeftSvg.replace('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 180" width="440" height="360" fill="none">', '').replace('</svg>', '')}
  </g>
  <g transform="translate(240, 0)">
    ${eyeRightSvg.replace('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 180" width="440" height="360" fill="none">', '').replace('</svg>', '')}
  </g>
</svg>`;

// 8. Ears Pair SVG (Left ear curves outward to the left, Right ear curves outward to the right)
// Wide layout: width 640, height 210. Left ear: 0..140, Right ear: 500..640. Head fits between 140..500!
const earsPairSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 210" width="640" height="210" fill="none">
  <defs>
    <radialGradient id="earSkin_pair_l" cx="45%" cy="40%" r="55%">
      <stop offset="0%" stop-color="#FED7C3" />
      <stop offset="70%" stop-color="#F8BA9A" />
      <stop offset="100%" stop-color="#E28965" />
    </radialGradient>
    <radialGradient id="earCavity_pair_l" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#B34426" />
      <stop offset="100%" stop-color="#7E240F" />
    </radialGradient>
    <radialGradient id="earSkin_pair_r" cx="45%" cy="40%" r="55%">
      <stop offset="0%" stop-color="#FED7C3" />
      <stop offset="70%" stop-color="#F8BA9A" />
      <stop offset="100%" stop-color="#E28965" />
    </radialGradient>
    <radialGradient id="earCavity_pair_r" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#B34426" />
      <stop offset="100%" stop-color="#7E240F" />
    </radialGradient>
  </defs>
  <!-- Left Ear: curves outward to the left -->
  <g transform="translate(0, 0)">
    <g transform="scale(-1, 1) translate(-140, 0)">
      ${baseEarRightPath.replace(/url\(#earSkin\)/g, 'url(#earSkin_pair_l)').replace(/url\(#earCavity\)/g, 'url(#earCavity_pair_l)')}
    </g>
  </g>
  <!-- Right Ear: curves outward to the right -->
  <g transform="translate(500, 0)">
    ${baseEarRightPath.replace(/url\(#earSkin\)/g, 'url(#earSkin_pair_r)').replace(/url\(#earCavity\)/g, 'url(#earCavity_pair_r)')}
  </g>
</svg>`;

const parts = [
  { name: 'ear_left', svg: earLeftSvg, width: 280, height: 420 },
  { name: 'ear_right', svg: earRightSvg, width: 280, height: 420 },
  { name: 'eye_left', svg: eyeLeftSvg, width: 440, height: 360 },
  { name: 'eye_right', svg: eyeRightSvg, width: 440, height: 360 },
  { name: 'nose', svg: noseSvg, width: 300, height: 340 },
  { name: 'mouth', svg: mouthSvg, width: 480, height: 280 },
  { name: 'eyes_pair', svg: eyesPairSvg, width: 920, height: 360 },
  { name: 'ears_pair', svg: earsPairSvg, width: 640, height: 210 },
];

async function generate() {
  for (const part of parts) {
    const svgPath = path.join(outputDir, `${part.name}.svg`);
    const pngPath = path.join(outputDir, `${part.name}.png`);
    fs.writeFileSync(svgPath, part.svg.trim());
    console.log(`Saved ${svgPath}`);

    try {
      await sharp(Buffer.from(part.svg.trim()))
        .png({ compressionLevel: 9 })
        .toFile(pngPath);
      console.log(`Generated transparent PNG: ${pngPath}`);
    } catch (err) {
      console.error(`Failed to convert ${svgPath}:`, err.message);
    }
  }
  console.log('All parts generated successfully.');
}

generate();
