'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Bell, Search, Filter, Settings, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { NotificationCard } from '@/components/notifications/NotificationCard';

const TABS = ['All', 'Unread', 'Orders', 'Marketplace', 'Weather', 'Transport', 'Wallet', 'System'];

export default function NotificationsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications', {
        params: { limit: 50 }
      });
      // Handle the mapped notifications
      setNotifications(data.data?.notifications || []);
    } catch (error: any) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      toast.error('Failed to mark read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All marked as read');
    } catch (error) {
      toast.error('Failed to mark all read');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  // Filter Logic
  const filteredNotifications = notifications.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          n.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    switch (activeTab) {
      case 'All': return true;
      case 'Unread': return !n.isRead;
      case 'Orders': return n.type === 'order';
      case 'Marketplace': return n.type === 'marketplace' || n.type === 'listing_created';
      case 'Weather': return n.type === 'weather';
      case 'Transport': return n.type === 'transport';
      case 'Wallet': return n.type === 'wallet' || n.type === 'payment';
      case 'System': return n.type === 'system' || n.type === 'security';
      default: return true;
    }
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-24">
      
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()} className="p-2 -ml-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Bell className="w-8 h-8 text-blue-600" />
              Notifications
            </h1>
            <p className="text-gray-500 mt-1 text-sm">Stay updated with your latest alerts.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleMarkAllRead} className="hidden md:flex">
            <CheckCircle2 className="w-4 h-4 mr-2" /> Mark all read
          </Button>
          <Button variant="outline" size="icon" title="Settings">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search & Tabs */}
      <div className="bg-white dark:bg-gray-900 border rounded-xl p-2 sticky top-4 z-20 shadow-sm shadow-blue-900/5">
        <div className="flex flex-col lg:flex-row gap-3">
          
          <div className="relative flex-1 lg:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search notifications..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide flex-1">
            {TABS.map(tab => (
              <Button
                key={tab}
                variant={activeTab === tab ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(tab)}
                className={`rounded-full whitespace-nowrap ${activeTab !== tab && 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              >
                {tab}
              </Button>
            ))}
          </div>

        </div>
      </div>

      {/* Notification List */}
      <div className="space-y-4 min-h-[400px]">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))
        ) : filteredNotifications.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center p-12 text-center bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-800"
          >
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 opacity-50" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">All caught up!</h3>
            <p className="text-gray-500 max-w-sm mt-1">
              You don't have any {activeTab !== 'All' ? activeTab.toLowerCase() : ''} notifications right now.
            </p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredNotifications.map((notif) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                layout
              >
                <NotificationCard 
                  notification={notif}
                  onMarkRead={handleMarkRead}
                  onDelete={handleDelete}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

    </div>
  );
}
