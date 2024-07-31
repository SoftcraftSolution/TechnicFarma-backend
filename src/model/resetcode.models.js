const mongoose = require('mongoose');

const resetCodeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    code: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 1200 // Expires in 20 minutes
    }
});

const ResetCode = mongoose.model('ResetCode', resetCodeSchema);

module.exports = ResetCode;
