import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();

const products = [
    {
        name: 'Wireless Headphones',
        description: 'Premium wireless headphones with noise cancellation and 30-hour battery life',
        price: 199.99,
        originalPrice: 299.99,
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
        stock: 50,
        rating: 4.5,
        numReviews: 120,
        featured: true,
        brand: 'AudioPro',
        tags: ['wireless', 'noise-cancelling', 'bluetooth'],
    },
    {
        name: 'Smart Watch',
        description: 'Fitness tracking smartwatch with heart rate monitor and GPS',
        price: 299.99,
        originalPrice: 399.99,
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
        stock: 30,
        rating: 4.7,
        numReviews: 85,
        featured: true,
        brand: 'TechFit',
        tags: ['smartwatch', 'fitness', 'gps'],
    },
    {
        name: 'Designer Sunglasses',
        description: 'Stylish UV protection sunglasses with polarized lenses',
        price: 149.99,
        originalPrice: 249.99,
        category: 'Fashion',
        image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500',
        stock: 75,
        rating: 4.3,
        numReviews: 45,
        featured: false,
        brand: 'StyleVision',
        tags: ['sunglasses', 'uv-protection', 'polarized'],
    },
    {
        name: 'Leather Backpack',
        description: 'Premium leather backpack with laptop compartment',
        price: 129.99,
        originalPrice: 199.99,
        category: 'Fashion',
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
        stock: 40,
        rating: 4.6,
        numReviews: 67,
        featured: true,
        brand: 'UrbanCarry',
        tags: ['backpack', 'leather', 'laptop'],
    },
    {
        name: 'Coffee Maker',
        description: 'Programmable coffee maker with thermal carafe',
        price: 89.99,
        originalPrice: 129.99,
        category: 'Home',
        image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500',
        stock: 60,
        rating: 4.4,
        numReviews: 92,
        featured: false,
        brand: 'BrewMaster',
        tags: ['coffee', 'kitchen', 'programmable'],
    },
    {
        name: 'Yoga Mat',
        description: 'Non-slip eco-friendly yoga mat with carrying strap',
        price: 39.99,
        originalPrice: 59.99,
        category: 'Sports',
        image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500',
        stock: 100,
        rating: 4.8,
        numReviews: 156,
        featured: true,
        brand: 'ZenFit',
        tags: ['yoga', 'fitness', 'eco-friendly'],
    },
    {
        name: 'Bluetooth Speaker',
        description: 'Portable waterproof Bluetooth speaker with 360° sound',
        price: 79.99,
        originalPrice: 119.99,
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500',
        stock: 80,
        rating: 4.5,
        numReviews: 134,
        featured: true,
        brand: 'SoundWave',
        tags: ['bluetooth', 'waterproof', 'portable'],
    },
    {
        name: 'Running Shoes',
        description: 'Lightweight running shoes with cushioned sole',
        price: 119.99,
        originalPrice: 159.99,
        category: 'Sports',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
        stock: 55,
        rating: 4.6,
        numReviews: 98,
        featured: false,
        brand: 'RunPro',
        tags: ['running', 'shoes', 'sports'],
    },
];

const seedDatabase = async () => {
    try {
        await connectDB();

        // Clear existing data
        await Product.deleteMany();
        await User.deleteMany();

        // Create admin user
        const adminUser = await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'admin123',
            role: 'admin',
        });

        // Create test user
        await User.create({
            name: 'Test User',
            email: 'user@example.com',
            password: 'user123',
            role: 'user',
        });

        // Insert products
        await Product.insertMany(products);

        console.log('Database seeded successfully!');
        console.log('Admin credentials: admin@example.com / admin123');
        console.log('User credentials: user@example.com / user123');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedDatabase();
