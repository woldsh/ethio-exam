'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ChevronRight, Hash, Calculator } from 'lucide-react';
import 'katex/dist/katex.min.css';
import katex from 'katex';

interface MathCalculatorProps {
    onInsert: (latex: string) => void;
    onClose: () => void;
}

type Tab = 'Algebra' | 'Trigonometry' | 'Calculus';

const MathCalculator: React.FC<MathCalculatorProps> = ({ onInsert, onClose }) => {
    const [activeTab, setActiveTab] = useState<Tab>('Algebra');

    const algebraKeys = [
        { label: '\\frac{\\Box}{\\Box}', latex: '\\frac{}{}' },
        { label: '\\sqrt{\\Box}', latex: '\\sqrt{}' },
        { label: '<', latex: '<' },
        { label: '(', latex: '(' },
        { label: ')', labelLatex: ')', latex: ')' },
        { label: 'AC', latex: 'CLEAR', isAction: true },

        { label: '\\frac{\\Box}{\\Box}', sub: 'Mixed', latex: '\\frac{}{}' },
        { label: '\\sqrt[\\Box]{\\Box}', latex: '\\sqrt[]{}' },
        { label: '\\le', latex: '\\le' },
        { label: '7', latex: '7' },
        { label: '8', latex: '8' },
        { label: '9', latex: '9' },
        { label: '\\div', latex: '\\div' },

        { label: '\\log_{\\Box}', latex: '\\log_{}' },
        { label: '\\Box!', latex: '!' },
        { label: '>', latex: '>' },
        { label: '4', latex: '4' },
        { label: '5', latex: '5' },
        { label: '6', latex: '6' },
        { label: '\\times', latex: '\\times' },

        { label: 'i', latex: 'i' },
        { label: '%', latex: '%' },
        { label: '\\ge', latex: '\\ge' },
        { label: '1', latex: '1' },
        { label: '2', latex: '2' },
        { label: '3', latex: '3' },
        { label: '-', latex: '-' },

        { label: 'x', latex: 'x' },
        { label: 'y', latex: 'y' },
        { label: '=', latex: '=' },
        { label: '0', latex: '0' },
        { label: '.', latex: '.' },
        { label: '>', latex: '\\rightarrow', isSend: true },
        { label: '+', latex: '+' },
    ];

    const trigKeys = [
        { label: '\\sin', latex: '\\sin()' },
        { label: '\\cos', latex: '\\cos()' },
        { label: '\\tan', latex: '\\tan()' },
        { label: '(', latex: '(' },
        { label: ')', latex: ')' },
        { label: 'AC', latex: 'CLEAR', isAction: true },

        { label: '\\csc', latex: '\\csc()' },
        { label: '\\sec', latex: '\\sec()' },
        { label: '\\cot', latex: '\\cot()' },
        { label: '7', latex: '7' },
        { label: '8', latex: '8' },
        { label: '9', latex: '9' },
        { label: '\\div', latex: '\\div' },

        { label: '\\arcsin', latex: '\\arcsin()' },
        { label: '\\arccos', latex: '\\arccos()' },
        { label: '\\arctan', latex: '\\arctan()' },
        { label: '4', latex: '4' },
        { label: '5', latex: '5' },
        { label: '6', latex: '6' },
        { label: '\\times', latex: '\\times' },

        { label: '\\Box^2', latex: '^{2}' },
        { label: '\\Box^\\circ', latex: '^{\\circ}' },
        { label: '\\pi', latex: '\\pi' },
        { label: '1', latex: '1' },
        { label: '2', latex: '2' },
        { label: '3', latex: '3' },
        { label: '-', latex: '-' },

        { label: 'x', latex: 'x' },
        { label: 'y', latex: 'y' },
        { label: '=', latex: '=' },
        { label: '0', latex: '0' },
        { label: '.', latex: '.' },
        { label: '>', latex: '\\rightarrow', isSend: true },
        { label: '+', latex: '+' },
    ];

    const calcKeys = [
        { label: '\\frac{d}{d\\Box}', latex: '\\frac{d}{d}' },
        { label: '\\infty', latex: '\\infty' },
        { label: '\\sqrt[\\Box]{\\Box}', latex: '\\sqrt[]{}' },
        { label: '(', latex: '(' },
        { label: ')', latex: ')' },
        { label: 'AC', latex: 'CLEAR', isAction: true },

        { label: '\\lim_{\\Box \\to \\Box}', latex: '\\lim_{\\to}' },
        { label: '\\lim_{\\Box \\to \\Box^+}', latex: '\\lim_{\\to^{+}}' },
        { label: '\\lim_{\\Box \\to \\Box^-}', latex: '\\lim_{\\to^{-}}' },
        { label: '7', latex: '7' },
        { label: '8', latex: '8' },
        { label: '9', latex: '9' },
        { label: '\\div', latex: '\\div' },

        { label: '\\log_{\\Box}', latex: '\\log_{}' },
        { label: 'C(n,k)', latex: 'C(n,k)' },
        { label: 'P(n,k)', latex: 'P(n,k)' },
        { label: '4', latex: '4' },
        { label: '5', latex: '5' },
        { label: '6', latex: '6' },
        { label: '\\times', latex: '\\times' },

        { label: '\\sum', latex: '\\sum_{}^{}' },
        { label: '\\int', latex: '\\int' },
        { label: '\\int_{a}^{b}', latex: '\\int_{}^{}' },
        { label: '1', latex: '1' },
        { label: '2', latex: '2' },
        { label: '3', latex: '3' },
        { label: '-', latex: '-' },

        { label: 'x', latex: 'x' },
        { label: 'y', latex: 'y' },
        { label: 'e', latex: 'e' },
        { label: '0', latex: '0' },
        { label: '.', latex: '.' },
        { label: '>', latex: '\\rightarrow', isSend: true },
        { label: '+', latex: '+' },
    ];

    const getKeys = () => {
        switch (activeTab) {
            case 'Algebra': return algebraKeys;
            case 'Trigonometry': return trigKeys;
            case 'Calculus': return calcKeys;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed right-0 top-0 h-screen w-[450px] bg-[#1a1b1e] border-l border-gray-800 shadow-2xl z-[100] flex flex-col"
        >
            {/* Header */}
            <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-[#131416]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <Calculator className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-white font-bold text-lg leading-tight">Advanced Math</h2>
                        <p className="text-gray-500 text-xs font-medium uppercase tracking-widest">Symbol Input</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2.5 rounded-xl hover:bg-gray-800 text-gray-400 transition-all active:scale-95"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex px-6 pt-6 gap-6 bg-[#131416]">
                {(['Algebra', 'Trigonometry', 'Calculus'] as Tab[]).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`
                            pb-4 text-sm font-bold tracking-tight transition-all relative
                            ${activeTab === tab ? 'text-blue-500' : 'text-gray-500 hover:text-gray-400'}
                        `}
                    >
                        {tab}
                        {activeTab === tab && (
                            <motion.div
                                layoutId="calculator-tab"
                                className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-full"
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Main Calculator Grid */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#1a1b1e] custom-scrollbar">
                <div className="grid grid-cols-7 gap-2">
                    {getKeys().map((key, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                if (key.latex === 'CLEAR') {
                                    onInsert('');
                                } else {
                                    onInsert(key.latex);
                                }
                            }}
                            className={`
                                aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-200 active:scale-90
                                ${key.isSend ? 'col-span-1 bg-blue-500 text-white hover:bg-blue-400' :
                                    key.isAction ? 'bg-gray-700/50 text-gray-400 hover:bg-gray-700' :
                                        idx % 7 < 3 ? 'bg-[#222327] text-white hover:bg-[#2c2d33] border border-gray-800/50' :
                                            'bg-[#2c2d33] text-gray-300 hover:bg-[#35363d] border border-gray-800/30'}
                            `}
                        >
                            <span className="text-sm font-medium">
                                {key.label.includes('\\') ? (
                                    <span dangerouslySetInnerHTML={{
                                        __html: katex.renderToString(key.label, { throwOnError: false })
                                    }} />
                                ) : (
                                    key.label === '>' ? <ChevronRight className="w-5 h-5" /> : key.label
                                )}
                            </span>
                            {/* @ts-ignore */}
                            {key.sub && <span className="text-[8px] text-gray-500 mt-0.5">{key.sub}</span>}
                        </button>
                    ))}
                </div>

                {/* Legend/Help */}
                <div className="mt-8 p-4 rounded-2xl bg-gray-900/50 border border-gray-800">
                    <div className="flex items-center gap-2 mb-2">
                        <Hash className="w-4 h-4 text-blue-500" />
                        <h4 className="text-white text-xs font-bold uppercase tracking-wider">Quick Hint</h4>
                    </div>
                    <p className="text-gray-400 text-xs leading-relaxed">
                        Select an input field in the question form first, then click any symbol here to insert it instantly. Use the Sigma button in the editor for more advanced LaTeX.
                    </p>
                </div>
            </div>

            {/* Bottom Branding */}
            <div className="p-6 border-t border-gray-800 text-center bg-[#131416]">
                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.3em]">
                    EthioExam Premium Matrix v2.0
                </p>
            </div>
        </motion.div>
    );
};

export default MathCalculator;
