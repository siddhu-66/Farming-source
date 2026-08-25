import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';

// Simple debounce helper
const debounce = (fn: Function, ms = 500) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
};

const syncPreferences = debounce(async (widgets: WidgetConfig[]) => {
  try {
    await api.post('/dashboard/preferences', { widgets });
  } catch (error) {
    console.error('Failed to sync widget preferences', error);
  }
}, 1000);

export interface WidgetConfig {
  id: string;
  type: string;
  visible: boolean;
  order: number;
}

interface WidgetState {
  widgets: WidgetConfig[];
  setWidgetVisibility: (id: string, visible: boolean) => void;
  updateWidgetOrder: (widgets: WidgetConfig[]) => void;
  resetWidgets: () => void;
}

const defaultWidgets: WidgetConfig[] = [
  { id: 'analytics', type: 'analytics', visible: true, order: 0 },
  { id: 'activity', type: 'activity', visible: true, order: 1 },
  { id: 'tasks', type: 'tasks', visible: true, order: 2 },
  { id: 'orders', type: 'orders', visible: true, order: 3 },
  { id: 'marketplace', type: 'marketplace', visible: true, order: 4 },
  { id: 'government', type: 'government', visible: true, order: 5 },
  { id: 'voice', type: 'voice', visible: true, order: 6 },
];

export const useWidgetStore = create<WidgetState>()(
  persist(
    (set) => ({
      widgets: defaultWidgets,
      setWidgetVisibility: (id, visible) => {
        set((state) => {
          const newWidgets = state.widgets.map((w) =>
            w.id === id ? { ...w, visible } : w
          );
          syncPreferences(newWidgets);
          return { widgets: newWidgets };
        });
      },
      updateWidgetOrder: (widgets) => {
        // We don't auto-sync on initial hydration load, only when user reorders
        set({ widgets });
      },
      resetWidgets: () => set({ widgets: defaultWidgets }),
    }),
    {
      name: 'widget-storage',
    }
  )
);
