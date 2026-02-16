'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
    Github, Twitter, Linkedin, Mail, ArrowUp, Send,
    Globe, Shield, Cpu, MessageSquare, GraduationCap,
    Sparkles, Zap, Facebook, Instagram
} from 'lucide-react';
import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';

export default function Footer() {
    const footerRef = useRef<HTMLDivElement>(null);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer ref={footerRef} className="relative pt-32 pb-12 overflow-hidden bg-[#02040a] border-t border-white/5">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-blue-600/10 via-purple-600/5 to-transparent blur-[120px]" />
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[150px]" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02]" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Main Footer Content */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-24">
                    <div className="col-span-2 lg:col-span-2 space-y-8">
                        <Link href="/" className="flex items-center gap-4 group">
                            <div className="w-16 h-16 rounded-[1.25rem] bg-gradient-to-br from-blue-600 to-fuchsia-600 flex items-center justify-center text-white font-black text-3xl shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                E
                            </div>
                            <div>
                                <span className="text-3xl font-black text-white tracking-tighter">EthioExam</span>
                                <p className="text-white/30 text-xs font-black uppercase tracking-[0.3em] mt-1">AI Logic 4.0</p>
                            </div>
                        </Link>
                        <p className="text-white/40 font-medium leading-relaxed max-w-sm text-lg">
                            Democratizing excellence through personalized AI education. The definitive destination for Ethiopia's future leaders.
                        </p>
                        <div className="flex gap-4">
                            {[
                                { icon: Twitter, href: '#' },
                                { icon: Github, href: '#' },
                                { icon: Linkedin, href: '#' },
                                { icon: Mail, href: '#' }
                            ].map((social, i) => (
                                <Link
                                    key={i}
                                    href={social.href}
                                    className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 hover:border-white/20 hover:scale-110 transition-all duration-300"
                                >
                                    <social.icon className="w-5 h-5" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-8">
                        <h4 className="text-white font-black uppercase tracking-widest text-sm">Portals</h4>
                        <ul className="space-y-4">
                            <li><FooterLink href="/exams">Entrance Exams</FooterLink></li>
                            <li><FooterLink href="/exams">Freshman Hub</FooterLink></li>
                            <li><FooterLink href="/textbooks">Digital Library</FooterLink></li>
                            <li><FooterLink href="/exams">Practice Engine</FooterLink></li>
                        </ul>
                    </div>

                    <div className="space-y-8">
                        <h4 className="text-white font-black uppercase tracking-widest text-sm">Company</h4>
                        <ul className="space-y-4">
                            <li><FooterLink href="/about">Our Vision</FooterLink></li>
                            <li><FooterLink href="/contact">Support</FooterLink></li>
                            <li><FooterLink href="/careers">Careers</FooterLink></li>
                            <li><FooterLink href="/privacy">Privacy Policy</FooterLink></li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <div className="ultra-glass p-6 rounded-3xl border border-white/5 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse" />
                                <span className="text-white/80 font-black text-xs uppercase tracking-widest">System Status</span>
                            </div>
                            <p className="text-white font-black text-xl">Operational</p>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    animate={{ x: [-100, 100] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="h-full w-24 bg-gradient-to-r from-transparent via-emerald-500 to-transparent"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex flex-wrap justify-center gap-8 text-[0.7rem] font-black text-white/20 uppercase tracking-[0.2em]">
                        <span>© 2026 EthioExam AI</span>
                        <span className="w-1 h-1 rounded-full bg-white/10 mt-1" />
                        <span>Built with precision in Addis Ababa</span>
                        <span className="w-1 h-1 rounded-full bg-white/10 mt-1" />
                        <span>EthioExam Inc.</span>
                    </div>

                    <motion.button
                        onClick={scrollToTop}
                        whileHover={{ scale: 1.1, y: -5 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white group hover:bg-white hover:text-black transition-all duration-500 shadow-2xl"
                    >
                        <ArrowUp className="w-6 h-6 group-hover:animate-bounce" />
                    </motion.button>
                </div>
            </div>
        </footer>
    );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className="text-white/30 hover:text-white text-lg font-medium transition-colors relative group w-fit block"
        >
            {children}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 group-hover:w-full transition-all duration-500" />
        </Link>
    );
}
