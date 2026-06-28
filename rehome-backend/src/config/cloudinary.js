// cloudinary.js
// Configures connection to Cloudinary
// Like setting up an FTP server for images

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Connect to Cloudinary using our credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Storage config — tells multer WHERE to save files
// Instead of saving locally, we save to Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'rehome-products',   // folder name in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 800, height: 600, crop: 'limit' }  // resize large images
    ]
  }
});

// multer = handles file uploads from forms
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }  // max 5MB per image
});

module.exports = { cloudinary, upload };