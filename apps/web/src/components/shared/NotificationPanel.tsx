import React from 'react';
import { useNotifications } from '@/hooks/useNotifications';

export function NotificationPanel() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div className="w-80">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
        <h3 className="text-sm font-semibold">Notifications ({unreadCount})</h3>
        <button
          onClick={markAllAsRead}
          className="text-xs text-primary hover:underline"
        >
          Mark all as read
        </button>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => markAsRead(notif.id)}
              className={`cursor-pointer border-b border-gray-100 px-4 py-3 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 ${!notif.read ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
            >
              <p className="text-sm font-medium">{notif.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{notif.message}</p>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-sm text-gray-500">No new notifications</div>
        )}
      </div>
    </div>
  );
}
