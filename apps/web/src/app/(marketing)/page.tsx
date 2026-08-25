'use client';

import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import {
  Wheat, Truck, Factory, ShoppingCart, Shield,
  ArrowRight, Star, ChevronDown, Zap, Globe,
  TrendingUp, CloudRain, Brain, Smartphone, Check,
  Users, BarChart2, MessageSquare, MapPin
} from 'lucide-react';
import { MarketplacePreview, TransportPreview, IndustryPreview, WeatherAIPreview } from '@/components/marketing/Previews';
import { FAQ } from '@/components/marketing/FAQ';

// ---- ANIMATED COUNTER ----
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setInView(true);
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ---- FLOATING LEAF ----
function FloatingLeaf({ delay, x, size }: { delay: number; x: number; size: number }) {
  return (
    <motion.div
      className="absolute pointer-events-none text-green-500/30"
      style={{ left: `${x}%`, fontSize: size }}
      initial={{ y: -50, opacity: 0, rotate: 0 }}
      animate={{
        y: typeof window !== 'undefined' ? window.innerHeight + 100 : 900,
        opacity: [0, 0.6, 0.6, 0],
        rotate: [0, 180, 360],
        x: [0, 30, -20, 40, 0],
      }}
      transition={{ duration: 10 + delay, delay, repeat: Infinity, ease: 'linear' }}
    >
      🍃
    </motion.div>
  );
}

const ROLES = [
  {
    key: 'farmer',
    icon: Wheat,
    label: 'Farmer',
    emoji: '🌾',
    color: 'from-green-600 to-emerald-500',
    shadow: 'shadow-green-500/30',
    description: 'Digitize your farm. List crops, get fair prices, access AI advice, book transport — all in one place.',
    features: ['Crop listing & management', 'AI disease detection', 'Weather intelligence', 'Government schemes', 'Direct buyer connect'],
    stats: '50,000+ Farmers',
  },
  {
    key: 'buyer',
    icon: ShoppingCart,
    label: 'Buyer',
    emoji: '🏪',
    color: 'from-blue-600 to-cyan-500',
    shadow: 'shadow-blue-500/30',
    description: 'Source directly from verified farmers. Browse fresh listings, negotiate, contract, and track delivery.',
    features: ['Browse crop marketplace', 'Real-time negotiation', 'Digital contracts', 'Nearby farmers map', 'AI recommendations'],
    stats: '12,000+ Buyers',
  },
  {
    key: 'transport',
    icon: Truck,
    label: 'Transport',
    emoji: '🚛',
    color: 'from-orange-600 to-amber-500',
    shadow: 'shadow-orange-500/30',
    description: 'Grow your fleet business. Accept bookings, track routes, calculate fares, and manage drivers seamlessly.',
    features: ['GPS live tracking', 'Route optimization', 'Fare calculator', 'Fleet management', 'Monthly earnings'],
    stats: '8,000+ Vehicles',
  },
  {
    key: 'industry',
    icon: Factory,
    label: 'Industry',
    emoji: '🏭',
    color: 'from-purple-600 to-violet-500',
    shadow: 'shadow-purple-500/30',
    description: 'Procure crop waste directly. Build a circular economy, reduce carbon footprint, track sustainability.',
    features: ['Waste marketplace', 'Quality inspection', 'Inventory tracking', 'Carbon metrics', 'Circular economy'],
    stats: '2,500+ Industries',
  },
  {
    key: 'admin',
    icon: Shield,
    label: 'Admin',
    emoji: '🛡️',
    color: 'from-red-600 to-rose-500',
    shadow: 'shadow-red-500/30',
    description: 'Mission control for the entire platform. Monitor, verify, and manage all operations in real-time.',
    features: ['Mission control', 'User verification', 'Platform analytics', 'Security center', 'Audit logs'],
    stats: 'Full Control',
  },
];

const FEATURES = [
  { icon: Brain, title: 'Gemini AI Assistant', desc: 'Smart crop recommendations, disease detection from photos, yield prediction, market intelligence.', color: 'text-purple-500' },
  { icon: CloudRain, title: 'Weather Intelligence', desc: '7-day forecasts, AgroMonitoring soil data, and weather-aware farming suggestions.', color: 'text-blue-500' },
  { icon: MapPin, title: 'Google Maps Integration', desc: 'Live GPS tracking, route optimization, nearby buyer/farmer discovery.', color: 'text-red-500' },
  { icon: MessageSquare, title: 'Real-time Chat', desc: 'Socket.IO powered instant messaging between all stakeholders.', color: 'text-green-500' },
  { icon: BarChart2, title: 'Advanced Analytics', desc: 'Role-specific dashboards with charts, reports, and business insights.', color: 'text-amber-500' },
  { icon: Smartphone, title: 'Mobile First', desc: 'Offline mode, PWA support, voice navigation, and camera-first workflows.', color: 'text-indigo-500' },
];

const TESTIMONIALS = [
  { name: 'Ramesh Patel', role: 'Wheat Farmer, MP', text: 'Sold my entire wheat harvest at 18% above MSP directly to a buyer in Pune. No middleman!', avatar: '👨‍🌾', rating: 5 },
  { name: 'Priya Sharma', role: 'Agri-Buyer, Mumbai', text: 'I source premium organic vegetables from 30+ verified farmers. Quality guaranteed with digital contracts.', avatar: '👩‍💼', rating: 5 },
  { name: 'Suresh Logistics', role: 'Transport Provider, Gujarat', text: 'My fleet utilization went from 60% to 95%. The booking system is fantastic.', avatar: '🚛', rating: 5 },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function LandingPage() {
  const [activeRole, setActiveRole] = useState(0);
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroY = useTransform(scrollY, [0, 400], [0, -100]);

  // Auto-rotate role cards
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveRole(r => (r + 1) % ROLES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#060a06] text-white overflow-x-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-amber-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-emerald-600/8 rounded-full blur-3xl" />
      </div>

      {/* Floating leaves */}
      {[1, 3, 6, 2, 7, 4].map((delay, i) => (
        <FloatingLeaf key={i} delay={delay * 2} x={10 + i * 15} size={16 + i * 4} />
      ))}

      {/* ==============================
          NAVBAR
      ============================== */}
      <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl border-b border-white/5 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Wheat className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-300">
              AgriAssist
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm text-white/60">
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <button className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors">
                Sign in
              </button>
            </Link>
            <Link href="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 text-white shadow-lg shadow-green-500/25"
              >
                Get Started
              </motion.button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ==============================
          HERO SECTION
      ============================== */}
      <motion.section
        style={{ opacity: heroOpacity, y: heroY }}
        className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-16 text-center"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium"
        >
          <Zap className="w-4 h-4" />
          <span>India's #1 Agricultural Digital Ecosystem</span>
        </motion.div>

        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-none mb-6 max-w-5xl"
        >
          From{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-emerald-400 to-lime-400">
            Seed to Sale
          </span>
          {' '}—{' '}
          <br className="hidden md:block" />
          Reimagined
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-lg md:text-xl text-white/60 mb-10 max-w-2xl leading-relaxed"
        >
          Connect farmers, buyers, transport providers, and industries on one intelligent platform.
          Powered by Gemini AI, real-time GPS, and digital contracts.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-4 mb-16"
        >
          <Link href="/register">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(22, 163, 74, 0.4)' }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold rounded-2xl bg-gradient-to-r from-green-600 to-emerald-500 text-white"
            >
              Start for Free
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
          <motion.a
            href="#how-it-works"
            whileHover={{ scale: 1.02 }}
            className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
          >
            See how it works
            <ChevronDown className="w-5 h-5" />
          </motion.a>
        </motion.div>

        {/* Hero Stats Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl"
        >
          {[
            { value: 50000, suffix: '+', label: 'Farmers' },
            { value: 200, suffix: 'Cr+', label: 'Trade Volume ₹' },
            { value: 8000, suffix: '+', label: 'Vehicles' },
            { value: 2500, suffix: '+', label: 'Industries' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              variants={item}
              className="px-4 py-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm text-center"
            >
              <div className="text-2xl md:text-3xl font-black text-white">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-sm text-white/50 mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 text-white/30"
        >
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </motion.section>

      {/* ==============================
          ROLE SHOWCASE
      ============================== */}
      <section className="py-24 px-4" id="how-it-works">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-sm mb-6">
              <Users className="w-4 h-4" />
              Five Powerful Roles
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              One Platform,{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-300">
                Endless Possibilities
              </span>
            </h2>
            <p className="text-lg text-white/50 max-w-2xl mx-auto">
              Every stakeholder in the agricultural chain gets a tailored experience designed for their workflow.
            </p>
          </motion.div>

          {/* Role tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {ROLES.map((role, i) => (
              <motion.button
                key={role.key}
                onClick={() => setActiveRole(i)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  activeRole === i
                    ? `bg-gradient-to-r ${role.color} text-white shadow-lg ${role.shadow}`
                    : 'bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{role.emoji}</span>
                {role.label}
              </motion.button>
            ))}
          </div>

          {/* Active role detail */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeRole}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid md:grid-cols-2 gap-8 items-center"
            >
              {/* Left: info */}
              <div>
                <div className={`inline-flex items-center gap-3 mb-4 px-4 py-2 rounded-xl bg-gradient-to-r ${ROLES[activeRole].color} bg-opacity-20`}>
                  <span className="text-3xl">{ROLES[activeRole].emoji}</span>
                  <div>
                    <div className="font-black text-2xl">{ROLES[activeRole].label}</div>
                    <div className="text-sm text-white/70">{ROLES[activeRole].stats}</div>
                  </div>
                </div>
                <p className="text-lg text-white/70 mb-6 leading-relaxed">
                  {ROLES[activeRole].description}
                </p>
                <ul className="space-y-3">
                  {ROLES[activeRole].features.map((f, i) => (
                    <motion.li
                      key={f}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-center gap-3 text-white/80"
                    >
                      <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${ROLES[activeRole].color} flex items-center justify-center flex-shrink-0`}>
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      {f}
                    </motion.li>
                  ))}
                </ul>
                <Link href="/register">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className={`mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r ${ROLES[activeRole].color} text-white shadow-lg`}
                  >
                    Join as {ROLES[activeRole].label}
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </Link>
              </div>

              {/* Right: visual */}
              <div className={`relative rounded-3xl p-8 bg-gradient-to-br ${ROLES[activeRole].color} bg-opacity-5 border border-white/10 h-80 flex items-center justify-center overflow-hidden`}>
                {/* Animated emoji illustration */}
                <motion.div
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="text-[120px] opacity-80"
                >
                  {ROLES[activeRole].emoji}
                </motion.div>
                {/* Floating particles */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-white/20"
                    style={{ left: `${15 + i * 15}%`, top: `${20 + (i % 3) * 25}%` }}
                    animate={{ y: [-10, 10, -10], opacity: [0.2, 0.8, 0.2] }}
                    transition={{ duration: 2 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ==============================
          FEATURES GRID
      ============================== */}
      <section className="py-24 px-4 bg-white/2" id="features">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Enterprise-Grade{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-400">
                Features
              </span>
            </h2>
            <p className="text-lg text-white/50 max-w-2xl mx-auto">
              Built with the latest technology stack for reliability, performance, and scale.
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {FEATURES.map((feature) => (
              <motion.div
                key={feature.title}
                variants={item}
                whileHover={{ scale: 1.02, borderColor: 'rgba(255,255,255,0.2)' }}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm cursor-pointer transition-all duration-300"
              >
                <feature.icon className={`w-10 h-10 mb-4 ${feature.color}`} />
                <h3 className="text-lg font-bold mb-2 text-white">{feature.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ==============================
          ORDER FLOW
      ============================== */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Complete{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-300">
                Order Journey
              </span>
            </h2>
          </motion.div>

          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-500 via-blue-500 to-purple-500 opacity-30" />
            {[
              { step: '01', title: 'Farmer Creates Listing', icon: '🌾', color: 'bg-green-500/20 border-green-500/30' },
              { step: '02', title: 'Buyer Makes Offer', icon: '🏪', color: 'bg-blue-500/20 border-blue-500/30' },
              { step: '03', title: 'Negotiation & Accept', icon: '🤝', color: 'bg-cyan-500/20 border-cyan-500/30' },
              { step: '04', title: 'Digital Contract Signed', icon: '📄', color: 'bg-purple-500/20 border-purple-500/30' },
              { step: '05', title: 'Quality Inspection', icon: '✅', color: 'bg-amber-500/20 border-amber-500/30' },
              { step: '06', title: 'Transport Booked & GPS Tracked', icon: '🚛', color: 'bg-orange-500/20 border-orange-500/30' },
              { step: '07', title: 'Payment & Invoice', icon: '💰', color: 'bg-emerald-500/20 border-emerald-500/30' },
            ].map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative flex items-start gap-6 mb-6 pl-12"
              >
                <div className={`absolute left-0 w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold ${step.color}`}>
                  {step.step}
                </div>
                <div className={`flex-1 p-4 rounded-xl border ${step.color} backdrop-blur-sm flex items-center gap-4`}>
                  <span className="text-2xl">{step.icon}</span>
                  <span className="font-semibold text-white/90">{step.title}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==============================
          TESTIMONIALS
      ============================== */}
      <section className="py-24 px-4 bg-white/2">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-black text-center mb-12"
          >
            Trusted by{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-300">
              Real Users
            </span>
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ y: -8, borderColor: 'rgba(255,255,255,0.2)' }}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm transition-all duration-300"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, s) => (
                    <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-white/70 text-sm leading-relaxed mb-6 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-white">{t.name}</div>
                    <div className="text-xs text-white/50">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==============================
          PREVIEWS & FAQ
      ============================== */}
      <MarketplacePreview />
      <TransportPreview />
      <IndustryPreview />
      <WeatherAIPreview />
      <FAQ />

      {/* ==============================
          CTA
      ============================== */}
      <section className="py-24 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center rounded-3xl bg-gradient-to-br from-green-900/50 to-emerald-900/30 border border-green-500/20 p-16 backdrop-blur-sm relative overflow-hidden"
        >
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-emerald-600/10 pointer-events-none" />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute inset-0 bg-green-500/5 rounded-3xl"
          />

          <div className="relative z-10">
            <div className="text-5xl mb-6">🌾</div>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Ready to Transform{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-300">
                Indian Agriculture?
              </span>
            </h2>
            <p className="text-lg text-white/60 mb-10 max-w-xl mx-auto">
              Join 50,000+ farmers, buyers, transporters, and industries already on AgriAssist.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 20px 50px rgba(22, 163, 74, 0.5)' }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-10 py-4 text-lg font-bold rounded-2xl bg-gradient-to-r from-green-600 to-emerald-500 text-white"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
              <Link href="/contact">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  className="inline-flex items-center gap-2 px-10 py-4 text-lg font-bold rounded-2xl bg-white/5 border border-white/20 text-white hover:bg-white/10 transition-colors"
                >
                  Contact Sales
                  <Globe className="w-5 h-5" />
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ==============================
          FOOTER
      ============================== */}
      <footer className="border-t border-white/5 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <Wheat className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">AgriAssist</span>
              </div>
              <p className="text-sm text-white/40 max-w-xs leading-relaxed">
                India's premier agricultural digital ecosystem. Empowering every stakeholder from farm to industry.
              </p>
            </div>

            {[
              { title: 'Platform', links: ['Farmer', 'Buyer', 'Transport', 'Industry', 'Admin'] },
              { title: 'Features', links: ['AI Assistant', 'Marketplace', 'GPS Tracking', 'Weather', 'Schemes'] },
              { title: 'Company', links: ['About', 'Contact', 'Privacy', 'Terms', 'Blog'] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-sm font-semibold text-white mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <Link href="#" className="text-sm text-white/40 hover:text-white transition-colors">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/30">
            <span>© 2026 AgriAssist. All rights reserved.</span>
            <span>Made with 💚 for Indian Farmers</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
