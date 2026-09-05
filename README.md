# Antigravity Creative Studio ✨

An AI-powered creative design platform that generates print-ready **PDF documents**, professional **PowerPoint (.PPTX) presentations**, and scalable **vector images & graphics**, powered by the **Google Antigravity CLI (`agy`)** in the backend.

---

## 🚀 Key Features

### 1. 📊 Presentation (PPT) Generator
- **Native .PPTX Export**: Compiles real PowerPoint files (`pptxgenjs`) compatible with Microsoft PowerPoint, Google Slides, and Apple Keynote.
- **Interactive In-Browser Presentation Mode**: Navigate slides with arrow keys, fullscreen view, slide counter, and live editable content.
- **Intelligent Layouts**: Title Keynotes, 3-Card Value Pillars, Metric & Stat Grids, Roadmap Timelines, and Impact Conclusions.
- **Curated Themes**: Modern Dark Tech, Electric Violet, Emerald Growth, Corporate Executive, and Minimal Luxury.

### 2. 📄 PDF Creative Document Studio
- **300+ DPI Print Fidelity**: Generates vector-sharp documents via `wkhtmltopdf` and high-contrast print CSS.
- **Multiple Document Archetypes**:
  - **Academic & Achievement Certificates**: Double borders, crests, recipient calligraphy, signatures.
  - **Executive & Technical Reports**: IEEE-style abstracts, KPI benchmark tables, structured sections.
  - **Modern Resumes / CVs**: Two-column layout, skills pills, experience timeline.
  - **Business Proposals & Invoices**: Itemized deliverables, payment terms, branding.
- **Instant Browser Print & PDF Download**: In-browser live preview with 1-click download.

### 3. 🎨 Image & Vector Graphic Studio
- **AI Vector Design**: Generates multi-gradient SVG illustrations, abstract technology diagrams, cyber interfaces, and logos.
- **Preset Dimensions**:
  - Social Banners (1200 × 400)
  - Square Posts (1080 × 1080)
  - Creative Posters (800 × 1200)
  - Vector Art / Badges (800 × 800)
- **Multi-Format Export**: Download as raw scalable `.SVG` or rasterized high-resolution `.PNG`.

### 4. 🔍 Document & Image Enhancer (300+ DPI Engine)
- **Artifact Removal**: Suppresses JPEG compression ringing and mosquito halos around text using bilateral edge-preserving filtering.
- **Text & Contrast Restoration**: Sharpens blurry fonts into solid, deep black vector-like glyphs with clean anti-aliasing.
- **Background Normalization**: Smoothly flattens paper background noise to pure white while preserving delicate watermarks and architectural line art.
- **Lanczos-4 Super-Resolution**: Upscales images 3x to true print-ready 300+ DPI resolution.
- **Automatic PDF Generation**: Bundles the enhanced image into an A4 print PDF.

---

## 🛠️ Architecture & Tech Stack

- **Backend**: Node.js, Express, `pptxgenjs`, `multer`, `cors`
- **CLI Engine**: Google Antigravity CLI (`/root/.local/bin/agy`) with models:
  - `gemini-3.8-flash-low` (Fast low-latency responses)
  - `gemini-3.8-flash-high` (High reasoning)
  - `gemini-3.1-pro-high` (Deep architecture)
  - `claude-sonnet-4-6` (Creative writing)
  - `gpt-oss-120b-medium` (Open weights)
- **Document Compilers**: `wkhtmltopdf` (PDF), ImageMagick `convert` (SVG -> PNG)
- **Image Processing**: Python 3.12, OpenCV 4.6, NumPy, PIL
- **Frontend**: Vanilla ES6+, modern CSS with glassmorphic styling, responsive flex/grid layouts.
- **Service Management**: Systemd service `antigravity-studio.service` running on port `3000`.

---

## 💻 Running the Studio

### Service Status
```bash
sudo systemctl status antigravity-studio
```

### Restart Service
```bash
sudo systemctl restart antigravity-studio
```

### View Logs
```bash
journalctl -u antigravity-studio -f
```

### Direct Manual Launch (Development Mode)
```bash
cd /home/ubuntu/antigravity-studio
node server.js
```

---

## 📡 API Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/health` | `GET` | Health check & Antigravity CLI status |
| `/api/models` | `GET` | List available models, themes, and formats |
| `/api/generate/ppt` | `POST` | Generate slide deck JSON & `.pptx` presentation |
| `/api/generate/pdf` | `POST` | Generate styled HTML & `.pdf` document |
| `/api/generate/image` | `POST` | Generate SVG vector graphic & `.png` image |
| `/api/enhance/image` | `POST` | Multipart upload to run 300 DPI upscale & denoising |
| `/outputs/:filename` | `GET` | Serve generated downloads |
