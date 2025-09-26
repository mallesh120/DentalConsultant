const fetch = require('node-fetch');

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'POST, OPTIONS, GET'
    }
  };
}

exports.handler = async function (event, context) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS, GET'
      },
      body: ''
    };
  }

  if (event.httpMethod === 'GET') {
    return jsonResponse(200, { status: 'ok' });
  }

  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method Not Allowed' });
  }

  let body;
  try {
    let raw = event.body;
    if (event.isBase64Encoded && raw) raw = Buffer.from(raw, 'base64').toString('utf8');
    body = raw ? JSON.parse(raw) : null;
  } catch (err) {
    return jsonResponse(400, { error: 'Invalid JSON' });
  }

  if (!body || !body.prompt) return jsonResponse(400, { error: 'Missing prompt' });

  const apiKey = process.env.IMAGE_API_KEY;
  const apiUrl = process.env.IMAGE_API_URL || 'https://api.example-image.com/v1/generate';
  if (!apiKey) return jsonResponse(500, { error: 'Image API key not configured on the server.' });

  const TIMEOUT_MS = 30000;
  const hasAbort = typeof global.AbortController === 'function';

  try {
    let resp;
    const payload = { prompt: body.prompt, width: body.width || 1024, height: body.height || 768, style: body.style || 'simple_cartoon' };

    if (hasAbort) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
      try {
        resp = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
          body: JSON.stringify(payload),
          signal: controller.signal
        });
      } finally {
        clearTimeout(timeout);
      }
    } else {
      const fetchPromise = fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify(payload)
      });
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), TIMEOUT_MS));
      resp = await Promise.race([fetchPromise, timeoutPromise]);
    }

    const text = await resp.text();
    let data;
    try { data = text ? JSON.parse(text) : null; } catch (e) { data = { raw: text }; }

    if (!resp.ok) {
      console.error('Image API error', resp.status, data);
      return jsonResponse(resp.status || 502, { error: 'Upstream Image API error', details: data });
    }

    // Expected: { image_url: 'https://...' } or { b64_json: '...' }
    return jsonResponse(200, data || {});

  } catch (error) {
    if (error.name === 'AbortError') return jsonResponse(504, { error: 'Upstream request timed out' });
    console.error('Serverless Function Error:', error);
    return jsonResponse(500, { error: 'An internal server error occurred.' });
  }
};
