// adminController.js
// Only admin users can access these functions
// Manages users, products, and platform stats

const User = require('../models/User');
const Product = require('../models/Product');

// ═══════════════════════════════════
// GET DASHBOARD STATS
// GET /api/admin/stats
// ═══════════════════════════════════
const getStats = async (req, res) => {
  try {
    // Count all documents in each collection
    const totalUsers = await User.countDocuments();
    const totalBuyers = await User.countDocuments({ role: 'buyer' });
    const totalSellers = await User.countDocuments({ role: 'seller' });
    const totalProducts = await Product.countDocuments();
    const availableProducts = await Product.countDocuments({ status: 'available' });
    const soldProducts = await Product.countDocuments({ status: 'sold' });

    // Get recent users (last 5)
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('fullName email role city createdAt');

    // Get recent products (last 5)
    const recentProducts = await Product.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('seller', 'fullName')
      .select('title price category status createdAt');

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalBuyers,
        totalSellers,
        totalProducts,
        availableProducts,
        soldProducts
      },
      recentUsers,
      recentProducts
    });

  } catch (error) {
    console.error('GET STATS ERROR:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════
// GET ALL USERS
// GET /api/admin/users
// ═══════════════════════════════════
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .sort({ createdAt: -1 })
      .select('-password'); // don't send passwords

    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════
// DELETE USER
// DELETE /api/admin/users/:id
// ═══════════════════════════════════
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent deleting admin accounts
    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete admin accounts'
      });
    }

    await user.deleteOne();
    res.json({ success: true, message: 'User deleted successfully' });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════
// GET ALL PRODUCTS (admin view)
// GET /api/admin/products
// ═══════════════════════════════════
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .populate('seller', 'fullName email');

    res.json({ success: true, count: products.length, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════
// DELETE PRODUCT (admin)
// DELETE /api/admin/products/:id
// ═══════════════════════════════════
const deleteProductAdmin = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    await product.deleteOne();
    res.json({ success: true, message: 'Product deleted by admin' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════
// TOGGLE USER STATUS (ban/unban)
// PUT /api/admin/users/:id/toggle-status
// ═══════════════════════════════════
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'banned'} successfully`,
      isActive: user.isActive
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getStats,
  getAllUsers,
  deleteUser,
  getAllProducts,
  deleteProductAdmin,
  toggleUserStatus
};