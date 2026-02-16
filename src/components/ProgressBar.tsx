'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface ProgressBarProps {
    current: number;
    total: number;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
    const percentage = Math.round((current / total) * 100);

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium text-gray-300">
                        Question <span className="text-white font-bold">{current}</span> of <span className="text-white font-bold">{total}</span>
                    </span>
                </div>
                <motion.div
                    key={percentage}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center gap-2"
                >
                    <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                        {percentage}%
                    </span>
                </motion.div>
            </div>

            {/* Progress Track */}
            <div className="relative h-4 bg-gray-800/50 rounded-full overflow-hidden border border-gray-700/50">
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                </div>

                {/* Progress Fill */}
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="relative h-full rounded-full overflow-hidden"
                >
                    {/* Gradient Fill */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />

                    {/* Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />

                    {/* Glow */}
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20" />
                </motion.div>

                {/* Step Indicators */}
                <div className="absolute inset-0 flex items-center justify-between px-1">
                    {Array.from({ length: total }, (_, i) => (
                        <motion.div
                            key={i}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className={`w-2 h-2 rounded-full transition-colors ${i < current
                                    ? 'bg-white/40'
                                    : 'bg-gray-600/40'
                                }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
