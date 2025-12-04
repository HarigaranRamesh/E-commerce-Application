import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

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
            console.error("Error parsing user token:", error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (userData) => api.post('/auth/register', userData),
    login: (credentials) => api.post('/auth/login', credentials),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (userData) => api.put('/auth/profile', userData),
};

// Products API
export const productsAPI = {
    getAll: (params) => api.get('/products', { params }),
    getById: (id) => api.get(`/products/${id}`),
    create: (productData) => api.post('/products', productData),
    update: (id, productData) => api.put(`/products/${id}`, productData),
    delete: (id) => api.delete(`/products/${id}`),
    addReview: (id, reviewData) => api.post(`/products/${id}/reviews`, reviewData),
};

// Orders API
export const ordersAPI = {
    create: (orderData) => api.post('/orders', orderData),
    getById: (id) => api.get(`/orders/${id}`),
    getMyOrders: () => api.get('/orders/myorders'),
    updateToPaid: (id, paymentResult) => api.put(`/orders/${id}/pay`, paymentResult),
    updateToDelivered: (id) => api.put(`/orders/${id}/deliver`),
};

// Payment API
export const paymentAPI = {
    createPaymentIntent: (amount) => api.post('/payment/create-payment-intent', { amount }),
    getConfig: () => api.get('/payment/config'),
};

export default api;
