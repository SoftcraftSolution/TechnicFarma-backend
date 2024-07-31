const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the ResetCode schema
const resetCodeSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  code: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ResetCode', resetCodeSchema);
