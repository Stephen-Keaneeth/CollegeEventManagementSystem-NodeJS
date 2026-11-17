const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { requireAuth, requireRole } = require('../middleware/auth');
const { sendSuccess, sendError } = require('../utils/helpers');

/**
 * @route   GET /api/categories
 * @desc    Get all event categories with event count
 * @access  Public
 */
router.get('/', async (req, res, next) => {
  try {
    const categories = await db.query(`
      SELECT
        c.*,
        COUNT(e.id) AS event_count
      FROM categories c
      LEFT JOIN events e ON c.id = e.category_id AND e.status = 'published'
      GROUP BY c.id
      ORDER BY c.name ASC
    `);
    return sendSuccess(res, { categories });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   POST /api/categories
 * @desc    Create a new event category
 * @access  Private (Admin)
 */
router.post('/', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const { name, description, color, icon } = req.body;

    if (!name) {
      return sendError(res, 'Category name is required.', 400);
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const resDb = await db.query(
      `INSERT INTO categories (name, slug, description, color, icon) VALUES (?, ?, ?, ?, ?)`,
      [name.trim(), slug, description || null, color || '#4F46E5', icon || 'Calendar']
    );

    return sendSuccess(res, { id: resDb.insertId, name, slug }, 'Category created.', 201);
  } catch (err) {
    next(err);
  }
});

/**
 * @route   PUT /api/categories/:id
 * @desc    Update an event category
 * @access  Private (Admin)
 */
router.put('/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const catId = parseInt(req.params.id, 10);
    const { name, description, color, icon } = req.body;

    await db.query(
      `UPDATE categories SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        color = COALESCE(?, color),
        icon = COALESCE(?, icon)
       WHERE id = ?`,
      [name ? name.trim() : null, description || null, color || null, icon || null, catId]
    );

    return sendSuccess(res, { id: catId }, 'Category updated.');
  } catch (err) {
    next(err);
  }
});

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete an event category
 * @access  Private (Admin)
 */
router.delete('/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const catId = parseInt(req.params.id, 10);
    const linked = await db.query('SELECT id FROM events WHERE category_id = ?', [catId]);
    if (linked.length > 0) {
      return sendError(res, 'Cannot delete category: existing events are linked to it.', 400);
    }

    await db.query('DELETE FROM categories WHERE id = ?', [catId]);
    return sendSuccess(res, null, 'Category deleted.');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
