import * as dom from './dom.js';
import * as ui from './ui.js';
import * as handlers from './handlers.js';

// Event Listeners
dom.generateBtn.addEventListener('click', handlers.generateExplanation);
dom.procedureInput.addEventListener('keyup', e => e.key === 'Enter' && handlers.generateExplanation());
dom.copyBtn.addEventListener('click', ui.copyOutputText);
dom.saveBtn.addEventListener('click', handlers.saveExplanation);
dom.aftercareBtn.addEventListener('click', handlers.generateAftercare);
dom.followUpBtn.addEventListener('click', handlers.askFollowUp);
dom.followUpInput.addEventListener('keyup', e => e.key === 'Enter' && handlers.askFollowUp());
dom.anxietyBtn.addEventListener('click', handlers.generateAnxietyTips);
dom.translateBtn.addEventListener('click', handlers.translateText);
dom.modalCloseBtn.addEventListener('click', ui.hideModal);
dom.modalOverlay.addEventListener('click', ui.hideModal);
dom.generateImageBtn.addEventListener('click', handlers.generateInteractiveDiagram);

// Library Modal Listeners
dom.myLibraryBtn.addEventListener('click', handlers.showMyLibrary);
dom.libraryCloseBtn.addEventListener('click', ui.hideLibrary);
dom.libraryModalOverlay.addEventListener('click', ui.hideLibrary);
dom.clearHistoryBtn.addEventListener('click', handlers.clearHistoryHandler);

// Checklist Listeners
dom.checklistBtn.addEventListener('click', handlers.generateChecklist);
dom.printChecklistBtn.addEventListener('click', handlers.printChecklist);