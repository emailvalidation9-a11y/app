import api from '@/services/api';

export const adminApi = {
    // Dashboard
    getStats: () => api.get('/admin/stats'),

    // Users
    getUsers: (params?: Record<string, unknown>) => api.get('/admin/users', { params }),
    exportUsers: (params?: Record<string, unknown>) =>
        api.get('/admin/users/export', { params, responseType: 'blob' }),
    getUser: (id: string) => api.get(`/admin/users/${id}`),
    updateUser: (id: string, data: Record<string, unknown>) => api.put(`/admin/users/${id}`, data),
    deleteUser: (id: string) => api.delete(`/admin/users/${id}`),

    // Credits
    adjustCredits: (id: string, data: { amount: number; reason?: string }) =>
        api.post(`/admin/users/${id}/credits/adjust`, data),
    setCredits: (id: string, data: { credits: number; reason?: string }) =>
        api.post(`/admin/users/${id}/credits/set`, data),

    // Password
    resetUserPassword: (id: string, newPassword: string) =>
        api.post(`/admin/users/${id}/reset-password`, { newPassword }),

    // Bulk
    bulkOperation: (ids: string[], action: string, extra?: { amount?: number; plan?: string }) =>
        api.post('/admin/users/bulk', { ids, action, ...extra }),

    // API Keys
    getApiKeys: (params?: Record<string, unknown>) => api.get('/admin/api-keys', { params }),
    revokeApiKey: (id: string) => api.patch(`/admin/api-keys/${id}/revoke`),
    deleteApiKey: (id: string) => api.delete(`/admin/api-keys/${id}`),

    // Activity
    getActivity: (params?: Record<string, unknown>) => api.get('/admin/activity', { params }),

    // Jobs & Transactions
    getJobs: (params?: Record<string, unknown>) => api.get('/admin/jobs', { params }),
    getTransactions: (params?: Record<string, unknown>) => api.get('/admin/transactions', { params }),

    // Blog
    getBlogPosts: () => api.get('/blog/admin'),
    getBlogPost: (id: string) => api.get(`/blog/admin/${id}`),
    createBlogPost: (data: any) => api.post('/blog', data),
    updateBlogPost: (id: string, data: any) => api.put(`/blog/${id}`, data),
    deleteBlogPost: (id: string) => api.delete(`/blog/${id}`),

    // Contact Inbox
    getContactMessages: () => api.get('/contact'),
    updateContactMessageStatus: (id: string, status: string) => api.patch(`/contact/${id}/status`, { status }),
    deleteContactMessage: (id: string) => api.delete(`/contact/${id}`),

    // Site Settings
    getSiteSettings: () => api.get('/settings'),
    updateSiteSettings: (data: any) => api.put('/settings', data),

    // Validation Servers
    getServers: (params?: Record<string, unknown>) => api.get('/servers', { params }),
    getServer: (id: string) => api.get(`/servers/${id}`),
    createServer: (data: { name: string; url: string; weight?: number; isActive?: boolean }) =>
        api.post('/servers', data),
    updateServer: (id: string, data: { name?: string; url?: string; weight?: number; isActive?: boolean }) =>
        api.put(`/servers/${id}`, data),
    deleteServer: (id: string) => api.delete(`/servers/${id}`),
    testServer: (id: string, data?: { url?: string }) => api.post(`/servers/${id}/test`, data),
    updateServerHealth: (id: string, data: { isHealthy: boolean }) => api.patch(`/servers/${id}/health`, data),

    // System Config (dynamic)
    getSystemConfig: () => api.get('/pricing/config'),

    // Pricing Plans
    getPricingPlans: (params?: Record<string, unknown>) => api.get('/pricing/plans', { params }),
    createPricingPlan: (data: any) => api.post('/pricing/plans', data),
    updatePricingPlan: (id: string, data: any) => api.put(`/pricing/plans/${id}`, data),
    deletePricingPlan: (id: string) => api.delete(`/pricing/plans/${id}`),
    seedPricingPlans: () => api.post('/pricing/plans/seed'),

    // Coupons
    getCoupons: (params?: Record<string, unknown>) => api.get('/pricing/coupons', { params }),
    createCoupon: (data: any) => api.post('/pricing/coupons', data),
    updateCoupon: (id: string, data: any) => api.put(`/pricing/coupons/${id}`, data),
    deleteCoupon: (id: string) => api.delete(`/pricing/coupons/${id}`),
};
