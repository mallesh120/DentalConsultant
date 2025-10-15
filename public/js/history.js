const HISTORY_KEY = 'dentalAiExplainerHistory';

/**
 * Retrieves the saved explanation history from localStorage.
 * @returns {Array} An array of saved explanation objects.
 */
export function getHistory() {
    try {
        const history = localStorage.getItem(HISTORY_KEY);
        return history ? JSON.parse(history) : [];
    } catch (e) {
        console.error("Failed to parse history from localStorage", e);
        return [];
    }
}

/**
 * Saves a new explanation to the history.
 * @param {object} explanation - The explanation object to save.
 * Should include { id, procedure, explanationText, diagramSvg }
 */
export function saveToHistory(explanation) {
    try {
        const history = getHistory();
        // Avoid duplicates by checking for an existing ID
        if (!history.find(item => item.id === explanation.id)) {
            history.push(explanation);
            localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        }
    } catch (e) {
        console.error("Failed to save to localStorage", e);
        // Here you might want to inform the user that saving failed.
    }
}

/**
 * Clears the entire history from localStorage.
 */
export function clearHistory() {
    try {
        localStorage.removeItem(HISTORY_KEY);
    } catch (e) {
        console.error("Failed to clear localStorage", e);
    }
}