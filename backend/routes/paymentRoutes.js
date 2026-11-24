import express from 'express';
import {
    createRazorpayOrder,
    verifyPayment,
    handleWebhook,
    getPaymentStatus,
    getInvoice,
    createPaymentIntent,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Razorpay Order Creation (Server-side price and stock validation)
router.post('/create-order', protect, createRazorpayOrder);

// Razorpay Signature Verification
router.post('/verify', protect, verifyPayment);

// Razorpay Webhook (idempotent, rawBody signature verification)
router.post('/webhook', handleWebhook);

// Payment Status by Payment ID / Gateway ID
router.get('/:paymentId/status', protect, getPaymentStatus);

// Order Invoice Generation
router.get('/invoice/:orderId', protect, getInvoice);

// Backwards-compatible legacy intent endpoint
router.post('/create-intent', protect, createPaymentIntent);

export default router;
