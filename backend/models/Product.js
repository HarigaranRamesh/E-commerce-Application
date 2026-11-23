import { pool } from '../config/db.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

class ProductInstance {
    constructor(row) {
        this.id = row.id;
        this._id = row._id || String(row.id);
        this.name = row.name;
        this.description = row.description;
        this.price = row.price !== null ? parseFloat(row.price) : 0;
        this.originalPrice = row.original_price !== null ? parseFloat(row.original_price) : undefined;
        this.category = row.category;
        this.image = row.image;
        this.images = Array.isArray(row.images) ? row.images : [];
        this.stock = row.stock !== null ? parseInt(row.stock, 10) : 0;
        this.rating = row.rating !== null ? parseFloat(row.rating) : 0;
        this.numReviews = row.num_reviews !== null ? parseInt(row.num_reviews, 10) : 0;
        this.reviews = Array.isArray(row.reviews) ? row.reviews : [];
        this.featured = Boolean(row.featured);
        this.brand = row.brand || '';
        this.tags = Array.isArray(row.tags) ? row.tags : [];
        this.createdAt = row.created_at;
        this.updatedAt = row.updated_at;
    }

    async save() {
        const queryText = `
            UPDATE products
            SET name = $1, description = $2, price = $3, original_price = $4,
                category = $5, image = $6, images = $7, stock = $8,
                rating = $9, num_reviews = $10, reviews = $11, featured = $12,
                brand = $13, tags = $14, updated_at = NOW()
            WHERE id = $15 OR _id::text = $16
            RETURNING *;
        `;
        const values = [
            this.name,
            this.description,
            this.price,
            this.originalPrice || null,
            this.category,
            this.image,
            JSON.stringify(this.images || []),
            this.stock,
            this.rating,
            this.numReviews,
            JSON.stringify(this.reviews || []),
            this.featured,
            this.brand,
            JSON.stringify(this.tags || []),
            typeof this.id === 'number' ? this.id : -1,
            String(this._id || this.id),
        ];

        const res = await pool.query(queryText, values);
        if (res.rows.length > 0) {
            Object.assign(this, new ProductInstance(res.rows[0]));
        }
        return this;
    }

    async deleteOne() {
        await pool.query('DELETE FROM products WHERE id = $1 OR _id::text = $2', [
            typeof this.id === 'number' ? this.id : -1,
            String(this._id || this.id),
        ]);
        return { acknowledged: true, deletedCount: 1 };
    }
}

const Product = {
    async find(query = {}) {
        const conditions = [];
        const values = [];

        if (query.category) {
            if (typeof query.category === 'object' && query.category.$nin) {
                const placeholders = query.category.$nin.map((val) => {
                    values.push(val);
                    return `$${values.length}`;
                });
                conditions.push(`category NOT IN (${placeholders.join(', ')})`);
            } else {
                values.push(query.category);
                conditions.push(`category = $${values.length}`);
            }
        }

        const searchTerm = query.search || query.keyword;
        if (searchTerm) {
            values.push(`%${searchTerm}%`);
            const p = `$${values.length}`;
            conditions.push(`(name ILIKE ${p} OR description ILIKE ${p})`);
        } else if (query.$or && Array.isArray(query.$or)) {
            const orParts = [];
            for (const orCond of query.$or) {
                if (orCond.name?.$regex) {
                    values.push(`%${orCond.name.$regex}%`);
                    orParts.push(`name ILIKE $${values.length}`);
                }
                if (orCond.description?.$regex) {
                    values.push(`%${orCond.description.$regex}%`);
                    orParts.push(`description ILIKE $${values.length}`);
                }
            }
            if (orParts.length > 0) {
                conditions.push(`(${orParts.join(' OR ')})`);
            }
        }

        if (query.featured !== undefined) {
            values.push(Boolean(query.featured));
            conditions.push(`featured = $${values.length}`);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        const sql = `SELECT * FROM products ${whereClause} ORDER BY id ASC`;
        const res = await pool.query(sql, values);

        return res.rows.map((row) => new ProductInstance(row));
    },

    async findById(id) {
        if (!id) return null;

        const isNumeric = !isNaN(Number(id));
        const isUuid = UUID_REGEX.test(String(id));

        let res;
        if (isNumeric) {
            res = await pool.query('SELECT * FROM products WHERE id = $1 LIMIT 1', [Number(id)]);
        } else if (isUuid) {
            res = await pool.query('SELECT * FROM products WHERE _id = $1 LIMIT 1', [id]);
        } else {
            res = await pool.query('SELECT * FROM products WHERE _id::text = $1 OR id::text = $1 LIMIT 1', [String(id)]);
        }

        if (res.rows.length === 0) return null;
        return new ProductInstance(res.rows[0]);
    },

    async findOne(query = {}) {
        if (query.id !== undefined) {
            return await this.findById(query.id);
        }
        if (query._id !== undefined) {
            return await this.findById(query._id);
        }
        const products = await this.find(query);
        return products.length > 0 ? products[0] : null;
    },

    async create(data) {
        let res;
        if (data.id) {
            const queryText = `
                INSERT INTO products (
                    id, name, description, price, original_price, category, image, images,
                    stock, rating, num_reviews, reviews, featured, brand, tags
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
                RETURNING *;
            `;
            const values = [
                data.id,
                data.name,
                data.description,
                data.price,
                data.originalPrice || null,
                data.category,
                data.image,
                JSON.stringify(data.images || []),
                data.stock || 0,
                data.rating || 0,
                data.numReviews || 0,
                JSON.stringify(data.reviews || []),
                Boolean(data.featured),
                data.brand || '',
                JSON.stringify(data.tags || []),
            ];
            res = await pool.query(queryText, values);
            // Synchronize serial sequence after custom id insert
            await pool.query(`SELECT setval(pg_get_serial_sequence('products', 'id'), COALESCE(MAX(id), 1)) FROM products;`);
        } else {
            const queryText = `
                INSERT INTO products (
                    name, description, price, original_price, category, image, images,
                    stock, rating, num_reviews, reviews, featured, brand, tags
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                RETURNING *;
            `;
            const values = [
                data.name,
                data.description,
                data.price,
                data.originalPrice || null,
                data.category,
                data.image,
                JSON.stringify(data.images || []),
                data.stock || 0,
                data.rating || 0,
                data.numReviews || 0,
                JSON.stringify(data.reviews || []),
                Boolean(data.featured),
                data.brand || '',
                JSON.stringify(data.tags || []),
            ];
            res = await pool.query(queryText, values);
        }

        return new ProductInstance(res.rows[0]);
    },

    async findOneAndUpdate(filter, update, options = {}) {
        const existing = await this.findOne(filter);
        if (existing) {
            Object.assign(existing, update);
            return await existing.save();
        }

        if (options.upsert) {
            return await this.create({ ...filter, ...update });
        }
        return null;
    },

    async insertMany(productsArray) {
        const inserted = [];
        for (const item of productsArray) {
            const prod = await this.create(item);
            inserted.push(prod);
        }
        await pool.query(`SELECT setval(pg_get_serial_sequence('products', 'id'), COALESCE(MAX(id), 1)) FROM products;`);
        return inserted;
    },

    async deleteMany(filter = {}) {
        if (filter.category && filter.category.$nin) {
            const placeholders = filter.category.$nin.map((val, idx) => `$${idx + 1}`);
            const res = await pool.query(
                `DELETE FROM products WHERE category NOT IN (${placeholders.join(', ')})`,
                filter.category.$nin
            );
            return { deletedCount: res.rowCount };
        }
        const res = await pool.query('DELETE FROM products');
        return { deletedCount: res.rowCount };
    },
};

export default Product;
