import { create } from 'zustand';
import apiClient from '@/lib/axios';
import type { 
  DealState, 
  DealsResponse, 
  CreateDealRequest, 
  UpdateDealRequest,
  DealFilters,
  Deal,
  DealStatus,
  PipelineValueResponse
} from '@/types';

export const useDealStore = create<DealState>((set, get) => ({
  deals: [],
  currentDeal: null,
  filters: {
    limit: 20,
    offset: 0,
  },
  isLoading: false,
  error: null,
  pipelineValues: {},
  pagination: {
    total: 0,
    limit: 20,
    offset: 0,
  },

  fetchDeals: async (filters?: DealFilters) => {
    set({ isLoading: true, error: null });
    
    const currentFilters = filters ? { ...get().filters, ...filters } : get().filters;
    set({ filters: currentFilters });


    try {
      const response = await apiClient.get<DealsResponse>('/deals', {
        params: currentFilters,
      });
      set({
        deals: response.data.deals,
        pagination: {
          total: response.data.total,
          limit: response.data.limit,
          offset: response.data.offset,
        },
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch deals';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  fetchDealById: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<{ deal: Deal }>(`/deals/${id}`);
      set({ currentDeal: response.data.deal, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch deal';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  createDeal: async (data: CreateDealRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<{ deal: Deal }>('/deals', data);
      set({ isLoading: false });
      // Refresh deals after creation
      await get().fetchDeals();
      return response.data.deal;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to create deal';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  updateDeal: async (id: number, data: UpdateDealRequest) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.patch(`/deals/${id}`, data);
      set({ isLoading: false });
      // Refresh deals after update
      await get().fetchDeals();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to update deal';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  moveDeal: async (id: number, stageId: number) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.put(`/deals/${id}/move`, { stage_id: stageId });
      set({ isLoading: false });
      // Refresh deals after move to get updated data from backend
      await get().fetchDeals();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to move deal';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  updateDealStatus: async (id: number, status: DealStatus) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.put(`/deals/${id}/status`, { status });
      set({ isLoading: false });
      // Refresh deals after status update - use stored filters
      await get().fetchDeals();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to update deal status';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  deleteDeal: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/deals/${id}`);
      set({ isLoading: false });
      // Refresh deals after deletion - use stored filters
      await get().fetchDeals();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to delete deal';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  fetchPipelineValues: async () => {
    try {
      const response = await apiClient.get<PipelineValueResponse>('/deals/pipeline-value');
      set({ pipelineValues: response.data.pipeline_values });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch pipeline values';
      set({ error: errorMessage });
      throw error;
    }
  },

  setFilters: (filters: Partial<DealFilters>) => {
    set({ filters: { ...get().filters, ...filters } });
  },

  clearFilters: () => {
    set({
      filters: {
        limit: 20,
        offset: 0,
      },
    });
  },

  clearError: () => set({ error: null }),
}));
