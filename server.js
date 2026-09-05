const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const { runAgy, AGY_BIN } = require('./services/cli');
const { THEMES, generateSlideDeckContent, compilePptx } = require('./services/pptService');
const { DOCUMENT_TYPES, generatePdfDocument, compileHtmlToPdf } = require('./services/pdfService');
const { IMAGE_FORMATS, generateSvgGraphic, compileSvgToPng } = require('./services/imageService');
const { enhanceImage } = require('./services/enhancerService');

const app = express();
const PORT = process.env.PORT || 3000;

// Directories
const OUTPUTS_DIR = path.join(__dirname, 'outputs');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const PUBLIC_DIR = path.join(__dirname, 'public');

[OUTPUTS_DIR, UPLOADS_DIR, PUBLIC_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E6);
    const ext = path.extname(file.originalname) || '.png';
    cb(null, 'upload-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage, limits: { fileSize: 25 * 1024 * 1024 } });

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(PUBLIC_DIR));
app.use('/outputs', express.static(OUTPUTS_DIR));
app.use('/uploads', express.static(UPLOADS_DIR));

// 1. Health check & System Info
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Antigravity Creative Studio',
    cliBinary: AGY_BIN,
    cliAvailable: fs.existsSync(AGY_BIN),
    wkhtmltopdfAvailable: fs.existsSync('/usr/bin/wkhtmltopdf'),
    timestamp: new Date().toISOString()
  });
});

// 2. Available Models
app.get('/api/models', async (req, res) => {
  try {
    const models = [
      { id: 'gemini-3.8-flash-low', name: 'Gemini 3.8 Flash (Fast & Precise)', default: true },
      { id: 'gemini-3.8-flash-high', name: 'Gemini 3.8 Flash (High Reasoning)' },
      { id: 'gemini-3.1-pro-high', name: 'Gemini 3.1 Pro (Deep Architecture)' },
      { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6 (Creative Writing)' },
      { id: 'gpt-oss-120b-medium', name: 'GPT-OSS 120B (Open Weights)' }
    ];
    res.json({ models, themes: THEMES, docTypes: DOCUMENT_TYPES, imageFormats: IMAGE_FORMATS });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Generate Presentation (PPT / PPTX)
app.post('/api/generate/ppt', async (req, res) => {
  try {
    const { prompt, slideCount = 5, theme = 'modern_dark', model = 'gemini-3.8-flash-low' } = req.body;
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log(`[PPT] Generating presentation for "${prompt}" (Theme: ${theme}, Slides: ${slideCount})`);
    const deckData = await generateSlideDeckContent(prompt, Number(slideCount), model, theme);

    const fileId = 'presentation_' + Date.now();
    const pptxFilename = `${fileId}.pptx`;
    const pptxPath = path.join(OUTPUTS_DIR, pptxFilename);

    await compilePptx(deckData, pptxPath);

    res.json({
      success: true,
      id: fileId,
      deck: deckData,
      downloadUrl: `/outputs/${pptxFilename}`,
      filename: pptxFilename
    });
  } catch (err) {
    console.error('[PPT] Generation failed:', err);
    res.status(500).json({ error: err.message });
  }
});

// 4. Generate PDF Creative Document
app.post('/api/generate/pdf', async (req, res) => {
  try {
    const { prompt, docType = 'certificate', model = 'gemini-3.8-flash-low' } = req.body;
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log(`[PDF] Generating ${docType} for "${prompt}"`);
    const htmlContent = await generatePdfDocument(prompt, docType, model);

    const fileId = 'document_' + Date.now();
    const pdfFilename = `${fileId}.pdf`;
    const pdfPath = path.join(OUTPUTS_DIR, pdfFilename);

    await compileHtmlToPdf(htmlContent, pdfPath);

    res.json({
      success: true,
      id: fileId,
      docType,
      html: htmlContent,
      downloadUrl: `/outputs/${pdfFilename}`,
      filename: pdfFilename
    });
  } catch (err) {
    console.error('[PDF] Generation failed:', err);
    res.status(500).json({ error: err.message });
  }
});

// 5. Generate Image / Vector Graphic
app.post('/api/generate/image', async (req, res) => {
  try {
    const { prompt, format = 'banner', model = 'gemini-3.8-flash-low' } = req.body;
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log(`[Image] Generating ${format} for "${prompt}"`);
    const svgCode = await generateSvgGraphic(prompt, format, model);

    const fileId = 'graphic_' + Date.now();
    const svgFilename = `${fileId}.svg`;
    const pngFilename = `${fileId}.png`;

    const svgPath = path.join(OUTPUTS_DIR, svgFilename);
    const pngPath = path.join(OUTPUTS_DIR, pngFilename);

    fs.writeFileSync(svgPath, svgCode, 'utf-8');

    try {
      await compileSvgToPng(svgPath, pngPath);
    } catch (e) {
      console.warn('PNG rasterization skipped:', e.message);
    }

    res.json({
      success: true,
      id: fileId,
      format,
      svg: svgCode,
      svgUrl: `/outputs/${svgFilename}`,
      pngUrl: fs.existsSync(pngPath) ? `/outputs/${pngFilename}` : `/outputs/${svgFilename}`,
      svgFilename,
      pngFilename
    });
  } catch (err) {
    console.error('[Image] Generation failed:', err);
    res.status(500).json({ error: err.message });
  }
});

// 6. Image & Document Enhancer (OpenCV 300+ DPI Super-Resolution Pipeline)
app.post('/api/enhance/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload an image file (PNG, JPG, WEBP)' });
    }

    const inputPath = req.file.path;
    const fileId = 'enhanced_' + Date.now();
    const outputPngFilename = `${fileId}.png`;
    const outputPdfFilename = `${fileId}.pdf`;

    const outputPngPath = path.join(OUTPUTS_DIR, outputPngFilename);
    const outputPdfPath = path.join(OUTPUTS_DIR, outputPdfFilename);

    console.log(`[Enhance] Processing ${req.file.originalname} -> 300 DPI upscale & denoising...`);
    await enhanceImage(inputPath, outputPngPath, outputPdfPath, 3);

    res.json({
      success: true,
      id: fileId,
      originalUrl: `/uploads/${req.file.filename}`,
      enhancedPngUrl: `/outputs/${outputPngFilename}`,
      enhancedPdfUrl: `/outputs/${outputPdfFilename}`,
      enhancedPngFilename: outputPngFilename,
      enhancedPdfFilename: outputPdfFilename
    });
  } catch (err) {
    console.error('[Enhance] Failed:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`✨ Antigravity Creative Studio running on port ${PORT}`);
  console.log(`🔗 Local URL: http://localhost:${PORT}`);
  console.log(`⚡ Powered by Antigravity CLI at ${AGY_BIN}`);
  console.log(`====================================================`);
});
