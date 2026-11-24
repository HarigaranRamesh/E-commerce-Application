import express from 'express';
import {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
} from '../controllers/wishlistController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All wishlist operations require a valid login session

router.route('/')
    .get(getWishlist)
    .post(addToWishlist)
    .delete(clearWishlist);

router.route('/:id')
    .delete(removeFromWishlist);

export default router;
