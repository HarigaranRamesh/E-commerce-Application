import Order from '../models/Order.js';
import User from '../models/User.js';

/**
 * @desc    Get dashboard stats
 * @route   GET /api/analytics/dashboard
 * @access  Private/Admin
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @returns {void}
 */
export const getDashboardStats = async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const totalUsers = await User.countDocuments();

        const orders = await Order.find();
        const totalSales = orders.reduce((acc, order) => acc + (order.totalPrice || 0), 0);

        const salesByStatus = await Order.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            totalOrders,
            totalUsers,
            totalSales,
            salesByStatus
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
