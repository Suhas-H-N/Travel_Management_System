const express = require('express');
const userRouter = express.Router();
const reviewRouter = express.Router();
const User = require('../models/User');
const Review = require('../models/Review');
const { protect, authorize } = require('../middleware/authMiddleware');

// ─── User Routes ──────────────────────────────────────────────────────────────
userRouter.get('/me', protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});
userRouter.put('/me', protect, async (req, res) => {
  const allowed = ['name', 'phone', 'preferences', 'profileImage'];
  const updates = {};
  allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
  res.json({ success: true, user });
});
userRouter.put('/me/password', protect, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+passwordHash');
  if (!(await user.comparePassword(currentPassword))) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect' });
  }
  user.passwordHash = newPassword;
  await user.save();
  res.json({ success: true, message: 'Password updated' });
});

module.exports.userRouter = userRouter;

// ─── Review Routes ────────────────────────────────────────────────────────────
reviewRouter.get('/:targetType/:targetId', async (req, res) => {
  const { targetType, targetId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const reviews = await Review.find({ targetType, targetId, isApproved: true })
    .populate('userId', 'name profileImage')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  const total = await Review.countDocuments({ targetType, targetId, isApproved: true });
  res.json({ success: true, reviews, total });
});
reviewRouter.post('/', protect, async (req, res) => {
  const { targetType, targetId, rating, title, body } = req.body;
  const review = await Review.create({ userId: req.user._id, targetType, targetId, rating, title, body });
  res.status(201).json({ success: true, review });
});
reviewRouter.delete('/:id', protect, async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
  if (review.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  await review.deleteOne();
  res.json({ success: true, message: 'Review deleted' });
});

module.exports.reviewRouter = reviewRouter;
