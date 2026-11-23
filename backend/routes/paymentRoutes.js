import express from 'express';
import { createPaymentIntent, verifyPayment, getInvoice } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create-intent', protect, createPaymentIntent);
router.post('/verify', protect, verifyPayment);
router.get('/invoice/:orderId', protect, getInvoice);

export default router;
