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

const router = express.Router();

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
