import { pool } from '../config/db.js';

class CouponInstance {
    constructor(row) {
        this.id = row.id;
        this._id = row.id;
        this.code = row.code;
        this.discountType = row.discount_type;
        this.discountValue = parseFloat(row.discount_value);
        this.minPurchase = parseFloat(row.min_purchase || 0);
        this.maxDiscount = row.max_discount ? parseFloat(row.max_discount) : null;
        this.expiresAt = row.expires_at;
        this.isActive = Boolean(row.is_active);
        this.usageCount = parseInt(row.usage_count || 0, 10);
        this.createdAt = row.created_at;
    }
}

const Coupon = {
    async findByCode(code) {
        if (!code) return null;
        const res = await pool.query(
            'SELECT * FROM coupons WHERE UPPER(code) = UPPER($1) AND is_active = true LIMIT 1',
            [code.trim()]
        );
        if (res.rows.length === 0) return null;
        return new CouponInstance(res.rows[0]);
    },

    async validateCoupon(code, cartTotal) {
        const coupon = await this.findByCode(code);
        if (!coupon) {
            return { valid: false, message: 'Invalid or expired coupon code' };
        }

        if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
            return { valid: false, message: 'This coupon has expired' };
        }

        if (cartTotal < coupon.minPurchase) {
            return {
                valid: false,
                message: `Minimum purchase of ₹${coupon.minPurchase} required for coupon ${coupon.code}`,
            };
        }

        let discount = 0;
        if (coupon.discountType === 'percentage') {
            discount = (cartTotal * coupon.discountValue) / 100;
            if (coupon.maxDiscount && discount > coupon.maxDiscount) {
                discount = coupon.maxDiscount;
            }
        } else {
            discount = coupon.discountValue;
        }

        // Discount cannot exceed cart total
        discount = Math.min(discount, cartTotal);

        return {
            valid: true,
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            discount: parseFloat(discount.toFixed(2)),
            message: `Coupon ${coupon.code} applied successfully!`,
        };
    },

    async incrementUsage(code) {
        await pool.query(
            'UPDATE coupons SET usage_count = usage_count + 1 WHERE UPPER(code) = UPPER($1)',
            [code.trim()]
        );
    },

    async find() {
        const res = await pool.query('SELECT * FROM coupons ORDER BY created_at DESC');
        return res.rows.map((row) => new CouponInstance(row));
    },

    async create(data) {
        const queryText = `
            INSERT INTO coupons (code, discount_type, discount_value, min_purchase, max_discount, expires_at, is_active)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
        const values = [
            data.code.toUpperCase().trim(),
            data.discountType || 'percentage',
            data.discountValue,
            data.minPurchase || 0,
            data.maxDiscount || null,
            data.expiresAt || null,
            data.isActive !== undefined ? data.isActive : true,
        ];
        const res = await pool.query(queryText, values);
        return new CouponInstance(res.rows[0]);
    },
};

export default Coupon;
