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
        // Auto-logout on 401 (Unauthorized)
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('currentUser');
            // Optional: Redirect to login or just refresh to clear state
            // window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);

/**
 * Authentication API Service
 * Handles user registration, login, and profile management.
 */
export const authAPI = {
    /**
     * Register a new user.
     * @param {Object} userData - User registration details (name, email, password).
     * @returns {Promise<Object>} Response containing user data and token.
     */
    register: (userData) => api.post('/auth/register', userData),

    /**
     * Login user.
     * @param {Object} credentials - User credentials (email, password).
     * @returns {Promise<Object>} Response containing user data and token.
     */
    login: (credentials) => api.post('/auth/login', credentials),

    /**
     * Get current user profile.
     * @returns {Promise<Object>} User profile data.
     */
    getProfile: () => api.get('/auth/profile'),

    /**
     * Update user profile.
     * @param {Object} userData - Updated user data.
     * @returns {Promise<Object>} Updated user profile.
     */
    updateProfile: (userData) => api.put('/auth/profile', userData),
};

/**
 * Products API Service
 * Handles product listing, details, and reviews.
 */
export const productsAPI = {
    /**
     * Get all products with optional filtering.
     * @param {Object} params - Query parameters (keyword, pageNumber, category).
     * @returns {Promise<Array>} List of products.
     */
    getAll: (params) => api.get('/products', { params }),

    /**
     * Get product by ID.
     * @param {string} id - Product ID.
     * @returns {Promise<Object>} Product details.
     */
    getById: (id) => api.get(`/products/${id}`),

    /**
     * Create a new product (Admin).
     * @param {Object} productData - Product details.
     * @returns {Promise<Object>} Created product.
     */
    create: (productData) => api.post('/products', productData),

    /**
     * Update a product (Admin).
     * @param {string} id - Product ID.
     * @param {Object} productData - Updated product details.
     * @returns {Promise<Object>} Updated product.
     */
    update: (id, productData) => api.put(`/products/${id}`, productData),

    /**
     * Delete a product (Admin).
     * @param {string} id - Product ID.
     * @returns {Promise<Object>} Deletion success message.
     */
    delete: (id) => api.delete(`/products/${id}`),

    /**
     * Add a review to a product.
     * @param {string} id - Product ID.
     * @param {Object} reviewData - Review details (rating, comment).
     * @returns {Promise<Object>} Success message.
     */
    addReview: (id, reviewData) => api.post(`/products/${id}/reviews`, reviewData),
};

/**
 * Orders API Service
 * Handles order creation, retrieval, and status updates.
 */
export const ordersAPI = {
    /**
     * Create a new order.
     * @param {Object} orderData - Order details (items, address, payment method).
     * @returns {Promise<Object>} Created order.
     */
    create: (orderData) => api.post('/orders', orderData),

    /**
     * Get order by ID.
     * @param {string} id - Order ID.
     * @returns {Promise<Object>} Order details.
     */
    getById: (id) => api.get(`/orders/${id}`),

    /**
     * Get logged-in user's orders.
     * @returns {Promise<Array>} List of user's orders.
     */
    getMyOrders: () => api.get('/orders/myorders'),

    /**
     * Update order to paid status.
     * @param {string} id - Order ID.
     * @param {Object} paymentResult - Payment gateway result.
     * @returns {Promise<Object>} Updated order.
     */
    updateToPaid: (id, paymentResult) => api.put(`/orders/${id}/pay`, paymentResult),

    /**
     * Update order to delivered status (Admin).
     * @param {string} id - Order ID.
     * @returns {Promise<Object>} Updated order.
     */
    updateToDelivered: (id) => api.put(`/orders/${id}/deliver`),

    /**
     * Get all orders (Admin).
     * @returns {Promise<Array>} List of all orders.
     */
    getAll: () => api.get('/orders'),
};

/**
 * Admin API Service
 * Handles admin-specific operations.
 */
export const adminAPI = {
    /**
     * Get dashboard analytics stats.
     * @returns {Promise<Object>} Dashboard stats.
     */
    getStats: () => api.get('/analytics/dashboard'),

    /**
     * Get all users.
     * @returns {Promise<Array>} List of users.
     */
    getUsers: () => api.get('/auth/users'),

    /**
     * Get all orders (alias for ordersAPI.getAll for admin components).
     * @returns {Promise<Array>} List of orders.
     */
    getOrders: () => api.get('/orders'),
};

/**
 * Payment API Service
 * Handles payment intent creation and configuration.
 */
export const paymentAPI = {
    /**
     * Create a payment intent (Stripe).
     * @param {number} amount - Amount to charge.
     * @returns {Promise<Object>} Payment intent client secret.
     */
    createPaymentIntent: (amount) => api.post('/payment/create-payment-intent', { amount }),

    /**
     * Get payment configuration (e.g., Stripe public key).
     * @returns {Promise<Object>} Configuration object.
     */
    getConfig: () => api.get('/payment/config'),
};

export default api;
