// server.js
// This is the backend that securely handles API calls to Google AI.

const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config(); // Load environment variables from a .env file

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON request bodies
app.use(express.static('public')); // Serve the index.html file from the 'public' directory

// The secure endpoint that the frontend will call
app.post('/api/generate', async (req, res) => {
    const payload = req.body;
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: "API key not configured on the server." });
    }
    if (!payload) {
        return res.status(400).json({ error: "Request body is missing." });
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    try {
        const apiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!apiResponse.ok) {
            const errorText = await apiResponse.text();
            // Forward the error from the Google API to the client for better debugging
            return res.status(apiResponse.status).json({ 
                error: `Google AI API Error: ${apiResponse.statusText}`,
                details: errorText 
            });
        }

        const data = await apiResponse.json();
        res.status(200).json(data); // Send the successful response back to the frontend

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "An internal server error occurred." });
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
    console.log(`Access the app at http://localhost:${port}`);
});

