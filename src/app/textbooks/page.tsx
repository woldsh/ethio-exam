'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import {
    BookOpen, Download, Search, Filter, Book,
    FileText, ArrowRight, Star, GraduationCap,
    LayoutGrid, List, Sparkles
} from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'react-hot-toast';

interface TextbookData {
    id: string;
    grade: number;
    subjectId: string;
    stream: string;
    studentBookUrl?: string;
    teacherGuideUrl?: string;
}

const grades = Array.from({ length: 12 }, (_, i) => i + 1);

const patterns: Record<string, React.ReactNode> = {
    blue: <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_#fff_1px,_transparent_1px)] bg-[size:10px_10px]" />,
    purple: <div className="absolute inset-0 opacity-10 bg-[conic-gradient(at_center,_#fff_0deg_90deg,_transparent_90deg_180deg,_#fff_180deg_270deg,_transparent_270deg)] bg-[size:20px_20px]" />,
    emerald: <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_20%,_#fff_0%,_transparent_50%)]" />,
    orange: <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(-45deg,_#fff,_#fff_1px,_transparent_1px,_transparent:10px)]" />,
    pink: <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,_#fff_10%,_transparent_10%)] bg-[size:20px_20px]" />,
    indigo: <div className="absolute inset-0 opacity-10 bg-[conic-gradient(from_0deg_at_50%_50%,_#fff_0deg_30deg,_transparent_30deg_60deg)] bg-[size:40px_40px]" />,
    amber: <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_#fff_1px,_transparent_1px)] bg-[size:15px_15px]" />,
    red: <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,_#fff_25%,_transparent_25%,_transparent_50%,_#fff_50%,_#fff_75%,_transparent_75%,_transparent)] bg-[size:10px_10px]" />,
};

const allSubjects = [
    { name: 'Mathematics', icon: '📐', color: 'blue', grades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], streams: ['natural', 'social'] },
    { name: 'English', icon: '📝', color: 'pink', grades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], streams: ['natural', 'social'] },
    { name: 'Amharic', icon: '🇪🇹', color: 'red', grades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], streams: ['natural', 'social'] },
    { name: 'Env. Science', icon: '🌍', color: 'emerald', grades: [1, 2, 3, 4, 5, 6], streams: [] },
    { name: 'Integrated Science', icon: '🧪', color: 'emerald', grades: [7, 8], streams: [] },
    { name: 'Social Studies', icon: '🏛️', color: 'indigo', grades: [1, 2, 3, 4, 5, 6, 7, 8], streams: [] },
    { name: 'Physics', icon: '⚛️', color: 'purple', grades: [9, 10, 11, 12], streams: ['natural'] },
    { name: 'Chemistry', icon: '🧪', color: 'emerald', grades: [9, 10, 11, 12], streams: ['natural'] },
    { name: 'Biology', icon: '🧬', color: 'orange', grades: [9, 10, 11, 12], streams: ['natural'] },
    { name: 'Geography', icon: '🗺️', color: 'teal', grades: [9, 10, 11, 12], streams: ['social'] },
    { name: 'History', icon: '📜', color: 'amber', grades: [9, 10, 11, 12], streams: ['social'] },
    { name: 'Civics', icon: '🏛️', color: 'indigo', grades: [9, 10, 11, 12], streams: ['natural', 'social'] },
    { name: 'Economics', icon: '📈', color: 'blue', grades: [11, 12], streams: ['social'] },
    { name: 'Art', icon: '🎨', color: 'purple', grades: [1, 2, 3, 4, 5, 6], streams: [] },
    { name: 'Physical Ed.', icon: '⚽', color: 'orange', grades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], streams: [] },
];

export default function TextbooksPage() {
    const [selectedGrade, setSelectedGrade] = useState<number>(12); // Default to G-12
    const [selectedStream, setSelectedStream] = useState<'natural' | 'social'>('natural');
    const [searchQuery, setSearchQuery] = useState('');
    const [textbooksData, setTextbooksData] = useState<TextbookData[]>([]);
    const [dbSubjects, setDbSubjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch textbooks for current grade
                const texQ = query(collection(db, 'textbooks'), where('grade', '==', selectedGrade));
                const texSnapshot = await getDocs(texQ);
                setTextbooksData(texSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as TextbookData[]);

                // Fetch all subjects to match IDs
                const subSnapshot = await getDocs(collection(db, 'subjects'));
                setDbSubjects(subSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (error) {
                console.error('Error fetching data:', error);
                // toast.error('Failed to load library content');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedGrade]);

    const filteredSubjects = useMemo(() => {
        return allSubjects.filter(sub => {
            const matchesGrade = sub.grades.includes(selectedGrade);
            const matchesSearch = sub.name.toLowerCase().includes(searchQuery.toLowerCase());

            // For G-11 and G-12, also filter by stream
            if (selectedGrade >= 11) {
                const matchesStream = sub.streams.includes(selectedStream);
                return matchesGrade && matchesSearch && matchesStream;
            }

            return matchesGrade && matchesSearch;
        }).map(sub => {
            // Join with textbook data
            // Match by subject name in DB
            const dbSub = dbSubjects.find(s => s.name.toLowerCase() === sub.name.toLowerCase());
            const textbook = textbooksData.find(t =>
                (t.subjectId === dbSub?.id || t.subjectName.toLowerCase() === sub.name.toLowerCase()) &&
                (t.stream === selectedStream || t.stream === 'none' || selectedGrade < 11)
            );

            return {
                ...sub,
                studentBookUrl: textbook?.studentBookUrl,
                teacherGuideUrl: textbook?.teacherGuideUrl
            };
        });
    }, [selectedGrade, selectedStream, searchQuery, textbooksData, dbSubjects]);

    return (
        <div className="min-h-screen premium-bg text-white selection:bg-blue-500/30">
            <Navbar />

            {/* Background Decor */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] animate-pulse delay-700" />
            </div>

            <main className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header Section */}
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-6 backdrop-blur-md"
                        >
                            <Sparkles className="w-4 h-4" />
                            <span className="text-sm font-bold tracking-wider uppercase">Digital Knowledge Hub</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-7xl font-black mb-8 leading-[1.1] tracking-tight"
                        >
                            The Library of <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-emerald-400 to-amber-400">Future Scholars.</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-gray-400 max-w-2xl mx-auto text-xl leading-relaxed"
                        >
                            Access every textbook and teacher guide from Grade 1 to 12.
                            Built for the new curriculum with instant PDF downloads.
                        </motion.p>
                    </div>

                    {/* Grade Navigation */}
                    <div className="mb-12">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                            <div>
                                <h2 className="text-xl font-bold flex items-center gap-2 mb-1">
                                    <GraduationCap className="w-6 h-6 text-blue-400" />
                                    Grade Level
                                </h2>
                                <p className="text-sm text-gray-500">Pick any grade to filter textbooks</p>
                            </div>

                            {/* Stream Selector for G-11/12 */}
                            {selectedGrade >= 11 && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex p-1 bg-gray-900/60 rounded-2xl border border-white/5 backdrop-blur-md"
                                >
                                    <button
                                        onClick={() => setSelectedStream('natural')}
                                        className={`px-6 py-2 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${selectedStream === 'natural'
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                            : 'text-gray-500 hover:text-gray-300'
                                            }`}
                                    >
                                        Natural
                                    </button>
                                    <button
                                        onClick={() => setSelectedStream('social')}
                                        className={`px-6 py-2 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${selectedStream === 'social'
                                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                                            : 'text-gray-500 hover:text-gray-300'
                                            }`}
                                    >
                                        Social
                                    </button>
                                </motion.div>
                            )}
                        </div>

                        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-3">
                            {grades.map((grade) => (
                                <motion.button
                                    key={grade}
                                    whileHover={{ y: -5, scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setSelectedGrade(grade)}
                                    className={`relative h-16 rounded-2xl font-black text-xl transition-all border overflow-hidden ${selectedGrade === grade
                                        ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_20px_rgba(59,130,246,0.5)]'
                                        : 'bg-gray-900/40 border-white/5 text-gray-500 hover:border-white/20 hover:text-white'
                                        }`}
                                >
                                    {grade}
                                    {selectedGrade === grade && (
                                        <motion.div
                                            layoutId="grade-pulse"
                                            className="absolute inset-0 bg-white/10"
                                            animate={{ opacity: [0.1, 0.3, 0.1] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        />
                                    )}
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="flex flex-col lg:flex-row gap-6 mb-16 items-center">
                        <div className="relative flex-1 w-full group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                            <input
                                type="text"
                                placeholder={`Search Grade ${selectedGrade}${selectedGrade >= 11 ? ` ${selectedStream}` : ''} subjects...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-900/40 backdrop-blur-md border border-white/10 rounded-3xl py-5 pl-14 pr-6 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all text-lg placeholder:text-gray-600"
                            />
                        </div>
                        <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
                            <span className="text-sm font-bold text-gray-500 whitespace-nowrap">POPULAR:</span>
                            {['Math', 'English', 'Amharic'].map(p => (
                                <button
                                    key={p}
                                    onClick={() => setSearchQuery(p)}
                                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-black uppercase hover:bg-white/10 transition-colors whitespace-nowrap"
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content Section */}
                    {filteredSubjects.length > 0 ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredSubjects.map((sub, i) => (
                                <motion.div
                                    key={sub.name}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    whileHover={{ y: -8 }}
                                    className={`group relative h-[360px] rounded-[2.5rem] bg-gray-900/40 border-2 border-white/5 transition-all duration-500 overflow-hidden p-8 flex flex-col justify-between hover:border-blue-500/30`}
                                >
                                    {/* Pattern Layer */}
                                    <div className={`absolute inset-0 opacity-10 text-${sub.color}-500 transition-colors duration-500`}>
                                        {patterns[sub.color] || patterns.blue}
                                    </div>

                                    {/* Glow Layer */}
                                    <div className={`absolute -top-20 -right-20 w-48 h-48 bg-${sub.color}-500/10 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity`} />

                                    <div className="relative z-10">
                                        <div className={`w-16 h-16 rounded-2xl bg-gray-800/80 border border-white/10 flex items-center justify-center text-4xl shadow-2xl mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform group-hover:bg-${sub.color}-500/20`}>
                                            {sub.icon}
                                        </div>
                                        <h3 className="text-2xl font-black text-white mb-2 tracking-tight group-hover:text-blue-400 transition-colors">
                                            {sub.name}
                                        </h3>
                                        <div className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-widest">
                                            <GraduationCap className="w-4 h-4" />
                                            Grade {selectedGrade}
                                            {selectedGrade >= 11 && ` • ${selectedStream}`}
                                        </div>
                                    </div>

                                    <div className="relative z-10 space-y-3">
                                        <div className="flex flex-col gap-3">
                                            {sub.studentBookUrl ? (
                                                <a
                                                    href={sub.studentBookUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 text-white hover:bg-white/10 hover:border-white/20 transition-all group/btn"
                                                >
                                                    <span className="flex items-center gap-3 font-bold">
                                                        <FileText className="w-5 h-5 text-blue-400" />
                                                        Student Book
                                                    </span>
                                                    <Download className="w-5 h-5 opacity-0 group-hover/btn:opacity-100 transform translate-y-2 group-hover/btn:translate-y-0 transition-all" />
                                                </a>
                                            ) : (
                                                <div className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-900/60 border border-white/5 text-gray-600 cursor-not-allowed">
                                                    <span className="flex items-center gap-3 font-bold italic">
                                                        <FileText className="w-5 h-5 opacity-40" />
                                                        Student Book
                                                    </span>
                                                    <span className="text-[10px] uppercase font-black tracking-widest px-2 py-1 bg-white/5 rounded">Soon</span>
                                                </div>
                                            )}

                                            {sub.teacherGuideUrl ? (
                                                <a
                                                    href={sub.teacherGuideUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 text-white hover:bg-white/10 hover:border-white/20 transition-all group/btn2"
                                                >
                                                    <span className="flex items-center gap-3 font-bold text-gray-400 group-hover:text-white transition-colors">
                                                        <BookOpen className="w-5 h-5 text-emerald-400" />
                                                        Teacher's Guide
                                                    </span>
                                                    <Download className="w-5 h-5 opacity-0 group-hover/btn2:opacity-100 transform translate-y-2 group-hover/btn2:translate-y-0 transition-all text-emerald-400" />
                                                </a>
                                            ) : (
                                                <div className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-900/60 border border-white/5 text-gray-600 cursor-not-allowed">
                                                    <span className="flex items-center gap-3 font-bold italic opacity-60">
                                                        <BookOpen className="w-5 h-5 opacity-40" />
                                                        Teacher's Guide
                                                    </span>
                                                    <span className="text-[10px] uppercase font-black tracking-widest px-2 py-1 bg-white/5 rounded">Soon</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Interactive Indicator */}
                                    <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Sparkles className="w-5 h-5 text-gray-500 animate-pulse" />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-32 bg-gray-900/20 rounded-[3rem] border-2 border-dashed border-white/5 backdrop-blur-sm">
                            <BookOpen className="w-20 h-20 text-gray-800 mb-6 animate-bounce" />
                            <h3 className="text-3xl font-black text-gray-600 mb-2 italic">Nothing here yet...</h3>
                            <p className="text-gray-700 font-bold uppercase tracking-widest">Adjust your search or pick another stream</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Float CTA */}
            <motion.div
                initial={{ x: 100 }}
                animate={{ x: 0 }}
                className="fixed bottom-10 right-10 z-50 hidden lg:block"
            >
                <Link href="/exams">
                    <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black shadow-2xl flex items-center gap-3 hover:scale-105 transition-transform">
                        Practice Exams Now
                        <ArrowRight className="w-6 h-6" />
                    </button>
                </Link>
            </motion.div>

            {/* CSS Helper for tailwind dynamic colors if needed - though here we use static mostly */}
            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}
