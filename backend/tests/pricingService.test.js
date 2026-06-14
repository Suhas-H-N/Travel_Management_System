// tests/pricingService.test.js
const { applyDynamicPricing, calculateRefund, getDemandMultiplier, getPeakMultiplier } = require('../services/pricingService');

describe('PricingService', () => {
  describe('getDemandMultiplier', () => {
    test('returns 1.0 for low occupancy (<60%)', () => {
      expect(getDemandMultiplier(100, 50)).toBe(1.0);
    });
    test('returns 1.15 for 60-70% occupancy', () => {
      expect(getDemandMultiplier(100, 35)).toBe(1.15);
    });
    test('returns 1.5 for 80-90% occupancy', () => {
      expect(getDemandMultiplier(100, 15)).toBe(1.5);
    });
    test('returns 2.0 for 90-95% occupancy', () => {
      expect(getDemandMultiplier(100, 7)).toBe(2.0);
    });
    test('returns 2.5 for >95% occupancy', () => {
      expect(getDemandMultiplier(100, 3)).toBe(2.5);
    });
    test('returns 1.0 for zero totalSeats', () => {
      expect(getDemandMultiplier(0, 0)).toBe(1.0);
    });
  });

  describe('getPeakMultiplier', () => {
    test('returns 1.0 for off-peak date', () => {
      expect(getPeakMultiplier(new Date('2025-02-10'))).toBe(1.0);
    });
    test('returns 1.5 for Christmas period', () => {
      expect(getPeakMultiplier(new Date('2025-12-25'))).toBe(1.5);
    });
    test('returns 1.4 for Diwali period', () => {
      expect(getPeakMultiplier(new Date('2025-10-20'))).toBe(1.4);
    });
  });

  describe('calculateRefund', () => {
    const makeBooking = (hoursFromNow, totalAmount) => ({
      paymentId: 'some-payment-id',
      totalAmount,
      travelDate: new Date(Date.now() + hoursFromNow * 60 * 60 * 1000),
    });

    test('returns 90% refund for >72h before travel', () => {
      const booking = makeBooking(100, 10000);
      expect(calculateRefund(booking)).toBe(9000);
    });
    test('returns 75% refund for 48-72h before travel', () => {
      const booking = makeBooking(60, 10000);
      expect(calculateRefund(booking)).toBe(7500);
    });
    test('returns 50% refund for 24-48h before travel', () => {
      const booking = makeBooking(36, 10000);
      expect(calculateRefund(booking)).toBe(5000);
    });
    test('returns 25% refund for 4-24h before travel', () => {
      const booking = makeBooking(12, 10000);
      expect(calculateRefund(booking)).toBe(2500);
    });
    test('returns 0 refund for <4h before travel', () => {
      const booking = makeBooking(2, 10000);
      expect(calculateRefund(booking)).toBe(0);
    });
    test('returns 0 if no payment', () => {
      expect(calculateRefund({ totalAmount: 5000, travelDate: new Date() })).toBe(0);
    });
  });

  describe('applyDynamicPricing', () => {
    const mockTransport = {
      toObject: () => ({
        _id: '123', type: 'flight', carrier: 'IndiGo',
        priceClasses: { economy: 3500, business: 9000 },
        totalSeats: 180, availableSeats: 100,
        departureTime: new Date('2025-02-15T10:00:00'),
      }),
      priceClasses: { economy: 3500, business: 9000 },
      totalSeats: 180, availableSeats: 100,
      departureTime: new Date('2025-02-15T10:00:00'),
    };

    test('returns pricing object with totalPrice', () => {
      const result = applyDynamicPricing(mockTransport, 'economy', new Date('2025-02-15'));
      expect(result.pricing).toBeDefined();
      expect(result.pricing.totalPrice).toBeGreaterThan(0);
      expect(result.pricing.taxes).toBeGreaterThan(0);
    });

    test('business class costs more than economy', () => {
      const eco = applyDynamicPricing(mockTransport, 'economy', new Date('2025-02-15'));
      const biz = applyDynamicPricing(mockTransport, 'business', new Date('2025-02-15'));
      expect(biz.pricing.totalPrice).toBeGreaterThan(eco.pricing.totalPrice);
    });
  });
});
