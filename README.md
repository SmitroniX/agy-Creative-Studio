# Antigravity Creative Studio ✨

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FSmitroniX%2Fagy-Creative-Studio)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/SmitroniX/agy-Creative-Studio)
![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Serverless](https://img.shields.io/badge/Architecture-100%25%20Serverless%20%2B%20Fullstack-emerald.svg)

An AI-powered creative design platform that generates print-ready **PDF documents**, professional **PowerPoint (.PPTX) presentations**, and scalable **vector images & graphics**.

Designed to run **100% Serverless** on **Netlify**, **Vercel**, **GitHub Pages**, or as a full-stack Node.js server powered by the **Google Antigravity CLI (`agy`)**.

---

## ⚡ Serverless & Hosted Deployment (Netlify & Vercel)

Antigravity Creative Studio runs anywhere without requiring a dedicated backend server or system binaries:

### Option A: Deploy to Vercel
1. Click the **Deploy with Vercel** button above or import repository `https://github.com/SmitroniX/agy-Creative-Studio` into your Vercel dashboard.
2. (Optional) In the project settings, add an Environment Variable:
   - `GEMINI_API_KEY`: Your Google Gemini API Key (free from [Google AI Studio](https://aistudio.google.com/)).
3. Hit **Deploy** — your studio is live instantly with edge-ready static hosting and `/api/generate` serverless routing configured via [`vercel.json`](./vercel.json).

### Option B: Deploy to Netlify
1. Click the **Deploy to Netlify** button above or connect repository `https://github.com/SmitroniX/agy-Creative-Studio` in Netlify.
2. Build settings are auto-detected from [`netlify.toml`](./netlify.toml):
   - Publish directory: `public`
   - Functions directory: `netlify/functions`
3. (Optional) Add `GEMINI_API_KEY` under **Site configuration > Environment variables**.
4. Deploy!

### 🔑 Zero-Config or Custom API Key
- **Zero-Config Built-in Mode**: Works right away out of the box using client-side intelligent synthesis.
- **Custom Gemini API Key**: Click **Settings (⚙️)** in the top navigation bar to save your own Gemini API key in `localStorage`, or set `GEMINI_API_KEY` in Netlify / Vercel environment variables.

---

## 🚀 Key Features & Generation Capabilities

### 1. 📊 Presentation (PPT) Studio
- **Client-Side .PPTX Compilation**: Generates standard Microsoft PowerPoint (.pptx) files directly in the browser via `PptxGenJS`. Compatible with **PowerPoint, Google Slides, and Apple Keynote**.
- **Interactive In-Browser Presentation Mode**: Fullscreen slide preview, slide counter, and keyboard navigation (← / → / Space / Esc).
- **Intelligent Layouts**:
  - Keynote Title Slides
  - 3-Card Value Proposition Pillars
  - Metric & Statistic Showcases
  - Roadmap & Phase Timelines
  - Impact Conclusion & Next Steps
- **Designer Color Themes**: Modern Dark Tech, Electric Violet, Emerald Growth, Corporate Executive, and Minimal Luxury.

### 2. 📄 PDF Creative Document Studio
- **300+ DPI Print Fidelity**: Real-time vector document generation via `html2pdf.js` and CSS print media engines.
- **Document Archetypes**:
  - **Academic & Achievement Certificates**: Double gold/navy borders, security crests, recipient typography, authority signatures.
  - **Executive & Technical Reports**: IEEE/ACM-style abstracts, KPI benchmark metrics, two-column layouts.
  - **Modern Resumes / CVs**: Structured sidebars, skill tag pills, timeline milestones.
  - **Business Proposals & Invoices**: Itemized deliverables, payment terms, and branding headers.
- **Instant Browser Vector Print & Direct PDF Download**.

### 3. 🎨 Image & Vector Graphic Studio
- **AI Vector Design**: Generates responsive SVG illustrations, abstract technology diagrams, cyber interfaces, and logos.
- **Preset Dimensions**:
  - Social Banners (1200 × 400)
  - Square Posts (1080 × 1080)
  - Creative Posters (800 × 1200)
  - Vector Badges & Art (800 × 800)
- **Multi-Format Export**: Download scalable `.SVG` or rasterize directly to high-resolution `.PNG` via HTML5 Canvas.

### 4. 🔍 Document & Image Enhancer (300+ DPI Engine)
- **Client-Side Canvas Processing**: Enhanced directly inside the browser using high-performance pixel-level filtering.
- **Artifact Removal**: Suppresses JPEG compression noise and halo artifacts around text.
- **Font & Edge Sharpening**: Restores blurry low-resolution typography into crisp, dark glyphs.
- **Background Normalization**: Flattens paper background stains and noise to pure white while preserving stamps and signatures.
- **Instant Side-by-Side Comparison**: Split-view slider showing original vs. enhanced results with 1-click PNG download.

---

## 🛠️ Architecture & Dual-Mode Engine

Antigravity Studio dynamically detects its running environment and selects the best engine:

| Capability | Hosted / Serverless Mode (Netlify / Vercel) | Local Node.js Mode |
| :--- | :--- | :--- |
| **PowerPoint (.pptx)** | Client-side `pptxgen.bundle.js` | Server-side `pptxgenjs` + direct download |
| **PDF Documents** | Client-side `html2pdf.js` + CSS Print Engine | Server-side `wkhtmltopdf` + Browser Print |
| **Images & Vectors** | Client-side SVG + HTML5 Canvas PNG rasterizer | Server-side SVG + ImageMagick / Canvas |
| **300 DPI Enhancement** | Client-side HTML5 Canvas pixel filter pipeline | Python 3 + OpenCV 4 + NumPy super-resolution |
| **AI Synthesis Engine** | Netlify/Vercel functions or Gemini API key in browser | Google Antigravity CLI (`agy`) with multi-model fallback |

---

## 💻 Local Full-Stack Development

If you prefer running locally with Node.js and the Antigravity CLI:

```bash
# Clone the repository
git clone https://github.com/SmitroniX/agy-Creative-Studio.git
cd agy-Creative-Studio

# Install dependencies
npm install

# Start local server
npm start
# Server runs on http://localhost:3000
```

### Systemd Service (Linux Production)
```bash
sudo systemctl status antigravity-studio
sudo systemctl restart antigravity-studio
journalctl -u antigravity-studio -f
```

---

## 📡 API Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/generate` | `POST` | Serverless AI generation endpoint (Netlify/Vercel & Node) |
| `/api/health` | `GET` | Health check & engine status |
| `/api/models` | `GET` | List available models, themes, and formats |
| `/api/generate/ppt` | `POST` | Generate slide deck JSON & `.pptx` presentation |
| `/api/generate/pdf` | `POST` | Generate styled HTML & `.pdf` document |
| `/api/generate/image` | `POST` | Generate SVG vector graphic & `.png` image |
| `/api/enhance/image` | `POST` | Multipart upload for OpenCV 300 DPI upscale & denoising |

---

## 📄 License

MIT License © 2026 [Asmit Jogdand (SmitroniX)](https://github.com/SmitroniX).
