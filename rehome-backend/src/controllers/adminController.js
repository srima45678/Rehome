// adminController.js
// Only admin users can access these functions
// Manages users, products, and platform stats

const User = require('../models/User');
const Product = require('../models/Product');
const Offer = require('../models/Offer');
const sendEmail = require('../utils/sendEmail');

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
    

    const flaggedProducts = await Product.countDocuments({
      isFlagged: true
    });

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
        soldProducts,
        flaggedProducts
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

// ═══════════════════════════════════
// GET ANALYTICS DATA
// GET /api/admin/analytics
// ═══════════════════════════════════
const getAnalytics = async (req, res) => {
  try {
    // Category breakdown
    const categoryData = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // User growth - last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Price range distribution
    const priceRanges = await Product.aggregate([
      {
        $bucket: {
          groupBy: '$price',
          boundaries: [0, 1000, 5000, 10000, 25000, 50000, 100000],
          default: '100000+',
          output: { count: { $sum: 1 } }
        }
      }
    ]);

    // Products by status
    const statusData = await Product.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Format month names
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const formattedUserGrowth = userGrowth.map(item => ({
      month: monthNames[item._id.month - 1],
      users: item.count
    }));

    const formattedPriceRanges = priceRanges.map(item => ({
      range: item._id === 0 ? 'Under 1K' :
             item._id === 1000 ? '1K-5K' :
             item._id === 5000 ? '5K-10K' :
             item._id === 10000 ? '10K-25K' :
             item._id === 25000 ? '25K-50K' :
             item._id === 50000 ? '50K-100K' : '100K+',
      count: item.count
    }));

    res.json({
      success: true,
      categoryData: categoryData.map(c => ({ name: c._id, value: c.count })),
      userGrowth: formattedUserGrowth,
      priceRanges: formattedPriceRanges,
      statusData: statusData.map(s => ({ name: s._id, value: s.count }))
    });

  } catch (error) {
    console.error('ANALYTICS ERROR:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════
// GET ALL FLAGGED PRODUCTS
// GET /api/admin/flagged
// ═══════════════════════════════════
const getFlaggedProducts = async (req, res) => {
  try {
    const flagged = await Product.find({ isFlagged: true })
      .populate('seller', 'fullName email')
      .populate('flags.user', 'fullName email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: flagged.length, products: flagged });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════
// RESOLVE FLAG — keep or remove listing
// PUT /api/admin/flagged/:id/resolve
// ═══════════════════════════════════
const resolveFlag = async (req, res) => {
  try {
    const { action } = req.body; // 'keep' or 'remove'
    const product = await Product.findById(req.params.id).populate('seller', 'fullName email');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    if (action === 'remove') {
      const sellerEmail = product.seller?.email;
      const sellerName = product.seller?.fullName;
      const productTitle = product.title;

      await product.deleteOne();

      // Notify seller — status only, no reporter details
      if (sellerEmail) {
        await sendEmail({
          to: sellerEmail,
          subject: 'Your ReHome listing was removed',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
              <h2 style="color: #8B4513;">Hi ${sellerName},</h2>
              <p>Your listing <strong>"${productTitle}"</strong> was reviewed by our team and has been
              <strong style="color: #dc2626;">removed</strong> for violating ReHome's listing guidelines.</p>
              <p>If you believe this was a mistake, please contact our support team.</p>
              <p style="margin-top: 20px; color: #666; font-size: 13px;">— ReHome Nepal Team</p>
            </div>
          `
        });
      }

      return res.json({ success: true, message: 'Product removed and seller notified' });

    } else {
      product.isFlagged = false;
      product.flagResolved = true;
      product.flags = [];
      await product.save();
      
      // Notify seller their listing passed review
      if (product.seller?.email) {
        await sendEmail({
          to: product.seller.email,
          subject: 'Your ReHome listing review is complete',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
              <h2 style="color: #8B4513;">Hi ${product.seller.fullName},</h2>
              <p>Your listing <strong>"${product.title}"</strong> was reported by a user, but after review,
              our team found <strong style="color: #16a34a;">no issues</strong>. Your listing remains active.</p>
              <p style="margin-top: 20px; color: #666; font-size: 13px;">— ReHome Nepal Team</p>
            </div>
          `
        });
      }

      return res.json({ success: true, message: 'Listing approved — seller notified' });
    }
  } catch (error) {
    console.error('RESOLVE FLAG ERROR:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════
// GET ALL OFFERS (admin view — read only)
// GET /api/admin/offers
// ═══════════════════════════════════
const getAllOffers = async (req, res) => {
  try {
    const offers = await Offer.find()
      .populate('product', 'title price images status')
      .populate('buyer', 'fullName email city')
      .populate('seller', 'fullName email city')
      .sort({ createdAt: -1 });

    // Simple summary stats for the top of the page
    const totalOffers = offers.length;
    const accepted = offers.filter(o => o.status === 'accepted');
    const pending = offers.filter(o => o.status === 'pending' || o.status === 'countered');
    const rejected = offers.filter(o => o.status === 'rejected');

    const avgDiscountPercent = accepted.length > 0
      ? Math.round(
          accepted.reduce((sum, o) => {
            const original = o.product?.price || 0;
            if (!original) return sum;
            return sum + ((original - o.offerPrice) / original) * 100;
          }, 0) / accepted.length
        )
      : 0;

    res.json({
      success: true,
      count: totalOffers,
      stats: {
        total: totalOffers,
        accepted: accepted.length,
        pending: pending.length,
        rejected: rejected.length,
        avgDiscountPercent
      },
      offers
    });
  } catch (error) {
    console.error('GET ALL OFFERS ERROR:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getStats,
  getAllUsers,
  deleteUser,
  getAllProducts,
  deleteProductAdmin,
  toggleUserStatus,
  getAnalytics,
  getFlaggedProducts,
  resolveFlag,
  getAllOffers
};
