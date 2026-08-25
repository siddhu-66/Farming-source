import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AdminOnboardingState {
  currentStep: number;
  
  // Step 1: Admin Profile
  fullName: string;
  employeeId: string;
  designation: string;
  department: string;
  officialEmail: string;
  phone: string;
  profilePhotoUrl: string;

  // Step 2: Security Configuration (Some fields are sensitive and shouldn't persist)
  mfaMethod: string;
  recoveryEmail: string;
  recoveryMobile: string;
  sessionTimeoutMinutes: number;
  rememberBrowser: boolean;
  // Sensitive/transient fields
  mfaSetupCode: string; // User's typed setup code
  mfaSecret: string; // The generated secret (mocked)

  // Step 3: Workspace Preferences
  theme: string;
  dashboardLayout: string;
  defaultLandingPage: string;

  // Step 4: Notifications
  newUserRegistrations: boolean;
  reportedContent: boolean;
  failedVerifications: boolean;
  securityEvents: boolean;
  platformErrors: boolean;
  serverHealth: boolean;
  schemeUpdates: boolean;
  systemAnnouncements: boolean;

  // Actions
  setStep: (step: number) => void;
  updateField: (field: keyof AdminOnboardingState, value: any) => void;
  resetOnboarding: () => void;
}

const initialState = {
  currentStep: 1,
  
  fullName: '',
  employeeId: '',
  designation: '',
  department: '',
  officialEmail: '',
  phone: '',
  profilePhotoUrl: '',

  mfaMethod: 'NONE',
  recoveryEmail: '',
  recoveryMobile: '',
  sessionTimeoutMinutes: 30,
  rememberBrowser: false,
  mfaSetupCode: '',
  mfaSecret: '',

  theme: 'System',
  dashboardLayout: 'Analytics Focus',
  defaultLandingPage: 'Dashboard',

  newUserRegistrations: true,
  reportedContent: true,
  failedVerifications: true,
  securityEvents: true,
  platformErrors: true,
  serverHealth: true,
  schemeUpdates: false,
  systemAnnouncements: true,
};

export const useAdminOnboardingStore = create<AdminOnboardingState>()(
  persist(
    (set) => ({
      ...initialState,
      
      setStep: (step: number) => set({ currentStep: step }),
      updateField: (field, value) => set({ [field]: value }),
      resetOnboarding: () => set(initialState),
    }),
    {
      name: 'admin-onboarding-storage',
      storage: createJSONStorage(() => localStorage),
      // Partialize to omit sensitive fields from local storage
      partialize: (state) => Object.fromEntries(
        Object.entries(state).filter(([key]) => !['mfaSetupCode', 'mfaSecret'].includes(key))
      ),
    }
  )
);
