import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.PG_URI;

const poolConfig = connectionString
    ? {
        connectionString,
        ssl: connectionString.includes('sslmode=require') || connectionString.includes('neon.tech') || connectionString.includes('supabase.co')
            ? { rejectUnauthorized: false }
            : false,
    }
    : {
        host: process.env.PGHOST || 'localhost',
        port: parseInt(process.env.PGPORT || '5432', 10),
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD || 'postgres',
        database: process.env.PGDATABASE || 'ecommerce',
    };

export const pool = new Pool(poolConfig);

export const query = (text, params) => pool.query(text, params);

const createTables = async () => {
    // Enable UUID extension
    await pool.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

    // Users table
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            phone VARCHAR(50),
            gender VARCHAR(20),
            dob VARCHAR(50),
            address JSONB DEFAULT '{}'::jsonb,
            role VARCHAR(20) DEFAULT 'user',
            wishlist JSONB DEFAULT '[]'::jsonb,
            cart JSONB DEFAULT '[]'::jsonb,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    `);

    // Products table
    await pool.query(`
        CREATE TABLE IF NOT EXISTS products (
            id SERIAL PRIMARY KEY,
            _id UUID DEFAULT gen_random_uuid() UNIQUE,
            name VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            price NUMERIC(10, 2) NOT NULL,
            original_price NUMERIC(10, 2),
            category VARCHAR(100) NOT NULL,
            image TEXT NOT NULL,
            images JSONB DEFAULT '[]'::jsonb,
            stock INTEGER NOT NULL DEFAULT 0,
            rating NUMERIC(3, 2) DEFAULT 0,
            num_reviews INTEGER DEFAULT 0,
            reviews JSONB DEFAULT '[]'::jsonb,
            featured BOOLEAN DEFAULT FALSE,
            brand VARCHAR(100),
            tags JSONB DEFAULT '[]'::jsonb,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    `);

    // Orders table
    await pool.query(`
        CREATE TABLE IF NOT EXISTS orders (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            order_items JSONB NOT NULL DEFAULT '[]'::jsonb,
            shipping_address JSONB NOT NULL DEFAULT '{}'::jsonb,
            payment_method VARCHAR(50) NOT NULL,
            payment_result JSONB DEFAULT '{}'::jsonb,
            items_price NUMERIC(10, 2) DEFAULT 0.00,
            tax_price NUMERIC(10, 2) DEFAULT 0.00,
            shipping_price NUMERIC(10, 2) DEFAULT 0.00,
            total_price NUMERIC(10, 2) DEFAULT 0.00,
            is_paid BOOLEAN DEFAULT FALSE,
            paid_at TIMESTAMPTZ,
            is_delivered BOOLEAN DEFAULT FALSE,
            delivered_at TIMESTAMPTZ,
            status VARCHAR(50) DEFAULT 'pending',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    `);

    // Indexes for fast querying
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);`);
};

const connectDB = async () => {
    try {
        const client = await pool.connect();
        console.log(`🚀 ✅ PostgreSQL Connected to database: ${client.database || 'default'}`);
        client.release();

        await createTables();
        console.log('📦 Database schema initialized successfully');
    } catch (error) {
        console.error(`PostgreSQL Connection Error: ${error.message}`);
        console.error('Make sure PostgreSQL is running and credentials in .env (DATABASE_URL) are correct.');
        process.exit(1);
    }
};

export default connectDB;
