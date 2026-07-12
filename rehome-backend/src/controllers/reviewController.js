const Review = require('../models/Review');
const Order = require('../models/Order');
const Product = require('../models/Product');

// ═══════════════════════════════════
// CREATE REVIEW
// POST /api/reviews
// ═══════════════════════════════════
const createReview = async (req, res) => {
  try {
    const { orderId, rating, comment } = req.body;

    // Verify order exists and belongs to this buyer
    const order = await Order.findById(orderId).populate('product');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (order.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Only delivered orders can be reviewed
    if (order.status !== 'delivered') {
      return res.status(400).json({ success: false, message: 'You can only review delivered orders' });
    }

    // Check if already reviewed
    const existing = await Review.findOne({ order: orderId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You already reviewed this order' });
    }

    const review = await Review.create({
      product: order.product._id,
      seller: order.seller,
      buyer: req.user._id,
      order: orderId,
      rating,
      comment
    });

    await review.populate('buyer', 'fullName city');

    res.status(201).json({ success: true, message: 'Review submitted!', review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════
// GET REVIEWS FOR A PRODUCT
// GET /api/reviews/product/:productId
// ═══════════════════════════════════
const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('buyer', 'fullName city')
      .sort({ createdAt: -1 });

    const avgRating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

    res.json({ success: true, reviews, avgRating, total: reviews.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════
// GET REVIEWS FOR A SELLER
// GET /api/reviews/seller/:sellerId
// ═══════════════════════════════════
const getSellerReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ seller: req.params.sellerId })
      .populate('buyer', 'fullName city')
      .populate('product', 'title images')
      .sort({ createdAt: -1 });

    const avgRating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

    res.json({ success: true, reviews, avgRating, total: reviews.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════
// CHECK IF ORDER IS REVIEWED
// GET /api/reviews/check/:orderId
// ═══════════════════════════════════
const checkReviewed = async (req, res) => {
  try {
    const review = await Review.findOne({
      order: req.params.orderId,
      buyer: req.user._id
    });
    res.json({ success: true, reviewed: !!review, review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createReview, getProductReviews, getSellerReviews, checkReviewed };