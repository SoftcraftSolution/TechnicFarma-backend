const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const documentSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to update the updatedAt field
documentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Document = mongoose.model('Notes', documentSchema);

module.exports = Document;
