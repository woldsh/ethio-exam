'use client';

import { useEffect, useRef, useState } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface RichTextContentProps {
    content: string;
    className?: string;
}

declare global {
    interface Window {
        MathJax: any;
    }
}

export default function RichTextContent({ content, className = '' }: RichTextContentProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isRendered, setIsRendered] = useState(false);
    const renderLock = useRef(false);

    useEffect(() => {
        if (!content) {
            setIsRendered(true);
            return;
        }

        // Reset render state when content changes
        setIsRendered(false);

        const renderMath = async () => {
            if (!containerRef.current || renderLock.current) return;
            renderLock.current = true;

            try {
                // Helper function to render LaTeX with KaTeX
                const renderLatex = (latex: string, displayMode: boolean = false): string => {
                    try {
                        // Clean up common issues
                        let cleanLatex = latex
                            .replace(/\\Box/g, '\\square')
                            .replace(/\\text{\u25FD}/g, '\\square')
                            .trim();

                        return katex.renderToString(cleanLatex, {
                            throwOnError: false,
                            displayMode: displayMode,
                            strict: false,
                            trust: true,
                            output: 'html'
                        });
                    } catch (err) {
                        console.error('KaTeX render error:', err, 'LaTeX:', latex);
                        return `<span class="katex-error">${latex}</span>`;
                    }
                };

                // Step 1: Process all .ql-formula spans (highest priority)
                const formulaSpans = containerRef.current.querySelectorAll('.ql-formula');
                formulaSpans.forEach((span) => {
                    const dataValue = span.getAttribute('data-value');
                    if (dataValue) {
                        span.innerHTML = renderLatex(dataValue);
                    }
                });

                // Step 2: Handle delimited math \(...\) and \[...\]
                let html = containerRef.current.innerHTML;
                let hasInlineChanges = false;

                // Match \(...\)
                html = html.replace(/\\\(([\s\S]+?)\\\)/g, (match, latex) => {
                    hasInlineChanges = true;
                    return renderLatex(latex, false);
                });

                // Match \[...\]
                html = html.replace(/\\\[([\s\S]+?)\\\]/g, (match, latex) => {
                    hasInlineChanges = true;
                    return renderLatex(latex, true);
                });

                if (hasInlineChanges) {
                    containerRef.current.innerHTML = html;
                }

                // Step 3: ROBUST GREEDY SCANNER for naked LaTeX characters in text nodes
                const processTextNodes = () => {
                    if (!containerRef.current) return;

                    const walker = document.createTreeWalker(
                        containerRef.current,
                        NodeFilter.SHOW_TEXT,
                        null
                    );

                    const nodesToReplace: Array<{ node: Text, replacement: DocumentFragment }> = [];
                    // Simple start detection
                    const mathStartRegex = /\\|[a-zA-Z0-9]+[\^_]/;

                    let textNode;
                    while (textNode = walker.nextNode() as Text) {
                        const text = textNode.textContent || '';

                        // Skip if already rendered
                        if (textNode.parentElement?.closest('.katex') ||
                            textNode.parentElement?.closest('.ql-formula') ||
                            textNode.parentElement?.closest('.math-rendered')) {
                            continue;
                        }

                        if (!mathStartRegex.test(text)) {
                            continue;
                        }

                        const fragment = document.createDocumentFragment();
                        let lastIndex = 0;
                        let i = 0;

                        while (i < text.length) {
                            let isMathStart = false;

                            // Check for start: Backslash or Variable with power/subscript
                            if (text[i] === '\\') {
                                isMathStart = true;
                            } else if (/[a-zA-Z0-9]/.test(text[i])) {
                                let k = i + 1;
                                while (k < text.length && /[a-zA-Z0-9]/.test(text[k])) k++;
                                if (k < text.length && (text[k] === '^' || text[k] === '_')) {
                                    isMathStart = true;
                                }
                            }

                            if (isMathStart) {
                                if (i > lastIndex) {
                                    fragment.appendChild(document.createTextNode(text.substring(lastIndex, i)));
                                }

                                // CONSUME MATH ISLAND
                                let start = i;
                                let end = i;

                                let braceLevel = 0;
                                let bracketLevel = 0;
                                let parenLevel = 0;

                                while (end < text.length) {
                                    const c = text[end];

                                    if (c === '{') braceLevel++;
                                    else if (c === '}') braceLevel--;
                                    else if (c === '[') bracketLevel++;
                                    else if (c === ']') bracketLevel--;
                                    else if (c === '(') parenLevel++;
                                    else if (c === ')') parenLevel--;

                                    end++;

                                    // If inside wrapper, always continue
                                    if (braceLevel > 0 || bracketLevel > 0 || parenLevel > 0) {
                                        continue;
                                    }

                                    // Check next char if available
                                    if (end < text.length) {
                                        const nextChar = text[end];

                                        // 1. Whitespace Handling
                                        if (/\s/.test(nextChar)) {
                                            // Peek ahead
                                            let k = end + 1;
                                            while (k < text.length && /\s/.test(text[k])) k++;

                                            if (k < text.length) {
                                                const peek = text[k];
                                                // If next chunk starts with \ or operator or digit, consume the space(s)
                                                if (peek === '\\' || /[+\-*/=<>!^_[{(0-9]/.test(peek)) {
                                                    end = k; // Continue loop from k (skips spaces)
                                                    continue;
                                                }
                                            }
                                            // Else stop at space
                                            break;
                                        }

                                        // 2. Standard Continuation
                                        if (nextChar === '\\') continue;
                                        if (nextChar === '^' || nextChar === '_') continue;
                                        if (nextChar === '{' || nextChar === '[' || nextChar === '(') continue;
                                        if (/[+\-*/=<>!.,]/.test(nextChar)) continue;
                                        if (/[a-zA-Z0-9]/.test(nextChar)) continue;

                                        // Stop
                                        break;
                                    }
                                }

                                const mathContent = text.substring(start, end);
                                const span = document.createElement('span');
                                span.className = 'math-rendered inline-block align-middle';
                                span.innerHTML = renderLatex(mathContent);
                                fragment.appendChild(span);

                                lastIndex = end;
                                i = end;
                            } else {
                                i++;
                            }
                        }

                        if (lastIndex < text.length) {
                            fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
                        }

                        if (fragment.childNodes.length > 0) {
                            nodesToReplace.push({ node: textNode, replacement: fragment });
                        }
                    }

                    for (const { node, replacement } of nodesToReplace) {
                        node.parentNode?.replaceChild(replacement, node);
                    }
                };

                processTextNodes();

                if (window.MathJax && typeof window.MathJax.typesetPromise === 'function') {
                    try {
                        await window.MathJax.typesetPromise([containerRef.current]);
                    } catch (e) { /* ignore */ }
                }

                setIsRendered(true);

            } catch (err) {
                console.error('Render Error:', err);
                setIsRendered(true);
            } finally {
                renderLock.current = false;
            }
        };

        const timer = setTimeout(() => {
            requestAnimationFrame(renderMath);
        }, 50);

        return () => clearTimeout(timer);
    }, [content]);

    return (
        <div
            ref={containerRef}
            className={`rich-text-container ${className}`}
            style={{
                visibility: isRendered ? 'visible' : 'hidden',
                opacity: isRendered ? 1 : 0,
                transition: 'opacity 0.2s ease-in'
            }}
            dangerouslySetInnerHTML={{ __html: content || '' }}
        />
    );
}
