const logger = require('../utils/logger');
const { sendError } = require('../utils/helpers');

function notFoundHandler(req, res, next) {
  sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
}

function globalErrorHandler(err, req, res, next) {
  logger.error(`Unhandled Error [${req.method} ${req.path}]:`, err.message);
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    console.error(err.stack);
  }

  const statusCode = err.statusCode || (err.name === 'ValidationError' ? 400 : 500);
  const message = err.message || 'Internal Server Error';

  sendError(res, message, statusCode, process.env.NODE_ENV === 'development' ? err.stack : null);
}

module.exports = {
  notFoundHandler,
  globalErrorHandler
};
