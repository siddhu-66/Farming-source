'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Plus, Edit2, Trash2, Recycle, ArrowLeft, RefreshCw, Flame, Factory } from 'lucide-react';
import api from '@/lib/api';
import { Skeleton } from '@/components/ui/Skeleton';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function WasteManagementPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchWasteListings = async () => {
    try {
      setLoading(true);
      // Fetching only waste listings (assuming backend returns all listings, we filter here or backend does)
      const response = await api.get('/farmer/listings?status=active');
      if (response.data.success) {
        // Filter for waste listings in case backend doesn't support type filtering yet
        const allListings = response.data.data.listings || [];
        setListings(allListings.filter((l: any) => l.type === 'waste'));
      } else {
        toast.error('Failed to load waste listings');
      }
    } catch (error) {
      toast.error('Error loading waste listings');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWasteListings();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/farmer/listings/${id}`);
      toast.success('Listing cancelled');
      setListings(listings.filter(l => l.id !== id));
    } catch (err) {
      toast.error('Failed to cancel listing');
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()} size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <h1 className="text-3xl font-bold flex items-center">
            <Recycle className="mr-2 text-green-600" /> Waste & Recycling
          </h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={fetchWasteListings} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button onClick={() => toast('Add waste dialog coming soon')} className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" /> Add Waste
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-green-100 dark:bg-green-800 rounded-full">
              <Recycle className="h-6 w-6 text-green-600 dark:text-green-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-800 dark:text-green-300">Active Listings</p>
              <h3 className="text-2xl font-bold text-green-900 dark:text-green-100">{listings.length}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-800 rounded-full">
              <Factory className="h-6 w-6 text-purple-600 dark:text-purple-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-purple-800 dark:text-purple-300">Industry Reach</p>
              <h3 className="text-2xl font-bold text-purple-900 dark:text-purple-100">12+</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-800 rounded-full">
              <Flame className="h-6 w-6 text-orange-600 dark:text-orange-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-orange-800 dark:text-orange-300">Estimated Value</p>
              <h3 className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                ₹{listings.reduce((acc, curr) => acc + (curr.quantity * curr.pricePerUnit), 0).toLocaleString()}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
        <Card>
          <CardHeader>
            <CardTitle>Marketplace Listings (Crop Waste)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No active waste listings found.</p>
                <p className="text-sm mt-2">Sell your stubble, husks, and biomass directly to industries.</p>
                <Button className="mt-4 bg-green-600 hover:bg-green-700" onClick={() => toast('Add waste dialog coming soon')}>
                  <Plus className="mr-2 h-4 w-4" /> Create your first listing
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price/Unit</TableHead>
                    <TableHead>Total Value</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listings.map((item) => (
                    <motion.tr 
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                      className="border-b transition-colors hover:bg-muted/50"
                    >
                      <TableCell className="font-medium p-4 align-middle">{item.title}</TableCell>
                      <TableCell className="p-4 align-middle">{item.cropName}</TableCell>
                      <TableCell className="p-4 align-middle">{item.quantity} {item.unit}</TableCell>
                      <TableCell className="p-4 align-middle">₹{item.pricePerUnit}</TableCell>
                      <TableCell className="p-4 align-middle font-semibold text-green-600">
                        ₹{(item.quantity * item.pricePerUnit).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right p-4 align-middle">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => toast('Edit coming soon')}>
                          <Edit2 className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
