const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProduct,
  getMyProducts,
  updateProduct,
  deleteProduct,
  toggleLike
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// ── Public routes (no login needed) ──
router.get('/', getProducts);

// ── Protected routes (login required) ──
// IMPORTANT: /seller/my-products must be BEFORE /:id
// Otherwise Express thinks "my-products" is an ID!
router.get('/seller/my-products', protect, getMyProducts);

// Single product
router.get('/:id', getProduct);

// Create product with image upload (max 5 images)
router.post('/', protect, upload.array('images', 5), createProduct);

// Update product
router.put('/:id', protect, updateProduct);

// Delete product
router.delete('/:id', protect, deleteProduct);

// Like/Unlike
router.post('/:id/like', protect, toggleLike);

module.exports = router;