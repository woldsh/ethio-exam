'use client';

import { motion } from 'framer-motion';
import {
    BookOpen, Atom, FlaskConical, Leaf, Calculator, ArrowRight, Sparkles,
    Globe, Briefcase, Brain, PenTool, Music, Code, LineChart, Star
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Subject } from '@/types';

interface SubjectCardProps {
    subject: Subject;
    progress?: number;
    index: number;
    href?: string;
}

const iconMap: Record<string, React.ReactNode> = {
    math: <Calculator className="w-8 h-8" />,
    physics: <Atom className="w-8 h-8" />,
    chemistry: <FlaskConical className="w-8 h-8" />,
    biology: <Leaf className="w-8 h-8" />,
    english: <BookOpen className="w-8 h-8" />,
    geography: <Globe className="w-8 h-8" />,
    economics: <Briefcase className="w-8 h-8" />,
    psychology: <Brain className="w-8 h-8" />,
    art: <PenTool className="w-8 h-8" />,
    music: <Music className="w-8 h-8" />,
    coding: <Code className="w-8 h-8" />,
    business: <LineChart className="w-8 h-8" />,
    general: <Star className="w-8 h-8" />,
    default: <BookOpen className="w-8 h-8" />,
};

const colorMap: Record<string, { gradient: string; glow: string; border: string; icon: string; pattern: React.ReactNode }> = {
    blue: {
        gradient: 'from-blue-500 to-indigo-600',
        glow: 'shadow-blue-500/30',
        border: 'hover:border-blue-500/50',
        icon: 'from-blue-400 to-indigo-500',
        pattern: (
            <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
                <circle cx="10" cy="10" r="1" fill="currentColor" />
                <circle cx="30" cy="30" r="1" fill="currentColor" />
                <circle cx="50" cy="50" r="1" fill="currentColor" />
                <circle cx="70" cy="70" r="1" fill="currentColor" />
                <circle cx="90" cy="90" r="1" fill="currentColor" />
            </svg>
        )
    },
    purple: {
        gradient: 'from-violet-500 to-purple-600',
        glow: 'shadow-purple-500/30',
        border: 'hover:border-purple-500/50',
        icon: 'from-violet-400 to-purple-500',
        pattern: (
            <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0 0 L100 100 M100 0 L0 100" stroke="currentColor" strokeWidth="0.5" fill="none" />
            </svg>
        )
    },
    green: {
        gradient: 'from-emerald-500 to-teal-600',
        glow: 'shadow-emerald-500/30',
        border: 'hover:border-emerald-500/50',
        icon: 'from-emerald-400 to-teal-500',
        pattern: (
            <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
                <rect x="10" y="10" width="80" height="80" rx="10" stroke="currentColor" strokeWidth="0.5" fill="none" />
            </svg>
        )
    },
    orange: {
        gradient: 'from-orange-500 to-red-600',
        glow: 'shadow-orange-500/30',
        border: 'hover:border-orange-500/50',
        icon: 'from-orange-400 to-red-500',
        pattern: (
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_1px,_transparent_1px)] bg-[size:10px_10px]" />
        )
    },
    red: {
        gradient: 'from-red-500 to-rose-600',
        glow: 'shadow-red-500/30',
        border: 'hover:border-red-500/50',
        icon: 'from-red-400 to-rose-500',
        pattern: (
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(45deg, currentColor 25%, transparent 25%, transparent 50%, currentColor 50%, currentColor 75%, transparent 75%, transparent)', backgroundSize: '10px 10px' }} />
        )
    },
    pink: {
        gradient: 'from-pink-500 to-fuchsia-600',
        glow: 'shadow-pink-500/30',
        border: 'hover:border-pink-500/50',
        icon: 'from-pink-400 to-fuchsia-500',
        pattern: (
            <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(-45deg,_currentColor,_currentColor_1px,_transparent_1px,_transparent_10px)]" />
        )
    },
    indigo: {
        gradient: 'from-indigo-500 to-blue-700',
        glow: 'shadow-indigo-500/30',
        border: 'hover:border-indigo-500/50',
        icon: 'from-indigo-400 to-blue-600',
        pattern: (
            <div className="absolute inset-0 opacity-10 bg-[conic-gradient(at_center,_currentColor_0deg_90deg,_transparent_90deg_180deg,_currentColor_180deg_270deg,_transparent_270deg)] bg-[size:20px_20px]" />
        )
    },
    teal: {
        gradient: 'from-teal-500 to-cyan-600',
        glow: 'shadow-teal-500/30',
        border: 'hover:border-teal-500/50',
        icon: 'from-teal-400 to-cyan-500',
        pattern: (
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_20%,_currentColor_0%,_transparent_50%)]" />
        )
    },
    amber: {
        gradient: 'from-amber-500 to-orange-600',
        glow: 'shadow-amber-500/30',
        border: 'hover:border-amber-500/50',
        icon: 'from-amber-400 to-orange-500',
        pattern: (
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-conic-gradient(from 0deg at 50% 50%, currentColor 0deg 30deg, transparent 30deg 60deg)', backgroundSize: '40px 40px' }} />
        )
    },
    default: {
        gradient: 'from-gray-500 to-gray-600',
        glow: 'shadow-gray-500/30',
        border: 'hover:border-gray-500/50',
        icon: 'from-gray-400 to-gray-500',
        pattern: null
    },
};

export default function SubjectCard({ subject, progress = 0, index, href }: SubjectCardProps) {
    const searchParams = useSearchParams();
    const section = searchParams.get('section');
    const iconKey = subject.icon?.toLowerCase() || 'default';
    const colorKey = subject.color?.toLowerCase() || 'blue';
    const icon = iconMap[iconKey] || iconMap.default;
    const colors = colorMap[colorKey] || colorMap.default;

    const defaultHref = `/exam/${subject.id}${section ? `?section=${section}` : ''}`;
    const finalHref = href || defaultHref;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: index * 0.1, type: 'spring', stiffness: 200 }}
        >
            <Link href={finalHref}>
                <motion.div
                    whileHover={{ y: -10, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`group relative overflow-hidden rounded-3xl card-light border border-gray-100 ${colors.border} cursor-pointer transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-gray-200/50`}
                >
                    {/* Static Patterns */}
                    <div className={`absolute inset-0 text-gray-100`}>
                        {colors.pattern}
                    </div>

                    {/* Animated Gradient Background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                    {/* Floating Particles */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <motion.div
                            className={`absolute top-4 right-4 w-28 h-28 bg-gradient-to-br ${colors.gradient} opacity-10 rounded-full blur-3xl`}
                            animate={{
                                scale: [1, 1.4, 1],
                                opacity: [0.1, 0.2, 0.1],
                                x: [0, 20, 0],
                                y: [0, -20, 0]
                            }}
                            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                        />
                    </div>

                    {/* Card Content */}
                    <div className="relative p-6">
                        {/* Icon */}
                        <motion.div
                            className={`w-16 h-16 rounded-[1.25rem] bg-gradient-to-br ${colors.gradient} flex items-center justify-center text-white mb-5 shadow-lg ${colors.glow} group-hover:scale-110 transition-transform`}
                            whileHover={{
                                rotateY: [0, 180, 360],
                            }}
                            transition={{ duration: 1, ease: 'easeInOut' }}
                        >
                            <div className="group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.6)] transition-all">
                                {icon}
                            </div>
                        </motion.div>

                        {/* Title */}
                        <h3 className="text-xl font-black text-gray-900 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all">
                            {subject.name}
                        </h3>

                        {/* Description */}
                        <p className="text-gray-500 text-sm mb-5 line-clamp-2 leading-relaxed font-medium">
                            {subject.description}
                        </p>

                        {/* Stats */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-gray-200" />
                                <span className="text-sm text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                                    {subject.questionCount || 'Sample'} Questions
                                </span>
                            </div>
                            {progress > 0 && (
                                <span className={`text-xs font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r ${colors.icon}`}>
                                    {progress}% Complete
                                </span>
                            )}
                        </div>

                        {/* Progress Bar */}
                        {progress > 0 && (
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-4">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
                                    className={`h-full bg-gradient-to-r ${colors.gradient} rounded-full`}
                                />
                            </div>
                        )}

                        {/* CTA */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-300 group-hover:text-gray-900 transition-colors">
                                Start Practice
                            </span>
                            <motion.div
                                className={`w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-gradient-to-br ${colors.gradient} group-hover:text-white transition-all shadow-sm`}
                                whileHover={{ scale: 1.1, x: 5 }}
                            >
                                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-white" />
                            </motion.div>
                        </div>
                    </div>

                    {/* Hover Border Effect */}
                    <div className={`absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-blue-500/10 pointer-events-none transition-all`} />
                </motion.div>
            </Link>
        </motion.div>
    );
}
