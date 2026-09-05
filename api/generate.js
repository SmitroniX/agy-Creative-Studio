// Vercel Serverless Function for AI Generation
module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'ok',
      platform: 'Vercel Serverless',
      timestamp: new Date().toISOString()
    });
  }

  try {
    const { prompt, systemPrompt, apiKey } = req.body || {};
    const key = apiKey || process.env.GEMINI_API_KEY;

    if (!key) {
      return res.status(200).json({
        fallback: true,
        message: 'No GEMINI_API_KEY configured in serverless environment. Client will use intelligent client-side generation engine.'
      });
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
    const fullPrompt = systemPrompt ? `${systemPrompt}\n\nUser Request: ${prompt}` : prompt;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }]
      })
    });

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return res.status(200).json({
      success: true,
      text
    });
  } catch (err) {
    console.error('Serverless error:', err);
    return res.status(500).json({ error: err.message, fallback: true });
  }
};
