import Product from '../models/Product.js';
import products from '../data/products.js';

const seedAdmin = async () => {
    try {
        // 1. Seed Admin
        let adminUser = await User.findOne({ email: 'admin@example.com' });

        if (adminUser) {
            // Force reset password to ensure access
            adminUser.password = 'password123';
            await adminUser.save();
            console.log('Admin user exists. Password reset to: password123');
        } else {
            adminUser = await User.create({
                name: 'Admin User',
                email: 'admin@example.com',
                password: 'password123',
                role: 'admin',
            });
            console.log('Admin user created successfully: admin@example.com / password123');
        }

        // 2. Seed Products - Ensure specific products exist (Upsert-like behavior)
        if (products) {
            for (const productData of products) {
                const productExists = await Product.findOne({ id: productData.id });
                if (!productExists) {
                    await Product.create({
                        ...productData,
                        user: adminUser._id
                    });
                    console.log(`Seeded missing product: ${productData.name} (ID: ${productData.id})`);
                }
            }
        }

        console.log('Seeder check complete.');

    } catch (error) {
        console.error(`Error seeding data: ${error.message}`);
        // Do not exit process, just log error
    }
};

export default seedAdmin;
