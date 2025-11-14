const mongoose = require('mongoose');

const scheduledCallSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  scheduledTime: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled', 'failed'],
    default: 'pending',
  },
  message: {
    type: String,
  },
  name: {
    type: String,
  },
  notes: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

scheduledCallSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('ScheduledCall', scheduledCallSchema);
