import Product from '../models/Product.js';

/**
 * @desc    Get user wishlist
 * @route   GET /api/wishlist
 * @access  Private
 */
export const getWishlist = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized, please log in' });
        }
        res.json(req.user.wishlist || []);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Add product to wishlist
 * @route   POST /api/wishlist
 * @access  Private
 */
export const addToWishlist = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized, please log in' });
        }

        const { id, name, price, image, category, rating, stock } = req.body;

        if (!id) {
            return res.status(400).json({ message: 'Product ID is required' });
        }

        let wishlist = Array.isArray(req.user.wishlist) ? [...req.user.wishlist] : [];
        const exists = wishlist.some((item) => String(item.id) === String(id));

        if (!exists) {
            const product = await Product.findById(id);
            wishlist.push({
                id,
                name: name || (product ? product.name : ''),
                price: Number(price) || (product ? product.price : 0),
                image: image || (product ? product.image : ''),
                category: category || (product ? product.category : ''),
                rating: Number(rating) || (product ? product.rating : 4.5),
                stock: stock !== undefined ? Number(stock) : (product ? product.stock : 25),
            });
            req.user.wishlist = wishlist;
            await req.user.save();
        }

        res.status(200).json(req.user.wishlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Remove product from wishlist
 * @route   DELETE /api/wishlist/:id
 * @access  Private
 */
export const removeFromWishlist = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized, please log in' });
        }

        const { id } = req.params;
        let wishlist = Array.isArray(req.user.wishlist) ? [...req.user.wishlist] : [];

        wishlist = wishlist.filter((item) => String(item.id) !== String(id));

        req.user.wishlist = wishlist;
        await req.user.save();

        res.json(req.user.wishlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Clear entire wishlist
 * @route   DELETE /api/wishlist
 * @access  Private
 */
export const clearWishlist = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized, please log in' });
        }

        req.user.wishlist = [];
        await req.user.save();

        res.json([]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
