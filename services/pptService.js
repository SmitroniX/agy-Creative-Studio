const pptxgen = require('pptxgenjs');
const path = require('path');
const fs = require('fs');
const { runAgy, extractJSON } = require('./cli');

const THEMES = {
  modern_dark: {
    name: 'Modern Dark Tech',
    bg: '0F172A',
    text: 'F8FAFC',
    accent: '38BDF8',
    secondary: '94A3B8',
    cardBg: '1E293B',
    isDark: true
  },
  electric_violet: {
    name: 'Electric Violet',
    bg: '1E1B4B',
    text: 'FFFFFF',
    accent: 'C084FC',
    secondary: 'E9D5FF',
    cardBg: '312E81',
    isDark: true
  },
  emerald_growth: {
    name: 'Emerald Growth',
    bg: '064E3B',
    text: 'ECFDF5',
    accent: '34D399',
    secondary: 'A7F3D0',
    cardBg: '065F46',
    isDark: true
  },
  corporate_blue: {
    name: 'Corporate Executive',
    bg: 'F8FAFC',
    text: '0F172A',
    accent: '2563EB',
    secondary: '64748B',
    cardBg: 'FFFFFF',
    isDark: false
  },
  minimal_mono: {
    name: 'Minimal Luxury',
    bg: 'FFFFFF',
    text: '18181B',
    accent: 'E11D48',
    secondary: '71717A',
    cardBg: 'F4F4F5',
    isDark: false
  }
};

async function generateSlideDeckContent(prompt, slideCount = 5, model = 'gemini-3.8-flash-low', requestedTheme = 'modern_dark') {
  const systemPrompt = `You are a world-class creative presentation designer. 
Generate a comprehensive, highly compelling slide deck for the topic: "${prompt}".
The presentation must have exactly ${slideCount} slides.
Choose appropriate slide layouts across: 'title', 'bullets', 'stats', 'timeline', 'quote', 'conclusion'.

Output ONLY valid JSON matching this schema:
{
  "title": "Main Presentation Title",
  "subtitle": "Subtitle or tagline",
  "theme": "${requestedTheme}",
  "slides": [
    {
      "slideNumber": 1,
      "layout": "title",
      "title": "Main Title",
      "subtitle": "Subtitle",
      "presenter": "Presenter Name / Team",
      "notes": "Speaker notes"
    },
    {
      "slideNumber": 2,
      "layout": "bullets",
      "title": "Problem Statement",
      "subtitle": "Why this matters now",
      "cards": [
        { "title": "Pain Point 1", "desc": "Detailed description of the issue." },
        { "title": "Pain Point 2", "desc": "Detailed description of the issue." },
        { "title": "Pain Point 3", "desc": "Detailed description of the issue." }
      ],
      "notes": "Speaker notes"
    },
    {
      "slideNumber": 3,
      "layout": "stats",
      "title": "Market Opportunity & Impact",
      "subtitle": "By the numbers",
      "stats": [
        { "value": "10x", "label": "Productivity Increase" },
        { "value": "$4.5B", "label": "Market TAM by 2028" },
        { "value": "87%", "label": "Adoption Rate" }
      ],
      "notes": "Speaker notes"
    }
  ]
}`;

  try {
    const rawResponse = await runAgy(systemPrompt, model);
    const parsed = extractJSON(rawResponse);
    if (parsed && Array.isArray(parsed.slides) && parsed.slides.length > 0) {
      return parsed;
    }
    throw new Error('Incomplete slide structure returned');
  } catch (err) {
    console.warn('Using intelligent fallback slide generator due to CLI error:', err.message);
    return getFallbackDeck(prompt, slideCount, requestedTheme);
  }
}

function getFallbackDeck(prompt, slideCount, theme) {
  const slides = [
    {
      slideNumber: 1,
      layout: 'title',
      title: prompt,
      subtitle: 'Executive Presentation & Strategic Roadmap',
      presenter: 'Creative Studio AI',
      notes: 'Welcome audience and set the stage.'
    },
    {
      slideNumber: 2,
      layout: 'bullets',
      title: 'Current Landscape & Core Challenges',
      subtitle: 'Identifying key friction points and untapped opportunities',
      cards: [
        { title: 'Market Complexity', desc: 'Rapidly shifting user expectations demand innovative, high-impact solutions.' },
        { title: 'Operational Friction', desc: 'Legacy workflows slow execution and inflate resource overhead.' },
        { title: 'Quality at Scale', desc: 'Maintaining pristine aesthetic design while meeting aggressive timelines.' }
      ],
      notes: 'Walk through existing bottlenecks.'
    },
    {
      slideNumber: 3,
      layout: 'stats',
      title: 'Strategic Impact & Key Metrics',
      subtitle: 'Quantifiable benchmarks driving exponential growth',
      stats: [
        { value: '4.8x', label: 'Velocity Acceleration' },
        { value: '94%', label: 'User Satisfaction' },
        { value: '$2.1M', label: 'Projected Annual Savings' }
      ],
      notes: 'Highlight core numerical indicators.'
    },
    {
      slideNumber: 4,
      layout: 'timeline',
      title: 'Implementation Roadmap',
      subtitle: 'From inception to global deployment',
      cards: [
        { title: 'Phase 1: Foundation', desc: 'Architecture validation and stakeholder alignment.' },
        { title: 'Phase 2: Acceleration', desc: 'Feature deployment and automated integration.' },
        { title: 'Phase 3: Scale & Optimize', desc: 'Performance tuning and enterprise expansion.' }
      ],
      notes: 'Detail chronological milestones.'
    },
    {
      slideNumber: 5,
      layout: 'conclusion',
      title: 'Vision & Next Steps',
      subtitle: 'Turning strategic insight into immediate execution',
      cards: [
        { title: 'Immediate Alignment', desc: 'Finalize scope and technical prerequisites.' },
        { title: 'Execution Kickoff', desc: 'Deploy automated workflows and iterate continuously.' }
      ],
      notes: 'Open floor for questions and commit to action items.'
    }
  ];

  return {
    title: prompt,
    subtitle: 'Strategic Presentation Deck',
    theme: theme || 'modern_dark',
    slides: slides.slice(0, Math.max(3, slideCount))
  };
}

async function compilePptx(deckData, outputPath) {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9';

  const themeKey = deckData.theme in THEMES ? deckData.theme : 'modern_dark';
  const th = THEMES[themeKey];

  pres.defineSlideMaster({
    title: 'STUDIO_MASTER',
    background: { color: th.bg }
  });

  for (const s of deckData.slides) {
    const slide = pres.addSlide({ masterName: 'STUDIO_MASTER' });

    // Decorative top accent line
    slide.addShape(pres.ShapeType.rect, {
      x: 0,
      y: 0,
      w: 13.33,
      h: 0.1,
      fill: { color: th.accent }
    });

    if (s.layout === 'title') {
      // Large Title Slide
      slide.addText(s.title || deckData.title, {
        x: 1.0,
        y: 2.2,
        w: 11.33,
        h: 2.0,
        fontSize: 44,
        bold: true,
        color: th.text,
        fontFace: 'Helvetica Neue',
        valign: 'middle'
      });

      if (s.subtitle) {
        slide.addText(s.subtitle, {
          x: 1.0,
          y: 4.2,
          w: 11.33,
          h: 1.0,
          fontSize: 22,
          color: th.accent,
          fontFace: 'Helvetica Neue'
        });
      }

      if (s.presenter) {
        slide.addText(s.presenter, {
          x: 1.0,
          y: 5.6,
          w: 8.0,
          h: 0.6,
          fontSize: 14,
          color: th.secondary,
          fontFace: 'Helvetica Neue'
        });
      }

      // Bottom badge
      slide.addShape(pres.ShapeType.roundRect, {
        x: 1.0,
        y: 6.4,
        w: 3.0,
        h: 0.45,
        rectRadius: 0.1,
        fill: { color: th.cardBg },
        line: { color: th.accent, width: 1 }
      });
      slide.addText('ANTIGRAVITY STUDIO', {
        x: 1.0,
        y: 6.4,
        w: 3.0,
        h: 0.45,
        fontSize: 11,
        bold: true,
        color: th.accent,
        align: 'center',
        valign: 'middle'
      });

    } else if (s.layout === 'stats' && Array.isArray(s.stats)) {
      // Header
      slide.addText(s.title, {
        x: 1.0,
        y: 0.8,
        w: 11.33,
        h: 0.8,
        fontSize: 32,
        bold: true,
        color: th.text
      });
      if (s.subtitle) {
        slide.addText(s.subtitle, {
          x: 1.0,
          y: 1.5,
          w: 11.33,
          h: 0.5,
          fontSize: 16,
          color: th.secondary
        });
      }

      // Metric cards
      const count = s.stats.length;
      const cardW = Math.min(3.4, 11.33 / count - 0.3);
      const gap = (11.33 - (cardW * count)) / (count - 1 || 1);

      s.stats.forEach((stat, i) => {
        const xPos = 1.0 + i * (cardW + gap);
        // Card background
        slide.addShape(pres.ShapeType.roundRect, {
          x: xPos,
          y: 2.6,
          w: cardW,
          h: 3.2,
          rectRadius: 0.2,
          fill: { color: th.cardBg },
          line: { color: th.accent, width: 1.5 }
        });

        // Stat value
        slide.addText(stat.value, {
          x: xPos,
          y: 3.0,
          w: cardW,
          h: 1.2,
          fontSize: 48,
          bold: true,
          color: th.accent,
          align: 'center',
          valign: 'middle'
        });

        // Stat label
        slide.addText(stat.label, {
          x: xPos + 0.2,
          y: 4.4,
          w: cardW - 0.4,
          h: 1.0,
          fontSize: 16,
          color: th.text,
          align: 'center',
          valign: 'top'
        });
      });

    } else {
      // Standard Cards / Bullets layout
      slide.addText(s.title, {
        x: 1.0,
        y: 0.8,
        w: 11.33,
        h: 0.8,
        fontSize: 32,
        bold: true,
        color: th.text
      });

      if (s.subtitle) {
        slide.addText(s.subtitle, {
          x: 1.0,
          y: 1.5,
          w: 11.33,
          h: 0.5,
          fontSize: 16,
          color: th.secondary
        });
      }

      const items = s.cards || (s.bullets ? s.bullets.map(b => ({ title: '', desc: b })) : []);
      const count = items.length || 1;
      const cardW = Math.min(3.5, 11.33 / count - 0.3);
      const gap = (11.33 - (cardW * count)) / Math.max(1, count - 1);

      items.forEach((item, i) => {
        const xPos = 1.0 + i * (cardW + gap);

        slide.addShape(pres.ShapeType.roundRect, {
          x: xPos,
          y: 2.4,
          w: cardW,
          h: 3.8,
          rectRadius: 0.15,
          fill: { color: th.cardBg },
          line: { color: th.accent, width: 1 }
        });

        // Item indicator badge
        slide.addShape(pres.ShapeType.roundRect, {
          x: xPos + 0.3,
          y: 2.7,
          w: 0.5,
          h: 0.5,
          rectRadius: 0.1,
          fill: { color: th.accent }
        });
        slide.addText(`${i + 1}`, {
          x: xPos + 0.3,
          y: 2.7,
          w: 0.5,
          h: 0.5,
          fontSize: 12,
          bold: true,
          color: th.bg,
          align: 'center',
          valign: 'middle'
        });

        if (item.title) {
          slide.addText(item.title, {
            x: xPos + 0.3,
            y: 3.4,
            w: cardW - 0.6,
            h: 0.8,
            fontSize: 18,
            bold: true,
            color: th.text
          });
        }

        if (item.desc) {
          slide.addText(item.desc, {
            x: xPos + 0.3,
            y: item.title ? 4.2 : 3.4,
            w: cardW - 0.6,
            h: 1.7,
            fontSize: 14,
            color: th.secondary
          });
        }
      });
    }

    // Slide footer
    slide.addText(`Slide ${s.slideNumber || ''} | Antigravity Studio`, {
      x: 1.0,
      y: 7.0,
      w: 11.33,
      h: 0.4,
      fontSize: 10,
      color: th.secondary
    });
  }

  await pres.writeFile({ fileName: outputPath });
  return outputPath;
}

module.exports = {
  THEMES,
  generateSlideDeckContent,
  compilePptx
};
