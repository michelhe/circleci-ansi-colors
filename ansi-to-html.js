/**
 * ANSI to HTML converter
 * Uses aggressive inline styles to override any external CSS
 */

class AnsiToHtml {
    constructor() {
        // Color map for standard ANSI colors
        this.colors = {
            30: '#000000', 31: '#cc0000', 32: '#4e9a06', 33: '#c4a000',
            34: '#3465a4', 35: '#75507b', 36: '#06989a', 37: '#d3d7cf',
            90: '#555753', 91: '#ef2929', 92: '#8ae234', 93: '#fce94f',
            94: '#729fcf', 95: '#ad7fa8', 96: '#34e2e2', 97: '#eeeeec'
        };
        this.bgColors = {
            40: '#000000', 41: '#cc0000', 42: '#4e9a06', 43: '#c4a000',
            44: '#3465a4', 45: '#75507b', 46: '#06989a', 47: '#d3d7cf',
            100: '#555753', 101: '#ef2929', 102: '#8ae234', 103: '#fce94f',
            104: '#729fcf', 105: '#ad7fa8', 106: '#34e2e2', 107: '#eeeeec'
        };
    }

    /**
     * Build the inline style string - MUST include display:inline to prevent
     * CircleCI's CSS from breaking the layout
     */
    buildStyleString(styleObj) {
        // Always include these reset properties to fight external CSS
        let style = 'display:inline !important;margin:0 !important;padding:0 !important;border:0 !important;line-height:inherit !important;white-space:pre !important;';

        if (styleObj.color) style += `color:${styleObj.color} !important;`;
        if (styleObj.bgColor) style += `background-color:${styleObj.bgColor} !important;`;
        if (styleObj.bold) style += 'font-weight:bold !important;';
        if (styleObj.dim) style += 'opacity:0.7 !important;';
        if (styleObj.italic) style += 'font-style:italic !important;';
        if (styleObj.underline) style += 'text-decoration:underline !important;';

        return style;
    }

    /**
     * Convert text with ANSI codes to HTML using inline styles
     */
    convert(text) {
        // First normalize the CircleCI escape format
        text = text.replace(/#x1[Bb]\[/g, '\x1b[');

        // Strip non-color ANSI sequences (cursor control, etc.)
        text = text.replace(/\x1b\[[0-9;]*[A-HJKSTfnsu]/g, '');
        text = text.replace(/\x1b\[[0-9;]*[lh]/g, '');

        let result = '';
        let currentStyle = null;
        let inSpan = false;
        let i = 0;

        while (i < text.length) {
            // Check for ANSI escape sequence
            if (text.charCodeAt(i) === 0x1b && text[i + 1] === '[') {
                // Find the end of the sequence (ends with 'm')
                let j = i + 2;
                while (j < text.length && text[j] !== 'm') {
                    j++;
                }

                if (text[j] === 'm') {
                    // Close any open font tag before changing styles
                    if (inSpan) {
                        result += '</font>';
                        inSpan = false;
                    }

                    // Parse the ANSI codes
                    const codes = text.slice(i + 2, j).split(';').map(c => parseInt(c, 10) || 0);

                    // Update current style
                    if (currentStyle === null) currentStyle = {};

                    for (const code of codes) {
                        if (code === 0) {
                            // Reset
                            currentStyle = {};
                        } else if (code === 1) {
                            currentStyle.bold = true;
                        } else if (code === 2) {
                            currentStyle.dim = true;
                        } else if (code === 3) {
                            currentStyle.italic = true;
                        } else if (code === 4) {
                            currentStyle.underline = true;
                        } else if (code >= 30 && code <= 37) {
                            currentStyle.color = this.colors[code];
                        } else if (code >= 90 && code <= 97) {
                            currentStyle.color = this.colors[code];
                        } else if (code === 39) {
                            delete currentStyle.color;
                        } else if (code >= 40 && code <= 47) {
                            currentStyle.bgColor = this.bgColors[code];
                        } else if (code >= 100 && code <= 107) {
                            currentStyle.bgColor = this.bgColors[code];
                        } else if (code === 49) {
                            delete currentStyle.bgColor;
                        }
                    }

                    i = j + 1;
                    continue;
                }
            }

            // Regular character
            const hasStyle = currentStyle && Object.keys(currentStyle).length > 0;

            // Open font tag if we have styles and not already in one
            if (hasStyle && !inSpan) {
                // Use <font> element with display:contents to prevent layout interference
                const colorAttr = currentStyle.color ? ` color="${currentStyle.color}"` : '';
                // display:contents makes the element invisible to layout but keeps text styling
                let styleAttr = 'display:contents;';
                if (currentStyle.bgColor) styleAttr += `background-color:${currentStyle.bgColor};`;
                if (currentStyle.bold) styleAttr += 'font-weight:bold;';
                if (currentStyle.dim) styleAttr += 'opacity:0.7;';
                if (currentStyle.italic) styleAttr += 'font-style:italic;';
                if (currentStyle.underline) styleAttr += 'text-decoration:underline;';

                result += `<font${colorAttr} style="${styleAttr}">`;
                inSpan = true;
            } else if (!hasStyle && inSpan) {
                result += '</font>';
                inSpan = false;
            }

            // Escape HTML special characters
            const char = text[i];
            if (char === '&') {
                result += '&amp;';
            } else if (char === '<') {
                result += '&lt;';
            } else if (char === '>') {
                result += '&gt;';
            } else {
                result += char;
            }

            i++;
        }

        // Close any remaining font tag
        if (inSpan) {
            result += '</font>';
        }

        return result;
    }
}

// Export for use in content script
window.AnsiToHtml = AnsiToHtml;
