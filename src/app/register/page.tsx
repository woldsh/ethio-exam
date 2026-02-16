'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, UserPlus, BookOpen, Sparkles, ArrowRight, Rocket, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import toast from 'react-hot-toast';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { signUp, signInWithGoogle } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            await signUp(email, password, name);
            toast.success('Account created successfully!');
            router.push('/subjects');
        } catch (error: any) {
            toast.error(error.message || 'Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen aurora-bg particles flex items-center justify-center p-4 selection:bg-emerald-500/30">
            {/* Animated Decorative Orbs */}
            <motion.div
                className="absolute top-1/4 -right-20 w-[600px] h-[600px] rounded-full opacity-20 pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)' }}
                animate={{ scale: [1, 1.2, 1], x: [0, -50, 0], y: [0, 30, 0] }}
                transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute bottom-1/4 -left-20 w-[500px] h-[500px] rounded-full opacity-20 pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)' }}
                animate={{ scale: [1.2, 1, 1.2], x: [0, 40, 0], y: [0, -40, 0] }}
                transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            />

            <Link href="/" className="absolute top-8 left-8 z-20 group">
                <motion.div
                    whileHover={{ x: -4 }}
                    className="flex items-center gap-2 text-white/40 group-hover:text-white transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                    <span className="font-bold text-sm tracking-widest uppercase">Back to Home</span>
                </motion.div>
            </Link>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-[540px] relative z-10"
            >
                <div className="ultra-glass rounded-[3rem] p-10 md:p-14 overflow-hidden relative">
                    {/* Glass Shine Effect */}
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent" />

                    <div className="text-center mb-10">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-3 mb-6"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-900/40">
                                <BookOpen className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-black text-white tracking-tighter">EthioExam</span>
                        </motion.div>

                        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                            Join the <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 glow-text">Elite.</span>
                        </h1>
                        <p className="text-white/40 font-medium">Begin your journey to academic mastery today.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-5">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">
                                    Full Name
                                </label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        className="w-full pl-6 pr-14 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.08] transition-all text-white placeholder-white/20 font-medium text-sm"
                                        placeholder="Abebe Bikila"
                                    />
                                    <User className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-emerald-400 transition-colors" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">
                                    Email Address
                                </label>
                                <div className="relative group">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full pl-6 pr-14 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.08] transition-all text-white placeholder-white/20 font-medium text-sm"
                                        placeholder="you@email.com"
                                    />
                                    <Mail className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-emerald-400 transition-colors" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">
                                        Password
                                    </label>
                                    <div className="relative group">
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="w-full pl-6 pr-14 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.08] transition-all text-white placeholder-white/20 font-medium text-sm"
                                            placeholder="••••••••"
                                        />
                                        <Lock className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-emerald-400 transition-colors" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">
                                        Confirm
                                    </label>
                                    <div className="relative group">
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            className="w-full pl-6 pr-14 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.08] transition-all text-white placeholder-white/20 font-medium text-sm"
                                            placeholder="••••••••"
                                        />
                                        <Lock className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-emerald-400 transition-colors" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={{ scale: 1.02, translateY: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-black text-lg shadow-2xl shadow-emerald-900/40 flex items-center justify-center gap-3 transition-all hover:shadow-emerald-500/40 group disabled:opacity-50 relative overflow-hidden mt-4"
                        >
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    Create Account
                                    <Rocket className="w-5 h-5 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </motion.button>

                        <div className="relative flex items-center justify-center py-2">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10"></div>
                            </div>
                            <span className="relative px-4 bg-transparent text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">
                                OR
                            </span>
                        </div>

                        <motion.button
                            type="button"
                            onClick={async () => {
                                setLoading(true);
                                try {
                                    await signInWithGoogle();
                                    toast.success('Account created with Google!');
                                    router.push('/subjects');
                                } catch (error: any) {
                                    toast.error(error.message || 'Google sign-up failed');
                                } finally {
                                    setLoading(false);
                                }
                            }}
                            whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.08)' }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-4.5 bg-white/5 border border-white/10 rounded-2xl font-bold text-white flex items-center justify-center gap-3 transition-all"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Register with Google
                        </motion.button>
                    </form>

                    <div className="mt-12 text-center border-t border-white/5 pt-8">
                        <p className="text-white/20 font-bold text-[10px] uppercase tracking-widest mb-4">Already a scholar?</p>
                        <Link href="/login">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                className="text-white font-black hover:text-emerald-400 transition-colors tracking-tight text-lg underline underline-offset-8 decoration-white/10 decoration-2"
                            >
                                Sign In To Your Account
                            </motion.button>
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
