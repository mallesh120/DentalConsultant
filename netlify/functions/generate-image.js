// netlify/functions/generate-image.js
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
            statusCode: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Allow-Methods': 'POST, OPTIONS, GET'
            },
            body: ''
        };
    }

    if (event.httpMethod !== 'POST') {
        return jsonResponse(405, { error: 'Method Not Allowed' });
    }

    try {
        const { prompt, language } = JSON.parse(event.body);
        const apiKey = process.env.GOOGLE_API_KEY;

        if (!apiKey) {
            return jsonResponse(500, { error: "API key not configured." });
        }
        if (!prompt) {
            return jsonResponse(400, { error: "Prompt is missing." });
        }

        // Use the correct endpoint for the Generative Language API with a model that supports the language parameter.
        // NOTE: The documentation was conflicting. The `language` parameter is part of the Vertex AI API,
        // which uses a different authentication method. The generativelanguage.googleapis.com endpoint
        // does not officially support the language parameter.
        // The best approach is to rely on a newer model and strong prompt instructions.
        const model = 'imagegeneration@006'; // A more recent, stable model.
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        // The frontend is already adding language instructions to the prompt.
        const payload = {
            contents: [{
                parts: [{ text: prompt }]
            }],
            // The 'language' parameter is not supported on this endpoint.
            // We rely on the frontend to provide language instructions in the prompt.
        };

        const apiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const result = await apiResponse.json();

        // The response structure for generateContent is different from predict.
        const base64Data = result?.candidates?.[0]?.content?.parts?.[0]?.fileData?.fileUri;

        if (!apiResponse.ok || !base64Data) {
            console.error("Imagen API Error:", result);
            const errorDetail = result.error?.message || JSON.stringify(result);
            return jsonResponse(apiResponse.status, { error: "Failed to generate image.", details: errorDetail });
        }

        // The API returns a data URI directly in this case.
        return jsonResponse(200, { imageUrl: base64Data });

    } catch (error) {
        console.error("Serverless Function Error:", error);
        return jsonResponse(500, { error: "Internal server error." });
    }
};