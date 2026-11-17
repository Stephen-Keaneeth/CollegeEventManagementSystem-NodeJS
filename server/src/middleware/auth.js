const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../database/db');
const { sendError } = require('../utils/helpers');

/**
 * Middleware: Verifies JWT token and attaches user record to req.user
 */
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Authentication required. Please sign in.', 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return sendError(res, 'Invalid token format.', 401);
    }

    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret);
    } catch (jwtErr) {
      if (jwtErr.name === 'TokenExpiredError') {
        return sendError(res, 'Session expired. Please log in again.', 401);
      }
      return sendError(res, 'Invalid authentication token.', 401);
    }

    // Fetch user from DB
    const users = await db.query(
      `SELECT id, name, email, role, department, roll_number, phone, avatar_url, bio, is_active, created_at
       FROM users WHERE id = ?`,
      [decoded.id]
    );

    if (!users || users.length === 0) {
      return sendError(res, 'User account no longer exists.', 401);
    }

    const user = users[0];
    if (!user.is_active) {
      return sendError(res, 'Your account has been deactivated. Please contact an administrator.', 403);
    }

    req.user = user;
    next();
  } catch (err) {
    return sendError(res, 'Authentication verification failed.', 500);
  }
}

/**
 * Middleware: Role-based Authorization Guard
 * @param  {...string} allowedRoles ('admin', 'organizer', 'student')
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required.', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        `Access denied. Requires one of the following roles: [${allowedRoles.join(', ')}].`,
        403
      );
    }

    next();
  };
}

/**
 * Optional Authentication: Attaches user if token is present, continues otherwise
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, config.jwt.secret);
      const users = await db.query(
        `SELECT id, name, email, role, department, roll_number, phone, avatar_url, is_active FROM users WHERE id = ?`,
        [decoded.id]
      );
      if (users && users.length > 0 && users[0].is_active) {
        req.user = users[0];
      }
    }
  } catch (_) {
    // Ignore invalid optional tokens
  }
  next();
}

module.exports = {
  requireAuth,
  requireRole,
  optionalAuth
};
