import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface IndustryWarehouse {
  id: string;
  warehouseName: string;
  address: string;
  capacityTons: number | '';
  coldStorage: boolean;
  temperatureControlled: boolean;
  latitude: number | null;
  longitude: number | null;
  isDefault: boolean;
}

export interface IndustryDocument {
  docType: string;
  fileUrl: string;
  fileName: string;
}

interface IndustryOnboardingState {
  currentStep: number;
  
  // Step 1: Company Information
  companyName: string;
  industryType: string;
  registrationNumber: string;
  gstNumber: string;
  panNumber: string;
  companyEmail: string;
  contactNumber: string;
  website: string;
  yearEstablished: number | '';

  // Step 2: Business Verification
  documents: IndustryDocument[];

  // Step 3: Factory Information
  factoryName: string;
  factoryAddress: string;
  state: string;
  district: string;
  city: string;
  postalCode: string;
  latitude: number | null;
  longitude: number | null;
  numberOfEmployees: number | '';
  workingShifts: string;

  // Step 4: Warehouse Setup
  warehouses: IndustryWarehouse[];

  // Step 5: Procurement Requirements
  rawMaterials: string[];
  minOrderQuantity: number | '';
  maxOrderQuantity: number | '';
  preferredQualityGrade: string;
  purchaseFrequency: string;

  // Step 6: Processing Capacity
  dailyCapacity: number | '';
  monthlyCapacity: number | '';
  annualCapacity: number | '';
  capacityUnit: string;
  operatingHours: string;
  logisticsPreference: string;
  loadingFacilities: string[];

  // Step 7: Finance & Payments
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  ifscCode: string;
  upiId: string;

  // Actions
  setStep: (step: number) => void;
  updateField: (field: keyof IndustryOnboardingState, value: any) => void;
  addDocument: (doc: IndustryDocument) => void;
  removeDocument: (docType: string) => void;
  addWarehouse: (warehouse: IndustryWarehouse) => void;
  updateWarehouse: (id: string, updatedWarehouse: Partial<IndustryWarehouse>) => void;
  removeWarehouse: (id: string) => void;
  setDefaultWarehouse: (id: string) => void;
  resetOnboarding: () => void;
}

const initialState = {
  currentStep: 1,
  
  companyName: '',
  industryType: '',
  registrationNumber: '',
  gstNumber: '',
  panNumber: '',
  companyEmail: '',
  contactNumber: '',
  website: '',
  yearEstablished: '' as number | '',

  documents: [],

  factoryName: '',
  factoryAddress: '',
  state: '',
  district: '',
  city: '',
  postalCode: '',
  latitude: null,
  longitude: null,
  numberOfEmployees: '' as number | '',
  workingShifts: '',

  warehouses: [],

  rawMaterials: [],
  minOrderQuantity: '' as number | '',
  maxOrderQuantity: '' as number | '',
  preferredQualityGrade: '',
  purchaseFrequency: 'Weekly',

  dailyCapacity: '' as number | '',
  monthlyCapacity: '' as number | '',
  annualCapacity: '' as number | '',
  capacityUnit: 'Tons',
  operatingHours: '24x7',
  logisticsPreference: 'Third-Party Transport',
  loadingFacilities: [],

  bankName: '',
  accountHolder: '',
  accountNumber: '',
  ifscCode: '',
  upiId: '',
};

export const useIndustryOnboardingStore = create<IndustryOnboardingState>()(
  persist(
    (set) => ({
      ...initialState,
      
      setStep: (step: number) => set({ currentStep: step }),
      
      updateField: (field, value) => set({ [field]: value }),

      addDocument: (doc) => set((state) => ({
        documents: [...state.documents.filter(d => d.docType !== doc.docType), doc]
      })),

      removeDocument: (docType) => set((state) => ({
        documents: state.documents.filter(d => d.docType !== docType)
      })),
      
      addWarehouse: (warehouse) => set((state) => ({ 
        warehouses: [...state.warehouses, warehouse] 
      })),
      
      updateWarehouse: (id, updatedWarehouse) => set((state) => ({
        warehouses: state.warehouses.map((w) => (w.id === id ? { ...w, ...updatedWarehouse } : w))
      })),
      
      removeWarehouse: (id) => set((state) => ({
        warehouses: state.warehouses.filter((w) => w.id !== id)
      })),

      setDefaultWarehouse: (id) => set((state) => ({
        warehouses: state.warehouses.map((w) => ({ ...w, isDefault: w.id === id }))
      })),
      
      resetOnboarding: () => set(initialState),
    }),
    {
      name: 'industry-onboarding-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
