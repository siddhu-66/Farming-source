import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Crop {
  id: string; // local id for tracking in store
  category: string;
  name: string;
  variety?: string;
  season: string;
  cultivatedArea: number | '';
  expectedHarvestDate: string;
  estimatedYield?: number | '';
}

export interface Equipment {
  id: string;
  name: string;
  make?: string;
  model?: string;
  year?: number | '';
  workingCondition?: string;
}

interface FarmerOnboardingState {
  currentStep: number;
  
  // Step 1: Farm Info
  farmName: string;
  farmerType: string;
  totalArea: number | '';
  areaUnit: string;
  numberOfFields: number | '';
  yearsOfExperience: number | '';
  organicCertified: boolean;
  certificationNumber: string;

  // Step 2: Farm Location
  state: string;
  district: string;
  mandal: string;
  village: string;
  farmAddress: string;
  latitude: number | null;
  longitude: number | null;

  // Step 3: Crops
  crops: Crop[];

  // Step 4: Irrigation
  irrigationType: string;
  waterSource: string;
  irrigationFrequency: string;
  waterAvailability: string;

  // Step 5: Equipment
  equipment: Equipment[];

  // Step 6: Storage & Livestock
  storageType: string[];
  livestock: string[];

  // Step 7: Government Schemes
  pmKisanBeneficiary: boolean;
  soilHealthCard: boolean;
  cropInsurance: boolean;
  kisanCreditCard: boolean;
  fpoMember: boolean;

  // Actions
  setStep: (step: number) => void;
  updateField: (field: keyof FarmerOnboardingState, value: any) => void;
  addCrop: (crop: Crop) => void;
  updateCrop: (id: string, updatedCrop: Partial<Crop>) => void;
  removeCrop: (id: string) => void;
  addEquipment: (equip: Equipment) => void;
  updateEquipment: (id: string, updatedEquip: Partial<Equipment>) => void;
  removeEquipment: (id: string) => void;
  resetOnboarding: () => void;
}

const initialState = {
  currentStep: 1,
  
  farmName: '',
  farmerType: '',
  totalArea: '' as number | '',
  areaUnit: 'Acres',
  numberOfFields: '' as number | '',
  yearsOfExperience: '' as number | '',
  organicCertified: false,
  certificationNumber: '',

  state: '',
  district: '',
  mandal: '',
  village: '',
  farmAddress: '',
  latitude: null,
  longitude: null,

  crops: [],

  irrigationType: '',
  waterSource: '',
  irrigationFrequency: '',
  waterAvailability: '',

  equipment: [],

  storageType: [],
  livestock: [],

  pmKisanBeneficiary: false,
  soilHealthCard: false,
  cropInsurance: false,
  kisanCreditCard: false,
  fpoMember: false,
};

export const useFarmerOnboardingStore = create<FarmerOnboardingState>()(
  persist(
    (set) => ({
      ...initialState,
      
      setStep: (step: number) => set({ currentStep: step }),
      
      updateField: (field, value) => set({ [field]: value }),
      
      addCrop: (crop) => set((state) => ({ crops: [...state.crops, crop] })),
      
      updateCrop: (id, updatedCrop) => set((state) => ({
        crops: state.crops.map((c) => (c.id === id ? { ...c, ...updatedCrop } : c))
      })),
      
      removeCrop: (id) => set((state) => ({
        crops: state.crops.filter((c) => c.id !== id)
      })),

      addEquipment: (equip) => set((state) => ({ equipment: [...state.equipment, equip] })),
      
      updateEquipment: (id, updatedEquip) => set((state) => ({
        equipment: state.equipment.map((e) => (e.id === id ? { ...e, ...updatedEquip } : e))
      })),
      
      removeEquipment: (id) => set((state) => ({
        equipment: state.equipment.filter((e) => e.id !== id)
      })),
      
      resetOnboarding: () => set(initialState),
    }),
    {
      name: 'farmer-onboarding-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
