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

        // 2. Seed Products if empty
        const productCount = await Product.countDocuments();
        if (productCount === 0) {
            // Assign admin user as the creator of products
            const sampleProducts = products.map((product) => {
                return { ...product, user: adminUser._id };
            });

            await Product.insertMany(sampleProducts);
            console.log('Products seeded successfully including ID 17');
        } else {
            console.log('Products already exist, skipping seed.');
        }

    } catch (error) {
        console.error(`Error seeding data: ${error.message}`);
        // Do not exit process, just log error
    }
};

export default seedAdmin;
