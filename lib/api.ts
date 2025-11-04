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

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
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
    return apiCall(`/members/${query}`);
  },
  getById: (id: string) => apiCall(`/members/${id}`),
  create: (data: any) => apiCall('/members/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiCall(`/members/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/members/${id}`, { method: 'DELETE' }),
};

// Plans API
export const plansApi = {
  getAll: (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return apiCall(`/plans/${query}`);
  },
  getActive: () => apiCall('/plans/active'),
  getById: (id: string) => apiCall(`/plans/${id}`),
  create: (data: any) => apiCall('/plans/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiCall(`/plans/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/plans/${id}`, { method: 'DELETE' }),
};

// Subscriptions API
export const subscriptionsApi = {
  getAll: () => apiCall('/subscriptions/'),
  getById: (id: string) => apiCall(`/subscriptions/${id}`),
  getPauseInfo: (id: string) => apiCall(`/subscriptions/${id}/pause-info`),
  create: (data: any) => apiCall('/subscriptions/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiCall(`/subscriptions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/subscriptions/${id}`, { method: 'DELETE' }),
  pause: (id: string, reason?: string) => 
    apiCall(`/subscriptions/${id}/pause`, { 
      method: 'POST', 
      body: JSON.stringify({ reason: reason || 'No reason provided' }) 
    }),
  resume: (id: string) => apiCall(`/subscriptions/${id}/resume`, { method: 'POST' }),
  autoResumeExpired: () => apiCall('/subscriptions/auto-resume-expired', { method: 'POST' }),
};

// Analytics API
export const analyticsApi = {
  getSummary: () => apiCall('/analytics/summary'),
  getDashboard: () => apiCall('/analytics/dashboard'),
  getMembers: () => apiCall('/analytics/members'),
  getPlans: () => apiCall('/analytics/plans'),
  getRevenue: () => apiCall('/analytics/revenue'),
  getFiltered: (params: Record<string, string>) => {
    const query = new URLSearchParams(params);
    return apiCall(`/analytics/filtered?${query}`);
  },
};

// Scheduler API
export const schedulerApi = {
  getStatus: () => apiCall('/scheduler/status'),
  triggerAutoResume: () => apiCall('/scheduler/auto-resume', { method: 'POST' }),
};