// ============================================
// User & Auth Types
// ============================================

export interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Tenant {
  id: number;
  name: string;
  subdomain?: string;
  status: 'active' | 'suspended' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

export interface TenantUser {
  id: number;
  tenant_id: number;
  user_id: number;
  role: UserRole;
  created_at?: string;
  tenant?: Tenant;
  user?: User;
}

export type UserRole = 'admin' | 'manager' | 'member';

// ============================================
// Auth API Types
// ============================================

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  tenant_name: string;
}

export interface RegisterResponse {
  message: string;
  user: User;
  tenant: Tenant;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  tenant_id?: number;
}

export interface LoginResponse {
  message: string;
  user: User;
  token: string;
  tenant_id: number;
  role: UserRole;
  available_tenants: TenantUser[];
}

// ============================================
// Contact Types
// ============================================

export type ContactStatus = 'active' | 'inactive' | 'blocked';
export type ContactSource = 'website' | 'referral' | 'ads' | 'cold_call' | 'event';

export interface Contact {
  id: number;
  tenant_id: number;
  created_by: number;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  mobile?: string;
  company_name?: string;
  position?: string;
  department?: string;
  address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  country?: string;
  status: ContactStatus;
  source?: ContactSource;
  tags?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateContactRequest {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  mobile?: string;
  company_name?: string;
  position?: string;
  department?: string;
  address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  country?: string;
  status?: ContactStatus;
  source?: ContactSource;
  tags?: string[];
  notes?: string;
}

export interface UpdateContactRequest extends Partial<CreateContactRequest> {}

export interface ContactFilters {
  page?: number;
  page_size?: number;
  search?: string;
  status?: ContactStatus;
  source?: ContactSource;
  city?: string;
  province?: string;
  tags?: string;
}

// ============================================
// Tenant Management Types
// ============================================

export interface UpdateTenantRequest {
  name: string;
  status: 'active' | 'suspended' | 'inactive';
}

export interface UpdateUserRoleRequest {
  role: UserRole;
}

export interface AuditLog {
  id: number;
  tenant_id: number;
  user_id: number;
  action: string;
  resource: string;
  resource_id: number;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages?: number;
}

export interface ContactsResponse {
  contacts: Contact[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface TenantsResponse {
  tenants: TenantUser[];
}

export interface TenantUsersResponse {
  users: TenantUser[];
  total: number;
  page: number;
  page_size: number;
}

export interface AuditLogsResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  page_size: number;
}

export interface TenantResponse {
  tenant: Tenant;
}

export interface ContactResponse {
  contact: Contact;
}

// ============================================
// Pipeline & Deal Types
// ============================================

export interface PipelineStage {
  id: number;
  tenant_id: number;
  name: string;
  order: number;
  probability: number;
  color: string;
  is_default: boolean;
  is_closed_won: boolean;
  is_closed_lost: boolean;
  created_at?: string;
  updated_at?: string;
}

export type DealStatus = 'active' | 'won' | 'lost' | 'cancelled';
export type DealSource = 'website' | 'referral' | 'ads' | 'cold_call' | 'event';

export interface Deal {
  id: number;
  tenant_id: number;
  created_by: number;
  title: string;
  description?: string;
  value: number;
  currency: string;
  contact_id?: number;  // Optional since backend may return nested contact instead
  stage_id?: number;    // Optional since backend may return nested stage instead
  probability: number;
  status: DealStatus;
  expected_close_date?: string;
  actual_close_date?: string;
  source?: DealSource;
  tags?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
  stage?: PipelineStage;
  contact?: Contact;
}

export interface CreateDealRequest {
  title: string;
  description?: string;
  value: number;
  currency?: string;
  contact_id?: number;
  stage_id: number;
  expected_close_date?: string;
  source?: DealSource;
  tags?: string[];
  notes?: string;
  probability?: number;
}

export interface UpdateDealRequest extends Partial<CreateDealRequest> {}

export interface CreatePipelineStageRequest {
  name: string;
  order: number;
  probability: number;
  color: string;
  is_closed_won?: boolean;
  is_closed_lost?: boolean;
}

export interface UpdatePipelineStageRequest {
  name?: string;
  order?: number;
  probability?: number;
  color?: string;
}

export interface DealFilters {
  stage_id?: number;
  status?: DealStatus;
  contact_id?: number;
  min_value?: number;
  max_value?: number;
  expected_close_start?: string;
  expected_close_end?: string;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface PipelineStagesResponse {
  stages: PipelineStage[];
  total: number;
}

export interface DealsResponse {
  deals: Deal[];
  total: number;
  limit: number;
  offset: number;
}

export interface PipelineValueResponse {
  pipeline_values: Record<number, number>;
}

export interface AddUserRequest {
  email: string;
  password?: string;
  full_name?: string;
  role: UserRole;
}

export interface AddUserResponse {
  message: string;
  user: User;
  is_new_user: boolean;
}

// ============================================
// Store State Types
// ============================================

export interface AuthState {
  user: User | null;
  token: string | null;
  tenant: Tenant | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  rememberMe: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  setToken: (token: string) => void;
  validateToken: () => Promise<boolean>;
}

export interface TenantState {
  tenantInfo: Tenant | null;
  tenantUsers: TenantUser[];
  auditLogs: AuditLog[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    users: { page: number; page_size: number; total: number };
    logs: { page: number; page_size: number; total: number };
  };
  fetchTenantInfo: () => Promise<void>;
  updateTenant: (data: UpdateTenantRequest) => Promise<void>;
  fetchTenantUsers: (page?: number, page_size?: number) => Promise<void>;
  addUser: (data: AddUserRequest) => Promise<void>;
  updateUserRole: (userId: number, role: UserRole) => Promise<void>;
  removeUser: (userId: number) => Promise<void>;
  fetchAuditLogs: (page?: number, page_size?: number) => Promise<void>;
  clearError: () => void;
}

export interface ContactState {
  contacts: Contact[];
  currentContact: Contact | null;
  filters: ContactFilters;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
  fetchContacts: (filters?: ContactFilters) => Promise<void>;
  fetchContactById: (id: number) => Promise<void>;
  createContact: (data: CreateContactRequest) => Promise<Contact>;
  updateContact: (id: number, data: UpdateContactRequest) => Promise<void>;
  deleteContact: (id: number) => Promise<void>;
  searchContacts: (query: string, page?: number) => Promise<void>;
  setFilters: (filters: Partial<ContactFilters>) => void;
  clearFilters: () => void;
  clearError: () => void;
}

export interface PipelineState {
  stages: PipelineStage[];
  isLoading: boolean;
  error: string | null;
  fetchStages: () => Promise<void>;
  createStage: (data: CreatePipelineStageRequest) => Promise<void>;
  updateStage: (id: number, data: UpdatePipelineStageRequest) => Promise<void>;
  deleteStage: (id: number) => Promise<void>;
  reorderStages: (stageIds: number[]) => Promise<void>;
  clearError: () => void;
}

export interface DealState {
  deals: Deal[];
  currentDeal: Deal | null;
  filters: DealFilters;
  isLoading: boolean;
  error: string | null;
  pipelineValues: Record<number, number>;
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
  fetchDeals: (filters?: DealFilters) => Promise<void>;
  fetchDealById: (id: number) => Promise<void>;
  createDeal: (data: CreateDealRequest) => Promise<Deal>;
  updateDeal: (id: number, data: UpdateDealRequest) => Promise<void>;
  moveDeal: (id: number, stageId: number) => Promise<void>;
  updateDealStatus: (id: number, status: DealStatus) => Promise<void>;
  deleteDeal: (id: number) => Promise<void>;
  fetchPipelineValues: () => Promise<void>;
  setFilters: (filters: Partial<DealFilters>) => void;
  clearFilters: () => void;
  clearError: () => void;
}

