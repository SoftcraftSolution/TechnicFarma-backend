const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Function to handle image uploads to Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => ({
    folder: 'images', // Store images in 'images' folder in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png'], // Specify allowed image formats
    public_id: `${Date.now()}-${file.originalname}` // Unique filename
  })
});

// Upload middleware configured to handle image uploads
const upload = multer({ storage });

module.exports = upload;
module.exports.cloudinary = cloudinary; // Export Cloudinary for use in other modules
