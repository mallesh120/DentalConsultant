import * as dom from './dom.js';
import * as ui from './ui.js';
import * as api from './api.js';
import * as history from './history.js';

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

async function handleSvgPartClick(event) {
    const partId = event.target.id;
    if (!partId) return;

    // Remove any existing tooltips immediately
    ui.removeExistingTooltip();

    const prompt = `In one very simple sentence, explain what "${partId.replace(/-/g, ' ')}" is in the context of a dental procedure.`;
    const systemPrompt = "You are a dental assistant AI. Provide a one-sentence, patient-friendly definition for the given dental term. Do not add any disclaimers.";

    try {
        const result = await api.makeApiCallWithRetry({
            contents: [{ parts: [{ text: prompt }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
        });

        const explanation = result.candidates[0]?.content?.parts[0]?.text;
        if (explanation) {
            ui.showTooltip(explanation, event.target);
        }
    } catch (error) {
        console.error("SVG Click-to-learn Error:", error);
        // Optionally show a small error tooltip
        ui.showTooltip("Could not load explanation.", event.target);
    }
}


export async function generateInteractiveDiagram() {
    const subject = currentProcedure || dom.procedureInput.value.trim();
    if (!subject) {
        ui.showModal('Cannot Generate Diagram', 'Please generate an explanation for a procedure first.');
        return;
    }

    const prompt = `Generate a simple, patient-friendly SVG diagram illustrating the dental procedure: "${subject}". Key elements to include are the tooth, gum, and any relevant tools or prosthetics (like a crown or implant). Make sure each key element has a unique ID, like 'tooth', 'gum', 'crown'.`;

    ui.setLoadingState(dom.generateImageBtn, dom.generateImageBtn, true);
    dom.imageContainer.style.display = 'none';
    dom.imageContainer.innerHTML = ''; // Clear previous SVG

    try {
        const data = await api.makeApiCallWithRetry({ prompt }, '/api/generate-svg-diagram');

        if (data.svg) {
            dom.imageContainer.innerHTML = data.svg;
            dom.imageContainer.style.display = 'flex';

            // Add click listeners to all elements with an ID within the SVG
            const svgElementsWithIds = dom.imageContainer.querySelectorAll('svg [id]');
            svgElementsWithIds.forEach(el => {
                el.addEventListener('click', handleSvgPartClick);
                el.style.cursor = 'pointer'; // Make it obvious they are clickable
            });
        } else {
            throw new Error('No SVG data found in the API response.');
        }

    } catch (error) {
        console.error('SVG Generation Error:', error);
        ui.showModal('Diagram Generation Failed', error.message || 'An unknown error occurred.');
    } finally {
        ui.setLoadingState(dom.generateImageBtn, dom.generateImageBtn, false);
    }
}

export function saveExplanation() {
    const explanationText = dom.outputDiv.innerHTML; // Use innerHTML to preserve formatting
    const diagramSvg = dom.imageContainer.innerHTML; // Get the SVG content

    if (!explanationText || !currentProcedure) {
        console.log("Nothing to save."); // Or show a subtle message to the user
        return;
    }

    const explanation = {
        id: `explanation_${Date.now()}`, // Simple unique ID
        procedure: currentProcedure,
        explanationText,
        diagramSvg
    };

    history.saveToHistory(explanation);

    // Provide feedback to the user
    dom.saveBtnText.textContent = 'Saved!';
    dom.saveBtn.disabled = true;
    setTimeout(() => {
        dom.saveBtnText.textContent = 'Save';
        dom.saveBtn.disabled = false;
    }, 2000);
}

export function showMyLibrary() {
    const savedItems = history.getHistory();
    const contentDiv = dom.libraryContent;
    contentDiv.innerHTML = ''; // Clear previous content

    if (savedItems.length === 0) {
        contentDiv.innerHTML = '<p class="text-gray-500 text-center">Your saved library is empty.</p>';
    } else {
        savedItems.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'p-4 border-b last:border-b-0';

            let diagramHTML = '';
            if (item.diagramSvg) {
                // The SVG needs to be scaled down for the library view.
                diagramHTML = `<div class="w-1/4 float-right ml-4">${item.diagramSvg.replace('<svg', '<svg style="width:100%; height:auto;"')}</div>`;
            }

            itemDiv.innerHTML = `
                <h4 class="text-lg font-bold text-gray-800 mb-2">${item.procedure}</h4>
                <div class="prose max-w-none text-gray-700">
                    ${diagramHTML}
                    ${item.explanationText}
                </div>
            `;
            contentDiv.appendChild(itemDiv);
        });
    }
    ui.showLibrary();
}

export function clearHistoryHandler() {
    history.clearHistory();
    showMyLibrary(); // Re-render the (now empty) library
}

export async function generateChecklist() {
    if (!currentProcedure) {
        ui.showModal('Cannot Generate Checklist', 'Please generate an explanation for a procedure first.');
        return;
    }

    ui.setLoadingState(dom.checklistBtn, dom.checklistBtn, true);
    dom.checklistOutput.style.display = 'none';

    const systemPrompt = `You are a dental assistant AI. Create two simple, bulleted checklists for a patient.
    **RULES:**
    1.  **Headings:** Use "### Before Your Procedure" and "### After Your Procedure".
    2.  **Disclaimer:** Add a final line: "*This is a general guide. Follow the specific instructions from your dentist.*"
    3.  **Simplicity:** Use clear, simple language suitable for a patient.`;
    const userQuery = `Create a pre-procedure and post-procedure checklist for a patient (${currentPatientProfile}) having a "${currentProcedure}" procedure.`;

    try {
        const result = await api.makeApiCallWithRetry({
            contents: [{ parts: [{ text: userQuery }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
        });
        if (result) {
            ui.displayResult(result, dom.checklistOutput);
            dom.checklistOutput.style.display = 'block';
        }
    } catch (error) {
        console.error("Checklist Error:", error);
        dom.checklistOutput.innerText = `An error occurred: ${error.message}`;
    } finally {
        ui.setLoadingState(dom.checklistBtn, dom.checklistBtn, false);
    }
}

export function printChecklist() {
    const checklistContent = dom.checklistOutput.innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Dental Procedure Checklist</title>');
    // Optional: Add some basic styling for printing
    printWindow.document.write('<style> body { font-family: sans-serif; } h3 { border-bottom: 1px solid #ccc; padding-bottom: 5px; } ul { padding-left: 20px; } </style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(`<h2>Checklist for: ${currentProcedure}</h2>`);
    printWindow.document.write(checklistContent);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
}