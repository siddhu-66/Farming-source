import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface OnboardingData {
  personal?: {
    firstName: string;
    lastName: string;
    displayName: string;
    dateOfBirth: string;
    gender?: string;
    alternateMobile?: string;
    preferredLanguage: string;
  };
  photo?: {
    avatarUrl?: string;
  };
  address?: {
    country: string;
    state: string;
    district: string;
    mandal?: string;
    village: string;
    streetAddress?: string;
    postalCode: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  preferences?: {
    smsAlerts: boolean;
    emailNotifications: boolean;
    pushNotifications: boolean;
    orderUpdates: boolean;
    marketingMessages: boolean;
    governmentSchemeAlerts: boolean;
  };
  personalization?: {
    theme: 'light' | 'dark' | 'system';
    widgets: string[];
  };
  aiAssistant?: {
    enabled: boolean;
    cropRecommendations: boolean;
    weatherSuggestions: boolean;
    pricePrediction: boolean;
  };
}

interface OnboardingState {
  currentStep: number;
  data: OnboardingData;
  setStep: (step: number) => void;
  updateData: (section: keyof OnboardingData, payload: any) => void;
  reset: () => void;
}

const initialState: OnboardingData = {
  preferences: {
    smsAlerts: true,
    emailNotifications: true,
    pushNotifications: true,
    orderUpdates: true,
    marketingMessages: false,
    governmentSchemeAlerts: true,
  },
  personalization: {
    theme: 'system',
    widgets: [],
  },
  aiAssistant: {
    enabled: true,
    cropRecommendations: true,
    weatherSuggestions: true,
    pricePrediction: true,
  }
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      currentStep: 1,
      data: initialState,
      setStep: (step) => set({ currentStep: step }),
      updateData: (section, payload) =>
        set((state) => ({
          data: {
            ...state.data,
            [section]: { ...state.data[section], ...payload },
          },
        })),
      reset: () => set({ currentStep: 1, data: initialState }),
    }),
    {
      name: 'onboarding-storage',
    }
  )
);
