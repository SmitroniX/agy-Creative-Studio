const { execFile } = require('child_process');
const fs = require('fs');

const AGY_BIN = fs.existsSync('/root/.local/bin/agy') 
  ? '/root/.local/bin/agy' 
  : 'agy';

function runAgy(prompt, model = 'gemini-3.8-flash-low', timeoutMs = 60000) {
  return new Promise((resolve, reject) => {
    const args = [
      '-p', prompt,
      '--model', model,
      '--output-format', 'text'
    ];

    execFile(AGY_BIN, args, { timeout: timeoutMs, maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        console.warn('agy execution warning/error:', error.message);
        // If we got stdout despite non-zero code, check if it has content
        if (stdout && stdout.trim().length > 0) {
          return resolve(stdout.trim());
        }
        return reject(error);
      }
      resolve(stdout.trim());
    });
  });
}

function extractJSON(text) {
  // Try direct parse first
  try {
    return JSON.parse(text);
  } catch (e) {}

  // Look for ```json ... ``` blocks
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1]);
    } catch (e) {}
  }

  // Look for any outermost { ... }
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end > start) {
    try {
      return JSON.parse(text.slice(start, end + 1));
    } catch (e) {}
  }

  throw new Error('Failed to extract valid JSON from CLI response');
}

module.exports = {
  runAgy,
  extractJSON,
  AGY_BIN
};
