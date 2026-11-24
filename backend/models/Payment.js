import { pool } from '../config/db.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class PaymentInstance {
    constructor(row) {
        this.id = row.id;
        this._id = row.id;
        this.orderId = row.order_id;
        this.userId = row.user_id;
        this.razorpayOrderId = row.razorpay_order_id;
        this.razorpayPaymentId = row.razorpay_payment_id;
        this.razorpaySignature = row.razorpay_signature;
        this.paymentMethod = row.payment_method || 'razorpay';
        this.amount = row.amount !== null ? parseFloat(row.amount) : 0;
        this.currency = row.currency || 'INR';
        this.status = row.status || 'created'; // created, pending, authorized, paid, failed, cancelled, refunded, partially_refunded
        this.isSignatureVerified = Boolean(row.is_signature_verified);
        this.failureReason = row.failure_reason || null;
        this.metadata = typeof row.metadata === 'object' && row.metadata !== null ? row.metadata : {};
        this.createdAt = row.created_at;
        this.updatedAt = row.updated_at;
    }

    async save() {
        const queryText = `
            UPDATE payments
            SET razorpay_payment_id = $1, razorpay_signature = $2,
                status = $3, is_signature_verified = $4,
                failure_reason = $5, metadata = $6, updated_at = NOW()
            WHERE id = $7
            RETURNING *;
        `;
        const values = [
            this.razorpayPaymentId,
            this.razorpaySignature,
            this.status,
            this.isSignatureVerified,
            this.failureReason,
            JSON.stringify(this.metadata || {}),
            this.id,
        ];

        const res = await pool.query(queryText, values);
        if (res.rows.length > 0) {
            Object.assign(this, new PaymentInstance(res.rows[0]));
        }
        return this;
    }
}

const Payment = {
    async create(data) {
        const queryText = `
            INSERT INTO payments (
                order_id, user_id, razorpay_order_id, razorpay_payment_id,
                razorpay_signature, payment_method, amount, currency,
                status, is_signature_verified, failure_reason, metadata
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *;
        `;
        const values = [
            data.orderId,
            data.userId || null,
            data.razorpayOrderId,
            data.razorpayPaymentId || null,
            data.razorpaySignature || null,
            data.paymentMethod || 'razorpay',
            data.amount,
            data.currency || 'INR',
            data.status || 'created',
            Boolean(data.isSignatureVerified),
            data.failureReason || null,
            JSON.stringify(data.metadata || {}),
        ];

        const res = await pool.query(queryText, values);
        return new PaymentInstance(res.rows[0]);
    },

    async findById(id) {
        if (!id) return null;
        const isUuid = UUID_REGEX.test(String(id));
        const res = isUuid
            ? await pool.query('SELECT * FROM payments WHERE id = $1 LIMIT 1', [id])
            : await pool.query('SELECT * FROM payments WHERE razorpay_payment_id = $1 LIMIT 1', [id]);
        return res.rows.length > 0 ? new PaymentInstance(res.rows[0]) : null;
    },

    async findByRazorpayOrderId(razorpayOrderId) {
        if (!razorpayOrderId) return null;
        const res = await pool.query('SELECT * FROM payments WHERE razorpay_order_id = $1 LIMIT 1', [razorpayOrderId]);
        return res.rows.length > 0 ? new PaymentInstance(res.rows[0]) : null;
    },

    async findByRazorpayPaymentId(razorpayPaymentId) {
        if (!razorpayPaymentId) return null;
        const res = await pool.query('SELECT * FROM payments WHERE razorpay_payment_id = $1 LIMIT 1', [razorpayPaymentId]);
        return res.rows.length > 0 ? new PaymentInstance(res.rows[0]) : null;
    },

    async findByOrderId(orderId) {
        if (!orderId) return null;
        const res = await pool.query('SELECT * FROM payments WHERE order_id = $1 ORDER BY created_at DESC LIMIT 1', [orderId]);
        return res.rows.length > 0 ? new PaymentInstance(res.rows[0]) : null;
    },
};

export default Payment;
