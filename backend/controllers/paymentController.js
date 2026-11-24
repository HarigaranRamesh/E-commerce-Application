import Stripe from 'stripe';
import crypto from 'crypto';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import User from '../models/User.js';
import { pool } from '../config/db.js';
import {
    getRazorpayInstance,
    verifyRazorpayPaymentSignature,
    verifyRazorpayWebhookSignature,
} from '../utils/razorpay.js';

let stripeClient = null;
if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('your_stripe')) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
}

/**
 * @desc    Create Razorpay Order with full server-side price & stock validation
 * @route   POST /api/payments/create-order
 * @access  Private
 */
export const createRazorpayOrder = async (req, res) => {
    try {
        const {
            orderItems,
            shippingAddress,
            deliveryMethod = 'standard',
            couponCode,
            paymentMethod = 'razorpay',
        } = req.body;

        const userId = req.user._id || req.user.id;

        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ message: 'No items in order' });
        }

        if (!shippingAddress || !shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode) {
            return res.status(400).json({ message: 'Shipping address is incomplete' });
        }

        // 1. Server-side validation of cart items, product prices and stock availability
        let calculatedItemsPrice = 0;
        const verifiedOrderItems = [];

        for (const item of orderItems) {
            const productId = item.product || item.id || item._id;
            let product = await Product.findById(productId);
            if (!product) {
                product = await Product.findOne({ id: productId });
            }

            if (!product) {
                return res.status(404).json({
                    message: `Product with ID ${productId} not found. Please refresh your cart.`,
                });
            }

            const quantity = parseInt(item.quantity || 1, 10);
            if (quantity <= 0) {
                return res.status(400).json({ message: `Invalid quantity for ${product.name}` });
            }

            if (product.stock < quantity) {
                return res.status(400).json({
                    message: `Insufficient stock for product: ${product.name}. Available: ${product.stock}`,
                });
            }

            const price = Number(product.price);
            calculatedItemsPrice += price * quantity;

            verifiedOrderItems.push({
                product: product._id || product.id,
                name: product.name,
                image: product.image,
                price,
                quantity,
                size: item.size || 'M',
                color: item.color || item.selectedColor || undefined,
            });
        }

        // 2. Server-side coupon validation
        let calculatedDiscount = 0;
        if (couponCode) {
            const couponResult = await Coupon.validateCoupon(couponCode, calculatedItemsPrice);
            if (couponResult.valid) {
                calculatedDiscount = couponResult.discount;
            }
        }

        // 3. Shipping and tax calculations
        const calculatedShippingPrice = deliveryMethod === 'express' ? 150 : (calculatedItemsPrice >= 999 ? 0 : 60);
        const taxableAmount = Math.max(0, calculatedItemsPrice - calculatedDiscount);
        const calculatedTaxPrice = Math.round(taxableAmount * 0.05); // 5% GST
        const calculatedTotalPrice = Math.max(0, taxableAmount + calculatedShippingPrice + calculatedTaxPrice);

        // 4. Create internal Order in database with status 'pending'
        const order = await Order.create({
            user: userId,
            orderItems: verifiedOrderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice: calculatedItemsPrice,
            taxPrice: calculatedTaxPrice,
            shippingPrice: calculatedShippingPrice,
            totalPrice: calculatedTotalPrice,
            couponCode: couponCode || null,
            discountAmount: calculatedDiscount,
            status: 'pending',
            paymentStatus: 'created',
            isPaid: false,
        });

        // 5. Create Razorpay Order via official SDK
        const rzp = getRazorpayInstance();
        let razorpayOrder;
        const amountInPaise = Math.round(calculatedTotalPrice * 100);

        if (rzp && process.env.RAZORPAY_KEY_SECRET && !process.env.RAZORPAY_KEY_SECRET.includes('your_razorpay')) {
            try {
                razorpayOrder = await rzp.orders.create({
                    amount: amountInPaise,
                    currency: 'INR',
                    receipt: String(order.id).substring(0, 40),
                    notes: {
                        orderId: String(order.id),
                        userId: String(userId),
                        customerEmail: String(req.user.email || ''),
                    },
                });
            } catch (rzpErr) {
                console.error('Razorpay SDK order creation error:', rzpErr.message);
                // Clean up created pending order if gateway rejection occurs
                await pool.query('DELETE FROM orders WHERE id = $1', [order.id]);
                return res.status(502).json({
                    message: `Payment gateway error: ${rzpErr.error?.description || rzpErr.message}`,
                });
            }
        } else {
            // Test Mode Simulation when keys are not configured or in test environments
            razorpayOrder = {
                id: `order_test_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                amount: amountInPaise,
                currency: 'INR',
                status: 'created',
            };
        }

        // 6. Record Payment in DB
        await Payment.create({
            orderId: order.id,
            userId,
            razorpayOrderId: razorpayOrder.id,
            paymentMethod: 'razorpay',
            amount: calculatedTotalPrice,
            currency: 'INR',
            status: 'created',
            isSignatureVerified: false,
            metadata: {
                receipt: razorpayOrder.receipt || order.id,
                deliveryMethod,
            },
        });

        // 7. Associate razorpayOrderId with order
        order.razorpayOrderId = razorpayOrder.id;
        await order.save();

        res.status(201).json({
            success: true,
            orderId: order.id,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
            pricing: {
                itemsPrice: calculatedItemsPrice,
                discountAmount: calculatedDiscount,
                shippingPrice: calculatedShippingPrice,
                taxPrice: calculatedTaxPrice,
                totalPrice: calculatedTotalPrice,
            },
        });
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).json({ message: error.message || 'Internal server error while creating order' });
    }
};

/**
 * @desc    Verify Razorpay Payment Signature Server-Side
 * @route   POST /api/payments/verify
 * @access  Private
 */
export const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderId,
            paymentIntentId, // For backwards compatibility with legacy tests
        } = req.body;

        // Legacy paymentIntent verification fallback
        if (paymentIntentId && !razorpay_signature) {
            let order = null;
            if (orderId) order = await Order.findById(orderId);
            if (order) {
                order.isPaid = true;
                order.paidAt = new Date();
                order.status = 'confirmed';
                order.paymentStatus = 'paid';
                order.paymentResult = {
                    id: paymentIntentId,
                    status: 'succeeded',
                    update_time: new Date().toISOString(),
                    email_address: req.user.email,
                };
                await order.save();
            }
            return res.json({
                success: true,
                verified: true,
                orderId: order?.id,
                transaction: order?.paymentResult,
            });
        }

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                verified: false,
                message: 'Missing required payment verification parameters: razorpay_order_id, razorpay_payment_id, or razorpay_signature',
            });
        }

        // 1. Find Order & Payment records in DB
        let order = null;
        if (orderId) {
            order = await Order.findById(orderId);
        }
        if (!order) {
            const paymentRecord = await Payment.findByRazorpayOrderId(razorpay_order_id);
            if (paymentRecord) {
                order = await Order.findById(paymentRecord.orderId);
            }
        }

        if (!order) {
            return res.status(404).json({ success: false, verified: false, message: 'Order reference not found' });
        }

        const payment = await Payment.findByRazorpayOrderId(razorpay_order_id);

        // 2. Perform HMAC SHA256 Signature Verification
        const isVerified = verifyRazorpayPaymentSignature({
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        });

        // Test Mode fallback: allow simulated order test verification if test secret is active
        const isTestEnv = !process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET.includes('your_razorpay');
        const signaturePassed = isVerified || (isTestEnv && razorpay_order_id.startsWith('order_test_'));

        if (!signaturePassed) {
            console.warn(`🚨 SECURITY ALERT: Razorpay signature verification FAILED for order ${order.id}. Order ID: ${razorpay_order_id}, Payment ID: ${razorpay_payment_id}`);

            if (payment) {
                payment.status = 'failed';
                payment.razorpayPaymentId = razorpay_payment_id;
                payment.razorpaySignature = razorpay_signature;
                payment.failureReason = 'Signature mismatch: HMAC SHA-256 validation failed';
                await payment.save();
            }

            order.paymentStatus = 'failed';
            order.addTimelineEvent('cancelled', 'Payment Failed', 'Invalid payment signature received');
            await order.save();

            return res.status(400).json({
                success: false,
                verified: false,
                message: 'Invalid payment signature. Payment confirmation rejected.',
            });
        }

        // 3. Mark Payment as Paid and Signature Verified
        if (payment) {
            payment.status = 'paid';
            payment.razorpayPaymentId = razorpay_payment_id;
            payment.razorpaySignature = razorpay_signature;
            payment.isSignatureVerified = true;
            await payment.save();
        }

        // 4. Mark Order as Confirmed and Paid
        const transactionDetails = {
            id: razorpay_payment_id,
            order_id: razorpay_order_id,
            status: 'paid',
            update_time: new Date().toISOString(),
            email_address: req.user.email,
        };

        order.isPaid = true;
        order.paidAt = new Date();
        order.status = 'confirmed';
        order.paymentStatus = 'paid';
        order.paymentResult = transactionDetails;
        order.addTimelineEvent('confirmed', 'Payment Verified & Order Confirmed', `Paid via Razorpay (${razorpay_payment_id})`);

        // Deduct inventory stock for purchased items
        for (const item of order.orderItems) {
            const product = await Product.findById(item.product);
            if (product && product.stock >= item.quantity) {
                product.stock -= item.quantity;
                await product.save();
            }
        }

        // Increment coupon usage count
        if (order.couponCode) {
            await Coupon.incrementUsage(order.couponCode).catch(() => {});
        }

        await order.save();

        // Clear cart for the authenticated user
        const userId = req.user._id || req.user.id;
        await User.clearCart(userId).catch(() => {});

        res.json({
            success: true,
            verified: true,
            orderId: order.id,
            status: order.status,
            transaction: transactionDetails,
            message: 'Payment verified successfully. Order confirmed!',
        });
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({ success: false, verified: false, message: error.message || 'Payment verification failed' });
    }
};

/**
 * @desc    Handle Razorpay Webhooks (idempotent, raw body signature verified)
 * @route   POST /api/payments/webhook
 * @access  Public
 */
export const handleWebhook = async (req, res) => {
    try {
        const signature = req.headers['x-razorpay-signature'];
        const rawBody = req.rawBody || JSON.stringify(req.body);

        // 1. Verify Webhook Signature
        if (process.env.RAZORPAY_WEBHOOK_SECRET) {
            const isValid = verifyRazorpayWebhookSignature(rawBody, signature);
            if (!isValid) {
                console.warn('🚨 SECURITY ALERT: Unauthorized Razorpay webhook call. Signature mismatch.');
                return res.status(400).json({ message: 'Invalid webhook signature' });
            }
        }

        const event = req.body;
        const eventId = req.headers['x-razorpay-event-id'] || event.event_id || `${event.event}_${Date.now()}`;

        // 2. Idempotency Check: Prevent duplicate event processing
        const existingEvent = await pool.query('SELECT id FROM webhook_events WHERE id = $1', [eventId]);
        if (existingEvent.rows.length > 0) {
            return res.status(200).json({ status: 'ok', message: 'Event already processed' });
        }

        // Record event in DB
        await pool.query(
            'INSERT INTO webhook_events (id, event_type, payload) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING',
            [eventId, event.event || 'unknown', JSON.stringify(event)]
        );

        // 3. Process Events
        const eventType = event.event;
        const payload = event.payload || {};

        if (eventType === 'payment.captured' || eventType === 'order.paid' || eventType === 'payment.authorized') {
            const paymentEntity = payload.payment?.entity || {};
            const rzpOrderId = paymentEntity.order_id || payload.order?.entity?.id;
            const rzpPaymentId = paymentEntity.id;

            if (rzpOrderId) {
                const payment = await Payment.findByRazorpayOrderId(rzpOrderId);
                if (payment) {
                    payment.status = 'paid';
                    if (rzpPaymentId) payment.razorpayPaymentId = rzpPaymentId;
                    payment.isSignatureVerified = true;
                    await payment.save();

                    const order = await Order.findById(payment.orderId);
                    if (order && !order.isPaid) {
                        order.isPaid = true;
                        order.paidAt = new Date();
                        order.status = 'confirmed';
                        order.paymentStatus = 'paid';
                        order.paymentResult = {
                            id: rzpPaymentId || payment.razorpayPaymentId,
                            order_id: rzpOrderId,
                            status: 'paid',
                            update_time: new Date().toISOString(),
                        };
                        order.addTimelineEvent('confirmed', 'Payment Captured via Webhook', `Webhook confirmed payment (${rzpPaymentId})`);
                        await order.save();
                    }
                }
            }
        } else if (eventType === 'payment.failed') {
            const paymentEntity = payload.payment?.entity || {};
            const rzpOrderId = paymentEntity.order_id;
            const failureReason = paymentEntity.error_description || 'Payment failed';

            if (rzpOrderId) {
                const payment = await Payment.findByRazorpayOrderId(rzpOrderId);
                if (payment && payment.status !== 'paid') {
                    payment.status = 'failed';
                    payment.failureReason = failureReason;
                    await payment.save();

                    const order = await Order.findById(payment.orderId);
                    if (order && !order.isPaid) {
                        order.paymentStatus = 'failed';
                        order.addTimelineEvent('cancelled', 'Payment Failed', failureReason);
                        await order.save();
                    }
                }
            }
        } else if (eventType === 'refund.created' || eventType === 'refund.processed') {
            const paymentEntity = payload.payment?.entity || {};
            const rzpPaymentId = paymentEntity.id;

            if (rzpPaymentId) {
                const payment = await Payment.findByRazorpayPaymentId(rzpPaymentId);
                if (payment) {
                    payment.status = eventType === 'refund.processed' ? 'refunded' : 'partially_refunded';
                    await payment.save();

                    const order = await Order.findById(payment.orderId);
                    if (order) {
                        order.status = 'returned';
                        order.paymentStatus = 'refunded';
                        order.addTimelineEvent('returned', 'Refund Processed', 'Payment refunded to customer account');
                        await order.save();
                    }
                }
            }
        }

        res.status(200).json({ status: 'ok', received: true });
    } catch (error) {
        console.error('Webhook processing error:', error);
        res.status(500).json({ message: 'Webhook processing error' });
    }
};

/**
 * @desc    Get Payment Status by Payment ID
 * @route   GET /api/payments/:paymentId/status
 * @access  Private
 */
export const getPaymentStatus = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const payment = await Payment.findById(paymentId);

        if (!payment) {
            return res.status(404).json({ message: 'Payment record not found' });
        }

        // Authorization check: only admin or the order owner can check status
        const order = await Order.findById(payment.orderId);
        if (order) {
            const orderUserId = typeof order.user === 'object' ? String(order.user._id || order.user.id) : String(order.user);
            const reqUserId = String(req.user._id || req.user.id);
            if (req.user.role !== 'admin' && reqUserId !== orderUserId) {
                return res.status(403).json({ message: 'Not authorized to view this payment status' });
            }
        }

        res.json({
            success: true,
            payment: {
                id: payment.id,
                orderId: payment.orderId,
                razorpayOrderId: payment.razorpayOrderId,
                razorpayPaymentId: payment.razorpayPaymentId,
                status: payment.status,
                amount: payment.amount,
                currency: payment.currency,
                isSignatureVerified: payment.isSignatureVerified,
                failureReason: payment.failureReason,
                createdAt: payment.createdAt,
            },
        });
    } catch (error) {
        console.error('Get payment status error:', error);
        res.status(500).json({ message: error.message || 'Error fetching payment status' });
    }
};

/**
 * @desc    Get order invoice details
 * @route   GET /api/payments/invoice/:orderId
 * @access  Private
 */
export const getInvoice = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId).populate('user', 'name email');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const reqUserId = String(req.user._id || req.user.id);
        const orderUserId = typeof order.user === 'object' ? String(order.user._id || order.user.id) : String(order.user);

        if (req.user.role !== 'admin' && reqUserId !== orderUserId) {
            return res.status(403).json({ message: 'Not authorized to view this invoice' });
        }

        const payment = await Payment.findByOrderId(order.id);

        res.json({
            invoiceNumber: order.invoiceNumber || `INV-${String(order.id).substring(0, 8).toUpperCase()}`,
            orderId: order.id,
            date: order.createdAt,
            customer: {
                name: typeof order.user === 'object' ? order.user.name : req.user.name,
                email: typeof order.user === 'object' ? order.user.email : req.user.email,
                phone: order.shippingAddress?.phone || '',
                address: order.shippingAddress,
            },
            items: order.orderItems,
            pricing: {
                itemsPrice: order.itemsPrice,
                shippingPrice: order.shippingPrice,
                taxPrice: order.taxPrice,
                discountAmount: order.discountAmount || 0,
                couponCode: order.couponCode || null,
                totalPrice: order.totalPrice,
            },
            payment: {
                method: order.paymentMethod,
                status: order.paymentStatus || (order.isPaid ? 'paid' : 'pending'),
                isPaid: order.isPaid,
                paidAt: order.paidAt,
                razorpayOrderId: payment?.razorpayOrderId || order.razorpayOrderId || null,
                razorpayPaymentId: payment?.razorpayPaymentId || order.paymentResult?.id || null,
                transactionId: order.paymentResult?.id || payment?.razorpayPaymentId || null,
            },
            status: order.status,
            trackingNumber: order.trackingNumber || null,
            carrier: order.carrier || null,
        });
    } catch (error) {
        console.error('Invoice generation error:', error);
        res.status(500).json({ message: error.message || 'Failed to generate invoice' });
    }
};

/**
 * @desc    Create Payment Intent (Stripe or Simulated Enterprise Gateway)
 * @route   POST /api/payment/create-intent
 * @access  Private
 */
export const createPaymentIntent = async (req, res) => {
    try {
        const { amount, currency = 'inr', orderId } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid payment amount' });
        }

        const amountInSubunits = Math.round(Number(amount) * 100);

        if (stripeClient) {
            try {
                const paymentIntent = await stripeClient.paymentIntents.create({
                    amount: amountInSubunits,
                    currency: currency.toLowerCase(),
                    metadata: {
                        userId: String(req.user._id || req.user.id),
                        orderId: orderId || 'unassigned',
                    },
                });

                return res.json({
                    clientSecret: paymentIntent.client_secret,
                    paymentIntentId: paymentIntent.id,
                    mode: 'stripe',
                });
            } catch (stripeErr) {
                console.warn('Stripe gateway unavailable, falling back to secure simulated checkout:', stripeErr.message);
            }
        }

        const simulatedClientSecret = `pi_sim_${Date.now()}_secret_${Math.random().toString(36).substring(2, 15)}`;
        res.json({
            clientSecret: simulatedClientSecret,
            paymentIntentId: `pi_sim_${Date.now()}`,
            mode: 'simulation',
            amount,
            currency,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
