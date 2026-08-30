'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Switch } from '@/components/ui/Switch';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function SecurityForm({ initialData }: { initialData: any }) {
  const [loading, setLoading] = useState(false);
  const [securityData, setSecurityData] = useState({
    jwtExpiryDays: initialData?.security?.jwtExpiryDays || 7,
    otpLength: initialData?.security?.otpLength || 6,
    mfaRequired: initialData?.security?.mfaRequired || false,
  });
  
  const [flags, setFlags] = useState({
    enableMarketplace: initialData?.featureFlags?.enableMarketplace ?? true,
    enableAI: initialData?.featureFlags?.enableAI ?? true,
    enableWallet: initialData?.featureFlags?.enableWallet ?? true,
    enableGovernmentSchemes: initialData?.featureFlags?.enableGovernmentSchemes ?? true,
  });

  const handleSave = async () => {
    try {
      setLoading(true);
      await Promise.all([
        api.patch('/admin/settings/security', securityData),
        api.patch('/admin/settings/featureFlags', flags)
      ]);
      toast.success('Security and Feature Flags updated!');
    } catch (e) {
      toast.error('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-gray-200 dark:border-gray-800">
      <CardHeader>
        <CardTitle>Security & Feature Flags</CardTitle>
        <CardDescription>Manage authentication policies and toggle platform features globally.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold mb-4 text-gray-900 dark:text-white pb-2 border-b">Authentication Rules</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>JWT Expiry (Days)</Label>
              <Input 
                type="number" 
                value={securityData.jwtExpiryDays} 
                onChange={e => setSecurityData({ ...securityData, jwtExpiryDays: parseInt(e.target.value) })} 
              />
            </div>
            <div className="space-y-2">
              <Label>OTP Length</Label>
              <Input 
                type="number" 
                value={securityData.otpLength} 
                onChange={e => setSecurityData({ ...securityData, otpLength: parseInt(e.target.value) })} 
              />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg col-span-1 md:col-span-2 bg-gray-50 dark:bg-gray-900">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Require Multi-Factor Authentication (MFA)</Label>
                <p className="text-xs text-gray-500">Forces all Admins and Industry users to setup MFA.</p>
              </div>
              <Switch 
                checked={securityData.mfaRequired} 
                onCheckedChange={checked => setSecurityData({ ...securityData, mfaRequired: checked })} 
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-4 text-gray-900 dark:text-white pb-2 border-b">Feature Flags</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-0.5">
                <Label>Marketplace & Orders Module</Label>
                <p className="text-xs text-gray-500">Allows farmers to list crops and buyers to purchase them.</p>
              </div>
              <Switch 
                checked={flags.enableMarketplace} 
                onCheckedChange={checked => setFlags({ ...flags, enableMarketplace: checked })} 
              />
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-0.5">
                <Label>AI Assistant Module</Label>
                <p className="text-xs text-gray-500">Enables Disease Scanning, Crop Recommendations, and Chat.</p>
              </div>
              <Switch 
                checked={flags.enableAI} 
                onCheckedChange={checked => setFlags({ ...flags, enableAI: checked })} 
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-0.5">
                <Label>Wallet & Finance Module</Label>
                <p className="text-xs text-gray-500">Enables Escrow payments and wallet withdrawals.</p>
              </div>
              <Switch 
                checked={flags.enableWallet} 
                onCheckedChange={checked => setFlags({ ...flags, enableWallet: checked })} 
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-0.5">
                <Label>Government Schemes Module</Label>
                <p className="text-xs text-gray-500">Enables scheme discovery and loan applications.</p>
              </div>
              <Switch 
                checked={flags.enableGovernmentSchemes} 
                onCheckedChange={checked => setFlags({ ...flags, enableGovernmentSchemes: checked })} 
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Updating Security...' : 'Save Configuration'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
