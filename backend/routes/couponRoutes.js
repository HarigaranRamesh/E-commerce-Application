import express from 'express';
import { validateCoupon, getCoupons, createCoupon } from '../controllers/couponController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/validate', validateCoupon);
router.route('/').get(protect, admin, getCoupons).post(protect, admin, createCoupon);

export default router;
