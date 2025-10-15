const fetch = require('node-fetch');

// Helper to create JSON responses with CORS headers
function jsonResponse(statusCode, body) {
  return {
    statusCode,
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS'
    }
  };
}

exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      }
    };
  }

  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method Not Allowed' });
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
    if (!payload.prompt) {
      return jsonResponse(400, { error: '"prompt" is a required field.' });
    }
  } catch (err) {
    return jsonResponse(400, { error: 'Invalid JSON in request body.' });
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return jsonResponse(500, { error: 'API key not configured on the server.' });
  }

  const systemPrompt = `You are a skilled SVG diagram generator. Create a simple, clean, and patient-friendly SVG diagram based on the user's request.
  **RULES:**
  1.  **SVG Only:** The entire output MUST be a valid, self-contained SVG. Do not include any other text, markdown, or explanations.
  2.  **Unique IDs:** Every distinct, clickable part of the diagram (e.g., a tooth, a crown, the gum line, an implant) MUST have a unique and descriptive ID (e.g., id="tooth-enamel", id="gum-line"). This is critical for interactivity. Use lowercase and hyphens for IDs.
  3.  **Labels:** Add simple, clear <text> labels to the important parts of the diagram. Position them so they are readable.
  4.  **Styling:** Use inline CSS for styling (fill, stroke, font-size). Keep colors simple and professional. For example, use shades of white/ivory for teeth, pink for gums, and light blue or gray for instruments.
  5.  **ViewBox:** Ensure the SVG has a viewBox attribute for scalability. A good default is "0 0 100 100".
  6.  **Simplicity:** The diagram should be illustrative and not overly technical or anatomically perfect. Think friendly, simple shapes.`;

  const requestBody = {
    contents: [{
      parts: [{ text: payload.prompt }]
    }],
    systemInstruction: {
      parts: [{ text: systemPrompt }]
    }
  };

  const apiUrl = \`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-preview-0514:generateContent?key=\${apiKey}\`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      // If the response is not OK, the body might not be JSON.
      // Read it as text to be safe and log it for debugging.
      const errorText = await response.text();
      console.error('Upstream API Error Response:', errorText);

      // Try to parse it as JSON for a structured error, but fall back to the raw text.
      let errorDetails;
      try {
          errorDetails = JSON.parse(errorText);
      } catch (e) {
          errorDetails = errorText; // It wasn't JSON, so use the raw text.
      }
      return jsonResponse(response.status, { error: 'Upstream API error', details: errorDetails });
    }

    // If response is OK, we expect it to be JSON.
    const result = await response.json();
    const svgContent = result.candidates[0]?.content?.parts[0]?.text;

    if (!svgContent) {
      // Log the full successful response if we can't find the SVG content
      console.error("Could not find svgContent in the successful API response:", JSON.stringify(result, null, 2));
      return jsonResponse(500, { error: 'Failed to parse SVG content from a successful API response.' });
    }

    // Return the SVG content directly with an appropriate content type
    return {
      statusCode: 200,
      body: JSON.stringify({ svg: svgContent }), // Send as JSON object
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    };

  } catch (error) {
    console.error('Serverless Function Error:', error);
    return jsonResponse(500, { error: 'An internal server error occurred.' });
  }
};