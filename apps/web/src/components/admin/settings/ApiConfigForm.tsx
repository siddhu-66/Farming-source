'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function ApiConfigForm({ initialData }: { initialData: any }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    aiProvider: initialData?.apiConfig?.aiProvider || 'Gemini 2.0 Flash',
    weatherProvider: initialData?.apiConfig?.weatherProvider || 'OpenWeather',
    paymentGateway: 'Razorpay',
  });

  const handleSave = async () => {
    try {
      setLoading(true);
      await api.patch('/admin/settings/apiConfig', formData);
      toast.success('API Configurations saved successfully!');
    } catch (e) {
      toast.error('Failed to save API configuration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-gray-200 dark:border-gray-800">
      <CardHeader>
        <CardTitle>API & Integrations</CardTitle>
        <CardDescription>Manage third-party service providers and API keys.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4 p-4 border rounded-lg bg-gray-50/50 dark:bg-gray-900/50">
            <h3 className="font-semibold text-sm">AI Assistant Configuration</h3>
            <div className="space-y-2">
              <Label>Active Provider</Label>
              <select 
                className="w-full p-2 border rounded-md text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                value={formData.aiProvider}
                onChange={e => setFormData({ ...formData, aiProvider: e.target.value })}
              >
                <option value="Gemini 2.0 Flash">Gemini 2.0 Flash (Default)</option>
                <option value="OpenAI GPT-4o">OpenAI GPT-4o</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input type="password" placeholder="••••••••••••••••" />
              <p className="text-xs text-gray-500">Keys are encrypted at rest.</p>
            </div>
          </div>

          <div className="space-y-4 p-4 border rounded-lg bg-gray-50/50 dark:bg-gray-900/50">
            <h3 className="font-semibold text-sm">Weather Services</h3>
            <div className="space-y-2">
              <Label>Active Provider</Label>
              <select 
                className="w-full p-2 border rounded-md text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                value={formData.weatherProvider}
                onChange={e => setFormData({ ...formData, weatherProvider: e.target.value })}
              >
                <option value="OpenWeather">OpenWeather</option>
                <option value="AgroMonitoring">AgroMonitoring</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input type="password" placeholder="••••••••••••••••" />
            </div>
          </div>

          <div className="space-y-4 p-4 border rounded-lg bg-gray-50/50 dark:bg-gray-900/50">
            <h3 className="font-semibold text-sm">Payment Gateway</h3>
            <div className="space-y-2">
              <Label>Active Provider</Label>
              <select 
                className="w-full p-2 border rounded-md text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                value={formData.paymentGateway}
                onChange={e => setFormData({ ...formData, paymentGateway: e.target.value })}
              >
                <option value="Razorpay">Razorpay</option>
                <option value="Stripe">Stripe</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Secret Key</Label>
              <Input type="password" placeholder="••••••••••••••••" />
            </div>
          </div>
          
          <div className="space-y-4 p-4 border rounded-lg bg-gray-50/50 dark:bg-gray-900/50">
            <h3 className="font-semibold text-sm">Cloud Storage</h3>
            <div className="space-y-2">
              <Label>Active Provider</Label>
              <Input value="Supabase Storage" disabled />
            </div>
            <div className="space-y-2">
              <Label>Max File Size (MB)</Label>
              <Input type="number" defaultValue="10" />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Configurations'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
