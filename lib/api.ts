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
    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
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
  create: (data: any) => apiCall('/api/members/', { method: 'POST', body: JSON.stringify(data) }),
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
  getAll: () => apiCall('/api/subscriptions/'),
  getById: (id: string) => apiCall(`/api/subscriptions/${id}`),
  getPauseInfo: (id: string) => apiCall(`/api/subscriptions/${id}/pause-info`),
  create: (data: any) => apiCall('/api/subscriptions/', { method: 'POST', body: JSON.stringify(data) }),
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
  triggerExpiryReminders: () => apiCall('/api/scheduler/expiry-reminders', { method: 'POST' }),
};

// WhatsApp API
export const whatsappApi = {
  test: (testPhone?: string) => {
    const query = testPhone ? `?test_phone=${testPhone}` : '';
    return apiCall(`/api/whatsapp/test${query}`);
  },
  sendTemplate: (data: { to_phone: string; template_name: string; language_code?: string }) => 
    apiCall('/api/whatsapp/send-template', { method: 'POST', body: JSON.stringify(data) }),
  sendWelcome: (data: { member_phone: string; member_name: string }) => 
    apiCall('/api/whatsapp/send-welcome', { method: 'POST', body: JSON.stringify(data) }),
  getExpiringSubscriptions: (days?: number) => {
    const query = days ? `?days=${days}` : '';
    return apiCall(`/api/whatsapp/expiring-subscriptions${query}`);
  },
  sendExpiryReminders: () => apiCall('/api/whatsapp/send-expiry-reminders', { method: 'POST' }),
  getTemplates: () => apiCall('/api/whatsapp/templates'),
  bulkSend: (data: any) => apiCall('/api/whatsapp/bulk-send', { method: 'POST', body: JSON.stringify(data) }),
};