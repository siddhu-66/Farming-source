import { create } from 'zustand';
import { Notification } from '../types';
import { supabase } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  channel: RealtimeChannel | null;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  subscribe: (userId: string) => void;
  unsubscribe: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  channel: null,
  addNotification: (notif) => set((state) => {
    const newNotif: Notification = {
      ...notif,
      id: Math.random().toString(36).substring(7),
      read: false,
      createdAt: new Date().toISOString()
    };
    return {
      notifications: [newNotif, ...state.notifications],
      unreadCount: state.unreadCount + 1
    };
  }),
  markAsRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n),
    unreadCount: Math.max(0, state.unreadCount - 1)
  })),
  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, read: true })),
    unreadCount: 0
  })),
  clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
  subscribe: (userId: string) => {
    // Unsubscribe from existing channel if any
    get().unsubscribe();

    const channel = supabase.channel(`public:notifications:userId=eq.${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `userId=eq.${userId}` },
        (payload) => {
          const notif = payload.new as Notification;
          set((state) => ({
            notifications: [notif, ...state.notifications],
            unreadCount: state.unreadCount + 1
          }));
        }
      )
      .subscribe();

    set({ channel });
  },
  unsubscribe: () => {
    const { channel } = get();
    if (channel) {
      supabase.removeChannel(channel);
      set({ channel: null });
    }
  }
}));
