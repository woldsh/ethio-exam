'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import {
    GraduationCap, BookOpen, Brain,
    Zap, ArrowRight, Sparkles,
    Atom, Users, Landmark, Globe
} from 'lucide-react';
import Link from 'next/link';
import { useRef, useState } from 'react';
import Footer from '@/components/Footer';



export default function ExamsPortal() {
    const portalRef = useRef<HTMLDivElement>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!portalRef.current) return;
        const rect = portalRef.current.getBoundingClientRect();
        setMousePos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    };

    return (
        <div
            ref={portalRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className="min-h-screen aurora-bg text-white relative overflow-hidden selection:bg-blue-500/30 font-sans"
        >
            <Navbar />

            {/* Interactive Dynamic Background */}
            <AnimatePresence>
                {isHovering && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.15 }}
                        exit={{ opacity: 0 }}
                        className="pointer-events-none fixed inset-0 z-0"
                        style={{
                            background: `radial-gradient(circle 600px at ${mousePos.x}px ${mousePos.y}px, rgba(59, 130, 246, 0.3), transparent 80%)`
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Parallax Particles Decor */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <motion.div
                    animate={{
                        y: [0, -20, 0],
                        rotate: [0, 5, 0]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[10%] right-[15%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{
                        y: [0, 20, 0],
                        rotate: [0, -5, 0]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-[15%] left-[10%] w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[120px]"
                />
                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
            </div>

            <main className="relative z-10 pt-40 pb-32 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header Section */}
                    <div className="text-center mb-24">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full ultra-glass shimmer text-blue-400 mb-12 border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.15)]"
                        >
                            <Sparkles className="w-4 h-4 animate-pulse" />
                            <span className="text-xs font-black uppercase tracking-[0.3em]">Advanced Academic Portals</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-6xl md:text-8xl lg:text-9xl font-black mb-10 leading-[0.85] tracking-tighter"
                        >
                            Elevate Your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 glow-text p-2">
                                Exam Mastery.
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-gray-400/80 max-w-3xl mx-auto text-xl md:text-2xl leading-relaxed font-medium"
                        >
                            The most advanced entrance exam preparation environment in Ethiopia.
                            Experience AI-driven precision and cross-subject logic engines.
                        </motion.p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 items-stretch">
                        {/* Featured: Freshman Portal */}
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <ExamCard
                                type="hero"
                                href="/subjects?section=freshman"
                                icon={<GraduationCap className="w-12 h-12" />}
                                title="Freshman Excellence"
                                desc="Dominate common first-year university courses with precision practice and instant AI logic."
                                items={['Logic & Critical Thinking', 'General Physics 1011', 'Social Science Math', 'Communicative English']}
                                color="blue"
                                gradient="from-blue-600 to-indigo-700"
                            />
                        </motion.div>

                        {/* Natural Science */}
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <ExamCard
                                type="hero"
                                href="/subjects?section=natural"
                                icon={<Atom className="w-12 h-12" />}
                                title="Natural Science"
                                desc="Master complex STEM subjects with deep conceptual explanations and exam-focused simulations."
                                items={['General Physics', 'Chemistry Prep', 'Biological Sciences', 'Advanced Mathematics']}
                                color="emerald"
                                gradient="from-emerald-500 to-teal-600"
                            />
                        </motion.div>

                        {/* Social Science */}
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <ExamCard
                                type="hero"
                                href="/subjects?section=social"
                                icon={<Globe className="w-12 h-12" />}
                                title="Social Science"
                                desc="Conquer history, geography, and economics with structured analysis and pattern recognition."
                                items={['World History', 'Economic Principles', 'Human Geography', 'Political Science']}
                                color="amber"
                                gradient="from-amber-500 to-orange-600"
                            />
                        </motion.div>
                    </div>

                    {/* Dynamic Info Banner (Full Width) */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="mt-16 ultra-glass rounded-[3rem] p-10 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-8 bg-gradient-to-r from-blue-500/10 via-purple-500/5 to-transparent shadow-2xl relative overflow-hidden group"
                    >
                        <div className="flex items-center gap-8 relative z-10">
                            <div className="w-20 h-20 shrink-0 rounded-[1.5rem] bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-[0_15px_40px_rgba(245,158,11,0.4)]">
                                <Zap className="w-10 h-10 text-black fill-current animate-pulse" />
                            </div>
                            <div>
                                <h4 className="font-black text-white text-3xl">2024 Reformed Engine.</h4>
                                <p className="text-gray-400 font-bold mt-2 uppercase tracking-[0.3em] text-xs">Updated Real-time Curriculum Content • AI Logic 4.0</p>
                            </div>
                        </div>
                        <div className="relative z-10">
                            <div className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black hover:bg-white hover:text-black transition-all cursor-pointer">
                                View Build Notes
                            </div>
                        </div>
                        <div className="absolute right-[-20px] top-[-20px] w-48 h-48 bg-amber-400/5 rounded-full blur-[100px]" />
                    </motion.div>
                </div>
            </main>
            <Footer />
        </div>
    );
}


// --- Helper Components ---

function ExamCard({ href, icon, title, desc, items, gradient, color }: any) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [rotate, setRotate] = useState({ x: 0, y: 0 });
    const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
    const [isHovered, setIsHovered] = useState(false);

    const colorMap: any = {
        blue: {
            border: 'hover:border-blue-400/50',
            bg: 'from-blue-900/20 to-indigo-900/20',
            iconShadow: 'shadow-[0_20px_60px_rgba(59,130,246,0.4)]',
            text: 'text-blue-400',
            textMuted: 'text-blue-100/60',
            itemBg: 'bg-blue-400',
            itemShadow: 'shadow-[0_0_15px_rgba(59,130,246,0.8)]',
            decor: 'bg-blue-600/10',
            glare: 'rgba(59, 130, 246, 0.4)'
        },
        emerald: {
            border: 'hover:border-emerald-400/50',
            bg: 'from-emerald-900/20 to-teal-900/20',
            iconShadow: 'shadow-[0_20px_60px_rgba(16,185,129,0.4)]',
            text: 'text-emerald-400',
            textMuted: 'text-emerald-100/60',
            itemBg: 'bg-emerald-400',
            itemShadow: 'shadow-[0_0_15px_rgba(16,185,129,0.8)]',
            decor: 'bg-emerald-600/10',
            glare: 'rgba(16, 185, 129, 0.4)'
        },
        amber: {
            border: 'hover:border-amber-400/50',
            bg: 'from-amber-900/20 to-orange-900/20',
            iconShadow: 'shadow-[0_20px_60px_rgba(245,158,11,0.4)]',
            text: 'text-amber-400',
            textMuted: 'text-amber-100/60',
            itemBg: 'bg-amber-400',
            itemShadow: 'shadow-[0_0_15px_rgba(245,158,11,0.8)]',
            decor: 'bg-amber-600/10',
            glare: 'rgba(245, 158, 11, 0.4)'
        }
    };

    const theme = colorMap[color] || colorMap.blue;

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();

        // Tilt Logic
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        setRotate({ x: y * 20, y: -x * 20 });

        // Glare Logic
        const glareX = ((e.clientX - rect.left) / rect.width) * 100;
        const glareY = ((e.clientY - rect.top) / rect.height) * 100;
        setGlarePos({ x: glareX, y: glareY });
    };

    return (
        <Link href={href} className="block h-full group perspective-2000">
            <motion.div
                ref={cardRef}
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => {
                    setRotate({ x: 0, y: 0 });
                    setIsHovered(false);
                }}
                animate={{
                    rotateX: rotate.x,
                    rotateY: rotate.y,
                    scale: isHovered ? 1.02 : 1
                }}
                transition={{ type: "spring", stiffness: 150, damping: 15 }}
                style={{ transformStyle: 'preserve-3d' }}
                className={`ultra-glass relative h-full rounded-[4rem] p-12 border border-white/10 overflow-hidden flex flex-col justify-between transition-all duration-300 ${theme.border} hover:shadow-[0_50px_120px_rgba(0,0,0,0.6)] bg-gradient-to-br ${theme.bg}`}
            >
                {/* Dynamic Glare Effect */}
                <div
                    className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-30"
                    style={{
                        opacity: isHovered ? 1 : 0,
                        background: `radial-gradient(circle 400px at ${glarePos.x}% ${glarePos.y}%, ${theme.glare}, transparent 80%)`
                    }}
                />

                <div className="relative z-10" style={{ transform: 'translateZ(60px)', transformStyle: 'preserve-3d' }}>
                    {/* Floating Icon */}
                    <motion.div
                        className={`w-28 h-28 rounded-[2.5rem] bg-gradient-to-br ${gradient} flex items-center justify-center text-white mb-12 ${theme.iconShadow} transition-all duration-500`}
                        style={{ transform: 'translateZ(100px)' }}
                    >
                        {icon}
                    </motion.div>

                    {/* Floating Text */}
                    <div style={{ transform: 'translateZ(80px)' }}>
                        <h2 className="text-5xl lg:text-6xl font-black mb-8 text-white tracking-tighter leading-tight drop-shadow-2xl">
                            {title.split(' ').map((word: string, i: number) => (
                                <span key={i} className="inline-block mr-3">{word}</span>
                            ))}
                        </h2>

                        <p className={`${theme.textMuted} mb-12 text-xl leading-relaxed font-medium max-w-md`}>
                            {desc}
                        </p>
                    </div>

                    {/* Parallax List */}
                    <div className="grid gap-5" style={{ transform: 'translateZ(40px)' }}>
                        {items.map((text: string, i: number) => (
                            <motion.div
                                key={i}
                                whileHover={{ x: 10, scale: 1.05 }}
                                className="flex items-center gap-5 text-base font-bold text-white bg-white/5 py-4 px-6 rounded-[1.5rem] border border-white/5 backdrop-blur-xl group-hover:bg-white/10 transition-all shadow-lg"
                            >
                                <div className={`w-3 h-3 rounded-full ${theme.itemBg} ${theme.itemShadow} animate-pulse`} />
                                {text}
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Floating Button */}
                <div
                    className={`relative z-10 mt-16 flex items-center gap-5 ${theme.text} font-black text-2xl group-hover:translate-x-6 transition-all duration-500 uppercase tracking-[0.2em]`}
                    style={{ transform: 'translateZ(90px)' }}
                >
                    Unlock Portal <ArrowRight className="w-8 h-8 group-hover:translate-x-3 transition-transform" />
                </div>

                {/* Volumetric Background Decor */}
                <div className={`absolute right-[-15%] top-[-15%] w-[600px] h-[600px] ${theme.decor} rounded-full blur-[140px] pointer-events-none z-0`} style={{ transform: 'translateZ(-20px)' }} />
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none mask-radial z-0" style={{ backgroundImage: 'linear-gradient(45deg, #fff 1px, transparent 1px), linear-gradient(-45deg, #fff 1px, transparent 1px)', backgroundSize: '50px 50px', transform: 'translateZ(-10px)' }} />
            </motion.div>
        </Link>
    );
}

