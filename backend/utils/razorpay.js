import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const key_id = process.env.RAZORPAY_KEY_ID;
const key_secret = process.env.RAZORPAY_KEY_SECRET;
const webhook_secret = process.env.RAZORPAY_WEBHOOK_SECRET;

let razorpayClient = null;

if (key_id && key_secret) {
    razorpayClient = new Razorpay({
        key_id,
        key_secret,
    });
}

/**
 * Returns the initialized Razorpay SDK client
 */
export const getRazorpayInstance = () => {
    if (!razorpayClient && process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
        razorpayClient = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
    }
    return razorpayClient;
};

/**
 * Verifies Razorpay Payment Signature using HMAC SHA-256
 * @param {Object} params
 * @param {string} params.razorpay_order_id
 * @param {string} params.razorpay_payment_id
 * @param {string} params.razorpay_signature
 * @returns {boolean}
 */
export const verifyRazorpayPaymentSignature = ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return false;
    }

    try {
        const body = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(body)
            .digest('hex');

        // Timing-safe buffer comparison to prevent timing attacks
        const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
        const signatureBuffer = Buffer.from(razorpay_signature, 'utf8');

        if (expectedBuffer.length !== signatureBuffer.length) {
            return false;
        }

        return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
    } catch (err) {
        console.error('Signature verification error:', err.message);
        return false;
    }
};

/**
 * Verifies Razorpay Webhook Signature using raw body buffer and HMAC SHA-256
 * @param {Buffer|string} rawBody
 * @param {string} signature
 * @returns {boolean}
 */
export const verifyRazorpayWebhookSignature = (rawBody, signature) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret || !rawBody || !signature) {
        return false;
    }

    try {
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(rawBody)
            .digest('hex');

        const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
        const signatureBuffer = Buffer.from(signature, 'utf8');

        if (expectedBuffer.length !== signatureBuffer.length) {
            return false;
        }

        return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
    } catch (err) {
        console.error('Webhook signature verification error:', err.message);
        return false;
    }
};

export default {
    getRazorpayInstance,
    verifyRazorpayPaymentSignature,
    verifyRazorpayWebhookSignature,
};
