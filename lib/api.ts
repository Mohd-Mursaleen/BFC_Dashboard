// API configuration and utilities
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// API response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: boolean;
  message?: string;
  status_code?: number;
  details?: any;
}

// Member creation response with WhatsApp notification details
export interface MemberCreateResponse {
  id: string;
  full_name: string;
  phone: string;
  notification_sent: boolean;
  whatsapp_message_id: string | null;
  whatsapp_error: string | null;
}

// Subscription creation response with WhatsApp notification details
export interface SubscriptionCreateResponse {
  id: string;
  member_id: string;
  plan_id: string;
  start_date: string;
  end_date: string;
  actual_end_date: string;
  total_pause_days_allowed: number;
  pause_days_used: number;
  pause_days_remaining: number;
  is_currently_paused: boolean;
  current_pause_start_date: string | null;
  status: string;
  amount_paid: number;
  payment_mode: string;
  receipt_number: string;
  need_trainer: boolean;
  created_at: string;
  updated_at: string;
  member: {
    id: string;
    full_name: string;
    phone: string;
    email: string;
  };
  plan: {
    id: string;
    plan_name: string;
    duration_months: number;
    price: number;
  };
  notification_sent: boolean;
  whatsapp_message_id: string | null;
  whatsapp_error: string | null;
}

// Auth token management
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
};

export const setAuthToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('auth_token', token);
};

export const removeAuthToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
};

// Generic API call function
export async function apiCall<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || errorData.error || errorData.detail || `HTTP ${response.status}: ${response.statusText}`;
    throw new Error(errorMessage);
  }

  return response.json();
}

// Auth API calls
export const authApi = {
  login: async (username: string, password: string) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Login failed');
    }

    return response.json();
  },
};

// Members API
export const membersApi = {
  getAll: (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return apiCall(`/api/members/${query}`);
  },
  getById: (id: string) => apiCall(`/api/members/${id}`),
  create: (data: any): Promise<MemberCreateResponse> => 
    apiCall('/api/members/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiCall(`/api/members/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/api/members/${id}`, { method: 'DELETE' }),
};

// Plans API
export const plansApi = {
  getAll: (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return apiCall(`/api/plans/${query}`);
  },
  getActive: () => apiCall('/api/plans/active'),
  getById: (id: string) => apiCall(`/api/plans/${id}`),
  create: (data: any) => apiCall('/api/plans/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiCall(`/api/plans/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/api/plans/${id}`, { method: 'DELETE' }),
};

// Subscriptions API
export const subscriptionsApi = {
  getAll: (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return apiCall(`/api/subscriptions/${query}`);
  },
  getById: (id: string) => apiCall(`/api/subscriptions/${id}`),
  getPauseInfo: (id: string) => apiCall(`/api/subscriptions/${id}/pause-info`),
  create: (data: any): Promise<SubscriptionCreateResponse> => 
    apiCall('/api/subscriptions/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiCall(`/api/subscriptions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/api/subscriptions/${id}`, { method: 'DELETE' }),
  pause: (id: string, reason?: string) => 
    apiCall(`/api/subscriptions/${id}/pause`, { 
      method: 'POST', 
      body: JSON.stringify({ reason: reason || 'No reason provided' }) 
    }),
  resume: (id: string) => apiCall(`/api/subscriptions/${id}/resume`, { method: 'POST' }),
  autoResumeExpired: () => apiCall('/api/subscriptions/auto-resume-expired', { method: 'POST' }),
};

// Analytics API
export const analyticsApi = {
  getSummary: () => apiCall('/api/analytics/summary'),
  getDashboard: () => apiCall('/api/analytics/dashboard'),
  getMembers: () => apiCall('/api/analytics/members'),
  getPlans: () => apiCall('/api/analytics/plans'),
  getRevenue: () => apiCall('/api/analytics/revenue'),
  getFiltered: (params: Record<string, string>) => {
    const query = new URLSearchParams(params);
    return apiCall(`/api/analytics/filtered?${query}`);
  },
};

// Scheduler API
export const schedulerApi = {
  getStatus: () => apiCall('/api/scheduler/status'),
  triggerAutoResume: () => apiCall('/api/scheduler/auto-resume', { method: 'POST' }),
  triggerBirthdayWishes: () => apiCall('/api/scheduler/birthday-wishes', { method: 'POST' }),
};

// WhatsApp API
export const whatsappApi = {
  // Service Status
  getStatus: () => apiCall('/api/whatsapp/status'),
  
  // Testing
  testWelcome: (data: { member_phone: string; member_name: string }) => 
    apiCall('/api/whatsapp/test-welcome', { method: 'POST', body: JSON.stringify(data) }),
  
  // Welcome Messages (Template-based)
  sendWelcome: (data: { member_phone: string; member_name: string }) => 
    apiCall('/api/whatsapp/send-welcome', { method: 'POST', body: JSON.stringify(data) }),
  
  // Expiry Reminders
  sendExpiry: (data: { member_phone: string; member_name: string; days_remaining: number; end_date?: string }) => 
    apiCall('/api/whatsapp/send-expiry', { method: 'POST', body: JSON.stringify(data) }),
};