const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { requireAuth, requireRole } = require('../middleware/auth');
const { sendSuccess } = require('../utils/helpers');

/**
 * @route   GET /api/dashboard/admin
 * @desc    Comprehensive platform-wide metrics & charts for Administrators
 * @access  Private (Admin)
 */
router.get('/admin', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    // 1. Basic Counts
    const eventCounts = await db.query(`
      SELECT
        COUNT(*) AS total_events,
        SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) AS published_events,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed_events,
        SUM(CASE WHEN status = 'pending_approval' THEN 1 ELSE 0 END) AS pending_events,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_events,
        SUM(current_registrations) AS total_registrations
      FROM events
    `);

    const userCounts = await db.query(`
      SELECT
        COUNT(*) AS total_users,
        SUM(CASE WHEN role = 'student' THEN 1 ELSE 0 END) AS total_students,
        SUM(CASE WHEN role = 'organizer' THEN 1 ELSE 0 END) AS total_organizers,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) AS total_admins
      FROM users
    `);

    const attendanceStats = await db.query(`
      SELECT
        COUNT(*) AS total_marked,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) AS present_count,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) AS absent_count
      FROM attendance
    `);

    const feedbackStats = await db.query(`
      SELECT
        COUNT(*) AS total_reviews,
        ROUND(COALESCE(AVG(rating), 0), 2) AS overall_avg_rating
      FROM feedback
    `);

    // 2. Events by Category (for Doughnut chart)
    const categoryDistribution = await db.query(`
      SELECT c.name, c.color, COUNT(e.id) AS event_count, COALESCE(SUM(e.current_registrations), 0) AS registration_count
      FROM categories c
      LEFT JOIN events e ON c.id = e.category_id
      GROUP BY c.id
      ORDER BY event_count DESC
    `);

    // 3. Top Events by Registrations vs Capacity (for Bar chart)
    const topEvents = await db.query(`
      SELECT id, title, current_registrations, max_capacity, status
      FROM events
      ORDER BY current_registrations DESC
      LIMIT 6
    `);

    // 4. Pending Approval Events
    const pendingEvents = await db.query(`
      SELECT e.id, e.title, e.start_time, u.name AS organizer_name, c.name AS category_name
      FROM events e
      JOIN users u ON e.organizer_id = u.id
      JOIN categories c ON e.category_id = c.id
      WHERE e.status = 'pending_approval'
      ORDER BY e.created_at DESC
    `);

    // 5. Recent Activity / Latest Registrations
    const recentRegistrations = await db.query(`
      SELECT r.id, r.ticket_code, r.registered_at, u.name AS student_name, u.email, e.title AS event_title
      FROM registrations r
      JOIN users u ON r.user_id = u.id
      JOIN events e ON r.event_id = e.id
      ORDER BY r.registered_at DESC
      LIMIT 6
    `);

    return sendSuccess(res, {
      stats: {
        total_events: eventCounts[0].total_events || 0,
        published_events: eventCounts[0].published_events || 0,
        completed_events: eventCounts[0].completed_events || 0,
        pending_events: eventCounts[0].pending_events || 0,
        cancelled_events: eventCounts[0].cancelled_events || 0,
        total_registrations: eventCounts[0].total_registrations || 0,
        total_users: userCounts[0].total_users || 0,
        total_students: userCounts[0].total_students || 0,
        total_organizers: userCounts[0].total_organizers || 0,
        present_count: attendanceStats[0].present_count || 0,
        absent_count: attendanceStats[0].absent_count || 0,
        total_reviews: feedbackStats[0].total_reviews || 0,
        overall_avg_rating: feedbackStats[0].overall_avg_rating || 0
      },
      charts: {
        category_distribution: categoryDistribution,
        top_events: topEvents,
        attendance_split: {
          present: attendanceStats[0].present_count || 0,
          absent: attendanceStats[0].absent_count || 0
        }
      },
      pending_events: pendingEvents,
      recent_registrations: recentRegistrations
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/dashboard/organizer
 * @desc    Metrics & performance for Event Organizers
 * @access  Private (Organizer or Admin)
 */
router.get('/organizer', requireAuth, requireRole('organizer', 'admin'), async (req, res, next) => {
  try {
    const organizerId = req.user.id;

    // Organizer's events summary
    const myStats = await db.query(
      `SELECT
        COUNT(*) AS total_events,
        SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) AS published_events,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed_events,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) AS draft_events,
        SUM(current_registrations) AS total_registrations,
        SUM(max_capacity) AS total_capacity
       FROM events
       WHERE organizer_id = ?`,
      [organizerId]
    );

    // Organizer's feedback
    const myFeedback = await db.query(
      `SELECT
        ROUND(COALESCE(AVG(f.rating), 0), 2) AS avg_rating,
        COUNT(f.id) AS total_reviews
       FROM feedback f
       JOIN events e ON f.event_id = e.id
       WHERE e.organizer_id = ?`,
      [organizerId]
    );

    // Events list with registration metrics
    const organizerEvents = await db.query(
      `SELECT
        e.id, e.title, e.start_time, e.end_time, e.status, e.max_capacity, e.current_registrations,
        c.name AS category_name, c.color AS category_color,
        v.name AS venue_name,
        ROUND(COALESCE(AVG(f.rating), 0), 1) AS avg_rating
       FROM events e
       JOIN categories c ON e.category_id = c.id
       JOIN venues v ON e.venue_id = v.id
       LEFT JOIN feedback f ON e.id = f.event_id
       WHERE e.organizer_id = ?
       GROUP BY e.id
       ORDER BY e.start_time ASC`,
      [organizerId]
    );

    // Attendance breakdown for organizer's events
    const attStats = await db.query(
      `SELECT
        SUM(CASE WHEN att.status = 'present' THEN 1 ELSE 0 END) AS present_count,
        SUM(CASE WHEN att.status = 'absent' THEN 1 ELSE 0 END) AS absent_count
       FROM attendance att
       JOIN events e ON att.event_id = e.id
       WHERE e.organizer_id = ?`,
      [organizerId]
    );

    return sendSuccess(res, {
      stats: {
        total_events: myStats[0].total_events || 0,
        published_events: myStats[0].published_events || 0,
        completed_events: myStats[0].completed_events || 0,
        draft_events: myStats[0].draft_events || 0,
        total_registrations: myStats[0].total_registrations || 0,
        total_capacity: myStats[0].total_capacity || 0,
        avg_rating: myFeedback[0].avg_rating || 0,
        total_reviews: myFeedback[0].total_reviews || 0,
        present_count: attStats[0].present_count || 0,
        absent_count: attStats[0].absent_count || 0
      },
      events: organizerEvents
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/dashboard/student
 * @desc    Personalized event schedule, attendance, and feedback for Students
 * @access  Private (Student)
 */
router.get('/student', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const nowSql = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // 1. My Registrations Count
    const counts = await db.query(
      `SELECT
        COUNT(*) AS total_registered,
        SUM(CASE WHEN e.start_time > ? AND r.status = 'registered' THEN 1 ELSE 0 END) AS upcoming_count,
        SUM(CASE WHEN e.status = 'completed' AND r.status = 'registered' THEN 1 ELSE 0 END) AS completed_count
       FROM registrations r
       JOIN events e ON r.event_id = e.id
       WHERE r.user_id = ?`,
      [nowSql, studentId]
    );

    // 2. Attendance count
    const attCount = await db.query(
      `SELECT COUNT(*) AS attended_count FROM attendance WHERE user_id = ? AND status = 'present'`,
      [studentId]
    );

    // 3. Upcoming Registered Events (Schedule)
    const upcomingSchedule = await db.query(
      `SELECT
        e.id AS event_id, e.title, e.start_time, e.end_time, e.banner_image,
        r.ticket_code, r.registered_at,
        c.name AS category_name, c.color AS category_color,
        v.name AS venue_name, v.building AS venue_building
       FROM registrations r
       JOIN events e ON r.event_id = e.id
       JOIN categories c ON e.category_id = c.id
       JOIN venues v ON e.venue_id = v.id
       WHERE r.user_id = ? AND r.status = 'registered' AND e.start_time > ?
       ORDER BY e.start_time ASC
       LIMIT 5`,
      [studentId, nowSql]
    );

    // 4. Pending Feedback (Completed events user registered for and attended, but hasn't reviewed yet)
    const pendingFeedback = await db.query(
      `SELECT
        e.id AS event_id, e.title, e.start_time, e.end_time,
        c.name AS category_name, c.color AS category_color
       FROM registrations r
       JOIN events e ON r.event_id = e.id
       JOIN categories c ON e.category_id = c.id
       LEFT JOIN feedback f ON (f.event_id = e.id AND f.user_id = r.user_id)
       WHERE r.user_id = ? AND r.status = 'registered' AND e.status = 'completed' AND f.id IS NULL
       ORDER BY e.end_time DESC`,
      [studentId]
    );

    // 5. Attended Past Events (Portfolio / Participation History)
    const pastParticipation = await db.query(
      `SELECT
        e.id AS event_id, e.title, e.start_time, e.end_time,
        c.name AS category_name,
        r.ticket_code,
        att.status AS attendance_status,
        att.marked_at,
        f.rating, f.review
       FROM registrations r
       JOIN events e ON r.event_id = e.id
       JOIN categories c ON e.category_id = c.id
       JOIN attendance att ON r.id = att.registration_id
       LEFT JOIN feedback f ON (f.event_id = e.id AND f.user_id = r.user_id)
       WHERE r.user_id = ? AND att.status = 'present'
       ORDER BY e.end_time DESC`,
      [studentId]
    );

    return sendSuccess(res, {
      stats: {
        total_registered: counts[0].total_registered || 0,
        upcoming_count: counts[0].upcoming_count || 0,
        completed_count: counts[0].completed_count || 0,
        attended_count: attCount[0].attended_count || 0,
        pending_feedback_count: pendingFeedback.length
      },
      upcoming_schedule: upcomingSchedule,
      pending_feedback: pendingFeedback,
      past_participation: pastParticipation
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
