import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useDashboardStore } from '@/stores/useDashboardStore';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';

export const useSocket = () => {
  const { socketInstance } = useDashboardStore();
  const token = useAuthStore((state) => state.token);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!socketInstance?.url || !socketInstance?.channel) return;

    const socket = io(socketInstance.url, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: { token },
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join_room', socketInstance.channel);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected, attempting to reconnect...');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    socket.on('dashboard:update', (data) => {
      console.log('Dashboard update received', data);
    });

    socket.on('widget:update', (data) => {
      if (data.type === 'order') {
        toast.success(`New order received: ${data.target}`);
      }
    });

    socket.on('notification:new', (notification) => {
      toast(notification.message, { icon: '🔔' });
      const current = useDashboardStore.getState().notifications;
      useDashboardStore.setState({ notifications: [notification, ...current] });
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('dashboard:update');
      socket.off('widget:update');
      socket.off('notification:new');
      socket.disconnect();
    };
  }, [socketInstance, token]);

  return socketRef.current;
};
