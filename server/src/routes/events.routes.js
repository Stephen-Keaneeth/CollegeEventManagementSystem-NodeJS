const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { requireAuth, requireRole, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { sendSuccess, sendError, toSqlDateTime } = require('../utils/helpers');

/**
 * @route   GET /api/events
 * @desc    Get paginated/filtered list of events
 * @access  Public (optionalAuth to determine if user is registered)
 */
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const {
      search,
      category,
      venue,
      status,
      timeframe,
      featured,
      organizer_id,
      limit = 50,
      offset = 0
    } = req.query;

    let conditions = [];
    let params = [];

    // Role-based visibility:
    // Unauthenticated or students can only view 'published' or 'completed' events by default
    const isStaff = req.user && (req.user.role === 'admin' || req.user.role === 'organizer');

    if (status) {
      conditions.push('e.status = ?');
      params.push(status);
    } else if (!isStaff) {
      conditions.push("e.status IN ('published', 'completed')");
    }

    if (organizer_id) {
      conditions.push('e.organizer_id = ?');
      params.push(organizer_id);
    }

    if (category) {
      if (!isNaN(category)) {
        conditions.push('e.category_id = ?');
        params.push(parseInt(category, 10));
      } else {
        conditions.push('c.slug = ?');
        params.push(category);
      }
    }

    if (venue) {
      conditions.push('e.venue_id = ?');
      params.push(parseInt(venue, 10));
    }

    if (featured === 'true' || featured === '1') {
      conditions.push('e.is_featured = ?');
      params.push(1);
    }

    if (search && search.trim()) {
      conditions.push('(e.title LIKE ? OR e.description LIKE ? OR e.short_description LIKE ?)');
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    const nowSql = new Date().toISOString().slice(0, 19).replace('T', ' ');
    if (timeframe === 'upcoming') {
      conditions.push('e.start_time >= ?');
      params.push(nowSql);
    } else if (timeframe === 'past') {
      conditions.push('e.end_time < ?');
      params.push(nowSql);
    } else if (timeframe === 'today') {
      const todayStart = new Date().toISOString().slice(0, 10) + ' 00:00:00';
      const todayEnd = new Date().toISOString().slice(0, 10) + ' 23:59:59';
      conditions.push('e.start_time BETWEEN ? AND ?');
      params.push(todayStart, todayEnd);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT
        e.id, e.title, e.short_description, e.description,
        e.category_id, c.name AS category_name, c.color AS category_color, c.slug AS category_slug,
        e.venue_id, v.name AS venue_name, v.building AS venue_building, v.capacity AS venue_capacity,
        e.organizer_id, u.name AS organizer_name, u.email AS organizer_email,
        e.start_time, e.end_time, e.registration_deadline,
        e.max_capacity, e.current_registrations, e.status, e.is_featured,
        e.banner_image, e.prerequisites, e.schedule_agenda,
        e.contact_email, e.contact_phone, e.created_at,
        ROUND(COALESCE(AVG(f.rating), 0), 1) AS avg_rating,
        COUNT(DISTINCT f.id) AS feedback_count
      FROM events e
      JOIN categories c ON e.category_id = c.id
      JOIN venues v ON e.venue_id = v.id
      JOIN users u ON e.organizer_id = u.id
      LEFT JOIN feedback f ON e.id = f.event_id
      ${whereClause}
      GROUP BY e.id
      ORDER BY e.is_featured DESC, e.start_time ASC
      LIMIT ? OFFSET ?
    `;

    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const events = await db.query(sql, params);

    // If user is authenticated, attach whether they are registered
    if (req.user && events.length > 0) {
      const eventIds = events.map(e => e.id);
      const placeholders = eventIds.map(() => '?').join(',');
      const userRegs = await db.query(
        `SELECT event_id, ticket_code, status FROM registrations WHERE user_id = ? AND event_id IN (${placeholders})`,
        [req.user.id, ...eventIds]
      );

      const regMap = {};
      userRegs.forEach(r => {
        regMap[r.event_id] = r;
      });

      events.forEach(e => {
        const reg = regMap[e.id];
        e.is_registered = reg && reg.status === 'registered';
        e.my_registration = reg || null;
      });
    }

    return sendSuccess(res, { events, count: events.length });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/events/:id
 * @desc    Get detailed event information
 * @access  Public (optionalAuth)
 */
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const eventId = parseInt(req.params.id, 10);
    if (isNaN(eventId)) {
      return sendError(res, 'Invalid event ID.', 400);
    }

    const events = await db.query(
      `SELECT
        e.*,
        c.name AS category_name, c.color AS category_color, c.slug AS category_slug,
        v.name AS venue_name, v.building AS venue_building, v.capacity AS venue_capacity, v.facilities AS venue_facilities,
        u.name AS organizer_name, u.email AS organizer_email, u.department AS organizer_department, u.avatar_url AS organizer_avatar,
        ROUND(COALESCE(AVG(f.rating), 0), 1) AS avg_rating,
        COUNT(DISTINCT f.id) AS feedback_count
       FROM events e
       JOIN categories c ON e.category_id = c.id
       JOIN venues v ON e.venue_id = v.id
       JOIN users u ON e.organizer_id = u.id
       LEFT JOIN feedback f ON e.id = f.event_id
       WHERE e.id = ?
       GROUP BY e.id`,
      [eventId]
    );

    if (events.length === 0) {
      return sendError(res, 'Event not found.', 404);
    }

    const event = events[0];

    // If student or guest, cannot see draft/pending unless organizer or admin
    const isStaff = req.user && (req.user.role === 'admin' || req.user.id === event.organizer_id);
    if (!isStaff && (event.status === 'draft' || event.status === 'pending_approval')) {
      return sendError(res, 'Event is not publicly accessible.', 403);
    }

    // Attach user registration info if logged in
    event.is_registered = false;
    event.user_registration = null;
    event.user_attendance = null;
    event.user_feedback = null;

    if (req.user) {
      const reg = await db.query(
        `SELECT id, ticket_code, status, registered_at, cancelled_at
         FROM registrations WHERE event_id = ? AND user_id = ?`,
        [eventId, req.user.id]
      );

      if (reg.length > 0) {
        event.user_registration = reg[0];
        event.is_registered = reg[0].status === 'registered';

        // Check attendance
        const att = await db.query(
          `SELECT status, marked_at, notes FROM attendance WHERE registration_id = ?`,
          [reg[0].id]
        );
        if (att.length > 0) {
          event.user_attendance = att[0];
        }
      }

      // Check feedback
      const fb = await db.query(
        `SELECT rating, review, created_at FROM feedback WHERE event_id = ? AND user_id = ?`,
        [eventId, req.user.id]
      );
      if (fb.length > 0) {
        event.user_feedback = fb[0];
      }
    }

    // Recent feedback reviews for this event
    const reviews = await db.query(
      `SELECT f.id, f.rating, f.review, f.created_at, u.name AS user_name, u.avatar_url, u.department
       FROM feedback f
       JOIN users u ON f.user_id = u.id
       WHERE f.event_id = ?
       ORDER BY f.created_at DESC
       LIMIT 10`,
      [eventId]
    );

    event.reviews = reviews;

    return sendSuccess(res, { event });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   POST /api/events
 * @desc    Create a new event
 * @access  Private (Admin or Organizer)
 */
router.post('/', requireAuth, requireRole('admin', 'organizer'), async (req, res, next) => {
  try {
    const {
      title,
      short_description,
      description,
      category_id,
      venue_id,
      start_time,
      end_time,
      registration_deadline,
      max_capacity,
      status = 'published',
      is_featured = false,
      banner_image,
      prerequisites,
      schedule_agenda,
      contact_email,
      contact_phone
    } = req.body;

    if (!title || !description || !category_id || !venue_id || !start_time || !end_time || !registration_deadline || !max_capacity) {
      return sendError(res, 'Missing required event fields.', 400);
    }

    const start = new Date(start_time);
    const end = new Date(end_time);
    const deadline = new Date(registration_deadline);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || isNaN(deadline.getTime())) {
      return sendError(res, 'Invalid date or time provided.', 400);
    }

    if (end <= start) {
      return sendError(res, 'Event end time must be after the start time.', 400);
    }

    if (deadline >= start) {
      return sendError(res, 'Registration deadline must be before the event start time.', 400);
    }

    // Check venue capacity
    const venues = await db.query('SELECT capacity FROM venues WHERE id = ?', [venue_id]);
    if (venues.length === 0) {
      return sendError(res, 'Selected venue does not exist.', 400);
    }

    const venueCapacity = venues[0].capacity;
    if (parseInt(max_capacity, 10) > venueCapacity) {
      return sendError(
        res,
        `Event capacity (${max_capacity}) exceeds venue maximum capacity (${venueCapacity}).`,
        400
      );
    }

    // Status: Admin can publish immediately; organizers default to published or draft
    const finalStatus = req.user.role === 'admin' ? status : (status || 'published');

    const result = await db.query(
      `INSERT INTO events (
        title, short_description, description, category_id, venue_id, organizer_id,
        start_time, end_time, registration_deadline, max_capacity, status, is_featured,
        banner_image, prerequisites, schedule_agenda, contact_email, contact_phone
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title.trim(),
        short_description || title.slice(0, 150),
        description.trim(),
        parseInt(category_id, 10),
        parseInt(venue_id, 10),
        req.user.id,
        toSqlDateTime(start_time),
        toSqlDateTime(end_time),
        toSqlDateTime(registration_deadline),
        parseInt(max_capacity, 10),
        finalStatus,
        is_featured ? 1 : 0,
        banner_image || null,
        prerequisites || null,
        typeof schedule_agenda === 'object' ? JSON.stringify(schedule_agenda) : (schedule_agenda || null),
        contact_email || req.user.email,
        contact_phone || req.user.phone
      ]
    );

    return sendSuccess(res, { id: result.insertId }, 'Event created successfully!', 201);
  } catch (err) {
    next(err);
  }
});

/**
 * @route   PUT /api/events/:id
 * @desc    Update an existing event
 * @access  Private (Admin or Event Organizer)
 */
router.put('/:id', requireAuth, requireRole('admin', 'organizer'), async (req, res, next) => {
  try {
    const eventId = parseInt(req.params.id, 10);
    const existing = await db.query('SELECT organizer_id, current_registrations FROM events WHERE id = ?', [eventId]);

    if (existing.length === 0) {
      return sendError(res, 'Event not found.', 404);
    }

    // Authorization: only the organizer who created it or an admin can edit
    if (req.user.role !== 'admin' && existing[0].organizer_id !== req.user.id) {
      return sendError(res, 'You do not have permission to update this event.', 403);
    }

    const {
      title,
      short_description,
      description,
      category_id,
      venue_id,
      start_time,
      end_time,
      registration_deadline,
      max_capacity,
      status,
      is_featured,
      banner_image,
      prerequisites,
      schedule_agenda,
      contact_email,
      contact_phone,
      cancellation_reason
    } = req.body;

    if (max_capacity && parseInt(max_capacity, 10) < existing[0].current_registrations) {
      return sendError(
        res,
        `Cannot reduce max capacity below the current registration count (${existing[0].current_registrations}).`,
        400
      );
    }

    await db.query(
      `UPDATE events SET
        title = COALESCE(?, title),
        short_description = COALESCE(?, short_description),
        description = COALESCE(?, description),
        category_id = COALESCE(?, category_id),
        venue_id = COALESCE(?, venue_id),
        start_time = COALESCE(?, start_time),
        end_time = COALESCE(?, end_time),
        registration_deadline = COALESCE(?, registration_deadline),
        max_capacity = COALESCE(?, max_capacity),
        status = COALESCE(?, status),
        is_featured = COALESCE(?, is_featured),
        banner_image = COALESCE(?, banner_image),
        prerequisites = COALESCE(?, prerequisites),
        schedule_agenda = COALESCE(?, schedule_agenda),
        contact_email = COALESCE(?, contact_email),
        contact_phone = COALESCE(?, contact_phone),
        cancellation_reason = COALESCE(?, cancellation_reason)
       WHERE id = ?`,
      [
        title ? title.trim() : null,
        short_description || null,
        description ? description.trim() : null,
        category_id ? parseInt(category_id, 10) : null,
        venue_id ? parseInt(venue_id, 10) : null,
        start_time ? toSqlDateTime(start_time) : null,
        end_time ? toSqlDateTime(end_time) : null,
        registration_deadline ? toSqlDateTime(registration_deadline) : null,
        max_capacity ? parseInt(max_capacity, 10) : null,
        status || null,
        typeof is_featured === 'boolean' ? (is_featured ? 1 : 0) : null,
        banner_image || null,
        prerequisites || null,
        typeof schedule_agenda === 'object' ? JSON.stringify(schedule_agenda) : (schedule_agenda || null),
        contact_email || null,
        contact_phone || null,
        cancellation_reason || null,
        eventId
      ]
    );

    return sendSuccess(res, { id: eventId }, 'Event updated successfully.');
  } catch (err) {
    next(err);
  }
});

/**
 * @route   PATCH /api/events/:id/status
 * @desc    Change event status (publish, cancel, complete)
 * @access  Private (Admin or Event Organizer)
 */
router.patch('/:id/status', requireAuth, requireRole('admin', 'organizer'), async (req, res, next) => {
  try {
    const eventId = parseInt(req.params.id, 10);
    const { status, cancellation_reason } = req.body;

    const validStatuses = ['draft', 'pending_approval', 'published', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return sendError(res, `Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
    }

    const events = await db.query('SELECT organizer_id, title FROM events WHERE id = ?', [eventId]);
    if (events.length === 0) {
      return sendError(res, 'Event not found.', 404);
    }

    if (req.user.role !== 'admin' && events[0].organizer_id !== req.user.id) {
      return sendError(res, 'You do not have permission to modify this event status.', 403);
    }

    await db.query(
      `UPDATE events SET status = ?, cancellation_reason = ? WHERE id = ?`,
      [status, cancellation_reason || null, eventId]
    );

    // If cancelled, notify registered attendees
    if (status === 'cancelled') {
      const attendees = await db.query(
        `SELECT user_id FROM registrations WHERE event_id = ? AND status = 'registered'`,
        [eventId]
      );
      for (const att of attendees) {
        await db.query(
          `INSERT INTO notifications (user_id, title, message, type)
           VALUES (?, ?, ?, 'warning')`,
          [
            att.user_id,
            `Event Cancelled: ${events[0].title}`,
            `Notice: The event "${events[0].title}" has been cancelled. Reason: ${cancellation_reason || 'Administrative decision.'}`
          ]
        );
      }
    }

    return sendSuccess(res, null, `Event status updated to "${status}".`);
  } catch (err) {
    next(err);
  }
});

/**
 * @route   DELETE /api/events/:id
 * @desc    Delete an event
 * @access  Private (Admin or Event Organizer)
 */
router.delete('/:id', requireAuth, requireRole('admin', 'organizer'), async (req, res, next) => {
  try {
    const eventId = parseInt(req.params.id, 10);
    const existing = await db.query('SELECT organizer_id, title FROM events WHERE id = ?', [eventId]);

    if (existing.length === 0) {
      return sendError(res, 'Event not found.', 404);
    }

    if (req.user.role !== 'admin' && existing[0].organizer_id !== req.user.id) {
      return sendError(res, 'Permission denied.', 403);
    }

    await db.query('DELETE FROM events WHERE id = ?', [eventId]);

    return sendSuccess(res, null, `Event "${existing[0].title}" has been deleted.`);
  } catch (err) {
    next(err);
  }
});

/**
 * @route   POST /api/events/upload-banner
 * @desc    Upload an event banner image
 * @access  Private (Admin or Organizer)
 */
router.post('/upload-banner', requireAuth, requireRole('admin', 'organizer'), upload.single('banner'), (req, res) => {
  if (!req.file) {
    return sendError(res, 'No image file uploaded.', 400);
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  return sendSuccess(res, { url: fileUrl }, 'Banner image uploaded successfully.');
});

module.exports = router;
