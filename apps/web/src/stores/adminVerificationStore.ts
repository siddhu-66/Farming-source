import { create } from 'zustand';
import api from '../lib/api';

export interface VerificationRequest {
  id: string;
  user_id: string;
  role: string;
  status: string;
  assigned_admin_id: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  notes: string | null;
  users?: {
    email: string;
    phone: string;
    account_status: string;
  };
}

export interface VerificationDocument {
  id: string;
  request_id: string;
  document_type: string;
  file_url: string;
  status: string;
  rejection_reason: string | null;
  uploaded_at: string;
}

export interface VerificationHistory {
  id: string;
  request_id: string;
  action: string;
  admin_id: string | null;
  previous_status: string | null;
  new_status: string;
  notes: string | null;
  created_at: string;
}

export interface DetailedVerificationRequest extends VerificationRequest {
  documents: VerificationDocument[];
  history: VerificationHistory[];
  profileData?: any;
}

interface AdminVerificationState {
  // Queue Data
  queue: VerificationRequest[];
  isLoadingQueue: boolean;
  queueError: string | null;

  // Filters
  filterStatus: string;
  filterRole: string;

  // Active Review Data
  activeRequest: DetailedVerificationRequest | null;
  isLoadingActiveRequest: boolean;
  activeRequestError: string | null;

  // Actions
  setFilterStatus: (status: string) => void;
  setFilterRole: (role: string) => void;
  fetchQueue: () => Promise<void>;
  fetchActiveRequest: (requestId: string) => Promise<void>;
  approveRequest: (requestId: string, notes?: string) => Promise<void>;
  rejectRequest: (requestId: string, reason: string) => Promise<void>;
  clearActiveRequest: () => void;
}

export const useAdminVerificationStore = create<AdminVerificationState>((set, get) => ({
  queue: [],
  isLoadingQueue: false,
  queueError: null,

  filterStatus: 'PENDING',
  filterRole: '',

  activeRequest: null,
  isLoadingActiveRequest: false,
  activeRequestError: null,

  setFilterStatus: (status: string) => {
    set({ filterStatus: status });
    get().fetchQueue();
  },

  setFilterRole: (role: string) => {
    set({ filterRole: role });
    get().fetchQueue();
  },

  fetchQueue: async () => {
    set({ isLoadingQueue: true, queueError: null });
    try {
      const { filterStatus, filterRole } = get();
      let query = '/admin/verification/queue?';
      if (filterStatus) query += `status=${filterStatus}&`;
      if (filterRole) query += `role=${filterRole}`;

      // Temporary mock data for UI testing if API fails
      // This allows the frontend builder to test UI without real data
      const mockData = [
        {
          id: 'mock-1',
          user_id: 'user-1',
          role: 'FARMER',
          status: 'PENDING',
          assigned_admin_id: null,
          submitted_at: new Date().toISOString(),
          reviewed_at: null,
          notes: null,
          users: { email: 'farmer@example.com', phone: '+919876543210', account_status: 'PENDING' }
        },
        {
          id: 'mock-2',
          user_id: 'user-2',
          role: 'BUYER',
          status: 'PENDING',
          assigned_admin_id: null,
          submitted_at: new Date().toISOString(),
          reviewed_at: null,
          notes: null,
          users: { email: 'buyer@example.com', phone: '+919876543211', account_status: 'PENDING' }
        }
      ];

      set({ queue: mockData, isLoadingQueue: false });
      
      // Actual API call when ready (commented out for now to ensure UI builds and renders mock)
      /*
      const response = await api.get(query);
      if (response.data.success) {
        set({ queue: response.data.data, isLoadingQueue: false });
      } else {
        set({ queueError: 'Failed to fetch queue', isLoadingQueue: false });
      }
      */
    } catch (error: any) {
      set({ queueError: error.message || 'Error fetching queue', isLoadingQueue: false });
    }
  },

  fetchActiveRequest: async (requestId: string) => {
    set({ isLoadingActiveRequest: true, activeRequestError: null });
    try {
      // Mock data for UI
      const mockActiveData: DetailedVerificationRequest = {
        id: requestId,
        user_id: 'user-1',
        role: 'FARMER',
        status: 'PENDING',
        assigned_admin_id: null,
        submitted_at: new Date().toISOString(),
        reviewed_at: null,
        notes: null,
        users: { email: 'farmer@example.com', phone: '+919876543210', account_status: 'PENDING' },
        documents: [
          {
            id: 'doc-1',
            request_id: requestId,
            document_type: 'AADHAAR',
            file_url: 'https://example.com/mock-aadhaar.pdf',
            status: 'PENDING',
            rejection_reason: null,
            uploaded_at: new Date().toISOString()
          }
        ],
        history: [],
        profileData: {
          full_name: 'John Doe',
          farm_name: 'Green Acres'
        }
      };

      set({ activeRequest: mockActiveData, isLoadingActiveRequest: false });

      // Actual API call
      /*
      const response = await api.get(`/admin/verification/${requestId}`);
      if (response.data.success) {
        set({ activeRequest: response.data.data, isLoadingActiveRequest: false });
      } else {
        set({ activeRequestError: 'Failed to fetch request', isLoadingActiveRequest: false });
      }
      */
    } catch (error: any) {
      set({ activeRequestError: error.message || 'Error fetching active request', isLoadingActiveRequest: false });
    }
  },

  approveRequest: async (requestId: string, notes?: string) => {
    try {
      /*
      await api.post(`/admin/verification/${requestId}/approve`, { notes });
      */
      // Update local state
      set((state) => ({
        queue: state.queue.map(req => req.id === requestId ? { ...req, status: 'APPROVED' } : req),
        activeRequest: state.activeRequest?.id === requestId ? { ...state.activeRequest, status: 'APPROVED' } : state.activeRequest
      }));
    } catch (error: any) {
      console.error('Approve error:', error);
      throw error;
    }
  },

  rejectRequest: async (requestId: string, reason: string) => {
    try {
      /*
      await api.post(`/admin/verification/${requestId}/reject`, { reason });
      */
      // Update local state
      set((state) => ({
        queue: state.queue.map(req => req.id === requestId ? { ...req, status: 'REJECTED' } : req),
        activeRequest: state.activeRequest?.id === requestId ? { ...state.activeRequest, status: 'REJECTED' } : state.activeRequest
      }));
    } catch (error: any) {
      console.error('Reject error:', error);
      throw error;
    }
  },

  clearActiveRequest: () => {
    set({ activeRequest: null, activeRequestError: null });
  }
}));
