import Product from '../models/Product.js';

/**
 * @desc    Get all products
 * @route   GET /api/products
 * @access  Public
 * @param   {Object} req - Express request object (query: category, search, keyword, featured)
 * @param   {Object} res - Express response object
 * @returns {void}
 */
export const getProducts = async (req, res) => {
    try {
        const { category, search, keyword, featured } = req.query;
        let query = {};

        if (category) {
            query.category = category;
        }

        const searchTerm = search || keyword;
        if (searchTerm) {
            query.$or = [
                { name: { $regex: searchTerm, $options: 'i' } },
                { description: { $regex: searchTerm, $options: 'i' } },
            ];
        }

        if (featured !== undefined) {
            query.featured = featured === 'true' || featured === true;
        }

        const products = await Product.find(query);
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 * @param   {Object} req - Express request object (params: id)
 * @param   {Object} res - Express response object
 * @returns {void}
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
 * @desc    Create a new product
 * @route   POST /api/products
 * @access  Private/Admin
 * @param   {Object} req - Express request object (body: product details)
 * @param   {Object} res - Express response object
 * @returns {void}
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
 * @param   {Object} req - Express request object (params: id, body: updates)
 * @param   {Object} res - Express response object
 * @returns {void}
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
 * @param   {Object} req - Express request object (params: id)
 * @param   {Object} res - Express response object
 * @returns {void}
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
 * @param   {Object} req - Express request object (params: id, body: rating, comment)
 * @param   {Object} res - Express response object
 * @returns {void}
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
