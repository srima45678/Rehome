const express = require('express');
const router = express.Router();
const { createReview, getProductReviews, getSellerReviews, checkReviewed } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createReview);
router.get('/product/:productId', getProductReviews);
router.get('/seller/:sellerId', getSellerReviews);
router.get('/check/:orderId', protect, checkReviewed);

module.exports = router;