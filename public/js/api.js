// API interaction layer for Dental AI Explainer

import { CONFIG, ERROR_MESSAGES } from './constants.js';
import { findPreGeneratedExplanation } from './pregenerated-data.js';

/**
 * Makes an API call with automatic retry logic
 * @param {Object} payload - The request payload to send
 * @returns {Promise<Object>} - The API response
 * @throws {Error} - If all retry attempts fail
 */
export async function makeApiCallWithRetry(payload) {
    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    };

    let attempts = 0;
    while (attempts < CONFIG.MAX_RETRY_ATTEMPTS) {
        try {
            const response = await fetch(CONFIG.API_ENDPOINT, options);
            
            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch (e) {
                    errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
                }
                
                // Handle specific error codes
                if (response.status === 429) {
                    throw new Error(ERROR_MESSAGES.RATE_LIMIT);
                }
                
                // Properly extract error message
                let errorMsg = ERROR_MESSAGES.API_ERROR;
                if (typeof errorData.error === 'string') {
                    errorMsg = errorData.error;
                } else if (typeof errorData.details === 'string') {
                    errorMsg = errorData.details;
                } else if (errorData.error && typeof errorData.error === 'object') {
                    errorMsg = JSON.stringify(errorData.error);
                } else if (errorData.details && typeof errorData.details === 'object') {
                    errorMsg = JSON.stringify(errorData.details);
                }
                
                throw new Error(`API Error (${response.status}): ${errorMsg}`);
            }
            
            return await response.json();
        } catch (error) {
            attempts++;
            
            // Don't retry on certain errors
            if (error.message.includes('429') || error.message.includes(ERROR_MESSAGES.RATE_LIMIT)) {
                throw error;
            }
            
            // Network errors
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
            }
            
            // If we've exhausted retries, throw the error
            if (attempts >= CONFIG.MAX_RETRY_ATTEMPTS) {
                throw error;
            }
            
            // Exponential backoff
            const delay = Math.pow(2, attempts) * 1000;
            console.log(`Attempt ${attempts} failed. Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

/**
 * Generate explanation for a dental procedure
 * @param {string} procedure - The dental procedure to explain
 * @param {string} patientProfile - Patient age profile
 * @param {string} tone - Explanation style/tone
 * @param {string} systemPrompt - System instruction prompt
 * @returns {Promise<Object>} - API response
 */
export async function generateExplanation(procedure, patientProfile, tone, systemPrompt) {
    // First, check if we have pre-generated content
    const preGenerated = await findPreGeneratedExplanation(procedure, patientProfile, tone);
    
    if (preGenerated) {
        // Return in same format as API response
        return {
            candidates: [{
                content: {
                    parts: [{ text: preGenerated }],
                    role: 'model'
                },
                finishReason: 'STOP',
                index: 0,
                safetyRatings: []
            }],
            usageMetadata: { cached: true }
        };
    }
    
    // Fallback to API if no pre-generated content
    const userQuery = `Explain the dental procedure "${procedure}" to ${patientProfile}. Use a "${tone}" style.`;
    
    const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] }
    };
    
    return await makeApiCallWithRetry(payload);
}

/**
 * Generate aftercare tips
 * @param {string} procedure - The dental procedure
 * @param {string} patientProfile - Patient age profile
 * @param {string} systemPrompt - System instruction prompt
 * @returns {Promise<Object>} - API response
 */
export async function generateAftercare(procedure, patientProfile, systemPrompt) {
    const userQuery = `What are general aftercare tips for ${patientProfile} after a "${procedure}" procedure?`;
    
    const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] }
    };
    
    return await makeApiCallWithRetry(payload);
}

/**
 * Ask a follow-up question
 * @param {string} question - The follow-up question
 * @param {string} procedure - The context procedure
 * @param {string} patientProfile - Patient age profile
 * @param {string} systemPrompt - System instruction prompt
 * @returns {Promise<Object>} - API response
 */
export async function askFollowUpQuestion(question, procedure, patientProfile, systemPrompt) {
    const userQuery = `Context: Procedure is "${procedure}", patient is ${patientProfile}. Question: "${question}". Provide a simple answer.`;
    
    const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] }
    };
    
    return await makeApiCallWithRetry(payload);
}

/**
 * Generate anxiety management tips
 * @param {string} procedure - The dental procedure
 * @param {string} patientProfile - Patient age profile
 * @param {string} systemPrompt - System instruction prompt
 * @returns {Promise<Object>} - API response
 */
export async function generateAnxietyTips(procedure, patientProfile, systemPrompt) {
    const userQuery = `A patient (${patientProfile}) is feeling anxious about their upcoming "${procedure}" procedure. What are some simple tips to help them manage their anxiety before and during the appointment?`;
    
    const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] }
    };
    
    return await makeApiCallWithRetry(payload);
}

/**
 * Translate text to target language
 * @param {string} text - The text to translate
 * @param {string} targetLanguage - Target language
 * @param {string} systemPrompt - System instruction prompt
 * @returns {Promise<Object>} - API response
 */
export async function translateText(text, targetLanguage, systemPrompt) {
    const userQuery = `Translate the following text into ${targetLanguage}:\n\n---\n\n${text}`;
    
    const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] }
    };
    
    return await makeApiCallWithRetry(payload);
}
