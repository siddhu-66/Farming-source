import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useDashboardStore } from '@/stores/useDashboardStore';
import toast from 'react-hot-toast';

export const useSocket = () => {
  const { socketInstance } = useDashboardStore();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!socketInstance?.url || !socketInstance?.channel) return;

    // Initialize socket connection
    const socket = io(socketInstance.url, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected');
      // Join role-specific or user-specific channel
      socket.emit('join', socketInstance.channel);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected, attempting to reconnect...');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Handle generic dashboard updates (e.g. stats refresh)
    socket.on('dashboard:update', (data) => {
      console.log('Dashboard update received', data);
      // In a real app, dispatch to Zustand store
      // useDashboardStore.setState({ statistics: data.statistics });
    });

    // Handle specific widget updates (e.g. new order)
    socket.on('widget:update', (data) => {
      console.log('Widget update received', data);
      if (data.type === 'order') {
        toast.success(`New order received: ${data.target}`);
      }
    });
    
    // Handle new notifications
    socket.on('notification:new', (notification) => {
      toast(notification.message, { icon: '🔔' });
      // Add to store
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
  }, [socketInstance]);

  return socketRef.current;
};
