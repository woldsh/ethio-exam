'use client';

import React, { useMemo, useRef, useImperativeHandle, forwardRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import 'katex/dist/katex.min.css';

// @ts-ignore - React Quill types don't match perfectly with dynamic import
const ReactQuill = dynamic(() => import('react-quill-new'), {
    ssr: false,
    loading: () => <div className="h-[200px] w-full bg-gray-800 animate-pulse rounded-xl" />
});

if (typeof window !== 'undefined') {
    // @ts-ignore
    window.katex = require('katex');
    // Also try to import it for safety
    import('katex').then(m => {
        // @ts-ignore
        window.katex = m.default || m;
    });
}

interface MathEditorProps {
    value: string;
    onChange: (content: string) => void;
    onFocus?: () => void;
    placeholder?: string;
}

export interface MathEditorRef {
    insertLaTeX: (latex: string) => void;
    focus: () => void;
    clear: () => void;
}

const MathEditor = forwardRef<MathEditorRef, MathEditorProps>(({ value, onChange, onFocus, placeholder }, ref) => {
    const quillRef = useRef<any>(null);
    const lastSelectionRef = useRef<number>(0);

    // Store last known cursor position
    const handleSelectionChange = useCallback((range: any) => {
        if (range) {
            lastSelectionRef.current = range.index;
        }
    }, []);

    useImperativeHandle(ref, () => ({
        insertLaTeX: (latex: string) => {
            try {
                if (quillRef.current) {
                    // Try to get the editor instance
                    const quillInstance = quillRef.current.getEditor
                        ? quillRef.current.getEditor()
                        : quillRef.current.editor;

                    if (quillInstance) {
                        // Get current selection or use last known position
                        const range = quillInstance.getSelection();
                        const insertIndex = range ? range.index : lastSelectionRef.current;

                        // Focus the editor first
                        quillInstance.focus();

                        // Use Quill's native formula embed - this stores the LaTeX in data-value
                        // and allows RichTextContent to render it properly using KaTeX
                        quillInstance.insertEmbed(insertIndex, 'formula', latex, 'user');
                        quillInstance.setSelection(insertIndex + 1);
                    } else {
                        // Fallback: append to the current value as a formula span
                        const formulaSpan = `<span class="ql-formula" data-value="${latex}"></span>`;
                        onChange(value + formulaSpan);
                    }
                }
            } catch (error) {
                console.error('Error inserting LaTeX:', error);
                // Fallback: append LaTeX as formula span
                const formulaSpan = `<span class="ql-formula" data-value="${latex}"></span>`;
                onChange(value + formulaSpan);
            }
        },
        focus: () => {
            if (quillRef.current) {
                const quillInstance = quillRef.current.getEditor
                    ? quillRef.current.getEditor()
                    : quillRef.current.editor;
                if (quillInstance) {
                    quillInstance.focus();
                }
            }
        },
        clear: () => {
            onChange('');
        }
    }));

    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                ['formula'],
                ['clean']
            ],
        },
    }), []);

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike',
        'list',
        'formula'
    ];

    return (
        <div className="math-editor-container bg-gray-900 rounded-xl overflow-hidden border border-gray-700 focus-within:border-blue-500/50 transition-colors">
            {/* @ts-ignore */}
            <ReactQuill
                ref={quillRef}
                theme="snow"
                value={value}
                onChange={onChange}
                onFocus={onFocus}
                onChangeSelection={handleSelectionChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder || 'Write your question here... Use the sigma icon for math formulas.'}
                className="text-white min-h-[150px]"
            />
            <style jsx global>{`
                .ql-toolbar.ql-snow {
                    background: #1a1b1e;
                    border: none;
                    border-bottom: 1px solid #374151;
                    padding: 8px;
                }
                .ql-container.ql-snow {
                    border: none;
                    font-size: 16px;
                }
                .ql-editor {
                    min-height: 150px;
                    color: white;
                }
                .ql-editor.ql-blank::before {
                    color: #9ca3af;
                    font-style: normal;
                }
                .ql-snow .ql-stroke {
                    stroke: #9ca3af;
                }
                .ql-snow .ql-fill {
                    fill: #9ca3af;
                }
                .ql-snow .ql-picker {
                    color: #9ca3af;
                }
                .ql-snow .ql-picker-options {
                    background-color: #1a1b1e;
                    border: 1px solid #374151;
                }
                .ql-snow.ql-toolbar button:hover .ql-stroke,
                .ql-snow.ql-toolbar button.ql-active .ql-stroke {
                    stroke: #3b82f6;
                }
                .ql-snow.ql-toolbar button:hover .ql-fill,
                .ql-snow.ql-toolbar button.ql-active .ql-fill {
                    fill: #3b82f6;
                }
                .ql-snow.ql-toolbar .ql-picker-label:hover,
                .ql-snow.ql-toolbar .ql-picker-label.ql-active {
                    color: #3b82f6;
                }
            `}</style>
        </div>
    );
});

MathEditor.displayName = 'MathEditor';

export default MathEditor;
