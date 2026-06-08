const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetType: { type: String, enum: ['Hotel', 'Transport', 'Package'], required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'targetType' },
  rating: { type: Number, min: 1, max: 5, required: true },
  title: { type: String, trim: true, maxlength: 100 },
  body: { type: String, trim: true, maxlength: 1000 },
  images: [{ type: String }],
  verifiedBooking: { type: Boolean, default: false },
  helpfulVotes: { type: Number, default: 0 },
  isApproved: { type: Boolean, default: true },
}, { timestamps: true });

reviewSchema.index({ targetType: 1, targetId: 1, rating: -1 });
reviewSchema.index({ userId: 1 });

module.exports = mongoose.model('Review', reviewSchema);
