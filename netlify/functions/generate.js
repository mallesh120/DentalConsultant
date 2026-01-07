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

  const apiKey = process.env.HUGGINGFACE_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return jsonResponse(500, { error: 'API key not configured on the server.' });
  }

  // Try Hugging Face first if key is available, fallback to Google Gemini
  const useHuggingFace = process.env.HUGGINGFACE_API_KEY ? true : false;
  
  let apiUrl, headers, finalPayload;
  
  if (useHuggingFace) {
    // Hugging Face Inference API
    const hfModel = 'mistralai/Mixtral-8x7B-Instruct-v0.1';
    apiUrl = `https://api-inference.huggingface.co/models/${hfModel}`;
    
    headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    };
    
    // Convert Gemini format to Hugging Face format
    const { contents, systemInstruction } = payload;
    const userMessage = contents[0]?.parts[0]?.text || '';
    const systemMessage = systemInstruction?.parts[0]?.text || '';
    
    const prompt = systemMessage 
      ? `<s>[INST] ${systemMessage}\n\n${userMessage} [/INST]`
      : `<s>[INST] ${userMessage} [/INST]`;
    
    finalPayload = {
      inputs: prompt,
      parameters: {
        max_new_tokens: 1000,
        temperature: 0.7,
        top_p: 0.95,
        return_full_text: false
      }
    };
  } else {
    // Google Gemini API (fallback)
    apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    headers = { 'Content-Type': 'application/json' };
    finalPayload = payload;
  }

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
          headers: headers,
          body: JSON.stringify(finalPayload),
          signal: controller.signal
        });
      } finally {
        clearTimeout(timeout);
      }
    } else {
      // Fallback for older runtimes: race the fetch against a timeout
      const fetchPromise = fetch(apiUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(finalPayload)
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

    // Convert response to Gemini-compatible format if using Hugging Face
    if (useHuggingFace) {
      const hfResponse = Array.isArray(data) ? data[0] : data;
      const generatedText = hfResponse.generated_text || hfResponse.raw || '';
      
      const geminiFormat = {
        candidates: [{
          content: {
            parts: [{ text: generatedText }],
            role: 'model'
          },
          finishReason: 'STOP',
          index: 0
        }]
      };
      return jsonResponse(200, geminiFormat);
    } else {
      // Already in Gemini format
      return jsonResponse(200, data || {});
    }

  } catch (error) {
    if (error.name === 'AbortError') {
      return jsonResponse(504, { error: 'Upstream request timed out' });
    }
    console.error('Serverless Function Error:', error);
    return jsonResponse(500, { error: 'An internal server error occurred.' });
  }
};
