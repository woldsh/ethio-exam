'use client';

import { motion, useScroll, useTransform, AnimatePresence, useInView } from 'framer-motion';
import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';

import {
  BookOpen, Sparkles, Target, Brain, ArrowRight,
  GraduationCap, Atom, Globe, Zap, Star, Trophy,
  ChevronRight, Play, Users, Award, TrendingUp,
  CheckCircle2, MousePointer2, Smartphone, Quote
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';


// --- Components ---

function PortalCard({ portal, index }: { portal: any, index: number }) {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setRotate({ x: y * 15, y: -x * 15 });
  };

  return (
    <Link href={portal.href} className="group block perspective-1000">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setRotate({ x: 0, y: 0 })}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.15 }}
        style={{
          rotateX: rotate.x,
          rotateY: rotate.y,
          transformStyle: 'preserve-3d',
        }}
        className="relative h-[480px] rounded-[3rem] ultra-glass p-12 flex flex-col justify-between overflow-hidden transition-all duration-500 border border-white/5 hover:border-white/20 group-hover:shadow-2xl"
      >
        {/* Glow Effect */}
        <div className={`absolute inset-0 bg-gradient-to-br ${portal.gradient} opacity-0 group-hover:opacity-[0.12] transition-opacity duration-500`} />

        <div className="relative z-10 translate-z-20">
          <div className={`w-24 h-24 rounded-[2rem] bg-gradient-to-br ${portal.gradient} flex items-center justify-center mb-10 shadow-2xl ${portal.shadow} group-hover:scale-110 group-hover:rotate-6 transition-all duration-700`}>
            <portal.icon className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-4xl font-black text-white mb-4 tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/60 transition-all">
            {portal.title}
          </h3>
          <p className="text-white/50 text-lg font-medium leading-relaxed">{portal.desc}</p>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-white/70 font-bold group-hover:text-white transition-colors text-lg uppercase tracking-widest translate-z-10">
          Enter Portal
          <ArrowRight className="w-6 h-6 group-hover:translate-x-3 transition-transform duration-500" />
        </div>

        {/* Decorative corner element */}
        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      </motion.div>
    </Link>
  );
}

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setRotate({ x: y * 10, y: -x * 10 });
  };

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div className="min-h-screen aurora-bg particles overflow-x-hidden selection:bg-purple-500/30">
      <Navbar />

      {/* Ultra Premium Hero Section */}
      <section
        ref={heroRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setRotate({ x: 0, y: 0 })}
        className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden perspective-1000"
      >
        {/* Pointer Glow Effect */}
        <motion.div
          className="absolute pointer-events-none w-[600px] h-[600px] rounded-full blur-[120px] opacity-10 z-0 bg-violet-600"
          animate={{
            x: rotate.y * 20,
            y: -rotate.x * 20,
          }}
          transition={{ type: 'spring', damping: 30, stiffness: 50 }}
        />

        <motion.div
          style={{
            y: heroY,
            opacity: heroOpacity,
            rotateX: rotate.x,
            rotateY: rotate.y,
            transformStyle: 'preserve-3d'
          }}
          className="relative z-10 max-w-6xl mx-auto text-center"
        >
          {/* Floating Badge */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full ultra-glass shimmer mb-10"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm font-bold text-white/80 tracking-widest uppercase">Ethiopia's #1 AI Education Platform</span>
            <ChevronRight className="w-4 h-4 text-white/60" />
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-6xl sm:text-7xl lg:text-9xl font-black mb-8 leading-[0.9] tracking-tight"
          >
            <span className="text-white">Master Your</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 glow-text p-2">
              Destiny.
            </span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-xl sm:text-2xl text-white/60 mb-14 max-w-2xl mx-auto leading-relaxed font-medium"
          >
            The most advanced AI tutor for Ethiopian National Exams.
            <span className="text-white/90"> Instant explanations. Personalized practice. Proven results.</span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-5 justify-center items-center"
          >
            <Link href="/register">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="group relative px-10 py-5 rounded-2xl font-black text-lg text-white overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 transition-all duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.2)_0%,_transparent_50%)]" />
                <span className="relative flex items-center gap-3">
                  Start Learning Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.button>
            </Link>
            <Link href="/exams">
              <motion.button
                whileHover={{ scale: 1.03, borderColor: 'rgba(255,255,255,0.3)' }}
                whileTap={{ scale: 0.98 }}
                className="px-10 py-5 rounded-2xl font-bold text-lg text-white/90 border border-white/10 backdrop-blur-md transition-all flex items-center gap-3 hover:bg-white/5"
              >
                <Play className="w-5 h-5" />
                Explore Exams
              </motion.button>
            </Link>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-20 flex flex-col sm:flex-row items-center justify-center gap-10 text-white/40"
          >
            <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                {['K', 'A', 'M'].map((letter, i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 border border-white/10 flex items-center justify-center text-white/80 font-bold text-sm">
                    {letter}
                  </div>
                ))}
              </div>
              <span className="text-sm font-medium">Joined by <span className="text-white font-bold">10,000+</span> students</span>
            </div>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
              <span className="text-sm font-medium ml-2">4.9/5 average rating</span>
            </div>
          </motion.div>
        </motion.div>


        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2"
          >
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-white/60"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Animated Stats Section */}
      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { value: 50, suffix: 'K+', label: 'Questions', icon: Target, color: 'text-violet-400' },
              { value: 98, suffix: '%', label: 'Pass Rate', icon: Trophy, color: 'text-emerald-400' },
              { value: 24, suffix: '/7', label: 'AI Support', icon: Zap, color: 'text-amber-400' },
              { value: 100, suffix: '+', label: 'Textbooks', icon: BookOpen, color: 'text-blue-400' },
            ].map((stat, i) => (
              <StatItem key={i} stat={stat} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Hero Portals Section (Already Refactored Above) */}

      {/* Sticky Features Section */}
      <section className="py-40 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-24 items-start">
            {/* Left: Sticky Image Container */}
            <div className="lg:sticky lg:top-40 relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="absolute -inset-12 bg-gradient-to-r from-violet-500/30 via-fuchsia-500/20 to-transparent rounded-[5rem] blur-[100px]" />
                <div className="relative ultra-glass rounded-[3rem] p-4 overflow-hidden border border-white/10 group">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.6 }}
                    className="overflow-hidden rounded-[2.5rem]"
                  >
                    <img
                      src="/hero_ai_learning_ethiopiaoky_1769812630519.png"
                      alt="AI Learning Platform"
                      className="w-full h-auto transition-transform duration-700 group-hover:scale-110"
                    />
                  </motion.div>

                  {/* Floating Micro-Cards */}
                  <motion.div
                    animate={{ y: [0, -20, 0], rotate: [0, 2, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -right-8 top-1/4 p-6 ultra-glass rounded-3xl flex items-center gap-5 border border-white/20 shadow-2xl"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                      <Brain className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <div className="text-[0.6rem] text-emerald-400 font-black uppercase tracking-widest mb-1">Live AI Engine</div>
                      <div className="text-white font-black text-lg">Logic Solved</div>
                    </div>
                  </motion.div>

                  <motion.div
                    animate={{ y: [0, 20, 0], rotate: [0, -2, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute -left-8 bottom-1/4 p-6 ultra-glass rounded-3xl flex items-center gap-5 border border-white/20 shadow-2xl"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                      <TrendingUp className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <div className="text-[0.6rem] text-violet-400 font-black uppercase tracking-widest mb-1">User Analytics</div>
                      <div className="text-white font-black text-lg">+42% Mastery</div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Right: Scrolling Feature Details */}
            <div className="space-y-32 py-20 lg:py-40">
              {[
                {
                  icon: Brain,
                  title: 'Cognitive AI Explanations',
                  desc: 'Our neural models don\'t just give answers; they explain the "why silicon" behind every concept, tailored to the Ethiopian curriculum.',
                  badges: ['Step-by-Step', 'Context Aware']
                },
                {
                  icon: Target,
                  title: 'Adaptive Learning Mesh',
                  desc: 'The platform identifies your cognitive gaps in real-time, redirecting your focus to the topics that will boost your GPA the most.',
                  badges: ['Real-time', 'Personalized']
                },
                {
                  icon: BookOpen,
                  title: 'The Digital Library',
                  desc: 'Every new curriculum textbook and a decade of national exam history, instantly searchable and cross-referenced with AI.',
                  badges: ['Instant Search', 'Complete']
                },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="group"
                >
                  <div className="flex gap-8">
                    <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-violet-500/10 group-hover:border-violet-500/30 transition-all duration-500">
                      <feature.icon className="w-8 h-8 text-white group-hover:text-violet-400 transition-colors" />
                    </div>
                    <div className="space-y-6">
                      <div className="flex flex-wrap gap-2">
                        {feature.badges.map((badge, bi) => (
                          <span key={bi} className="px-3 py-1 rounded-full bg-white/5 text-[0.65rem] font-bold text-white/40 uppercase tracking-widest border border-white/5">
                            {badge}
                          </span>
                        ))}
                      </div>
                      <h3 className="text-4xl font-black text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-violet-400 transition-all">
                        {feature.title}
                      </h3>
                      <p className="text-white/50 text-xl leading-relaxed font-medium">
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Infinite Testimonial Marquee */}
      <section className="py-40 bg-white/[0.02] border-y border-white/5 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto px-4 mb-20 text-center"
        >
          <h2 className="text-4xl sm:text-6xl font-black text-white mb-6">Built for Excellence.</h2>
          <p className="text-white/40 text-xl font-medium uppercase tracking-[0.3em]">Loved by Students</p>
        </motion.div>

        <div className="flex gap-8 relative overflow-hidden group">
          <motion.div
            animate={{ x: [0, -1920] }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="flex gap-8 whitespace-nowrap"
          >
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <TestimonialCard key={i} index={i} />
            ))}
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <TestimonialCard key={`dup-${i}`} index={i} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* Advanced Call to Action */}
      <section className="py-60 px-4 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto"
        >
          <div className="relative rounded-[4rem] overflow-hidden p-20 text-center border border-white/10 bg-[#020617]">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-transparent to-cyan-500/10 pointer-events-none" />

            {/* Animated Grid Background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            <div className="relative z-10">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                className="mb-10"
              >
                <div className="w-20 h-20 rounded-full bg-violet-500/20 mx-auto flex items-center justify-center mb-8 border border-violet-500/30">
                  <Star className="w-10 h-10 text-violet-400 fill-violet-400" />
                </div>
                <h2 className="text-6xl sm:text-8xl font-black text-white mb-8 tracking-tighter">Ready to Excel?</h2>
                <p className="text-white/50 text-2xl mb-16 max-w-2xl mx-auto font-medium">Join 25,000+ students and experience the future of education in Ethiopia.</p>
              </motion.div>

              <Link href="/register">
                <motion.button
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative group px-16 py-7 rounded-[2.5rem] bg-white text-[#020617] font-black text-2xl shadow-[0_30px_60px_rgba(255,255,255,0.1)] overflow-hidden transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-200 via-white to-cyan-100 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative flex items-center gap-4">
                    Get Started Now
                    <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
                  </span>
                </motion.button>
              </Link>

              <div className="mt-16 flex items-center justify-center gap-12 grayscale opacity-40">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm font-bold uppercase tracking-widest text-white">No Credit Card</span>
                </div>
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5" />
                  <span className="text-sm font-bold uppercase tracking-widest text-white">Mobile Ready</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Advanced Footer */}
      <Footer />
    </div>
  );
}

// --- Helper Components ---

function StatItem({ stat, index }: { stat: any, index: number }) {
  const [count, setCount] = useState(0);
  const isInView = useInView(useRef(null), { once: true });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = stat.value;
      const duration = 2000;
      const increment = end / (duration / 16);

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }
  }, [isInView, stat.value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="text-center group"
    >
      <div className="mb-6 relative inline-block">
        <div className={`absolute -inset-4 bg-violet-500/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
        <stat.icon className={`w-8 h-8 mx-auto ${stat.color} relative z-10 transition-transform duration-500 group-hover:scale-110`} />
      </div>
      <div className="text-5xl font-black text-white mb-2 tracking-tighter">
        {count}{stat.suffix}
      </div>
      <div className="text-white/40 font-black text-xs uppercase tracking-[0.2em]">{stat.label}</div>
    </motion.div>
  );
}

function TestimonialCard({ index }: { index: number }) {
  const Names = ["Abebe B.", "Tigist M.", "Dawit K.", "Selam T.", "Elias W.", "Mekdes A."];
  const Universities = ["AAU Medicine", "AstU Engineering", "Jimma Health", "Gondar ICT", "Bahr Dar Law", "Haramaya Agri"];

  return (
    <div className="w-[450px] shrink-0 ultra-glass p-8 rounded-[2.5rem] border border-white/5 hover:border-white/20 transition-all duration-500 group">
      <div className="flex gap-2 mb-6">
        {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
      </div>
      <Quote className="w-10 h-10 text-violet-500/20 mb-4 group-hover:text-violet-500/40 transition-colors" />
      <p className="text-white/80 text-xl font-medium leading-relaxed mb-8 whitespace-normal">
        "EthioExam transformed my study routine. The AI feedback is so precise it's like having a personal tutor at 2 AM."
      </p>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white font-black text-lg">
          {Names[index % Names.length][0]}
        </div>
        <div>
          <div className="text-white font-black">{Names[index % Names.length]}</div>
          <div className="text-white/30 text-xs font-bold uppercase tracking-widest">{Universities[index % Universities.length]}</div>
        </div>
      </div>
    </div>
  );
}

