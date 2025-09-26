const fetch = require('node-fetch');

// A small helper to create JSON responses with CORS headers
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
  // Allow preflight
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

  // Basic health check
  if (event.httpMethod === 'GET') {
    return jsonResponse(200, { status: 'ok' });
  }

  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method Not Allowed' });
  }

  let payload;
  try {
    let rawBody = event.body;
    if (event.isBase64Encoded && rawBody) {
      rawBody = Buffer.from(rawBody, 'base64').toString('utf8');
    }
    if (!rawBody) {
      return jsonResponse(400, { error: 'Request body is required' });
    }
    // Only parse if it's a string
    payload = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
  } catch (err) {
    return jsonResponse(400, { error: 'Invalid JSON in request body' });
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return jsonResponse(500, { error: 'API key not configured on the server.' });
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

  // Timeout handling: prefer AbortController when available, otherwise fallback to Promise.race
  const TIMEOUT_MS = 25_000;
  const hasAbort = typeof global.AbortController === 'function';

  try {
    let resp;
    if (hasAbort) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
      try {
        resp = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal
        });
      } finally {
        clearTimeout(timeout);
      }
    } else {
      // Fallback for older runtimes: race the fetch against a timeout
      const fetchPromise = fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), TIMEOUT_MS)
      );
      resp = await Promise.race([fetchPromise, timeoutPromise]);
    }

    const text = await resp.text();

    // Try parsing JSON, but handle non-JSON responses gracefully
    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (e) {
      // Not JSON — return raw text
      data = { raw: text };
    }

    if (!resp.ok) {
      console.error('Upstream API error', resp.status, data);
      return jsonResponse(resp.status || 502, { error: 'Upstream API error', details: data });
    }

    return jsonResponse(200, data || {});

  } catch (error) {
    if (error.name === 'AbortError') {
      return jsonResponse(504, { error: 'Upstream request timed out' });
    }
    console.error('Serverless Function Error:', error);
    return jsonResponse(500, { error: 'An internal server error occurred.' });
  }
};
