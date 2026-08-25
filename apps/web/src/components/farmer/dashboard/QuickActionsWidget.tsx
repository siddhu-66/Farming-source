'use client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ShoppingCart, Truck, Brain, Stethoscope, Sprout, CloudSun, Landmark, Wallet, Recycle, Package, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export function QuickActionsWidget() {
  const actions = [
    { icon: ShoppingCart, label: 'Sell Crop', href: '/farmer/marketplace', color: 'bg-blue-100 text-blue-600' },
    { icon: Truck, label: 'Transport', href: '/farmer/transport', color: 'bg-amber-100 text-amber-600' },
    { icon: Brain, label: 'AI Assistant', href: '/farmer/ai', color: 'bg-purple-100 text-purple-600' },
    { icon: Stethoscope, label: 'Disease Detect', href: '/farmer/disease', color: 'bg-red-100 text-red-600' },
    { icon: Sprout, label: 'Crop Recommend', href: '/farmer/ai', color: 'bg-green-100 text-green-600' },
    { icon: CloudSun, label: 'Weather', href: '/farmer/weather', color: 'bg-sky-100 text-sky-600' },
    { icon: Landmark, label: 'Govt Schemes', href: '/farmer/schemes', color: 'bg-indigo-100 text-indigo-600' },
    { icon: Wallet, label: 'Wallet', href: '/wallet', color: 'bg-emerald-100 text-emerald-600' },
    { icon: Recycle, label: 'Crop Waste', href: '/farmer/waste', color: 'bg-lime-100 text-lime-600' },
    { icon: Package, label: 'Orders', href: '/farmer/orders', color: 'bg-orange-100 text-orange-600' },
    { icon: MessageSquare, label: 'Messages', href: '/messages', color: 'bg-pink-100 text-pink-600' },
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
          {actions.map((action, i) => (
            <Link key={i} href={action.href} className="flex flex-col items-center justify-center p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-center group">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${action.color} group-hover:scale-110 transition-transform`}>
                <action.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{action.label}</span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
