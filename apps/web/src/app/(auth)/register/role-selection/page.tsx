'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Wheat, ShoppingCart, Truck, Factory, Info, GitCompare, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { RoleComparisonModal } from '@/components/auth/RoleComparisonModal';
import { RoleInfoModal } from '@/components/auth/RoleInfoModal';

const ROLES = [
  {
    id: 'farmer',
    title: 'Farmer',
    icon: Wheat,
    color: 'from-green-500 to-emerald-400',
    borderColor: 'hover:border-green-500/50',
    shadowColor: 'hover:shadow-green-500/20',
    description: 'Sell crops, receive AI recommendations, monitor weather, and connect directly with buyers.',
    features: ['Crop Marketplace', 'AI Assistant', 'Weather Forecast', 'Transport Booking'],
    eligibility: 'Farmers, FPOs, Cooperatives'
  },
  {
    id: 'buyer',
    title: 'Buyer',
    icon: ShoppingCart,
    color: 'from-blue-500 to-cyan-400',
    borderColor: 'hover:border-blue-500/50',
    shadowColor: 'hover:shadow-blue-500/20',
    description: 'Purchase fresh crops, compare prices, create purchase orders, and track deliveries.',
    features: ['Purchase Crops', 'Compare Prices', 'Create POs', 'Track Deliveries'],
    eligibility: 'Wholesalers, Retailers, Restaurants'
  },
  {
    id: 'transport',
    title: 'Transport',
    icon: Truck,
    color: 'from-orange-500 to-amber-400',
    borderColor: 'hover:border-orange-500/50',
    shadowColor: 'hover:shadow-orange-500/20',
    description: 'Register vehicles, accept delivery requests, optimize routes, and manage earnings.',
    features: ['Accept Deliveries', 'Live Tracking', 'Route Optimization', 'Earnings Dash'],
    eligibility: 'Fleet Owners, Truck Drivers'
  },
  {
    id: 'industry',
    title: 'Industry',
    icon: Factory,
    color: 'from-purple-500 to-fuchsia-400',
    borderColor: 'hover:border-purple-500/50',
    shadowColor: 'hover:shadow-purple-500/20',
    description: 'Bulk procurement, warehouse management, demand forecasting, and planning.',
    features: ['Bulk Procurement', 'Warehouse Mgmt', 'Demand Forecast', 'Procurement Plan'],
    eligibility: 'Food Processing, Biofuel, Textile'
  }
];

export default function RoleSelectionPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [infoModalRole, setInfoModalRole] = useState<string | null>(null);

  // Restore selection from session storage
  useEffect(() => {
    const saved = sessionStorage.getItem('selectedRole');
    if (saved && ROLES.find(r => r.id === saved)) {
      setSelectedRole(saved);
    }
  }, []);

  const handleSelectRole = (roleId: string) => {
    setSelectedRole(roleId);
    sessionStorage.setItem('selectedRole', roleId);
    
    // Fire analytics (non-blocking)
    fetch('/api/public/role-selection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: roleId.toUpperCase() })
    }).catch(() => {});
    
    // Close modals if open
    setShowComparison(false);
    setInfoModalRole(null);
  };

  const handleContinue = () => {
    if (!selectedRole) return;
    router.push(`/register/${selectedRole}`);
  };

  return (
    <div className="min-h-screen bg-[#050805] text-white flex flex-col">
      {/* Header */}
      <header className="p-6 flex items-center justify-between border-b border-white/5">
        <Link href="/" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Home</span>
        </Link>
        <div className="text-xl font-black tracking-tight">
          Agri<span className="text-green-500">Assist</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-2xl mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-black mb-4">Welcome to AgriAssist</h1>
          <p className="text-lg text-white/60">Choose how you want to use the platform. Your role determines your features and dashboard experience.</p>
        </motion.div>

        {/* Action Bar */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 mb-8 w-full sm:w-auto px-4 sm:px-0"
        >
          <Button 
            variant="outline" 
            className="border-white/10 hover:bg-white/5 text-white"
            onClick={() => setShowComparison(true)}
          >
            <GitCompare className="w-4 h-4 mr-2" />
            Compare Roles
          </Button>
          <Button 
            variant="outline" 
            className="border-white/10 hover:bg-white/5 text-white"
          >
            <Info className="w-4 h-4 mr-2" />
            Need Help Choosing?
          </Button>
        </motion.div>

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl mb-12 px-4 sm:px-0">
          {ROLES.map((role, i) => {
            const isSelected = selectedRole === role.id;
            return (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative p-6 rounded-3xl border backdrop-blur-sm transition-all duration-300 cursor-pointer group flex flex-col h-full
                  ${isSelected ? 'bg-white/10 border-white/30 scale-105 shadow-2xl z-10' : `bg-white/5 border-white/10 ${role.borderColor} ${role.shadowColor}`}
                  ${selectedRole && !isSelected ? 'opacity-50 hover:opacity-100' : ''}
                `}
                onClick={() => handleSelectRole(role.id)}
              >
                {/* Selection Indicator */}
                {isSelected && (
                  <div className={`absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-to-r ${role.color} flex items-center justify-center shadow-lg`}>
                    <Check className="w-5 h-5 text-white" />
                  </div>
                )}

                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br ${role.color} bg-opacity-20`}>
                  <role.icon className="w-7 h-7 text-white" />
                </div>
                
                <h2 className="text-2xl font-bold mb-2">{role.title}</h2>
                <p className="text-sm text-white/60 mb-6 flex-1">{role.description}</p>
                
                <div className="space-y-4 mb-8">
                  <div className="text-xs font-semibold text-white/40 uppercase tracking-wider">Features</div>
                  <ul className="space-y-2">
                    {role.features.slice(0, 3).map((f, fi) => (
                      <li key={fi} className="flex items-center gap-2 text-sm text-white/80">
                        <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${role.color}`} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  
                  <div className="pt-4 border-t border-white/10">
                    <div className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-1">Best For</div>
                    <div className="text-sm text-white/90">{role.eligibility}</div>
                  </div>
                </div>

                <div className="mt-auto space-y-3">
                  <Button 
                    className={`w-full ${isSelected ? `bg-gradient-to-r ${role.color} text-white` : 'bg-white/10 text-white hover:bg-white/20'}`}
                    onClick={(e) => { e.stopPropagation(); handleSelectRole(role.id); }}
                  >
                    {isSelected ? 'Selected' : `Select ${role.title}`}
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full text-white/60 hover:text-white"
                    onClick={(e) => { e.stopPropagation(); setInfoModalRole(role.id); }}
                  >
                    Learn More
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Continue Button */}
        <AnimatePresence>
          {selectedRole && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="sticky bottom-6 w-full max-w-md"
            >
              <Button 
                size="lg"
                className="w-full bg-white text-black hover:bg-white/90 text-lg font-bold shadow-2xl py-6 rounded-2xl"
                onClick={handleContinue}
              >
                Continue as {ROLES.find(r => r.id === selectedRole)?.title}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showComparison && (
          <RoleComparisonModal 
            onClose={() => setShowComparison(false)}
            onSelectRole={handleSelectRole}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {infoModalRole && (
          <RoleInfoModal
            roleId={infoModalRole}
            onClose={() => setInfoModalRole(null)}
            onSelectRole={handleSelectRole}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
