// auth.js — Middleware
// This checks if user is logged in before allowing access
// Like a security guard checking your ID card

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in request headers
    // Token is sent as: Authorization: Bearer <token>
    if (req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // If no token found
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Please login to access this'
      });
    }

    // Verify the token is valid and not expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user from token's id
    req.user = await User.findById(decoded.id);

    // Move to next function
    next();

  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please login again.'
    });
  }
};

// Check if user has required role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Only ${roles.join(', ')} can access this`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };