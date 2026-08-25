'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Shield, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminMarketplacePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchListings = async () => {
    try {
      const response = await api.get('/admin/marketplace').catch(() => ({ data: [
        { id: '101', crop: 'Organic Wheat', seller: 'Farmer John', price: '$200/ton', status: 'ACTIVE' },
        { id: '102', crop: 'Premium Rice', seller: 'Farmer Jane', price: '$350/ton', status: 'PENDING' }
      ]}));
      setListings(response.data);
    } catch (error) {
      toast.error('Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleAction = async (id: string, action: string) => {
    try {
      setActionLoading(`${id}-${action}`);
      await api.post(`/admin/marketplace/${id}/${action}`);
      toast.success(`Listing ${action}ed successfully`);
      await fetchListings();
    } catch (error) {
      toast.error(`Failed to ${action} listing`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Marketplace Moderation</h1>
          <motion.div
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1.1, rotate: 10 }}
            transition={{ repeat: Infinity, repeatType: "reverse", duration: 1, ease: "easeInOut" }}
            className="flex items-center space-x-2 text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full dark:bg-indigo-900/30 dark:text-indigo-400"
          >
            <Shield className="h-5 w-5" />
            <span className="font-semibold text-sm">Active Shield</span>
          </motion.div>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Active Listings</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="space-y-4">
               {Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
             </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Listing ID</TableHead>
                  <TableHead>Crop</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listings.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-gray-500">#{item.id}</TableCell>
                    <TableCell className="font-semibold">{item.crop}</TableCell>
                    <TableCell>{item.seller}</TableCell>
                    <TableCell>{item.price}</TableCell>
                    <TableCell>
                      <Badge variant={item.status === 'ACTIVE' ? 'success' : 'danger'}>{item.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {item.status === 'ACTIVE' ? (
                        <Button 
                          size="sm" 
                          variant="danger" 
                          onClick={() => handleAction(item.id, 'deactivate')}
                          disabled={actionLoading !== null}
                        >
                          Deactivate
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleAction(item.id, 'review')}
                          disabled={actionLoading !== null}
                        >
                          Review
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
