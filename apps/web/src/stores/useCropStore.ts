import { create } from 'zustand';
import api from '@/lib/api';
import { Crop, YieldPrediction, IrrigationPlan, FertilizerPlan, CropAnalytics } from '@/types/crop';
import toast from 'react-hot-toast';

interface CropStore {
  crops: Crop[];
  selectedCrop: Crop | null;
  yieldPrediction: YieldPrediction | null;
  irrigationPlan: IrrigationPlan | null;
  fertilizerSchedule: FertilizerPlan[] | null;
  analytics: CropAnalytics | null;
  isLoading: boolean;
  isSaving: boolean;
  
  fetchCrops: () => Promise<void>;
  fetchCropDetails: (id: string) => Promise<void>;
  registerCrop: (data: Partial<Crop>) => Promise<string | undefined>;
  updateCrop: (id: string, data: Partial<Crop>) => Promise<void>;
  deleteCrop: (id: string) => Promise<void>;
  addActivity: (id: string, data: any) => Promise<void>;
  uploadPhoto: (id: string, fileUrl: string, imageType: string) => Promise<void>;
  
  fetchYieldPrediction: (id: string) => Promise<void>;
  fetchIrrigationPlan: (id: string) => Promise<void>;
  fetchFertilizerSchedule: (id: string) => Promise<void>;
  fetchAnalytics: (id: string) => Promise<void>;
}

export const useCropStore = create<CropStore>((set, get) => ({
  crops: [],
  selectedCrop: null,
  yieldPrediction: null,
  irrigationPlan: null,
  fertilizerSchedule: null,
  analytics: null,
  isLoading: false,
  isSaving: false,

  fetchCrops: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/farmer/crops');
      if (res.data?.success) {
        set({ crops: res.data.data });
      }
    } catch (error) {
      toast.error('Failed to load crops');
      console.error(error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchCropDetails: async (id: string) => {
    set({ isLoading: true });
    try {
      const res = await api.get(`/farmer/crops/${id}`);
      if (res.data?.success) {
        set({ selectedCrop: res.data.data });
      }
    } catch (error) {
      toast.error('Failed to load crop details');
      console.error(error);
    } finally {
      set({ isLoading: false });
    }
  },

  registerCrop: async (data: Partial<Crop>) => {
    set({ isSaving: true });
    try {
      const res = await api.post('/farmer/crops', data);
      if (res.data?.success) {
        toast.success('Crop registered successfully!');
        get().fetchCrops();
        return res.data.data.id;
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to register crop');
      throw error;
    } finally {
      set({ isSaving: false });
    }
  },

  updateCrop: async (id: string, data: Partial<Crop>) => {
    set({ isSaving: true });
    try {
      const res = await api.put(`/farmer/crops/${id}`, data);
      if (res.data?.success) {
        toast.success('Crop updated');
        if (get().selectedCrop?.id === id) {
          get().fetchCropDetails(id);
        }
        get().fetchCrops();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update crop');
    } finally {
      set({ isSaving: false });
    }
  },

  deleteCrop: async (id: string) => {
    try {
      const res = await api.delete(`/farmer/crops/${id}`);
      if (res.data?.success) {
        toast.success('Crop deleted');
        set(state => ({ crops: state.crops.filter(c => c.id !== id) }));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete crop');
    }
  },

  addActivity: async (id: string, data: any) => {
    set({ isSaving: true });
    try {
      const res = await api.post(`/farmer/crops/${id}/activities`, data);
      if (res.data?.success) {
        toast.success('Activity added');
        get().fetchCropDetails(id);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add activity');
    } finally {
      set({ isSaving: false });
    }
  },

  uploadPhoto: async (id: string, fileUrl: string, imageType: string) => {
    set({ isSaving: true });
    try {
      const res = await api.post(`/farmer/crops/${id}/photos`, { imageUrl: fileUrl, imageType });
      if (res.data?.success) {
        toast.success('Photo uploaded successfully');
        
        // Show AI Analysis result if available
        const analysis = res.data.data?.analysis_result;
        if (analysis?.status === 'Disease Detected') {
          toast.error(`AI Alert: ${analysis.disease} detected. ${analysis.recommendation}`, { duration: 6000 });
        } else if (analysis?.status === 'Healthy') {
          toast.success('AI Analysis: Crop looks healthy!');
        }

        get().fetchCropDetails(id);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload photo');
    } finally {
      set({ isSaving: false });
    }
  },

  fetchYieldPrediction: async (id: string) => {
    try {
      const res = await api.get(`/farmer/crops/${id}/yield`);
      if (res.data?.success) set({ yieldPrediction: res.data.data });
    } catch (error) { console.error(error); }
  },

  fetchIrrigationPlan: async (id: string) => {
    try {
      const res = await api.get(`/farmer/crops/${id}/irrigation`);
      if (res.data?.success) set({ irrigationPlan: res.data.data });
    } catch (error) { console.error(error); }
  },

  fetchFertilizerSchedule: async (id: string) => {
    try {
      const res = await api.get(`/farmer/crops/${id}/fertilizer`);
      if (res.data?.success) set({ fertilizerSchedule: res.data.data });
    } catch (error) { console.error(error); }
  },

  fetchAnalytics: async (id: string) => {
    try {
      const res = await api.get(`/farmer/crops/${id}/analytics`);
      if (res.data?.success) set({ analytics: res.data.data });
    } catch (error) { console.error(error); }
  }
}));
