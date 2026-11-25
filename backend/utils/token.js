import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_access_secret_menshub_2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || `${JWT_SECRET}_refresh_key_2026`;

/**
 * Generate short-lived access token (15 minutes)
 */
export const generateAccessToken = (userId, role = 'user') => {
    return jwt.sign(
        { id: userId, role },
        JWT_SECRET,
        { expiresIn: '15m' }
    );
};

/**
 * Generate long-lived refresh token (7 days)
 */
export const generateRefreshToken = (userId) => {
    return jwt.sign(
        { id: userId, type: 'refresh' },
        JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
    );
};

/**
 * Legacy token generation for backwards compatibility (defaults to 15m or 30d if specified)
 */
export const generateToken = (userId, role = 'user') => {
    return generateAccessToken(userId, role);
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch {
        return null;
    }
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, JWT_REFRESH_SECRET);
    } catch {
        return null;
    }
};

/**
 * Generate password reset token (15 minutes)
 */
export const generateResetToken = (userId, email) => {
    return jwt.sign(
        { id: userId, email, type: 'password_reset' },
        JWT_SECRET,
        { expiresIn: '15m' }
    );
};

/**
 * Verify password reset token
 */
export const verifyResetToken = (token) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.type !== 'password_reset') return null;
        return decoded;
    } catch {
        return null;
    }
};

/**
 * Legacy verify token alias
 */
export const verifyToken = (token) => {
    return verifyAccessToken(token);
};
