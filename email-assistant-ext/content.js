console.log("email assistant extension - content script loaded");

// Constants for selectors to improve readability and maintainability
const EMAIL_CONTENT_SELECTORS = [
    '.h7', // Gmail's main email body selector
    '.a3s.aiL', // Another common selector for email body
    '.gmail_quote', // For quoted parts of an email
    '[role="presentation"]' // Generic selector for email content
];

const COMPOSE_TOOLBAR_SELECTORS = [
    '.btC', // Primary selector for the compose toolbar
    '.aDh', // Another common selector
    '[role="toolbar"]', // Generic toolbar role
    '.gU.Up' // Specific Gmail class for compose toolbar
];

// Helper to get the content of the email being replied to
function getEmailContent() {
    for (const selector of EMAIL_CONTENT_SELECTORS) {
        const content = document.querySelector(selector);
        if (content) {
            return content.innerText.trim();
        }
    }
    return ''; // Return empty string if no content found
}

// Helper to find the Gmail compose toolbar
function findComposeToolbar() {
    for (const selector of COMPOSE_TOOLBAR_SELECTORS) {
        const toolbar = document.querySelector(selector);
        if (toolbar) {
            return toolbar;
        }
    }
    return null; // Return null if toolbar not found
}

// Global state variables for the injected UI
let selectedTone = 'professional'; // Default tone
let selectedLength = ''; // Default (no specific length)
let inputKeywords = ''; // Default (no keywords)
let selectedLanguage = ''; // Default (English)

// Global reference for the error message div
let errorMessageDiv = null;

// Function to display error messages
function showErrorMessage(message) {
    if (!errorMessageDiv) {
        console.error("Error message div not initialized.");
        return;
    }
    errorMessageDiv.textContent = message;
    errorMessageDiv.style.display = 'block';
    setTimeout(() => {
        errorMessageDiv.style.display = 'none';
        errorMessageDiv.textContent = '';
    }, 5000); // Hide after 5 seconds
}

function hideErrorMessage() {
    if (errorMessageDiv) {
        errorMessageDiv.style.display = 'none';
        errorMessageDiv.textContent = '';
    }
}

// Function to inject the AI button and its UI into Gmail's compose window
function injectButton() {
    // Remove any existing injected UI to prevent duplicates
    const existingWrapper = document.querySelector('.ai-reply-wrapper');
    if (existingWrapper) existingWrapper.remove();

    const existingDropdown = document.querySelector('.ai-tone-dropdown');
    if (existingDropdown) existingDropdown.remove();

    if (errorMessageDiv && errorMessageDiv.parentNode) {
        errorMessageDiv.remove(); // Remove existing error div if present
    }


    const toolbar = findComposeToolbar();
    if (!toolbar) {
        console.log("Toolbar not found, cannot inject AI button.");
        return;
    }
    console.log("Compose Toolbar found, injecting AI button.");

    // Create a wrapper div for the AI button and dropdown for unified styling
    const wrapper = document.createElement('div');
    wrapper.classList.add('ai-reply-wrapper'); // Apply CSS class

    // Main "Reply with AI" button part
    const mainBtn = document.createElement('div');
    mainBtn.textContent = 'Reply with AI';
    mainBtn.classList.add('ai-main-button'); // Apply CSS class

    // Dropdown toggle button (arrow)
    const dropdownBtn = document.createElement('div');
    dropdownBtn.innerHTML = '&#9662;'; // Down arrow character
    dropdownBtn.classList.add('ai-dropdown-toggle-button'); // Apply CSS class

    // Dropdown menu container
    const dropdown = document.createElement('div');
    dropdown.classList.add('ai-tone-dropdown'); // Apply CSS class

    // Initialize the global errorMessageDiv here
    errorMessageDiv = document.createElement('div');
    errorMessageDiv.classList.add('ai-error-message'); // Apply CSS class

    // Function to create a dropdown option
    function createOption(text, value, type, currentValue) {
        const option = document.createElement('div');
        option.textContent = text;
        option.dataset.value = value;
        option.dataset.type = type; // 'tone', 'length', 'language'
        option.classList.add('ai-dropdown-option'); // Apply CSS class

        // Check if this option should be initially selected
        if (currentValue === value) {
            option.classList.add('selected'); // Highlight selected
        }

        option.addEventListener('click', () => {
            console.log(`Clicked option: ${text}, Type: ${type}, Value: ${value}`); // Debugging click

            // Update the global state variable based on the type
            if (type === 'tone') selectedTone = value;
            else if (type === 'length') selectedLength = value;
            else if (type === 'language') selectedLanguage = value;

            // Remove 'selected' class from all options of this type
            const optionsOfType = dropdown.querySelectorAll(`.ai-dropdown-option[data-type="${type}"]`);
            optionsOfType.forEach(opt => {
                opt.classList.remove('selected');
            });
            // Add 'selected' class to the clicked option
            option.classList.add('selected');

            console.log(`Selected ${type}: ${value}`); // Confirm selection
            // !!! IMPORTANT: DO NOT close dropdown here. It will be closed by Apply button.
        });
        return option;
    }

    // --- Dropdown Content ---
    const dropdownContent = document.createElement('div');
    dropdownContent.style.padding = '8px 0'; // Adjust padding for dropdown content itself
    // dropdownContent.style.width = '250px'; // No fixed width here, min-width on parent handles it

    // Tone Section
    const toneLabel = document.createElement('div');
    toneLabel.textContent = 'Tone:';
    toneLabel.classList.add('ai-dropdown-label'); // Apply CSS class
    dropdownContent.appendChild(toneLabel);

    // Trimmed tones
    const tones = [
        {text: 'Professional', value: 'professional'},
        {text: 'Casual', value: 'casual'},
        {text: 'Friendly', value: 'friendly'},
        {text: 'Concise', value: 'concise'}
    ];
    tones.forEach(t => dropdownContent.appendChild(createOption(t.text, t.value, 'tone', selectedTone)));
    dropdownContent.appendChild(document.createElement('hr')).classList.add('ai-dropdown-separator'); // Separator

    // Length Section
    const lengthLabel = document.createElement('div');
    lengthLabel.textContent = 'Length:';
    lengthLabel.classList.add('ai-dropdown-label'); // Apply CSS class
    dropdownContent.appendChild(lengthLabel);

    // Trimmed lengths
    const lengths = [
        {text: 'Default', value: ''}, // Default is still an option
        {text: 'Short', value: 'short'},
        {text: 'Medium', value: 'medium'},
        {text: 'Long', value: 'long'}
    ];
    lengths.forEach(l => dropdownContent.appendChild(createOption(l.text, l.value, 'length', selectedLength)));
    dropdownContent.appendChild(document.createElement('hr')).classList.add('ai-dropdown-separator'); // Separator

    // Language Section
    const langLabel = document.createElement('div');
    langLabel.textContent = 'Language:';
    langLabel.classList.add('ai-dropdown-label'); // Apply CSS class
    dropdownContent.appendChild(langLabel);

    // Trimmed languages
    const languages = [
        {text: 'English', value: 'English'},
        {text: 'Spanish', value: 'Spanish'},
        {text: 'French', value: 'French'},
        {text: 'German', value: 'German'}
    ];
    languages.forEach(l => dropdownContent.appendChild(createOption(l.text, l.value, 'language', selectedLanguage)));
    dropdownContent.appendChild(document.createElement('hr')).classList.add('ai-dropdown-separator'); // Separator

    // Keywords Input
    const keywordsLabel = document.createElement('div');
    keywordsLabel.textContent = 'Keywords (comma-separated):';
    keywordsLabel.classList.add('ai-dropdown-label'); // Apply CSS class
    dropdownContent.appendChild(keywordsLabel);

    const keywordsInput = document.createElement('input');
    keywordsInput.type = 'text';
    keywordsInput.placeholder = 'e.g., "meeting, follow-up"';
    keywordsInput.classList.add('ai-keywords-input'); // Apply CSS class
    keywordsInput.value = inputKeywords; // Bind to state
    keywordsInput.addEventListener('input', (e) => {
        inputKeywords = e.target.value; // Update global state on input
    });
    dropdownContent.appendChild(keywordsInput);

    dropdown.appendChild(dropdownContent); // Add all content to the dropdown menu

    // --- Add Apply Button ---
    const applyButtonContainer = document.createElement('div');
    applyButtonContainer.classList.add('ai-apply-button-container');

    const applyButton = document.createElement('button');
    applyButton.textContent = 'Apply';
    applyButton.classList.add('ai-apply-button');
    applyButton.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent document click from closing
        dropdown.style.display = 'none'; // Close dropdown on apply
        console.log("Apply button clicked. Current selections:", { selectedTone, selectedLength, inputKeywords, selectedLanguage });
        // No other action needed here, as the values are already updated by option clicks
    });
    applyButtonContainer.appendChild(applyButton);
    dropdown.appendChild(applyButtonContainer); // Add apply button container to dropdown

    // Toggle dropdown visibility and position it correctly
    dropdownBtn.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent document click from immediately closing

        // Temporarily set display to block to measure, then hide if it was already open
        const wasOpen = dropdown.style.display === 'block';
        dropdown.style.display = 'block';

        if (wasOpen) { // If it was already open, close it after measurement
            dropdown.style.display = 'none';
            return; // Exit function if we just closed it
        }

        const btnRect = dropdownBtn.getBoundingClientRect();
        const dropdownHeight = dropdown.offsetHeight; // Get actual rendered height (respecting max-height)
        const dropdownWidth = dropdown.offsetWidth;   // Get actual rendered width
        const viewportHeight = window.innerHeight;    // Height of the visible window
        const viewportWidth = window.innerWidth;      // Width of the visible window
        const scrollY = window.scrollY; // Current vertical scroll position
        const scrollX = window.scrollX; // Current horizontal scroll position

        let newTop = btnRect.bottom + scrollY + 5; // Default: below the button, plus 5px offset
        let newLeft = btnRect.left + scrollX;      // Default: aligned with left of button

        // --- Vertical positioning ---
        // Check if dropdown goes below the viewport
        if (newTop + dropdownHeight > viewportHeight + scrollY) {
            // If it does, try to position it above the button
            newTop = btnRect.top + scrollY - dropdownHeight - 5; // 5px offset above

            // Ensure it doesn't go above the top of the viewport
            if (newTop < scrollY) {
                newTop = scrollY; // Stick to the top of the viewport if necessary
            }
        }

        // --- Horizontal positioning ---
        // Check if dropdown goes beyond the right of the viewport
        if (newLeft + dropdownWidth > viewportWidth + scrollX) {
            // If it does, try to align it to the right of the button, pushing it left
            newLeft = btnRect.right + scrollX - dropdownWidth;

            // Ensure it doesn't go past the left edge of the viewport
            if (newLeft < scrollX) {
                newLeft = scrollX; // Stick to the left of the viewport if necessary
            }
        }

        dropdown.style.top = `${newTop}px`;
        dropdown.style.left = `${newLeft}px`;
    });


    // Close dropdown if clicked outside (unless clicking on the dropdown or wrapper itself)
    document.addEventListener('click', (event) => {
        // Check if the click occurred outside both the main wrapper and the dropdown
        if (!wrapper.contains(event.target) && !dropdown.contains(event.target)) {
            dropdown.style.display = 'none';
        }
    });

    mainBtn.addEventListener('click', async () => {
        dropdown.style.display = 'none'; // Ensure dropdown is closed on main button click

        // NEW: Explicitly hide the error message right at the start of the process
        hideErrorMessage();
        console.log("1. 'Reply with AI' button clicked. Error message cleared by hideErrorMessage().");

        try {
            mainBtn.textContent = 'Generating...';
            mainBtn.style.opacity = 0.7; // Dim the button
            mainBtn.style.pointerEvents = 'none'; // Disable clicks during generation
            console.log("2. UI updated to 'Generating...' state.");

            const emailContent = getEmailContent();
            if (!emailContent) {
                showErrorMessage('Please ensure an email is open and its content is visible.');
                console.log("3. Error: Email content not found. Exiting.");
                return;
            }
            console.log("3. Email content retrieved. Length:", emailContent.length);

            // Prepare the request body
            const requestBody = {
                emailContent: emailContent,
                tone: selectedTone,
                desiredLength: selectedLength,
                keywords: inputKeywords,
                language: selectedLanguage,
            };
            console.log("4. Sending request to backend:", requestBody);

            // Temporarily add a debugger here. When you click, execution will pause.
            // This is crucial to visually inspect the red bar's state *before* it disappears.
            // You can remove this line once the issue is solved.
            // debugger; // <-- ADD THIS LINE

            const response = await fetch('http://localhost:8080/api/email/generate', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(requestBody)
            });
            console.log("5. Fetch response received. Status:", response.status, "OK:", response.ok);

            if (!response.ok) {
                let errorMessage = 'Failed to generate reply.';
                try {
                    const errorData = await response.json();
                    if (errorData && errorData.message) {
                        errorMessage = errorData.message;
                    } else {
                        errorMessage = `API Request Failed with status: ${response.status} ${response.statusText}`;
                    }
                } catch (jsonParseError) {
                    errorMessage = `API Request Failed (status ${response.status} ${response.statusText}). Could not parse error JSON. Raw response: ${await response.text()}`;
                }
                console.error("6. Error: Response not OK. Details:", errorMessage);
                throw new Error(errorMessage);
            }

            const generatedReply = await response.text();
            console.log("7. Generated Reply received successfully. Length:", generatedReply.length);

            const composeBox = document.querySelector('[role="textbox"][g_editable="true"]');
            if (composeBox) {
                try {
                    composeBox.focus();
                    document.execCommand('insertText', false, generatedReply);
                    console.log("8. Reply inserted into compose box.");
                } catch (insertError) {
                    console.error("8a. Error during text insertion:", insertError);
                    showErrorMessage('Error inserting reply into compose box: ' + (insertError.message || 'Unknown error.'));
                    throw insertError;
                }
            } else {
                console.error('8b. Compose box not found, cannot insert reply.');
                showErrorMessage('Compose box not found. Please ensure you are in a reply window.');
            }

        } catch (error) {
            console.error('9. Caught an error during reply generation (overall process):', error);
            if (!errorMessageDiv.textContent || errorMessageDiv.textContent.includes("Failed to generate reply") ) {
                showErrorMessage(error.message || 'Failed to generate the reply. Please try again.');
            }
        } finally {
            mainBtn.textContent = 'Reply with AI';
            mainBtn.style.opacity = 1;
            mainBtn.style.pointerEvents = 'auto';
            console.log("10. UI restored. 'Reply with AI' process finished.");
        }
    });
    // Append all elements to the toolbar
    wrapper.appendChild(mainBtn);
    wrapper.appendChild(dropdownBtn);
    toolbar.insertBefore(wrapper, toolbar.firstChild); // Insert wrapper at the beginning of the toolbar
    document.body.appendChild(dropdown); // Dropdown needs to be a direct child of body for correct absolute positioning
    document.body.appendChild(errorMessageDiv); // Error message div also needs to be a direct child for positioning

    // Initial positioning of error message div (e.g., near the toolbar)
    const toolbarRect = toolbar.getBoundingClientRect();
    // Position the error message below the toolbar
    errorMessageDiv.style.top = `${toolbarRect.bottom + window.scrollY + 5}px`;
    errorMessageDiv.style.left = `${toolbarRect.left + window.scrollX}px`;
    errorMessageDiv.style.width = `${toolbarRect.width}px`;
    errorMessageDiv.style.position = 'absolute'; // Ensure it's absolutely positioned
}

// MutationObserver to detect when Gmail's compose window appears
const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        const addedNodes = Array.from(mutation.addedNodes);
        // Look for common elements that appear when a compose window is active
        const hasComposeElements = addedNodes.some(node =>
            node.nodeType === Node.ELEMENT_NODE &&
            (node.matches('.aDh, .btC, [role="dialog"]') || node.querySelector('.aDh, .btC, [role="dialog"]'))
        );

        if (hasComposeElements) {
            console.log("Compose Window Detected, attempting to inject button...");
            // Use setTimeout to ensure the DOM is fully ready and stable
            setTimeout(() => {
                injectButton();
            }, 500); // A small delay is often beneficial
        }
    }
});

// Start observing the document body for changes
observer.observe(document.body, {
    childList: true, // Observe direct children additions/removals
    subtree: true // Observe all descendants
});