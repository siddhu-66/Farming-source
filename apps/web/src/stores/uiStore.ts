import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UiState {
  sidebarExpanded: boolean;
  mobileSidebarOpen: boolean;
  searchOpen: boolean;
  notificationsOpen: boolean;
  messagesOpen: boolean;
  calendarOpen: boolean;
  aiAssistantOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  language: string;

  toggleSidebar: () => void;
  setSidebarExpanded: (expanded: boolean) => void;
  setMobileSidebarOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setNotificationsOpen: (open: boolean) => void;
  setMessagesOpen: (open: boolean) => void;
  setCalendarOpen: (open: boolean) => void;
  setAiAssistantOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLanguage: (lang: string) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarExpanded: true,
      mobileSidebarOpen: false,
      searchOpen: false,
      notificationsOpen: false,
      messagesOpen: false,
      calendarOpen: false,
      aiAssistantOpen: false,
      theme: 'system',
      language: 'en',

      toggleSidebar: () => set((state) => ({ sidebarExpanded: !state.sidebarExpanded })),
      setSidebarExpanded: (expanded) => set({ sidebarExpanded: expanded }),
      setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
      setSearchOpen: (open) => set({ searchOpen: open }),
      setNotificationsOpen: (open) => set({ notificationsOpen: open }),
      setMessagesOpen: (open) => set({ messagesOpen: open }),
      setCalendarOpen: (open) => set({ calendarOpen: open }),
      setAiAssistantOpen: (open) => set({ aiAssistantOpen: open }),
      setTheme: (theme) => set({ theme }),
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: 'agriassist-ui-storage',
      partialize: (state) => ({ theme: state.theme, language: state.language, sidebarExpanded: state.sidebarExpanded }), // Only persist theme, language and sidebar state
    }
  )
);
