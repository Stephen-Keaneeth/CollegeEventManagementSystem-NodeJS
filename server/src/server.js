const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config');
const logger = require('./utils/logger');
const db = require('./database/db');
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth.routes');
const eventRoutes = require('./routes/events.routes');
const registrationRoutes = require('./routes/registrations.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const feedbackRoutes = require('./routes/feedback.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const venueRoutes = require('./routes/venues.routes');
const categoryRoutes = require('./routes/categories.routes');
const userRoutes = require('./routes/users.routes');
const notificationRoutes = require('./routes/notifications.routes');

const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow client connections
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    engine: db.getEngine(),
    environment: config.env
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);

// Serve static client build if present
const fs = require('fs');
const clientDistPath = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Error Handlers
app.use(notFoundHandler);
app.use(globalErrorHandler);

// Start Server
async function startServer(customPort = null) {
  try {
    // Initialize Database
    const engine = await db.initDb();
    logger.success(`Database ready using engine: [${engine.toUpperCase()}]`);

    const listenPort = customPort || config.port;

    return new Promise((resolve, reject) => {
      const server = app.listen(listenPort, () => {
        const actualPort = server.address().port;
        logger.success(`=======================================================`);
        logger.success(`CampusPulse API Server running on port ${actualPort}`);
        logger.info(`Health check: http://localhost:${actualPort}/api/health`);
        logger.info(`API Base URL: http://localhost:${actualPort}/api`);
        logger.success(`=======================================================`);
        resolve(server);
      });

      server.on('error', (err) => {
        logger.error('Server listen error:', err);
        reject(err);
      });
    });
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
}

// Auto-start when run directly
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
