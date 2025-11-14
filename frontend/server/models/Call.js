const mongoose = require('mongoose');

const callSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
  },
  status: {
    type: String,
    enum: ['completed', 'failed', 'in-progress'],
    default: 'completed',
  },
  transcript: {
    type: String,
  },
  recording: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Call', callSchema);
