'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/auth-context';
import {
    BookOpen, LayoutDashboard, Shield, LogOut,
    Menu, Users, FileText, PlusCircle, X,
    Atom, Globe, GraduationCap
} from 'lucide-react';

interface Subject {
    id: string;
    name: string;
    icon?: string;
    color?: string;
}

export default function Sidebar() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [mobileOpen, setMobileOpen] = useState(false);

    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();
    const currentView = searchParams.get('view');
    const { userData, logout } = useAuth();

    const isAdminPage = pathname === '/admin';

    // Real-time subjects listener
    useEffect(() => {
        const q = query(collection(db, 'subjects'), orderBy('name'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const subjectsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Subject[];
            setSubjects(subjectsData);
        });

        return () => unsubscribe();
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [pathname, searchParams]);

    const toggleMobileSidebar = () => setMobileOpen(!mobileOpen);

    return (
        <>
            {/* Mobile Menu Button - Visible ONLY on Mobile (< md) */}
            <button
                onClick={toggleMobileSidebar}
                className="md:hidden fixed top-4 left-4 z-50 p-2.5 bg-gray-900/90 text-white rounded-lg backdrop-blur-md border border-gray-800 shadow-lg hover:bg-gray-800 transition-colors"
                aria-label="Toggle Menu"
            >
                <Menu className="w-5 h-5" />
            </button>

            {/* Mobile Backdrop */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setMobileOpen(false)}
                        className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar Container 
                - Mobile: Fixed, 280px width, slides in/out
                - Desktop (md+): Sticky, 80px width (icon only)
                - Wide (xl+): Sticky, 280px width (full)
            */}
            <aside
                className={`
                    fixed top-0 left-0 h-screen z-50
                    bg-[#0B1120] border-r border-gray-800 flex flex-col
                    transition-all duration-300 ease-in-out
                    
                    /* Mobile Transform */
                    ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
                    md:translate-x-0
                    
                    /* Desktop Adaptive Widths */
                    w-[280px] 
                    md:w-[80px] 
                    xl:w-[280px]
                `}
            >
                {/* Header */}
                <div className="h-20 flex items-center justify-between px-6 md:px-0 xl:px-6 border-b border-gray-800 md:justify-center xl:justify-start bg-[#0B1120] shrink-0">
                    <Link href="/" className="flex items-center gap-3 overflow-hidden">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-900/20">
                            <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <div className="block md:hidden xl:block truncate">
                            <h1 className="text-lg font-bold text-white tracking-tight leading-none">EthioExam</h1>
                            <p className="text-[10px] text-blue-400 font-bold tracking-wider">AI TUTOR</p>
                        </div>
                    </Link>
                    {/* Close button for mobile inside sidebar */}
                    <button
                        onClick={() => setMobileOpen(false)}
                        className="md:hidden p-1 text-gray-400 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-6 px-3 md:px-2 xl:px-4 custom-scrollbar">
                    <ul className="space-y-1">

                        {/* Menu Label - Hidden on Tablet */}
                        <div className="mb-6">
                            <p className="px-3 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 md:hidden xl:block">Menu</p>
                            {userData?.role === 'admin' && (
                                <NavItem
                                    href="/subjects"
                                    icon={<LayoutDashboard className="w-5 h-5" />}
                                    label="All Subjects"
                                    active={pathname === '/subjects' && !searchParams.get('section')}
                                />
                            )}
                            <NavItem
                                href="/subjects?section=natural"
                                icon={<Atom className="w-5 h-5" />}
                                label="Grade 12 Natural"
                                active={searchParams.get('section') === 'natural'}
                            />
                            <NavItem
                                href="/subjects?section=social"
                                icon={<Globe className="w-5 h-5" />}
                                label="Grade 12 Social"
                                active={searchParams.get('section') === 'social'}
                            />
                            <NavItem
                                href="/subjects?section=freshman"
                                icon={<GraduationCap className="w-5 h-5" />}
                                label="Freshman"
                                active={searchParams.get('section') === 'freshman'}
                            />
                        </div>

                        {/* Admin Section */}
                        {userData?.role === 'admin' && (
                            <div className="mb-6">
                                <div className="px-3 mb-2 flex items-center gap-2 md:justify-center xl:justify-start">
                                    <p className="text-xs font-bold text-blue-500/80 uppercase tracking-wider md:hidden xl:block">Admin</p>
                                    <div className="hidden md:block xl:hidden h-px w-8 bg-blue-500/20 my-2" />
                                </div>

                                <NavItem
                                    href="/admin?view=questions"
                                    icon={<FileText className="w-5 h-5" />}
                                    label="Questions Bank"
                                    active={isAdminPage && (currentView === 'questions' || !currentView)}
                                />
                                <NavItem
                                    href="/admin?view=subjects"
                                    icon={<BookOpen className="w-5 h-5" />}
                                    label="Subjects"
                                    active={isAdminPage && currentView === 'subjects'}
                                />
                                <NavItem
                                    href="/admin?view=users"
                                    icon={<Users className="w-5 h-5" />}
                                    label="User Management"
                                    active={isAdminPage && currentView === 'users'}
                                />
                                <NavItem
                                    href="/admin?view=textbooks"
                                    icon={<FileText className="w-5 h-5" />}
                                    label="Manage Textbooks"
                                    active={isAdminPage && currentView === 'textbooks'}
                                />
                            </div>
                        )}

                        {/* Subjects Section - Admin Only */}
                        {userData?.role === 'admin' && (
                            <div>
                                <div className="flex items-center justify-between px-3 mb-2 md:justify-center xl:justify-between">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider md:hidden xl:block">Subjects</p>
                                    <Link href="/admin?view=subjects" className="text-blue-400 hover:text-blue-300 md:hidden xl:block" title="Add Subject">
                                        <PlusCircle className="w-4 h-4" />
                                    </Link>
                                    <div className="hidden md:block xl:hidden h-px w-8 bg-gray-800 my-2" />
                                </div>

                                {subjects.map((subject) => (
                                    <NavItem
                                        key={subject.id}
                                        href={`/exam/${subject.id}`}
                                        icon={<BookOpen className="w-5 h-5" />}
                                        label={subject.name}
                                        active={pathname === `/exam/${subject.id}`}
                                        color={subject.color}
                                    />
                                ))}
                            </div>
                        )}
                    </ul>
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-gray-800 bg-[#0B1120]">
                    <div className="flex items-center gap-3 p-2 rounded-xl bg-gray-800/50 border border-gray-700/50 mb-2 md:justify-center xl:justify-start md:p-0 md:w-10 md:h-10 md:bg-transparent md:border-0 xl:w-auto xl:h-auto xl:p-2 xl:bg-gray-800/50 xl:border-gray-700/50">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold shrink-0 shadow-md text-xs">
                            {userData?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="overflow-hidden md:hidden xl:block">
                            <p className="text-sm font-medium text-white truncate max-w-[120px]">{userData?.name}</p>
                            <p className="text-[10px] text-gray-400 truncate capitalize">{userData?.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={async () => {
                            await logout();
                            router.push('/login');
                        }}
                        className="flex items-center gap-3 w-full p-2.5 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors md:justify-center xl:justify-start"
                        title="Sign Out"
                    >
                        <LogOut className="w-5 h-5 shrink-0" />
                        <span className="text-sm font-medium md:hidden xl:block">Sign Out</span>
                    </button>
                </div>
            </aside>
        </>
    );
}

function NavItem({ href, icon, label, active, color }: {
    href: string;
    icon: React.ReactNode;
    label: string;
    active: boolean;
    color?: string;
}) {
    const activeStyle = active
        ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20 shadow-sm'
        : 'text-gray-400 hover:text-white hover:bg-gray-800/50 border border-transparent';

    return (
        <li>
            <Link href={href} title={label} className="block">
                <div className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 
                    ${activeStyle}
                    md:justify-center xl:justify-start
                `}>
                    <span className={`shrink-0 ${active ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'}`}>
                        {icon}
                    </span>

                    <span className="font-medium truncate text-sm md:hidden xl:block">
                        {label}
                    </span>

                    {/* Active Indicator */}
                    {active && (
                        <div className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full md:hidden xl:block" />
                    )}
                </div>
            </Link>
        </li>
    );
}
