'use client';

import { useAuth } from '@/contexts/auth-context';
import { motion } from 'framer-motion';
import { ShieldOff, LogOut, Loader2, UserX } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function UserGuard({ children }: { children: React.ReactNode }) {
    const { user, userData, loading, logout } = useAuth();
    const pathname = usePathname();

    // Skip guard for auth pages to avoid recursion/blocking login
    const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/';

    if (loading) {
        return (
            <div className="min-h-screen premium-bg flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    // If user is authenticated but document is deactivated
    if (userData?.status === 'inactive') {
        return (
            <div className="min-h-screen premium-bg flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card max-w-md w-full p-8 text-center"
                >
                    <div className="w-20 h-20 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-6">
                        <ShieldOff className="w-10 h-10 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Account Deactivated</h1>
                    <p className="text-gray-400 mb-8">
                        Your account has been deactivated by an administrator. Please contact support if you believe this is a mistake.
                    </p>
                    <button
                        onClick={() => logout()}
                        className="flex items-center gap-2 px-6 py-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl font-medium transition-colors mx-auto"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </motion.div>
            </div>
        );
    }

    // If user is authenticated in Firebase but has NO document in Firestore (Deleted)
    // We only apply this if NOT on an auth page, to allow login/registration to work
    if (user && !userData && !isAuthPage) {
        return (
            <div className="min-h-screen premium-bg flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card max-w-md w-full p-8 text-center"
                >
                    <div className="w-20 h-20 rounded-2xl bg-orange-500/20 flex items-center justify-center mx-auto mb-6">
                        <UserX className="w-10 h-10 text-orange-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
                    <p className="text-gray-400 mb-8">
                        Your user record could not be found. It may have been deleted by an administrator.
                    </p>
                    <button
                        onClick={() => logout()}
                        className="flex items-center gap-2 px-6 py-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl font-medium transition-colors mx-auto"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </motion.div>
            </div>
        );
    }

    return <>{children}</>;
}
