# ✈️ Travel Management System (TMS)
### Final Year Project — B.Tech Computer Science & Engineering

> A full-stack web application for seamless travel planning, booking, and administration built with the MERN stack.

---

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Test Credentials](#test-credentials)
- [Team](#team)

---

## 🌟 Overview
The Travel Management System (TMS) is a comprehensive web platform that enables users to search, compare, and book flights, trains, buses, and hotels from a single unified interface. It includes an admin dashboard for analytics and management, dynamic pricing engine, AI-based recommendations, and secure payment processing via Razorpay.

---

## ✅ Features

### User Features
- 🔐 Secure registration, login, and Google OAuth
- ✈️ Search and book flights, trains, and buses
- 🏨 Hotel search with room selection and booking
- 🎒 Browse and book curated travel packages
- 💳 Secure payment via Razorpay (UPI, Cards, Net Banking)
- 📄 E-ticket generation with QR code
- 📋 Booking history, cancellation, and refund tracking
- 👤 Profile management and preferences

### Admin Features
- 📊 Revenue and booking analytics dashboard
- 📦 Package creation and management
- 👥 User management with role assignment
- 📈 Revenue reports (daily/weekly/monthly)
- 🔧 Transport and hotel inventory management

### Technical Features
- 🔄 JWT authentication with refresh token rotation
- ⚡ Dynamic pricing engine (demand + seasonality)
- 🤖 Collaborative filtering recommendation engine
- 📧 Email notifications via SendGrid
- 🔒 OWASP Top-10 security compliance
- 📱 Fully responsive Material UI design

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React.js 18, Redux Toolkit, Material-UI v5, React Query |
| Backend | Node.js, Express.js 4 |
| Database | MongoDB Atlas (Mongoose ODM) |
| Authentication | JWT (access + refresh tokens), bcrypt, Passport.js |
| Payments | Razorpay Payment Gateway |
| Email | Nodemailer + SendGrid SMTP |
| File Storage | Cloudinary |
| PDF Generation | pdfmake + qrcode |
| Testing | Jest, Supertest, Cypress |
| Dev Tools | nodemon, ESLint, Prettier |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (React SPA)                    │
│   Redux Toolkit + React Query + Material UI + Formik    │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS / REST API
┌──────────────────────▼──────────────────────────────────┐
│              API GATEWAY (Express.js)                   │
│   Helmet + CORS + Rate Limiter + JWT Middleware         │
├──────────────────────────────────────────────────────────┤
│              BUSINESS LOGIC LAYER                        │
│   AuthService | BookingService | PaymentService         │
│   PricingEngine | RecommendationEngine | PDFService     │
├──────────────────────────────────────────────────────────┤
│              DATA ACCESS LAYER (Mongoose)                │
│   User | Booking | Transport | Hotel | Package          │
│   Payment | Review models                               │
├──────────────────────────────────────────────────────────┤
│              DATABASE (MongoDB Atlas)                    │
│   Replica Set | Indexes | TTL | Field Encryption        │
└──────────────────────────────────────────────────────────┘
         │                    │               │
   ┌─────▼──────┐    ┌───────▼──────┐  ┌────▼──────┐
   │  Razorpay  │    │   SendGrid   │  │Cloudinary │
   │  Gateway   │    │    SMTP      │  │  Storage  │
   └────────────┘    └──────────────┘  └───────────┘
```

---

## 📁 Project Structure

```
tms-project/
├── backend/
│   ├── config/         # DB configuration
│   ├── controllers/    # Route handlers (auth, booking, payment, search, admin)
│   ├── middleware/     # JWT auth, rate limiting
│   ├── models/         # Mongoose schemas (User, Booking, Transport, Hotel, Package, Payment, Review)
│   ├── routes/         # Express routers
│   ├── services/       # Business logic (pricing, email, PDF, recommendation)
│   ├── tests/          # Jest unit + integration tests
│   ├── utils/          # Seeder script
│   ├── .env.example
│   ├── package.json
│   └── server.js       # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/ # Reusable UI (Navbar, Footer)
│   │   ├── features/   # Redux slices (auth, booking, search, ui)
│   │   ├── pages/      # Route-level pages
│   │   │   ├── admin/  # Admin Dashboard, Bookings, Users, Packages
│   │   │   └── ...     # Home, Search, Hotel, Booking, Payment, Profile
│   │   ├── services/   # Axios API client with interceptors
│   │   ├── theme/      # MUI custom theme
│   │   ├── App.js      # Routes + protected route wrappers
│   │   └── index.js    # React entry point
│   ├── .env.example
│   └── package.json
│
├── docs/               # Additional documentation
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18.x or higher
- npm v9.x or higher
- MongoDB Atlas account (or local MongoDB 6.x)
- Razorpay test account (for payment integration)
- SendGrid account (for emails)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/travel-management-system.git
cd travel-management-system
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create environment file
cp .env.example .env
# Edit .env with your credentials

# Seed the database with sample data
npm run seed

# Start development server
npm run dev
# Server runs on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Create environment file
cp .env.example .env
# Edit .env with your Razorpay key

# Start development server
npm start
# App runs on http://localhost:3000
```

### 4. Run Tests
```bash
# Backend tests
cd backend
npm test

# With coverage report
npm test -- --coverage
```

---

## 🔌 API Documentation

Once the server is running, visit:
**http://localhost:5000/api/docs** — Swagger UI interactive documentation

### Key Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login user |
| POST | `/api/auth/refresh` | Cookie | Refresh access token |
| GET | `/api/search/transport` | Public | Search flights/trains/buses |
| GET | `/api/search/hotels` | Public | Search hotels |
| GET | `/api/search/packages` | Public | Browse packages |
| POST | `/api/bookings` | User | Create booking |
| GET | `/api/bookings` | User | Get my bookings |
| PUT | `/api/bookings/:id/cancel` | User | Cancel booking |
| POST | `/api/payments/initiate` | User | Create Razorpay order |
| POST | `/api/payments/verify` | User | Verify payment |
| GET | `/api/admin/analytics` | Admin | Dashboard analytics |
| GET | `/api/admin/users` | Admin | All users |
| GET | `/api/admin/bookings` | Admin | All bookings |
| GET | `/api/admin/reports/revenue` | Admin | Revenue report |

---

## 🔑 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@travelms.com | Admin@1234 |
| User | user@travelms.com | User@1234 |

> Run `npm run seed` in the backend directory to create these accounts and populate sample data.

---

## 🧪 Testing Results

| Suite | Tests | Passed | Coverage |
|-------|-------|--------|----------|
| AuthService | 12 | 12 | 97% |
| BookingService | 15 | 15 | 96% |
| PricingEngine | 16 | 16 | 98% |
| PaymentService | 10 | 10 | 95% |
| Search Routes | 8 | 8 | 93% |
| **Total** | **61** | **61** | **95%** |

---

## 👥 Team

| Name | Roll No | Contribution |
|------|---------|--------------|
| Rahul Sharma | 21CS001 | Backend API, Database Design, Payment Integration |
| Priya Nair | 21CS002 | Frontend React, UI/UX Design, State Management |
| Arjun Mehta | 21CS003 | Authentication, Security, Testing |
| Sneha Reddy | 21CS004 | Admin Dashboard, Analytics, Seeder |

**Guide:** Dr. Kavitha Subramaniam, Professor & HOD — Computer Science & Engineering

---

## 📄 License

This project is developed for academic purposes as part of the Final Year Project for B.Tech CSE at XYZ Institute of Technology.

---

*Built with ❤️ using the MERN Stack — MongoDB, Express.js, React.js, Node.js*
