import { create } from 'zustand';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface ProfileState {
  profile: any;
  farms: any[];
  assets: any[];
  workers: any[];
  isLoading: boolean;
  isSaving: boolean;
  fetchProfile: () => Promise<void>;
  fetchFarms: () => Promise<void>;
  fetchAssets: () => Promise<void>;
  fetchWorkers: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  calculateCompletion: (profile: any, farms: any[]) => void;
  completionPercentage: number;
}

export const useFarmerProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  farms: [],
  assets: [],
  workers: [],
  isLoading: true,
  isSaving: false,
  completionPercentage: 0,

  fetchProfile: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/farmer/profile');
      if (res.data?.success) {
        const profile = res.data.data.profile;
        set({ profile });
        get().calculateCompletion(profile, get().farms);
      }
    } catch (err) {
      toast.error('Failed to load profile');
    } finally {
      set({ isLoading: false });
    }
  },

  fetchFarms: async () => {
    try {
      const res = await api.get('/farmer/farms');
      if (res.data?.success) {
        const farms = res.data.data.farms;
        set({ farms });
        get().calculateCompletion(get().profile, farms);
      }
    } catch (err) {
      toast.error('Failed to load farms');
    }
  },

  fetchAssets: async () => {
    try {
      const res = await api.get('/farmer/assets');
      if (res.data?.success) {
        set({ assets: res.data.data });
      }
    } catch (err) {
      toast.error('Failed to load assets');
    }
  },

  fetchWorkers: async () => {
    try {
      const res = await api.get('/farmer/workers');
      if (res.data?.success) {
        set({ workers: res.data.data });
      }
    } catch (err) {
      toast.error('Failed to load workers');
    }
  },

  updateProfile: async (data: any) => {
    set({ isSaving: true });
    try {
      const res = await api.put('/farmer/profile', data);
      if (res.data?.success) {
        toast.success('Profile updated successfully');
        await get().fetchProfile();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
      throw err;
    } finally {
      set({ isSaving: false });
    }
  },

  calculateCompletion: (profile: any, farms: any[]) => {
    if (!profile) return;
    
    let score = 0;
    const totalFields = 8;
    
    // Check personal info
    if (profile.fullName) score += 1;
    if (profile.dateOfBirth) score += 1;
    if (profile.aadhaarNumber) score += 1;
    if (profile.panNumber) score += 1;
    
    // Check contact info
    if (profile.phone) score += 1;
    if (profile.emergencyContactName) score += 1;
    
    // Check address
    if (profile.addresses && profile.addresses.length > 0) score += 1;
    
    // Check farms
    if (farms && farms.length > 0) score += 1;
    
    set({ completionPercentage: Math.round((score / totalFields) * 100) });
  }
}));
