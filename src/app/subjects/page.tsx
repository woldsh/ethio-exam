'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { collection, getDocs, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Subject } from '@/types';
import SubjectCard from '@/components/SubjectCard';
import Sidebar from '@/components/Sidebar';
import { Loader2, BookOpen, Sparkles, GraduationCap, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

const defaultSubjects: Subject[] = [
    {
        id: 'mathematics',
        name: 'Mathematics',
        icon: 'math',
        description: 'Algebra, Geometry, Calculus, and more.',
        questionCount: 0,
        color: 'blue',
    },
    {
        id: 'physics',
        name: 'Physics',
        icon: 'physics',
        description: 'Mechanics, Thermodynamics, Waves, and Electricity.',
        questionCount: 0,
        color: 'purple',
    },
];

export default function SubjectsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const section = searchParams.get('section');

    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [availableYears, setAvailableYears] = useState<string[]>([]);
    const [loadingYears, setLoadingYears] = useState(false);
    const yearParam = searchParams.get('year');

    // Fetch available years for the current section
    useEffect(() => {
        if (section && !yearParam) {
            setLoadingYears(true);
            const fetchYears = async () => {
                try {
                    const q = query(
                        collection(db, 'questions'),
                        where('section', '==', section)
                    );
                    const snapshot = await getDocs(q);
                    const years = new Set<string>();
                    snapshot.docs.forEach(doc => {
                        const data = doc.data();
                        if (data.year) years.add(data.year);
                    });
                    setAvailableYears(Array.from(years).sort((a, b) => b.localeCompare(a)));
                } catch (error) {
                    console.error('Error fetching years:', error);
                } finally {
                    setLoadingYears(false);
                }
            };
            fetchYears();
        }
    }, [section, yearParam]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/register');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        // Use real-time listener for subjects
        const subjectsRef = collection(db, 'subjects');
        const q = query(subjectsRef, orderBy('name'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (snapshot.empty) {
                setSubjects(defaultSubjects);
            } else {
                const subjectsData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Subject[];
                setSubjects(subjectsData);
            }
            setLoading(false);
        }, (error) => {
            console.error('Error fetching subjects:', error);
            setSubjects(defaultSubjects);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleYearSelect = (year: string) => {
        router.push(`/subjects?section=${section}&year=${year}`);
    };

    return (
        <div className="min-h-screen light-premium-bg flex text-gray-900">
            <Sidebar />

            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-float" />
                <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-float-delayed" />
            </div>

            {/* Layout Spacer - Matches Sidebar Width */}
            <div className="hidden md:block w-[80px] xl:w-[280px] shrink-0 transition-all duration-300" />

            <main className="flex-1 min-w-0 relative p-4 md:p-8 transition-all duration-300">
                <div className="max-w-7xl mx-auto w-full">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-16 pt-8"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200 }}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-50 rounded-full border border-blue-100 mb-6 shadow-sm"
                        >
                            <Calendar className="w-5 h-5 text-blue-600" />
                            <span className="text-blue-700 font-bold uppercase tracking-wider text-xs">
                                {yearParam ? `Year: ${yearParam}` : 'Select Exam Year'}
                            </span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl sm:text-5xl font-black text-gray-900 mb-4 tracking-tight italic"
                        >
                            {yearParam ? (
                                <>
                                    Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 capitalize">{section} Science</span> Subjects
                                </>
                            ) : (
                                <>
                                    Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 font-black">Exam Year</span>
                                </>
                            )}
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-gray-500 max-w-2xl mx-auto text-lg font-medium"
                        >
                            {yearParam ? (
                                `Available subjects for the ${yearParam} EUEE ${section} stream.`
                            ) : section ? (
                                `Browse archived exams and practice questions for Grade 12 ${section} Science.`
                            ) : (
                                "Pick a category from the sidebar to begin your preparation journey."
                            )}
                        </motion.p>
                    </motion.div>

                    {/* Content Section */}
                    {(loading || (section && !yearParam && loadingYears)) ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-6 shadow-xl"
                            >
                                <Sparkles className="w-8 h-8 text-white" />
                            </motion.div>
                            <p className="text-gray-400 font-bold animate-pulse">Scanning the matrix...</p>
                        </div>
                    ) : section && !yearParam ? (
                        /* Year Selection Grid */
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {availableYears.length > 0 ? (
                                availableYears.map((year, index) => (
                                    <motion.button
                                        key={year}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.1 }}
                                        onClick={() => handleYearSelect(year)}
                                        className="group relative p-8 rounded-[2.5rem] bg-white border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 transition-all duration-500 text-left overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-blue-500/10 transition-colors" />
                                        <div className="relative z-10">
                                            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                                                <Calendar className="w-7 h-7 text-blue-600" />
                                            </div>
                                            <h3 className="text-3xl font-black text-gray-900 mb-2">{year} EUEE</h3>
                                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">National Exam</p>
                                        </div>
                                    </motion.button>
                                ))
                            ) : (
                                <div className="col-span-full py-20 text-center">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Calendar className="w-10 h-10 text-gray-300" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-400">No Exams Found</h3>
                                    <p className="text-gray-500 mt-2">Questions for this section are still being uploaded.</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Subjects Grid */
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {(section
                                ? subjects.filter(s => s.sections?.includes(section))
                                : subjects
                            ).map((subject, index) => (
                                <SubjectCard
                                    key={subject.id}
                                    subject={subject}
                                    index={index}
                                    href={`/exam/${subject.id}?section=${section}${yearParam ? `&year=${yearParam}` : ''}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
