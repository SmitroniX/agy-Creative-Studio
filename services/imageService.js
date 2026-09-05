const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');
const { runAgy } = require('./cli');

const IMAGE_FORMATS = {
  banner: { width: 1200, height: 400, name: 'Social Banner (1200x400)' },
  square: { width: 1080, height: 1080, name: 'Square Post (1080x1080)' },
  poster: { width: 800, height: 1200, name: 'Creative Poster (800x1200)' },
  vector: { width: 800, height: 800, name: 'Vector Icon / Art (800x800)' }
};

async function generateSvgGraphic(prompt, formatKey = 'banner', model = 'gemini-3.8-flash-low') {
  const fmt = IMAGE_FORMATS[formatKey] || IMAGE_FORMATS.banner;

  const systemPrompt = `You are a world-renowned vector graphic artist and UI/UX designer.
Create a visually stunning, ultra-creative, production-ready SVG image for the prompt: "${prompt}".
Target Dimensions: width="${fmt.width}" height="${fmt.height}" viewBox="0 0 ${fmt.width} ${fmt.height}".

DESIGN REQUIREMENTS:
1. Return ONLY the raw valid <svg ...>...</svg> XML. Do NOT wrap in markdown code blocks. Do NOT include markdown explanations.
2. The design MUST be modern, visually rich, and vibrant:
   - Use multi-stop <linearGradient> and <radialGradient> definitions inside <defs>.
   - Include glowing backdrop meshes, sleek geometric shapes, layered depth, subtle drop shadows, or particle constellations.
   - For text: Use modern typography (Helvetica, Montserrat, Inter, system-ui), bold headings, high-contrast badges.
   - Clean spacing, balanced visual hierarchy, and professional aesthetics.`;

  try {
    let rawSvg = await runAgy(systemPrompt, model);
    rawSvg = rawSvg.replace(/^```(?:xml|svg)?\s*/i, '').replace(/```\s*$/i, '').trim();

    const start = rawSvg.indexOf('<svg');
    const end = rawSvg.lastIndexOf('</svg>');
    if (start !== -1 && end > start) {
      return rawSvg.slice(start, end + 6);
    }
    throw new Error('Incomplete SVG tag in CLI response');
  } catch (err) {
    console.warn('Using intelligent fallback SVG generator due to CLI error:', err.message);
    return getFallbackSvg(prompt, formatKey, fmt);
  }
}

function getFallbackSvg(prompt, formatKey, fmt) {
  const w = fmt.width;
  const h = fmt.height;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090d16" />
      <stop offset="40%" stop-color="#1e1b4b" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <linearGradient id="neonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#06b6d4" />
      <stop offset="50%" stop-color="#8b5cf6" />
      <stop offset="100%" stop-color="#ec4899" />
    </linearGradient>
    <radialGradient id="glowGlow" cx="70%" cy="30%" r="60%">
      <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0" />
    </radialGradient>
    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background -->
  <rect width="100%" height="100%" fill="url(#bgGrad)" />
  <rect width="100%" height="100%" fill="url(#glowGlow)" />

  <!-- Geometric Abstract Accents -->
  <circle cx="${w * 0.85}" cy="${h * 0.2}" r="${Math.min(w, h) * 0.3}" fill="none" stroke="url(#neonGrad)" stroke-width="2" stroke-dasharray="8 6" opacity="0.4" />
  <circle cx="${w * 0.85}" cy="${h * 0.2}" r="${Math.min(w, h) * 0.18}" fill="none" stroke="#06b6d4" stroke-width="1.5" opacity="0.6" />
  <rect x="${w * 0.08}" y="${h * 0.15}" width="80" height="4" rx="2" fill="url(#neonGrad)" />

  <!-- Badge -->
  <rect x="${w * 0.08}" y="${h * 0.25}" width="210" height="32" rx="16" fill="#1e293b" stroke="#334155" stroke-width="1" />
  <circle cx="${w * 0.08 + 16}" cy="${h * 0.25 + 16}" r="5" fill="#06b6d4" />
  <text x="${w * 0.08 + 32}" y="${h * 0.25 + 21}" fill="#94a3b8" font-family="-apple-system, system-ui, sans-serif" font-size="12" font-weight="700" letter-spacing="1">ANTIGRAVITY STUDIO</text>

  <!-- Title & Subtitle -->
  <text x="${w * 0.08}" y="${h * 0.5}" fill="#ffffff" font-family="-apple-system, system-ui, sans-serif" font-size="${Math.min(48, w * 0.045)}" font-weight="800" filter="url(#softGlow)">
    ${prompt.length > 35 ? prompt.slice(0, 35) + '...' : prompt}
  </text>
  <text x="${w * 0.08}" y="${h * 0.65}" fill="url(#neonGrad)" font-family="-apple-system, system-ui, sans-serif" font-size="${Math.min(24, w * 0.024)}" font-weight="600">
    Intelligent Creative Design &amp; Precision Rendering
  </text>
  <text x="${w * 0.08}" y="${h * 0.78}" fill="#94a3b8" font-family="-apple-system, system-ui, sans-serif" font-size="14">
    Crafted with Antigravity AI Engine • High Fidelity Vector Architecture
  </text>
</svg>`;
}

function compileSvgToPng(svgPath, pngPath) {
  return new Promise((resolve, reject) => {
    const args = ['-density', '200', svgPath, pngPath];
    execFile('/usr/bin/convert', args, (err) => {
      if (err) {
        console.warn('convert SVG to PNG failed:', err.message);
        return reject(err);
      }
      resolve(pngPath);
    });
  });
}

module.exports = {
  IMAGE_FORMATS,
  generateSvgGraphic,
  compileSvgToPng
};
