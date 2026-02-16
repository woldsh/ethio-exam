'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, Sparkles, Lightbulb, Brain, Zap, BookOpen, ArrowRight } from 'lucide-react';
import { Question } from '@/types';

interface AIChatProps {
    isOpen: boolean;
    onClose: () => void;
    question: Question;
    subjectName: string;
}

export default function AIChat({ isOpen, onClose, question, subjectName }: AIChatProps) {
    const [response, setResponse] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getExplanation = async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: question.question,
                    options: question.options,
                    subject: subjectName,
                }),
            });

            if (!res.ok) {
                throw new Error('Failed to get AI response');
            }

            const data = await res.json();
            setResponse(data.response);
        } catch (err) {
            setError('Failed to get explanation. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Reset and auto-fetch when question changes
    useEffect(() => {
        if (isOpen) {
            setResponse(null);
            setError(null);
            getExplanation();
        }
    }, [isOpen, question.id]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-md z-40"
                        onClick={onClose}
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: '100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 30, stiffness: 250 }}
                        className="fixed right-0 top-0 h-full w-full max-w-xl glass-card z-50 overflow-hidden flex flex-col border-l border-gray-700/50"
                    >
                        {/* Header */}
                        <div className="relative p-6 border-b border-gray-700/50 overflow-hidden">
                            {/* Animated Background */}
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-900/50 via-blue-900/50 to-indigo-900/50" />
                            <div className="absolute inset-0">
                                <div className="absolute top-0 left-1/4 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-float" />
                                <div className="absolute bottom-0 right-1/4 w-24 h-24 bg-blue-500/20 rounded-full blur-3xl animate-float-delayed" />
                            </div>

                            <div className="relative flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <motion.div
                                        className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30"
                                        animate={{ rotate: [0, 5, -5, 0] }}
                                        transition={{ duration: 4, repeat: Infinity }}
                                    >
                                        <Brain className="w-7 h-7 text-white" />
                                    </motion.div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                            AI Explanation
                                            <Sparkles className="w-5 h-5 text-yellow-400" />
                                        </h2>
                                        <p className="text-purple-200 text-sm">Step-by-step guidance</p>
                                    </div>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={onClose}
                                    className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                                >
                                    <X className="w-5 h-5 text-white" />
                                </motion.button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Question Preview */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="relative p-5 rounded-2xl border border-gray-700/50 bg-gray-800/30 overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl" />
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                        <BookOpen className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-blue-300 text-sm font-medium mb-1">Your Question</p>
                                        <div
                                            className="text-white rich-text-preview"
                                            dangerouslySetInnerHTML={{ __html: question.question }}
                                        />
                                    </div>
                                </div>
                            </motion.div>

                            {/* Loading State */}
                            {loading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center justify-center py-16 space-y-6"
                                >
                                    <div className="relative">
                                        <motion.div
                                            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center"
                                            animate={{
                                                rotate: 360,
                                                scale: [1, 1.1, 1]
                                            }}
                                            transition={{
                                                rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
                                                scale: { duration: 1, repeat: Infinity }
                                            }}
                                        >
                                            <Brain className="w-10 h-10 text-white" />
                                        </motion.div>
                                        <motion.div
                                            className="absolute inset-0 rounded-2xl border-2 border-purple-400"
                                            animate={{ scale: [1, 1.5], opacity: [1, 0] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                        />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-white font-medium mb-1">Analyzing your question...</p>
                                        <p className="text-gray-400 text-sm">The AI tutor is preparing a detailed explanation</p>
                                    </div>

                                    {/* Loading Steps */}
                                    <div className="space-y-3 w-full max-w-xs">
                                        {['Understanding the problem', 'Identifying key concepts', 'Preparing solution'].map((step, i) => (
                                            <motion.div
                                                key={step}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.5 }}
                                                className="flex items-center gap-3"
                                            >
                                                <motion.div
                                                    className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center"
                                                    animate={{ scale: [1, 1.2, 1] }}
                                                    transition={{ delay: i * 0.5, duration: 0.5, repeat: Infinity, repeatDelay: 1.5 }}
                                                >
                                                    <Zap className="w-3 h-3 text-white" />
                                                </motion.div>
                                                <span className="text-gray-300 text-sm">{step}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Error State */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30"
                                >
                                    <p className="text-red-400 font-medium mb-2">{error}</p>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={getExplanation}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-300 rounded-xl text-sm hover:bg-red-500/30 transition-colors"
                                    >
                                        <Send className="w-4 h-4" />
                                        Try again
                                    </motion.button>
                                </motion.div>
                            )}

                            {/* AI Response */}
                            {response && !loading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                    className="space-y-6 pb-12"
                                >
                                    {/* Response Sections Parser */}
                                    {(() => {
                                        // Split by newline followed by a header pattern (**Text:**)
                                        const sections = response.split(/\n(?=\*\*.*?:)/);
                                        return sections.map((section, idx) => {
                                            const trimmedSection = section.trim();
                                            if (!trimmedSection) return null;

                                            const isHeader = trimmedSection.startsWith('**');
                                            const lines = trimmedSection.split('\n');
                                            const titleLine = isHeader ? lines[0] : 'AI Explanation';
                                            const content = isHeader ? lines.slice(1).join('\n').trim() : trimmedSection;

                                            // Clean up the title (remove ** and :)
                                            const cleanTitle = titleLine.replace(/\*\*/g, '').replace(/:$/, '').trim();

                                            if (cleanTitle.includes('Question')) {
                                                return null; // Skip redundant question restatement
                                            }

                                            let icon = <Lightbulb className="w-5 h-5" />;
                                            let colorClass = "text-blue-400";
                                            let bgClass = "bg-blue-500/10";
                                            let accentColor = "rgba(59, 130, 246, 0.4)";

                                            if (cleanTitle.includes('Topic') || cleanTitle.includes('Insight')) {
                                                icon = <Sparkles className="w-5 h-5" />;
                                                colorClass = "text-purple-400";
                                                bgClass = "bg-purple-500/10";
                                                accentColor = "rgba(167, 139, 250, 0.4)";
                                            } else if (cleanTitle.includes('Solution') || cleanTitle.includes('Step')) {
                                                icon = <Zap className="w-5 h-5" />;
                                                colorClass = "text-amber-400";
                                                bgClass = "bg-amber-500/10";
                                                accentColor = "rgba(251, 191, 36, 0.4)";
                                            } else if (cleanTitle.includes('Answer')) {
                                                icon = <ArrowRight className="w-5 h-5" />;
                                                colorClass = "text-emerald-400";
                                                bgClass = "bg-emerald-500/10";
                                                accentColor = "rgba(52, 211, 153, 0.4)";
                                            } else if (cleanTitle.includes('Tip')) {
                                                icon = <Lightbulb className="w-5 h-5" />;
                                                colorClass = "text-yellow-400";
                                                bgClass = "bg-yellow-500/10";
                                                accentColor = "rgba(250, 204, 21, 0.4)";
                                            }

                                            if (!content && !isHeader) return null;

                                            return (
                                                <motion.div
                                                    key={idx}
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.1 * idx }}
                                                    className={`group relative p-6 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-sm hover:bg-white/[0.04] transition-all overflow-hidden shadow-2xl shadow-black/20`}
                                                >
                                                    {/* Glow Background */}
                                                    <div
                                                        className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] opacity-10 pointer-events-none transition-opacity group-hover:opacity-20"
                                                        style={{ backgroundColor: accentColor }}
                                                    />

                                                    <div className="relative">
                                                        <div className="flex items-center gap-4 mb-5">
                                                            <div className={`w-12 h-12 rounded-2xl ${bgClass} flex items-center justify-center shadow-lg`}>
                                                                <div className={colorClass}>{icon}</div>
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <h3 className={`font-black uppercase tracking-[0.2em] text-[10px] ${colorClass} opacity-80 mb-0.5`}>
                                                                    Knowledge Section
                                                                </h3>
                                                                <span className="text-lg font-black text-white tracking-tight">
                                                                    {cleanTitle}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="prose prose-invert max-w-none">
                                                            <div className="whitespace-pre-wrap text-[15px] leading-[1.8] text-gray-200 font-medium">
                                                                {/* Simple Bold Highlighting */}
                                                                {(content || titleLine).split(/(\*\*.*?\*\*)/g).map((part, i) => (
                                                                    part.startsWith('**') && part.endsWith('**') ? (
                                                                        <strong key={i} className={`font-black ${colorClass}`}>
                                                                            {part.slice(2, -2)}
                                                                        </strong>
                                                                    ) : part
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        });
                                    })()}

                                    {/* Final Motivation Card */}
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.6 }}
                                        className="relative p-8 rounded-[2.5rem] bg-gradient-to-br from-indigo-600/20 via-purple-600/20 to-pink-600/10 border border-white/10 overflow-hidden text-center shadow-2xl"
                                    >
                                        <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />
                                        <div className="relative">
                                            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-orange-500/30 rotate-3">
                                                <span className="text-4xl">🏅</span>
                                            </div>
                                            <h4 className="text-2xl font-black text-white mb-3 tracking-tighter">You're Getting Smarter!</h4>
                                            <p className="text-purple-100/50 text-sm font-medium mb-8 leading-relaxed max-w-xs mx-auto">
                                                Every explanation you read brings you closer to your dream score. Stay consistent!
                                            </p>
                                            <div className="flex items-center justify-center gap-4">
                                                <div className="h-px w-12 bg-white/10" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Scholar Status: Active</span>
                                                <div className="h-px w-12 bg-white/10" />
                                            </div>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-gray-700/50 bg-gray-900/50">
                            <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
                                <span>🇪🇹</span>
                                <span>Ethiopian Entrance Exam AI Tutor</span>
                                <span>•</span>
                                <span className="text-purple-400">Powered by Groq</span>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
