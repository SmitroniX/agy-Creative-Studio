// Antigravity Creative Studio Frontend Engine

let currentDeck = null;
let currentSlideIndex = 0;
let activeDocType = 'certificate';
let activeImageFormat = 'banner';
let selectedEnhanceFile = null;

// Initialize on DOM load
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
  loadHistory();
  checkHealth();
});

// System Health Check
async function checkHealth() {
  try {
    const res = await fetch('/api/health');
    const data = await res.json();
    console.log('Antigravity Studio Backend Connected:', data);
  } catch (e) {
    console.warn('Backend connection warning:', e);
  }
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

// Document Type Selector
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

// Image Format Selector
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
  document.getElementById('loadingStatus').textContent = status || 'Executing Antigravity AI CLI in backend...';
  overlay.classList.remove('hidden');
  setTimeout(() => overlay.classList.remove('opacity-0'), 10);
}

function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  overlay.classList.add('opacity-0');
  setTimeout(() => overlay.classList.add('hidden'), 300);
}

// ==========================================
// 1. PRESENTATION (PPT) ENGINE
// ==========================================
function initPptControls() {
  const btnGen = document.getElementById('btnGeneratePpt');
  btnGen.addEventListener('click', async () => {
    const prompt = document.getElementById('pptPrompt').value.trim();
    if (!prompt) {
      alert('Please enter a presentation topic or outline.');
      return;
    }

    const theme = document.getElementById('pptTheme').value;
    const slideCount = document.getElementById('pptSlideCount').value;
    const model = document.getElementById('modelSelector').value;

    showLoading('Designing Slide Deck (.PPTX)...', 'Antigravity CLI is structuring slides & compiling PowerPoint layout...');

    try {
      const res = await fetch('/api/generate/ppt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, theme, slideCount, model })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate slide deck');
      }

      currentDeck = data.deck;
      currentSlideIndex = 0;

      // Update UI
      document.getElementById('deckTitleDisplay').textContent = currentDeck.title || prompt;
      const btnDownload = document.getElementById('btnDownloadPptx');
      btnDownload.href = data.downloadUrl;
      btnDownload.setAttribute('download', data.filename);
      btnDownload.classList.remove('opacity-50', 'pointer-events-none');

      renderSlide(0);
      buildThumbnails();

      // Save to History
      saveHistoryItem({
        id: data.id,
        type: 'presentation',
        title: currentDeck.title || prompt,
        subtitle: `${currentDeck.slides.length} Slides • Theme: ${theme}`,
        downloadUrl: data.downloadUrl,
        filename: data.filename,
        timestamp: new Date().toLocaleTimeString()
      });

    } catch (err) {
      alert('Generation Error: ' + err.message);
    } finally {
      hideLoading();
    }
  });

  // Slide navigation
  document.getElementById('btnPrevSlide').addEventListener('click', () => {
    if (!currentDeck || currentSlideIndex <= 0) return;
    renderSlide(currentSlideIndex - 1);
  });

  document.getElementById('btnNextSlide').addEventListener('click', () => {
    if (!currentDeck || currentSlideIndex >= currentDeck.slides.length - 1) return;
    renderSlide(currentSlideIndex + 1);
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (document.getElementById('tab-ppt').classList.contains('active')) {
      if (e.key === 'ArrowRight') document.getElementById('btnNextSlide').click();
      if (e.key === 'ArrowLeft') document.getElementById('btnPrevSlide').click();
    }
  });

  // Fullscreen mode
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
      <div class="h-1 w-full bg-indigo-500 absolute top-0 left-0"></div>
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
      <div class="h-1 w-full bg-indigo-500 absolute top-0 left-0"></div>
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
    // Cards layout
    const items = slide.cards || (slide.bullets ? slide.bullets.map(b => ({ title: '', desc: b })) : []);
    contentHtml = `
      <div class="h-1 w-full bg-indigo-500 absolute top-0 left-0"></div>
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

// ==========================================
// 2. PDF CREATIVE STUDIO
// ==========================================
function initPdfControls() {
  const btnGen = document.getElementById('btnGeneratePdf');
  btnGen.addEventListener('click', async () => {
    const prompt = document.getElementById('pdfPrompt').value.trim();
    if (!prompt) {
      alert('Please enter document content or prompt.');
      return;
    }

    const model = document.getElementById('modelSelector').value;
    showLoading('Crafting Print-Ready PDF...', 'Generating vector HTML layout & compiling with wkhtmltopdf...');

    try {
      const res = await fetch('/api/generate/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, docType: activeDocType, model })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate PDF');
      }

      // Preview in iframe
      const frame = document.getElementById('pdfPreviewFrame');
      frame.srcdoc = data.html;

      // Enable actions
      const btnDownload = document.getElementById('btnDownloadPdf');
      btnDownload.href = data.downloadUrl;
      btnDownload.setAttribute('download', data.filename);
      btnDownload.classList.remove('opacity-50', 'pointer-events-none');

      const btnPrint = document.getElementById('btnPrintPdf');
      btnPrint.classList.remove('opacity-50', 'pointer-events-none');
      btnPrint.onclick = () => frame.contentWindow.print();

      saveHistoryItem({
        id: data.id,
        type: 'pdf',
        title: prompt,
        subtitle: `Type: ${activeDocType.toUpperCase()} • 300 DPI`,
        downloadUrl: data.downloadUrl,
        filename: data.filename,
        timestamp: new Date().toLocaleTimeString()
      });

    } catch (err) {
      alert('PDF Error: ' + err.message);
    } finally {
      hideLoading();
    }
  });
}

// ==========================================
// 3. IMAGE & VECTOR STUDIO
// ==========================================
function initImageControls() {
  const btnGen = document.getElementById('btnGenerateImage');
  btnGen.addEventListener('click', async () => {
    const prompt = document.getElementById('imagePrompt').value.trim();
    if (!prompt) {
      alert('Please enter a creative prompt for the graphic.');
      return;
    }

    const model = document.getElementById('modelSelector').value;
    showLoading('Generating Vector Graphic & Image...', 'Creating SVG artwork & rasterizing high-res PNG...');

    try {
      const res = await fetch('/api/generate/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, format: activeImageFormat, model })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate image');
      }

      // Render in container
      const container = document.getElementById('imageCanvasContainer');
      container.innerHTML = data.svg;

      // Enable download buttons
      const btnSvg = document.getElementById('btnDownloadSvg');
      btnSvg.href = data.svgUrl;
      btnSvg.setAttribute('download', data.svgFilename);
      btnSvg.classList.remove('opacity-50', 'pointer-events-none');

      const btnPng = document.getElementById('btnDownloadPng');
      btnPng.href = data.pngUrl;
      btnPng.setAttribute('download', data.pngFilename);
      btnPng.classList.remove('opacity-50', 'pointer-events-none');

      const btnCopy = document.getElementById('btnCopySvg');
      btnCopy.classList.remove('opacity-50', 'pointer-events-none');
      btnCopy.onclick = () => {
        navigator.clipboard.writeText(data.svg).then(() => alert('SVG Code copied to clipboard!'));
      };

      saveHistoryItem({
        id: data.id,
        type: 'image',
        title: prompt,
        subtitle: `Format: ${activeImageFormat.toUpperCase()} • SVG & PNG`,
        downloadUrl: data.pngUrl,
        filename: data.pngFilename,
        timestamp: new Date().toLocaleTimeString()
      });

    } catch (err) {
      alert('Image Generation Error: ' + err.message);
    } finally {
      hideLoading();
    }
  });
}

// ==========================================
// 4. IMAGE ENHANCER & 300+ DPI ENGINE
// ==========================================
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

  // Preview original image in container
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

    showLoading('Enhancing Image to 300+ DPI...', 'Applying bilateral artifact suppression, text edge sharpening & Lanczos super-resolution...');

    const formData = new FormData();
    formData.append('image', selectedEnhanceFile);

    try {
      const res = await fetch('/api/enhance/image', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Enhancement failed');
      }

      document.getElementById('enhancementBadge').textContent = 'Enhanced (300 DPI)';
      document.getElementById('enhancementBadge').classList.add('text-emerald-400');

      // Setup download links
      const btnPng = document.getElementById('btnDownloadEnhancePng');
      btnPng.href = data.enhancedPngUrl;
      btnPng.setAttribute('download', data.enhancedPngFilename);
      btnPng.classList.remove('opacity-50', 'pointer-events-none');

      const btnPdf = document.getElementById('btnDownloadEnhancePdf');
      btnPdf.href = data.enhancedPdfUrl;
      btnPdf.setAttribute('download', data.enhancedPdfFilename);
      btnPdf.classList.remove('opacity-50', 'pointer-events-none');

      // Render interactive side-by-side comparison
      const container = document.getElementById('enhanceViewerContainer');
      container.innerHTML = `
        <div class="grid grid-cols-2 gap-4 w-full h-full p-2 items-center">
          <div class="text-center space-y-2">
            <span class="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400">ORIGINAL</span>
            <div class="overflow-hidden rounded-lg border border-slate-800 bg-black/40 p-1">
              <img src="${data.originalUrl}" class="max-h-[380px] mx-auto object-contain" alt="Original" />
            </div>
          </div>
          <div class="text-center space-y-2">
            <span class="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">ENHANCED 300 DPI</span>
            <div class="overflow-hidden rounded-lg border border-emerald-500/50 bg-black/40 p-1 shadow-xl shadow-emerald-500/10">
              <img src="${data.enhancedPngUrl}" class="max-h-[380px] mx-auto object-contain" alt="Enhanced" />
            </div>
          </div>
        </div>
      `;

      saveHistoryItem({
        id: data.id,
        type: 'enhance',
        title: selectedEnhanceFile.name,
        subtitle: '300 DPI Super-Resolution • PNG & PDF',
        downloadUrl: data.enhancedPngUrl,
        filename: data.enhancedPngFilename,
        timestamp: new Date().toLocaleTimeString()
      });

    } catch (err) {
      alert('Enhancement Error: ' + err.message);
    } finally {
      hideLoading();
    }
  });
}

// ==========================================
// 5. SESSION HISTORY
// ==========================================
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

  const icons = {
    presentation: '📊',
    pdf: '📄',
    image: '🎨',
    enhance: '🔍'
  };

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
        <a href="${item.downloadUrl}" download="${item.filename}" class="text-xs px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/30 font-semibold transition-colors">Download</a>
      </div>
    </div>
  `).join('');

  document.getElementById('btnClearHistory').onclick = () => {
    localStorage.removeItem('antigravity_studio_history');
    loadHistory();
  };
}
