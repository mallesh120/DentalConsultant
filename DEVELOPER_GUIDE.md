# Quick Reference Guide - Modular Code Structure

## Adding a New Feature

### 1. Add Configuration (if needed)
**File:** `public/js/constants.js`

```javascript
// Add to CONFIG object
export const CONFIG = {
    // ... existing config
    NEW_FEATURE_TIMEOUT: 30000,
};

// Add to PROMPTS object
export const PROMPTS = {
    // ... existing prompts
    SYSTEM_NEW_FEATURE: `Your system prompt here...`,
};

// Add to ERROR_MESSAGES object
export const ERROR_MESSAGES = {
    // ... existing errors
    NEW_FEATURE_ERROR: 'Error message here',
};

// Add to ARIA_LABELS object
export const ARIA_LABELS = {
    // ... existing labels
    NEW_FEATURE_BTN: 'Button description for screen readers',
};
```

### 2. Add API Function (if needed)
**File:** `public/js/api.js`

```javascript
/**
 * Description of what this function does
 * @param {string} param1 - Description
 * @param {string} param2 - Description
 * @returns {Promise<Object>} - API response
 */
export async function newFeatureAPI(param1, param2) {
    const userQuery = `Your prompt with ${param1} and ${param2}`;
    
    const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        systemInstruction: { parts: [{ text: PROMPTS.SYSTEM_NEW_FEATURE }] }
    };
    
    return await makeApiCallWithRetry(payload);
}
```

### 3. Add UI Helper (if needed)
**File:** `public/js/ui-helpers.js`

```javascript
/**
 * Description of what this helper does
 * @param {HTMLElement} element - Element to manipulate
 * @param {any} data - Data to process
 */
export function newUIHelper(element, data) {
    // Your UI manipulation code
}
```

### 4. Add Event Handler
**File:** `public/js/app.js`

```javascript
// In cacheDOM() function
DOM.newFeatureBtn = document.getElementById('newFeatureBtn');
DOM.newFeatureOutput = document.getElementById('newFeatureOutput');
DOM.newFeatureLoader = document.getElementById('newFeatureLoader');

// In setupEventListeners() function
DOM.newFeatureBtn.addEventListener('click', handleNewFeature);

// In setupAccessibility() function
DOM.newFeatureBtn.setAttribute('aria-label', ARIA_LABELS.NEW_FEATURE_BTN);

// Add handler function
async function handleNewFeature() {
    UI.setLoadingState(DOM.newFeatureLoader, DOM.newFeatureBtn, true, DOM.ariaLiveRegion);
    DOM.newFeatureOutput.style.display = 'none';
    
    try {
        const result = await API.newFeatureAPI(param1, param2);
        if (result) {
            UI.displayResult(result, DOM.newFeatureOutput, null, DOM.ariaLiveRegion);
        }
    } catch (error) {
        console.error("New Feature Error:", error);
        DOM.newFeatureOutput.innerText = `An error occurred: ${error.message}`;
        DOM.newFeatureOutput.style.display = 'block';
        UI.announceToScreenReader(`Error: ${error.message}`, DOM.ariaLiveRegion, 'assertive');
    } finally {
        UI.setLoadingState(DOM.newFeatureLoader, DOM.newFeatureBtn, false);
    }
}
```

### 5. Add HTML Elements
**File:** `public/index.html`

```html
<button 
    id="newFeatureBtn" 
    class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50">
    New Feature
</button>

<div id="newFeatureLoader" class="items-center mt-4 hidden" role="status">
    <div class="loader ease-linear rounded-full border-2 border-t-2 border-gray-200 h-6 w-6 mr-2"></div>
    <span>Loading...</span>
</div>

<div id="newFeatureOutput" class="mt-4 prose max-w-none p-4 bg-gray-50 rounded-lg border border-gray-200" style="display: none;" role="region" aria-live="polite"></div>
```

## Common Tasks

### Changing Error Messages
Edit `public/js/constants.js` → `ERROR_MESSAGES` object

### Changing API Timeout
Edit `public/js/constants.js` → `CONFIG.API_TIMEOUT_MS`

### Changing Retry Attempts
Edit `public/js/constants.js` → `CONFIG.MAX_RETRY_ATTEMPTS`

### Adding New Prompt
Edit `public/js/constants.js` → `PROMPTS` object

### Updating Sanitization Rules
Edit `public/js/constants.js` → `ALLOWED_HTML_TAGS` and `ALLOWED_HTML_ATTRS`

### Adding Validation
Edit `public/js/ui-helpers.js` → Create new validation function or update `validateProcedureInput()`

## File Import Patterns

### In any JS module file:
```javascript
// Import specific items
import { CONFIG, PROMPTS } from './constants.js';
import * as API from './api.js';
import * as UI from './ui-helpers.js';

// Or import everything
import { 
    CONFIG, 
    PROMPTS, 
    ERROR_MESSAGES, 
    ARIA_LABELS 
} from './constants.js';
```

### In HTML:
```html
<!-- Only import app.js as module, it imports the rest -->
<script type="module" src="js/app.js"></script>
```

## Accessibility Checklist for New Features

When adding a new interactive element:

1. ✅ Add `aria-label` attribute
2. ✅ Add `aria-describedby` for hints
3. ✅ Add `disabled:opacity-50` class for visual disabled state
4. ✅ Set `aria-busy` during loading
5. ✅ Add `focus:outline-none focus:ring-2` for focus indicator
6. ✅ Add loading state with `role="status"`
7. ✅ Add output with `role="region" aria-live="polite"`
8. ✅ Announce state changes to screen reader
9. ✅ Ensure keyboard accessibility
10. ✅ Test with Tab, Enter, and Escape keys

## Code Style Guidelines

### Naming Conventions
- Constants: `UPPER_SNAKE_CASE`
- Functions: `camelCase`
- DOM elements: `camelCase` (cached in DOM object)
- CSS classes: `kebab-case`

### Comments
- Use JSDoc for function documentation
- Explain "why", not "what"
- Add comments for complex logic

### Error Handling
- Always use try-catch for async operations
- Log errors to console
- Display user-friendly messages
- Announce errors to screen readers

### Imports
- Group imports by module
- Use named imports when possible
- Keep imports at top of file

## Debugging Tips

### Check if modules are loading:
```javascript
// In browser console
console.log(import.meta.url);
```

### Check DOM caching:
```javascript
// In app.js, after cacheDOM()
console.log(DOM);
```

### Test API calls:
```javascript
// In browser console (after page loads)
import * as API from './js/api.js';
import { PROMPTS } from './js/constants.js';

const result = await API.generateExplanation('root canal', 'an adult', 'simple and direct', PROMPTS.SYSTEM_EXPLANATION);
console.log(result);
```

### Test UI helpers:
```javascript
// In browser console
import * as UI from './js/ui-helpers.js';

const validation = UI.validateProcedureInput('test');
console.log(validation);
```

## Common Patterns

### Loading State Pattern
```javascript
UI.setLoadingState(loaderElement, buttonElement, true, ariaLiveRegion);
try {
    // Do work
} finally {
    UI.setLoadingState(loaderElement, buttonElement, false);
}
```

### API Call Pattern
```javascript
try {
    const result = await API.someAPIFunction(params);
    if (result) {
        UI.displayResult(result, outputElement, citationsConfig, ariaLiveRegion);
    }
} catch (error) {
    console.error("Error:", error);
    UI.showError(errorElement, error.message, ariaLiveRegion);
}
```

### Show/Hide Element Pattern
```javascript
element.style.display = 'none'; // Hide
element.setAttribute('aria-hidden', 'true');

element.style.display = 'block'; // Show
element.setAttribute('aria-hidden', 'false');
```
