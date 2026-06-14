const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');

// Use a separate test DB
const TEST_DB = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/tms_test';

beforeAll(async () => {
  await mongoose.connect(TEST_DB);
  await User.deleteMany({});
});

afterAll(async () => {
  await User.deleteMany({});
  await mongoose.disconnect();
});

describe('Auth Routes', () => {
  const testUser = { name: 'Test User', email: 'test@example.com', password: 'Test@1234', phone: '+919876543210' };
  let accessToken;

  describe('POST /api/auth/register', () => {
    test('should register a new user and return tokens', async () => {
      const res = await request(app).post('/api/auth/register').send(testUser);
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.user.email).toBe(testUser.email);
      expect(res.body.user.passwordHash).toBeUndefined();
    });

    test('should reject duplicate email registration', async () => {
      const res = await request(app).post('/api/auth/register').send(testUser);
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('should reject missing required fields', async () => {
      const res = await request(app).post('/api/auth/register').send({ email: 'no@pass.com' });
      expect(res.statusCode).toBe(500);
    });
  });

  describe('POST /api/auth/login', () => {
    test('should login with correct credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: testUser.email, password: testUser.password
      });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.accessToken).toBeDefined();
      accessToken = res.body.accessToken;
    });

    test('should reject wrong password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: testUser.email, password: 'WrongPassword123'
      });
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test('should reject non-existent email', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'nobody@nowhere.com', password: 'any'
      });
      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/users/me', () => {
    test('should return current user with valid token', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.user.email).toBe(testUser.email);
    });

    test('should reject request without token', async () => {
      const res = await request(app).get('/api/users/me');
      expect(res.statusCode).toBe(401);
    });

    test('should reject request with invalid token', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer invalidtoken123');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    test('should logout successfully with valid token', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});

describe('Search Routes', () => {
  test('GET /api/search/transport - returns results or empty array', async () => {
    const res = await request(app)
      .get('/api/search/transport')
      .query({ origin: 'DEL', destination: 'MUM', date: '2025-12-01', passengers: 1 });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.results)).toBe(true);
  });

  test('GET /api/search/transport - rejects missing params', async () => {
    const res = await request(app).get('/api/search/transport').query({ origin: 'DEL' });
    expect(res.statusCode).toBe(400);
  });

  test('GET /api/search/hotels - returns results', async () => {
    const res = await request(app)
      .get('/api/search/hotels')
      .query({ city: 'Mumbai', checkIn: '2025-12-01', checkOut: '2025-12-03' });
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.results)).toBe(true);
  });

  test('GET /api/search/packages - returns packages', async () => {
    const res = await request(app).get('/api/search/packages');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.results)).toBe(true);
  });
});
