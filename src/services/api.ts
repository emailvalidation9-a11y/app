import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Attach JWT token from localStorage to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      // Do not redirect to login automatically to avoid loop on public pages, 
      // or handle carefully. AuthContext should handle global state on 401.
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (name: string, email: string, password: string) =>
    api.post('/auth/register', { name, email, password }),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data: { name: string }) =>
    api.put('/auth/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/auth/password', data),
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) =>
    api.post(`/auth/reset-password/${token}`, { password }),
  verifyEmail: (token: string) =>
    api.get(`/auth/verify-email/${token}`),
  resendVerification: () =>
    api.post('/auth/resend-verification'),
};

// Validation API
export const validationApi = {
  validateSingle: (email: string, options?: { verifySMTP?: boolean }) =>
    api.post('/validate/single', { email, options }),
  validateBulk: (file: File, webhookUrl?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (webhookUrl) {
      formData.append('webhook_url', webhookUrl);
    }
    return api.post('/validate/bulk', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getJobs: (page = 1, limit = 20) =>
    api.get(`/validate/jobs?page=${page}&limit=${limit}`),
  getJob: (id: string) => api.get(`/validate/jobs/${id}`),
  getJobResults: (id: string, page = 1, limit = 100, status?: string) =>
    api.get(`/validate/jobs/${id}/results?page=${page}&limit=${limit}${status ? `&status=${status}` : ''}`),
  cancelJob: (id: string) => api.delete(`/validate/jobs/${id}`),
};

// API Keys API
export const apiKeysApi = {
  getKeys: () => api.get('/keys'),
  createKey: (data: { name: string; rate_limit_per_minute?: number }) =>
    api.post('/keys', data),
  updateKey: (id: string, data: { name?: string; is_active?: boolean; rate_limit_per_minute?: number }) =>
    api.put(`/keys/${id}`, data),
  deleteKey: (id: string) => api.delete(`/keys/${id}`),
  getKeyUsage: (id: string) => api.get(`/keys/${id}/usage`),
};

// Billing API
export const billingApi = {
  getPlans: () => api.get('/billing/plans'),
  getSubscription: () => api.get('/billing/subscription'),
  createCheckout: (data: { plan: string; success_url?: string; cancel_url?: string }) =>
    api.post('/billing/checkout', data),
  purchaseCredits: (data: { package: string; success_url?: string; cancel_url?: string }) =>
    api.post('/billing/credits', data),
  cancelSubscription: () => api.post('/billing/cancel'),
  getTransactions: (page = 1, limit = 20) =>
    api.get(`/billing/transactions?page=${page}&limit=${limit}`),
};

// Public API
export const publicApi = {
  getBlogPosts: () => api.get('/blog'),
  getBlogPost: (slug: string) => api.get(`/blog/${slug}`),
  getSettings: () => api.get('/settings'),
  getPublicPlans: () => api.get('/pricing/public'),
  submitContact: (data: { name: string; email: string; subject: string; message: string }) =>
    api.post('/contact', data),
};

// Account API (Activity, Analytics, Export, GDPR)
export const accountApi = {
  getActivityLog: (page = 1, limit = 20) =>
    api.get(`/account/activity?page=${page}&limit=${limit}`),
  getUsageStats: (days = 30) =>
    api.get(`/account/usage?days=${days}`),
  exportResultsCSV: (jobId: string) =>
    api.get(`/account/export/${jobId}`, { responseType: 'blob' }),
  deleteAccount: () =>
    api.delete('/account'),
};
