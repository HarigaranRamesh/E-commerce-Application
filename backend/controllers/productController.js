import Product from '../models/Product.js';

/**
 * @desc    Get all products with filtering, sorting, and pagination
 * @route   GET /api/products
 * @access  Public
 */
export const getProducts = async (req, res) => {
    try {
        const {
            category,
            gender,
            search,
            keyword,
            featured,
            brand,
            minPrice,
            maxPrice,
            minRating,
            inStock,
            sort,
            page = 1,
            limit,
        } = req.query;

        const query = {
            category,
            gender,
            search,
            keyword,
            featured,
            brand,
            minPrice,
            maxPrice,
            minRating,
            inStock,
            sort,
            page: parseInt(page, 10),
            limit: limit ? parseInt(limit, 10) : undefined,
        };

        const [products, totalCount] = await Promise.all([
            Product.find(query),
            Product.count(query),
        ]);

        res.json({
            products,
            page: parseInt(page, 10),
            pages: limit ? Math.ceil(totalCount / parseInt(limit, 10)) : 1,
            total: totalCount,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get live search suggestions
 * @route   GET /api/products/search/suggestions
 * @access  Public
 */
export const getProductSuggestions = async (req, res) => {
    try {
        const { q } = req.query;
        const suggestions = await Product.getSuggestions(q);
        res.json(suggestions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get related products
 * @route   GET /api/products/:id/related
 * @access  Public
 */
export const getRelatedProducts = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        const related = await Product.getRelated(product.id, product.category, 4);
        res.json(related);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Create a new product
 * @route   POST /api/products
 * @access  Private/Admin
 */
export const createProduct = async (req, res) => {
    try {
        const product = await Product.create({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            originalPrice: req.body.originalPrice,
            category: req.body.category,
            image: req.body.image,
            images: req.body.images || [],
            stock: req.body.stock !== undefined ? req.body.stock : 0,
            brand: req.body.brand || '',
            tags: req.body.tags || [],
            featured: req.body.featured !== undefined ? req.body.featured : false,
            sku: req.body.sku,
            specifications: req.body.specifications || {},
            variants: req.body.variants || [],
        });

        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Update a product
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            product.name = req.body.name || product.name;
            product.description = req.body.description || product.description;
            product.price = req.body.price !== undefined ? req.body.price : product.price;
            product.originalPrice = req.body.originalPrice !== undefined ? req.body.originalPrice : product.originalPrice;
            product.category = req.body.category || product.category;
            product.image = req.body.image || product.image;
            product.images = req.body.images || product.images;
            product.stock = req.body.stock !== undefined ? req.body.stock : product.stock;
            product.brand = req.body.brand !== undefined ? req.body.brand : product.brand;
            product.tags = req.body.tags || product.tags;
            product.featured = req.body.featured !== undefined ? req.body.featured : product.featured;
            product.sku = req.body.sku || product.sku;
            product.specifications = req.body.specifications || product.specifications;
            product.variants = req.body.variants || product.variants;

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Delete a product
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            await product.deleteOne();
            res.json({ message: 'Product removed' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Create product review
 * @route   POST /api/products/:id/reviews
 * @access  Private
 */
export const createProductReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const product = await Product.findById(req.params.id);

        if (product) {
            const userId = String(req.user._id || req.user.id);
            const alreadyReviewed = product.reviews.find(
                (r) => String(r.user) === userId
            );

            if (alreadyReviewed) {
                return res.status(400).json({ message: 'Product already reviewed' });
            }

            const review = {
                name: req.user.name,
                rating: Number(rating),
                comment,
                user: userId,
                createdAt: new Date().toISOString(),
            };

            product.reviews.push(review);
            product.numReviews = product.reviews.length;
            product.rating =
                product.reviews.reduce((acc, item) => item.rating + acc, 0) /
                product.reviews.length;

            await product.save();
            res.status(201).json({ message: 'Review added' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
