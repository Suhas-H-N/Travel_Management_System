const express = require('express');
const router = express.Router();
const Package = require('../models/Package');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', async (req, res) => {
  const packages = await Package.find({ isActive: true }).sort({ isFeatured: -1, bookingCount: -1 });
  res.json({ success: true, packages });
});
router.get('/featured', async (req, res) => {
  const packages = await Package.find({ isActive: true, isFeatured: true }).limit(6);
  res.json({ success: true, packages });
});
router.get('/:id', async (req, res) => {
  const pkg = await Package.findById(req.params.id);
  if (!pkg) return res.status(404).json({ success: false, message: 'Package not found' });
  res.json({ success: true, package: pkg });
});
router.post('/', protect, authorize('admin', 'agent'), async (req, res) => {
  const pkg = await Package.create(req.body);
  res.status(201).json({ success: true, package: pkg });
});
router.put('/:id', protect, authorize('admin', 'agent'), async (req, res) => {
  const pkg = await Package.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, package: pkg });
});
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  await Package.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true, message: 'Package deactivated' });
});

module.exports = router;
