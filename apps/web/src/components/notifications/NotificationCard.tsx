import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, Trash2, Bell, Truck, Wallet, Leaf, CloudRain, ShieldAlert, Store, XCircle, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NotificationProps {
  notification: any;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export function NotificationCard({ notification, onMarkRead, onDelete }: NotificationProps) {
  
  // Dynamic Icon & Color mapping based on notification type/module
  const getIconAndColor = (type: string) => {
    switch(type) {
      case 'transport': return { icon: Truck, bg: 'bg-orange-100', text: 'text-orange-600' };
      case 'wallet':
      case 'payment': return { icon: Wallet, bg: 'bg-green-100', text: 'text-green-600' };
      case 'weather': return { icon: CloudRain, bg: 'bg-blue-100', text: 'text-blue-600' };
      case 'ai': return { icon: Leaf, bg: 'bg-emerald-100', text: 'text-emerald-600' };
      case 'marketplace':
      case 'order': return { icon: Store, bg: 'bg-indigo-100', text: 'text-indigo-600' };
      case 'security': return { icon: ShieldAlert, bg: 'bg-red-100', text: 'text-red-600' };
      default: return { icon: Bell, bg: 'bg-gray-100', text: 'text-gray-600' };
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-yellow-500';
    }
  };

  const { icon: Icon, bg, text } = getIconAndColor(notification.type);

  return (
    <Card className={`relative transition-all hover:shadow-md ${notification.isRead ? 'opacity-70 bg-gray-50 dark:bg-gray-900/50' : 'border-l-4 border-l-blue-500'}`}>
      <CardContent className="p-4 flex flex-col md:flex-row gap-4">
        
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className={`p-3 rounded-full ${bg} ${text}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 space-y-1">
          <div className="flex items-start justify-between">
            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              {notification.title}
              {!notification.isRead && <span className="flex w-2 h-2 rounded-full bg-blue-600" />}
            </h4>
            <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {notification.message}
          </p>

          <div className="flex items-center gap-3 pt-2">
            <Badge variant="secondary" className="text-[10px] uppercase font-semibold flex items-center gap-1.5 h-5 px-1.5 border border-gray-200 bg-transparent text-gray-700">
              <span className={`w-1.5 h-1.5 rounded-full ${getPriorityColor(notification.priority)}`} />
              {notification.priority}
            </Badge>
            <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
              {notification.type}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-row md:flex-col items-center justify-end gap-2 border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-800 pt-3 md:pt-0 md:pl-4">
          {!notification.isRead && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-blue-600 hover:bg-blue-50 hover:text-blue-700 w-full justify-start md:justify-center h-8 text-xs"
              onClick={() => onMarkRead(notification.id)}
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" /> Mark Read
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-red-500 hover:bg-red-50 hover:text-red-600 w-full justify-start md:justify-center h-8 text-xs"
            onClick={() => onDelete(notification.id)}
          >
            <Trash2 className="w-4 h-4 mr-1.5" /> Delete
          </Button>
        </div>

      </CardContent>
    </Card>
  );
}
