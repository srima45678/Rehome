// chatController.js
// REST API for chat history
// Socket.io handles real-time messaging

const Chat = require('../models/Chat');
const Product = require('../models/Product');

// ═══════════════════════════════════
// GET OR CREATE CHAT ROOM
// POST /api/chat/room
// Called when buyer clicks "Chat with Seller"
// ═══════════════════════════════════
const getOrCreateChat = async (req, res) => {
  try {
    const { productId } = req.body;
    const buyerId = req.user.id;

    // Get product to find seller
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const sellerId = product.seller;

    // Prevent seller from chatting with themselves
    if (sellerId.toString() === buyerId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot chat about your own product'
      });
    }

    // Find existing chat or create new one
    let chat = await Chat.findOne({
      product: productId,
      buyer: buyerId,
      seller: sellerId
    })
    .populate('product', 'title images price')
    .populate('buyer', 'fullName profileImage')
    .populate('seller', 'fullName profileImage')
    .populate('messages.sender', 'fullName');

    if (!chat) {
      chat = await Chat.create({
        product: productId,
        buyer: buyerId,
        seller: sellerId,
        messages: []
      });

      // Populate after creation
      chat = await Chat.findById(chat._id)
        .populate('product', 'title images price')
        .populate('buyer', 'fullName profileImage')
        .populate('seller', 'fullName profileImage');
    }

    res.json({ success: true, chat });

  } catch (error) {
    console.error('Get/create chat error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════
// GET ALL MY CHATS
// GET /api/chat/my-chats
// Shows list of all conversations
// ═══════════════════════════════════
const getMyChats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all chats where user is buyer OR seller
    const chats = await Chat.find({
      $or: [{ buyer: userId }, { seller: userId }]
    })
    .populate('product', 'title images price')
    .populate('buyer', 'fullName profileImage')
    .populate('seller', 'fullName profileImage')
    .sort({ lastMessageAt: -1 }); // most recent first

    res.json({ success: true, chats });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════
// GET SINGLE CHAT WITH MESSAGES
// GET /api/chat/:chatId
// ═══════════════════════════════════
const getChatById = async (req, res) => {
  try {
    const userId = req.user.id;

    const chat = await Chat.findById(req.params.chatId)
      .populate('product', 'title images price city')
      .populate('buyer', 'fullName profileImage')
      .populate('seller', 'fullName profileImage')
      .populate('messages.sender', 'fullName profileImage');

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Only buyer or seller can access this chat
    const isMember =
      chat.buyer._id.toString() === userId ||
      chat.seller._id.toString() === userId;

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    res.json({ success: true, chat });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════
// SAVE MESSAGE TO DATABASE
// Called internally by Socket.io
// ═══════════════════════════════════
const saveMessage = async (chatId, senderId, content) => {
  try {
    const chat = await Chat.findById(chatId);
    if (!chat) return null;

    // Add message to messages array
    chat.messages.push({
      sender: senderId,
      content: content,
      readBy: [senderId]
    });

    // Update last message preview
    chat.lastMessage = content;
    chat.lastMessageAt = new Date();

    await chat.save();

    // Return the newly added message populated
    const updatedChat = await Chat.findById(chatId)
      .populate('messages.sender', 'fullName profileImage');

    return updatedChat.messages[updatedChat.messages.length - 1];

  } catch (error) {
    console.error('Save message error:', error);
    return null;
  }
};

module.exports = {
  getOrCreateChat,
  getMyChats,
  getChatById,
  saveMessage
};