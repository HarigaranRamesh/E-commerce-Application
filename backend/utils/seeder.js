import User from '../models/User.js';

const seedAdmin = async () => {
    try {
        const adminExists = await User.findOne({ email: 'admin@example.com' });

        if (adminExists) {
            console.log('Admin user check passed: admin@example.com');
            return;
        }

        await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'password123',
            role: 'admin',
        });

        console.log('Admin user seeded successfully: admin@example.com');
    } catch (error) {
        console.error(`Error seeding admin: ${error.message}`);
        // Do not exit process, just log error
    }
};

export default seedAdmin;
