'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dialog } from '@/components/ui/Dialog';
import { Plus, Truck, ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function TransportVehiclesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    registrationNumber: '',
    type: 'truck',
    capacity: '',
    capacityUnit: 'kg',
    model: '',
    make: '',
    year: new Date().getFullYear().toString()
  });

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/transport/vehicles');
      setVehicles(response.data.data?.vehicles || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/transport/vehicles', {
        ...formData,
        capacity: Number(formData.capacity),
        year: Number(formData.year)
      });
      toast.success('Vehicle registered successfully');
      setIsModalOpen(false);
      fetchVehicles();
      // Reset form
      setFormData({
        registrationNumber: '',
        type: 'truck',
        capacity: '',
        capacityUnit: 'kg',
        model: '',
        make: '',
        year: new Date().getFullYear().toString()
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to register vehicle');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" onClick={() => router.back()} className="p-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">Fleet Management</h1>
        <div className="ml-auto">
          <Button onClick={() => setIsModalOpen(true)}><Plus className="mr-2 h-4 w-4"/> Add Vehicle</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)
        ) : vehicles.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-gray-500">
            No vehicles registered yet.
          </div>
        ) : (
          vehicles.map((vehicle, i) => (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-lg text-orange-600 dark:text-orange-400">
                      <Truck className="h-6 w-6" />
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${vehicle.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                      {vehicle.status || 'Available'}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg">{vehicle.registrationNumber}</h3>
                  <p className="text-gray-500 text-sm mt-1 capitalize">{vehicle.type.replace('_', ' ')} • {vehicle.capacity} {vehicle.capacityUnit}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      <Dialog isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Vehicle">
        <form className="space-y-4 mt-4" onSubmit={handleSubmit}>
          <Input 
            label="Registration Number" 
            required 
            placeholder="e.g. MH-12-AB-1234" 
            value={formData.registrationNumber}
            onChange={(e) => setFormData({...formData, registrationNumber: e.target.value})}
          />
          <div>
            <label className="block text-sm font-medium mb-1">Vehicle Type</label>
            <select 
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              required
            >
              <option value="truck">Truck</option>
              <option value="mini_truck">Mini Truck</option>
              <option value="tractor">Tractor</option>
              <option value="tempo">Tempo</option>
              <option value="container">Container</option>
            </select>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input 
                label="Capacity" 
                type="number" 
                required 
                placeholder="10" 
                value={formData.capacity}
                onChange={(e) => setFormData({...formData, capacity: e.target.value})}
              />
            </div>
            <div className="w-1/3">
              <label className="block text-sm font-medium mb-1">Unit</label>
              <select 
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={formData.capacityUnit}
                onChange={(e) => setFormData({...formData, capacityUnit: e.target.value as any})}
              >
                <option value="kg">kg</option>
                <option value="ton">ton</option>
              </select>
            </div>
          </div>
          <Input 
            label="Make" 
            required 
            placeholder="e.g. Tata" 
            value={formData.make}
            onChange={(e) => setFormData({...formData, make: e.target.value})}
          />
          <Input 
            label="Model" 
            required 
            placeholder="e.g. Ace" 
            value={formData.model}
            onChange={(e) => setFormData({...formData, model: e.target.value})}
          />
          <Input 
            label="Year" 
            type="number" 
            required 
            placeholder="2023" 
            value={formData.year}
            onChange={(e) => setFormData({...formData, year: e.target.value})}
          />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Registering...' : 'Register Vehicle'}
          </Button>
        </form>
      </Dialog>
    </motion.div>
  );
}
