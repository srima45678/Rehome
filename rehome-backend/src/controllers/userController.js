// userController.js
// Handles profile updates for logged in users

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { cloudinary } = require('../config/cloudinary');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Cloudinary storage for profile pictures
const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'rehome-profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 300, height: 300, crop: 'fill', gravity: 'face' }]
  }
});

const uploadProfile = multer({
  storage: profileStorage,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB max
});

// ═══════════════════════════════════
// GET MY PROFILE
// GET /api/users/profile
// ═══════════════════════════════════
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════
// UPDATE PROFILE INFO
// PUT /api/users/profile
// ═══════════════════════════════════
const updateProfile = async (req, res) => {
  try {
    const { fullName, phone, city } = req.body;

    // Validate phone if provided
    if (phone && phone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must be 10 digits'
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { fullName, phone, city },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: updatedUser
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════
// CHANGE PASSWORD
// PUT /api/users/change-password
// ═══════════════════════════════════
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password (pre-save hook will encrypt it)
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully!'
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════
// UPDATE PROFILE PICTURE
// PUT /api/users/profile-picture
// ═══════════════════════════════════
const updateProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select an image'
      });
    }

    // Delete old profile picture from Cloudinary if exists
    const user = await User.findById(req.user.id);
    if (user.profileImage && user.profileImage.includes('cloudinary')) {
      try {
        const urlParts = user.profileImage.split('/');
        const filename = urlParts[urlParts.length - 1].split('.')[0];
        await cloudinary.uploader.destroy(`rehome-profiles/${filename}`);
      } catch (err) {
        console.log('Could not delete old profile picture');
      }
    }

    // Save new picture URL
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { profileImage: req.file.path },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile picture updated!',
      user: updatedUser
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  updateProfilePicture,
  uploadProfile
};