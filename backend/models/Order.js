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
        this.isPaid = Boolean(row.is_paid);
        this.paidAt = row.paid_at;
        this.isDelivered = Boolean(row.is_delivered);
        this.deliveredAt = row.delivered_at;
        this.status = row.status || 'pending';
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

    async save() {
        const queryText = `
            UPDATE orders
            SET order_items = $1, shipping_address = $2, payment_method = $3,
                payment_result = $4, items_price = $5, tax_price = $6,
                shipping_price = $7, total_price = $8, is_paid = $9,
                paid_at = $10, is_delivered = $11, delivered_at = $12,
                status = $13, updated_at = NOW()
            WHERE id = $14
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
        this.sortOrder = 'DESC';
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
        if (sortObj?.createdAt === 1) {
            this.sortOrder = 'ASC';
        } else {
            this.sortOrder = 'DESC';
        }
        return this;
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

        const conditions = [];
        const values = [];

        if (this.filter.user) {
            const targetUserId = String(this.filter.user);
            if (!UUID_REGEX.test(targetUserId)) return [];
            values.push(targetUserId);
            conditions.push(`o.user_id = $${values.length}`);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        const sql = this.doPopulate
            ? `SELECT o.*, u.name as user_name, u.email as user_email
               FROM orders o
               LEFT JOIN users u ON o.user_id = u.id
               ${whereClause}
               ORDER BY o.created_at ${this.sortOrder}`
            : `SELECT o.* FROM orders o
               ${whereClause}
               ORDER BY o.created_at ${this.sortOrder}`;

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
        const queryText = `
            INSERT INTO orders (
                user_id, order_items, shipping_address, payment_method,
                payment_result, items_price, tax_price, shipping_price,
                total_price, is_paid, paid_at, is_delivered, delivered_at, status
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
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
