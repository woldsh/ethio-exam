'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, getDocs, query, where, doc, getDoc, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Question } from '@/types';
import QuestionCard from '@/components/QuestionCard';
import ProgressBar from '@/components/ProgressBar';
import AIChat from '@/components/AIChat';
import Sidebar from '@/components/Sidebar';
import {
    Loader2, CheckCircle, XCircle, Clock, Trophy, Home, RotateCcw,
    AlertCircle, Sparkles, BookOpen, Zap,
    ChevronLeft, ChevronRight, Brain
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/auth-context';

export default function ExamPage() {
    const params = useParams();
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const searchParams = useSearchParams();
    const subjectId = params.subjectId as string;
    const section = searchParams.get('section');

    const [questions, setQuestions] = useState<Question[]>([]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/register');
        }
    }, [user, authLoading, router]);
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [chatOpen, setChatOpen] = useState(false);
    const [completionReason, setCompletionReason] = useState<'manual' | 'timeout' | null>(null);
    const [examComplete, setExamComplete] = useState(false);
    const [isExamStarted, setIsExamStarted] = useState(false);
    const [activeQuestionForChat, setActiveQuestionForChat] = useState<Question | null>(null);

    // Subject Data
    const [subjectData, setSubjectData] = useState<any>(null);

    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    // Initial Data Fetch
    useEffect(() => {
        const initData = async () => {
            try {
                // 1. Fetch Subject Details
                const subjectRef = doc(db, 'subjects', subjectId);
                const subjectSnap = await getDoc(subjectRef);

                if (subjectSnap.exists()) {
                    const data = { id: subjectSnap.id, ...subjectSnap.data() } as any;
                    setSubjectData(data);
                    // Initialize Timer (minutes -> seconds)
                    if (data.duration) {
                        setTimeLeft(data.duration * 60);
                    } else {
                        setTimeLeft(60 * 60); // Default 1 hr if not set
                    }
                } else {
                    // Fallback
                    setSubjectData({
                        name: subjectId,
                        icon: 'book',
                        color: 'blue'
                    });
                    setTimeLeft(60 * 60);
                }

                // 2. Fetch Questions
                const questionsRef = collection(db, 'questions');
                let q;
                const year = searchParams.get('year');

                if (section && year) {
                    q = query(
                        questionsRef,
                        where('subjectId', '==', subjectId),
                        where('section', '==', section),
                        where('year', '==', year)
                    );
                } else if (section) {
                    q = query(
                        questionsRef,
                        where('subjectId', '==', subjectId),
                        where('section', '==', section)
                    );
                } else {
                    q = query(questionsRef, where('subjectId', '==', subjectId));
                }

                const snapshot = await getDocs(q);

                if (!snapshot.empty) {
                    const questionsData = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                    })) as Question[];

                    // Sort by createdAt ascending (First uploaded -> Question 1)
                    questionsData.sort((a, b) => {
                        const dateA = a.createdAt instanceof Date ? a.createdAt : (a.createdAt as any)?.seconds ? new Date((a.createdAt as any).seconds * 1000) : new Date(a.createdAt);
                        const dateB = b.createdAt instanceof Date ? b.createdAt : (b.createdAt as any)?.seconds ? new Date((b.createdAt as any).seconds * 1000) : new Date(b.createdAt);
                        return dateA.getTime() - dateB.getTime();
                    });

                    setQuestions(questionsData);
                } else {
                    setQuestions([]);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Failed to load exam');
            } finally {
                setLoading(false);
            }
        };

        if (subjectId) {
            initData();
        }
    }, [subjectId, section]);

    // Timer Logic
    useEffect(() => {
        // Only run if exam is explicitly started
        if (!isExamStarted || timeLeft === null || examComplete || loading) return;

        if (timeLeft <= 0) {
            setCompletionReason('timeout');
            setExamComplete(true);
            toast.error('Time Expired! You Failed.', { icon: '⏰' });
            return;
        }

        const timerId = setInterval(() => {
            setTimeLeft((prev) => (prev !== null ? prev - 1 : null));
        }, 1000);

        return () => clearInterval(timerId);
    }, [timeLeft, examComplete, loading, isExamStarted]);

    // Format Time
    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const handleRestart = () => {
        setAnswers({});
        setExamComplete(false);
        setCompletionReason(null);
        setIsExamStarted(false);
        setActiveQuestionForChat(null);
        if (subjectData?.duration) {
            setTimeLeft(subjectData.duration * 60);
        } else {
            setTimeLeft(60 * 60);
        }
    };



    const correctCount = Object.entries(answers).filter(
        ([qId, answer]) => {
            const q = questions.find(q => q.id === qId);
            return q && q.correctAnswer === answer;
        }
    ).length;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center premium-bg">
                <Loader2 className="w-10 h-10 text-white animate-spin" />
            </div>
        );
    }

    // Default icon/gradient helpers
    const getGradient = (color: string) => {
        const map: Record<string, string> = {
            blue: 'from-blue-500 to-indigo-600',
            purple: 'from-violet-500 to-purple-600',
            green: 'from-emerald-500 to-teal-600',
            orange: 'from-orange-500 to-red-600',
        };
        return map[color] || map.blue;
    };

    const subjectGradient = getGradient(subjectData?.color || 'blue');

    return (
        <div className="min-h-screen light-premium-bg flex text-gray-900 relative overflow-hidden">
            <Sidebar />

            {/* Background Decor */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[10%] right-[10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[10%] left-[10%] w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[120px]" />
                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none" />
            </div>

            {/* Layout Spacer - Matches Sidebar Width */}
            <div className="hidden md:block w-[80px] xl:w-[280px] shrink-0 transition-all duration-300" />

            <main className="flex-1 min-w-0 relative z-10 p-4 md:p-8 transition-all duration-300">
                {questions.length === 0 ? (
                    <div className="max-w-4xl mx-auto text-center pt-24">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={`w-24 h-24 rounded-[2rem] bg-gradient-to-br ${subjectGradient} flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-blue-500/20`}
                        >
                            <BookOpen className="w-10 h-10 text-white" />
                        </motion.div>
                        <h2 className="text-3xl font-black text-gray-900 mb-4 italic uppercase tracking-tight">Deployment Pending</h2>
                        <p className="text-gray-500 mb-10 text-lg font-medium">The AI is currently curating high-yield questions for {subjectData?.name}.</p>
                        <button
                            onClick={() => router.push('/subjects')}
                            className="inline-flex items-center gap-3 px-8 py-4 bg-white border border-gray-100 text-gray-600 rounded-2xl hover:bg-gray-50 transition-all font-bold shadow-sm"
                        >
                            <Home className="w-5 h-5" />
                            Return to Portal
                        </button>
                    </div>
                ) : !isExamStarted ? (
                    // START SCREEN
                    <div className="max-w-xl mx-auto text-center pt-20">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={`w-32 h-32 rounded-[2.5rem] bg-gradient-to-br ${subjectGradient} flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-blue-500/20`}
                        >
                            <Zap className="w-16 h-16 text-white" />
                        </motion.div>

                        <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tight uppercase italic">{subjectData?.name}</h1>
                        <p className="text-gray-500 mb-12 text-lg font-medium">Ready to begin your assessment?</p>

                        <div className="grid grid-cols-2 gap-4 mb-12">
                            <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
                                <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Duration</div>
                                <div className="text-3xl font-black text-gray-900">{subjectData?.duration || 60} min</div>
                            </div>
                            <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
                                <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Questions</div>
                                <div className="text-3xl font-black text-gray-900">{questions.length}</div>
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsExamStarted(true)}
                            className={`w-full py-6 rounded-2xl font-black text-xl text-white uppercase tracking-widest shadow-xl shadow-blue-500/20 bg-gradient-to-r ${subjectGradient}`}
                        >
                            Start Exam
                        </motion.button>
                    </div>
                ) : examComplete ? (
                    <div className="max-w-xl mx-auto text-center pt-16">
                        {/* Completion Screen */}
                        <motion.div
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', damping: 15 }}
                            className={`w-32 h-32 rounded-[2.5rem] bg-gradient-to-br flex items-center justify-center mx-auto mb-10 shadow-[0_0_50px_rgba(245,158,11,0.2)] relative group
                                ${completionReason === 'timeout' ? 'from-red-500 to-red-700 shadow-red-500/30' : 'from-amber-400 to-orange-600'}
                            `}
                        >
                            <Trophy className="w-16 h-16 text-white group-hover:scale-110 transition-transform" />
                            <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-amber-300 animate-pulse" />
                        </motion.div>

                        <h1 className={`text-5xl font-black mb-4 tracking-tight uppercase italic ${completionReason === 'timeout' ? 'text-red-600' : 'text-gray-900'}`}>
                            {completionReason === 'timeout' ? 'You Failed.' : 'Section Mastery.'}
                        </h1>
                        <p className="text-gray-500 mb-12 text-lg font-medium">
                            {completionReason === 'timeout'
                                ? "Time allowed has expired. You are unresponsive."
                                : `You've successfully completed the ${subjectData?.name} assessment.`}
                        </p>

                        <div className="card-light rounded-[3rem] p-12 mb-12 relative overflow-hidden">
                            <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_center,_#000_1px,_transparent_1px)] bg-[size:10px_10px]" />
                            <div className="relative z-10 text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 mb-4 tracking-tighter">
                                {Math.round((correctCount / questions.length) * 100)}%
                            </div>
                            <p className="relative z-10 text-gray-500 mb-8 font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3">
                                <span className="text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">{correctCount}</span>
                                <span className="text-gray-300">Correct of</span>
                                <span className="text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">{questions.length}</span>
                            </p>
                            <div className="relative z-10 h-3 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.round((correctCount / questions.length) * 100)}%` }}
                                    transition={{ delay: 0.5, duration: 1.5, ease: "circOut" }}
                                    className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-5 justify-center">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleRestart}
                                className="flex items-center justify-center gap-3 px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-500/20"
                            >
                                <RotateCcw className="w-5 h-5" />
                                Run Again
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => router.push('/subjects')}
                                className="flex items-center justify-center gap-3 px-10 py-5 bg-white border border-gray-200 text-gray-600 rounded-2xl font-black text-lg hover:bg-gray-50 transition-all shadow-sm"
                            >
                                <Home className="w-5 h-5" />
                                All Courses
                            </motion.button>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto pb-20">
                        {/* Exam Header */}
                        <div className="mb-12 sticky top-4 z-50 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 uppercase tracking-tight">{subjectData?.name} Assessment</h1>
                                <div className="text-sm text-gray-500 font-medium">
                                    {section ? `${section.charAt(0).toUpperCase() + section.slice(1)} Stream` : 'Core Subject'}
                                    {searchParams.get('year') && ` • ${searchParams.get('year')} EUEE`}
                                </div>
                            </div>

                            {/* Timer */}
                            {timeLeft !== null && (
                                <div className={`
                                    flex items-center gap-2 px-4 py-2 rounded-xl border backdrop-blur-md shadow-sm transition-colors
                                    ${timeLeft < 60 ? 'bg-red-50 border-red-100 text-red-600 animate-pulse' : 'bg-gray-50 border-gray-100 text-gray-600'}
                                `}>
                                    <Clock className="w-4 h-4" />
                                    <span className="text-lg font-black tabular-nums tracking-wide">
                                        {formatTime(timeLeft)}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-12">
                            {questions.map((q, index) => (
                                <div key={q.id} className="relative">
                                    {/* Question Number Anchor */}
                                    <div className="absolute -left-12 top-0 hidden xl:flex flex-col items-center gap-2">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border ${answers[q.id] !== undefined
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-white text-gray-400 border-gray-200'
                                            }`}>
                                            {index + 1}
                                        </div>
                                    </div>

                                    <QuestionCard
                                        question={q}
                                        selectedAnswer={answers[q.id] ?? null}
                                        onSelectAnswer={(aIndex) => {
                                            if (answers[q.id] === undefined) {
                                                setAnswers(prev => ({ ...prev, [q.id]: aIndex }));
                                            }
                                        }}
                                        showResult={answers[q.id] !== undefined}
                                    />

                                    {/* Simple AI Chat Button for each question */}
                                    {answers[q.id] !== undefined && (
                                        <div className="flex justify-end mt-2">
                                            <button
                                                onClick={() => {
                                                    setActiveQuestionForChat(q);
                                                    setChatOpen(true);
                                                }}
                                                className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline"
                                            >
                                                <Brain className="w-4 h-4" /> Explain with AI
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Submit Button */}
                        <div className="mt-20 flex flex-col items-center gap-4">
                            <p className="text-gray-500 text-sm">Completed {Object.keys(answers).length} of {questions.length} questions</p>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                    if (confirm('Are you sure you want to finish the exam?')) {
                                        setCompletionReason('manual');
                                        setExamComplete(true);
                                        window.scrollTo(0, 0);
                                    }
                                }}
                                className={`
                                    px-16 py-6 rounded-2xl font-black text-xl text-white uppercase tracking-widest shadow-xl shadow-blue-500/30
                                    bg-gradient-to-r ${subjectGradient}
                                `}
                            >
                                Submit Exam
                            </motion.button>
                        </div>
                    </div>
                )
                }
            </main >

            {/* AI Chat Panel */}
            {activeQuestionForChat && (
                <AIChat
                    isOpen={chatOpen}
                    onClose={() => {
                        setChatOpen(false);
                        setActiveQuestionForChat(null);
                    }}
                    question={activeQuestionForChat}
                    subjectName={subjectData?.name || 'Subject'}
                />
            )}
        </div >
    );
}
