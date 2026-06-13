/**
 * Dynamic Pricing Engine
 * Calculates real-time prices based on demand, seasonality, and advance booking
 */

// Seasonal peak dates (month-day format)
const PEAK_PERIODS = [
  { start: '10-10', end: '10-30', multiplier: 1.4, label: 'Diwali' },
  { start: '12-20', end: '01-05', multiplier: 1.5, label: 'Christmas/New Year' },
  { start: '03-25', end: '04-10', multiplier: 1.3, label: 'Holi/Spring Break' },
  { start: '05-01', end: '06-15', multiplier: 1.25, label: 'Summer Vacation' },
];

/**
 * Check if a date falls in a peak period
 */
const getPeakMultiplier = (date) => {
  const d = new Date(date);
  const md = `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  for (const period of PEAK_PERIODS) {
    if (md >= period.start && md <= period.end) return period.multiplier;
  }
  return 1.0;
};

/**
 * Calculate demand-based multiplier from seat occupancy
 */
const getDemandMultiplier = (totalSeats, availableSeats) => {
  if (!totalSeats || totalSeats === 0) return 1.0;
  const occupancyRate = 1 - (availableSeats / totalSeats);
  if (occupancyRate >= 0.95) return 2.5;
  if (occupancyRate >= 0.90) return 2.0;
  if (occupancyRate >= 0.80) return 1.5;
  if (occupancyRate >= 0.70) return 1.3;
  if (occupancyRate >= 0.60) return 1.15;
  return 1.0;
};

/**
 * Advance booking discount
 */
const getAdvanceBookingDiscount = (travelDate) => {
  const today = new Date();
  const daysInAdvance = Math.ceil((new Date(travelDate) - today) / (1000 * 60 * 60 * 24));
  if (daysInAdvance >= 90) return 0.15; // 15% off
  if (daysInAdvance >= 60) return 0.12;
  if (daysInAdvance >= 30) return 0.10;
  if (daysInAdvance >= 15) return 0.05;
  return 0;
};

/**
 * Main pricing function
 * @param {Object} transport - Transport document
 * @param {String} travelClass - economy/business/first
 * @param {Date} searchDate - Date being searched for
 */
const applyDynamicPricing = (transport, travelClass = 'economy', searchDate) => {
  const basePrice = transport.priceClasses[travelClass] || transport.priceClasses.economy || 0;

  const peakMult = getPeakMultiplier(searchDate || transport.departureTime);
  const demandMult = getDemandMultiplier(transport.totalSeats, transport.availableSeats);
  const advDiscount = getAdvanceBookingDiscount(transport.departureTime);

  const dynamicPrice = Math.round(basePrice * peakMult * demandMult * (1 - advDiscount));
  const taxes = Math.round(dynamicPrice * 0.18); // 18% GST

  return {
    ...transport.toObject(),
    pricing: {
      basePrice,
      dynamicPrice,
      taxes,
      totalPrice: dynamicPrice + taxes,
      travelClass,
      multipliers: { peak: peakMult, demand: demandMult, advanceDiscount: advDiscount },
    }
  };
};

/**
 * Calculate refund amount based on cancellation policy
 */
const calculateRefund = (booking) => {
  if (!booking.paymentId) return 0;

  const now = new Date();
  const travelDate = new Date(booking.travelDate);
  const hoursToTravel = (travelDate - now) / (1000 * 60 * 60);

  let refundPercentage;
  if (hoursToTravel >= 72) refundPercentage = 0.90; // 90% refund
  else if (hoursToTravel >= 48) refundPercentage = 0.75;
  else if (hoursToTravel >= 24) refundPercentage = 0.50;
  else if (hoursToTravel >= 4) refundPercentage = 0.25;
  else refundPercentage = 0; // No refund

  return Math.round(booking.totalAmount * refundPercentage);
};

module.exports = { applyDynamicPricing, calculateRefund, getPeakMultiplier, getDemandMultiplier };
