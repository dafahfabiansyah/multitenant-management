import { create } from 'zustand';
import apiClient from '@/lib/axios';
import type { 
  TenantState, 
  TenantResponse, 
  TenantUsersResponse, 
  AuditLogsResponse, 
  UpdateTenantRequest, 
  UserRole,
  AddUserRequest,
  AddUserResponse
} from '@/types';

export const useTenantStore = create<TenantState>((set, get) => ({
  tenantInfo: null,
  tenantUsers: [],
  auditLogs: [],
  isLoading: false,
  error: null,
  pagination: {
    users: { page: 1, page_size: 20, total: 0 },
    logs: { page: 1, page_size: 20, total: 0 },
  },

  fetchTenantInfo: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<TenantResponse>('/tenant');
      set({ tenantInfo: response.data.tenant, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch tenant info';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  updateTenant: async (data: UpdateTenantRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.put<TenantResponse>('/tenant', data);
      set({ tenantInfo: response.data.tenant, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to update tenant';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  fetchTenantUsers: async (page = 1, page_size = 20) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<TenantUsersResponse>('/tenant/users', {
        params: { page, page_size },
      });
      
      set({
        tenantUsers: response.data.users,
        pagination: {
          ...get().pagination,
          users: {
            page: response.data.page,
            page_size: response.data.page_size,
            total: response.data.total,
          },
        },
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch users';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  addUser: async (data: AddUserRequest) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.post<AddUserResponse>('/tenant/users', data);
      // Refresh user list after adding
      await get().fetchTenantUsers(get().pagination.users.page, get().pagination.users.page_size);
      set({ isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to add user';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  updateUserRole: async (userId: number, role: UserRole) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.put(`/tenant/users/${userId}/role`, { role });
      // Refresh user list after update
      await get().fetchTenantUsers(get().pagination.users.page, get().pagination.users.page_size);
      set({ isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to update user role';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  removeUser: async (userId: number) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/tenant/users/${userId}`);
      // Refresh user list after removal
      await get().fetchTenantUsers(get().pagination.users.page, get().pagination.users.page_size);
      set({ isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to remove user';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  fetchAuditLogs: async (page = 1, page_size = 20) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<AuditLogsResponse>('/tenant/audit-logs', {
        params: { page, page_size },
      });
      
      set({
        auditLogs: response.data.logs,
        pagination: {
          ...get().pagination,
          logs: {
            page: response.data.page,
            page_size: response.data.page_size,
            total: response.data.total,
          },
        },
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch audit logs';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
