'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, addDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Shield, Check, Loader2, ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function SetupAdminPage() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const setupAdmin = async () => {
        setLoading(true);
        setError(null);

        try {
            // Create admin user in Firebase Auth
            const adminEmail = 'woldsh@gmail.com';
            const adminPassword = 'wellson1212';
            const adminName = 'Admin User';

            const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
            const uid = userCredential.user.uid;

            // Add to users collection with admin role
            await setDoc(doc(db, 'users', uid), {
                email: adminEmail,
                name: adminName,
                role: 'admin',
                createdAt: new Date(),
            });

            // Add to admins collection
            await setDoc(doc(db, 'admins', uid), {
                email: adminEmail,
                name: adminName,
                createdAt: new Date(),
            });

            // Initialize default subjects
            const subjects = [
                { id: 'mathematics', name: 'Mathematics', icon: 'math', description: 'Algebra, Geometry, Calculus, and more.', questionCount: 0, color: 'blue' },
                { id: 'physics', name: 'Physics', icon: 'physics', description: 'Mechanics, Thermodynamics, Waves, and Electricity.', questionCount: 0, color: 'purple' },
                { id: 'chemistry', name: 'Chemistry', icon: 'chemistry', description: 'Organic, Inorganic, and Physical Chemistry.', questionCount: 0, color: 'green' },
                { id: 'biology', name: 'Biology', icon: 'biology', description: 'Cell Biology, Genetics, Ecology, and Human Anatomy.', questionCount: 0, color: 'orange' },
            ];

            for (const subject of subjects) {
                await setDoc(doc(db, 'subjects', subject.id), subject);
            }

            // Add sample questions
            const sampleQuestions = [
                // Mathematics
                { subjectId: 'mathematics', question: 'If 2x + 5 = 15, what is the value of x?', options: ['x = 3', 'x = 5', 'x = 7', 'x = 10'], correctAnswer: 1, type: 'mcq' },
                { subjectId: 'mathematics', question: 'What is the derivative of f(x) = x² + 3x?', options: ['2x + 3', 'x + 3', '2x', 'x²'], correctAnswer: 0, type: 'mcq' },
                // Physics
                { subjectId: 'physics', question: 'What is the SI unit of force?', options: ['Joule', 'Newton', 'Watt', 'Pascal'], correctAnswer: 1, type: 'mcq' },
                { subjectId: 'physics', question: 'According to Newton\'s second law, F = ma. If a 5 kg object accelerates at 2 m/s², what is the force?', options: ['2.5 N', '7 N', '10 N', '3 N'], correctAnswer: 2, type: 'mcq' },
                // Chemistry
                { subjectId: 'chemistry', question: 'What is the chemical formula for water?', options: ['H₂O', 'CO₂', 'NaCl', 'H₂SO₄'], correctAnswer: 0, type: 'mcq' },
                { subjectId: 'chemistry', question: 'What is the atomic number of Carbon?', options: ['4', '6', '8', '12'], correctAnswer: 1, type: 'mcq' },
                // Biology
                { subjectId: 'biology', question: 'What is the powerhouse of the cell?', options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Golgi Body'], correctAnswer: 2, type: 'mcq' },
                { subjectId: 'biology', question: 'DNA stands for:', options: ['Deoxyribonucleic Acid', 'Dinitrogen Acid', 'Deoxyribose Nucleotide Acid', 'Double Nucleic Acid'], correctAnswer: 0, type: 'mcq' },
            ];

            for (const q of sampleQuestions) {
                await addDoc(collection(db, 'questions'), {
                    ...q,
                    createdAt: new Date(),
                });
            }

            setSuccess(true);
            toast.success('Admin setup completed successfully!');
        } catch (err: any) {
            console.error('Setup error:', err);
            if (err.code === 'auth/email-already-in-use') {
                setError('Admin account already exists! You can login with the admin credentials.');
            } else {
                setError(err.message || 'Failed to setup admin');
            }
            toast.error(error || 'Setup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center premium-bg px-4 py-12">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float-delayed" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="relative w-full max-w-md"
            >
                <motion.div className="glass-card rounded-3xl p-8 overflow-hidden text-center">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" />

                    <div className="relative">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring' }}
                            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/30"
                        >
                            <Shield className="w-10 h-10 text-white" />
                        </motion.div>

                        <h1 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                            <Sparkles className="w-5 h-5 text-amber-400" />
                            Admin Setup
                        </h1>
                        <p className="text-gray-400 mb-8">
                            Initialize admin account and sample data
                        </p>

                        {success ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-6"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
                                    <Check className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-emerald-400 mb-2">Setup Complete!</h2>
                                    <p className="text-gray-400 text-sm mb-4">
                                        Admin account and sample data have been created.
                                    </p>
                                    <div className="p-4 bg-gray-800/50 rounded-xl text-left mb-6">
                                        <p className="text-gray-400 text-sm mb-1">Admin Credentials:</p>
                                        <p className="text-white"><strong>Email:</strong> woldsh@gmail.com</p>
                                        <p className="text-white"><strong>Password:</strong> wellson1212</p>
                                    </div>
                                </div>
                                <Link href="/login">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold"
                                    >
                                        Go to Login
                                    </motion.button>
                                </Link>
                            </motion.div>
                        ) : (
                            <div className="space-y-6">
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
                                    >
                                        <p className="text-red-400 text-sm">{error}</p>
                                    </motion.div>
                                )}

                                <div className="p-4 bg-gray-800/50 rounded-xl text-left">
                                    <p className="text-gray-300 text-sm mb-3">This will create:</p>
                                    <ul className="text-gray-400 text-sm space-y-2">
                                        <li className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                            Admin user (woldsh@gmail.com)
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                                            4 Subject categories
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-purple-500" />
                                            8 Sample questions
                                        </li>
                                    </ul>
                                </div>

                                <motion.button
                                    onClick={setupAdmin}
                                    disabled={loading}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-semibold disabled:opacity-50"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Setting up...
                                        </>
                                    ) : (
                                        <>
                                            <Shield className="w-5 h-5" />
                                            Initialize Admin & Data
                                        </>
                                    )}
                                </motion.button>

                                <Link href="/" className="block">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        className="w-full flex items-center justify-center gap-2 py-3 text-gray-400 hover:text-white transition-colors"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        Back to Home
                                    </motion.button>
                                </Link>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
