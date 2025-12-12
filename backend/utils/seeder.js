import Product from '../models/Product.js';
import User from '../models/User.js';
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

        // 2. Seed Products - Upsert (Insert or Update) to match local data exactly
        if (products) {
            for (const productData of products) {
                // Upsert: Update if exists, Insert if not
                await Product.findOneAndUpdate(
                    { id: productData.id },
                    {
                        ...productData,
                        user: adminUser._id
                    },
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                );
                console.log(`Synced product: ${productData.name} (ID: ${productData.id})`);
            }
        }

        console.log('Seeder check complete.');

    } catch (error) {
        console.error(`Error seeding data: ${error.message}`);
        // Do not exit process, just log error
    }
};

export default seedAdmin;
