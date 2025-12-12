import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import connectDB from '../config/db.js';

dotenv.config();

const exportProducts = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/react_ecommerce'); // Force local connection or use process.env.MONGODB_URI if set locally

        const products = await Product.find({}, '-_id -createdAt -updatedAt -__v').lean();

        console.log('const products = [');
        products.forEach(p => {
            // Ensure cleaning of data if necessary
            console.log(JSON.stringify(p, null, 4) + ',');
        });
        console.log('];\n\nexport default products;');

        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

exportProducts();
