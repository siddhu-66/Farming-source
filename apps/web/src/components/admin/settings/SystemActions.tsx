'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Switch } from '@/components/ui/Switch';
import { AlertCircle, DatabaseBackup, Power, ShieldAlert, Activity } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function SystemActions({ initialData }: { initialData: any }) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [maintenance, setMaintenance] = useState({
    enabled: initialData?.maintenance?.enabled || false,
  });

  const handleBackup = async () => {
    try {
      setLoadingAction('backup');
      const toastId = toast.loading('Initiating system backup...');
      const res = await api.post('/admin/settings/backup');
      toast.success(res.data.message || 'Backup completed.', { id: toastId });
    } catch (e) {
      toast.error('Backup failed.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRestore = async () => {
    if (!confirm('WARNING: Restoring will overwrite current database state. Proceed?')) return;
    try {
      setLoadingAction('restore');
      const toastId = toast.loading('Restoring system from latest backup...');
      const res = await api.post('/admin/settings/restore');
      toast.success(res.data.message || 'Restore completed.', { id: toastId });
    } catch (e) {
      toast.error('Restore failed.');
    } finally {
      setLoadingAction(null);
    }
  };

  const toggleMaintenance = async (checked: boolean) => {
    setMaintenance({ enabled: checked });
    try {
      await api.patch('/admin/settings/maintenance', { enabled: checked });
      toast.success(`Maintenance mode ${checked ? 'enabled' : 'disabled'}`);
    } catch (e) {
      setMaintenance({ enabled: !checked });
      toast.error('Failed to toggle maintenance mode');
    }
  };

  return (
    <div className="space-y-6">
      {/* Maintenance Mode */}
      <Card className={`border-2 ${maintenance.enabled ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-gray-200 dark:border-gray-800'}`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Power className={`w-5 h-5 ${maintenance.enabled ? 'text-red-500' : 'text-gray-500'}`} />
                <h3 className={`text-lg font-bold ${maintenance.enabled ? 'text-red-700 dark:text-red-400' : ''}`}>Maintenance Mode</h3>
              </div>
              <p className="text-sm text-gray-500 max-w-xl">
                Enabling maintenance mode blocks all non-admin traffic. Users will see a "Down for maintenance" splash screen.
              </p>
            </div>
            <Switch 
              checked={maintenance.enabled} 
              onCheckedChange={toggleMaintenance}
              className={maintenance.enabled ? 'data-[state=checked]:bg-red-500' : ''}
            />
          </div>
        </CardContent>
      </Card>

      {/* Database Backup & Restore */}
      <Card className="border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><DatabaseBackup className="w-5 h-5 text-primary" /> Backup & Restore</CardTitle>
          <CardDescription>Manually trigger database snapshots or restore from the latest checkpoint.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/50">
              <h4 className="font-semibold mb-2">Create Snapshot</h4>
              <p className="text-sm text-gray-500 mb-4">Creates a full backup of PostgreSQL tables and Supabase Storage buckets.</p>
              <Button 
                onClick={handleBackup} 
                disabled={loadingAction !== null}
                className="w-full sm:w-auto"
              >
                {loadingAction === 'backup' ? 'Backing up...' : 'Run Backup Now'}
              </Button>
            </div>
            
            <div className="flex-1 p-4 border rounded-lg border-red-100 bg-red-50 dark:bg-red-900/10 dark:border-red-900/30">
              <h4 className="font-semibold mb-2 text-red-700 dark:text-red-400 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" /> Danger Zone
              </h4>
              <p className="text-sm text-red-600 dark:text-red-300 mb-4">Restoring will overwrite current live data. This action is irreversible.</p>
              <Button 
                variant="danger"
                onClick={handleRestore} 
                disabled={loadingAction !== null}
                className="w-full sm:w-auto"
              >
                {loadingAction === 'restore' ? 'Restoring...' : 'Restore Latest Backup'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Monitoring Status */}
      <Card className="border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Activity className="w-5 h-5 text-emerald-500" /> System Monitoring</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 border rounded-lg">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">API Health</p>
              <div className="flex items-center text-sm font-semibold text-emerald-600"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span> Operational</div>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Database Sync</p>
              <div className="flex items-center text-sm font-semibold text-emerald-600"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span> Operational</div>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">AI Providers</p>
              <div className="flex items-center text-sm font-semibold text-emerald-600"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span> Operational</div>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Storage</p>
              <div className="flex items-center text-sm font-semibold text-gray-900 dark:text-white">42% Used (210GB)</div>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
