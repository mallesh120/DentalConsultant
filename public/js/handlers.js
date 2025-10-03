import * as dom from './dom.js';
import * as ui from './ui.js';
import * as api from './api.js';

// State
let currentProcedure = '';
let currentPatientProfile = '';

export async function generateExplanation() {
    currentProcedure = dom.procedureInput.value.trim();
    dom.errorMessageDiv.textContent = '';
    if (!currentProcedure) {
        dom.errorMessageDiv.textContent = 'Please enter a dental procedure or term.';
        return;
    }
    currentPatientProfile = dom.patientAgeSelect.value;
    const tone = dom.toneSelect.value;

    dom.outputContainer.style.display = 'block';
    dom.outputDiv.style.display = 'none';
    dom.followUpContainer.style.display = 'none';
    dom.citationsContainer.style.display = 'none';
    dom.loader.style.display = 'flex';
    dom.generateBtn.disabled = true;
    dom.generateBtn.classList.add('opacity-50', 'cursor-not-allowed');

    const systemPrompt = `You are an empathetic dental assistant AI. Explain complex dental procedures simply.
        **Rules:**
        1.  **No Medical Advice:** State this is not medical advice.
        2.  **Disclaimer First:** Start with: "Please note: This is a simplified educational explanation and not medical advice. Always discuss any specific questions or concerns with your dentist."
        3.  **Factual & Simple:** Use reputable sources. Translate dental terms into simple language.
        4.  **Calm Tone:** Be reassuring and professional.`;
    const userQuery = `Explain the dental procedure "${currentProcedure}" to ${currentPatientProfile}. Use a "${tone}" style.`;
    const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        tools: [{ "google_search": {} }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
    };

    try {
        const result = await api.makeApiCallWithRetry(payload);
        if (!result) return;
        ui.displayResult(result, dom.outputDiv, { container: dom.citationsContainer, linksDiv: dom.citationLinks });
        if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
             dom.followUpContainer.style.display = 'block';
        }
        // Clear previous follow-up results
        [dom.aftercareOutput, dom.followUpOutput, dom.anxietyOutput, dom.translateOutput].forEach(el => el.style.display = 'none');
    } catch (error) {
        console.error("Error:", error);
        dom.outputDiv.innerText = `An error occurred. Please try again.\n\n${error.message}`;
        dom.outputDiv.style.display = 'block';
    } finally {
        dom.loader.style.display = 'none';
        dom.generateBtn.disabled = false;
        dom.generateBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
}

export async function generateAftercare() {
    ui.setLoadingState(dom.aftercareLoader, dom.aftercareBtn, true);
    dom.aftercareOutput.style.display = 'none';

    const systemPrompt = `You are a dental assistant AI. Generate a simple, bulleted list of common aftercare instructions.
        **Rules:**
        1.  **Disclaimer First:** Start with: "Important: These are general tips. Your dentist will provide instructions specific to your situation. Call your dental office if you have severe pain, bleeding, or swelling."
        2.  **Actionable Tips:** Focus on eating, pain management, and cleaning.`;
    const userQuery = `What are general aftercare tips for ${currentPatientProfile} after a "${currentProcedure}" procedure?`;

    try {
        const result = await api.makeApiCallWithRetry({
            contents: [{ parts: [{ text: userQuery }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
        });
        if (result) ui.displayResult(result, dom.aftercareOutput);
    } catch (error) {
        console.error("Aftercare Error:", error);
        dom.aftercareOutput.innerText = `An error occurred: ${error.message}`;
    } finally {
        ui.setLoadingState(dom.aftercareLoader, dom.aftercareBtn, false);
    }
}

export async function askFollowUp() {
    const question = dom.followUpInput.value.trim();
    if (!question) return;

    ui.setLoadingState(dom.followUpLoader, dom.followUpBtn, true);
    dom.followUpOutput.style.display = 'none';

    const systemPrompt = `You are a dental assistant AI. A patient has a follow-up question. Answer simply and reassuringly.
        **Rules:**
        1.  **No Medical Advice:** Reiterate this is educational.
        2.  **Stay on Topic:** Directly answer the question in context.
        3.  **Complex Questions:** If complex, advise speaking to their dentist.`;
    const userQuery = `Context: Procedure is "${currentProcedure}", patient is ${currentPatientProfile}. Question: "${question}". Provide a simple answer.`;

    try {
        const result = await api.makeApiCallWithRetry({
            contents: [{ parts: [{ text: userQuery }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
        });
        if (result) {
            ui.displayResult(result, dom.followUpOutput);
            dom.followUpInput.value = '';
        }
    } catch (error) {
        console.error("Follow-up Error:", error);
        dom.followUpOutput.innerText = `An error occurred: ${error.message}`;
    } finally {
        ui.setLoadingState(dom.followUpLoader, dom.followUpBtn, false);
    }
}

export async function generateAnxietyTips() {
    ui.setLoadingState(dom.anxietyLoader, dom.anxietyBtn, true);
    dom.anxietyOutput.style.display = 'none';

    const systemPrompt = `You are an empathetic dental assistant AI. Create a list of reassuring, practical tips for a patient who is nervous about an upcoming dental procedure.
        **Rules:**
        1. **Non-Medical:** These are coping strategies, not medical advice.
        2. **Positive Framing:** Use positive and calming language.
        3. **Actionable:** Provide concrete actions the patient can take.`;
    const userQuery = `A patient (${currentPatientProfile}) is feeling anxious about their upcoming "${currentProcedure}" procedure. What are some simple tips to help them manage their anxiety before and during the appointment?`;

    try {
        const result = await api.makeApiCallWithRetry({
            contents: [{ parts: [{ text: userQuery }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
        });
        if (result) ui.displayResult(result, dom.anxietyOutput);
    } catch (error) {
        console.error("Anxiety Tips Error:", error);
        dom.anxietyOutput.innerText = `An error occurred: ${error.message}`;
    } finally {
        ui.setLoadingState(dom.anxietyLoader, dom.anxietyBtn, false);
    }
}

export async function translateText() {
    const targetLanguage = dom.languageSelect.value;
    const originalText = dom.outputDiv.innerText;
    if (!originalText) return;

    ui.setLoadingState(dom.translateLoader, dom.translateBtn, true);
    dom.translateOutput.style.display = 'none';

    const systemPrompt = `You are an expert multilingual translator specializing in medical and dental terminology. Your task is to translate the provided text accurately and clearly into the target language, maintaining a simple, patient-friendly tone.`;
    const userQuery = `Translate the following text into ${targetLanguage}:\n\n---\n\n${originalText}`;

    try {
        const result = await api.makeApiCallWithRetry({
            contents: [{ parts: [{ text: userQuery }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
        });
        if (result) ui.displayResult(result, dom.translateOutput);
    } catch (error) {
        console.error("Translation Error:", error);
        dom.translateOutput.innerText = `An error occurred: ${error.message}`;
    } finally {
        ui.setLoadingState(dom.translateLoader, dom.translateBtn, false);
    }
}

export async function createSimpleDiagram() {
    // Use currentProcedure if available otherwise prompt for a procedure
    const subject = currentProcedure || dom.procedureInput.value.trim() || 'dental crown placement';
    const language = dom.languageSelect.value || 'English'; // Default to English if nothing is selected
    let prompt = `Create a very simple, clear, cartoon-style diagram explaining how a ${subject} is done for a patient. Use simple shapes, label the important parts (tooth, crown, gum), and avoid detailed anatomy. Keep colors limited and the style friendly and child-appropriate.`;

    // Add a specific instruction for the language
    prompt += ` IMPORTANT: All text and labels in the diagram must be written in ${language}.`;

    dom.generateImageBtn.disabled = true;
    dom.generateImageBtn.classList.add('opacity-50');
    dom.imageContainer.style.display = 'none'; // Hide previous image

    try {
        const data = await api.makeApiCallWithRetry({ prompt }, '/api/generate-image');

        // The backend function returns { imageUrl: "data:image/png;base64,..." }
        if (data.imageUrl) {
            dom.generatedImage.src = data.imageUrl;
            dom.imageContainer.style.display = 'flex'; // Use flex to be consistent with other styles
        } else {
            throw new Error('No image data found in the API response.');
        }

    } catch (error) {
        console.error('Image generation error:', error);
        ui.showModal('Image Generation Failed', error.message || 'An unknown error occurred.');
    } finally {
        dom.generateImageBtn.disabled = false;
        dom.generateImageBtn.classList.remove('opacity-50');
    }
}