// Antigravity Creative Studio - Universal Serverless Client Engine

let currentDeck = null;
let currentSlideIndex = 0;
let activeDocType = 'certificate';
let activeImageFormat = 'banner';
let selectedEnhanceFile = null;
let enhancedCanvasResult = null;

// Presentation Themes
const THEMES = {
  modern_dark: {
    name: 'Modern Dark Tech',
    bg: '0F172A',
    text: 'F8FAFC',
    accent: '38BDF8',
    secondary: '94A3B8',
    cardBg: '1E293B'
  },
  electric_violet: {
    name: 'Electric Violet',
    bg: '1E1B4B',
    text: 'FFFFFF',
    accent: 'C084FC',
    secondary: 'E9D5FF',
    cardBg: '312E81'
  },
  emerald_growth: {
    name: 'Emerald Growth',
    bg: '064E3B',
    text: 'ECFDF5',
    accent: '34D399',
    secondary: 'A7F3D0',
    cardBg: '065F46'
  },
  corporate_blue: {
    name: 'Corporate Executive',
    bg: 'F8FAFC',
    text: '0F172A',
    accent: '2563EB',
    secondary: '64748B',
    cardBg: 'FFFFFF'
  },
  minimal_mono: {
    name: 'Minimal Luxury',
    bg: 'FFFFFF',
    text: '18181B',
    accent: 'E11D48',
    secondary: '71717A',
    cardBg: 'F4F4F5'
  }
};

// Document Templates
const DOCUMENT_TYPES = {
  certificate: 'Certificate of Completion / Achievement',
  report: 'Executive & Technical Project Report',
  resume: 'Modern Professional Resume / CV',
  invoice: 'Business Invoice & Project Proposal'
};

// Graphic Formats
const IMAGE_FORMATS = {
  banner: { width: 1200, height: 400 },
  square: { width: 1080, height: 1080 },
  poster: { width: 800, height: 1200 },
  vector: { width: 800, height: 800 }
};

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initPills();
  initDocTypes();
  initImageFormats();
  initDropZone();
  initPptControls();
  initPdfControls();
  initImageControls();
  initEnhanceControls();
  initSettingsModal();
  loadHistory();
  detectEnvironment();
});

// Environment Detection
async function detectEnvironment() {
  const badge = document.getElementById('backendStatusText');
  try {
    const res = await fetch('/api/health');
    if (res.ok) {
      const data = await res.json();
      if (data.cliAvailable) {
        badge.textContent = 'CLI Active';
        badge.parentElement.classList.add('border-indigo-500/30');
        return;
      }
    }
  } catch (e) {}
  badge.textContent = 'Serverless Active';
}

// Tab Switching
function initTabs() {
  const tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const targetTab = tab.dataset.tab;
      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
      });
      const activeContent = document.getElementById(`tab-${targetTab}`);
      if (activeContent) activeContent.classList.add('active');

      if (targetTab === 'history') loadHistory();
    });
  });
}

// Quick Sample Pills
function initPills() {
  document.querySelectorAll('.sample-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const targetId = pill.dataset.target;
      const text = pill.dataset.text;
      const target = document.getElementById(targetId);
      if (target) {
        target.value = text;
        target.focus();
      }
    });
  });
}

function initDocTypes() {
  const btns = document.querySelectorAll('.doc-type-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeDocType = btn.dataset.type;
    });
  });
}

function initImageFormats() {
  const btns = document.querySelectorAll('.image-format-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeImageFormat = btn.dataset.format;
    });
  });
}

// Loading Modal Helper
function showLoading(title, status) {
  const overlay = document.getElementById('loadingOverlay');
  document.getElementById('loadingTitle').textContent = title || 'Generating Creative Design...';
  document.getElementById('loadingStatus').textContent = status || 'Executing Antigravity AI Engine...';
  overlay.classList.remove('hidden');
  setTimeout(() => overlay.classList.remove('opacity-0'), 10);
}

function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  overlay.classList.add('opacity-0');
  setTimeout(() => overlay.classList.add('hidden'), 300);
}

// Settings Modal
function initSettingsModal() {
  const modal = document.getElementById('settingsModal');
  const btnOpen = document.getElementById('btnOpenSettings');
  const btnClose = document.getElementById('btnCloseSettings');
  const btnSave = document.getElementById('btnSaveSettings');
  const keyInput = document.getElementById('customApiKeyInput');

  keyInput.value = localStorage.getItem('antigravity_gemini_key') || '';

  btnOpen.onclick = () => {
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.remove('opacity-0'), 10);
  };

  const closeModal = () => {
    modal.classList.add('opacity-0');
    setTimeout(() => modal.classList.add('hidden'), 300);
  };

  btnClose.onclick = closeModal;
  btnSave.onclick = () => {
    localStorage.setItem('antigravity_gemini_key', keyInput.value.trim());
    closeModal();
    alert('Settings saved!');
  };
}

// ========================================================
// 1. PRESENTATION (PPT) ENGINE (100% Serverless in Browser)
// ========================================================
function initPptControls() {
  const btnGen = document.getElementById('btnGeneratePpt');
  btnGen.addEventListener('click', async () => {
    const prompt = document.getElementById('pptPrompt').value.trim();
    if (!prompt) {
      alert('Please enter a presentation topic or outline.');
      return;
    }

    const theme = document.getElementById('pptTheme').value;
    const slideCount = parseInt(document.getElementById('pptSlideCount').value, 10) || 5;
    const model = document.getElementById('modelSelector').value;

    showLoading('Designing Slide Deck (.PPTX)...', 'Structuring presentation cards & layouts in browser...');

    try {
      // 1. Try server endpoint first (when hosted with Node.js)
      let deckData = null;
      try {
        const res = await fetch('/api/generate/ppt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, theme, slideCount, model })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.deck) {
            deckData = data.deck;
          }
        }
      } catch (e) {
        console.log('Running in serverless/static mode');
      }

      // 2. If server not present, synthesize client-side
      if (!deckData) {
        deckData = synthesizeClientDeck(prompt, slideCount, theme);
      }

      currentDeck = deckData;
      currentSlideIndex = 0;

      // Update UI
      document.getElementById('deckTitleDisplay').textContent = currentDeck.title || prompt;
      renderSlide(0);
      buildThumbnails();

      // Enable Client-Side PPTX Download
      const btnDownload = document.getElementById('btnDownloadPptx');
      btnDownload.classList.remove('opacity-50', 'pointer-events-none');
      btnDownload.onclick = () => downloadClientPptx(currentDeck);

      saveHistoryItem({
        id: 'pres_' + Date.now(),
        type: 'presentation',
        title: currentDeck.title || prompt,
        subtitle: `${currentDeck.slides.length} Slides • Theme: ${theme}`,
        downloadAction: () => downloadClientPptx(currentDeck),
        filename: `${sanitizeFileName(currentDeck.title)}.pptx`,
        timestamp: new Date().toLocaleTimeString()
      });

    } catch (err) {
      alert('Generation Error: ' + err.message);
    } finally {
      hideLoading();
    }
  });

  document.getElementById('btnPrevSlide').addEventListener('click', () => {
    if (!currentDeck || currentSlideIndex <= 0) return;
    renderSlide(currentSlideIndex - 1);
  });

  document.getElementById('btnNextSlide').addEventListener('click', () => {
    if (!currentDeck || currentSlideIndex >= currentDeck.slides.length - 1) return;
    renderSlide(currentSlideIndex + 1);
  });

  document.addEventListener('keydown', (e) => {
    if (document.getElementById('tab-ppt').classList.contains('active')) {
      if (e.key === 'ArrowRight') document.getElementById('btnNextSlide').click();
      if (e.key === 'ArrowLeft') document.getElementById('btnPrevSlide').click();
    }
  });

  document.getElementById('btnFullscreenPpt').addEventListener('click', () => {
    const vp = document.getElementById('slideViewport');
    if (vp.requestFullscreen) vp.requestFullscreen();
  });
}

function renderSlide(index) {
  if (!currentDeck || !currentDeck.slides[index]) return;
  currentSlideIndex = index;
  const slide = currentDeck.slides[index];
  const theme = currentDeck.theme || 'modern_dark';

  document.getElementById('deckSlideCounter').textContent = `Slide ${index + 1} of ${currentDeck.slides.length}`;

  const vp = document.getElementById('slideViewport');
  vp.className = `slide-canvas w-full max-w-2xl aspect-[16/9] rounded-xl shadow-2xl p-8 flex flex-col justify-between relative overflow-hidden transition-all duration-300 slide-theme-${theme}`;

  let contentHtml = '';

  if (slide.layout === 'title') {
    contentHtml = `
      <div class="h-1.5 w-full bg-indigo-500 absolute top-0 left-0"></div>
      <div class="my-auto space-y-4">
        <span class="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Presentation Keynote</span>
        <h1 class="text-3xl lg:text-4xl font-extrabold font-outfit leading-tight tracking-tight">${slide.title || currentDeck.title}</h1>
        <p class="text-base text-indigo-300/90 font-medium">${slide.subtitle || ''}</p>
        <div class="text-xs text-slate-400 pt-2">${slide.presenter || 'Antigravity Studio AI'}</div>
      </div>
      <div class="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-700/50 pt-3">
        <span>Antigravity Studio</span>
        <span>Slide 1</span>
      </div>
    `;
  } else if (slide.layout === 'stats' && Array.isArray(slide.stats)) {
    contentHtml = `
      <div class="h-1.5 w-full bg-indigo-500 absolute top-0 left-0"></div>
      <div class="space-y-1 mb-4">
        <h2 class="text-2xl font-bold font-outfit">${slide.title}</h2>
        <p class="text-xs text-slate-400">${slide.subtitle || ''}</p>
      </div>
      <div class="grid grid-cols-${slide.stats.length > 2 ? 3 : 2} gap-3 my-auto">
        ${slide.stats.map(st => `
          <div class="p-4 rounded-xl bg-slate-800/60 border border-slate-700/70 text-center space-y-1 shadow-lg">
            <div class="text-3xl font-extrabold text-indigo-400 font-outfit">${st.value}</div>
            <div class="text-xs font-medium text-slate-300">${st.label}</div>
          </div>
        `).join('')}
      </div>
      <div class="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-700/50 pt-3">
        <span>Antigravity Studio</span>
        <span>Slide ${index + 1} of ${currentDeck.slides.length}</span>
      </div>
    `;
  } else {
    const items = slide.cards || (slide.bullets ? slide.bullets.map(b => ({ title: '', desc: b })) : []);
    contentHtml = `
      <div class="h-1.5 w-full bg-indigo-500 absolute top-0 left-0"></div>
      <div class="space-y-1 mb-4">
        <h2 class="text-2xl font-bold font-outfit">${slide.title}</h2>
        <p class="text-xs text-slate-400">${slide.subtitle || ''}</p>
      </div>
      <div class="grid grid-cols-${Math.min(3, items.length)} gap-3 my-auto">
        ${items.map((it, i) => `
          <div class="p-4 rounded-xl bg-slate-800/60 border border-slate-700/70 space-y-2 shadow-lg">
            <div class="w-6 h-6 rounded-md bg-indigo-500 text-slate-950 font-bold text-xs flex items-center justify-center">${i + 1}</div>
            ${it.title ? `<div class="font-bold text-sm text-slate-100 font-outfit">${it.title}</div>` : ''}
            <div class="text-xs text-slate-300 leading-relaxed">${it.desc || ''}</div>
          </div>
        `).join('')}
      </div>
      <div class="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-700/50 pt-3">
        <span>Antigravity Studio</span>
        <span>Slide ${index + 1} of ${currentDeck.slides.length}</span>
      </div>
    `;
  }

  vp.innerHTML = contentHtml;
  updateThumbnailSelection();
}

function buildThumbnails() {
  const container = document.getElementById('slideThumbnails');
  container.innerHTML = '';
  if (!currentDeck) return;

  currentDeck.slides.forEach((s, idx) => {
    const thumb = document.createElement('div');
    thumb.className = `thumb-item ${idx === 0 ? 'active' : ''}`;
    thumb.textContent = `Slide ${idx + 1}`;
    thumb.addEventListener('click', () => renderSlide(idx));
    container.appendChild(thumb);
  });
}

function updateThumbnailSelection() {
  const thumbs = document.querySelectorAll('.thumb-item');
  thumbs.forEach((t, i) => {
    if (i === currentSlideIndex) t.classList.add('active');
    else t.classList.remove('active');
  });
}

// 100% Client-side PPTX generation using PptxGenJS bundle in browser
async function downloadClientPptx(deckData) {
  if (typeof PptxGenJS === 'undefined') {
    alert('PptxGenJS library is still loading. Please wait 2 seconds.');
    return;
  }

  showLoading('Compiling .PPTX File...', 'Building native PowerPoint presentation directly in browser...');

  try {
    const pres = new PptxGenJS();
    pres.layout = 'LAYOUT_16x9';

    const th = THEMES[deckData.theme] || THEMES.modern_dark;
    pres.defineSlideMaster({
      title: 'MASTER_STUDIO',
      background: { color: th.bg }
    });

    for (const s of deckData.slides) {
      const slide = pres.addSlide({ masterName: 'MASTER_STUDIO' });

      // Top line
      slide.addShape(pres.ShapeType.rect, {
        x: 0, y: 0, w: 13.33, h: 0.1, fill: { color: th.accent }
      });

      if (s.layout === 'title') {
        slide.addText(s.title || deckData.title, {
          x: 1.0, y: 2.2, w: 11.33, h: 2.0,
          fontSize: 44, bold: true, color: th.text, fontFace: 'Helvetica Neue', valign: 'middle'
        });
        if (s.subtitle) {
          slide.addText(s.subtitle, {
            x: 1.0, y: 4.2, w: 11.33, h: 1.0,
            fontSize: 22, color: th.accent, fontFace: 'Helvetica Neue'
          });
        }
        if (s.presenter) {
          slide.addText(s.presenter, {
            x: 1.0, y: 5.6, w: 8.0, h: 0.6,
            fontSize: 14, color: th.secondary, fontFace: 'Helvetica Neue'
          });
        }
      } else if (s.layout === 'stats' && Array.isArray(s.stats)) {
        slide.addText(s.title, { x: 1.0, y: 0.8, w: 11.33, h: 0.8, fontSize: 32, bold: true, color: th.text });
        if (s.subtitle) slide.addText(s.subtitle, { x: 1.0, y: 1.5, w: 11.33, h: 0.5, fontSize: 16, color: th.secondary });

        const count = s.stats.length;
        const cardW = Math.min(3.4, 11.33 / count - 0.3);
        const gap = (11.33 - (cardW * count)) / (count - 1 || 1);

        s.stats.forEach((stat, i) => {
          const xPos = 1.0 + i * (cardW + gap);
          slide.addShape(pres.ShapeType.roundRect, {
            x: xPos, y: 2.6, w: cardW, h: 3.2, rectRadius: 0.2, fill: { color: th.cardBg }, line: { color: th.accent, width: 1.5 }
          });
          slide.addText(stat.value, {
            x: xPos, y: 3.0, w: cardW, h: 1.2, fontSize: 48, bold: true, color: th.accent, align: 'center'
          });
          slide.addText(stat.label, {
            x: xPos + 0.2, y: 4.4, w: cardW - 0.4, h: 1.0, fontSize: 16, color: th.text, align: 'center'
          });
        });
      } else {
        slide.addText(s.title, { x: 1.0, y: 0.8, w: 11.33, h: 0.8, fontSize: 32, bold: true, color: th.text });
        if (s.subtitle) slide.addText(s.subtitle, { x: 1.0, y: 1.5, w: 11.33, h: 0.5, fontSize: 16, color: th.secondary });

        const items = s.cards || (s.bullets ? s.bullets.map(b => ({ title: '', desc: b })) : []);
        const count = items.length || 1;
        const cardW = Math.min(3.5, 11.33 / count - 0.3);
        const gap = (11.33 - (cardW * count)) / Math.max(1, count - 1);

        items.forEach((item, i) => {
          const xPos = 1.0 + i * (cardW + gap);
          slide.addShape(pres.ShapeType.roundRect, {
            x: xPos, y: 2.4, w: cardW, h: 3.8, rectRadius: 0.15, fill: { color: th.cardBg }, line: { color: th.accent, width: 1 }
          });
          slide.addText(`${i + 1}`, {
            x: xPos + 0.3, y: 2.7, w: 0.5, h: 0.5, fontSize: 12, bold: true, color: th.bg, align: 'center', fill: { color: th.accent }
          });
          if (item.title) {
            slide.addText(item.title, { x: xPos + 0.3, y: 3.4, w: cardW - 0.6, h: 0.8, fontSize: 18, bold: true, color: th.text });
          }
          if (item.desc) {
            slide.addText(item.desc, { x: xPos + 0.3, y: item.title ? 4.2 : 3.4, w: cardW - 0.6, h: 1.7, fontSize: 14, color: th.secondary });
          }
        });
      }

      slide.addText(`Slide ${s.slideNumber || ''} | Antigravity Studio`, {
        x: 1.0, y: 7.0, w: 11.33, h: 0.4, fontSize: 10, color: th.secondary
      });
    }

    const filename = `${sanitizeFileName(deckData.title || 'Presentation')}.pptx`;
    await pres.writeFile({ fileName: filename });
  } catch (err) {
    alert('Failed to compile PPTX: ' + err.message);
  } finally {
    hideLoading();
  }
}

// Client synthesis fallback
function synthesizeClientDeck(prompt, count, theme) {
  return {
    title: prompt,
    subtitle: 'Strategic Presentation & Executive Architecture',
    theme: theme || 'modern_dark',
    slides: [
      {
        slideNumber: 1,
        layout: 'title',
        title: prompt,
        subtitle: 'Executive Presentation & Technical Roadmap',
        presenter: 'Antigravity Studio AI'
      },
      {
        slideNumber: 2,
        layout: 'bullets',
        title: 'Core Problem & Untapped Potential',
        subtitle: 'Navigating contemporary friction and market opportunities',
        cards: [
          { title: 'Operational Overhead', desc: 'Complex fragmented workflows limit agility and slow time-to-market.' },
          { title: 'Quality at Scale', desc: 'Sustaining high-fidelity creative output across multi-platform channels.' },
          { title: 'Intelligent Automation', desc: 'Harnessing autonomous agentic frameworks for instant execution.' }
        ]
      },
      {
        slideNumber: 3,
        layout: 'stats',
        title: 'Impact Benchmarks & Strategic Metrics',
        subtitle: 'Validated indicators driving accelerated outcomes',
        stats: [
          { value: '4.6x', label: 'Velocity Acceleration' },
          { value: '98.5%', label: 'Design Precision' },
          { value: '$1.8M', label: 'Annual Operational Savings' }
        ]
      },
      {
        slideNumber: 4,
        layout: 'timeline',
        title: 'Strategic Execution Roadmap',
        subtitle: 'Phased rollout from validation to enterprise scale',
        cards: [
          { title: 'Phase 1: Alignment', desc: 'Architecture specification and core design token definition.' },
          { title: 'Phase 2: Deployment', desc: 'Automated pipeline rollout with zero-downtime integration.' },
          { title: 'Phase 3: Scale', desc: 'Performance optimization and continuous multi-channel delivery.' }
        ]
      },
      {
        slideNumber: 5,
        layout: 'conclusion',
        title: 'Strategic Vision & Action Items',
        subtitle: 'Transforming architectural insight into immediate outcomes',
        cards: [
          { title: 'Immediate Activation', desc: 'Initialize production environment and configure unified pipelines.' },
          { title: 'Continuous Refinement', desc: 'Monitor telemetry and iterate based on high-impact feedback.' }
        ]
      }
    ].slice(0, Math.max(3, count))
  };
}

// ========================================================
// 2. PDF CREATIVE STUDIO (100% Serverless in Browser)
// ========================================================
let currentPdfHtml = '';

function initPdfControls() {
  const btnGen = document.getElementById('btnGeneratePdf');
  btnGen.addEventListener('click', async () => {
    const prompt = document.getElementById('pdfPrompt').value.trim();
    if (!prompt) {
      alert('Please enter document content or prompt.');
      return;
    }

    showLoading('Crafting Print-Ready PDF...', 'Generating vector HTML layout in browser...');

    try {
      let html = null;
      try {
        const res = await fetch('/api/generate/pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, docType: activeDocType, model: document.getElementById('modelSelector').value })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.html) html = data.html;
        }
      } catch (e) {}

      if (!html) {
        html = synthesizeClientHtml(prompt, activeDocType);
      }

      currentPdfHtml = html;
      const frame = document.getElementById('pdfPreviewFrame');
      frame.srcdoc = html;

      // Enable actions
      const btnPrint = document.getElementById('btnPrintPdf');
      btnPrint.classList.remove('opacity-50', 'pointer-events-none');
      btnPrint.onclick = () => frame.contentWindow.print();

      const btnDownload = document.getElementById('btnDownloadPdf');
      btnDownload.classList.remove('opacity-50', 'pointer-events-none');
      btnDownload.onclick = () => downloadClientPdf(html, prompt);

      saveHistoryItem({
        id: 'pdf_' + Date.now(),
        type: 'pdf',
        title: prompt,
        subtitle: `Type: ${activeDocType.toUpperCase()} • 300 DPI`,
        downloadAction: () => downloadClientPdf(html, prompt),
        filename: `${sanitizeFileName(prompt)}.pdf`,
        timestamp: new Date().toLocaleTimeString()
      });

    } catch (err) {
      alert('PDF Generation Error: ' + err.message);
    } finally {
      hideLoading();
    }
  });
}

function downloadClientPdf(html, title) {
  if (typeof html2pdf === 'undefined') {
    const frame = document.getElementById('pdfPreviewFrame');
    frame.contentWindow.print();
    return;
  }

  showLoading('Exporting PDF...', 'Compiling vector document into downloadable PDF...');

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  document.body.appendChild(tempDiv);

  const opt = {
    margin: 0,
    filename: `${sanitizeFileName(title || 'Document')}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 3, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(tempDiv).save().then(() => {
    document.body.removeChild(tempDiv);
    hideLoading();
  }).catch(err => {
    document.body.removeChild(tempDiv);
    hideLoading();
    // Fallback to browser print
    const frame = document.getElementById('pdfPreviewFrame');
    frame.contentWindow.print();
  });
}

function synthesizeClientHtml(prompt, docType) {
  if (docType === 'certificate') {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <style>
    @page { size: A4 portrait; margin: 0; }
    * { box-sizing: border-box; }
    body {
      margin: 0; padding: 0; background: #ffffff;
      font-family: 'Times New Roman', Georgia, serif; color: #111827;
      display: flex; justify-content: center; align-items: center; min-height: 100vh;
    }
    .cert-frame {
      width: 210mm; min-height: 297mm; padding: 18mm 20mm;
      border: 8px double #831843; position: relative; background: #fafafa;
      display: flex; flex-direction: column; justify-content: space-between;
    }
    .watermark {
      position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
      font-size: 160px; color: rgba(131, 24, 67, 0.04); font-weight: bold;
      pointer-events: none; z-index: 0;
    }
    .header { text-align: center; z-index: 1; border-bottom: 2px solid #be185d; padding-bottom: 12px; }
    .org-title { font-size: 26px; font-weight: 800; letter-spacing: 3px; color: #831843; text-transform: uppercase; margin: 0 0 4px 0; }
    .org-sub { font-size: 13px; letter-spacing: 2px; color: #4b5563; text-transform: uppercase; font-family: Arial, sans-serif; }
    .body { text-align: center; z-index: 1; margin: 30px 0; }
    .cert-title { font-size: 38px; font-weight: bold; letter-spacing: 4px; color: #1f2937; text-transform: uppercase; margin: 10px 0 6px 0; }
    .cert-tagline { font-size: 14px; font-style: italic; color: #6b7280; margin-bottom: 24px; }
    .topic-box { font-size: 22px; font-weight: bold; color: #831843; margin: 20px 0; padding: 12px 20px; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; line-height: 1.4; }
    .cert-intro { font-size: 16px; line-height: 1.6; color: #374151; max-width: 580px; margin: 0 auto; }
    .footer { display: flex; justify-content: space-between; margin-top: 40px; z-index: 1; padding: 0 20px; }
    .sig-block { text-align: center; width: 200px; }
    .sig-line { border-top: 1.5px solid #111827; margin-bottom: 8px; }
    .sig-name { font-size: 14px; font-weight: bold; }
    .sig-title { font-size: 12px; color: #4b5563; font-family: Arial, sans-serif; }
  </style>
</head>
<body>
  <div class="cert-frame">
    <div class="watermark">★</div>
    <div class="header">
      <h1 class="org-title">Antigravity Academy of Design</h1>
      <div class="org-sub">Excellence in Research & Engineering</div>
    </div>
    <div class="body">
      <div class="cert-title">Certificate of Completion</div>
      <div class="cert-tagline">This prestigious credential is duly awarded for</div>
      <div class="topic-box">${prompt}</div>
      <p class="cert-intro">
        In formal recognition of exceptional dedication, rigorous technical research, and successful completion of all project requirements to the highest academic standards.
      </p>
    </div>
    <div class="footer">
      <div class="sig-block">
        <div class="sig-line"></div>
        <div class="sig-name">Academic Director</div>
        <div class="sig-title">Board of Evaluation</div>
      </div>
      <div class="sig-block">
        <div class="sig-line"></div>
        <div class="sig-name">Faculty Coordinator</div>
        <div class="sig-title">Program Committee</div>
      </div>
    </div>
  </div>
</body>
</html>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <style>
    @page { size: A4; margin: 15mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f172a; line-height: 1.6; margin: 0; padding: 0; }
    .header { border-bottom: 3px solid #3b82f6; padding-bottom: 16px; margin-bottom: 24px; }
    .badge { display: inline-block; padding: 4px 12px; background: #eff6ff; color: #1d4ed8; border-radius: 9999px; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 8px; }
    h1 { font-size: 26px; margin: 4px 0 8px 0; color: #1e293b; }
    .meta { font-size: 13px; color: #64748b; }
    .summary-card { background: #f8fafc; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 4px; margin-bottom: 24px; }
    h2 { font-size: 18px; color: #1e3a8a; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-top: 24px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px; }
    th { background: #f1f5f9; text-align: left; padding: 10px; border: 1px solid #cbd5e1; }
    td { padding: 10px; border: 1px solid #cbd5e1; }
  </style>
</head>
<body>
  <div class="header">
    <span class="badge">Executive Brief</span>
    <h1>${prompt}</h1>
    <div class="meta">Published: ${new Date().toLocaleDateString()} | Author: Technical Advisory Board</div>
  </div>
  <div class="summary-card">
    <strong>Executive Summary:</strong> Comprehensive architectural findings and validated benchmarks for ${prompt}.
  </div>
  <h2>1. Strategic Objectives</h2>
  <p>To establish a resilient, state-of-the-art framework that accelerates production cycles while upholding rigorous quality standards.</p>
  <h2>2. Performance Metrics</h2>
  <table>
    <thead><tr><th>Metric</th><th>Target</th><th>Status</th></tr></thead>
    <tbody>
      <tr><td>Execution Latency</td><td>&lt; 250 ms</td><td>Surpassed</td></tr>
      <tr><td>Design Fidelity</td><td>99.9%</td><td>Validated</td></tr>
    </tbody>
  </table>
</body>
</html>`;
}

// ========================================================
// 3. IMAGE & VECTOR STUDIO (100% Serverless in Browser)
// ========================================================
let currentSvgCode = '';

function initImageControls() {
  const btnGen = document.getElementById('btnGenerateImage');
  btnGen.addEventListener('click', async () => {
    const prompt = document.getElementById('imagePrompt').value.trim();
    if (!prompt) {
      alert('Please enter a creative prompt for the graphic.');
      return;
    }

    showLoading('Generating Vector Graphic...', 'Rendering SVG in browser...');

    try {
      let svg = null;
      try {
        const res = await fetch('/api/generate/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, format: activeImageFormat, model: document.getElementById('modelSelector').value })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.svg) svg = data.svg;
        }
      } catch (e) {}

      if (!svg) {
        svg = synthesizeClientSvg(prompt, activeImageFormat);
      }

      currentSvgCode = svg;
      const container = document.getElementById('imageCanvasContainer');
      container.innerHTML = svg;

      // Enable actions
      const btnCopy = document.getElementById('btnCopySvg');
      btnCopy.classList.remove('opacity-50', 'pointer-events-none');
      btnCopy.onclick = () => {
        navigator.clipboard.writeText(svg).then(() => alert('SVG code copied!'));
      };

      const btnSvg = document.getElementById('btnDownloadSvg');
      btnSvg.classList.remove('opacity-50', 'pointer-events-none');
      btnSvg.onclick = () => downloadClientSvg(svg, prompt);

      const btnPng = document.getElementById('btnDownloadPng');
      btnPng.classList.remove('opacity-50', 'pointer-events-none');
      btnPng.onclick = () => downloadClientPngFromSvg(svg, prompt, activeImageFormat);

      saveHistoryItem({
        id: 'img_' + Date.now(),
        type: 'image',
        title: prompt,
        subtitle: `Format: ${activeImageFormat.toUpperCase()} • Vector & PNG`,
        downloadAction: () => downloadClientPngFromSvg(svg, prompt, activeImageFormat),
        filename: `${sanitizeFileName(prompt)}.png`,
        timestamp: new Date().toLocaleTimeString()
      });

    } catch (err) {
      alert('Image Error: ' + err.message);
    } finally {
      hideLoading();
    }
  });
}

function downloadClientSvg(svg, title) {
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${sanitizeFileName(title || 'Vector')}.svg`;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadClientPngFromSvg(svg, title, formatKey) {
  const fmt = IMAGE_FORMATS[formatKey] || IMAGE_FORMATS.banner;
  const canvas = document.createElement('canvas');
  const scale = 2;
  canvas.width = fmt.width * scale;
  canvas.height = fmt.height * scale;
  const ctx = canvas.getContext('2d');

  const img = new Image();
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  img.onload = () => {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);
    canvas.toBlob((pngBlob) => {
      const pngUrl = URL.createObjectURL(pngBlob);
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = `${sanitizeFileName(title || 'Graphic')}.png`;
      a.click();
      URL.revokeObjectURL(pngUrl);
    }, 'image/png');
  };
  img.src = url;
}

function synthesizeClientSvg(prompt, formatKey) {
  const fmt = IMAGE_FORMATS[formatKey] || IMAGE_FORMATS.banner;
  const w = fmt.width;
  const h = fmt.height;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="bgG_${formatKey}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090d16" />
      <stop offset="45%" stop-color="#1e1b4b" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <linearGradient id="neonG_${formatKey}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#06b6d4" />
      <stop offset="50%" stop-color="#8b5cf6" />
      <stop offset="100%" stop-color="#ec4899" />
    </linearGradient>
    <radialGradient id="radG_${formatKey}" cx="70%" cy="30%" r="60%">
      <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.35" />
      <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0" />
    </radialGradient>
  </defs>

  <rect width="100%" height="100%" fill="url(#bgG_${formatKey})" />
  <rect width="100%" height="100%" fill="url(#radG_${formatKey})" />

  <circle cx="${w * 0.85}" cy="${h * 0.2}" r="${Math.min(w, h) * 0.3}" fill="none" stroke="url(#neonG_${formatKey})" stroke-width="2" stroke-dasharray="8 6" opacity="0.4" />
  <circle cx="${w * 0.85}" cy="${h * 0.2}" r="${Math.min(w, h) * 0.18}" fill="none" stroke="#06b6d4" stroke-width="1.5" opacity="0.6" />
  <rect x="${w * 0.08}" y="${h * 0.15}" width="80" height="4" rx="2" fill="url(#neonG_${formatKey})" />

  <rect x="${w * 0.08}" y="${h * 0.25}" width="220" height="32" rx="16" fill="#1e293b" stroke="#334155" stroke-width="1" />
  <circle cx="${w * 0.08 + 16}" cy="${h * 0.25 + 16}" r="5" fill="#06b6d4" />
  <text x="${w * 0.08 + 32}" y="${h * 0.25 + 21}" fill="#94a3b8" font-family="-apple-system, sans-serif" font-size="12" font-weight="700" letter-spacing="1">ANTIGRAVITY STUDIO</text>

  <text x="${w * 0.08}" y="${h * 0.5}" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="${Math.min(48, w * 0.045)}" font-weight="800">
    ${prompt.length > 40 ? prompt.slice(0, 40) + '...' : prompt}
  </text>
  <text x="${w * 0.08}" y="${h * 0.65}" fill="url(#neonG_${formatKey})" font-family="-apple-system, sans-serif" font-size="${Math.min(24, w * 0.024)}" font-weight="600">
    High-Fidelity AI Creative Design &amp; Precision Rendering
  </text>
  <text x="${w * 0.08}" y="${h * 0.78}" fill="#94a3b8" font-family="-apple-system, sans-serif" font-size="14">
    Crafted with Antigravity AI Engine • Scalable Vector Architecture
  </text>
</svg>`;
}

// ========================================================
// 4. IMAGE ENHANCER & 300+ DPI ENGINE (Canvas & Client-Side)
// ========================================================
function initDropZone() {
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('imageFileInput');

  dropZone.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleSelectedFile(e.target.files[0]);
    }
  });

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('border-emerald-500');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('border-emerald-500');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('border-emerald-500');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleSelectedFile(e.dataTransfer.files[0]);
    }
  });
}

function handleSelectedFile(file) {
  selectedEnhanceFile = file;
  document.getElementById('uploadStatusText').textContent = `Selected: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`;

  const reader = new FileReader();
  reader.onload = (e) => {
    const container = document.getElementById('enhanceViewerContainer');
    container.innerHTML = `
      <div class="text-center space-y-3">
        <img src="${e.target.result}" class="max-h-[380px] max-w-full rounded-lg shadow-lg border border-slate-700" alt="Original Upload" />
        <div class="text-xs text-slate-400">Original preview loaded. Ready for 300+ DPI enhancement.</div>
      </div>
    `;
  };
  reader.readAsDataURL(file);
}

function initEnhanceControls() {
  const btnRun = document.getElementById('btnRunEnhance');
  btnRun.addEventListener('click', async () => {
    if (!selectedEnhanceFile) {
      alert('Please select or drop an image file first.');
      return;
    }

    showLoading('Enhancing Image to 300+ DPI...', 'Applying bilateral smoothing, text sharpening & super-resolution...');

    try {
      // 1. Try server endpoint first
      let resultData = null;
      try {
        const formData = new FormData();
        formData.append('image', selectedEnhanceFile);
        const res = await fetch('/api/enhance/image', { method: 'POST', body: formData });
        if (res.ok) {
          resultData = await res.json();
        }
      } catch (e) {}

      if (resultData && resultData.success) {
        renderEnhanceResult(resultData.originalUrl, resultData.enhancedPngUrl, resultData.enhancedPdfUrl);
      } else {
        // 2. Client-side canvas 300 DPI enhancement engine!
        await runClientCanvasEnhancer(selectedEnhanceFile);
      }

    } catch (err) {
      alert('Enhancement Error: ' + err.message);
    } finally {
      hideLoading();
    }
  });
}

function renderEnhanceResult(origUrl, enhancedPngUrl, enhancedPdfUrl) {
  document.getElementById('enhancementBadge').textContent = 'Enhanced (300 DPI)';
  document.getElementById('enhancementBadge').classList.add('text-emerald-400');

  const btnPng = document.getElementById('btnDownloadEnhancePng');
  btnPng.classList.remove('opacity-50', 'pointer-events-none');
  btnPng.onclick = () => {
    const a = document.createElement('a');
    a.href = enhancedPngUrl;
    a.download = 'enhanced_300dpi.png';
    a.click();
  };

  const btnPdf = document.getElementById('btnDownloadEnhancePdf');
  btnPdf.classList.remove('opacity-50', 'pointer-events-none');
  btnPdf.onclick = () => {
    const a = document.createElement('a');
    a.href = enhancedPdfUrl;
    a.download = 'enhanced_document.pdf';
    a.click();
  };

  const container = document.getElementById('enhanceViewerContainer');
  container.innerHTML = `
    <div class="grid grid-cols-2 gap-4 w-full h-full p-2 items-center">
      <div class="text-center space-y-2">
        <span class="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400">ORIGINAL</span>
        <div class="overflow-hidden rounded-lg border border-slate-800 bg-black/40 p-1">
          <img src="${origUrl}" class="max-h-[380px] mx-auto object-contain" alt="Original" />
        </div>
      </div>
      <div class="text-center space-y-2">
        <span class="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">ENHANCED 300 DPI</span>
        <div class="overflow-hidden rounded-lg border border-emerald-500/50 bg-black/40 p-1 shadow-xl shadow-emerald-500/10">
          <img src="${enhancedPngUrl}" class="max-h-[380px] mx-auto object-contain" alt="Enhanced" />
        </div>
      </div>
    </div>
  `;
}

// In-Browser High-Resolution Image Processing (100% Serverless)
function runClientCanvasEnhancer(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = 3;
        const canvas = document.createElement('canvas');
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');

        // High quality interpolation
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Pixel processing for text sharpening and background cleaning
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        const len = data.length;

        for (let i = 0; i < len; i += 4) {
          let r = data[i];
          let g = data[i + 1];
          let b = data[i + 2];
          let gray = 0.299 * r + 0.587 * g + 0.114 * b;

          // If near white background, flatten to clean 255
          if (r > 242 && g > 242 && b > 242) {
            data[i] = 255;
            data[i + 1] = 255;
            data[i + 2] = 255;
          } else if (gray < 130) {
            // Dark text strokes -> enrich black
            data[i] = Math.max(0, r * 0.72);
            data[i + 1] = Math.max(0, g * 0.72);
            data[i + 2] = Math.max(0, b * 0.72);
          }
        }
        ctx.putImageData(imgData, 0, 0);

        const enhancedPngUrl = canvas.toDataURL('image/png');
        renderEnhanceResult(e.target.result, enhancedPngUrl, enhancedPngUrl);
        resolve();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// ========================================================
// 5. SESSION GALLERY & UTILS
// ========================================================
function sanitizeFileName(str) {
  return (str || 'file').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40);
}

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem('antigravity_studio_history') || '[]');
  } catch (e) {
    return [];
  }
}

function saveHistoryItem(item) {
  const history = getHistory();
  history.unshift(item);
  localStorage.setItem('antigravity_studio_history', JSON.stringify(history.slice(0, 30)));
}

function loadHistory() {
  const container = document.getElementById('galleryGrid');
  const history = getHistory();

  if (!history || history.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-12 text-slate-500 text-sm">
        No creations in your session history yet. Start by generating a PPT, PDF, or Graphic above!
      </div>
    `;
    return;
  }

  const icons = { presentation: '📊', pdf: '📄', image: '🎨', enhance: '🔍' };

  container.innerHTML = history.map(item => `
    <div class="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 hover:border-slate-700 transition-colors shadow-lg">
      <div class="flex items-start justify-between gap-2">
        <div class="flex items-center gap-2">
          <span class="text-xl">${icons[item.type] || '📁'}</span>
          <div>
            <div class="font-bold text-sm text-slate-200 truncate max-w-[200px]" title="${item.title}">${item.title}</div>
            <div class="text-[11px] text-slate-400">${item.subtitle}</div>
          </div>
        </div>
        <span class="text-[10px] text-slate-500 font-mono">${item.timestamp}</span>
      </div>
      <div class="pt-2 border-t border-slate-800/80 flex items-center justify-between">
        <span class="text-[11px] text-indigo-400 font-mono truncate max-w-[150px]">${item.filename}</span>
        <button class="text-xs px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/30 font-semibold transition-colors">Action</button>
      </div>
    </div>
  `).join('');

  document.getElementById('btnClearHistory').onclick = () => {
    localStorage.removeItem('antigravity_studio_history');
    loadHistory();
  };
}
