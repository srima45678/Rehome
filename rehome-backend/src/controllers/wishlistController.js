// wishlistController.js
// Handles adding/removing/viewing wishlist items
// Wishlist is stored as array of Product IDs inside User document

const User = require('../models/User');

// ═══════════════════════════════════
// GET MY WISHLIST
// GET /api/wishlist
// ═══════════════════════════════════
const getWishlist = async (req, res) => {
  try {
    // populate('wishlist') replaces product IDs with full product data
    const user = await User.findById(req.user.id)
      .populate({
        path: 'wishlist',
        populate: { path: 'seller', select: 'fullName city' }
      });

    res.json({
      success: true,
      count: user.wishlist.length,
      wishlist: user.wishlist
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════
// TOGGLE WISHLIST (add if not there, remove if there)
// POST /api/wishlist/:productId
// ═══════════════════════════════════
const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user.id);

    // Check if product already in wishlist
    const index = user.wishlist.findIndex(
      id => id.toString() === productId
    );

    let added;
    if (index > -1) {
      // Already in wishlist → remove it
      user.wishlist.splice(index, 1);
      added = false;
    } else {
      // Not in wishlist → add it
      user.wishlist.push(productId);
      added = true;
    }

    await user.save();

    res.json({
      success: true,
      added,
      message: added ? '❤️ Added to wishlist!' : 'Removed from wishlist',
      wishlistCount: user.wishlist.length
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getWishlist, toggleWishlist };