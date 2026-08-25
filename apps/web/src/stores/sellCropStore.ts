import { create } from 'zustand';

export interface SellCropState {
  // Step 1
  cropCategory: string;
  cropName: string;
  cropVariety: string;
  harvestDate: string;
  organicCertified: boolean;
  irrigationType: string;
  description: string;
  // Step 2
  images: File[];
  imageUrls: string[];
  // Step 3
  qualityGrade: string;
  quantity: number | '';
  unit: string;
  moisture: number | '';
  packagingType: string;
  // Step 4
  sellingMode: string;
  pricePerUnit: number | '';
  minPrice: number | '';
  negotiable: boolean;
  // Step 5
  farmName: string;
  address: {
    village: string;
    district: string;
    state: string;
    pincode: string;
    coordinates?: { lat: number; lng: number };
  };
  pickupDate: string;
  transportPreference: string;
  
  // Actions
  updateField: (field: keyof SellCropState, value: any) => void;
  updateAddress: (field: keyof SellCropState['address'], value: any) => void;
  setImages: (files: File[], urls: string[]) => void;
  resetStore: () => void;
}

const initialState: Omit<SellCropState, 'updateField' | 'updateAddress' | 'setImages' | 'resetStore'> = {
  cropCategory: '',
  cropName: '',
  cropVariety: '',
  harvestDate: '',
  organicCertified: false,
  irrigationType: '',
  description: '',
  images: [],
  imageUrls: [],
  qualityGrade: '',
  quantity: '',
  unit: 'kg',
  moisture: '',
  packagingType: '',
  sellingMode: 'fixed',
  pricePerUnit: '',
  minPrice: '',
  negotiable: false,
  farmName: '',
  address: {
    village: '',
    district: '',
    state: '',
    pincode: '',
  },
  pickupDate: '',
  transportPreference: 'buyer',
};

export const useSellCropStore = create<SellCropState>((set) => ({
  ...initialState,
  updateField: (field, value) => set((state) => ({ ...state, [field]: value })),
  updateAddress: (field, value) => set((state) => ({ 
    ...state, 
    address: { ...state.address, [field]: value } 
  })),
  setImages: (files, urls) => set((state) => ({ ...state, images: files, imageUrls: urls })),
  resetStore: () => set(initialState),
}));
