const Booking = require('../models/Booking');
const Transport = require('../models/Transport');
const Hotel = require('../models/Hotel');
const Payment = require('../models/Payment');
const { generateETicket } = require('../services/pdfService');
const { sendEmail } = require('../services/emailService');
const { calculateRefund } = require('../services/pricingService');

// @desc  Create booking (provisional hold)
// @route POST /api/bookings
exports.createBooking = async (req, res) => {
  const session = await require('mongoose').startSession();
  session.startTransaction();
  try {
    const { bookingType, itemId, passengers, rooms, travelDate, returnDate, totalAmount, baseFare, taxes } = req.body;

    // Map bookingType to model ref
    const refMap = { flight: 'Transport', train: 'Transport', bus: 'Transport', hotel: 'Hotel', package: 'Package' };
    const bookingTypeRef = refMap[bookingType];

    // Validate item exists and has availability
    let item;
    if (['flight', 'train', 'bus'].includes(bookingType)) {
      item = await Transport.findById(itemId).session(session);
      if (!item || item.availableSeats < passengers.length) {
        await session.abortTransaction();
        return res.status(400).json({ success: false, message: 'Not enough seats available' });
      }
      // Reserve seats
      const requestedSeats = passengers.map(p => p.seatNumber).filter(Boolean);
      requestedSeats.forEach(seatNum => {
        const seat = item.seats.find(s => s.seatNumber === seatNum);
        if (seat) seat.status = 'booked';
      });
      item.availableSeats -= passengers.length;
      await item.save({ session });
    } else if (bookingType === 'hotel') {
      item = await Hotel.findById(itemId).session(session);
      if (!item) {
        await session.abortTransaction();
        return res.status(400).json({ success: false, message: 'Hotel not found' });
      }
    }

    const holdExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10-min hold

    const booking = await Booking.create([{
      userId: req.user._id,
      bookingType,
      bookingTypeRef,
      itemId,
      passengers: passengers || [],
      rooms: rooms || [],
      travelDate,
      returnDate,
      totalAmount,
      baseFare,
      taxes,
      holdExpiresAt,
      status: 'pending',
    }], { session });

    await session.commitTransaction();
    res.status(201).json({ success: true, booking: booking[0] });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ success: false, message: err.message });
  } finally {
    session.endSession();
  }
};

// @desc  Get all bookings for logged-in user
// @route GET /api/bookings
exports.getMyBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const filter = { userId: req.user._id };
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .populate('itemId')
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

// @desc  Get single booking
// @route GET /api/bookings/:id
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('itemId').populate('paymentId').populate('userId', 'name email phone');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // Only owner or admin
    if (booking.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Cancel booking
// @route PUT /api/bookings/:id/cancel
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (['cancelled', 'refunded', 'completed'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: `Booking is already ${booking.status}` });
    }

    const refundAmount = calculateRefund(booking);
    booking.status = 'cancelled';
    booking.cancellationDate = new Date();
    booking.cancellationReason = req.body.reason || 'User requested';
    booking.refundAmount = refundAmount;
    await booking.save();

    // Release seats back
    if (['flight', 'train', 'bus'].includes(booking.bookingType)) {
      await Transport.findByIdAndUpdate(booking.itemId, { $inc: { availableSeats: booking.passengers.length } });
    }

    // Initiate refund via Razorpay if payment exists
    if (booking.paymentId && refundAmount > 0) {
      // Refund logic would call Razorpay API here
      await Payment.findByIdAndUpdate(booking.paymentId, { refundAmount, refundStatus: 'pending', status: 'refunded' });
    }

    sendEmail({
      to: req.user.email,
      subject: 'Booking Cancellation Confirmed',
      template: 'booking-cancellation',
      data: { name: req.user.name, bookingRef: booking.bookingRef, refundAmount }
    }).catch(console.error);

    res.json({ success: true, message: 'Booking cancelled', refundAmount, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Confirm booking after payment (called by payment webhook)
exports.confirmBooking = async (bookingId) => {
  const booking = await Booking.findByIdAndUpdate(
    bookingId, { status: 'confirmed', holdExpiresAt: null }, { new: true }
  ).populate('userId', 'name email').populate('itemId');

  if (booking) {
    const ticketUrl = await generateETicket(booking);
    booking.eTicketUrl = ticketUrl;
    await booking.save();

    sendEmail({
      to: booking.userId.email,
      subject: `Booking Confirmed - ${booking.bookingRef}`,
      template: 'booking-confirmation',
      data: { name: booking.userId.name, booking, ticketUrl }
    }).catch(console.error);
  }
  return booking;
};
