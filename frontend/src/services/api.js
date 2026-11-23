import axios from 'axios';

const getBaseUrl = () => {
    let url = import.meta.env.VITE_API_URL || 'https://ecommerce-backend-w5dg.onrender.com/api';
    if (!url.endsWith('/api')) {
        url += '/api';
    }
    return url;
};

const API_URL = getBaseUrl();

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests if available
api.interceptors.request.use(
    (config) => {
        try {
            const userStr = localStorage.getItem('currentUser');
            if (userStr) {
                const user = JSON.parse(userStr);
                if (user && user.token) {
                    config.headers.Authorization = `Bearer ${user.token}`;
                }
            }
        } catch (error) {
            console.error('Error parsing user token:', error);
        }
        return config;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('currentUser');
        }
        return Promise.reject(error);
    }
);

/**
 * Authentication API Service
 */
export const authAPI = {
    register: (userData) => api.post('/auth/register', userData),
    login: (credentials) => api.post('/auth/login', credentials),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (userData) => api.put('/auth/profile', userData),
};

/**
 * Products API Service
 */
export const productsAPI = {
    getAll: (params) => api.get('/products', { params }),
    getById: (id) => api.get(`/products/${id}`),
    getSuggestions: (q) => api.get('/products/search/suggestions', { params: { q } }),
    getRelated: (id) => api.get(`/products/${id}/related`),
    create: (productData) => api.post('/products', productData),
    update: (id, productData) => api.put(`/products/${id}`, productData),
    delete: (id) => api.delete(`/products/${id}`),
    addReview: (id, reviewData) => api.post(`/products/${id}/reviews`, reviewData),
};

/**
 * Orders API Service
 */
export const ordersAPI = {
    create: (orderData) => api.post('/orders', orderData),
    getById: (id) => api.get(`/orders/${id}`),
    getMyOrders: () => api.get('/orders/myorders'),
    updateToPaid: (id, paymentResult) => api.put(`/orders/${id}/pay`, paymentResult),
    updateToDelivered: (id) => api.put(`/orders/${id}/deliver`),
    updateStatus: (id, statusData) => api.put(`/orders/${id}/status`, statusData),
    cancel: (id, reason) => api.put(`/orders/${id}/cancel`, { reason }),
    requestReturn: (id, reason) => api.put(`/orders/${id}/return`, { reason }),
    getAll: () => api.get('/orders'),
};

/**
 * Coupons API Service
 */
export const couponsAPI = {
    validate: (code, cartTotal) => api.post('/coupons/validate', { code, cartTotal }),
    getAll: () => api.get('/coupons'),
    create: (couponData) => api.post('/coupons', couponData),
};

/**
 * Payment API Service
 */
export const paymentAPI = {
    createIntent: (amount, currency = 'inr', orderId) =>
        api.post('/payment/create-intent', { amount, currency, orderId }),
    verify: (paymentIntentId, orderId) =>
        api.post('/payment/verify', { paymentIntentId, orderId }),
    getInvoice: (orderId) => api.get(`/payment/invoice/${orderId}`),
};

/**
 * Admin API Service
 */
export const adminAPI = {
    getStats: () => api.get('/analytics/dashboard'),
    getUsers: () => api.get('/auth/users'),
    getOrders: () => api.get('/orders'),
    deleteUser: (id) => api.delete(`/auth/users/${id}`),
    updateUser: (id, userData) => api.put(`/auth/users/${id}`, userData),
};

export default api;
