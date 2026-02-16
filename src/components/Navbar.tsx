'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { BookOpen, LogOut, User, Menu, X, Sparkles, Shield, FileText } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
    const { user, userData, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const isHome = pathname === '/';

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 100 }}
            className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${isHome ? 'ultra-glass border-white/5' : 'glass border-gray-700/50'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <motion.div
                            className="relative w-12 h-12 rounded-xl overflow-hidden"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-green-500 via-yellow-500 to-red-500" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-white" />
                            </div>
                        </motion.div>
                        <div className="flex flex-col">
                            <span className={`font-bold text-xl leading-tight ${isHome ? 'text-slate-900' : 'text-white'}`}>
                                Ethio<span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-500">Exam</span>
                            </span>
                            <span className={`text-xs leading-tight ${isHome ? 'text-slate-500' : 'text-gray-400'}`}>AI Tutor</span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        <NavLink href="/textbooks" isHome={isHome}>
                            <BookOpen className="w-4 h-4" />
                            Textbooks
                        </NavLink>
                        <NavLink href="/exams" isHome={isHome}>
                            <FileText className="w-4 h-4" />
                            Exams
                        </NavLink>

                        {user ? (
                            <>
                                <NavLink href="/subjects" isHome={isHome}>
                                    <Sparkles className="w-4 h-4" />
                                    Practice
                                </NavLink>
                                {userData?.role === 'admin' && (
                                    <NavLink href="/admin" isHome={isHome}>
                                        <Shield className="w-4 h-4" />
                                        Admin
                                    </NavLink>
                                )}
                                <div className={`flex items-center gap-4 pl-6 border-l ${isHome ? 'border-gray-200' : 'border-gray-700/50'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                            <User className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="hidden lg:block">
                                            <p className={`text-sm font-medium leading-tight ${isHome ? 'text-slate-900' : 'text-white'}`}>
                                                {userData?.name || 'User'}
                                            </p>
                                            <p className={`text-xs leading-tight ${isHome ? 'text-slate-500' : 'text-gray-400'}`}>
                                                {userData?.role === 'admin' ? 'Administrator' : 'Student'}
                                            </p>
                                        </div>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={async () => {
                                            await logout();
                                            router.push('/login');
                                        }}
                                        className="p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                                        title="Logout"
                                    >
                                        <LogOut className="w-5 h-5" />
                                    </motion.button>
                                </div>
                            </>
                        ) : (
                            <>
                                <NavLink href="/login" isHome={isHome}>Login</NavLink>
                                <Link href="/register">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all"
                                    >
                                        Get Started
                                    </motion.button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-3 rounded-xl bg-gray-800/50 text-gray-300"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </motion.button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`md:hidden border-t ${isHome ? 'glass-light border-gray-200/50' : 'glass border-gray-700/50'
                            }`}
                    >
                        <div className="px-4 py-6 space-y-3">
                            <MobileNavLink href="/textbooks" onClick={() => setMobileMenuOpen(false)} isHome={isHome}>
                                <BookOpen className="w-5 h-5" />
                                Textbooks
                            </MobileNavLink>
                            <MobileNavLink href="/exams" onClick={() => setMobileMenuOpen(false)} isHome={isHome}>
                                <FileText className="w-5 h-5" />
                                Exams
                            </MobileNavLink>

                            {user ? (
                                <>
                                    {/* User Info */}
                                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-800/50 mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                            <User className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">{userData?.name || 'User'}</p>
                                            <p className="text-sm text-gray-400">{user.email}</p>
                                        </div>
                                    </div>

                                    <MobileNavLink href="/subjects" onClick={() => setMobileMenuOpen(false)} isHome={isHome}>
                                        <Sparkles className="w-5 h-5" />
                                        Practice
                                    </MobileNavLink>
                                    {userData?.role === 'admin' && (
                                        <MobileNavLink href="/admin" onClick={() => setMobileMenuOpen(false)} isHome={isHome}>
                                            <Shield className="w-5 h-5" />
                                            Admin Dashboard
                                        </MobileNavLink>
                                    )}
                                    <motion.button
                                        whileTap={{ scale: 0.98 }}
                                        onClick={async () => {
                                            await logout();
                                            setMobileMenuOpen(false);
                                            router.push('/login');
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        Logout
                                    </motion.button>
                                </>
                            ) : (
                                <>
                                    <MobileNavLink href="/login" onClick={() => setMobileMenuOpen(false)} isHome={isHome}>
                                        Login
                                    </MobileNavLink>
                                    <Link
                                        href="/register"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block w-full text-center px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold"
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
}

function NavLink({ href, children, isHome }: { href: string; children: React.ReactNode; isHome?: boolean }) {
    return (
        <Link href={href}>
            <motion.span
                whileHover={{ scale: 1.05 }}
                className={`flex items-center gap-2 transition-colors font-semibold tracking-tight ${isHome ? 'text-slate-600 hover:text-slate-900' : 'text-gray-300 hover:text-white'
                    }`}
            >
                {children}
            </motion.span>
        </Link>
    );
}

function MobileNavLink({ href, onClick, children, isHome }: { href: string; onClick: () => void; children: React.ReactNode; isHome?: boolean }) {
    return (
        <Link href={href} onClick={onClick}>
            <motion.div
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isHome
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                    }`}
            >
                {children}
            </motion.div>
        </Link>
    );
}
