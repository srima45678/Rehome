// Order.js
// Represents a purchase transaction
// Tracks the journey: ordered → shipped → delivered

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    // Which product was ordered
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },

    // Who is buying
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // Who is selling
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // Price at time of order (in case seller changes price later)
    price: {
      type: Number,
      required: true
    },

    // Delivery address
    deliveryAddress: {
      type: String,
      required: true
    },

    deliveryCity: {
      type: String,
      required: true
    },

    // Contact phone for delivery
    contactPhone: {
      type: String,
      required: true
    },

    // Order status — tracks the journey
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending'
    },

    // Payment status
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending'
    },

    // Payment method
    paymentMethod: {
      type: String,
      enum: ['cash_on_delivery', 'online'],
      default: 'cash_on_delivery'
    }
  },
  {
    timestamps: true
  }
);

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;