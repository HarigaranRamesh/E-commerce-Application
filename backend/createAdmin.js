import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();

const createAdmin = async () => {
    try {
        await connectDB();

        const adminExists = await User.findOne({ email: 'admin@example.com' });

        if (adminExists) {
            console.log('Admin user already exists');
            console.log('Email: admin@example.com');
            // We can't know the password if it's hashed, but we can reset it if needed.
            // For now just exit.
            process.exit();
        }

        const user = await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'password123', // Default password
            role: 'admin',
        });

        console.log('Admin user created successfully');
        console.log('Email: admin@example.com');
        console.log('Password: password123');

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

createAdmin();
