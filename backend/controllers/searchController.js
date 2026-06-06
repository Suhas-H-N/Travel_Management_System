const Transport = require('../models/Transport');
const Hotel = require('../models/Hotel');
const Package = require('../models/Package');
const { applyDynamicPricing } = require('../services/pricingService');

// @desc  Search transports (flights/trains/buses)
// @route GET /api/search/transport
exports.searchTransport = async (req, res) => {
  try {
    const { type, origin, destination, date, passengers = 1, class: travelClass } = req.query;
    if (!origin || !destination || !date) {
      return res.status(400).json({ success: false, message: 'origin, destination, and date are required' });
    }

    const searchDate = new Date(date);
    const nextDay = new Date(searchDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const filter = {
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase(),
      departureTime: { $gte: searchDate, $lt: nextDay },
      availableSeats: { $gte: Number(passengers) },
      status: 'scheduled',
    };
    if (type) filter.type = type;

    const transports = await Transport.find(filter).sort({ departureTime: 1 });

    // Apply dynamic pricing
    const results = transports.map(t => {
      const priced = applyDynamicPricing(t, travelClass, searchDate);
      return priced;
    });

    res.json({ success: true, count: results.length, results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Search hotels
// @route GET /api/search/hotels
exports.searchHotels = async (req, res) => {
  try {
    const { city, checkIn, checkOut, guests = 1, rooms = 1, minRating, minPrice, maxPrice, sortBy = 'rating' } = req.query;
    if (!city || !checkIn || !checkOut) {
      return res.status(400).json({ success: false, message: 'city, checkIn, and checkOut are required' });
    }

    const filter = {
      'location.city': new RegExp(city, 'i'),
      isActive: true,
    };
    if (minRating) filter.starRating = { $gte: Number(minRating) };

    const sortMap = {
      rating: { starRating: -1 },
      price: { 'rooms.pricePerNight': 1 },
      popular: { reviewCount: -1 },
    };

    const hotels = await Hotel.find(filter).sort(sortMap[sortBy] || { starRating: -1 });

    // Filter hotels with available rooms
    const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
    const results = hotels.filter(h => {
      const availableRooms = h.rooms.filter(r => r.status === 'available');
      return availableRooms.length >= Number(rooms);
    }).map(h => ({
      ...h.toObject(),
      nights,
      minPrice: Math.min(...h.rooms.map(r => r.pricePerNight)),
      estimatedTotal: Math.min(...h.rooms.map(r => r.pricePerNight)) * nights * Number(rooms),
    }));

    // Price filter
    const filtered = results.filter(h => {
      if (minPrice && h.minPrice < Number(minPrice)) return false;
      if (maxPrice && h.minPrice > Number(maxPrice)) return false;
      return true;
    });

    res.json({ success: true, count: filtered.length, nights, results: filtered });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Search packages
// @route GET /api/search/packages
exports.searchPackages = async (req, res) => {
  try {
    const { category, minDuration, maxDuration, minPrice, maxPrice, destination, page = 1, limit = 12 } = req.query;

    const filter = { isActive: true };
    if (category) filter.category = category;
    if (minDuration || maxDuration) {
      filter.duration = {};
      if (minDuration) filter.duration.$gte = Number(minDuration);
      if (maxDuration) filter.duration.$lte = Number(maxDuration);
    }
    if (destination) filter['destinations.city'] = new RegExp(destination, 'i');
    if (minPrice || maxPrice) {
      filter['priceTiers.standard'] = {};
      if (minPrice) filter['priceTiers.standard'].$gte = Number(minPrice);
      if (maxPrice) filter['priceTiers.standard'].$lte = Number(maxPrice);
    }

    const packages = await Package.find(filter)
      .sort({ isFeatured: -1, bookingCount: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Package.countDocuments(filter);

    res.json({ success: true, count: packages.length, total, page: Number(page), pages: Math.ceil(total / limit), results: packages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get popular destinations
// @route GET /api/search/destinations
exports.getPopularDestinations = async (req, res) => {
  try {
    const destinations = await Transport.aggregate([
      { $match: { status: 'scheduled', departureTime: { $gte: new Date() } } },
      { $group: { _id: '$destinationCity', count: { $sum: 1 }, avgPrice: { $avg: '$priceClasses.economy' } } },
      { $sort: { count: -1 } },
      { $limit: 8 }
    ]);
    res.json({ success: true, destinations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
