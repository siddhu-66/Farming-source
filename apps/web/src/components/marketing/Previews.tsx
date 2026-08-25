'use client';

import { motion } from 'framer-motion';
import { ArrowRight, CloudRain, Brain, MapPin, Truck, Factory, Shield, Heart } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

// Common Animations
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export function MarketplacePreview() {
  const [crops] = useState([
    { id: 1, name: 'Premium Wheat (Lokwan)', price: '₹2,400/Qtl', farmer: 'Ramesh P.', location: 'Punjab', match: 98 },
    { id: 2, name: 'Organic Basmati Rice', price: '₹4,100/Qtl', farmer: 'Sunil M.', location: 'Haryana', match: 95 },
    { id: 3, name: 'Fresh Tomatoes', price: '₹1,200/Qtl', farmer: 'Kisan FPO', location: 'Maharashtra', match: 92 },
  ]);

  return (
    <section className="py-24 px-4 bg-[#080d08]" id="marketplace">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl font-black mb-4">
              Live <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-300">Marketplace</span>
            </h2>
            <p className="text-white/50 max-w-xl">
              Access real-time crop listings, negotiate directly with verified farmers, and secure deals with digital contracts.
            </p>
          </motion.div>
          <Link href="/login">
            <motion.button whileHover={{ scale: 1.05 }} className="hidden md:inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-all">
              View Marketplace <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
        </div>

        <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid md:grid-cols-3 gap-6">
          {crops.map((crop) => (
            <motion.div key={crop.id} variants={item} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-green-500/50 transition-colors group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-xl">🌾</div>
                <div className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold">{crop.match}% Match</div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{crop.name}</h3>
              <div className="text-2xl font-black text-green-400 mb-4">{crop.price}</div>
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-white/60"><Shield className="w-4 h-4" /> Verified Farmer: {crop.farmer}</div>
                <div className="flex items-center gap-2 text-sm text-white/60"><MapPin className="w-4 h-4" /> {crop.location}</div>
              </div>
              <button className="w-full py-3 rounded-xl bg-white/5 group-hover:bg-green-500 group-hover:text-white text-white/70 font-semibold transition-all">
                Make Offer
              </button>
            </motion.div>
          ))}
        </motion.div>
        <Link href="/login" className="md:hidden mt-8 block">
          <button className="w-full py-4 rounded-xl bg-white/10 text-white font-medium">View Marketplace</button>
        </Link>
      </div>
    </section>
  );
}

export function TransportPreview() {
  return (
    <section className="py-24 px-4 bg-black" id="transport">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm mb-6">
            <Truck className="w-4 h-4" /> Integrated Logistics
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            Book Transport <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-300">Instantly</span>
          </h2>
          <p className="text-lg text-white/60 mb-8">
            Don't worry about logistics. AgriAssist matches you with nearby verified transporters, provides live GPS tracking, and calculates fair fares based on distance and load.
          </p>
          <ul className="space-y-4 mb-8">
            {['8,000+ Verified Vehicles', 'Live GPS Route Tracking', 'Smart Load Matching', 'Insured Deliveries'].map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-white/80">
                <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center"><Heart className="w-3 h-3 text-orange-400" /></div>
                {feature}
              </li>
            ))}
          </ul>
          <Link href="/login">
            <button className="px-8 py-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-all shadow-lg shadow-orange-500/20">
              Explore Transport Network
            </button>
          </Link>
        </motion.div>
        
        {/* Animated Map Mockup */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative h-[500px] rounded-3xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-blue-500/5" />
          <motion.div 
            animate={{ x: [-100, 100], y: [-50, 50] }} 
            transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
            className="absolute z-10 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(249,115,22,0.8)]"
          >
            🚛
          </motion.div>
          {/* Path */}
          <svg className="absolute inset-0 w-full h-full" style={{ strokeDasharray: "10, 10" }}>
             <path d="M100 100 Q 250 300 400 400" fill="none" stroke="rgba(249,115,22,0.5)" strokeWidth="4" />
          </svg>
        </motion.div>
      </div>
    </section>
  );
}

export function IndustryPreview() {
  return (
    <section className="py-24 px-4 bg-[#080d08]" id="industry">
      <div className="max-w-7xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm mb-6">
            <Factory className="w-4 h-4" /> B2B Network
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            Powering <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-fuchsia-300">Agri-Industries</span>
          </h2>
          <p className="text-lg text-white/50 max-w-2xl mx-auto">
            From procuring raw materials in bulk to acquiring crop waste for biofuel, AgriAssist connects industries directly to the source.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {['Food Processing', 'Biofuel Refineries', 'Textile Mills', 'Pharmaceuticals'].map((ind, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50">
              <div className="text-3xl mb-4">🏭</div>
              <h3 className="font-bold text-white mb-2">{ind}</h3>
              <p className="text-sm text-white/50">Direct procurement & digital contracts</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function WeatherAIPreview() {
  return (
    <section className="py-24 px-4 bg-gradient-to-b from-black to-[#050a05]">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8">
        {/* Weather Card */}
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="rounded-3xl bg-blue-950/20 border border-blue-500/20 p-8 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px]" />
          <CloudRain className="w-12 h-12 text-blue-400 mb-6" />
          <h3 className="text-3xl font-black text-white mb-4">Hyper-Local Weather</h3>
          <p className="text-white/60 mb-8">Access 7-day accurate forecasts tailored exactly to your farm's GPS location. Prevent crop damage before it happens.</p>
          
          <div className="flex items-center gap-6 mb-8">
            <div className="text-5xl font-black text-white">28°<span className="text-blue-400">C</span></div>
            <div className="space-y-1 text-sm text-white/60">
              <div>💧 Humidity: 65%</div>
              <div>💨 Wind: 12 km/h</div>
              <div>☔ Rain Prob: 10%</div>
            </div>
          </div>
          <Link href="/login">
            <button className="px-6 py-3 rounded-xl bg-blue-500/20 text-blue-400 font-bold hover:bg-blue-500 hover:text-white transition-colors">
              Open Weather Dashboard
            </button>
          </Link>
        </motion.div>

        {/* AI Card */}
        <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="rounded-3xl bg-purple-950/20 border border-purple-500/20 p-8 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[100px]" />
          <Brain className="w-12 h-12 text-purple-400 mb-6" />
          <h3 className="text-3xl font-black text-white mb-4">Gemini AI Assistant</h3>
          <p className="text-white/60 mb-8">Take a photo of a diseased leaf, ask for crop recommendations, or get future price predictions. Your personal agricultural expert.</p>
          
          <div className="space-y-3 mb-8">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white/80">"What crop should I plant in November in Maharashtra?"</div>
            <div className="p-4 rounded-xl bg-purple-500/20 border border-purple-500/30 text-sm text-white/90">Based on the soil and upcoming weather, Rabi crops like Wheat or Chickpea are highly recommended...</div>
          </div>
          <Link href="/login">
            <button className="px-6 py-3 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-bold transition-colors shadow-lg shadow-purple-500/20">
              Try AI Assistant
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
