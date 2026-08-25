import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { Package, Truck, MessageSquare, FileText, CheckCircle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface Order {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  listing?: {
    cropName: string;
    images?: string[];
    pricePerUnit: number;
    unit: string;
  };
  farmer?: {
    userId: string;
  };
  buyer?: {
    userId: string;
  };
  // Simplified for UI
  timeline?: any[];
}

interface OrderCardProps {
  order: Order;
  userRole: 'farmer' | 'buyer' | 'industry' | 'transport' | 'admin';
  onConfirm?: (id: string) => void;
  onCancel?: (id: string) => void;
  onPay?: (id: string) => void;
}

export function OrderCard({ order, userRole, onConfirm, onCancel, onPay }: OrderCardProps) {
  const router = useRouter();

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string, color: string }> = {
      pending_farmer: { label: 'Waiting for Farmer', color: 'bg-yellow-100 text-yellow-800' },
      confirmed: { label: 'Confirmed (Awaiting Payment)', color: 'bg-blue-100 text-blue-800' },
      payment_completed: { label: 'Payment Completed', color: 'bg-indigo-100 text-indigo-800' },
      transport_assigned: { label: 'Transport Assigned', color: 'bg-orange-100 text-orange-800' },
      in_transit: { label: 'In Transit', color: 'bg-purple-100 text-purple-800' },
      delivered: { label: 'Delivered', color: 'bg-teal-100 text-teal-800' },
      completed: { label: 'Completed', color: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
    };
    const s = map[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
    return <Badge className={s.color}>{s.label}</Badge>;
  };

  const quantity = order.listing?.pricePerUnit ? (order.totalAmount / order.listing.pricePerUnit).toFixed(1) : 'Unknown';

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -2 }}>
      <Card className="hover:shadow-md transition-shadow bg-white dark:bg-gray-900 border">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row border-b">
            {/* Image & Basic Info */}
            <div className="flex-1 p-4 flex gap-4">
              <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden shrink-0">
                {order.listing?.images?.[0] ? (
                  <img src={order.listing.images[0]} alt="Crop" className="w-full h-full object-cover" />
                ) : (
                  <Package className="w-8 h-8 m-6 text-gray-300" />
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg line-clamp-1">{order.listing?.cropName || 'Unknown Crop'}</h3>
                  {getStatusBadge(order.status)}
                </div>
                <p className="text-xs text-gray-500">Order ID: {order.id.slice(0,8).toUpperCase()}</p>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {quantity} {order.listing?.unit || 'units'}
                </p>
                <p className="text-xs text-gray-400">
                  Ordered on: {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Price Info */}
            <div className="p-4 md:border-l flex flex-col justify-center items-end bg-gray-50 dark:bg-gray-800/50 md:w-48">
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="text-xl font-bold text-primary">₹{order.totalAmount}</p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="p-3 bg-gray-50 dark:bg-gray-900 flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => router.push(`/${userRole}/orders/${order.id}`)}>
                <FileText className="w-4 h-4 mr-2" /> Details
              </Button>
              {['transport_assigned', 'in_transit'].includes(order.status) && (
                <Button variant="outline" size="sm">
                  <Truck className="w-4 h-4 mr-2" /> Track
                </Button>
              )}
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-900">
                <MessageSquare className="w-4 h-4 mr-2" /> Chat
              </Button>
            </div>

            <div className="flex gap-2">
              {userRole === 'farmer' && order.status === 'pending_farmer' && (
                <>
                  <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => onCancel?.(order.id)}>
                    <XCircle className="w-4 h-4 mr-2" /> Reject
                  </Button>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => onConfirm?.(order.id)}>
                    <CheckCircle className="w-4 h-4 mr-2" /> Accept Order
                  </Button>
                </>
              )}

              {(userRole === 'buyer' || userRole === 'industry') && order.status === 'confirmed' && (
                <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={() => onPay?.(order.id)}>
                  Pay Now
                </Button>
              )}
              
              {/* Common cancel action if allowed */}
              {['pending_farmer', 'confirmed'].includes(order.status) && (userRole === 'buyer' || userRole === 'industry') && (
                <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => onCancel?.(order.id)}>
                  Cancel Order
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
