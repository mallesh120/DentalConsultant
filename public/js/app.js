// Main application logic for Dental AI Explainer

import { PROMPTS, ARIA_LABELS } from './constants.js';
import * as API from './api.js';
import * as UI from './ui-helpers.js';
import { initTheme } from './theme.js';
import { initCostEstimator } from './cost-estimator.js';
import { initRecoveryTimeline } from './recovery-timeline.js';

// Initialize theme and features
let themeManager;
let costEstimator;
let recoveryTimeline;

// Application State
const AppState = {
    currentProcedure: '',
    currentPatientProfile: '',
    costEstimator: null,
    recoveryTimeline: null
};

// DOM Elements Cache
const DOM = {
    // Main form elements
    generateBtn: null,
    procedureInput: null,
    patientAgeSelect: null,
    toneSelect: null,
    
    // Output elements
    outputContainer: null,
    outputDiv: null,
    loader: null,
    copyBtn: null,
    copyBtnText: null,
    citationsContainer: null,
    citationLinks: null,
    errorMessageDiv: null,
    
    // Follow-up feature elements
    followUpContainer: null,
    aftercareBtn: null,
    aftercareLoader: null,
    aftercareOutput: null,
    followUpBtn: null,
    followUpInput: null,
    followUpLoader: null,
    followUpOutput: null,
    
    // Anxiety and translation elements
    anxietyBtn: null,
    anxietyLoader: null,
    anxietyOutput: null,
    translateBtn: null,
    languageSelect: null,
    translateLoader: null,
    translateOutput: null,
    
    // Modal elements
    modalCloseBtn: null,
    modalOverlay: null,
    
    // Accessibility elements
    ariaLiveRegion: null
};

/**
 * Initialize the application
 */
function init() {
    cacheDOM();
    setupEventListeners();
    setupAccessibility();
    
    // Initialize theme manager
    themeManager = initTheme();
    
    // Initialize cost estimator
    costEstimator = initCostEstimator();
    AppState.costEstimator = costEstimator;
    
    // Initialize recovery timeline
    recoveryTimeline = initRecoveryTimeline();
    AppState.recoveryTimeline = recoveryTimeline;
}

/**
 * Cache all DOM elements
 */
function cacheDOM() {
    // Main form elements
    DOM.generateBtn = document.getElementById('generateBtn');
    DOM.procedureInput = document.getElementById('procedure');
    DOM.patientAgeSelect = document.getElementById('patientAge');
    DOM.toneSelect = document.getElementById('tone');
    
    // Output elements
    DOM.outputContainer = document.getElementById('outputContainer');
    DOM.outputDiv = document.getElementById('output');
    DOM.loader = document.getElementById('loader');
    DOM.copyBtn = document.getElementById('copyBtn');
    DOM.copyBtnText = document.getElementById('copyBtnText');
    DOM.citationsContainer = document.getElementById('citations');
    DOM.citationLinks = document.getElementById('citationLinks');
    DOM.errorMessageDiv = document.getElementById('error-message');
    
    // Follow-up features
    DOM.followUpContainer = document.getElementById('followUpContainer');
    DOM.aftercareBtn = document.getElementById('aftercareBtn');
    DOM.aftercareLoader = document.getElementById('aftercareLoader');
    DOM.aftercareOutput = document.getElementById('aftercareOutput');
    DOM.followUpBtn = document.getElementById('followUpBtn');
    DOM.followUpInput = document.getElementById('followUpInput');
    DOM.followUpLoader = document.getElementById('followUpLoader');
    DOM.followUpOutput = document.getElementById('followUpOutput');
    
    // Anxiety and translation
    DOM.anxietyBtn = document.getElementById('anxietyBtn');
    DOM.anxietyLoader = document.getElementById('anxietyLoader');
    DOM.anxietyOutput = document.getElementById('anxietyOutput');
    DOM.translateBtn = document.getElementById('translateBtn');
    DOM.languageSelect = document.getElementById('languageSelect');
    DOM.translateLoader = document.getElementById('translateLoader');
    DOM.translateOutput = document.getElementById('translateOutput');
    
    // Modal
    DOM.modalCloseBtn = document.getElementById('modalCloseBtn');
    DOM.modalOverlay = document.getElementById('modalOverlay');
    
    // Accessibility
    DOM.ariaLiveRegion = document.getElementById('aria-live-region');
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Main generate button
    DOM.generateBtn.addEventListener('click', handleGenerateExplanation);
    DOM.procedureInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') DOM.generateBtn.click();
    });
    
    // Copy button
    DOM.copyBtn.addEventListener('click', handleCopyOutput);
    
    // Follow-up features
    DOM.aftercareBtn.addEventListener('click', handleGenerateAftercare);
    DOM.followUpBtn.addEventListener('click', handleAskFollowUp);
    DOM.followUpInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') DOM.followUpBtn.click();
    });
    
    // Support features
    DOM.anxietyBtn.addEventListener('click', handleGenerateAnxietyTips);
    DOM.translateBtn.addEventListener('click', handleTranslateText);
    
    // Modal
    DOM.modalCloseBtn.addEventListener('click', UI.hideModal);
    DOM.modalOverlay.addEventListener('click', UI.hideModal);
    
    // Escape key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = document.getElementById('infoModal');
            if (!modal.classList.contains('hidden')) {
                UI.hideModal();
            }
        }
    });
}

/**
 * Setup accessibility features
 */
function setupAccessibility() {
    // Add ARIA labels to buttons
    DOM.generateBtn.setAttribute('aria-label', ARIA_LABELS.GENERATE_BTN);
    DOM.copyBtn.setAttribute('aria-label', ARIA_LABELS.COPY_BTN);
    DOM.aftercareBtn.setAttribute('aria-label', ARIA_LABELS.AFTERCARE_BTN);
    DOM.followUpBtn.setAttribute('aria-label', ARIA_LABELS.FOLLOWUP_BTN);
    DOM.anxietyBtn.setAttribute('aria-label', ARIA_LABELS.ANXIETY_BTN);
    DOM.translateBtn.setAttribute('aria-label', ARIA_LABELS.TRANSLATE_BTN);
    DOM.modalCloseBtn.setAttribute('aria-label', ARIA_LABELS.MODAL_CLOSE);
    
    // Set initial aria-busy states
    DOM.generateBtn.setAttribute('aria-busy', 'false');
    DOM.aftercareBtn.setAttribute('aria-busy', 'false');
    DOM.followUpBtn.setAttribute('aria-busy', 'false');
    DOM.anxietyBtn.setAttribute('aria-busy', 'false');
    DOM.translateBtn.setAttribute('aria-busy', 'false');
    
    // Add role to error message
    DOM.errorMessageDiv.setAttribute('role', 'alert');
    DOM.errorMessageDiv.setAttribute('aria-live', 'assertive');
}

/**
 * Handle main explanation generation
 */
async function handleGenerateExplanation() {
    const procedure = DOM.procedureInput.value.trim();
    UI.clearError(DOM.errorMessageDiv);
    
    // Validate input
    const validation = UI.validateProcedureInput(procedure);
    if (!validation.valid) {
        UI.showError(DOM.errorMessageDiv, validation.error, DOM.ariaLiveRegion);
        return;
    }
    
    // Update state
    AppState.currentProcedure = procedure;
    AppState.currentPatientProfile = DOM.patientAgeSelect.value;
    const tone = DOM.toneSelect.value;
    
    // Show output container and setup UI
    DOM.outputContainer.style.display = 'block';
    DOM.outputDiv.style.display = 'none';
    DOM.followUpContainer.style.display = 'none';
    DOM.citationsContainer.style.display = 'none';
    UI.setLoadingState(DOM.loader, DOM.generateBtn, true, DOM.ariaLiveRegion);
    
    try {
        const result = await API.generateExplanation(
            procedure,
            AppState.currentPatientProfile,
            tone,
            PROMPTS.SYSTEM_EXPLANATION
        );
        
        if (result) {
            UI.displayResult(
                result,
                DOM.outputDiv,
                { container: DOM.citationsContainer, linksDiv: DOM.citationLinks },
                DOM.ariaLiveRegion
            );
            
            // Show and update cost estimate
            const costContainer = document.getElementById('costEstimateContainer');
            if (costContainer && costEstimator) {
                costEstimator.updateCostDisplay();
                costContainer.style.display = 'block';
            }
            
            // Show and update recovery timeline
            const timelineContainer = document.getElementById('recoveryTimelineContainer');
            if (timelineContainer && recoveryTimeline) {
                recoveryTimeline.display(procedure);
                timelineContainer.style.display = 'block';
            }
            
            // Show follow-up features if we got a valid response
            if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
                DOM.followUpContainer.style.display = 'block';
                DOM.followUpContainer.setAttribute('aria-hidden', 'false');
            }
            
            // Clear previous follow-up results
            [DOM.aftercareOutput, DOM.followUpOutput, DOM.anxietyOutput, DOM.translateOutput].forEach(el => {
                el.style.display = 'none';
                el.setAttribute('aria-hidden', 'true');
            });
        }
    } catch (error) {
        console.error("Error:", error);
        DOM.outputDiv.innerText = `An error occurred. Please try again.\n\n${error.message}`;
        DOM.outputDiv.style.display = 'block';
        UI.announceToScreenReader(`Error: ${error.message}`, DOM.ariaLiveRegion, 'assertive');
    } finally {
        UI.setLoadingState(DOM.loader, DOM.generateBtn, false);
    }
}

/**
 * Handle copy to clipboard
 */
async function handleCopyOutput() {
    const textToCopy = DOM.outputDiv.innerText;
    const success = await UI.copyToClipboard(textToCopy, DOM.copyBtnText);
    
    if (success) {
        UI.announceToScreenReader('Explanation copied to clipboard', DOM.ariaLiveRegion);
    }
}

/**
 * Handle aftercare tips generation
 */
async function handleGenerateAftercare() {
    UI.setLoadingState(DOM.aftercareLoader, DOM.aftercareBtn, true, DOM.ariaLiveRegion);
    DOM.aftercareOutput.style.display = 'none';
    
    try {
        const result = await API.generateAftercare(
            AppState.currentProcedure,
            AppState.currentPatientProfile,
            PROMPTS.SYSTEM_AFTERCARE
        );
        
        if (result) {
            UI.displayResult(result, DOM.aftercareOutput, null, DOM.ariaLiveRegion);
        }
    } catch (error) {
        console.error("Aftercare Error:", error);
        DOM.aftercareOutput.innerText = `An error occurred: ${error.message}`;
        DOM.aftercareOutput.style.display = 'block';
        UI.announceToScreenReader(`Error: ${error.message}`, DOM.ariaLiveRegion, 'assertive');
    } finally {
        UI.setLoadingState(DOM.aftercareLoader, DOM.aftercareBtn, false);
    }
}

/**
 * Handle follow-up question
 */
async function handleAskFollowUp() {
    const question = DOM.followUpInput.value.trim();
    if (!question) return;
    
    UI.setLoadingState(DOM.followUpLoader, DOM.followUpBtn, true, DOM.ariaLiveRegion);
    DOM.followUpOutput.style.display = 'none';
    
    try {
        const result = await API.askFollowUpQuestion(
            question,
            AppState.currentProcedure,
            AppState.currentPatientProfile,
            PROMPTS.SYSTEM_FOLLOWUP
        );
        
        if (result) {
            UI.displayResult(result, DOM.followUpOutput, null, DOM.ariaLiveRegion);
            DOM.followUpInput.value = '';
        }
    } catch (error) {
        console.error("Follow-up Error:", error);
        DOM.followUpOutput.innerText = `An error occurred: ${error.message}`;
        DOM.followUpOutput.style.display = 'block';
        UI.announceToScreenReader(`Error: ${error.message}`, DOM.ariaLiveRegion, 'assertive');
    } finally {
        UI.setLoadingState(DOM.followUpLoader, DOM.followUpBtn, false);
    }
}

/**
 * Handle anxiety tips generation
 */
async function handleGenerateAnxietyTips() {
    UI.setLoadingState(DOM.anxietyLoader, DOM.anxietyBtn, true, DOM.ariaLiveRegion);
    DOM.anxietyOutput.style.display = 'none';
    
    try {
        const result = await API.generateAnxietyTips(
            AppState.currentProcedure,
            AppState.currentPatientProfile,
            PROMPTS.SYSTEM_ANXIETY
        );
        
        if (result) {
            UI.displayResult(result, DOM.anxietyOutput, null, DOM.ariaLiveRegion);
        }
    } catch (error) {
        console.error("Anxiety Tips Error:", error);
        DOM.anxietyOutput.innerText = `An error occurred: ${error.message}`;
        DOM.anxietyOutput.style.display = 'block';
        UI.announceToScreenReader(`Error: ${error.message}`, DOM.ariaLiveRegion, 'assertive');
    } finally {
        UI.setLoadingState(DOM.anxietyLoader, DOM.anxietyBtn, false);
    }
}

/**
 * Handle text translation
 */
async function handleTranslateText() {
    const targetLanguage = DOM.languageSelect.value;
    const originalText = DOM.outputDiv.innerText;
    
    if (!originalText) {
        UI.showError(DOM.errorMessageDiv, 'Please generate an explanation first before translating.', DOM.ariaLiveRegion);
        return;
    }
    
    UI.setLoadingState(DOM.translateLoader, DOM.translateBtn, true, DOM.ariaLiveRegion);
    DOM.translateOutput.style.display = 'none';
    
    try {
        const result = await API.translateText(
            originalText,
            targetLanguage,
            PROMPTS.SYSTEM_TRANSLATION
        );
        
        if (result) {
            UI.displayResult(result, DOM.translateOutput, null, DOM.ariaLiveRegion);
        }
    } catch (error) {
        console.error("Translation Error:", error);
        DOM.translateOutput.innerText = `An error occurred: ${error.message}`;
        DOM.translateOutput.style.display = 'block';
        UI.announceToScreenReader(`Error: ${error.message}`, DOM.ariaLiveRegion, 'assertive');
    } finally {
        UI.setLoadingState(DOM.translateLoader, DOM.translateBtn, false);
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
