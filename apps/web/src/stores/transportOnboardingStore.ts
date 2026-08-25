import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface TransportVehicle {
  id: string;
  vehicleNumber: string;
  vehicleType: string;
  brand: string;
  model: string;
  manufacturingYear: number | '';
  loadCapacity: number | '';
  capacityUnit: string;
  fuelType: string;
  isPrimary: boolean;
}

export interface VehicleDocument {
  vehicleId: string;
  docType: string;
  fileName: string;
  fileUrl: string;
}

interface TransportOnboardingState {
  currentStep: number;
  
  // Step 1: Company Information
  companyName: string;
  transportType: string;
  ownerName: string;
  contactNumber: string;
  email: string;
  gstNumber: string;
  officeAddress: string;
  yearsExperience: number | '';

  // Step 2: Driver Information
  driverName: string;
  dob: string;
  gender: string;
  driverMobile: string;
  aadhaarNumber: string;
  licenseNumber: string;
  licenseExpiry: string;
  driverExperience: number | '';
  driverDocuments: { docType: string; fileUrl: string; fileName: string }[];

  // Step 3: Vehicle Registration
  vehicles: TransportVehicle[];

  // Step 4: Vehicle Documents
  vehicleDocuments: VehicleDocument[];

  // Step 5: Service Area
  selectionMethod: string;
  serviceStates: string[];
  serviceDistricts: string[];
  radiusKm: number | '';
  latitude: number | null;
  longitude: number | null;
  gpsSetting: string;

  // Step 6: Pricing & Availability
  pricingModel: string;
  basePrice: number | '';
  pricePerKm: number | '';
  pricePerTon: number | '';
  minimumCharge: number | '';
  waitingCharge: number | '';
  loadingCharge: number | '';
  unloadingCharge: number | '';
  availabilitySchedule: string;

  // Step 7: Bank Details
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  ifscCode: string;
  upiId: string;

  // Actions
  setStep: (step: number) => void;
  updateField: (field: keyof TransportOnboardingState, value: any) => void;
  addVehicle: (vehicle: TransportVehicle) => void;
  updateVehicle: (id: string, updatedVehicle: Partial<TransportVehicle>) => void;
  removeVehicle: (id: string) => void;
  setPrimaryVehicle: (id: string) => void;
  addVehicleDocument: (doc: VehicleDocument) => void;
  removeVehicleDocument: (vehicleId: string, docType: string) => void;
  resetOnboarding: () => void;
}

const initialState = {
  currentStep: 1,
  
  companyName: '',
  transportType: '',
  ownerName: '',
  contactNumber: '',
  email: '',
  gstNumber: '',
  officeAddress: '',
  yearsExperience: '' as number | '',

  driverName: '',
  dob: '',
  gender: '',
  driverMobile: '',
  aadhaarNumber: '',
  licenseNumber: '',
  licenseExpiry: '',
  driverExperience: '' as number | '',
  driverDocuments: [],

  vehicles: [],
  vehicleDocuments: [],

  selectionMethod: 'states',
  serviceStates: [],
  serviceDistricts: [],
  radiusKm: '' as number | '',
  latitude: null,
  longitude: null,
  gpsSetting: 'share_live',

  pricingModel: 'per_km',
  basePrice: '' as number | '',
  pricePerKm: '' as number | '',
  pricePerTon: '' as number | '',
  minimumCharge: '' as number | '',
  waitingCharge: '' as number | '',
  loadingCharge: '' as number | '',
  unloadingCharge: '' as number | '',
  availabilitySchedule: 'monday_sunday',

  bankName: '',
  accountHolder: '',
  accountNumber: '',
  ifscCode: '',
  upiId: '',
};

export const useTransportOnboardingStore = create<TransportOnboardingState>()(
  persist(
    (set) => ({
      ...initialState,
      
      setStep: (step: number) => set({ currentStep: step }),
      
      updateField: (field, value) => set({ [field]: value }),
      
      addVehicle: (vehicle) => set((state) => ({ 
        vehicles: [...state.vehicles, vehicle] 
      })),
      
      updateVehicle: (id, updatedVehicle) => set((state) => ({
        vehicles: state.vehicles.map((v) => (v.id === id ? { ...v, ...updatedVehicle } : v))
      })),
      
      removeVehicle: (id) => set((state) => ({
        vehicles: state.vehicles.filter((v) => v.id !== id),
        vehicleDocuments: state.vehicleDocuments.filter((d) => d.vehicleId !== id)
      })),

      setPrimaryVehicle: (id) => set((state) => ({
        vehicles: state.vehicles.map((v) => ({ ...v, isPrimary: v.id === id }))
      })),

      addVehicleDocument: (doc) => set((state) => ({
        vehicleDocuments: [
          ...state.vehicleDocuments.filter(d => !(d.vehicleId === doc.vehicleId && d.docType === doc.docType)), 
          doc
        ]
      })),

      removeVehicleDocument: (vehicleId, docType) => set((state) => ({
        vehicleDocuments: state.vehicleDocuments.filter(d => !(d.vehicleId === vehicleId && d.docType === docType))
      })),
      
      resetOnboarding: () => set(initialState),
    }),
    {
      name: 'transport-onboarding-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
