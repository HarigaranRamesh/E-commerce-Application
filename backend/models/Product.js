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
        this.gender = row.gender || 'men';
        this.image = row.image;
        this.images = Array.isArray(row.images) ? row.images : [];
        this.stock = row.stock !== null ? parseInt(row.stock, 10) : 0;
        this.rating = row.rating !== null ? parseFloat(row.rating) : 0;
        this.numReviews = row.num_reviews !== null ? parseInt(row.num_reviews, 10) : 0;
        this.reviews = Array.isArray(row.reviews) ? row.reviews : [];
        this.featured = Boolean(row.featured);
        this.brand = row.brand || '';
        this.tags = Array.isArray(row.tags) ? row.tags : [];
        this.sku = row.sku || `SKU-${row.id}`;
        this.specifications = typeof row.specifications === 'object' && row.specifications !== null ? row.specifications : {};
        this.variants = Array.isArray(row.variants) ? row.variants : [];
        this.viewsCount = parseInt(row.views_count || 0, 10);
        this.createdAt = row.created_at;
        this.updatedAt = row.updated_at;
    }

    async save() {
        const queryText = `
            UPDATE products
            SET name = $1, description = $2, price = $3, original_price = $4,
                category = $5, gender = $6, image = $7, images = $8, stock = $9,
                rating = $10, num_reviews = $11, reviews = $12, featured = $13,
                brand = $14, tags = $15, sku = $16, specifications = $17,
                variants = $18, views_count = $19, updated_at = NOW()
            WHERE id = $20 OR _id::text = $21
            RETURNING *;
        `;
        const values = [
            this.name,
            this.description,
            this.price,
            this.originalPrice || null,
            this.category,
            this.gender || 'men',
            this.image,
            JSON.stringify(this.images || []),
            this.stock,
            this.rating,
            this.numReviews,
            JSON.stringify(this.reviews || []),
            this.featured,
            this.brand,
            JSON.stringify(this.tags || []),
            this.sku,
            JSON.stringify(this.specifications || {}),
            JSON.stringify(this.variants || []),
            this.viewsCount,
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
            const cat = String(query.category).toLowerCase();
            if (typeof query.category === 'object' && query.category.$nin) {
                const placeholders = query.category.$nin.map((val) => {
                    values.push(val);
                    return `$${values.length}`;
                });
                conditions.push(`category NOT IN (${placeholders.join(', ')})`);
            } else if (cat === 'men' || cat === 'mens') {
                conditions.push(`(LOWER(gender) = 'men' OR LOWER(category) IN ('men', 'mens', 'shirts', 'pants', 'hoodies', 't-shirts'))`);
            } else if (cat === 'women' || cat === 'womens') {
                conditions.push(`(LOWER(gender) = 'women' OR LOWER(category) IN ('women', 'womens', 'dresses', 'tops', 'ethnic', 'skirts'))`);
            } else if (cat === 'kids' || cat === 'kid') {
                conditions.push(`(LOWER(gender) = 'kids' OR LOWER(category) IN ('kids', 'boys', 'girls'))`);
            } else if (!['all', 'collection', 'all-products', 'all-collections'].includes(cat)) {
                values.push(query.category);
                conditions.push(`LOWER(category) = LOWER($${values.length})`);
            }
        }

        if (query.gender) {
            const g = String(query.gender).toLowerCase();
            if (g !== 'all') {
                values.push(g);
                conditions.push(`LOWER(gender) = LOWER($${values.length})`);
            }
        }

        const searchTerm = query.search || query.keyword;
        if (searchTerm) {
            values.push(`%${searchTerm}%`);
            const p = `$${values.length}`;
            conditions.push(`(name ILIKE ${p} OR description ILIKE ${p} OR brand ILIKE ${p})`);
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

        if (query.brand) {
            values.push(query.brand);
            conditions.push(`LOWER(brand) = LOWER($${values.length})`);
        }

        if (query.minPrice !== undefined && query.minPrice !== '') {
            values.push(parseFloat(query.minPrice));
            conditions.push(`price >= $${values.length}`);
        }

        if (query.maxPrice !== undefined && query.maxPrice !== '') {
            values.push(parseFloat(query.maxPrice));
            conditions.push(`price <= $${values.length}`);
        }

        if (query.minRating !== undefined && query.minRating !== '') {
            values.push(parseFloat(query.minRating));
            conditions.push(`rating >= $${values.length}`);
        }

        if (query.inStock === 'true' || query.inStock === true) {
            conditions.push(`stock > 0`);
        }

        if (query.featured !== undefined) {
            values.push(query.featured === 'true' || query.featured === true);
            conditions.push(`featured = $${values.length}`);
        }

        // Sorting
        let orderBy = 'id ASC';
        if (query.sort) {
            switch (query.sort) {
                case 'price-asc':
                case 'price_asc':
                    orderBy = 'price ASC';
                    break;
                case 'price-desc':
                case 'price_desc':
                    orderBy = 'price DESC';
                    break;
                case 'rating':
                    orderBy = 'rating DESC, num_reviews DESC';
                    break;
                case 'newest':
                    orderBy = 'created_at DESC';
                    break;
                case 'popular':
                    orderBy = 'views_count DESC, num_reviews DESC';
                    break;
                default:
                    orderBy = 'id ASC';
            }
        }

        let limitClause = '';
        if (query.limit) {
            const limit = parseInt(query.limit, 10);
            const page = parseInt(query.page || 1, 10);
            const offset = (page - 1) * limit;
            limitClause = `LIMIT ${limit} OFFSET ${offset}`;
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        const sql = `SELECT * FROM products ${whereClause} ORDER BY ${orderBy} ${limitClause}`;
        const res = await pool.query(sql, values);

        return res.rows.map((row) => new ProductInstance(row));
    },

    async count(query = {}) {
        const conditions = [];
        const values = [];

        if (query.category) {
            const cat = String(query.category).toLowerCase();
            if (cat === 'men' || cat === 'mens') {
                conditions.push(`(LOWER(gender) = 'men' OR LOWER(category) IN ('men', 'mens', 'shirts', 'pants', 'hoodies', 't-shirts'))`);
            } else if (cat === 'women' || cat === 'womens') {
                conditions.push(`(LOWER(gender) = 'women' OR LOWER(category) IN ('women', 'womens', 'dresses', 'tops', 'ethnic', 'skirts'))`);
            } else if (cat === 'kids' || cat === 'kid') {
                conditions.push(`(LOWER(gender) = 'kids' OR LOWER(category) IN ('kids', 'boys', 'girls'))`);
            } else if (!['all', 'collection', 'all-products', 'all-collections'].includes(cat)) {
                values.push(query.category);
                conditions.push(`LOWER(category) = LOWER($${values.length})`);
            }
        }

        if (query.gender) {
            const g = String(query.gender).toLowerCase();
            if (g !== 'all') {
                values.push(g);
                conditions.push(`LOWER(gender) = LOWER($${values.length})`);
            }
        }
        const searchTerm = query.search || query.keyword;
        if (searchTerm) {
            values.push(`%${searchTerm}%`);
            const p = `$${values.length}`;
            conditions.push(`(name ILIKE ${p} OR description ILIKE ${p} OR brand ILIKE ${p})`);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        const res = await pool.query(`SELECT COUNT(*)::int AS count FROM products ${whereClause}`, values);
        return res.rows[0].count;
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

        // Increment views count non-blockingly
        pool.query('UPDATE products SET views_count = views_count + 1 WHERE id = $1', [res.rows[0].id]).catch(() => {});

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

    async getSuggestions(searchTerm, limit = 6) {
        if (!searchTerm || searchTerm.trim().length === 0) return [];
        const res = await pool.query(
            `SELECT id, _id, name, price, category, image, brand
             FROM products
             WHERE name ILIKE $1 OR description ILIKE $1 OR category ILIKE $1
             ORDER BY featured DESC, rating DESC
             LIMIT $2`,
            [`%${searchTerm.trim()}%`, limit]
        );
        return res.rows.map((row) => ({
            id: row.id,
            _id: row._id || String(row.id),
            name: row.name,
            price: parseFloat(row.price),
            category: row.category,
            image: row.image,
            brand: row.brand,
        }));
    },

    async getRelated(productId, category, limit = 4) {
        const res = await pool.query(
            `SELECT * FROM products
             WHERE category = $1 AND id != $2
             ORDER BY rating DESC, views_count DESC
             LIMIT $3`,
            [category, typeof productId === 'number' ? productId : -1, limit]
        );
        return res.rows.map((row) => new ProductInstance(row));
    },

    async create(data) {
        let res;
        if (data.id) {
            const queryText = `
                INSERT INTO products (
                    id, name, description, price, original_price, category, gender, image, images,
                    stock, rating, num_reviews, reviews, featured, brand, tags, sku, specifications, variants
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
                RETURNING *;
            `;
            const values = [
                data.id,
                data.name,
                data.description,
                data.price,
                data.originalPrice || data.original_price || null,
                data.category,
                data.gender || 'men',
                data.image,
                JSON.stringify(data.images || (data.image ? [data.image] : [])),
                data.stock || 0,
                data.rating || 0,
                data.numReviews || data.num_reviews || 0,
                JSON.stringify(data.reviews || []),
                Boolean(data.featured),
                data.brand || '',
                JSON.stringify(data.tags || []),
                data.sku || `SKU-${data.id}`,
                JSON.stringify(data.specifications || {}),
                JSON.stringify(data.variants || []),
            ];
            res = await pool.query(queryText, values);
            await pool.query(`SELECT setval(pg_get_serial_sequence('products', 'id'), COALESCE(MAX(id), 1)) FROM products;`);
        } else {
            const queryText = `
                INSERT INTO products (
                    name, description, price, original_price, category, gender, image, images,
                    stock, rating, num_reviews, reviews, featured, brand, tags, sku, specifications, variants
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
                RETURNING *;
            `;
            const values = [
                data.name,
                data.description,
                data.price,
                data.originalPrice || data.original_price || null,
                data.category,
                data.gender || 'men',
                data.image,
                JSON.stringify(data.images || (data.image ? [data.image] : [])),
                data.stock || 0,
                data.rating || 0,
                data.numReviews || data.num_reviews || 0,
                JSON.stringify(data.reviews || []),
                Boolean(data.featured),
                data.brand || '',
                JSON.stringify(data.tags || []),
                data.sku || `SKU-AUTO-${Date.now()}`,
                JSON.stringify(data.specifications || {}),
                JSON.stringify(data.variants || []),
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
