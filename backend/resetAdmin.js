import dotenv from 'dotenv';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();

const resetAdmin = async () => {
    try {
        await connectDB();

        let admin = await User.findOne({ email: 'admin@example.com' });

        if (!admin) {
            console.log('Admin not found, creating new one...');
            admin = await User.create({
                name: 'Admin User',
                email: 'admin@example.com',
                password: 'password123',
                role: 'admin',
            });
        } else {
            console.log('Admin found, updating password...');
            admin.password = 'password123';
            await admin.save();
        }

        console.log('Admin password verified/reset to: password123');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

resetAdmin();
