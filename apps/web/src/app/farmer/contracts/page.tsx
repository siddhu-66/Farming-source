'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ContractModal } from '@/components/shared/ContractModal';
import { FileText, ArrowLeft, RefreshCw, UserCheck } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function FarmerContractsPage() {
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState<any[]>([]);
  const [selectedContract, setSelectedContract] = useState<any | null>(null);
  const router = useRouter();

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/farmer/contracts');
      if (response.data.success) {
        setContracts(response.data.data.contracts || []);
      } else {
        toast.error('Failed to fetch contracts');
      }
    } catch (error) {
      console.error('Failed to fetch contracts', error);
      toast.error('Error loading contracts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const handleSign = async (id: string) => {
    try {
      const res = await api.patch(`/farmer/contracts/${id}/sign`);
      if (res.data.success) {
        toast.success('Contract signed successfully!');
        setSelectedContract(null);
        fetchContracts();
      } else {
        toast.error('Failed to sign contract');
      }
    } catch (err) {
      toast.error('Error signing contract');
    }
  };

  return (
    <div className="space-y-6 relative min-h-[60vh]">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()} size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <h1 className="text-3xl font-bold">My Contracts</h1>
        </div>
        <Button variant="outline" onClick={fetchContracts} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {/* Walking Farmer Animation */}
      <div className="absolute top-0 right-0 pointer-events-none opacity-50 z-0">
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: -100, opacity: [0, 1, 1, 0] }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear",
            delay: 2
          }}
          className="text-amber-600 flex flex-col items-center"
        >
          <UserCheck size={48} />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {loading ? (
           Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 w-full" />)
        ) : contracts.length === 0 ? (
           <p className="text-gray-500">No active contracts.</p>
        ) : (
          contracts.map((contract) => (
            <motion.div 
              key={contract.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -5 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-primary/10 p-3 rounded-lg text-primary">
                      <FileText className="h-6 w-6" />
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${contract.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                      {contract.status.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg">{contract.id.substring(0,8)}</h3>
                  <p className="text-sm text-gray-500 mt-1 mb-4">Amount: ₹{contract.totalAmount}</p>
                  <Button className="w-full" variant={contract.status === 'draft' ? 'primary' : 'outline'} onClick={() => setSelectedContract(contract)}>
                    {contract.status === 'draft' ? 'Review & Sign' : 'View Details'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      <ContractModal 
        isOpen={!!selectedContract} 
        onClose={() => setSelectedContract(null)} 
        contract={selectedContract} 
        onSign={handleSign}
      />
    </div>
  );
}
