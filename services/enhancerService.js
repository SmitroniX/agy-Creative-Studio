const { execFile } = require('child_process');
const path = require('path');

function enhanceImage(inputPath, outputPngPath, outputPdfPath = null, scale = 3) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, 'enhance.py');
    const args = [
      scriptPath,
      inputPath,
      outputPngPath,
      outputPdfPath || 'none',
      String(scale)
    ];

    execFile('/usr/bin/python3', args, (err, stdout, stderr) => {
      if (err) {
        console.error('Enhance script error:', stderr || err.message);
        return reject(err);
      }
      resolve({ outputPngPath, outputPdfPath });
    });
  });
}

module.exports = {
  enhanceImage
};
