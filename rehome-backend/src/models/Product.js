// Product.js — Model
// Defines what data each furniture listing has
// Like a product form on OLX or Daraz

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    // Product title
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true
    },

    // Detailed description
    description: {
      type: String,
      required: [true, 'Description is required']
    },

    // Selling price
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0
    },

    // Original price (to show how much they save)
    originalPrice: {
      type: Number,
      default: 0
    },

    // Furniture category
    category: {
      type: String,
      required: true,
      enum: ['sofa', 'chair', 'table', 'bed',
             'wardrobe', 'shelf', 'desk', 'other']
    },

    // Condition of furniture
    condition: {
      type: String,
      required: true,
      enum: ['like_new', 'good', 'fair', 'poor']
    },

    // Product images (array of image URLs)
    images: [{
      type: String
    }],

    // City where furniture is located
    city: {
      type: String,
      required: true
    },

    // Full address
    address: {
      type: String,
      default: ''
    },

    // Who posted this product (reference to User)
    // Like a foreign key in SQL
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // Is product available or sold?
    status: {
      type: String,
      enum: ['available', 'sold', 'reserved'],
      default: 'available'
    },

    // How many people viewed this product
    views: {
      type: Number,
      default: 0
    },

    // How many people liked/wishlisted this
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],

    // Is this product featured on homepage?
    isFeatured: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true  // adds createdAt and updatedAt
  }
);

const Product = mongoose.model('Product', productSchema);
module.exports = Product;