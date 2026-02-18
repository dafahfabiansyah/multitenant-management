import { create } from 'zustand';
import apiClient from '@/lib/axios';
import type { ContactState, ContactsResponse, ContactResponse, CreateContactRequest, UpdateContactRequest, ContactFilters, Contact } from '@/types';

export const useContactStore = create<ContactState>((set, get) => ({
  contacts: [],
  currentContact: null,
  filters: {
    page: 1,
    page_size: 20,
  },
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    page_size: 20,
    total: 0,
    total_pages: 1,
  },

  fetchContacts: async (filters?: ContactFilters) => {
    set({ isLoading: true, error: null });
    
    // Merge with existing filters
    const currentFilters = filters ? { ...get().filters, ...filters } : get().filters;
    set({ filters: currentFilters });

    try {
      const response = await apiClient.get<ContactsResponse>('/contacts', {
        params: currentFilters,
      });

      set({
        contacts: response.data.contacts,
        pagination: {
          page: response.data.page,
          page_size: response.data.page_size,
          total: response.data.total,
          total_pages: response.data.total_pages,
        },
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch contacts';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  fetchContactById: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<ContactResponse>(`/contacts/${id}`);
      set({ currentContact: response.data.contact, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch contact';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  createContact: async (data: CreateContactRequest): Promise<Contact> => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<ContactResponse>('/contacts', data);
      set({ isLoading: false });
      // Refresh contact list after creation
      await get().fetchContacts();
      return response.data.contact;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to create contact';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  updateContact: async (id: number, data: UpdateContactRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.patch<ContactResponse>(`/contacts/${id}`, data);
      set({ currentContact: response.data.contact, isLoading: false });
      // Refresh contact list after update
      await get().fetchContacts();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to update contact';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  deleteContact: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/contacts/${id}`);
      set({ isLoading: false });
      // Refresh contact list after deletion
      await get().fetchContacts();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to delete contact';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  searchContacts: async (query: string, page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<ContactsResponse>('/contacts/search', {
        params: { q: query, page, page_size: get().filters.page_size },
      });

      set({
        contacts: response.data.contacts,
        pagination: {
          page: response.data.page,
          page_size: response.data.page_size,
          total: response.data.total,
          total_pages: response.data.total_pages || 1,
        },
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to search contacts';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  setFilters: (filters: Partial<ContactFilters>) => {
    set({ filters: { ...get().filters, ...filters } });
  },

  clearFilters: () => {
    set({
      filters: {
        page: 1,
        page_size: 20,
      },
    });
  },

  clearError: () => {
    set({ error: null });
  },
}));
