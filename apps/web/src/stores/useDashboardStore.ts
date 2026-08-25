import { create } from 'zustand';

interface DashboardState {
  isInitializing: boolean;
  isReady: boolean;
  error: string | null;
  profile: any | null;
  permissions: any | null;
  preferences: any | null;
  notifications: any[];
  widgets: any[];
  statistics: any[];
  charts: any;
  tasks: any[];
  activity: any[];
  orders: any[];
  farmProfile: any | null;
  landSummary: any | null;
  currentSeason: any | null;
  externalData: any | null;
  socketInstance: { url: string; channel: string } | null;
  initialize: (token: string) => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  isInitializing: false,
  isReady: false,
  error: null,
  profile: null,
  permissions: null,
  preferences: null,
  notifications: [],
  widgets: [],
  statistics: [],
  charts: null,
  tasks: [],
  activity: [],
  orders: [],
  farmProfile: null,
  landSummary: null,
  currentSeason: null,
  externalData: null,
  socketInstance: null,

  initialize: async (token: string) => {
    set({ isInitializing: true, error: null });
    try {
      const response = await fetch('http://localhost:5000/api/v1/dashboard/bootstrap', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to bootstrap dashboard data');
      }

      const data = await response.json();
      const payload = data.data; // Since controller returns { success, data: { ... } }
      
      // Sync with widget store
      import('./widgetStore').then(({ useWidgetStore }) => {
        if (payload.widgets && Array.isArray(payload.widgets)) {
          useWidgetStore.getState().updateWidgetOrder(payload.widgets);
        }
      });

      set({
        isReady: true,
        isInitializing: false,
        profile: payload.profile || null,
        permissions: payload.permissions || null,
        preferences: payload.preferences || null,
        notifications: payload.notifications || [],
        widgets: payload.widgets || [],
        statistics: payload.statistics || [],
        charts: payload.charts || null,
        tasks: payload.tasks || [],
        activity: payload.activity || [],
        orders: payload.orders || [],
        farmProfile: payload.farmProfile || null,
        landSummary: payload.landSummary || null,
        currentSeason: payload.currentSeason || null,
        externalData: payload.external || null,
        socketInstance: payload.socket ? { url: payload.socket.url, channel: payload.socket.channel } : null,
      });
    } catch (err: any) {
      set({
        isReady: false,
        isInitializing: false,
        error: err.message || 'An error occurred during dashboard initialization',
      });
    }
  },
}));
