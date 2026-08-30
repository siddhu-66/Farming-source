'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function BrandingForm({ initialData }: { initialData: any }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    platformName: initialData?.general?.platformName || 'AgriAssist',
    supportEmail: initialData?.general?.supportEmail || 'support@agriassist.in',
    themeColor: initialData?.branding?.themeColor || '#10b981',
  });

  const handleSave = async () => {
    try {
      setLoading(true);
      await Promise.all([
        api.patch('/admin/settings/general', {
          platformName: formData.platformName,
          supportEmail: formData.supportEmail
        }),
        api.patch('/admin/settings/branding', {
          themeColor: formData.themeColor
        })
      ]);
      toast.success('Branding and General settings saved successfully!');
    } catch (e) {
      toast.error('Failed to save branding settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-gray-200 dark:border-gray-800">
      <CardHeader>
        <CardTitle>General & Branding</CardTitle>
        <CardDescription>Configure platform identity and contact information.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Platform Name</Label>
            <Input 
              value={formData.platformName} 
              onChange={e => setFormData({ ...formData, platformName: e.target.value })} 
            />
          </div>
          <div className="space-y-2">
            <Label>Support Email</Label>
            <Input 
              type="email"
              value={formData.supportEmail} 
              onChange={e => setFormData({ ...formData, supportEmail: e.target.value })} 
            />
          </div>
          <div className="space-y-2">
            <Label>Primary Theme Color</Label>
            <div className="flex gap-2">
              <Input 
                type="color" 
                className="w-12 h-10 p-1"
                value={formData.themeColor} 
                onChange={e => setFormData({ ...formData, themeColor: e.target.value })} 
              />
              <Input 
                value={formData.themeColor} 
                onChange={e => setFormData({ ...formData, themeColor: e.target.value })} 
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
