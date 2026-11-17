const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { requireAuth, requireRole } = require('../middleware/auth');
const { sendSuccess, sendError } = require('../utils/helpers');

/**
 * @route   GET /api/venues
 * @desc    Get all campus venues
 * @access  Public
 */
router.get('/', async (req, res, next) => {
  try {
    const venues = await db.query(`
      SELECT
        v.*,
        COUNT(e.id) AS total_events,
        SUM(CASE WHEN e.status = 'published' THEN 1 ELSE 0 END) AS active_events
      FROM venues v
      LEFT JOIN events e ON v.id = e.venue_id
      GROUP BY v.id
      ORDER BY v.capacity DESC
    `);
    return sendSuccess(res, { venues });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/venues/:id
 * @desc    Get single venue details
 * @access  Public
 */
router.get('/:id', async (req, res, next) => {
  try {
    const venues = await db.query('SELECT * FROM venues WHERE id = ?', [req.params.id]);
    if (venues.length === 0) {
      return sendError(res, 'Venue not found.', 404);
    }
    return sendSuccess(res, { venue: venues[0] });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   POST /api/venues
 * @desc    Create a new campus venue
 * @access  Private (Admin)
 */
router.post('/', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const { name, building, capacity, facilities, image_url } = req.body;

    if (!name || !building || !capacity) {
      return sendError(res, 'Name, building and capacity are required.', 400);
    }

    const resDb = await db.query(
      `INSERT INTO venues (name, building, capacity, facilities, image_url, is_active)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [name.trim(), building.trim(), parseInt(capacity, 10), facilities || null, image_url || null]
    );

    return sendSuccess(res, { id: resDb.insertId }, 'Venue created successfully.', 201);
  } catch (err) {
    next(err);
  }
});

/**
 * @route   PUT /api/venues/:id
 * @desc    Update a campus venue
 * @access  Private (Admin)
 */
router.put('/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const venueId = parseInt(req.params.id, 10);
    const { name, building, capacity, facilities, image_url, is_active } = req.body;

    await db.query(
      `UPDATE venues SET
        name = COALESCE(?, name),
        building = COALESCE(?, building),
        capacity = COALESCE(?, capacity),
        facilities = COALESCE(?, facilities),
        image_url = COALESCE(?, image_url),
        is_active = COALESCE(?, is_active)
       WHERE id = ?`,
      [
        name ? name.trim() : null,
        building ? building.trim() : null,
        capacity ? parseInt(capacity, 10) : null,
        facilities || null,
        image_url || null,
        typeof is_active === 'boolean' ? (is_active ? 1 : 0) : null,
        venueId
      ]
    );

    return sendSuccess(res, { id: venueId }, 'Venue updated successfully.');
  } catch (err) {
    next(err);
  }
});

/**
 * @route   DELETE /api/venues/:id
 * @desc    Delete a campus venue (if not referenced by events)
 * @access  Private (Admin)
 */
router.delete('/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const venueId = parseInt(req.params.id, 10);
    const activeEvents = await db.query('SELECT id FROM events WHERE venue_id = ?', [venueId]);

    if (activeEvents.length > 0) {
      return sendError(res, 'Cannot delete venue: it is assigned to existing events. You can deactivate it instead.', 400);
    }

    await db.query('DELETE FROM venues WHERE id = ?', [venueId]);
    return sendSuccess(res, null, 'Venue deleted.');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
