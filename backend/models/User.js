import { pool } from '../config/db.js';
import bcrypt from 'bcryptjs';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

class UserInstance {
    constructor(row) {
        this.id = row.id;
        this._id = row.id;
        this.name = row.name;
        this.email = row.email;
        this.password = row.password;
        this.phone = row.phone || '';
        this.gender = row.gender || null;
        this.dob = row.dob || null;
        this.address = typeof row.address === 'object' && row.address !== null ? row.address : {};
        this.role = row.role || 'user';
        this.wishlist = Array.isArray(row.wishlist) ? row.wishlist : [];
        this.cart = Array.isArray(row.cart) ? row.cart : [];
        this.createdAt = row.created_at;
        this.updatedAt = row.updated_at;
    }

    async comparePassword(enteredPassword) {
        if (!this.password) return false;
        return await bcrypt.compare(enteredPassword, this.password);
    }

    async save() {
        let passwordToSave = this.password;
        if (passwordToSave && !passwordToSave.startsWith('$2a$') && !passwordToSave.startsWith('$2b$')) {
            const salt = await bcrypt.genSalt(10);
            passwordToSave = await bcrypt.hash(passwordToSave, salt);
            this.password = passwordToSave;
        }

        const queryText = `
            UPDATE users
            SET name = $1, email = $2, password = $3, phone = $4, gender = $5,
                dob = $6, address = $7, role = $8, wishlist = $9, cart = $10, updated_at = NOW()
            WHERE id = $11
            RETURNING *;
        `;
        const values = [
            this.name,
            this.email.toLowerCase(),
            passwordToSave,
            this.phone,
            this.gender,
            this.dob,
            JSON.stringify(this.address || {}),
            this.role,
            JSON.stringify(this.wishlist || []),
            JSON.stringify(this.cart || []),
            this.id,
        ];

        const res = await pool.query(queryText, values);
        if (res.rows.length > 0) {
            Object.assign(this, new UserInstance(res.rows[0]));
        }
        return this;
    }

    async deleteOne() {
        await pool.query('DELETE FROM users WHERE id = $1', [this.id]);
        return { acknowledged: true, deletedCount: 1 };
    }

    async clearCart() {
        this.cart = [];
        await pool.query("UPDATE users SET cart = '[]'::jsonb, updated_at = NOW() WHERE id = $1", [this.id]);
        return this;
    }
}

class UserQueryBuilder {
    constructor(promise) {
        this.promise = promise;
    }

    select(fields) {
        return this;
    }

    then(resolve, reject) {
        return this.promise.then(resolve, reject);
    }

    catch(reject) {
        return this.promise.catch(reject);
    }
}

const User = {
    async create(userData) {
        const { name, email, password, phone, address, gender, dob, role = 'user' } = userData;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const queryText = `
            INSERT INTO users (name, email, password, phone, gender, dob, address, role)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *;
        `;
        const values = [
            name,
            email.toLowerCase(),
            hashedPassword,
            phone || '',
            gender || null,
            dob || null,
            JSON.stringify(address || {}),
            role,
        ];

        const res = await pool.query(queryText, values);
        return new UserInstance(res.rows[0]);
    },

    findOne(filter = {}) {
        const exec = async () => {
            const conditions = [];
            const values = [];

            if (filter.email) {
                values.push(filter.email.toLowerCase());
                conditions.push(`LOWER(email) = $${values.length}`);
            }
            if (filter.id || filter._id) {
                const targetId = String(filter.id || filter._id);
                if (!UUID_REGEX.test(targetId)) return null;
                values.push(targetId);
                conditions.push(`id = $${values.length}`);
            }

            const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
            const res = await pool.query(`SELECT * FROM users ${whereClause} LIMIT 1`, values);

            if (res.rows.length === 0) return null;
            return new UserInstance(res.rows[0]);
        };

        return new UserQueryBuilder(exec());
    },

    findById(id) {
        const exec = async () => {
            if (!id) return null;
            const targetId = String(id);
            if (!UUID_REGEX.test(targetId)) return null;

            const res = await pool.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [targetId]);
            if (res.rows.length === 0) return null;
            return new UserInstance(res.rows[0]);
        };

        return new UserQueryBuilder(exec());
    },

    async find(filter = {}) {
        const res = await pool.query('SELECT id, name, email, phone, gender, dob, address, role, wishlist, cart, created_at, updated_at FROM users ORDER BY created_at DESC');
        return res.rows.map((row) => new UserInstance(row));
    },

    async deleteMany(filter = {}) {
        const res = await pool.query('DELETE FROM users');
        return { deletedCount: res.rowCount };
    },

    async countDocuments() {
        const res = await pool.query('SELECT COUNT(*)::int AS count FROM users');
        return res.rows[0].count;
    },

    async clearCart(userId) {
        if (!userId) return false;
        const targetId = String(userId);
        if (!UUID_REGEX.test(targetId)) return false;
        await pool.query("UPDATE users SET cart = '[]'::jsonb, updated_at = NOW() WHERE id = $1", [targetId]);
        return true;
    },
};

export default User;
