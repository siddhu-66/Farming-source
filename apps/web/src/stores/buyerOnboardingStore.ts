import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Warehouse {
  id: string;
  name: string;
  address: string;
  state: string;
  district: string;
  city: string;
  postalCode: string;
  capacityTons: number | '';
  coldStorage: boolean;
  latitude: number | null;
  longitude: number | null;
}

export interface VerificationDocument {
  docType: string;
  fileName: string;
  fileUrl: string; // Will store base64 temporarily or real URL
}

interface BuyerOnboardingState {
  currentStep: number;
  
  // Step 1: Business Information
  businessName: string;
  businessType: string;
  ownerName: string;
  contactPerson: string;
  mobile: string;
  email: string;
  registrationNumber: string;
  yearsInBusiness: number | '';
  website: string;

  // Step 2: Business Verification
  gstNumber: string;
  panNumber: string;
  tradeLicense: string;
  documents: VerificationDocument[];

  // Step 3: Warehouse Details
  warehouses: Warehouse[];

  // Step 4: Procurement Preferences
  categories: string[];
  dailyCapacity: number | '';
  monthlyCapacity: number | '';
  annualCapacity: number | '';
  preferredRadiusKm: number;
  procurementSchedule: string;

  // Step 5: Delivery & Billing
  deliveryAddress: string;
  deliveryCity: string;
  deliveryDistrict: string;
  deliveryState: string;
  deliveryPostalCode: string;
  sameAsDelivery: boolean;
  billingAddress: string;
  billingCity: string;
  billingDistrict: string;
  billingState: string;
  billingPostalCode: string;

  // Step 6: Payment Preferences
  paymentMethods: string[];
  paymentTerms: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  ifscCode: string;

  // Step 7: Notification Preferences (Optional/Default setup)
  notifyNewListings: boolean;
  notifyPriceDrops: boolean;
  notifyOrderUpdates: boolean;

  // Actions
  setStep: (step: number) => void;
  updateField: (field: keyof BuyerOnboardingState, value: any) => void;
  addWarehouse: (warehouse: Warehouse) => void;
  updateWarehouse: (id: string, updatedWarehouse: Partial<Warehouse>) => void;
  removeWarehouse: (id: string) => void;
  addDocument: (doc: VerificationDocument) => void;
  removeDocument: (docType: string) => void;
  toggleCategory: (category: string) => void;
  togglePaymentMethod: (method: string) => void;
  resetOnboarding: () => void;
}

const initialState = {
  currentStep: 1,
  
  businessName: '',
  businessType: '',
  ownerName: '',
  contactPerson: '',
  mobile: '',
  email: '',
  registrationNumber: '',
  yearsInBusiness: '' as number | '',
  website: '',

  gstNumber: '',
  panNumber: '',
  tradeLicense: '',
  documents: [],

  warehouses: [],

  categories: [],
  dailyCapacity: '' as number | '',
  monthlyCapacity: '' as number | '',
  annualCapacity: '' as number | '',
  preferredRadiusKm: 50,
  procurementSchedule: '',

  deliveryAddress: '',
  deliveryCity: '',
  deliveryDistrict: '',
  deliveryState: '',
  deliveryPostalCode: '',
  sameAsDelivery: true,
  billingAddress: '',
  billingCity: '',
  billingDistrict: '',
  billingState: '',
  billingPostalCode: '',

  paymentMethods: [],
  paymentTerms: '',
  bankName: '',
  accountHolder: '',
  accountNumber: '',
  ifscCode: '',

  notifyNewListings: true,
  notifyPriceDrops: true,
  notifyOrderUpdates: true,
};

export const useBuyerOnboardingStore = create<BuyerOnboardingState>()(
  persist(
    (set) => ({
      ...initialState,
      
      setStep: (step: number) => set({ currentStep: step }),
      
      updateField: (field, value) => set({ [field]: value }),
      
      addWarehouse: (warehouse) => set((state) => ({ warehouses: [...state.warehouses, warehouse] })),
      
      updateWarehouse: (id, updatedWarehouse) => set((state) => ({
        warehouses: state.warehouses.map((w) => (w.id === id ? { ...w, ...updatedWarehouse } : w))
      })),
      
      removeWarehouse: (id) => set((state) => ({
        warehouses: state.warehouses.filter((w) => w.id !== id)
      })),

      addDocument: (doc) => set((state) => ({
        documents: [...state.documents.filter(d => d.docType !== doc.docType), doc]
      })),

      removeDocument: (docType) => set((state) => ({
        documents: state.documents.filter(d => d.docType !== docType)
      })),

      toggleCategory: (category) => set((state) => ({
        categories: state.categories.includes(category) 
          ? state.categories.filter(c => c !== category)
          : [...state.categories, category]
      })),

      togglePaymentMethod: (method) => set((state) => ({
        paymentMethods: state.paymentMethods.includes(method)
          ? state.paymentMethods.filter(m => m !== method)
          : [...state.paymentMethods, method]
      })),
      
      resetOnboarding: () => set(initialState),
    }),
    {
      name: 'buyer-onboarding-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
