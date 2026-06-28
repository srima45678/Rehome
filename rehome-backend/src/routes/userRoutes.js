const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  changePassword,
  updateProfilePicture,
  uploadProfile
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.put('/profile-picture', protect, uploadProfile.single('profileImage'), updateProfilePicture);

module.exports = router;