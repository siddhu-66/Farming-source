'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { AlertCircle, TrendingDown, TrendingUp, CloudRain, Bell } from 'lucide-react';

interface Alert {
  id: string;
  type: 'warning' | 'info' | 'success' | 'error';
  message: string;
  date: string;
}

export default function KPIAlerts({ alerts }: { alerts: Alert[] }) {
  
  const getIcon = (type: string, message: string) => {
    if (message.toLowerCase().includes('weather')) return <CloudRain className="w-5 h-5 text-blue-500" />;
    if (message.toLowerCase().includes('drop')) return <TrendingDown className="w-5 h-5 text-red-500" />;
    if (message.toLowerCase().includes('exceed')) return <TrendingUp className="w-5 h-5 text-green-500" />;
    return <AlertCircle className="w-5 h-5 text-orange-500" />;
  };

  const getBgClass = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-orange-50 border-orange-100 dark:bg-orange-900/10 dark:border-orange-900/30';
      case 'info': return 'bg-blue-50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/30';
      case 'success': return 'bg-green-50 border-green-100 dark:bg-green-900/10 dark:border-green-900/30';
      case 'error': return 'bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900/30';
      default: return 'bg-gray-50 border-gray-100 dark:bg-gray-800 dark:border-gray-700';
    }
  };

  return (
    <Card className="border-gray-200 dark:border-gray-800">
      <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" /> Active Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        {alerts.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No active alerts.</p>
        ) : (
          alerts.map(alert => (
            <div key={alert.id} className={`flex items-start gap-3 p-3 rounded-lg border ${getBgClass(alert.type)}`}>
              <div className="mt-0.5 shrink-0">
                {getIcon(alert.type, alert.message)}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-snug">{alert.message}</p>
                <p className="text-xs text-gray-500 mt-1">{new Date(alert.date).toLocaleDateString()}</p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
