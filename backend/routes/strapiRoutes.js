import express from 'express';
import {
    handleStrapiWebhook,
    triggerSync,
    getCmsStatus,
    getStrapiProducts,
} from '../controllers/strapiController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public webhook endpoint for Strapi CMS events
router.post('/webhook', handleStrapiWebhook);

// Check Strapi connection health
router.get('/status', getCmsStatus);

// Fetch products directly from Strapi proxy
router.get('/products', getStrapiProducts);

// Trigger full sync from Strapi to PostgreSQL (Admin only)
router.post('/sync', protect, admin, triggerSync);

export default router;
