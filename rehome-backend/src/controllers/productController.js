// productController.js
// Handles ALL product operations
// Create, Read, Update, Delete + Image Upload

const Product = require('../models/Product');
const { cloudinary } = require('../config/cloudinary');

// ═══════════════════════════════════
// CREATE PRODUCT WITH IMAGES
// POST /api/products
// Only logged in users can do this
// ═══════════════════════════════════
const createProduct = async (req, res) => {
  try {
    // Get all text fields from request body
    const {
      title,
      description,
      price,
      originalPrice,
      category,
      condition,
      city,
      address
    } = req.body;

    // Validate required fields
    if (!title || !description || !price || !category || !condition || !city) {
      return res.status(400).json({
        success: false,
        message: 'Please fill all required fields'
      });
    }

    // req.files = array of uploaded image files
    // Each file has a .path property = Cloudinary URL
    // If no images uploaded, use empty array
    const images = req.files
      ? req.files.map(file => file.path)
      : [];

    // Save product to MongoDB
    const product = await Product.create({
      title,
      description,
      price: Number(price),
      originalPrice: Number(originalPrice) || 0,
      category,
      condition,
      city,
      address: address || '',
      seller: req.user.id,  // logged in user's ID
      images               // array of Cloudinary image URLs
    });

    // Send success response to frontend
    res.status(201).json({
      success: true,
      message: 'Product listed successfully!',
      product
    });

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ═══════════════════════════════════
// GET ALL PRODUCTS
// GET /api/products
// Everyone can see — visitors too
// ═══════════════════════════════════
const getProducts = async (req, res) => {
  try {
    // req.query = URL parameters after ?
    // Example: /api/products?category=sofa&city=Kathmandu
    const {
      category,
      city,
      condition,
      minPrice,
      maxPrice,
      search
    } = req.query;

    // Start with only available products
    let filter = { status: 'available' };

    // Add filters only if they are provided
    if (category) filter.category = category;
    if (city) filter.city = city;
    if (condition) filter.condition = condition;

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Search in title and description
    // $regex = like SQL LIKE '%search%'
    // $options: 'i' = case insensitive
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Find products and get seller info
    // populate = replaces seller ID with actual seller data
    const products = await Product.find(filter)
      .populate('seller', 'fullName city profileImage')
      .sort({ createdAt: -1 }); // newest first

    res.json({
      success: true,
      count: products.length,
      products
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ═══════════════════════════════════
// GET SINGLE PRODUCT
// GET /api/products/:id
// Everyone can see
// ═══════════════════════════════════
const getProduct = async (req, res) => {
  try {
    // req.params.id = the ID in the URL
    // Example: /api/products/6a1fc841de... → id = 6a1fc841de...
    const product = await Product.findById(req.params.id)
      .populate('seller', 'fullName city phone profileImage');

    // If product doesn't exist
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Increment view count every time someone opens product
    product.views += 1;
    await product.save();

    res.json({
      success: true,
      product
    });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ═══════════════════════════════════
// GET MY PRODUCTS
// GET /api/products/seller/my-products
// Only logged in seller sees their own products
// ═══════════════════════════════════
const getMyProducts = async (req, res) => {
  try {
    // req.user.id = logged in user's ID (set by auth middleware)
    const products = await Product.find({ seller: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: products.length,
      products
    });

  } catch (error) {
    console.error('Get my products error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ═══════════════════════════════════
// UPDATE PRODUCT
// PUT /api/products/:id
// Only the seller who posted can update
// ═══════════════════════════════════
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if this user owns the product
    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own products'
      });
    }

    // Update fields
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }  // return updated document
    );

    res.json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct
    });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ═══════════════════════════════════
// DELETE PRODUCT
// DELETE /api/products/:id
// Only the seller who posted can delete
// ═══════════════════════════════════
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Only the seller who posted can delete
    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own products'
      });
    }

    // Delete images from Cloudinary to save storage
    // Loop through each image URL and delete from cloud
    if (product.images && product.images.length > 0) {
      for (const imageUrl of product.images) {
        try {
          // Extract public_id from Cloudinary URL
          // URL format: https://res.cloudinary.com/cloud/image/upload/v123/rehome-products/filename.jpg
          const urlParts = imageUrl.split('/');
          const filename = urlParts[urlParts.length - 1];
          const publicId = `rehome-products/${filename.split('.')[0]}`;
          await cloudinary.uploader.destroy(publicId);
        } catch (imgError) {
          // Don't stop deletion if image delete fails
          console.error('Image delete error:', imgError);
        }
      }
    }

    // Delete product from MongoDB
    await product.deleteOne();

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ═══════════════════════════════════
// TOGGLE LIKE/UNLIKE PRODUCT
// POST /api/products/:id/like
// ═══════════════════════════════════
const toggleLike = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const userId = req.user.id;

    // Check if already liked
    const alreadyLiked = product.likes.includes(userId);

    if (alreadyLiked) {
      // Remove like
      product.likes = product.likes.filter(id => id.toString() !== userId);
    } else {
      // Add like
      product.likes.push(userId);
    }

    await product.save();

    res.json({
      success: true,
      liked: !alreadyLiked,
      likesCount: product.likes.length
    });

  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ═══════════════════════════════════
// FLAG A PRODUCT
// POST /api/products/:id/flag
// ═══════════════════════════════════
const flagProduct = async (req, res) => {
  try {
    const { reason, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    // Prevent seller from flagging own product
    if (product.seller.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot report your own listing' });
    }

    // Prevent duplicate flags from same user
    const alreadyFlagged = product.flags.some(
      f => f.user.toString() === req.user._id.toString()
    );
    if (alreadyFlagged) {
      return res.status(400).json({ success: false, message: 'You already reported this listing' });
    }

    product.flags.push({ user: req.user._id, reason, comment });
    product.isFlagged = true;
    await product.save();

    res.json({ success: true, message: 'Listing reported successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Export all functions so routes can use them
module.exports = {
  createProduct,
  getProducts,
  getProduct,
  getMyProducts,
  updateProduct,
  deleteProduct,
  toggleLike,
  flagProduct
};