const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { requireAuth } = require('../middleware/auth');
const { sendSuccess, sendError } = require('../utils/helpers');

/**
 * @route   GET /api/notifications
 * @desc    Get user in-app notifications
 * @access  Private
 */
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const notifications = await db.query(
      `SELECT id, title, message, type, is_read, created_at
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 30`,
      [req.user.id]
    );

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return sendSuccess(res, { notifications, unread_count: unreadCount });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   PATCH /api/notifications/:id/read
 * @desc    Mark single notification as read
 * @access  Private
 */
router.patch('/:id/read', requireAuth, async (req, res, next) => {
  try {
    const notifId = parseInt(req.params.id, 10);
    await db.query('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [notifId, req.user.id]);
    return sendSuccess(res, null, 'Notification marked as read.');
  } catch (err) {
    next(err);
  }
});

/**
 * @route   POST /api/notifications/mark-all-read
 * @desc    Mark all notifications as read for current user
 * @access  Private
 */
router.post('/mark-all-read', requireAuth, async (req, res, next) => {
  try {
    await db.query('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [req.user.id]);
    return sendSuccess(res, null, 'All notifications marked as read.');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
