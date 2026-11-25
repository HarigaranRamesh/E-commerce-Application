import express from 'express';
import {
    getProducts,
    getProductSuggestions,
    getProductById,
    getRelatedProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    createProductReview,
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

import { categoryCache } from '../utils/lruCache.js';

const router = express.Router();

router.get('/categories', async (req, res) => {
    try {
        const cached = categoryCache.get('all_categories');
        if (cached) {
            return res.json(cached);
        }

        const { pool } = await import('../config/db.js');
        const result = await pool.query('SELECT DISTINCT category FROM products WHERE category IS NOT NULL ORDER BY category ASC');
        const categories = result.rows.map(r => r.category).filter(Boolean);
        categoryCache.set('all_categories', categories, 300000); // 5 min TTL
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/search/suggestions', getProductSuggestions);
router.get('/:id/related', getRelatedProducts);

router.route('/')
    .get(getProducts)
    .post(protect, admin, createProduct);

router.route('/:id')
    .get(getProductById)
    .put(protect, admin, updateProduct)
    .delete(protect, admin, deleteProduct);

router.route('/:id/reviews')
    .post(protect, createProductReview);

export default router;
