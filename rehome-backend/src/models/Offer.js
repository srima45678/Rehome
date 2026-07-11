// Offer.js — Model
// Tracks price offers between buyers and sellers

const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // Original offer amount from buyer
    offerPrice: {
      type: Number,
      required: true
    },
    // Counter offer from seller (if any)
    counterPrice: {
      type: Number,
      default: null
    },
    // Overall offer status
    status: {
      type: String,
      enum: ['pending', 'countered', 'accepted', 'rejected'],
      default: 'pending'
    },
    // Optional message from buyer
    message: {
      type: String,
      default: ''
    },
    // Optional message from seller when countering/rejecting
    sellerMessage: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

const Offer = mongoose.model('Offer', offerSchema);
module.exports = Offer;