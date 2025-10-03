// netlify/functions/generate-image.js
const fetch = require('node-fetch');

// Helper to create consistent JSON responses with CORS headers
function jsonResponse(statusCode, body) {
    return {
        statusCode,
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*', // Allow requests from any origin
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Methods': 'POST, OPTIONS, GET'
        }
    };
}

exports.handler = async function (event, context) {
    // Handle CORS preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 204, // No Content
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

    // Ensure the request is a POST
    if (event.httpMethod !== 'POST') {
        return jsonResponse(405, { error: 'Method Not Allowed' });
    }

    try {
        const { prompt } = JSON.parse(event.body);
        const apiKey = process.env.GOOGLE_API_KEY;

        // Validate API key and prompt
        if (!apiKey) {
            console.error("GOOGLE_API_KEY is not configured.");
            return jsonResponse(500, { error: "API key not configured on the server." });
        }
        if (!prompt) {
            return jsonResponse(400, { error: "A 'prompt' is required in the request body." });
        }

        // Define the API endpoint for Imagen 3
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;

        const payload = {
            instances: [{ prompt }],
            parameters: { "sampleCount": 1 }
        };

        const apiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const result = await apiResponse.json();

        // Check for errors from the Imagen API
        if (!apiResponse.ok || !result.predictions?.[0]?.bytesBase64Encoded) {
            console.error("Imagen API Error:", result);
            const errorDetail = result.error?.message || JSON.stringify(result);
            return jsonResponse(apiResponse.status, { error: "Failed to generate image.", details: errorDetail });
        }

        const base64Data = result.predictions[0].bytesBase64Encoded;
        const imageUrl = `data:image/png;base64,${base64Data}`;

        // Success
        return jsonResponse(200, { imageUrl });

    } catch (error) {
        console.error("Serverless Function Error:", error);
        return jsonResponse(500, { error: "An internal server error occurred." });
    }
};