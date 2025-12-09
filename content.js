/**
 * CircleCI ANSI Colors - Content Script
 * Processes terminal output in the Tests tab to render ANSI color codes
 */

(function () {
    'use strict';

    const converter = new AnsiToHtml();

    // Track processed elements to avoid re-processing
    const processedElements = new WeakSet();

    /**
     * Check if text contains ANSI codes
     */
    function hasAnsiCodes(text) {
        // CircleCI escapes ANSI codes as literal "#x1B[" in the DOM
        if (text.includes('#x1B[') || text.includes('#x1b[')) {
            return true;
        }
        // Check for the actual escape character (charCode 27 / 0x1B)
        for (let i = 0; i < text.length - 1; i++) {
            if (text.charCodeAt(i) === 27 && text[i + 1] === '[') {
                return true;
            }
        }
        return false;
    }

    /**
     * Process a pre element containing terminal output
     */
    function processPreElement(pre) {
        if (processedElements.has(pre)) {
            return;
        }

        const rawText = pre.textContent;

        // Check if there are ANSI codes to process
        if (!hasAnsiCodes(rawText)) {
            processedElements.add(pre);
            return;
        }

        // Convert ANSI to HTML
        const htmlContent = converter.convert(rawText);

        // Set the colored content
        pre.innerHTML = htmlContent;
        pre.classList.add('circleci-ansi-processed');

        processedElements.add(pre);
        console.log('[CircleCI ANSI Colors] Processed terminal output');
    }

    /**
     * Find and process all terminal output elements
     */
    function processAllPreElements() {
        const preElements = document.querySelectorAll('pre');
        preElements.forEach(pre => processPreElement(pre));
    }

    /**
     * Set up MutationObserver to watch for dynamically loaded content
     */
    function setupObserver() {
        const observer = new MutationObserver((mutations) => {
            let shouldProcess = false;

            for (const mutation of mutations) {
                if (mutation.type === 'childList') {
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (node.tagName === 'PRE' || node.querySelector?.('pre')) {
                                shouldProcess = true;
                                break;
                            }
                        }
                    }
                }
                if (shouldProcess) break;
            }

            if (shouldProcess) {
                clearTimeout(window._ansiProcessTimeout);
                window._ansiProcessTimeout = setTimeout(processAllPreElements, 100);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * Initialize the extension
     */
    function init() {
        console.log('[CircleCI ANSI Colors] Extension loaded');
        processAllPreElements();
        setupObserver();
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
