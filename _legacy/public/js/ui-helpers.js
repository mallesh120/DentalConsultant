// UI helper functions for Dental AI Explainer

import { CONFIG, ERROR_MESSAGES, ALLOWED_HTML_TAGS, ALLOWED_HTML_ATTRS } from './constants.js';

/**
 * Shows a modal dialog
 * @param {string} title - Modal title
 * @param {string} message - Modal message
 */
export function showModal(title, message) {
    const modal = document.getElementById('infoModal');
    const overlay = document.getElementById('modalOverlay');
    const panel = document.getElementById('modalPanel');
    
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalMessage').textContent = message;
    
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    
    setTimeout(() => {
        overlay.classList.remove('opacity-0');
        panel.classList.remove('opacity-0', 'scale-95');
    }, 10);
    
    // Focus the close button for accessibility
    setTimeout(() => {
        document.getElementById('modalCloseBtn').focus();
    }, 220);
}

/**
 * Hides the modal dialog
 */
export function hideModal() {
    const modal = document.getElementById('infoModal');
    const overlay = document.getElementById('modalOverlay');
    const panel = document.getElementById('modalPanel');
    
    overlay.classList.add('opacity-0');
    panel.classList.add('opacity-0', 'scale-95');
    
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.setAttribute('aria-hidden', 'true');
    }, CONFIG.MODAL_TRANSITION_DELAY);
}

/**
 * Sets the loading state for a feature
 * @param {HTMLElement} loaderEl - Loader element
 * @param {HTMLElement} btnEl - Button element
 * @param {boolean} isLoading - Loading state
 * @param {HTMLElement} ariaLiveEl - Optional aria-live region for screen readers
 */
export function setLoadingState(loaderEl, btnEl, isLoading, ariaLiveEl = null) {
    // Show/hide loader
    if (isLoading) {
        loaderEl.classList.remove('hidden');
        loaderEl.style.display = 'flex';
    } else {
        loaderEl.classList.add('hidden');
        loaderEl.style.display = 'none';
    }
    
    // Disable button and update visual state
    btnEl.disabled = isLoading;
    btnEl.setAttribute('aria-busy', isLoading.toString());
    
    if (isLoading) {
        btnEl.classList.add('opacity-50');
    } else {
        btnEl.classList.remove('opacity-50');
    }
    
    // Update aria-live region if provided
    if (ariaLiveEl) {
        ariaLiveEl.textContent = isLoading ? 'Loading content, please wait' : '';
    }
}

/**
 * Displays API result in target element
 * @param {Object} result - API response object
 * @param {HTMLElement} targetDiv - Target div to display result
 * @param {Object|null} citationsConfig - Optional citations configuration
 * @param {HTMLElement} ariaLiveEl - Optional aria-live region
 */
export function displayResult(result, targetDiv, citationsConfig = null, ariaLiveEl = null) {
    const candidate = result.candidates?.[0];
    
    if (candidate && candidate.content?.parts?.[0]?.text) {
        const raw = candidate.content.parts[0].text || '';
        
        // Detect if the response looks like HTML (simple heuristic)
        const looksLikeHtml = /<[^>]+>/.test(raw);
        
        if (looksLikeHtml && window.DOMPurify) {
            // Only allow a conservative set of tags and attributes
            const clean = DOMPurify.sanitize(raw, {
                ALLOWED_TAGS: ALLOWED_HTML_TAGS,
                ALLOWED_ATTR: ALLOWED_HTML_ATTRS
            });
            targetDiv.innerHTML = clean;
        } else {
            // Fallback: render as plain text (escaped)
            targetDiv.innerText = raw;
        }
        
        targetDiv.style.display = 'block';
        targetDiv.setAttribute('aria-hidden', 'false');
        
        // Update aria-live region
        if (ariaLiveEl) {
            ariaLiveEl.textContent = 'Content loaded successfully';
        }
        
        // Handle citations if provided
        if (citationsConfig) {
            displayCitations(candidate, citationsConfig);
        }
    } else {
        handleEmptyOrBlockedResponse(result, targetDiv, ariaLiveEl);
    }
}

/**
 * Handles empty or blocked responses
 * @param {Object} result - API response
 * @param {HTMLElement} targetDiv - Target element
 * @param {HTMLElement} ariaLiveEl - Optional aria-live region
 */
function handleEmptyOrBlockedResponse(result, targetDiv, ariaLiveEl = null) {
    if (result.promptFeedback && result.promptFeedback.blockReason) {
        showModal("Query Not Supported", ERROR_MESSAGES.BLOCKED_QUERY);
        document.getElementById('outputContainer').style.display = 'none';
        
        if (ariaLiveEl) {
            ariaLiveEl.textContent = ERROR_MESSAGES.BLOCKED_QUERY;
        }
    } else {
        targetDiv.innerText = ERROR_MESSAGES.EMPTY_RESPONSE;
        targetDiv.style.display = 'block';
        targetDiv.setAttribute('aria-hidden', 'false');
        
        if (ariaLiveEl) {
            ariaLiveEl.textContent = ERROR_MESSAGES.EMPTY_RESPONSE;
        }
    }
}

/**
 * Displays citations from grounding metadata
 * @param {Object} candidate - API response candidate
 * @param {Object} config - Citations configuration {container, linksDiv}
 */
function displayCitations(candidate, config) {
    const { container, linksDiv } = config;
    
    container.style.display = 'none';
    linksDiv.innerHTML = '';
    
    const groundingMetadata = candidate.groundingMetadata;
    if (groundingMetadata && groundingMetadata.groundingAttributions) {
        const sources = groundingMetadata.groundingAttributions
            .map(attr => ({ uri: attr.web?.uri, title: attr.web?.title }))
            .filter(source => source.uri && source.title);
        
        if (sources.length > 0) {
            sources.forEach(source => {
                const link = document.createElement('a');
                link.href = source.uri;
                link.textContent = source.title;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                link.className = 'block truncate hover:underline text-cyan-600';
                link.setAttribute('aria-label', `Source: ${source.title}`);
                linksDiv.appendChild(link);
            });
            container.style.display = 'block';
            container.setAttribute('aria-hidden', 'false');
        }
    }
}

/**
 * Copies text to clipboard
 * @param {string} text - Text to copy
 * @param {HTMLElement} feedbackEl - Element to show feedback
 * @returns {Promise<boolean>} - Success status
 */
export async function copyToClipboard(text, feedbackEl) {
    try {
        // Modern clipboard API
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
        } else {
            // Fallback for older browsers
            const tempTextArea = document.createElement('textarea');
            tempTextArea.value = text;
            tempTextArea.style.position = 'fixed';
            tempTextArea.style.opacity = '0';
            document.body.appendChild(tempTextArea);
            tempTextArea.select();
            document.execCommand('copy');
            document.body.removeChild(tempTextArea);
        }
        
        // Show feedback
        const originalText = feedbackEl.innerText;
        feedbackEl.innerText = 'Copied!';
        
        setTimeout(() => {
            feedbackEl.innerText = originalText;
        }, CONFIG.COPY_FEEDBACK_DURATION);
        
        return true;
    } catch (error) {
        console.error('Failed to copy:', error);
        feedbackEl.innerText = 'Failed';
        
        setTimeout(() => {
            feedbackEl.innerText = 'Copy';
        }, CONFIG.COPY_FEEDBACK_DURATION);
        
        return false;
    }
}

/**
 * Validates procedure input
 * @param {string} procedure - Procedure text to validate
 * @returns {Object} - {valid: boolean, error: string|null}
 */
export function validateProcedureInput(procedure) {
    const trimmed = procedure.trim();
    
    if (!trimmed) {
        return { valid: false, error: ERROR_MESSAGES.EMPTY_PROCEDURE };
    }
    
    if (trimmed.length < CONFIG.MIN_PROCEDURE_LENGTH) {
        return { valid: false, error: ERROR_MESSAGES.PROCEDURE_TOO_SHORT };
    }
    
    if (trimmed.length > CONFIG.MAX_PROCEDURE_LENGTH) {
        return { valid: false, error: ERROR_MESSAGES.PROCEDURE_TOO_LONG };
    }
    
    return { valid: true, error: null };
}

/**
 * Shows an error message to the user
 * @param {HTMLElement} errorEl - Error message element
 * @param {string} message - Error message
 * @param {HTMLElement} ariaLiveEl - Optional aria-live region
 */
export function showError(errorEl, message, ariaLiveEl = null) {
    errorEl.textContent = message;
    errorEl.style.display = 'block';
    errorEl.setAttribute('role', 'alert');
    
    if (ariaLiveEl) {
        ariaLiveEl.textContent = message;
    }
}

/**
 * Clears error message
 * @param {HTMLElement} errorEl - Error message element
 */
export function clearError(errorEl) {
    errorEl.textContent = '';
    errorEl.style.display = 'none';
}

/**
 * Announces message to screen readers
 * @param {string} message - Message to announce
 * @param {HTMLElement} ariaLiveEl - Aria-live region element
 * @param {string} priority - 'polite' or 'assertive'
 */
export function announceToScreenReader(message, ariaLiveEl, priority = 'polite') {
    if (ariaLiveEl) {
        ariaLiveEl.setAttribute('aria-live', priority);
        ariaLiveEl.textContent = message;
        
        // Clear after announcement
        setTimeout(() => {
            ariaLiveEl.textContent = '';
        }, 1000);
    }
}
