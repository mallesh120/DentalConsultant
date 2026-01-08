/**
 * Cost Estimator Module
 * Provides estimated procedure costs by region with insurance coverage info
 */

export const procedureCosts = {
    'dental-filling': {
        name: 'Dental Filling',
        costs: {
            'northeast': { min: 150, max: 400, currency: 'USD' },
            'southeast': { min: 120, max: 300, currency: 'USD' },
            'midwest': { min: 100, max: 250, currency: 'USD' },
            'southwest': { min: 130, max: 320, currency: 'USD' },
            'west': { min: 180, max: 450, currency: 'USD' }
        },
        insurance: {
            typical: '80% coverage after deductible',
            notes: 'Most dental insurance covers fillings as basic preventive care'
        }
    },
    'root-canal': {
        name: 'Root Canal Treatment',
        costs: {
            'northeast': { min: 800, max: 1800, currency: 'USD' },
            'southeast': { min: 600, max: 1400, currency: 'USD' },
            'midwest': { min: 500, max: 1200, currency: 'USD' },
            'southwest': { min: 700, max: 1500, currency: 'USD' },
            'west': { min: 900, max: 2000, currency: 'USD' }
        },
        insurance: {
            typical: '50-80% coverage',
            notes: 'Classified as major procedure. May require pre-authorization'
        }
    },
    'teeth-cleaning': {
        name: 'Professional Teeth Cleaning',
        costs: {
            'northeast': { min: 100, max: 200, currency: 'USD' },
            'southeast': { min: 75, max: 150, currency: 'USD' },
            'midwest': { min: 70, max: 130, currency: 'USD' },
            'southwest': { min: 80, max: 160, currency: 'USD' },
            'west': { min: 120, max: 250, currency: 'USD' }
        },
        insurance: {
            typical: '100% coverage (2 per year)',
            notes: 'Preventive care - usually fully covered with no copay'
        }
    },
    'tooth-extraction': {
        name: 'Tooth Extraction',
        costs: {
            'northeast': { min: 200, max: 700, currency: 'USD' },
            'southeast': { min: 150, max: 500, currency: 'USD' },
            'midwest': { min: 130, max: 450, currency: 'USD' },
            'southwest': { min: 180, max: 550, currency: 'USD' },
            'west': { min: 250, max: 800, currency: 'USD' }
        },
        insurance: {
            typical: '70-80% coverage',
            notes: 'Surgical extractions may have different coverage rates'
        }
    },
    'dental-crown': {
        name: 'Dental Crown',
        costs: {
            'northeast': { min: 1000, max: 2500, currency: 'USD' },
            'southeast': { min: 800, max: 1800, currency: 'USD' },
            'midwest': { min: 700, max: 1500, currency: 'USD' },
            'southwest': { min: 900, max: 2000, currency: 'USD' },
            'west': { min: 1200, max: 3000, currency: 'USD' }
        },
        insurance: {
            typical: '50% coverage',
            notes: 'Major restorative procedure. Material choice affects cost'
        }
    },
    'teeth-whitening': {
        name: 'Teeth Whitening',
        costs: {
            'northeast': { min: 400, max: 800, currency: 'USD' },
            'southeast': { min: 300, max: 600, currency: 'USD' },
            'midwest': { min: 250, max: 500, currency: 'USD' },
            'southwest': { min: 350, max: 650, currency: 'USD' },
            'west': { min: 450, max: 900, currency: 'USD' }
        },
        insurance: {
            typical: 'Not covered',
            notes: 'Cosmetic procedure - rarely covered by insurance'
        }
    }
};

export class CostEstimator {
    constructor() {
        this.selectedRegion = this.getUserRegion();
        this.setupUI();
    }

    getUserRegion() {
        // Try to get from localStorage
        const stored = localStorage.getItem('dental-ai-region');
        if (stored) return stored;
        
        // Default to midwest (average pricing)
        return 'midwest';
    }

    setupUI() {
        const regionSelect = document.getElementById('regionSelect');
        if (regionSelect) {
            regionSelect.value = this.selectedRegion;
            regionSelect.addEventListener('change', (e) => {
                this.selectedRegion = e.target.value;
                localStorage.setItem('dental-ai-region', this.selectedRegion);
                this.updateCostDisplay();
            });
        }
    }

    getCostEstimate(procedureKey) {
        const procedure = procedureCosts[procedureKey];
        if (!procedure) return null;

        const regionCost = procedure.costs[this.selectedRegion];
        return {
            ...procedure,
            selectedRegion: this.selectedRegion,
            regionCost
        };
    }

    formatCost(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    generateCostHTML(estimate) {
        if (!estimate) {
            return '<p class="text-gray-500 dark:text-gray-400">Cost information not available for this procedure.</p>';
        }

        const { regionCost, insurance } = estimate;
        const regionName = this.getRegionName(this.selectedRegion);

        return `
            <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 class="font-semibold text-blue-900 dark:text-blue-100 mb-3">💰 Estimated Cost (${regionName})</h4>
                <div class="flex items-baseline gap-2 mb-3">
                    <span class="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        ${this.formatCost(regionCost.min)} - ${this.formatCost(regionCost.max)}
                    </span>
                    <span class="text-sm text-gray-600 dark:text-gray-400">average range</span>
                </div>
                
                <div class="space-y-2 text-sm">
                    <div class="flex items-start gap-2">
                        <svg class="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <div>
                            <strong class="text-gray-900 dark:text-gray-100">Insurance Coverage:</strong>
                            <p class="text-gray-700 dark:text-gray-300">${insurance.typical}</p>
                        </div>
                    </div>
                    
                    <div class="flex items-start gap-2">
                        <svg class="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <p class="text-gray-700 dark:text-gray-300">${insurance.notes}</p>
                    </div>
                </div>
                
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-3 italic">
                    *Estimates vary by location, dentist experience, and specific case complexity. 
                    Contact your dental office for exact pricing.
                </p>
            </div>
        `;
    }

    getRegionName(region) {
        const names = {
            'northeast': 'Northeast US',
            'southeast': 'Southeast US',
            'midwest': 'Midwest US',
            'southwest': 'Southwest US',
            'west': 'West Coast'
        };
        return names[region] || region;
    }

    updateCostDisplay() {
        const costContainer = document.getElementById('costEstimate');
        if (!costContainer) return;

        const procedureInput = document.getElementById('procedure');
        if (!procedureInput) return;

        const procedureName = procedureInput.value.toLowerCase().trim();
        const procedureKey = this.normalizeProcedureName(procedureName);
        const estimate = this.getCostEstimate(procedureKey);

        costContainer.innerHTML = this.generateCostHTML(estimate);
    }

    normalizeProcedureName(name) {
        // Convert common names to keys
        const nameMap = {
            'filling': 'dental-filling',
            'cavity': 'dental-filling',
            'root canal': 'root-canal',
            'endodontic': 'root-canal',
            'cleaning': 'teeth-cleaning',
            'prophylaxis': 'teeth-cleaning',
            'extraction': 'tooth-extraction',
            'pull tooth': 'tooth-extraction',
            'crown': 'dental-crown',
            'cap': 'dental-crown',
            'whitening': 'teeth-whitening',
            'bleaching': 'teeth-whitening'
        };

        const normalized = name.toLowerCase().replace(/[^a-z\s]/g, '');
        
        for (const [key, value] of Object.entries(nameMap)) {
            if (normalized.includes(key)) return value;
        }

        return normalized.replace(/\s+/g, '-');
    }
}

export function initCostEstimator() {
    return new CostEstimator();
}
