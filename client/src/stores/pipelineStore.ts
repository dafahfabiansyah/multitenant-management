import { create } from 'zustand';
import apiClient from '@/lib/axios';
import type { 
  PipelineState, 
  PipelineStagesResponse, 
  CreatePipelineStageRequest, 
  UpdatePipelineStageRequest 
} from '@/types';

export const usePipelineStore = create<PipelineState>((set) => ({
  stages: [],
  isLoading: false,
  error: null,

  fetchStages: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<PipelineStagesResponse>('/pipeline/stages');
      set({ stages: response.data.stages, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch pipeline stages';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  createStage: async (data: CreatePipelineStageRequest) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.post('/pipeline/stages', data);
      set({ isLoading: false });
      // Refresh stages after creation
      await usePipelineStore.getState().fetchStages();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to create stage';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  updateStage: async (id: number, data: UpdatePipelineStageRequest) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.patch(`/pipeline/stages/${id}`, data);
      set({ isLoading: false });
      // Refresh stages after update
      await usePipelineStore.getState().fetchStages();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to update stage';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  deleteStage: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/pipeline/stages/${id}`);
      set({ isLoading: false });
      // Refresh stages after deletion
      await usePipelineStore.getState().fetchStages();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to delete stage';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  reorderStages: async (stageIds: number[]) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.put('/pipeline/stages/reorder', { stage_ids: stageIds });
      set({ isLoading: false });
      // Refresh stages after reorder
      await usePipelineStore.getState().fetchStages();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to reorder stages';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
