import dotenv from 'dotenv';
import Product from '../models/Product.js';
import connectDB from '../config/db.js';

dotenv.config();

const exportProducts = async () => {
    try {
        await connectDB();

        const products = await Product.find({});

        console.log('const products = [');
        products.forEach((p) => {
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
