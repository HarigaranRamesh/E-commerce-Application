import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide a product name'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Please provide a product description'],
        },
        price: {
            type: Number,
            required: [true, 'Please provide a price'],
            min: 0,
        },
        originalPrice: {
            type: Number,
            min: 0,
        },
        id: {
            type: Number,
            required: true,
            unique: true,
        },
        category: {
            type: String,
            required: [true, 'Please provide a category'],
            index: true,
        },
        image: {
            type: String,
            required: [true, 'Please provide an image URL'],
        },
        images: [String],
        stock: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
        },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        numReviews: {
            type: Number,
            default: 0,
        },
        reviews: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    required: true,
                },
                name: {
                    type: String,
                    required: true,
                },
                rating: {
                    type: Number,
                    required: true,
                    min: 1,
                    max: 5,
                },
                comment: {
                    type: String,
                    required: true,
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        featured: {
            type: Boolean,
            default: false,
        },
        brand: String,
        tags: [String],
    },
    {
        timestamps: true,
    }
);

const Product = mongoose.model('Product', productSchema);

export default Product;
