const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Import routes
const authRoutes = require('./src/routes/auth.routes');
const requisitionRoutes = require('./src/routes/requisition.routes');
const userRoutes = require('./src/routes/users.routes');

// Import middleware
const errorHandler = require('./src/middlewares/error.middleware');
const notFound = require('./src/middlewares/notFound.middleware');

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: [
    // Local development URLs
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3002',
    // Production URLs - add your Vercel URL here
    process.env.FRONTEND_URL,
    'https://newtailor.vercel.app', // Replace with your actual Vercel URL
    // Allow any vercel.app subdomain (more flexible)
    /.*\.vercel\.app$/,
  ].filter(Boolean), // Remove undefined values
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Tailor API is running',
    timestamp: new Date().toISOString()
  });
});

// Add the test endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'Connection successful', timestamp: new Date().toISOString() });
});

// Base API route
app.get('/api', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Tailor Backend API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      requisitions: '/api/requisitions',
      health: '/health',
      'api-health': '/api/health',
      test: '/api/test'
    },
    timestamp: new Date().toISOString()
  });
});

// Handle favicon requests
app.get('/favicon.ico', (req, res) => {
  res.status(204).end(); // No content
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/requisitions', requisitionRoutes);
app.use('/api/users', userRoutes);


// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

module.exports = app;