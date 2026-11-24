import Product from '../models/Product.js';

/**
 * @desc    Get user cart
 * @route   GET /api/cart
 * @access  Private
 */
export const getCart = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized, please log in' });
        }
        res.json(req.user.cart || []);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Add item to cart
 * @route   POST /api/cart
 * @access  Private
 */
export const addToCart = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized, please log in' });
        }

        const { id, size = 'M', quantity = 1, image, name, price, stock, category } = req.body;

        if (!id) {
            return res.status(400).json({ message: 'Product ID is required' });
        }

        // Verify stock in database
        const product = await Product.findById(id);
        const availableStock = product ? product.stock : (Number(stock) || 25);

        if (availableStock <= 0) {
            return res.status(400).json({ message: 'Product is out of stock' });
        }

        const itemKey = size ? `${id}-${size}` : `${id}`;
        let cart = Array.isArray(req.user.cart) ? [...req.user.cart] : [];

        const existingIndex = cart.findIndex((item) => item.itemKey === itemKey);

        if (existingIndex > -1) {
            const currentQty = cart[existingIndex].quantity || 1;
            const newQty = Math.min(currentQty + Number(quantity), availableStock);
            cart[existingIndex] = {
                ...cart[existingIndex],
                quantity: newQty,
                stock: availableStock,
            };
        } else {
            const initialQty = Math.min(Number(quantity) || 1, availableStock);
            cart.push({
                id,
                itemKey,
                size,
                quantity: initialQty,
                image: image || (product ? product.image : ''),
                name: name || (product ? product.name : ''),
                price: Number(price) || (product ? product.price : 0),
                stock: availableStock,
                category: category || (product ? product.category : ''),
            });
        }

        req.user.cart = cart;
        await req.user.save();

        res.status(200).json(req.user.cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Update cart item quantity
 * @route   PUT /api/cart
 * @access  Private
 */
export const updateCartItem = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized, please log in' });
        }

        const { itemKey, quantity } = req.body;

        if (!itemKey) {
            return res.status(400).json({ message: 'itemKey is required' });
        }

        let cart = Array.isArray(req.user.cart) ? [...req.user.cart] : [];
        const newQty = parseInt(quantity, 10);

        if (newQty <= 0) {
            cart = cart.filter((item) => item.itemKey !== itemKey);
        } else {
            const index = cart.findIndex((item) => item.itemKey === itemKey);
            if (index > -1) {
                const maxStock = Number(cart[index].stock || 99);
                cart[index].quantity = Math.min(newQty, maxStock);
            }
        }

        req.user.cart = cart;
        await req.user.save();

        res.json(req.user.cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/cart/:itemKey
 * @access  Private
 */
export const removeFromCart = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized, please log in' });
        }

        const { itemKey } = req.params;
        let cart = Array.isArray(req.user.cart) ? [...req.user.cart] : [];

        cart = cart.filter((item) => item.itemKey !== itemKey);

        req.user.cart = cart;
        await req.user.save();

        res.json(req.user.cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Clear entire cart
 * @route   DELETE /api/cart
 * @access  Private
 */
export const clearCart = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized, please log in' });
        }

        req.user.cart = [];
        await req.user.save();

        res.json([]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
