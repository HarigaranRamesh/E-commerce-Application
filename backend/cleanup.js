import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Product from './models/Product.js';

dotenv.config();

const removeInvalidProducts = async () => {
    try {
        await connectDB();
        console.log('Connected to database...');

        const allowedCategories = ['shirts', 'pants', 'hoodies', 't-shirts'];

        // Find products with invalid categories
        const invalidProducts = await Product.find({ category: { $nin: allowedCategories } });

        console.log(`Found ${invalidProducts.length} products with invalid categories.`);

        if (invalidProducts.length > 0) {
            invalidProducts.forEach(p => console.log(`- Deleting: ${p.name} (Category: ${p.category})`));

            const result = await Product.deleteMany({ category: { $nin: allowedCategories } });
            console.log(`Successfully deleted ${result.deletedCount} invalid products.`);
        } else {
            console.log('No invalid products found. All products are in allowed categories.');
        }

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

removeInvalidProducts();
