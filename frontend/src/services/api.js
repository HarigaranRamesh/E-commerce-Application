import axios from 'axios';

const getBaseUrl = () => {
    let url = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
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

// Token refresh queue state
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Add token to requests if available
api.interceptors.request.use(
    (config) => {
        try {
            const userStr = localStorage.getItem('currentUser');
            if (userStr) {
                const user = JSON.parse(userStr);
                const activeToken = user.accessToken || user.token;
                if (activeToken) {
                    config.headers.Authorization = `Bearer ${activeToken}`;
                }
            }
        } catch (error) {
            console.error('Error parsing user token:', error);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor with automatic JWT refresh queue
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Skip refresh for auth login, register, or refresh calls themselves
        const isAuthEndpoint = originalRequest.url?.includes('/auth/login') ||
            originalRequest.url?.includes('/auth/register') ||
            originalRequest.url?.includes('/auth/refresh');

        if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return api(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            let refreshToken = null;
            let currentUser = null;
            try {
                const userStr = localStorage.getItem('currentUser');
                if (userStr) {
                    currentUser = JSON.parse(userStr);
                    refreshToken = currentUser?.refreshToken;
                }
            } catch {
                refreshToken = null;
            }

            if (!refreshToken) {
                isRefreshing = false;
                processQueue(new Error('No refresh token available'), null);
                localStorage.removeItem('currentUser');
                window.dispatchEvent(new Event('auth:logout'));
                return Promise.reject(error);
            }

            try {
                // Call refresh endpoint directly using raw axios to bypass interceptor recursion
                const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
                const newAccessToken = response.data?.accessToken || response.data?.token;
                const newRefreshToken = response.data?.refreshToken || refreshToken;

                if (newAccessToken && currentUser) {
                    const updatedUser = {
                        ...currentUser,
                        token: newAccessToken,
                        accessToken: newAccessToken,
                        refreshToken: newRefreshToken,
                    };
                    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                    window.dispatchEvent(new CustomEvent('auth:token-refreshed', { detail: updatedUser }));
                }

                api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                processQueue(null, newAccessToken);
                return api(originalRequest);
            } catch (refreshErr) {
                processQueue(refreshErr, null);
                localStorage.removeItem('currentUser');
                window.dispatchEvent(new Event('auth:logout'));
                return Promise.reject(refreshErr);
            } finally {
                isRefreshing = false;
            }
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
    refreshToken: (refreshToken) => axios.post(`${API_URL}/auth/refresh`, { refreshToken }),
    logout: () => api.post('/auth/logout'),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (userData) => api.put('/auth/profile', userData),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (payload) => api.post('/auth/reset-password', payload),
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
 * Cart API Service
 */
export const cartAPI = {
    getCart: () => api.get('/cart'),
    addToCart: (item) => api.post('/cart', item),
    updateQuantity: (itemKey, quantity) => api.put('/cart', { itemKey, quantity }),
    removeFromCart: (itemKey) => api.delete(`/cart/${encodeURIComponent(itemKey)}`),
    clearCart: () => api.delete('/cart'),
};

/**
 * Wishlist API Service
 */
export const wishlistAPI = {
    getWishlist: () => api.get('/wishlist'),
    addToWishlist: (product) => api.post('/wishlist', product),
    removeFromWishlist: (id) => api.delete(`/wishlist/${id}`),
    clearWishlist: () => api.delete('/wishlist'),
};

/**
 * Orders API Service
 */
export const ordersAPI = {
    create: (orderData) => api.post('/orders', orderData),
    getById: (id) => api.get(`/orders/${id}`),
    getMyOrders: (params) => api.get('/orders/myorders', { params }),
    updateToPaid: (id, paymentResult) => api.put(`/orders/${id}/pay`, paymentResult),
    updateToDelivered: (id) => api.put(`/orders/${id}/deliver`),
    updateStatus: (id, statusData) => api.put(`/orders/${id}/status`, statusData),
    cancel: (id, reason) => api.put(`/orders/${id}/cancel`, { reason }),
    requestReturn: (id, reason) => api.put(`/orders/${id}/return`, { reason }),
    getAll: (params) => api.get('/orders', { params }),
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
 * Payment API Service (Razorpay & Multi-Gateway)
 */
export const paymentAPI = {
    createRazorpayOrder: (orderPayload) =>
        api.post('/payments/create-order', orderPayload),
    verifyRazorpayPayment: (verificationPayload) =>
        api.post('/payments/verify', verificationPayload),
    getPaymentStatus: (paymentId) =>
        api.get(`/payments/${paymentId}/status`),
    getInvoice: (orderId) =>
        api.get(`/payments/invoice/${orderId}`),
    // Legacy support
    createIntent: (amount, currency = 'inr', orderId) =>
        api.post('/payment/create-intent', { amount, currency, orderId }),
    verify: (paymentIntentId, orderId) =>
        api.post('/payment/verify', { paymentIntentId, orderId }),
};

/**
 * Admin API Service
 */
export const adminAPI = {
    getStats: () => api.get('/analytics/dashboard'),
    getUsers: (params) => api.get('/auth/users', { params }),
    getOrders: (params) => api.get('/orders', { params }),
    deleteUser: (id) => api.delete(`/auth/users/${id}`),
    updateUser: (id, userData) => api.put(`/auth/users/${id}`, userData),
};

/**
 * Strapi CMS API Service
 */
export const strapiAPI = {
    getStatus: () => api.get('/strapi/status'),
    triggerSync: () => api.post('/strapi/sync'),
    getProducts: () => api.get('/strapi/products'),
};

export default api;
