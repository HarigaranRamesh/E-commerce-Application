import Product from '../models/Product.js';
import User from '../models/User.js';
import products from '../data/products.js';
import { pool } from '../config/db.js';

const seedAdmin = async () => {
    try {
        // 1. Seed Admin
        let adminUser = await User.findOne({ email: 'admin@example.com' });

        if (adminUser) {
            adminUser.password = 'password123';
            await adminUser.save();
        } else {
            adminUser = await User.create({
                name: 'Admin User',
                email: 'admin@example.com',
                password: 'password123',
                role: 'admin',
            });
        }

        // 2. Seed Products
        await pool.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS gender VARCHAR(50) DEFAULT 'men';");
        await pool.query("UPDATE products SET gender = 'men' WHERE gender IS NULL OR gender = '';");

        if (products && products.length > 0) {
            for (const productData of products) {
                await Product.findOneAndUpdate(
                    { id: productData.id },
                    productData,
                    { upsert: true }
                );
            }
            // Synchronize the serial sequence after upserting products
            await pool.query(`SELECT setval(pg_get_serial_sequence('products', 'id'), COALESCE(MAX(id), 1)) FROM products;`);
        }
    } catch (error) {
        console.error(`Error seeding data: ${error.message}`);
    }
};

export default seedAdmin;
