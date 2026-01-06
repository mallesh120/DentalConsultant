// Configuration constants for Dental AI Explainer

export const CONFIG = {
    // API Configuration
    API_ENDPOINT: '/api/generate',
    API_TIMEOUT_MS: 25000,
    MAX_RETRY_ATTEMPTS: 4,
    
    // Input Validation
    MAX_PROCEDURE_LENGTH: 200,
    MIN_PROCEDURE_LENGTH: 2,
    MAX_FOLLOWUP_LENGTH: 500,
    
    // UI Configuration
    COPY_FEEDBACK_DURATION: 2000,
    MODAL_TRANSITION_DELAY: 200,
    
    // AI Model Configuration
    MODEL_NAME: 'Mixtral-8x7B (Hugging Face)',
    USE_PREGENERATED: true
};

export const PROMPTS = {
    SYSTEM_EXPLANATION: `You are an empathetic dental assistant AI. Explain complex dental procedures simply.
**Rules:**
1.  **No Medical Advice:** State this is not medical advice.
2.  **Disclaimer First:** Start with: "Please note: This is a simplified educational explanation and not medical advice. Always discuss any specific questions or concerns with your dentist."
3.  **Factual & Simple:** Use reputable sources. Translate dental terms into simple language.
4.  **Calm Tone:** Be reassuring and professional.`,

    SYSTEM_AFTERCARE: `You are a dental assistant AI. Generate a simple, bulleted list of common aftercare instructions.
**Rules:**
1.  **Disclaimer First:** Start with: "Important: These are general tips. Your dentist will provide instructions specific to your situation. Call your dental office if you have severe pain, bleeding, or swelling."
2.  **Actionable Tips:** Focus on eating, pain management, and cleaning.`,

    SYSTEM_FOLLOWUP: `You are a dental assistant AI. A patient has a follow-up question. Answer simply and reassuringly.
**Rules:**
1.  **No Medical Advice:** Reiterate this is educational.
2.  **Stay on Topic:** Directly answer the question in context.
3.  **Complex Questions:** If complex, advise speaking to their dentist.`,

    SYSTEM_ANXIETY: `You are an empathetic dental assistant AI. Create a list of reassuring, practical tips for a patient who is nervous about an upcoming dental procedure.
**Rules:**
1. **Non-Medical:** These are coping strategies, not medical advice.
2. **Positive Framing:** Use positive and calming language.
3. **Actionable:** Provide concrete actions the patient can take.`,

    SYSTEM_TRANSLATION: `You are an expert multilingual translator specializing in medical and dental terminology. Your task is to translate the provided text accurately and clearly into the target language, maintaining a simple, patient-friendly tone.`
};

export const ERROR_MESSAGES = {
    EMPTY_PROCEDURE: 'Please enter a dental procedure or term.',
    PROCEDURE_TOO_SHORT: 'Procedure name is too short. Please be more specific.',
    PROCEDURE_TOO_LONG: 'Procedure name is too long. Please keep it under 200 characters.',
    NETWORK_ERROR: 'Network error. Please check your connection and try again.',
    API_ERROR: 'Unable to get a response. Please try again.',
    TIMEOUT_ERROR: 'Request timed out. Please try again.',
    RATE_LIMIT: 'Too many requests. Please wait a moment and try again.',
    EMPTY_RESPONSE: 'Sorry, the response from the model was empty. Please try again.',
    BLOCKED_QUERY: 'This AI tool is designed for dental topics. Your request was outside this scope. Please enter a dental term.'
};

export const ARIA_LABELS = {
    LOADING: 'Loading content, please wait',
    ERROR: 'Error message',
    SUCCESS: 'Content loaded successfully',
    GENERATE_BTN: 'Generate dental procedure explanation',
    COPY_BTN: 'Copy explanation to clipboard',
    AFTERCARE_BTN: 'Generate aftercare tips',
    FOLLOWUP_BTN: 'Ask follow-up question',
    ANXIETY_BTN: 'Get help with dental anxiety',
    TRANSLATE_BTN: 'Translate explanation',
    MODAL_CLOSE: 'Close dialog'
};

export const ALLOWED_HTML_TAGS = ['p', 'strong', 'em', 'ol', 'ul', 'li', 'h3', 'br', 'a', 'blockquote'];
export const ALLOWED_HTML_ATTRS = ['href', 'target', 'rel'];
