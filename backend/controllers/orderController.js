import Order from '../models/Order.js';
import Product from '../models/Product.js';

/**
 * @desc    Create new order
 * @route   POST /api/orders
 * @access  Private
 * @param   {Object} req - Express request object (body: order details)
 * @param   {Object} res - Express response object
 * @returns {void}
 */
export const createOrder = async (req, res) => {
    try {
        const {
            orderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
        } = req.body;

        if (orderItems && orderItems.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }

        const dbOrderItems = [];
        for (const item of orderItems) {
            let product = await Product.findById(item.product);

            if (!product) {
                product = await Product.findOne({ id: item.product });
            }

            if (!product) {
                return res.status(404).json({
                    message: `Product with id ${item.product} not found. Please refresh your cart.`
                });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for product: ${product.name}` });
            }

            dbOrderItems.push({
                ...item,
                product: product._id || product.id,
                _id: undefined,
            });

            // Deduct stock immediately
            product.stock -= item.quantity;
            await product.save();
        }

        const order = await Order.create({
            user: req.user._id || req.user.id,
            orderItems: dbOrderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice: itemsPrice || totalPrice || 0,
            taxPrice: taxPrice || 0,
            shippingPrice: shippingPrice || 0,
            totalPrice: totalPrice || itemsPrice || 0,
        });

        res.status(201).json(order);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get order by ID
 * @route   GET /api/orders/:id
 * @access  Private
 * @param   {Object} req - Express request object (params: id)
 * @param   {Object} res - Express response object
 * @returns {void}
 */
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Authorization check: only owner or admin can view order
        const reqUserId = String(req.user._id || req.user.id);
        const orderUserId = typeof order.user === 'object' ? String(order.user._id || order.user.id) : String(order.user);

        if (req.user.role !== 'admin' && reqUserId !== orderUserId) {
            return res.status(403).json({ message: 'Not authorized to view this order' });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Update order to paid
 * @route   PUT /api/orders/:id/pay
 * @access  Private
 * @param   {Object} req - Express request object (params: id, body: paymentResult)
 * @param   {Object} res - Express response object
 * @returns {void}
 */
export const updateOrderToPaid = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            order.isPaid = true;
            order.paidAt = new Date();
            order.paymentResult = {
                id: req.body.id,
                status: req.body.status,
                update_time: req.body.update_time,
                email_address: req.body.email_address,
            };
            order.status = 'processing';

            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get logged in user orders
 * @route   GET /api/orders/myorders
 * @access  Private
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @returns {void}
 */
export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id || req.user.id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get all orders (Admin)
 * @route   GET /api/orders
 * @access  Private/Admin
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @returns {void}
 */
export const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).populate('user', 'id name email').sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Update order to delivered (Admin)
 * @route   PUT /api/orders/:id/deliver
 * @access  Private/Admin
 * @param   {Object} req - Express request object (params: id)
 * @param   {Object} res - Express response object
 * @returns {void}
 */
export const updateOrderToDelivered = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            order.isDelivered = true;
            order.deliveredAt = new Date();
            order.status = 'delivered';

            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
