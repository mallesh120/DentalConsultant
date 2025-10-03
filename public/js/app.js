import * as dom from './dom.js';
import * as ui from './ui.js';
import * as handlers from './handlers.js';

// Event Listeners
dom.generateBtn.addEventListener('click', handlers.generateExplanation);
dom.procedureInput.addEventListener('keyup', e => e.key === 'Enter' && handlers.generateExplanation());
dom.copyBtn.addEventListener('click', ui.copyOutputText);
dom.aftercareBtn.addEventListener('click', handlers.generateAftercare);
dom.followUpBtn.addEventListener('click', handlers.askFollowUp);
dom.followUpInput.addEventListener('keyup', e => e.key === 'Enter' && handlers.askFollowUp());
dom.anxietyBtn.addEventListener('click', handlers.generateAnxietyTips);
dom.translateBtn.addEventListener('click', handlers.translateText);
dom.modalCloseBtn.addEventListener('click', ui.hideModal);
dom.modalOverlay.addEventListener('click', ui.hideModal);
dom.generateImageBtn.addEventListener('click', handlers.createSimpleDiagram);