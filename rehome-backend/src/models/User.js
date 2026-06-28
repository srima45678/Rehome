// User.js — Model
// This defines the structure of a user in our database
// Like designing a form: what fields does a user have?

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Schema = the blueprint/template for our data
// Like designing columns in a database table
const userSchema = new mongoose.Schema(
  {
    // Full name of user
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true  // removes extra spaces
    },

    // Email - must be unique (no two users with same email)
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,  // saves as lowercase always
      trim: true
    },

    // Phone number
    phone: {
      type: String,
      required: [true, 'Phone number is required']
    },

    // Password - will be encrypted before saving
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false  // won't be returned in queries by default
    },

    // Role - what type of user are they?
    role: {
      type: String,
      enum: ['buyer', 'seller', 'admin'],  // only these 3 values allowed
      default: 'buyer'
    },

    // City they live in
    city: {
      type: String,
      required: [true, 'City is required']
    },

    // Profile picture URL (stored in Cloudinary later)
    profileImage: {
      type: String,
      default: ''
    },

    // Is their account active?
    isActive: {
      type: Boolean,
      default: true
    },

    // Is their email verified?
    isVerified: {
      type: Boolean,
      default: false
    },

    // Can this buyer also sell? (upgraded later)
    canSell: {
      type: Boolean,
      default: false
    },

    // Products this user has saved to wishlist
    wishlist: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }],

    // OTP for email verification and forgot password
    otp: {
      type: String,
      default: null
    },

    otpExpiry: {
      type: Date,
      default: null
    }
  },
  {
    // timestamps = automatically adds createdAt and updatedAt fields
    timestamps: true
  }
);

// ═══════════════════════════════════
// MIDDLEWARE — runs before saving
// This encrypts password before it goes to database
// ═══════════════════════════════════
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// ═══════════════════════════════════
// METHOD — check if password is correct
// Used during login to verify password
// ═══════════════════════════════════
userSchema.methods.comparePassword = async function (enteredPassword) {
  // bcrypt.compare = checks if entered password matches encrypted one
  return await bcrypt.compare(enteredPassword, this.password);
};

// Create the model from schema
// 'User' = collection name in MongoDB (becomes 'users')
const User = mongoose.model('User', userSchema);

module.exports = User;