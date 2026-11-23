import Product from '../models/Product.js';
import User from '../models/User.js';
import products from '../data/products.js';

const seedAdmin = async () => {
    try {
        // 1. Seed Admin
        let adminUser = await User.findOne({ email: 'admin@example.com' });

        if (adminUser) {
            // Ensure admin role and verified password
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
        if (products && products.length > 0) {
            for (const productData of products) {
                await Product.findOneAndUpdate(
                    { id: productData.id },
                    productData,
                    { upsert: true }
                );
            }
        }
    } catch (error) {
        console.error(`Error seeding data: ${error.message}`);
    }
};

export default seedAdmin;
