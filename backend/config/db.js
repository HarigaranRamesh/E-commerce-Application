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

    // Add enterprise columns to products if missing
    await pool.query(`
        ALTER TABLE products
        ADD COLUMN IF NOT EXISTS sku VARCHAR(100),
        ADD COLUMN IF NOT EXISTS specifications JSONB DEFAULT '{}'::jsonb,
        ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::jsonb,
        ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;
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

    // Add enterprise columns to orders if missing
    await pool.query(`
        ALTER TABLE orders
        ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(50),
        ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10, 2) DEFAULT 0.00,
        ADD COLUMN IF NOT EXISTS timeline JSONB DEFAULT '[]'::jsonb,
        ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(100),
        ADD COLUMN IF NOT EXISTS carrier VARCHAR(50),
        ADD COLUMN IF NOT EXISTS invoice_number VARCHAR(50),
        ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending',
        ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(255);
    `);

    // Payments table for Razorpay and Multi-Gateway transactions
    await pool.query(`
        CREATE TABLE IF NOT EXISTS payments (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
            user_id UUID REFERENCES users(id) ON DELETE SET NULL,
            razorpay_order_id VARCHAR(255) UNIQUE,
            razorpay_payment_id VARCHAR(255) UNIQUE,
            razorpay_signature VARCHAR(512),
            payment_method VARCHAR(50) DEFAULT 'razorpay',
            amount NUMERIC(10, 2) NOT NULL,
            currency VARCHAR(10) DEFAULT 'INR',
            status VARCHAR(50) DEFAULT 'created',
            is_signature_verified BOOLEAN DEFAULT FALSE,
            failure_reason TEXT,
            metadata JSONB DEFAULT '{}'::jsonb,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    `);

    // Webhook events table for idempotent event processing
    await pool.query(`
        CREATE TABLE IF NOT EXISTS webhook_events (
            id VARCHAR(255) PRIMARY KEY,
            event_type VARCHAR(100) NOT NULL,
            payload JSONB NOT NULL,
            processed_at TIMESTAMPTZ DEFAULT NOW()
        );
    `);

    // Coupons table
    await pool.query(`
        CREATE TABLE IF NOT EXISTS coupons (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            code VARCHAR(50) UNIQUE NOT NULL,
            discount_type VARCHAR(20) NOT NULL DEFAULT 'percentage',
            discount_value NUMERIC(10, 2) NOT NULL,
            min_purchase NUMERIC(10, 2) DEFAULT 0.00,
            max_discount NUMERIC(10, 2) DEFAULT NULL,
            expires_at TIMESTAMPTZ,
            is_active BOOLEAN DEFAULT TRUE,
            usage_count INTEGER DEFAULT 0,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
    `);

    // Seed default coupons if none exist
    const couponCount = await pool.query('SELECT COUNT(*)::int AS count FROM coupons');
    if (couponCount.rows[0].count === 0) {
        await pool.query(`
            INSERT INTO coupons (code, discount_type, discount_value, min_purchase, max_discount, is_active)
            VALUES 
                ('WELCOME10', 'percentage', 10.00, 500.00, 200.00, true),
                ('SUPER20', 'percentage', 20.00, 1000.00, 500.00, true),
                ('FREESHIP', 'fixed', 50.00, 499.00, 50.00, true)
            ON CONFLICT (code) DO NOTHING;
        `);
    }

    // Indexes for fast querying & high-performance lookups
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_products_category_lower ON products(LOWER(category));`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_products_gender_lower ON products(LOWER(gender));`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_products_name_lower ON products(LOWER(name));`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_products_rating ON products(rating);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_products_brand ON products(LOWER(brand));`);

    // Users indexes
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_users_email_lower ON users(LOWER(email));`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);`);

    // Orders indexes
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_orders_is_paid ON orders(is_paid);`);

    // Payments & coupons indexes
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_payments_razorpay_order_id ON payments(razorpay_order_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_payments_razorpay_payment_id ON payments(razorpay_payment_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_webhook_events_id ON webhook_events(id);`);
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
