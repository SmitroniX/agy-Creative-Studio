const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');
const { runAgy } = require('./cli');

const DOCUMENT_TYPES = {
  certificate: 'Certificate of Completion / Achievement',
  report: 'Executive & Technical Project Report',
  resume: 'Modern Professional Resume / CV',
  invoice: 'Business Invoice & Project Proposal',
  flyer: 'Creative Event & Marketing Flyer'
};

async function generatePdfDocument(prompt, docType = 'certificate', model = 'gemini-3.8-flash-low') {
  const systemPrompt = `You are an elite document designer and typographer.
Generate a complete, self-contained, beautifully styled HTML document for a: ${DOCUMENT_TYPES[docType] || docType}.
User's topic & requirements: "${prompt}".

CRITICAL DESIGN RULES:
1. Return ONLY pure HTML with complete embedded <style> inside <head>. Do NOT wrap in markdown code blocks.
2. The design MUST look like a world-class, premium, modern creative design (clean typography, crisp borders, rich color gradients, subtle shadows, professional spacing).
3. The page must fit standard A4 paper (@page { size: A4; margin: 0; } body { margin: 0; padding: 25mm 20mm; font-family: 'Helvetica Neue', Arial, sans-serif; box-sizing: border-box; }).
4. For 'certificate': Include elegant double border, institution/issuer header, decorative ribbon/crest, bold recipient name in serif, course/achievement description, date/place, and dual signature lines.
5. For 'report': Include executive header, abstract badge, two-column layout or clean sections, metric table, styled key takeaway callout.
6. For 'resume': Include modern header with contact badges, experience timeline, skills pill tags, education.
7. Use Google Fonts or clean web-safe typography with high contrast.`;

  try {
    let rawHtml = await runAgy(systemPrompt, model);
    // Clean code blocks if present
    rawHtml = rawHtml.replace(/^```(?:html)?\s*/i, '').replace(/```\s*$/i, '').trim();
    if (rawHtml.toLowerCase().includes('<html') || rawHtml.toLowerCase().includes('<!doctype')) {
      return rawHtml;
    }
    throw new Error('Incomplete HTML returned');
  } catch (err) {
    console.warn('Using intelligent fallback document template due to CLI error:', err.message);
    return getFallbackHtml(prompt, docType);
  }
}

function getFallbackHtml(prompt, docType) {
  if (docType === 'certificate') {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Certificate of Achievement</title>
  <style>
    @page { size: A4 portrait; margin: 0; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      font-family: 'Times New Roman', Georgia, serif;
      color: #111827;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    .cert-frame {
      width: 210mm;
      min-height: 297mm;
      padding: 18mm 20mm;
      border: 8px double #831843;
      position: relative;
      background: #fafafa;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 160px;
      color: rgba(131, 24, 67, 0.04);
      font-weight: bold;
      pointer-events: none;
      user-select: none;
      z-index: 0;
    }
    .header {
      text-align: center;
      z-index: 1;
      border-bottom: 2px solid #be185d;
      padding-bottom: 12px;
    }
    .org-title {
      font-size: 26px;
      font-weight: 800;
      letter-spacing: 3px;
      color: #831843;
      text-transform: uppercase;
      margin: 0 0 4px 0;
    }
    .org-sub {
      font-size: 13px;
      letter-spacing: 2px;
      color: #4b5563;
      text-transform: uppercase;
      font-family: Arial, sans-serif;
    }
    .body {
      text-align: center;
      z-index: 1;
      margin: 30px 0;
    }
    .cert-title {
      font-size: 38px;
      font-weight: bold;
      letter-spacing: 4px;
      color: #1f2937;
      text-transform: uppercase;
      margin: 10px 0 6px 0;
    }
    .cert-tagline {
      font-size: 14px;
      font-style: italic;
      color: #6b7280;
      margin-bottom: 24px;
    }
    .cert-intro {
      font-size: 16px;
      line-height: 1.6;
      color: #374151;
      max-width: 580px;
      margin: 0 auto;
    }
    .topic-box {
      font-size: 22px;
      font-weight: bold;
      color: #831843;
      margin: 20px 0;
      padding: 12px 20px;
      border-top: 1px solid #e5e7eb;
      border-bottom: 1px solid #e5e7eb;
      line-height: 1.4;
    }
    .footer {
      display: flex;
      justify-content: space-between;
      margin-top: 40px;
      z-index: 1;
      padding: 0 20px;
    }
    .sig-block {
      text-align: center;
      width: 200px;
    }
    .sig-line {
      border-top: 1.5px solid #111827;
      margin-bottom: 8px;
    }
    .sig-name {
      font-size: 14px;
      font-weight: bold;
    }
    .sig-title {
      font-size: 12px;
      color: #4b5563;
      font-family: Arial, sans-serif;
    }
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
      <div class="cert-tagline">This prestigious credential is duly awarded to</div>
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
        <div class="sig-name">Program Coordinator</div>
        <div class="sig-title">Faculty of Technology</div>
      </div>
    </div>
  </div>
</body>
</html>`;
  }

  // Default clean report
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Executive Report</title>
  <style>
    @page { size: A4; margin: 15mm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      line-height: 1.6;
      margin: 0;
      padding: 0;
    }
    .header {
      border-bottom: 3px solid #3b82f6;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      background: #eff6ff;
      color: #1d4ed8;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    h1 { font-size: 26px; margin: 4px 0 8px 0; color: #1e293b; }
    .meta { font-size: 13px; color: #64748b; }
    .summary-card {
      background: #f8fafc;
      border-left: 4px solid #3b82f6;
      padding: 16px;
      border-radius: 4px;
      margin-bottom: 24px;
    }
    h2 { font-size: 18px; color: #1e3a8a; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-top: 24px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px; }
    th { background: #f1f5f9; text-align: left; padding: 10px; border: 1px solid #cbd5e1; }
    td { padding: 10px; border: 1px solid #cbd5e1; }
  </style>
</head>
<body>
  <div class="header">
    <span class="badge">Antigravity Studio Brief</span>
    <h1>${prompt}</h1>
    <div class="meta">Published: ${new Date().toLocaleDateString()} | Author: Technical Advisory Board</div>
  </div>
  <div class="summary-card">
    <strong>Executive Summary:</strong> This report delivers an exhaustive analysis of strategic objectives, architectural findings, and performance optimizations.
  </div>
  <h2>1. Strategic Objectives</h2>
  <p>To establish a resilient, state-of-the-art framework that accelerates production cycles while upholding rigorous quality standards.</p>
  <h2>2. Benchmark Analysis</h2>
  <table>
    <thead>
      <tr><th>Metric Indicator</th><th>Baseline Value</th><th>Target Value</th><th>Status</th></tr>
    </thead>
    <tbody>
      <tr><td>Execution Latency</td><td>1,420 ms</td><td>&lt; 350 ms</td><td>Achieved</td></tr>
      <tr><td>Design Fidelity</td><td>85%</td><td>99.9%</td><td>Validated</td></tr>
      <tr><td>Throughput Capacity</td><td>50 req/min</td><td>500 req/min</td><td>Surpassed</td></tr>
    </tbody>
  </table>
  <h2>3. Key Takeaways & Recommendations</h2>
  <p>Continuous automated validation and unified styling tokens ensure seamless multi-channel asset generation with zero degradation in visual fidelity.</p>
</body>
</html>`;
}

function compileHtmlToPdf(htmlContent, outputPath) {
  return new Promise((resolve, reject) => {
    const tempHtmlPath = outputPath.replace(/\.pdf$/, '.html');
    fs.writeFileSync(tempHtmlPath, htmlContent, 'utf-8');

    const args = [
      '--page-size', 'A4',
      '--margin-top', '0',
      '--margin-bottom', '0',
      '--margin-left', '0',
      '--margin-right', '0',
      '--enable-local-file-access',
      '--dpi', '300',
      tempHtmlPath,
      outputPath
    ];

    execFile('/usr/bin/wkhtmltopdf', args, (err) => {
      if (err) {
        console.warn('wkhtmltopdf error:', err.message);
        // If wkhtmltopdf fails due to strict margins, try basic conversion
        execFile('/usr/bin/wkhtmltopdf', [tempHtmlPath, outputPath], (err2) => {
          if (err2) return reject(err2);
          resolve(outputPath);
        });
      } else {
        resolve(outputPath);
      }
    });
  });
}

module.exports = {
  DOCUMENT_TYPES,
  generatePdfDocument,
  compileHtmlToPdf
};
