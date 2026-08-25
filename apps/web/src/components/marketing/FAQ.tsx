'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

const FAQS = [
  {
    question: "How do I register on AgriAssist?",
    answer: "Click the 'Get Started' button, select your role (Farmer, Buyer, Transport, or Industry), verify your mobile number via OTP, and complete your basic profile."
  },
  {
    question: "How can I sell my crops?",
    answer: "As a registered farmer, go to your dashboard, click 'New Listing', enter crop details, price, and upload photos. Buyers will see it in the marketplace instantly."
  },
  {
    question: "How do I book transport?",
    answer: "Once a contract is signed between a farmer and buyer, the system automatically suggests nearby verified transporters. You can select one, view the fare, and book immediately with live GPS tracking."
  },
  {
    question: "How does the AI Assistant work?",
    answer: "The Gemini AI Assistant is built into the platform. You can take a photo of a diseased plant for instant diagnosis, or chat with it for personalized crop recommendations based on your local weather and soil."
  },
  {
    question: "How are payments handled securely?",
    answer: "Payments are held securely in an escrow-like system until the quality inspection is passed and delivery is completed. Once confirmed, funds are transferred instantly to the farmer's bank account."
  },
  {
    question: "Is my data secure?",
    answer: "Yes, AgriAssist uses enterprise-grade encryption, secure JWT sessions, and strict Role-Based Access Control to ensure your data and trade secrets are completely protected."
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 px-4 bg-[#060a06]" id="faq">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="text-4xl font-black mb-4">
            Frequently Asked <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-300">Questions</span>
          </h2>
          <p className="text-white/50">Everything you need to know about the platform.</p>
        </motion.div>

        <div className="space-y-4">
          {FAQS.map((faq, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden"
            >
              <button 
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full px-6 py-5 flex items-center justify-between text-left font-semibold text-lg text-white hover:bg-white/5 transition-colors"
              >
                {faq.question}
                <ChevronDown className={`w-5 h-5 text-green-500 transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }} 
                    animate={{ height: 'auto', opacity: 1 }} 
                    exit={{ height: 0, opacity: 0 }} 
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-5 text-white/60 leading-relaxed border-t border-white/5 pt-4">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
