const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { requireAuth, requireRole } = require('../middleware/auth');
const { sendSuccess, sendError } = require('../utils/helpers');

/**
 * @route   GET /api/users
 * @desc    Get user list with filters (Admin only)
 * @access  Private (Admin)
 */
router.get('/', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const { role, search, status } = req.query;

    let conditions = [];
    let params = [];

    if (role) {
      conditions.push('role = ?');
      params.push(role);
    }

    if (status !== undefined && status !== '') {
      conditions.push('is_active = ?');
      params.push(status === 'active' || status === '1' ? 1 : 0);
    }

    if (search && search.trim()) {
      conditions.push('(name LIKE ? OR email LIKE ? OR roll_number LIKE ? OR department LIKE ?)');
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const users = await db.query(
      `SELECT
        id, name, email, role, department, roll_number, phone, avatar_url, is_active, created_at,
        (SELECT COUNT(*) FROM registrations WHERE user_id = users.id AND status = 'registered') AS total_registrations,
        (SELECT COUNT(*) FROM events WHERE organizer_id = users.id) AS events_organized
       FROM users
       ${whereClause}
       ORDER BY created_at DESC`,
      params
    );

    return sendSuccess(res, { users, count: users.length });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   PATCH /api/users/:id/role
 * @desc    Change user role (Admin only)
 * @access  Private (Admin)
 */
router.patch('/:id/role', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const { role } = req.body;

    if (!['admin', 'organizer', 'student'].includes(role)) {
      return sendError(res, 'Role must be "admin", "organizer", or "student".', 400);
    }

    if (userId === req.user.id && role !== 'admin') {
      return sendError(res, 'Administrators cannot demote their own account.', 400);
    }

    await db.query('UPDATE users SET role = ? WHERE id = ?', [role, userId]);
    return sendSuccess(res, null, `User role changed to "${role}".`);
  } catch (err) {
    next(err);
  }
});

/**
 * @route   PATCH /api/users/:id/status
 * @desc    Toggle account activation status (Admin only)
 * @access  Private (Admin)
 */
router.patch('/:id/status', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const { is_active } = req.body;

    if (typeof is_active !== 'boolean') {
      return sendError(res, 'is_active boolean is required.', 400);
    }

    if (userId === req.user.id && !is_active) {
      return sendError(res, 'Administrators cannot deactivate their own account.', 400);
    }

    await db.query('UPDATE users SET is_active = ? WHERE id = ?', [is_active ? 1 : 0, userId]);
    return sendSuccess(res, null, `User account ${is_active ? 'activated' : 'deactivated'}.`);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
