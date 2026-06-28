const express = require('express');
const router = express.Router();
const { getWishlist, toggleWishlist } = require('../controllers/wishlistController');
const { protect } = require('../middleware/auth');

// All wishlist routes need login
router.get('/', protect, getWishlist);
router.post('/:productId', protect, toggleWishlist);

module.exports = router;