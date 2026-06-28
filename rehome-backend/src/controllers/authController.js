// authController.js
// Handles all authentication logic:
// - Register new user
// - Login user
// - Get current user

const User = require('../models/User');
const jwt = require('jsonwebtoken');

// ═══════════════════════════════════
// HELPER — Generate JWT Token
// Like creating a hotel key card for the user
// ═══════════════════════════════════
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },           // what we store in token
    process.env.JWT_SECRET,   // secret key to sign it
    { expiresIn: process.env.JWT_EXPIRE }  // token expires in 7 days
  );
};

// ═══════════════════════════════════
// REGISTER
// POST /api/auth/register
// ═══════════════════════════════════
const register = async (req, res) => {
  try {
    // 1. Get data from request body (what React sends us)
    const { fullName, email, phone, password, role, city } = req.body;

    // 2. Check if all fields are provided
    if (!fullName || !email || !phone || !password || !city) {
      return res.status(400).json({
        success: false,
        message: 'Please fill all required fields'
      });
    }

    // 3. Check if user already exists with this email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered. Please login.'
      });
    }

    // 4. Create new user in database
    // Password will be automatically encrypted by our model middleware
    const user = await User.create({
      fullName,
      email,
      phone,
      password,
      role: role || 'buyer',
      city
    });

    // 5. Generate token for immediate login after register
    const token = generateToken(user._id);

    // 6. Send success response back to React
    res.status(201).json({
      success: true,
      message: `Welcome to ReHome, ${user.fullName}!`,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        city: user.city
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

// ═══════════════════════════════════
// LOGIN
// POST /api/auth/login
// ═══════════════════════════════════
const login = async (req, res) => {
  try {
    // 1. Get email and password from request
    const { email, password } = req.body;

    // 2. Check if email and password provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // 3. Find user by email
    // +password = include password field (hidden by default)
    const user = await User.findOne({ email }).select('+password');

    // 4. If user not found
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // 5. Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // 6. Generate token
    const token = generateToken(user._id);

    // 7. Send response
    res.json({
      success: true,
      message: `Welcome back, ${user.fullName}!`,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        city: user.city
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

// ═══════════════════════════════════
// GET CURRENT USER
// GET /api/auth/me
// ═══════════════════════════════════
const getMe = async (req, res) => {
  try {
    // req.user is set by our auth middleware
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

// ═══════════════════════════════════
// FORGOT PASSWORD — Send OTP
// POST /api/auth/forgot-password
// ═══════════════════════════════════
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your email address'
      });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address'
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // OTP expires in 10 minutes
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // Save OTP to user (we already have otp and otpExpiry fields in User model)
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
        <div style="background: #8B4513; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">🛋️ ReHome</h1>
          <p style="color: #F5DEB3; margin: 5px 0;">Nepal's Furniture Marketplace</p>
        </div>
        <div style="background: #FFF8F0; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #E8D5C4;">
          <h2 style="color: #333; margin-top: 0;">Password Reset Request</h2>
          <p style="color: #555;">Hello <strong>${user.fullName}</strong>,</p>
          <p style="color: #555;">You requested to reset your password. Use the OTP below:</p>
          <div style="background: #8B4513; color: white; font-size: 36px; font-weight: bold; text-align: center; padding: 20px; border-radius: 10px; letter-spacing: 8px; margin: 20px 0;">
            ${otp}
          </div>
          <p style="color: #888; font-size: 14px;">⏰ This OTP expires in <strong>10 minutes</strong></p>
          <p style="color: #888; font-size: 14px;">🔒 If you didn't request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #E8D5C4; margin: 20px 0;">
          <p style="color: #AAA; font-size: 12px; text-align: center;">ReHome Nepal — Give Furniture a Second Life 🏡</p>
        </div>
      </div>
    `;

    const emailSent = await sendEmail({
      to: email,
      subject: 'Your ReHome Password Reset OTP',
      html: emailHtml
    });

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email. Please try again.'
      });
    }

    res.json({
      success: true,
      message: `OTP sent to ${email}. Check your inbox!`
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ═══════════════════════════════════
// VERIFY OTP
// POST /api/auth/verify-otp
// ═══════════════════════════════════
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if OTP matches
    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please check and try again.'
      });
    }

    // Check if OTP is expired
    if (new Date() > user.otpExpiry) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    res.json({
      success: true,
      message: 'OTP verified successfully!'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ═══════════════════════════════════
// RESET PASSWORD
// POST /api/auth/reset-password
// ═══════════════════════════════════
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify OTP again for security
    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    if (new Date() > user.otpExpiry) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    // Update password (pre-save hook will encrypt it)
    user.password = newPassword;

    // Clear OTP after successful reset
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    // Send success email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
        <div style="background: #8B4513; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">🛋️ ReHome</h1>
        </div>
        <div style="background: #FFF8F0; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #E8D5C4;">
          <h2 style="color: #333;">✅ Password Reset Successful</h2>
          <p style="color: #555;">Hello <strong>${user.fullName}</strong>,</p>
          <p style="color: #555;">Your password has been reset successfully. You can now login with your new password.</p>
          <p style="color: #888; font-size: 14px;">🔒 If you didn't do this, contact us immediately.</p>
        </div>
      </div>
    `;

    await sendEmail({
      to: email,
      subject: 'Password Reset Successful — ReHome',
      html: emailHtml
    });

    res.json({
      success: true,
      message: 'Password reset successfully! You can now login.'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { register, login, getMe, forgotPassword, verifyOtp, resetPassword };