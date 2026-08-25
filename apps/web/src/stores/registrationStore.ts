import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RegistrationData {
  role: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    country: string;
    state: string;
    district: string;
    villageCity: string;
  };
  account: {
    username: string;
    password: string;
  };
  profile: {
    profilePhoto: string;
    gender: string;
    dob: string;
    language: string;
    alternatePhone: string;
  };
  roleInformation: Record<string, any>;
}

interface RegistrationStore {
  step: number;
  data: RegistrationData;
  setStep: (step: number) => void;
  updateData: (section: keyof RegistrationData, payload: any) => void;
  setRole: (role: string) => void;
  reset: () => void;
}

const initialState: RegistrationData = {
  role: '',
  personalInfo: {
    firstName: '', lastName: '', phone: '', email: '',
    country: '', state: '', district: '', villageCity: ''
  },
  account: { username: '', password: '' },
  profile: { profilePhoto: '', gender: '', dob: '', language: '', alternatePhone: '' },
  roleInformation: {}
};

export const useRegistrationStore = create<RegistrationStore>()(
  persist(
    (set) => ({
      step: 1,
      data: initialState,
      setStep: (step) => set({ step }),
      setRole: (role) => set((state) => ({ data: { ...state.data, role } })),
      updateData: (section, payload) => 
        set((state) => ({
          data: {
            ...state.data,
            [section]: { ...(state.data[section as keyof RegistrationData] as any), ...payload }
          }
        })),
      reset: () => set({ step: 1, data: initialState }),
    }),
    {
      name: 'registration-draft',
      partialize: (state) => ({ data: state.data, step: state.step })
    }
  )
);
