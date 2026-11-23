import Coupon from '../models/Coupon.js';

/**
 * @desc    Validate coupon code
 * @route   POST /api/coupons/validate
 * @access  Public
 */
export const validateCoupon = async (req, res) => {
    try {
        const { code, cartTotal } = req.body;

        if (!code) {
            return res.status(400).json({ message: 'Coupon code is required' });
        }

        const numericTotal = parseFloat(cartTotal) || 0;
        const result = await Coupon.validateCoupon(code, numericTotal);

        if (!result.valid) {
            return res.status(400).json(result);
        }

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get all coupons (Admin)
 * @route   GET /api/coupons
 * @access  Private/Admin
 */
export const getCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find();
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Create new coupon (Admin)
 * @route   POST /api/coupons
 * @access  Private/Admin
 */
export const createCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.create(req.body);
        res.status(201).json(coupon);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
