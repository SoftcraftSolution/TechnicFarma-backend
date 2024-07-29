const mongoose = require('mongoose');

// Define the Salesman schema
const salesmanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, // Assuming userId refers to the ObjectId of a User model
    required: true,
    ref: 'User' // Optional: Reference to the User model, if you have it defined
  },
  location: {
    type: String,
    required: true
  },
  image: {
    type: String, // Optional field for image URL or path
    default: null // Default to null if no image is provided
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Optional: Adds createdAt and updatedAt fields automatically
});

// Create and export the Salesman model
module.exports = mongoose.model('Salesman', salesmanSchema);
