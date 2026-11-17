const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/db');
const config = require('../config');
const { requireAuth } = require('../middleware/auth');
const { sendSuccess, sendError } = require('../utils/helpers');

// Helper to generate JWT
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
}

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (Student or Organizer)
 * @access  Public
 */
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role = 'student', department, roll_number, phone } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 'Name, email, and password are required fields.', 400);
    }

    if (password.length < 6) {
      return sendError(res, 'Password must be at least 6 characters.', 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendError(res, 'Please provide a valid email address.', 400);
    }

    // Role safeguard: default public registration only allows student or organizer
    const allowedRoles = ['student', 'organizer'];
    const finalRole = allowedRoles.includes(role) ? role : 'student';

    // Check if email exists
    const existing = await db.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing.length > 0) {
      return sendError(res, 'An account with this email address already exists.', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(
      `INSERT INTO users (name, email, password, role, department, roll_number, phone, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        name.trim(),
        email.toLowerCase().trim(),
        hashedPassword,
        finalRole,
        department || null,
        roll_number || null,
        phone || null
      ]
    );

    const newUser = {
      id: result.insertId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role: finalRole,
      department: department || null,
      roll_number: roll_number || null,
      phone: phone || null,
      avatar_url: null,
      is_active: true
    };

    const token = generateToken(newUser);

    return sendSuccess(res, { token, user: newUser }, 'Registration successful! Welcome to CampusPulse.', 201);
  } catch (err) {
    next(err);
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & return JWT
 * @access  Public
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Email and password are required.', 400);
    }

    const users = await db.query(
      `SELECT id, name, email, password, role, department, roll_number, phone, avatar_url, bio, is_active
       FROM users WHERE email = ?`,
      [email.toLowerCase().trim()]
    );

    if (users.length === 0) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    const user = users[0];

    if (!user.is_active) {
      return sendError(res, 'Your account has been deactivated. Please contact the administrator.', 403);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    // Strip password from response
    delete user.password;

    const token = generateToken(user);

    return sendSuccess(res, { token, user }, 'Signed in successfully.');
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get currently logged in user profile
 * @access  Private
 */
router.get('/me', requireAuth, async (req, res) => {
  return sendSuccess(res, { user: req.user }, 'User profile retrieved.');
});

/**
 * @route   PUT /api/auth/profile
 * @desc    Update profile information
 * @access  Private
 */
router.put('/profile', requireAuth, async (req, res, next) => {
  try {
    const { name, department, roll_number, phone, bio, avatar_url } = req.body;

    await db.query(
      `UPDATE users SET
         name = COALESCE(?, name),
         department = COALESCE(?, department),
         roll_number = COALESCE(?, roll_number),
         phone = COALESCE(?, phone),
         bio = COALESCE(?, bio),
         avatar_url = COALESCE(?, avatar_url)
       WHERE id = ?`,
      [
        name ? name.trim() : null,
        department || null,
        roll_number || null,
        phone || null,
        bio || null,
        avatar_url || null,
        req.user.id
      ]
    );

    const updated = await db.query(
      `SELECT id, name, email, role, department, roll_number, phone, avatar_url, bio, is_active FROM users WHERE id = ?`,
      [req.user.id]
    );

    return sendSuccess(res, { user: updated[0] }, 'Profile updated successfully.');
  } catch (err) {
    next(err);
  }
});

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put('/change-password', requireAuth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return sendError(res, 'Current and new password are required.', 400);
    }

    if (newPassword.length < 6) {
      return sendError(res, 'New password must be at least 6 characters.', 400);
    }

    const rows = await db.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
    if (!isMatch) {
      return sendError(res, 'Incorrect current password.', 400);
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id]);

    return sendSuccess(res, null, 'Password changed successfully.');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
