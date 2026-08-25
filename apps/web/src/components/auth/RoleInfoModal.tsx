'use client';

import { motion } from 'framer-motion';
import { X, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface RoleInfoModalProps {
  roleId: string;
  onClose: () => void;
  onSelectRole: (role: string) => void;
}

const ROLE_DETAILS: Record<string, any> = {
  farmer: {
    title: 'Farmer',
    icon: '🌾',
    color: 'from-green-500 to-emerald-400',
    overview: 'Designed for independent farmers, FPOs, and cooperatives to sell produce directly to buyers.',
    typicalUsers: ['Smallholder Farmers', 'Commercial Farmers', 'Farmer Producer Organizations (FPOs)'],
    requirements: ['Valid Mobile Number', 'Aadhaar / KYC (for payments)', 'Farm Location details'],
    benefits: ['Sell crops at better prices', 'Get AI-driven crop advice', 'Access real-time weather forecasts'],
  },
  buyer: {
    title: 'Buyer',
    icon: '🛒',
    color: 'from-blue-500 to-cyan-400',
    overview: 'For wholesalers, retailers, and direct consumers looking to purchase fresh produce from verified farmers.',
    typicalUsers: ['Wholesalers', 'Retail Chains', 'Restaurants', 'Individual Buyers'],
    requirements: ['Valid Mobile Number', 'Business Registration (for bulk)', 'Delivery Address'],
    benefits: ['Direct access to fresh produce', 'Transparent pricing', 'Digital contracts and secure payments'],
  },
  transport: {
    title: 'Transport',
    icon: '🚛',
    color: 'from-orange-500 to-amber-400',
    overview: 'For fleet owners and independent drivers looking to provide logistics services between farmers and buyers.',
    typicalUsers: ['Fleet Owners', 'Independent Truck Drivers', 'Logistics Companies'],
    requirements: ['Valid Mobile Number', 'Vehicle Registration / RC', 'Driving License'],
    benefits: ['Find regular loads nearby', 'Optimized routing', 'Guaranteed payments'],
  },
  industry: {
    title: 'Industry',
    icon: '🏭',
    color: 'from-purple-500 to-fuchsia-400',
    overview: 'For large-scale processing units, biofuel refineries, and textile mills to procure raw materials in bulk.',
    typicalUsers: ['Food Processing Units', 'Biofuel Refineries', 'Textile Mills'],
    requirements: ['Valid Mobile Number', 'Company Registration / GST', 'Warehouse Location'],
    benefits: ['Bulk procurement digital contracts', 'Waste to wealth marketplace access', 'Demand forecasting tools'],
  }
};

export function RoleInfoModal({ roleId, onClose, onSelectRole }: RoleInfoModalProps) {
  const data = ROLE_DETAILS[roleId];
  if (!data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-2xl bg-[#0a0f0a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-white/10 flex items-start justify-between bg-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br opacity-10 pointer-events-none" style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }} />
          
          <div className="relative z-10 flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl bg-gradient-to-br ${data.color} shadow-lg`}>
              {data.icon}
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">{data.title}</h2>
              <p className="text-white/60">Role Information</p>
            </div>
          </div>
          <button onClick={onClose} className="relative z-10 p-2 rounded-full hover:bg-white/10 transition-colors text-white/70">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-8">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Overview</h3>
            <p className="text-white/70 leading-relaxed">{data.overview}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Typical Users</h3>
              <ul className="space-y-2">
                {data.typicalUsers.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Requirements</h3>
              <ul className="space-y-2">
                {data.requirements.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                    <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Key Benefits</h3>
            <div className="grid gap-3">
              {data.benefits.map((item: string, i: number) => (
                <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5 text-sm text-white/80">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-white/10 bg-white/5 flex gap-4 justify-end">
          <Button variant="ghost" onClick={onClose} className="text-white/70 hover:text-white">Cancel</Button>
          <Button 
            className={`bg-gradient-to-r ${data.color} hover:brightness-110 text-white border-0`}
            onClick={() => onSelectRole(roleId)}
          >
            Select {data.title}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
