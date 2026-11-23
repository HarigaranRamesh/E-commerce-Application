import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';

/**
 * @desc    Create new order
 * @route   POST /api/orders
 * @access  Private
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
            couponCode,
            discountAmount,
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

        // Increment coupon usage if used
        if (couponCode) {
            await Coupon.incrementUsage(couponCode).catch(() => {});
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
            couponCode: couponCode || null,
            discountAmount: discountAmount || 0,
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
 */
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

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
            order.addTimelineEvent('confirmed', 'Payment Received', `Payment processed via ${order.paymentMethod.toUpperCase()}`);

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
 * @desc    Update Order Status (Admin)
 * @route   PUT /api/orders/:id/status
 * @access  Private/Admin
 */
export const updateOrderStatus = async (req, res) => {
    try {
        const { status, note, carrier, trackingNumber } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const titles = {
            confirmed: 'Order Confirmed',
            processing: 'Order in Processing',
            shipped: 'Order Shipped',
            out_for_delivery: 'Out for Delivery',
            delivered: 'Order Delivered',
            cancelled: 'Order Cancelled',
            returned: 'Return Approved',
            refunded: 'Refund Processed',
        };

        if (carrier) order.carrier = carrier;
        if (trackingNumber) order.trackingNumber = trackingNumber;

        order.addTimelineEvent(
            status,
            titles[status] || `Status updated to ${status}`,
            note || (trackingNumber ? `Tracking #${trackingNumber} via ${carrier || 'Express'}` : '')
        );

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Cancel Order (Customer)
 * @route   PUT /api/orders/:id/cancel
 * @access  Private
 */
export const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const reqUserId = String(req.user._id || req.user.id);
        const orderUserId = typeof order.user === 'object' ? String(order.user._id || order.user.id) : String(order.user);

        if (req.user.role !== 'admin' && reqUserId !== orderUserId) {
            return res.status(403).json({ message: 'Not authorized to modify this order' });
        }

        if (order.status === 'shipped' || order.status === 'delivered') {
            return res.status(400).json({
                message: `Order cannot be cancelled as it is already ${order.status}. You may request a return once delivered.`
            });
        }

        order.addTimelineEvent('cancelled', 'Order Cancelled', req.body.reason || 'Cancelled by customer');
        const updatedOrder = await order.save();

        // Restore stock
        for (const item of order.orderItems) {
            const product = await Product.findById(item.product);
            if (product) {
                product.stock += item.quantity;
                await product.save();
            }
        }

        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Request Return (Customer)
 * @route   PUT /api/orders/:id/return
 * @access  Private
 */
export const requestReturn = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const reqUserId = String(req.user._id || req.user.id);
        const orderUserId = typeof order.user === 'object' ? String(order.user._id || order.user.id) : String(order.user);

        if (req.user.role !== 'admin' && reqUserId !== orderUserId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (order.status !== 'delivered') {
            return res.status(400).json({ message: 'Returns can only be requested for delivered orders' });
        }

        order.addTimelineEvent('returned', 'Return Requested', req.body.reason || 'Customer requested return');
        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get logged in user orders
 * @route   GET /api/orders/myorders
 * @access  Private
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
 * @desc    Update order to delivered (Admin alias)
 * @route   PUT /api/orders/:id/deliver
 * @access  Private/Admin
 */
export const updateOrderToDelivered = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            order.addTimelineEvent('delivered', 'Order Delivered', 'Package delivered successfully');
            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
