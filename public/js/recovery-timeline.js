/**
 * Recovery Timeline Module
 * Displays visual recovery timeline for dental procedures
 */

export const recoveryTimelines = {
    'dental-filling': {
        name: 'Dental Filling Recovery',
        totalDays: 7,
        milestones: [
            { day: 0, title: 'Immediately After', description: 'Avoid eating for 2-3 hours until numbness wears off', icon: '⏰' },
            { day: 1, title: 'Day 1', description: 'Mild sensitivity normal. Use soft toothbrush', icon: '🦷' },
            { day: 2, title: 'Days 2-3', description: 'Sensitivity should decrease. Resume normal eating', icon: '🍽️' },
            { day: 5, title: 'Days 4-7', description: 'Most sensitivity gone. Filling fully settled', icon: '✅' }
        ]
    },
    'root-canal': {
        name: 'Root Canal Recovery',
        totalDays: 14,
        milestones: [
            { day: 0, title: 'Day 0-1', description: 'Mild soreness. Take prescribed pain medication', icon: '💊' },
            { day: 2, title: 'Days 2-3', description: 'Swelling and discomfort peaks, then improves', icon: '📈' },
            { day: 5, title: 'Days 4-7', description: 'Significant improvement. Pain mostly gone', icon: '😌' },
            { day: 10, title: 'Days 8-14', description: 'Nearly normal. Schedule crown appointment', icon: '👑' },
            { day: 14, title: 'Week 2+', description: 'Fully healed. Crown placement ready', icon: '✨' }
        ]
    },
    'teeth-cleaning': {
        name: 'Teeth Cleaning Recovery',
        totalDays: 3,
        milestones: [
            { day: 0, title: 'Immediately After', description: 'Teeth feel smooth. Gums may be tender', icon: '✨' },
            { day: 1, title: 'Day 1', description: 'Any bleeding stops. Continue gentle brushing', icon: '🪥' },
            { day: 2, title: 'Days 2-3', description: 'Back to normal. Gums healthy and pink', icon: '💪' }
        ]
    },
    'tooth-extraction': {
        name: 'Tooth Extraction Recovery',
        totalDays: 14,
        milestones: [
            { day: 0, title: 'First 24 Hours', description: 'Bite gauze, apply ice, rest. No spitting/rinsing', icon: '🩹' },
            { day: 1, title: 'Days 2-3', description: 'Swelling peaks. Start gentle salt rinses', icon: '💧' },
            { day: 4, title: 'Days 4-7', description: 'Swelling decreases. Socket begins healing', icon: '📉' },
            { day: 10, title: 'Days 8-14', description: 'Socket closing. Resume normal foods', icon: '🍕' },
            { day: 14, title: 'Week 2+', description: 'Mostly healed. Complete healing in 3-6 months', icon: '🎉' }
        ]
    },
    'dental-crown': {
        name: 'Dental Crown Recovery',
        totalDays: 7,
        milestones: [
            { day: 0, title: 'Day 0', description: 'Avoid sticky foods. Tooth may feel different', icon: '👑' },
            { day: 1, title: 'Days 1-2', description: 'Adjust to new bite. Mild sensitivity normal', icon: '😬' },
            { day: 3, title: 'Days 3-5', description: 'Sensation normalizes. Crown feels natural', icon: '😊' },
            { day: 7, title: 'Week 1+', description: 'Fully adjusted. Treat like regular tooth', icon: '✅' }
        ]
    },
    'teeth-whitening': {
        name: 'Teeth Whitening Recovery',
        totalDays: 3,
        milestones: [
            { day: 0, title: 'First 48 Hours', description: 'Avoid staining foods/drinks. Sensitivity peaks', icon: '🦷' },
            { day: 2, title: 'Day 2-3', description: 'Sensitivity decreases. Results stabilize', icon: '😁' },
            { day: 3, title: 'Day 3+', description: 'Normal diet resumed. Maintain with good habits', icon: '✨' }
        ]
    }
};

export class RecoveryTimeline {
    constructor() {
        this.currentProcedure = null;
    }

    normalizeProcedureName(name) {
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

    getTimeline(procedureKey) {
        return recoveryTimelines[procedureKey] || null;
    }

    generateTimelineHTML(procedureName) {
        const procedureKey = this.normalizeProcedureName(procedureName);
        const timeline = this.getTimeline(procedureKey);

        if (!timeline) {
            return '<p class="text-gray-500 dark:text-gray-400">Recovery timeline not available for this procedure.</p>';
        }

        const milestonesHTML = timeline.milestones.map((milestone, index) => {
            const position = (milestone.day / timeline.totalDays) * 100;
            const isLast = index === timeline.milestones.length - 1;

            return `
                <div class="relative flex items-start gap-4 mb-8 group">
                    <!-- Timeline dot and line -->
                    <div class="relative flex-shrink-0">
                        <div class="w-10 h-10 bg-cyan-500 dark:bg-cyan-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform z-10">
                            <span class="text-xl">${milestone.icon}</span>
                        </div>
                        ${!isLast ? `
                            <div class="absolute top-10 left-1/2 transform -translate-x-1/2 w-0.5 h-16 bg-gradient-to-b from-cyan-500 to-cyan-300 dark:from-cyan-600 dark:to-cyan-800"></div>
                        ` : ''}
                    </div>

                    <!-- Content -->
                    <div class="flex-grow bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-600 group-hover:shadow-lg transition-shadow">
                        <h5 class="font-bold text-gray-900 dark:text-white mb-1">${milestone.title}</h5>
                        <p class="text-sm text-gray-600 dark:text-gray-300">${milestone.description}</p>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 p-6 rounded-lg border border-cyan-200 dark:border-cyan-800">
                <div class="mb-6">
                    <h4 class="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        🗓️ ${timeline.name}
                    </h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                        Typical healing timeline: ${timeline.totalDays} days
                    </p>
                </div>
                
                <div class="mt-6">
                    ${milestonesHTML}
                </div>

                <div class="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                    <p class="text-sm text-gray-700 dark:text-gray-300">
                        <strong class="text-yellow-800 dark:text-yellow-400">⚠️ Note:</strong> 
                        Recovery times vary by individual. Contact your dentist if you experience unusual pain, excessive bleeding, or signs of infection.
                    </p>
                </div>
            </div>
        `;
    }

    display(procedureName, containerId = 'recoveryTimeline') {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = this.generateTimelineHTML(procedureName);
        this.currentProcedure = procedureName;
    }
}

export function initRecoveryTimeline() {
    return new RecoveryTimeline();
}
