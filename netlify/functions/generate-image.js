// netlify/functions/generate-image.js
// This is the new serverless backend function for image generation using Imagen 3.

const fetch = require('node-fetch');

exports.handler = async function (event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { prompt } = JSON.parse(event.body);
        const apiKey = process.env.GOOGLE_API_KEY;

        if (!apiKey) {
            return { statusCode: 500, body: JSON.stringify({ error: "API key not configured." }) };
        }
        if (!prompt) {
            return { statusCode: 400, body: JSON.stringify({ error: "Prompt is missing." }) };
        }

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

        if (!apiResponse.ok || !result.predictions?.[0]?.bytesBase64Encoded) {
            console.error("Imagen API Error:", result);
            return { statusCode: apiResponse.status, body: JSON.stringify(result) };
        }

        const base64Data = result.predictions[0].bytesBase64Encoded;
        const imageUrl = `data:image/png;base64,${base64Data}`;

        return {
            statusCode: 200,
            body: JSON.stringify({ imageUrl }),
            headers: { 'Content-Type': 'application/json' },
        };

    } catch (error) {
        console.error("Serverless Function Error:", error);
        return { statusCode: 500, body: JSON.stringify({ error: "Internal server error." }) };
    }
};
