// Chat.js
// Stores chat messages between buyer and seller
// Each conversation is identified by buyer+product combo

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { timestamps: true });

const chatSchema = new mongoose.Schema({
  // The product being discussed
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },

  // The two participants
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

  // All messages in this conversation
  messages: [messageSchema],

  // Last message preview for chat list
  lastMessage: {
    type: String,
    default: ''
  },

  lastMessageAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Chat = mongoose.model('Chat', chatSchema);
module.exports = Chat;