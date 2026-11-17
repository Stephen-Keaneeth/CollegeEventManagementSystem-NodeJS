const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { requireAuth, requireRole } = require('../middleware/auth');
const { sendSuccess, sendError } = require('../utils/helpers');

/**
 * @route   GET /api/attendance/event/:eventId
 * @desc    Get attendance sheet & summary for an event
 * @access  Private (Admin or Event Organizer)
 */
router.get('/event/:eventId', requireAuth, requireRole('admin', 'organizer'), async (req, res, next) => {
  try {
    const eventId = parseInt(req.params.eventId, 10);

    const eventRows = await db.query('SELECT id, title, organizer_id, status FROM events WHERE id = ?', [eventId]);
    if (eventRows.length === 0) {
      return sendError(res, 'Event not found.', 404);
    }

    const event = eventRows[0];
    if (req.user.role !== 'admin' && event.organizer_id !== req.user.id) {
      return sendError(res, 'Access denied for this event attendance.', 403);
    }

    const attendees = await db.query(
      `SELECT
        r.id AS registration_id,
        r.ticket_code,
        r.registered_at,
        u.id AS user_id,
        u.name AS student_name,
        u.email AS student_email,
        u.roll_number,
        u.department,
        COALESCE(att.status, 'unmarked') AS attendance_status,
        att.marked_at,
        att.notes,
        marker.name AS marked_by_name
       FROM registrations r
       JOIN users u ON r.user_id = u.id
       LEFT JOIN attendance att ON r.id = att.registration_id
       LEFT JOIN users marker ON att.marked_by = marker.id
       WHERE r.event_id = ? AND r.status = 'registered'
       ORDER BY u.name ASC`,
      [eventId]
    );

    const totalRegistered = attendees.length;
    const presentCount = attendees.filter(a => a.attendance_status === 'present').length;
    const absentCount = attendees.filter(a => a.attendance_status === 'absent').length;
    const unmarkedCount = totalRegistered - (presentCount + absentCount);
    const attendanceRate = totalRegistered > 0 ? Math.round((presentCount / totalRegistered) * 100) : 0;

    return sendSuccess(res, {
      event_id: event.id,
      event_title: event.title,
      summary: {
        total_registered: totalRegistered,
        present_count: presentCount,
        absent_count: absentCount,
        unmarked_count: unmarkedCount,
        attendance_rate: attendanceRate
      },
      attendees
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   POST /api/attendance/mark
 * @desc    Mark individual student attendance (present or absent)
 * @access  Private (Admin or Event Organizer)
 */
router.post('/mark', requireAuth, requireRole('admin', 'organizer'), async (req, res, next) => {
  try {
    const { registration_id, status = 'present', notes } = req.body;

    if (!registration_id) {
      return sendError(res, 'Registration ID is required.', 400);
    }

    if (!['present', 'absent'].includes(status)) {
      return sendError(res, 'Status must be "present" or "absent".', 400);
    }

    // Verify registration and organizer rights
    const regs = await db.query(
      `SELECT r.id, r.event_id, r.user_id, e.organizer_id, e.title
       FROM registrations r
       JOIN events e ON r.event_id = e.id
       WHERE r.id = ?`,
      [registration_id]
    );

    if (regs.length === 0) {
      return sendError(res, 'Registration not found.', 404);
    }

    const reg = regs[0];
    if (req.user.role !== 'admin' && reg.organizer_id !== req.user.id) {
      return sendError(res, 'Permission denied for this event.', 403);
    }

    const existingAtt = await db.query('SELECT id FROM attendance WHERE registration_id = ?', [registration_id]);

    const nowSql = new Date().toISOString().slice(0, 19).replace('T', ' ');

    if (existingAtt.length > 0) {
      // Update
      await db.query(
        `UPDATE attendance SET status = ?, marked_by = ?, marked_at = ?, notes = ? WHERE registration_id = ?`,
        [status, req.user.id, nowSql, notes || null, registration_id]
      );
    } else {
      // Insert
      await db.query(
        `INSERT INTO attendance (registration_id, event_id, user_id, status, marked_by, marked_at, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [registration_id, reg.event_id, reg.user_id, status, req.user.id, nowSql, notes || null]
      );
    }

    return sendSuccess(res, { registration_id, status }, `Marked attendance as "${status}".`);
  } catch (err) {
    next(err);
  }
});

/**
 * @route   POST /api/attendance/bulk-mark
 * @desc    Bulk mark multiple registrations as present or absent
 * @access  Private (Admin or Event Organizer)
 */
router.post('/bulk-mark', requireAuth, requireRole('admin', 'organizer'), async (req, res, next) => {
  try {
    const { event_id, registration_ids, status = 'present' } = req.body;

    if (!event_id || !Array.isArray(registration_ids) || registration_ids.length === 0) {
      return sendError(res, 'event_id and an array of registration_ids are required.', 400);
    }

    const event = await db.query('SELECT id, organizer_id FROM events WHERE id = ?', [event_id]);
    if (event.length === 0) {
      return sendError(res, 'Event not found.', 404);
    }

    if (req.user.role !== 'admin' && event[0].organizer_id !== req.user.id) {
      return sendError(res, 'Permission denied for this event.', 403);
    }

    const nowSql = new Date().toISOString().slice(0, 19).replace('T', ' ');

    for (const regId of registration_ids) {
      const reg = await db.query('SELECT user_id FROM registrations WHERE id = ? AND event_id = ?', [regId, event_id]);
      if (reg.length > 0) {
        const userId = reg[0].user_id;
        const existing = await db.query('SELECT id FROM attendance WHERE registration_id = ?', [regId]);
        if (existing.length > 0) {
          await db.query(
            `UPDATE attendance SET status = ?, marked_by = ?, marked_at = ? WHERE registration_id = ?`,
            [status, req.user.id, nowSql, regId]
          );
        } else {
          await db.query(
            `INSERT INTO attendance (registration_id, event_id, user_id, status, marked_by, marked_at)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [regId, event_id, userId, status, req.user.id, nowSql]
          );
        }
      }
    }

    return sendSuccess(
      res,
      { count: registration_ids.length, status },
      `Successfully marked ${registration_ids.length} attendees as "${status}".`
    );
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/attendance/export/:eventId
 * @desc    Export attendee and attendance list in CSV-ready JSON structure
 * @access  Private (Admin or Event Organizer)
 */
router.get('/export/:eventId', requireAuth, requireRole('admin', 'organizer'), async (req, res, next) => {
  try {
    const eventId = parseInt(req.params.eventId, 10);

    const event = await db.query('SELECT title, organizer_id FROM events WHERE id = ?', [eventId]);
    if (event.length === 0) {
      return sendError(res, 'Event not found.', 404);
    }

    if (req.user.role !== 'admin' && event[0].organizer_id !== req.user.id) {
      return sendError(res, 'Access denied.', 403);
    }

    const rows = await db.query(
      `SELECT
        r.ticket_code,
        u.name AS student_name,
        u.email,
        u.roll_number,
        u.department,
        u.phone,
        r.registered_at,
        COALESCE(att.status, 'Unmarked') AS attendance_status,
        att.marked_at,
        att.notes
       FROM registrations r
       JOIN users u ON r.user_id = u.id
       LEFT JOIN attendance att ON r.id = att.registration_id
       WHERE r.event_id = ? AND r.status = 'registered'
       ORDER BY u.name ASC`,
      [eventId]
    );

    return sendSuccess(res, {
      event_title: event[0].title,
      exported_at: new Date().toISOString(),
      records: rows
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
