// transportRoutes.js
const express = require('express');
const router = express.Router();
const Transport = require('../models/Transport');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', async (req, res) => {
  const transports = await Transport.find({ status: 'scheduled' }).sort({ departureTime: 1 }).limit(50);
  res.json({ success: true, transports });
});
router.get('/:id', async (req, res) => {
  const t = await Transport.findById(req.params.id);
  if (!t) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, transport: t });
});
router.post('/', protect, authorize('admin'), async (req, res) => {
  const t = await Transport.create(req.body);
  res.status(201).json({ success: true, transport: t });
});
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  const t = await Transport.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, transport: t });
});
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  await Transport.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Transport deleted' });
});

module.exports = router;
