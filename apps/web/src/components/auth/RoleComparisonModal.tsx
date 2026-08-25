'use client';

import { motion } from 'framer-motion';
import { X, Check, Minus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface RoleComparisonModalProps {
  onClose: () => void;
  onSelectRole: (role: string) => void;
}

const COMPARISON_DATA = [
  { feature: 'Sell Crops', farmer: true, buyer: false, transport: false, industry: false },
  { feature: 'Buy Crops', farmer: false, buyer: true, transport: 'Delivery Only', industry: true },
  { feature: 'AI Assistant', farmer: true, buyer: 'Limited', transport: 'Limited', industry: 'Limited' },
  { feature: 'Transport Mgmt', farmer: 'Book', buyer: 'Track', transport: 'Manage', industry: 'Track' },
  { feature: 'Dashboard Type', farmer: 'Farmer', buyer: 'Buyer', transport: 'Transport', industry: 'Industry' },
];

export function RoleComparisonModal({ onClose, onSelectRole }: RoleComparisonModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-4xl bg-[#0a0f0a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
          <h2 className="text-2xl font-bold text-white">Compare Roles</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/70">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr>
                  <th className="p-4 border-b border-white/10 text-white/50 font-medium">Feature</th>
                  <th className="p-4 border-b border-white/10 text-green-400 font-bold text-center">Farmer</th>
                  <th className="p-4 border-b border-white/10 text-blue-400 font-bold text-center">Buyer</th>
                  <th className="p-4 border-b border-white/10 text-orange-400 font-bold text-center">Transport</th>
                  <th className="p-4 border-b border-white/10 text-purple-400 font-bold text-center">Industry</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_DATA.map((row, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 font-medium text-white/90">{row.feature}</td>
                    
                    {[row.farmer, row.buyer, row.transport, row.industry].map((val, colIdx) => (
                      <td key={colIdx} className="p-4 text-center">
                        {val === true ? (
                          <Check className="w-5 h-5 mx-auto text-green-500" />
                        ) : val === false ? (
                          <Minus className="w-5 h-5 mx-auto text-white/20" />
                        ) : (
                          <span className="text-sm text-white/70">{val as string}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-6 border-t border-white/10 bg-white/5 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="outline" className="border-green-500/30 text-green-400 hover:bg-green-500 hover:text-white" onClick={() => onSelectRole('farmer')}>Select Farmer</Button>
          <Button variant="outline" className="border-blue-500/30 text-blue-400 hover:bg-blue-500 hover:text-white" onClick={() => onSelectRole('buyer')}>Select Buyer</Button>
          <Button variant="outline" className="border-orange-500/30 text-orange-400 hover:bg-orange-500 hover:text-white" onClick={() => onSelectRole('transport')}>Select Transport</Button>
          <Button variant="outline" className="border-purple-500/30 text-purple-400 hover:bg-purple-500 hover:text-white" onClick={() => onSelectRole('industry')}>Select Industry</Button>
        </div>
      </motion.div>
    </div>
  );
}
