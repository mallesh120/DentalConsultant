// Pre-generated dental procedures data loader

let proceduresData = null;

/**
 * Load pre-generated procedures database
 * @returns {Promise<Object>} - The procedures data
 */
export async function loadProceduresData() {
    if (proceduresData) {
        return proceduresData;
    }
    
    try {
        const response = await fetch('/data/procedures.json');
        if (!response.ok) {
            throw new Error('Failed to load procedures data');
        }
        proceduresData = await response.json();
        return proceduresData;
    } catch (error) {
        console.error('Error loading procedures data:', error);
        return {};
    }
}

/**
 * Normalize procedure name for matching
 * @param {string} name - The procedure name
 * @returns {string} - Normalized name
 */
function normalizeProcedureName(name) {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special chars
        .replace(/\s+/g, '-')      // Replace spaces with hyphens
        .replace(/-+/g, '-');      // Collapse multiple hyphens
}

/**
 * Find matching pre-generated procedure
 * @param {string} procedureName - The procedure name to search
 * @returns {Promise<string|null>} - Pre-generated explanation or null
 */
export async function findPreGeneratedExplanation(procedureName, patientProfile, tone) {
    const data = await loadProceduresData();
    const normalized = normalizeProcedureName(procedureName);
    
    // Direct match
    if (data[normalized]) {
        return getExplanationText(data[normalized], patientProfile, tone);
    }
    
    // Fuzzy match - check if any key contains the search term
    for (const [key, procedure] of Object.entries(data)) {
        if (key.includes(normalized) || normalized.includes(key)) {
            return getExplanationText(procedure, patientProfile, tone);
        }
        
        // Also check procedure name
        const procName = normalizeProcedureName(procedure.name);
        if (procName.includes(normalized) || normalized.includes(procName)) {
            return getExplanationText(procedure, patientProfile, tone);
        }
    }
    
    return null;
}

/**
 * Get explanation text for specific patient profile and tone
 * @param {Object} procedure - The procedure object
 * @param {string} patientProfile - Patient age profile
 * @param {string} tone - Explanation style
 * @returns {string} - The explanation text
 */
function getExplanationText(procedure, patientProfile, tone) {
    // Map patient profile to key
    const profileKey = patientProfile.includes('child') || patientProfile.includes('7-10') ? 'child' : 'adult';
    
    // Map tone/style to key
    let toneKey = 'simple';
    if (tone.includes('analogies') || tone.includes('using analogies')) {
        toneKey = 'analogies';
    } else if (tone.includes('step-by-step') || tone.includes('step')) {
        toneKey = 'step-by-step';
    } else if (tone.includes('simple') || tone.includes('direct')) {
        toneKey = 'simple';
    }
    
    const explanation = procedure.explanations?.[profileKey]?.[toneKey];
    
    if (explanation) {
        return explanation;
    }
    
    // Fallback: if specific combination not found, try simple first, then any available
    return procedure.explanations?.[profileKey]?.simple || 
           procedure.explanations?.[profileKey]?.analogies ||
           procedure.explanations?.[profileKey]?.['step-by-step'] ||
           procedure.explanations?.adult?.simple || 
           procedure.explanations?.child?.simple ||
           null;
}

/**
 * Get list of available pre-generated procedures
 * @returns {Promise<Array>} - Array of procedure names
 */
export async function getAvailableProcedures() {
    const data = await loadProceduresData();
    return Object.values(data).map(proc => proc.name);
}

/**
 * Check if a procedure has pre-generated content
 * @param {string} procedureName - The procedure name
 * @returns {Promise<boolean>} - True if pre-generated content exists
 */
export async function hasPreGeneratedContent(procedureName) {
    const explanation = await findPreGeneratedExplanation(procedureName, 'adult', 'friendly');
    return explanation !== null;
}
