const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { requireAuth } = require('../middleware/auth');
const { sendSuccess, sendError } = require('../utils/helpers');

/**
 * @route   POST /api/feedback/:eventId
 * @desc    Submit or update rating & review for an event
 * @access  Private (Registered/Attended Student)
 */
router.post('/:eventId', requireAuth, async (req, res, next) => {
  try {
    const eventId = parseInt(req.params.eventId, 10);
    const userId = req.user.id;
    const { rating, review } = req.body;

    if (isNaN(eventId)) {
      return sendError(res, 'Invalid event ID.', 400);
    }

    const numericRating = parseInt(rating, 10);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return sendError(res, 'Rating must be an integer between 1 and 5 stars.', 400);
    }

    if (!review || !review.trim()) {
      return sendError(res, 'Review comments cannot be empty.', 400);
    }

    // 1. Verify user was registered for this event
    const reg = await db.query(
      `SELECT r.id, e.title, e.status FROM registrations r
       JOIN events e ON r.event_id = e.id
       WHERE r.event_id = ? AND r.user_id = ?`,
      [eventId, userId]
    );

    if (reg.length === 0) {
      return sendError(res, 'You can only leave feedback for events you registered for.', 403);
    }

    // Check if feedback already exists (allow update or insert)
    const existing = await db.query(
      `SELECT id FROM feedback WHERE event_id = ? AND user_id = ?`,
      [eventId, userId]
    );

    if (existing.length > 0) {
      await db.query(
        `UPDATE feedback SET rating = ?, review = ?, created_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [numericRating, review.trim(), existing[0].id]
      );
    } else {
      await db.query(
        `INSERT INTO feedback (event_id, user_id, rating, review) VALUES (?, ?, ?, ?)`,
        [eventId, userId, numericRating, review.trim()]
      );
    }

    // Recalculate average rating
    const stats = await db.query(
      `SELECT ROUND(AVG(rating), 1) as avg_rating, COUNT(id) as total_reviews
       FROM feedback WHERE event_id = ?`,
      [eventId]
    );

    return sendSuccess(
      res,
      {
        rating: numericRating,
        review: review.trim(),
        event_stats: stats[0]
      },
      'Thank you! Your feedback has been recorded.',
      201
    );
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/feedback/event/:eventId
 * @desc    Get all reviews and rating breakdown for an event
 * @access  Public
 */
router.get('/event/:eventId', async (req, res, next) => {
  try {
    const eventId = parseInt(req.params.eventId, 10);

    const reviews = await db.query(
      `SELECT
        f.id,
        f.rating,
        f.review,
        f.created_at,
        u.id AS user_id,
        u.name AS user_name,
        u.avatar_url,
        u.department
       FROM feedback f
       JOIN users u ON f.user_id = u.id
       WHERE f.event_id = ?
       ORDER BY f.created_at DESC`,
      [eventId]
    );

    // Distribution (1 to 5 stars)
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalScore = 0;

    reviews.forEach(r => {
      if (distribution[r.rating] !== undefined) {
        distribution[r.rating]++;
      }
      totalScore += r.rating;
    });

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 ? (totalScore / totalReviews).toFixed(1) : '0.0';

    return sendSuccess(res, {
      total_reviews: totalReviews,
      average_rating: parseFloat(averageRating),
      distribution,
      reviews
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/feedback/my-feedback
 * @desc    Get all reviews submitted by the current user
 * @access  Private
 */
router.get('/my-feedback', requireAuth, async (req, res, next) => {
  try {
    const reviews = await db.query(
      `SELECT
        f.id,
        f.rating,
        f.review,
        f.created_at,
        e.id AS event_id,
        e.title AS event_title,
        e.banner_image,
        c.name AS category_name
       FROM feedback f
       JOIN events e ON f.event_id = e.id
       JOIN categories c ON e.category_id = c.id
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC`,
      [req.user.id]
    );

    return sendSuccess(res, { reviews, count: reviews.length });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
