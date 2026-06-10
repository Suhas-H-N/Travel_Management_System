const express = require('express');
const router = express.Router();
const Hotel = require('../models/Hotel');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', async (req, res) => {
  const hotels = await Hotel.find({ isActive: true }).sort({ starRating: -1 });
  res.json({ success: true, hotels });
});
router.get('/:id', async (req, res) => {
  const hotel = await Hotel.findById(req.params.id);
  if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });
  res.json({ success: true, hotel });
});
router.post('/', protect, authorize('admin'), async (req, res) => {
  const hotel = await Hotel.create(req.body);
  res.status(201).json({ success: true, hotel });
});
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, hotel });
});
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  await Hotel.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true, message: 'Hotel deactivated' });
});

module.exports = router;
