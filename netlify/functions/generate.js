// Netlify Serverless Function for AI Generation
exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ status: 'ok', platform: 'Netlify Functions' })
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { prompt, systemPrompt, apiKey } = body;
    const key = apiKey || process.env.GEMINI_API_KEY;

    if (!key) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          fallback: true,
          message: 'No GEMINI_API_KEY configured. Using client-side generation.'
        })
      };
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

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, text })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message, fallback: true })
    };
  }
};
