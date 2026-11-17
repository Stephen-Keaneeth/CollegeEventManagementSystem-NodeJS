const crypto = require('crypto');

/**
 * Generate a unique, readable ticket code
 * e.g., "CP-A7E9-82F1"
 */
function generateTicketCode(prefix = 'CP') {
  const randomPart = crypto.randomBytes(4).toString('hex').toUpperCase();
  const randomPart2 = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${randomPart.slice(0, 4)}-${randomPart2}`;
}

/**
 * Standard API JSON response wrapper
 */
function sendSuccess(res, data = null, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
}

/**
 * Standard API JSON error response wrapper
 */
function sendError(res, message = 'An error occurred', statusCode = 400, errors = null) {
  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
}

/**
 * Format date for SQL compatibility (YYYY-MM-DD HH:MM:SS)
 */
function toSqlDateTime(dateInput) {
  if (!dateInput) return null;
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

module.exports = {
  generateTicketCode,
  sendSuccess,
  sendError,
  toSqlDateTime
};
