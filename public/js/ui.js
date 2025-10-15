import * as dom from './dom.js';

export function copyOutputText() {
    const textToCopy = dom.outputDiv.innerText;
    const tempTextArea = document.createElement('textarea');
    tempTextArea.value = textToCopy;
    document.body.appendChild(tempTextArea);
    tempTextArea.select();
    document.execCommand('copy');
    document.body.removeChild(tempTextArea);
    dom.copyBtnText.innerText = 'Copied!';
    setTimeout(() => { dom.copyBtnText.innerText = 'Copy'; }, 2000);
}

export function showModal(title, message) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalMessage').textContent = message;
    dom.infoModal.classList.remove('hidden');
    setTimeout(() => {
        dom.modalOverlay.classList.remove('opacity-0');
        dom.modalPanel.classList.remove('opacity-0', 'scale-95');
    }, 10);
}

export function hideModal() {
    dom.modalOverlay.classList.add('opacity-0');
    dom.modalPanel.classList.add('opacity-0', 'scale-95');
    setTimeout(() => {
        dom.infoModal.classList.add('hidden');
    }, 200);
}

export function displayResult(result, targetDiv, citationsConfig) {
    const candidate = result.candidates?.[0];
    if (candidate && candidate.content?.parts?.[0]?.text) {
        const raw = candidate.content.parts[0].text || '';

        // Detect if the response looks like HTML (simple heuristic)
        const looksLikeHtml = /<[^>]+>/.test(raw);

        if (looksLikeHtml && window.DOMPurify) {
            // Only allow a conservative set of tags and attributes
            const clean = DOMPurify.sanitize(raw, {
                ALLOWED_TAGS: ['p','strong','em','ol','ul','li','h3','br','a','blockquote'],
                ALLOWED_ATTR: ['href', 'target', 'rel']
            });
            targetDiv.innerHTML = clean;
        } else {
            // Fallback: render as plain text (escaped)
            targetDiv.innerText = raw;
        }

        targetDiv.style.display = 'block';

        if (citationsConfig) {
            const { container, linksDiv } = citationsConfig;
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
                        linksDiv.appendChild(link);
                    });
                    container.style.display = 'block';
                }
            }
        }
    } else {
         if (result.promptFeedback && result.promptFeedback.blockReason) {
            showModal("Query Not Supported", "This AI tool is designed for dental topics. Your request was outside this scope. Please enter a dental term.");
            dom.outputContainer.style.display = 'none';
         } else {
            targetDiv.innerText = "Sorry, the response from the model was empty. Please try again.";
            targetDiv.style.display = 'block';
         }
    }
}

export function setLoadingState(loaderEl, btnEl, isLoading) {
    const flexOrHidden = isLoading ? 'flex' : 'hidden';
    // Use a different method to show/hide loaders to avoid conflicts
    if(loaderEl.classList.contains('hidden') && isLoading){
        loaderEl.classList.remove('hidden');
    } else if (!isLoading) {
        loaderEl.classList.add('hidden');
    }

    if (isLoading) {
         if(loaderEl.style.display === 'none' || loaderEl.style.display === ''){
            loaderEl.style.display = 'flex';
        }
    } else {
        loaderEl.style.display = 'none';
    }

    btnEl.disabled = isLoading;
    if(isLoading) {
        btnEl.classList.add('opacity-50');
    } else {
        btnEl.classList.remove('opacity-50');
    }
}

export function showTooltip(text, element) {
    removeExistingTooltip(); // Ensure no duplicates
    const tooltip = document.createElement('div');
    tooltip.id = 'svg-tooltip';
    tooltip.className = 'svg-tooltip'; // Use class for styling
    tooltip.textContent = text;
    document.body.appendChild(tooltip);

    const targetRect = element.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();

    // Position tooltip above the element, centered
    let top = targetRect.top - tooltipRect.height - 10; // 10px offset
    let left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);

    // Adjust if tooltip goes off-screen
    if (top < 0) {
        top = targetRect.bottom + 10; // Show below if not enough space above
    }
    if (left < 0) {
        left = 10;
    }
    if (left + tooltipRect.width > window.innerWidth) {
        left = window.innerWidth - tooltipRect.width - 10;
    }

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;

    // Fade in
    setTimeout(() => tooltip.classList.add('visible'), 10);
}

export function removeExistingTooltip() {
    const existingTooltip = document.getElementById('svg-tooltip');
    if (existingTooltip) {
        existingTooltip.remove();
    }
}

export function showLibrary() {
    dom.libraryModal.classList.remove('hidden');
}

export function hideLibrary() {
    dom.libraryModal.classList.add('hidden');
}