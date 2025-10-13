const jwt = require('jsonwebtoken');

// Middleware to authenticate user using JWT
const authMiddleware = (req, res, next) => {
    // Support token via Authorization header (Bearer) or httpOnly cookie named 'token'
    let token = null;
    const header = req.header('Authorization');
    if (header && header.startsWith('Bearer ')) token = header.replace('Bearer ', '');
    if (!token && req.cookies && req.cookies.token) token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ message: 'Invalid token.' });
    }
};

const isAuthenticated = (req, res, next) => {
    if (!req.user) {
        return res.status(403).json({ message: 'Forbidden. You do not have access to this resource.' });
    }
    next();
};

module.exports = {
    authMiddleware,
    isAuthenticated
};