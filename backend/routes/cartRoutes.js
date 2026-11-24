import express from 'express';
import {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
} from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All cart operations require a valid login session

router.route('/')
    .get(getCart)
    .post(addToCart)
    .put(updateCartItem)
    .delete(clearCart);

router.route('/:itemKey')
    .delete(removeFromCart);

export default router;
