import { pool } from '../config/db.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

class OrderInstance {
    constructor(row) {
        this.id = row.id;
        this._id = row.id;
        this.user = row.user_id;
        this.orderItems = Array.isArray(row.order_items) ? row.order_items : [];
        this.shippingAddress = typeof row.shipping_address === 'object' && row.shipping_address !== null ? row.shipping_address : {};
        this.paymentMethod = row.payment_method;
        this.paymentResult = typeof row.payment_result === 'object' && row.payment_result !== null ? row.payment_result : {};
        this.itemsPrice = row.items_price !== null ? parseFloat(row.items_price) : 0;
        this.taxPrice = row.tax_price !== null ? parseFloat(row.tax_price) : 0;
        this.shippingPrice = row.shipping_price !== null ? parseFloat(row.shipping_price) : 0;
        this.totalPrice = row.total_price !== null ? parseFloat(row.total_price) : 0;
        this.discountAmount = row.discount_amount !== null ? parseFloat(row.discount_amount) : 0;
        this.couponCode = row.coupon_code || null;
        this.isPaid = Boolean(row.is_paid);
        this.paidAt = row.paid_at;
        this.paymentStatus = row.payment_status || (this.isPaid ? 'paid' : 'pending');
        this.razorpayOrderId = row.razorpay_order_id || null;
        this.isDelivered = Boolean(row.is_delivered);
        this.deliveredAt = row.delivered_at;
        this.status = row.status || 'pending';
        this.timeline = Array.isArray(row.timeline) && row.timeline.length > 0 ? row.timeline : [
            { status: 'pending', title: 'Order Placed', timestamp: row.created_at, note: 'Order details received' }
        ];
        this.trackingNumber = row.tracking_number || null;
        this.carrier = row.carrier || null;
        this.invoiceNumber = row.invoice_number || `INV-${String(row.id).substring(0, 8).toUpperCase()}`;
        this.createdAt = row.created_at;
        this.updatedAt = row.updated_at;

        if (row.user_name) {
            this.user = {
                id: row.user_id,
                _id: row.user_id,
                name: row.user_name,
                email: row.user_email,
            };
        }
    }

    addTimelineEvent(status, title, note = '') {
        const event = {
            status,
            title,
            timestamp: new Date().toISOString(),
            note,
        };
        this.timeline.push(event);
        this.status = status;
        if (status === 'delivered') {
            this.isDelivered = true;
            this.deliveredAt = new Date();
        }
    }

    async save() {
        const queryText = `
            UPDATE orders
            SET order_items = $1, shipping_address = $2, payment_method = $3,
                payment_result = $4, items_price = $5, tax_price = $6,
                shipping_price = $7, total_price = $8, is_paid = $9,
                paid_at = $10, is_delivered = $11, delivered_at = $12,
                status = $13, coupon_code = $14, discount_amount = $15,
                timeline = $16, tracking_number = $17, carrier = $18,
                invoice_number = $19, payment_status = $20, razorpay_order_id = $21,
                updated_at = NOW()
            WHERE id = $22
            RETURNING *;
        `;
        const values = [
            JSON.stringify(this.orderItems || []),
            JSON.stringify(this.shippingAddress || {}),
            this.paymentMethod,
            JSON.stringify(this.paymentResult || {}),
            this.itemsPrice,
            this.taxPrice,
            this.shippingPrice,
            this.totalPrice,
            this.isPaid,
            this.paidAt,
            this.isDelivered,
            this.deliveredAt,
            this.status,
            this.couponCode,
            this.discountAmount,
            JSON.stringify(this.timeline || []),
            this.trackingNumber,
            this.carrier,
            this.invoiceNumber,
            this.paymentStatus || (this.isPaid ? 'paid' : 'pending'),
            this.razorpayOrderId || null,
            this.id,
        ];

        const res = await pool.query(queryText, values);
        if (res.rows.length > 0) {
            Object.assign(this, new OrderInstance(res.rows[0]));
        }
        return this;
    }
}

class OrderQueryBuilder {
    constructor(filter = {}) {
        this.filter = filter;
        this.doPopulate = false;
        this.orderBy = 'o.created_at DESC';
        this.limitNum = undefined;
        this.offset = undefined;
        this.isSingle = false;
        this.singleId = null;
    }

    populate(path, fields) {
        if (path === 'user') {
            this.doPopulate = true;
        }
        return this;
    }

    sort(sortObj) {
        if (typeof sortObj === 'string') {
            if (sortObj === 'oldest' || sortObj === 'date_asc') this.orderBy = 'o.created_at ASC';
            else if (sortObj === 'total_high') this.orderBy = 'o.total_price DESC';
            else if (sortObj === 'total_low') this.orderBy = 'o.total_price ASC';
            else this.orderBy = 'o.created_at DESC';
        } else if (sortObj?.createdAt === 1) {
            this.orderBy = 'o.created_at ASC';
        } else if (sortObj?.totalPrice === 1) {
            this.orderBy = 'o.total_price ASC';
        } else if (sortObj?.totalPrice === -1) {
            this.orderBy = 'o.total_price DESC';
        } else {
            this.orderBy = 'o.created_at DESC';
        }
        return this;
    }

    limit(lim) {
        this.limitNum = lim !== undefined ? parseInt(lim, 10) : undefined;
        return this;
    }

    skip(offset) {
        this.offset = offset !== undefined ? parseInt(offset, 10) : undefined;
        return this;
    }

    _buildConditions() {
        const conditions = [];
        const values = [];

        if (this.filter.user) {
            const targetUserId = String(this.filter.user);
            if (UUID_REGEX.test(targetUserId)) {
                values.push(targetUserId);
                conditions.push(`o.user_id = $${values.length}`);
            } else {
                conditions.push('1 = 0');
            }
        }

        if (this.filter.status && this.filter.status !== 'all') {
            values.push(this.filter.status);
            conditions.push(`o.status = $${values.length}`);
        }

        if (this.filter.isPaid !== undefined && this.filter.isPaid !== '' && this.filter.isPaid !== 'all') {
            values.push(this.filter.isPaid === 'true' || this.filter.isPaid === true);
            conditions.push(`o.is_paid = $${values.length}`);
        }

        if (this.filter.search) {
            values.push(`%${this.filter.search.trim()}%`);
            conditions.push(`(o.id::text ILIKE $${values.length} OR o.invoice_number ILIKE $${values.length} OR u.name ILIKE $${values.length} OR u.email ILIKE $${values.length})`);
        }

        return { conditions, values };
    }

    async count() {
        const { conditions, values } = this._buildConditions();
        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        const sql = `SELECT COUNT(*)::int AS count
                     FROM orders o
                     LEFT JOIN users u ON o.user_id = u.id
                     ${whereClause}`;
        const res = await pool.query(sql, values);
        return res.rows[0]?.count || 0;
    }

    async exec() {
        if (this.isSingle) {
            const targetId = String(this.singleId);
            if (!UUID_REGEX.test(targetId)) return null;

            const sql = this.doPopulate
                ? `SELECT o.*, u.name as user_name, u.email as user_email
                   FROM orders o
                   LEFT JOIN users u ON o.user_id = u.id
                   WHERE o.id = $1 LIMIT 1`
                : `SELECT * FROM orders WHERE id = $1 LIMIT 1`;
            const res = await pool.query(sql, [targetId]);
            if (res.rows.length === 0) return null;
            return new OrderInstance(res.rows[0]);
        }

        const { conditions, values } = this._buildConditions();
        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        let limitOffsetClause = '';
        if (this.limitNum !== undefined) {
            values.push(this.limitNum);
            limitOffsetClause += ` LIMIT $${values.length}`;
        }
        if (this.offset !== undefined) {
            values.push(this.offset);
            limitOffsetClause += ` OFFSET $${values.length}`;
        }

        const sql = `SELECT o.*, u.name as user_name, u.email as user_email
                     FROM orders o
                     LEFT JOIN users u ON o.user_id = u.id
                     ${whereClause}
                     ORDER BY ${this.orderBy}
                     ${limitOffsetClause}`;

        const res = await pool.query(sql, values);
        return res.rows.map((row) => new OrderInstance(row));
    }

    then(resolve, reject) {
        return this.exec().then(resolve, reject);
    }

    catch(reject) {
        return this.exec().catch(reject);
    }
}

const Order = {
    async create(data) {
        const initialTimeline = [
            {
                status: 'pending',
                title: 'Order Placed',
                timestamp: new Date().toISOString(),
                note: `Payment via ${data.paymentMethod?.toUpperCase() || 'COD'}`,
            },
        ];

        const invoiceNum = `INV-${Date.now().toString(36).toUpperCase()}`;

        const queryText = `
            INSERT INTO orders (
                user_id, order_items, shipping_address, payment_method,
                payment_result, items_price, tax_price, shipping_price,
                total_price, is_paid, paid_at, is_delivered, delivered_at,
                status, coupon_code, discount_amount, timeline, invoice_number,
                payment_status, razorpay_order_id
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
            RETURNING *;
        `;
        const values = [
            data.user,
            JSON.stringify(data.orderItems || []),
            JSON.stringify(data.shippingAddress || {}),
            data.paymentMethod,
            JSON.stringify(data.paymentResult || {}),
            data.itemsPrice || 0,
            data.taxPrice || 0,
            data.shippingPrice || 0,
            data.totalPrice || 0,
            Boolean(data.isPaid),
            data.paidAt || null,
            Boolean(data.isDelivered),
            data.deliveredAt || null,
            data.status || 'pending',
            data.couponCode || null,
            data.discountAmount || 0,
            JSON.stringify(initialTimeline),
            invoiceNum,
            data.paymentStatus || (data.isPaid ? 'paid' : 'pending'),
            data.razorpayOrderId || null,
        ];

        const res = await pool.query(queryText, values);
        return new OrderInstance(res.rows[0]);
    },

    findById(id) {
        const builder = new OrderQueryBuilder();
        builder.isSingle = true;
        builder.singleId = id;
        return builder;
    },

    find(filter = {}) {
        return new OrderQueryBuilder(filter);
    },

    count(filter = {}) {
        return new OrderQueryBuilder(filter).count();
    },

    async countDocuments() {
        const res = await pool.query('SELECT COUNT(*)::int AS count FROM orders');
        return res.rows[0].count;
    },

    async aggregate(pipeline = []) {
        const res = await pool.query(`
            SELECT status AS "_id", COUNT(*)::int AS count
            FROM orders
            GROUP BY status;
        `);
        return res.rows;
    },

    async deleteMany() {
        const res = await pool.query('DELETE FROM orders');
        return { deletedCount: res.rowCount };
    },
};

export default Order;
