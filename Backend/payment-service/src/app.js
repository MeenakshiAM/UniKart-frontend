/**
 * UniKart Payment Service - Main Application
 * Express server with Razorpay and MongoDB integration
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT ;

// Import configurations and routes
const connectDB = require('./config/database');
const paymentRoutes = require('./routes/paymentRoutes');
const errorHandler = require('./middlewares/errorHandler');

// Connect to MongoDB
connectDB();

// Security Middleware
app.use(helmet());

// CORS Configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


// Body Parsing Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Logging in Development
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}
// ============================================
// TEMPORARY TEST TOKEN GENERATOR
// Add this to your payment service app.js
// ============================================

const jwt = require('jsonwebtoken');

// Add this route TEMPORARILY (just for testing)
app.get('/api/generate-test-token', (req, res) => {
  const { JWT_SECRET } = require('./config/environment');
  
  // Create a test user payload
  const testUser = {
    id: '507f1f77bcf86cd799439011', // MongoDB ObjectId format
    email: 'test@college.edu',
    name: 'Test Student'
  };
  
  // Generate JWT token with your actual secret
  const token = jwt.sign(testUser, JWT_SECRET, { 
    expiresIn: '24h' 
  });
  
  res.json({
    success: true,
    message: 'Test token generated successfully',
    token: token,
    instructions: 'Copy this token and run: localStorage.setItem("authToken", "PASTE_TOKEN_HERE")'
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'UniKart Payment Service is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Test route for Razorpay
app.get('/api/payments/test', (req, res) => {
  const mongoose = require('mongoose');
  res.json({
    success: true,
    message: 'Payment API is working',
    razorpayConfigured: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
    mongodbConnected: mongoose.connection.readyState === 1
  });
});

// API Routes - Uses your paymentRoutes.js file
app.use('/api/payments', paymentRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Error Handling Middleware (must be last)
app.use(errorHandler);

// Start Server
const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════╗
║   🚀 UniKart Payment Service                  ║
║   📡 Server running on port ${PORT}              ║
║   🌍 Environment: ${process.env.NODE_ENV || 'development'}           ║
║   💳 Razorpay: ${process.env.RAZORPAY_KEY_ID ? 'Configured ✅' : 'Not Configured ❌'}      ║
╚════════════════════════════════════════════════╝
  `);
  
  if (!process.env.RAZORPAY_KEY_ID) {
    console.warn('⚠️  WARNING: RAZORPAY_KEY_ID not found in .env file');
  }
  if (!process.env.RAZORPAY_KEY_SECRET) {
    console.warn('⚠️  WARNING: RAZORPAY_KEY_SECRET not found in .env file');
  }
  if (!process.env.MONGODB_URI) {
    console.warn('⚠️  WARNING: MONGODB_URI not found in .env file');
  }
});

// Graceful Shutdown
const gracefulShutdown = () => {
  console.log('\n⚠️  Received shutdown signal. Closing server gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('❌ Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  gracefulShutdown();
});

module.exports = app;