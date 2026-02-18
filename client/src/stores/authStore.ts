import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import apiClient from '@/lib/axios';
import type { AuthState, LoginResponse, RegisterResponse } from '@/types';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      tenant: null,
      role: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      rememberMe: false,

      login: async (email: string, password: string, rememberMe = false) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.post<LoginResponse>('/auth/login', {
            email,
            password,
          });

          const { user, token, role } = response.data;

          // Get full tenant info
          const tenantResponse = await apiClient.get('/tenant', {
            headers: { Authorization: `Bearer ${token}` },
          });

          const tenant = tenantResponse.data.tenant;

          // Save to localStorage
          localStorage.setItem('auth_token', token);
          localStorage.setItem('auth_user', JSON.stringify(user));
          localStorage.setItem('auth_tenant', JSON.stringify(tenant));
          localStorage.setItem('auth_role', role);

          set({
            user,
            token,
            tenant,
            role,
            isAuthenticated: true,
            isLoading: false,
            rememberMe,
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.error || 'Login failed. Please try again.';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.post<RegisterResponse>('/auth/register', data);

          const { user, token, tenant } = response.data;

          // Save to localStorage
          localStorage.setItem('auth_token', token);
          localStorage.setItem('auth_user', JSON.stringify(user));
          localStorage.setItem('auth_tenant', JSON.stringify(tenant));
          localStorage.setItem('auth_role', 'admin'); // First user is always admin

          set({
            user,
            token,
            tenant,
            role: 'admin',
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.error || 'Registration failed. Please try again.';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      logout: () => {
        // Clear localStorage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_tenant');
        localStorage.removeItem('auth_role');

        set({
          user: null,
          token: null,
          tenant: null,
          role: null,
          isAuthenticated: false,
          error: null,
        });
      },

      clearError: () => {
        set({ error: null });
      },

      setToken: (token: string) => {
        localStorage.setItem('auth_token', token);
        set({ token, isAuthenticated: true });
      },

      validateToken: async () => {
        const token = get().token;
        if (!token) return false;

        try {
          // Try to get tenant info to validate token
          const response = await apiClient.get('/tenant');
          return response.status === 200;
        } catch (error) {
          get().logout();
          return false;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        tenant: state.tenant,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
        rememberMe: state.rememberMe,
      }),
    }
  )
);
