require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Transport = require('../models/Transport');
const Hotel = require('../models/Hotel');
const Package = require('../models/Package');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB for seeding...');

  // Clear existing data
  await Promise.all([User.deleteMany(), Transport.deleteMany(), Hotel.deleteMany(), Package.deleteMany()]);
  console.log('Cleared existing data');

  // Admin user
  await User.create({
    name: 'Admin User', email: 'admin@travelms.com', passwordHash: 'Admin@1234',
    role: 'admin', isVerified: true, phone: '+91-9999999999'
  });

  // Test user
  await User.create({
    name: 'Rahul Sharma', email: 'user@travelms.com', passwordHash: 'User@1234',
    role: 'user', isVerified: true, phone: '+91-9876543210'
  });

  // Transports
  const now = new Date();
  const transports = [];
  const routes = [
    { origin: 'DEL', originCity: 'Delhi', destination: 'MUM', destinationCity: 'Mumbai' },
    { origin: 'MUM', originCity: 'Mumbai', destination: 'BLR', destinationCity: 'Bengaluru' },
    { origin: 'DEL', originCity: 'Delhi', destination: 'BLR', destinationCity: 'Bengaluru' },
    { origin: 'HYD', originCity: 'Hyderabad', destination: 'CHE', destinationCity: 'Chennai' },
    { origin: 'BLR', originCity: 'Bengaluru', destination: 'COK', destinationCity: 'Kochi' },
  ];

  for (const route of routes) {
    for (let d = 1; d <= 14; d++) {
      const dep = new Date(now); dep.setDate(dep.getDate() + d); dep.setHours(6 + Math.floor(Math.random() * 12), 0, 0);
      const arr = new Date(dep); arr.setMinutes(arr.getMinutes() + 90 + Math.floor(Math.random() * 60));
      const seats = Array.from({ length: 180 }, (_, i) => ({
        seatNumber: `${String.fromCharCode(65 + Math.floor(i / 30))}${(i % 30) + 1}`,
        class: i < 30 ? 'business' : 'economy',
        status: Math.random() > 0.3 ? 'available' : 'booked',
        price: i < 30 ? 8000 + Math.floor(Math.random() * 4000) : 3000 + Math.floor(Math.random() * 2000),
      }));
      transports.push({
        type: 'flight', carrier: ['IndiGo', 'Air India', 'SpiceJet', 'Vistara', 'GoAir'][Math.floor(Math.random() * 5)],
        transportNumber: `${['6E', 'AI', 'SG', 'UK', 'G8'][Math.floor(Math.random() * 5)]}-${Math.floor(Math.random() * 900) + 100}`,
        ...route, departureTime: dep, arrivalTime: arr, seats,
        totalSeats: 180, availableSeats: seats.filter(s => s.status === 'available').length,
        priceClasses: { economy: 3500 + d * 200, business: 9000 + d * 500 },
        amenities: ['WiFi', 'Meals', 'Charging Port'], status: 'scheduled',
      });
    }
  }
  await Transport.insertMany(transports);

  // Hotels
  const hotels = [
    { name: 'The Grand Mumbai', city: 'Mumbai', state: 'Maharashtra', lat: 18.9388, lng: 72.8353, stars: 5, minPrice: 8000 },
    { name: 'Royal Delhi Palace', city: 'Delhi', state: 'Delhi', lat: 28.6139, lng: 77.2090, stars: 5, minPrice: 10000 },
    { name: 'Comfort Inn Bengaluru', city: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lng: 77.5946, stars: 3, minPrice: 2500 },
    { name: 'Sea View Kochi', city: 'Kochi', state: 'Kerala', lat: 9.9312, lng: 76.2673, stars: 4, minPrice: 4500 },
    { name: 'Heritage Hyderabad', city: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867, stars: 4, minPrice: 5000 },
  ];

  for (const h of hotels) {
    const rooms = [];
    for (let i = 1; i <= 20; i++) {
      rooms.push({ roomType: i <= 5 ? 'suite' : i <= 12 ? 'deluxe' : 'standard', roomNumber: `${Math.floor(i / 5) + 1}0${i}`, pricePerNight: h.minPrice + (i <= 5 ? 5000 : i <= 12 ? 2000 : 0), maxGuests: i <= 5 ? 4 : 2, amenities: ['AC', 'TV', 'WiFi', 'Mini Bar'], status: Math.random() > 0.3 ? 'available' : 'booked' });
    }
    await Hotel.create({
      name: h.name, description: `A beautiful ${h.stars}-star hotel in the heart of ${h.city}.`,
      location: { type: 'Point', coordinates: [h.lng, h.lat], address: `Central ${h.city}`, city: h.city, state: h.state, country: 'India' },
      starRating: h.stars, rooms, amenities: ['Swimming Pool', 'Gym', 'Restaurant', 'Spa', 'WiFi', 'Parking'],
      checkInTime: '14:00', checkOutTime: '12:00', averageRating: 3.5 + Math.random() * 1.5, reviewCount: Math.floor(Math.random() * 500), isActive: true,
    });
  }

  // Packages
  await Package.insertMany([
    {
      name: 'Kerala Backwaters Bliss', description: 'Experience the serene backwaters of Kerala with houseboat stays, spice garden tours, and Kathakali performances.',
      destinations: [{ city: 'Kochi', country: 'India', nights: 2 }, { city: 'Alleppey', country: 'India', nights: 3 }, { city: 'Munnar', country: 'India', nights: 2 }],
      duration: 7, inclusions: ['Flights', 'Hotel', 'Houseboat', 'Meals', 'Transfers', 'Guide'], priceTiers: { standard: 28000, deluxe: 38000, premium: 55000 },
      category: 'beach', isFeatured: true, isActive: true, tags: ['backwaters', 'nature', 'kerala'],
    },
    {
      name: 'Rajasthan Royal Tour', description: 'Explore the majestic forts and palaces of Rajasthan. Visit Jaipur, Jodhpur, and Udaipur.',
      destinations: [{ city: 'Jaipur', country: 'India', nights: 2 }, { city: 'Jodhpur', country: 'India', nights: 2 }, { city: 'Udaipur', country: 'India', nights: 2 }],
      duration: 6, inclusions: ['Flights', 'Heritage Hotels', 'Breakfast', 'Camel Safari', 'Guide'], priceTiers: { standard: 32000, deluxe: 45000, premium: 65000 },
      category: 'heritage', isFeatured: true, isActive: true, tags: ['forts', 'culture', 'rajasthan'],
    },
    {
      name: 'Goa Beach Getaway', description: 'Sun, sand and surf! Enjoy the beaches of Goa with water sports, shacks, and nightlife.',
      destinations: [{ city: 'Goa', country: 'India', nights: 5 }],
      duration: 5, inclusions: ['Flights', 'Beach Resort', 'Breakfast', 'Airport Transfers'], priceTiers: { standard: 18000, deluxe: 28000, premium: 42000 },
      category: 'beach', isFeatured: true, isActive: true, tags: ['beach', 'nightlife', 'goa'],
    },
    {
      name: 'Manali Himalayan Adventure', description: 'Thrilling adventure in the Himalayas — trekking, river rafting, and snow activities.',
      destinations: [{ city: 'Manali', country: 'India', nights: 5 }],
      duration: 5, inclusions: ['Volvo Bus', 'Hotel', 'Meals', 'Adventure Activities', 'Guide'], priceTiers: { standard: 14000, deluxe: 20000, premium: 30000 },
      category: 'adventure', isFeatured: false, isActive: true, tags: ['adventure', 'trekking', 'himalayas'],
    },
  ]);

  console.log('✅ Database seeded successfully!');
  console.log('Admin: admin@travelms.com / Admin@1234');
  console.log('User:  user@travelms.com  / User@1234');
  mongoose.disconnect();
};

seed().catch(err => { console.error(err); process.exit(1); });
