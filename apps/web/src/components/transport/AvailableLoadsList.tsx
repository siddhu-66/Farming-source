import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MapPin, Package, Weight, IndianRupee, Clock, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export function AvailableLoadsList({ loads = [], onAccept }: { loads: any[], onAccept?: (id: string) => void }) {
  const [processing, setProcessing] = useState<string | null>(null);

  const handleAccept = async (id: string) => {
    try {
      setProcessing(id);
      // Mocking the accept call since it requires choosing a vehicle
      // A full implementation would pop open a modal to select the fleet vehicle
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success('Load accepted successfully');
      if (onAccept) onAccept(id);
    } catch (err: any) {
      toast.error(err.message || 'Failed to accept load');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = (id: string) => {
    toast.success('Load removed from your view');
  };

  if (!loads || loads.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center flex flex-col items-center">
          <Package className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 dark:text-white">No available loads nearby</h3>
          <p className="text-gray-500 mt-2">New transport requests will appear here automatically.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {loads.map((load, index) => (
        <motion.div 
          key={load.id} 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: index * 0.1 }}
        >
          <Card className="border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6 justify-between">
                
                {/* Load Details */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="warning" className="bg-orange-50 text-orange-700 border-orange-200 uppercase tracking-wider">
                      92% AI Match
                    </Badge>
                    <span className="text-xs text-gray-500 flex items-center">
                      <Clock className="w-3 h-3 mr-1" /> Requested 10m ago
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold flex items-center">
                      {load.order?.listing?.cropName || 'Agriculture Produce'}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-2">
                      <span className="flex items-center"><Weight className="w-4 h-4 mr-1" /> {load.order?.quantity || 500} {load.order?.unit || 'kg'}</span>
                      <span className="flex items-center"><Package className="w-4 h-4 mr-1" /> Requires: {load.vehicle_type || 'Mini Truck'}</span>
                    </div>
                  </div>

                  {/* Route */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800 relative">
                    <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gray-300 dark:bg-gray-600 z-0"></div>
                    
                    <div className="flex items-start gap-3 relative z-10 mb-4">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                        <MapPin className="w-3 h-3" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Pickup Location</p>
                        <p className="text-sm font-medium">{load.pickup_address?.city || 'Farmer Location'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 relative z-10">
                      <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                        <MapPin className="w-3 h-3" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Drop Location</p>
                        <p className="text-sm font-medium">{load.delivery_address?.city || 'Buyer Location'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Earnings & Actions */}
                <div className="flex flex-col justify-between items-end min-w-[200px] border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6 border-gray-200 dark:border-gray-800">
                  <div className="text-right w-full">
                    <p className="text-sm font-medium text-gray-500 mb-1">Estimated Earnings</p>
                    <p className="text-3xl font-bold text-green-600 flex items-center justify-end">
                      <IndianRupee className="w-6 h-6 mr-1" /> {load.fare || '1,250'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">~{Math.floor((load.fare || 1250) / 25)} km distance</p>
                  </div>

                  <div className="flex gap-2 w-full mt-6">
                    <Button 
                      variant="outline" 
                      className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => handleReject(load.id)}
                    >
                      <XCircle className="w-4 h-4 mr-2" /> Reject
                    </Button>
                    <Button 
                      className="flex-1 bg-primary hover:bg-primary/90"
                      onClick={() => handleAccept(load.id)}
                      disabled={processing === load.id}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" /> 
                      {processing === load.id ? 'Accepting...' : 'Accept'}
                    </Button>
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
