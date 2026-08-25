'use client';
import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ArrowLeft, Settings, Palette, Zap, Shield, Wrench } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';

import BrandingForm from '@/components/admin/settings/BrandingForm';
import ApiConfigForm from '@/components/admin/settings/ApiConfigForm';
import SecurityForm from '@/components/admin/settings/SecurityForm';
import SystemActions from '@/components/admin/settings/SystemActions';

export default function PlatformSettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [settingsData, setSettingsData] = useState<any>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/admin/settings');
      setSettingsData(res.data.data.settings);
    } catch (e) {
      toast.error('Failed to load system settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-24 h-full flex flex-col">
      <div>
        <div className="flex items-center space-x-4 mb-2">
          <Button variant="ghost" onClick={() => router.back()} size="sm" className="-ml-2">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center text-gray-900 dark:text-white">
              <Settings className="mr-3 h-8 w-8 text-primary" /> Platform Settings
            </h1>
            <p className="text-gray-500 mt-1">Centralized configuration and mission control.</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0 space-x-6 overflow-x-auto">
          <TabsTrigger 
            value="general" 
            className="data-[state=active]:border-primary data-[state=active]:text-primary border-b-2 border-transparent rounded-none px-2 py-3"
          >
            <Palette className="w-4 h-4 mr-2" /> Branding
          </TabsTrigger>
          <TabsTrigger 
            value="api" 
            className="data-[state=active]:border-primary data-[state=active]:text-primary border-b-2 border-transparent rounded-none px-2 py-3"
          >
            <Zap className="w-4 h-4 mr-2" /> API & Integrations
          </TabsTrigger>
          <TabsTrigger 
            value="security" 
            className="data-[state=active]:border-primary data-[state=active]:text-primary border-b-2 border-transparent rounded-none px-2 py-3"
          >
            <Shield className="w-4 h-4 mr-2" /> Security
          </TabsTrigger>
          <TabsTrigger 
            value="system" 
            className="data-[state=active]:border-primary data-[state=active]:text-primary border-b-2 border-transparent rounded-none px-2 py-3"
          >
            <Wrench className="w-4 h-4 mr-2" /> System Operations
          </TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="general" className="m-0 focus:outline-none">
            <BrandingForm initialData={settingsData} />
          </TabsContent>
          <TabsContent value="api" className="m-0 focus:outline-none">
            <ApiConfigForm initialData={settingsData} />
          </TabsContent>
          <TabsContent value="security" className="m-0 focus:outline-none">
            <SecurityForm initialData={settingsData} />
          </TabsContent>
          <TabsContent value="system" className="m-0 focus:outline-none">
            <SystemActions initialData={settingsData} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
