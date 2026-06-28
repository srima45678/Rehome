const express = require('express');
const router = express.Router();
const {
  getOrCreateChat,
  getMyChats,
  getChatById
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.post('/room', protect, getOrCreateChat);
router.get('/my-chats', protect, getMyChats);
router.get('/:chatId', protect, getChatById);

module.exports = router;