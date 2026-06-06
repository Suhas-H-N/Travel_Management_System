const Booking = require('../models/Booking');
const User = require('../models/User');
const Payment = require('../models/Payment');
const Transport = require('../models/Transport');
const Hotel = require('../models/Hotel');
const Package = require('../models/Package');

// @desc  Dashboard analytics
// @route GET /api/admin/analytics
exports.getAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - Number(period));

    const [
      totalRevenue, totalBookings, totalUsers, cancelledBookings,
      revenueByDay, bookingsByType, topDestinations, recentBookings
    ] = await Promise.all([
      Payment.aggregate([
        { $match: { status: 'paid', createdAt: { $gte: daysAgo } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Booking.countDocuments({ createdAt: { $gte: daysAgo }, status: { $ne: 'pending' } }),
      User.countDocuments({ createdAt: { $gte: daysAgo } }),
      Booking.countDocuments({ status: 'cancelled', createdAt: { $gte: daysAgo } }),
      Payment.aggregate([
        { $match: { status: 'paid', createdAt: { $gte: daysAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      Booking.aggregate([
        { $match: { createdAt: { $gte: daysAgo }, status: 'confirmed' } },
        { $group: { _id: '$bookingType', count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } }
      ]),
      Transport.aggregate([
        { $group: { _id: '$destinationCity', bookings: { $sum: 1 } } },
        { $sort: { bookings: -1 } },
        { $limit: 5 }
      ]),
      Booking.find({ status: { $ne: 'pending' } })
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .limit(10)
    ]);

    const cancellationRate = totalBookings > 0 ? ((cancelledBookings / totalBookings) * 100).toFixed(1) : 0;

    res.json({
      success: true,
      analytics: {
        totalRevenue: (totalRevenue[0]?.total || 0) / 100, // convert from paise
        totalBookings,
        newUsers: totalUsers,
        cancellationRate,
        revenueByDay,
        bookingsByType,
        topDestinations,
        recentBookings,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get all users (paginated)
// @route GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const filter = {};
    if (search) filter.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];
    if (role) filter.role = role;

    const users = await User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
    const total = await User.countDocuments(filter);

    res.json({ success: true, users, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get all bookings (admin)
// @route GET /api/admin/bookings
exports.getAllBookings = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, type } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.bookingType = type;

    const bookings = await Booking.find(filter)
      .populate('userId', 'name email')
      .populate('paymentId')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Booking.countDocuments(filter);
    res.json({ success: true, bookings, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Update user role
// @route PUT /api/admin/users/:id/role
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'agent', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Generate revenue report
// @route GET /api/admin/reports/revenue
exports.generateRevenueReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = new Date(startDate || new Date().setDate(new Date().getDate() - 30));
    const end = new Date(endDate || new Date());

    const report = await Payment.aggregate([
      { $match: { status: 'paid', createdAt: { $gte: start, $lte: end } } },
      {
        $lookup: { from: 'bookings', localField: 'bookingId', foreignField: '_id', as: 'booking' }
      },
      { $unwind: '$booking' },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          totalRevenue: { $sum: '$amount' },
          count: { $sum: 1 },
          byType: { $push: { type: '$booking.bookingType', amount: '$amount' } },
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ success: true, report, startDate: start, endDate: end });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
