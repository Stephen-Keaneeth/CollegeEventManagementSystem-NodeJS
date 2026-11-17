const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { requireAuth, requireRole } = require('../middleware/auth');
const { sendSuccess, sendError, generateTicketCode } = require('../utils/helpers');

/**
 * @route   POST /api/registrations/:eventId
 * @desc    Register current student for an event
 * @access  Private (Student, or any authenticated user)
 */
router.post('/:eventId', requireAuth, async (req, res, next) => {
  try {
    const eventId = parseInt(req.params.eventId, 10);
    const userId = req.user.id;

    if (isNaN(eventId)) {
      return sendError(res, 'Invalid event ID.', 400);
    }

    // 1. Fetch event
    const events = await db.query(
      `SELECT id, title, status, registration_deadline, max_capacity, current_registrations, start_time
       FROM events WHERE id = ?`,
      [eventId]
    );

    if (events.length === 0) {
      return sendError(res, 'Event not found.', 404);
    }

    const event = events[0];

    // 2. Validate event status
    if (event.status !== 'published') {
      return sendError(res, `Cannot register: Event is currently ${event.status}.`, 400);
    }

    // 3. Validate deadline
    const now = new Date();
    const deadline = new Date(event.registration_deadline);
    if (now > deadline) {
      return sendError(res, 'Registration deadline has passed for this event.', 400);
    }

    // 4. Validate capacity
    if (event.current_registrations >= event.max_capacity) {
      return sendError(res, 'Event is already fully booked. Maximum capacity reached.', 400);
    }

    // 5. Check existing registration
    const existing = await db.query(
      `SELECT id, status, ticket_code FROM registrations WHERE event_id = ? AND user_id = ?`,
      [eventId, userId]
    );

    let ticketCode;
    let registrationId;

    if (existing.length > 0) {
      if (existing[0].status === 'registered') {
        return sendError(res, 'You are already registered for this event.', 409);
      } else {
        // Re-activating previously cancelled registration
        ticketCode = existing[0].ticket_code || generateTicketCode('CP');
        await db.query(
          `UPDATE registrations SET status = 'registered', cancelled_at = NULL, ticket_code = ? WHERE id = ?`,
          [ticketCode, existing[0].id]
        );
        registrationId = existing[0].id;
      }
    } else {
      // New registration
      ticketCode = generateTicketCode('CP');
      const insertResult = await db.query(
        `INSERT INTO registrations (event_id, user_id, ticket_code, status) VALUES (?, ?, ?, 'registered')`,
        [eventId, userId, ticketCode]
      );
      registrationId = insertResult.insertId;
    }

    // Increment current_registrations
    await db.query(
      `UPDATE events SET current_registrations = current_registrations + 1 WHERE id = ?`,
      [eventId]
    );

    // Send in-app notification to the user
    await db.query(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES (?, ?, ?, 'success')`,
      [
        userId,
        `Registration Confirmed: ${event.title}`,
        `You have successfully registered for "${event.title}". Your digital ticket code is ${ticketCode}.`
      ]
    );

    return sendSuccess(
      res,
      {
        registration_id: registrationId,
        event_id: eventId,
        ticket_code: ticketCode,
        status: 'registered'
      },
      `Successfully registered for ${event.title}!`,
      201
    );
  } catch (err) {
    next(err);
  }
});

/**
 * @route   DELETE /api/registrations/:eventId
 * @desc    Cancel registration for an event
 * @access  Private (Registered User)
 */
router.delete('/:eventId', requireAuth, async (req, res, next) => {
  try {
    const eventId = parseInt(req.params.eventId, 10);
    const userId = req.user.id;

    const existing = await db.query(
      `SELECT r.id, r.status, e.title, e.start_time
       FROM registrations r
       JOIN events e ON r.event_id = e.id
       WHERE r.event_id = ? AND r.user_id = ?`,
      [eventId, userId]
    );

    if (existing.length === 0 || existing[0].status !== 'registered') {
      return sendError(res, 'No active registration found for this event.', 404);
    }

    const reg = existing[0];
    const now = new Date();
    const eventStart = new Date(reg.start_time);

    if (now >= eventStart) {
      return sendError(res, 'Cannot cancel registration after event has commenced.', 400);
    }

    // Mark registration as cancelled
    const nowSql = now.toISOString().slice(0, 19).replace('T', ' ');
    await db.query(
      `UPDATE registrations SET status = 'cancelled', cancelled_at = ? WHERE id = ?`,
      [nowSql, reg.id]
    );

    // Decrement event current_registrations
    await db.query(
      `UPDATE events SET current_registrations = MAX(0, current_registrations - 1) WHERE id = ?`,
      [eventId]
    );

    // Remove any attendance record if previously created
    await db.query('DELETE FROM attendance WHERE registration_id = ?', [reg.id]);

    return sendSuccess(res, null, `Your registration for "${reg.title}" has been cancelled.`);
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/registrations/my-events
 * @desc    Get all events registered by the current logged-in student
 * @access  Private
 */
router.get('/my-events', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;

    const sql = `
      SELECT
        r.id AS registration_id,
        r.ticket_code,
        r.status AS registration_status,
        r.registered_at,
        r.cancelled_at,
        e.id AS event_id,
        e.title,
        e.short_description,
        e.start_time,
        e.end_time,
        e.status AS event_status,
        e.banner_image,
        c.name AS category_name,
        c.color AS category_color,
        v.name AS venue_name,
        v.building AS venue_building,
        u.name AS organizer_name,
        att.status AS attendance_status,
        att.marked_at AS attendance_marked_at,
        f.rating AS my_rating,
        f.review AS my_review
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      JOIN categories c ON e.category_id = c.id
      JOIN venues v ON e.venue_id = v.id
      JOIN users u ON e.organizer_id = u.id
      LEFT JOIN attendance att ON r.id = att.registration_id
      LEFT JOIN feedback f ON (e.id = f.event_id AND f.user_id = r.user_id)
      WHERE r.user_id = ?
      ORDER BY r.registered_at DESC
    `;

    const myEvents = await db.query(sql, [userId]);
    return sendSuccess(res, { registrations: myEvents, count: myEvents.length });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/registrations/ticket/:ticketCode
 * @desc    Lookup ticket details by code (for verification or badge display)
 * @access  Public
 */
router.get('/ticket/:ticketCode', async (req, res, next) => {
  try {
    const { ticketCode } = req.params;

    const sql = `
      SELECT
        r.id AS registration_id,
        r.ticket_code,
        r.status AS registration_status,
        r.registered_at,
        e.id AS event_id,
        e.title AS event_title,
        e.start_time,
        e.end_time,
        e.status AS event_status,
        c.name AS category_name,
        v.name AS venue_name,
        v.building AS venue_building,
        u.id AS user_id,
        u.name AS student_name,
        u.email AS student_email,
        u.roll_number,
        u.department,
        att.status AS attendance_status,
        att.marked_at AS attendance_marked_at
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      JOIN categories c ON e.category_id = c.id
      JOIN venues v ON e.venue_id = v.id
      JOIN users u ON r.user_id = u.id
      LEFT JOIN attendance att ON r.id = att.registration_id
      WHERE r.ticket_code = ?
    `;

    const tickets = await db.query(sql, [ticketCode.trim()]);
    if (tickets.length === 0) {
      return sendError(res, 'Ticket not found.', 404);
    }

    return sendSuccess(res, { ticket: tickets[0] });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/registrations/event/:eventId
 * @desc    Get all registrations for a specific event
 * @access  Private (Admin or Event Organizer)
 */
router.get('/event/:eventId', requireAuth, requireRole('admin', 'organizer'), async (req, res, next) => {
  try {
    const eventId = parseInt(req.params.eventId, 10);

    const event = await db.query('SELECT organizer_id, title FROM events WHERE id = ?', [eventId]);
    if (event.length === 0) {
      return sendError(res, 'Event not found.', 404);
    }

    if (req.user.role !== 'admin' && event[0].organizer_id !== req.user.id) {
      return sendError(res, 'Permission denied for this event.', 403);
    }

    const attendees = await db.query(
      `SELECT
        r.id AS registration_id,
        r.ticket_code,
        r.status AS registration_status,
        r.registered_at,
        u.id AS user_id,
        u.name,
        u.email,
        u.roll_number,
        u.department,
        u.phone,
        att.id AS attendance_id,
        att.status AS attendance_status,
        att.marked_at,
        att.notes
       FROM registrations r
       JOIN users u ON r.user_id = u.id
       LEFT JOIN attendance att ON r.id = att.registration_id
       WHERE r.event_id = ? AND r.status = 'registered'
       ORDER BY u.name ASC`,
      [eventId]
    );

    return sendSuccess(res, { attendees, count: attendees.length, event_title: event[0].title });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
