const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const mongodb = require('./database/mongodb');
const redis = require('./cache/redis');
const errorHandler = require('./middleware/errorHandler');
const apiResponse = require('./utils/apiResponse');
const revenueRoutes = require('./modules/revenue/revenue.routes');
const expenseRoutes = require('./modules/expenses/expense.routes');
const salaryRoutes = require('./modules/salaries/salary.routes');
const subscriptionRoutes = require('./modules/subscriptions/subscription.routes');
const domainRoutes = require('./modules/domains/domain.routes');
const vendorRoutes = require('./modules/vendors/vendor.routes');
const budgetRoutes = require('./modules/budgets/budget.routes');
const overviewRoutes = require('./modules/overview/overview.routes');
const reportRoutes = require('./modules/reports/reports.routes');

const app = express();

// Middleware
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  const healthStatus = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.NODE_ENV,
    services: {
      database: mongodb.getConnectionStatus() ? 'connected' : 'disconnected',
      redis: redis.getConnectionStatus() ? 'connected' : 'disconnected'
    }
  };
  return apiResponse.success(res, healthStatus, 'Health check successful');
});

// Base route
app.get('/', (req, res) => {
  return apiResponse.success(res, { name: 'Finance Dashboard API' }, 'Welcome to Finance Dashboard API');
});

// Module routes
app.use('/api/revenue', revenueRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/salaries', salaryRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/domains', domainRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/overview', overviewRoutes);
app.use('/api/reports', reportRoutes);

// Handle 404 routes
app.use((req, res) => {
  return apiResponse.notFound(res, 'Route not found');
});

// Error handling middleware - must be last
app.use(errorHandler);

// Initialize connections and start server
// Listen first so GET /api/health works even when Mongo/Redis are down.
// DB/cache connections run in background with graceful failure.
const startServer = async () => {
  try {
    const server = app.listen(env.PORT, () => {
      console.log(`Server running on port ${env.PORT}`);
      console.log(`Environment: ${env.NODE_ENV}`);
      console.log(`Health check: http://localhost:${env.PORT}/api/health`);
    });

    // Background connections - do not block listen, do not crash on failure
    mongodb.connect().catch((err) => console.error('MongoDB background connect failed:', err.message));
    redis.connect().catch((err) => console.error('Redis background connect failed:', err.message));

    return server;
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

// Only auto-start when run directly (`node src/app.js`).
// Importing the app in tests must not open a port or start reconnect loops.
if (require.main === module) {
  startServer();
}

module.exports = app;
module.exports.startServer = startServer;