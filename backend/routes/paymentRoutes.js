import express from 'express';
import { createPaymentIntent, getStripeConfig } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create-payment-intent', protect, createPaymentIntent);
router.get('/config', getStripeConfig);

export default router;
