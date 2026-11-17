const db = require('./db');
const seedData = require('./seedData');
const logger = require('../utils/logger');
const { generateTicketCode } = require('../utils/helpers');

async function runSeed() {
  try {
    const engine = await db.initDb();
    logger.info(`Starting database initialization on engine: [${engine.toUpperCase()}]...`);

    // DDL creation statements compatible with both MySQL and SQLite
    if (engine === 'mysql') {
      await db.executeRaw(`
        DROP TABLE IF EXISTS feedback;
        DROP TABLE IF EXISTS attendance;
        DROP TABLE IF EXISTS registrations;
        DROP TABLE IF EXISTS events;
        DROP TABLE IF EXISTS venues;
        DROP TABLE IF EXISTS categories;
        DROP TABLE IF EXISTS notifications;
        DROP TABLE IF EXISTS users;

        CREATE TABLE users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(150) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          role ENUM('admin', 'organizer', 'student') NOT NULL DEFAULT 'student',
          department VARCHAR(100) DEFAULT NULL,
          roll_number VARCHAR(50) DEFAULT NULL,
          phone VARCHAR(20) DEFAULT NULL,
          avatar_url VARCHAR(300) DEFAULT NULL,
          bio TEXT DEFAULT NULL,
          is_active BOOLEAN NOT NULL DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_user_role (role),
          INDEX idx_user_email (email)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

        CREATE TABLE categories (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(80) NOT NULL UNIQUE,
          slug VARCHAR(80) NOT NULL UNIQUE,
          description TEXT,
          color VARCHAR(20) DEFAULT '#4F46E5',
          icon VARCHAR(50) DEFAULT 'Calendar',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

        CREATE TABLE venues (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(120) NOT NULL UNIQUE,
          building VARCHAR(100) NOT NULL,
          capacity INT NOT NULL,
          facilities TEXT,
          image_url VARCHAR(300) DEFAULT NULL,
          is_active BOOLEAN NOT NULL DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

        CREATE TABLE events (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(220) NOT NULL,
          short_description VARCHAR(350),
          description TEXT NOT NULL,
          category_id INT NOT NULL,
          venue_id INT NOT NULL,
          organizer_id INT NOT NULL,
          start_time DATETIME NOT NULL,
          end_time DATETIME NOT NULL,
          registration_deadline DATETIME NOT NULL,
          max_capacity INT NOT NULL,
          current_registrations INT NOT NULL DEFAULT 0,
          status ENUM('draft', 'pending_approval', 'published', 'completed', 'cancelled') NOT NULL DEFAULT 'published',
          cancellation_reason TEXT DEFAULT NULL,
          is_featured BOOLEAN NOT NULL DEFAULT FALSE,
          banner_image VARCHAR(500) DEFAULT NULL,
          prerequisites TEXT DEFAULT NULL,
          schedule_agenda JSON DEFAULT NULL,
          contact_email VARCHAR(150) DEFAULT NULL,
          contact_phone VARCHAR(50) DEFAULT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
          FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE RESTRICT,
          FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_event_status (status),
          INDEX idx_event_dates (start_time, end_time)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

        CREATE TABLE registrations (
          id INT AUTO_INCREMENT PRIMARY KEY,
          event_id INT NOT NULL,
          user_id INT NOT NULL,
          ticket_code VARCHAR(64) NOT NULL UNIQUE,
          status ENUM('registered', 'cancelled') NOT NULL DEFAULT 'registered',
          registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          cancelled_at TIMESTAMP NULL DEFAULT NULL,
          FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          UNIQUE KEY uq_event_user (event_id, user_id),
          INDEX idx_reg_event (event_id),
          INDEX idx_reg_user (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

        CREATE TABLE attendance (
          id INT AUTO_INCREMENT PRIMARY KEY,
          registration_id INT NOT NULL UNIQUE,
          event_id INT NOT NULL,
          user_id INT NOT NULL,
          status ENUM('present', 'absent') NOT NULL DEFAULT 'present',
          marked_by INT NOT NULL,
          marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          notes VARCHAR(255) DEFAULT NULL,
          FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE,
          FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (marked_by) REFERENCES users(id) ON DELETE RESTRICT,
          INDEX idx_att_event (event_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

        CREATE TABLE feedback (
          id INT AUTO_INCREMENT PRIMARY KEY,
          event_id INT NOT NULL,
          user_id INT NOT NULL,
          rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
          review TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          UNIQUE KEY uq_feedback_event_user (event_id, user_id),
          INDEX idx_fb_event (event_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

        CREATE TABLE notifications (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          title VARCHAR(150) NOT NULL,
          message TEXT NOT NULL,
          type ENUM('info', 'success', 'warning', 'reminder') NOT NULL DEFAULT 'info',
          is_read BOOLEAN NOT NULL DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
    } else {
      // SQLite Schema
      await db.executeRaw(`
        DROP TABLE IF EXISTS feedback;
        DROP TABLE IF EXISTS attendance;
        DROP TABLE IF EXISTS registrations;
        DROP TABLE IF EXISTS events;
        DROP TABLE IF EXISTS venues;
        DROP TABLE IF EXISTS categories;
        DROP TABLE IF EXISTS notifications;
        DROP TABLE IF EXISTS users;

        CREATE TABLE users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'student',
          department TEXT,
          roll_number TEXT,
          phone TEXT,
          avatar_url TEXT,
          bio TEXT,
          is_active INTEGER NOT NULL DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          slug TEXT NOT NULL UNIQUE,
          description TEXT,
          color TEXT DEFAULT '#4F46E5',
          icon TEXT DEFAULT 'Calendar',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE venues (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          building TEXT NOT NULL,
          capacity INTEGER NOT NULL,
          facilities TEXT,
          image_url TEXT,
          is_active INTEGER NOT NULL DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE events (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          short_description TEXT,
          description TEXT NOT NULL,
          category_id INTEGER NOT NULL REFERENCES categories(id),
          venue_id INTEGER NOT NULL REFERENCES venues(id),
          organizer_id INTEGER NOT NULL REFERENCES users(id),
          start_time DATETIME NOT NULL,
          end_time DATETIME NOT NULL,
          registration_deadline DATETIME NOT NULL,
          max_capacity INTEGER NOT NULL,
          current_registrations INTEGER NOT NULL DEFAULT 0,
          status TEXT NOT NULL DEFAULT 'published',
          cancellation_reason TEXT,
          is_featured INTEGER NOT NULL DEFAULT 0,
          banner_image TEXT,
          prerequisites TEXT,
          schedule_agenda TEXT,
          contact_email TEXT,
          contact_phone TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE registrations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          ticket_code TEXT NOT NULL UNIQUE,
          status TEXT NOT NULL DEFAULT 'registered',
          registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          cancelled_at DATETIME,
          UNIQUE(event_id, user_id)
        );

        CREATE TABLE attendance (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          registration_id INTEGER NOT NULL UNIQUE REFERENCES registrations(id) ON DELETE CASCADE,
          event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          status TEXT NOT NULL DEFAULT 'present',
          marked_by INTEGER NOT NULL REFERENCES users(id),
          marked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          notes TEXT
        );

        CREATE TABLE feedback (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          rating INTEGER NOT NULL,
          review TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(event_id, user_id)
        );

        CREATE TABLE notifications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          type TEXT NOT NULL DEFAULT 'info',
          is_read INTEGER NOT NULL DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);
    }

    logger.success('Database tables created successfully.');

    // 1. Insert Users
    const userIds = {};
    for (const u of seedData.users) {
      const res = await db.query(
        `INSERT INTO users (name, email, password, role, department, roll_number, phone, bio, avatar_url, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [u.name, u.email, u.password, u.role, u.department, u.roll_number, u.phone, u.bio, u.avatar_url, 1]
      );
      userIds[u.email] = res.insertId;
    }
    logger.info(`Inserted ${seedData.users.length} users.`);

    // 2. Insert Categories
    const categoryIds = [];
    for (const c of seedData.categories) {
      const res = await db.query(
        `INSERT INTO categories (name, slug, description, color, icon)
         VALUES (?, ?, ?, ?, ?)`,
        [c.name, c.slug, c.description, c.color, c.icon]
      );
      categoryIds.push(res.insertId);
    }
    logger.info(`Inserted ${seedData.categories.length} categories.`);

    // 3. Insert Venues
    const venueIds = [];
    for (const v of seedData.venues) {
      const res = await db.query(
        `INSERT INTO venues (name, building, capacity, facilities, image_url, is_active)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [v.name, v.building, v.capacity, v.facilities, v.image_url, 1]
      );
      venueIds.push(res.insertId);
    }
    logger.info(`Inserted ${seedData.venues.length} venues.`);

    // 4. Insert Events
    const eventIds = [];
    for (const e of seedData.events) {
      const categoryId = categoryIds[e.category_index];
      const venueId = venueIds[e.venue_index];
      const organizerEmail = seedData.users[e.organizer_index].email;
      const organizerId = userIds[organizerEmail];

      const res = await db.query(
        `INSERT INTO events (
          title, short_description, description, category_id, venue_id, organizer_id,
          start_time, end_time, registration_deadline, max_capacity, status, is_featured,
          banner_image, prerequisites, schedule_agenda, contact_email, contact_phone
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          e.title,
          e.short_description,
          e.description,
          categoryId,
          venueId,
          organizerId,
          e.start_time,
          e.end_time,
          e.registration_deadline,
          e.max_capacity,
          e.status,
          e.is_featured,
          e.banner_image,
          e.prerequisites,
          JSON.stringify(e.schedule_agenda),
          e.contact_email,
          e.contact_phone
        ]
      );
      eventIds.push(res.insertId);
    }
    logger.info(`Inserted ${seedData.events.length} events.`);

    // 5. Insert Sample Registrations
    // Students registering for events:
    // Event 1 (HackNova): student, priya, rohit, sneha
    const studentEmails = [
      'student@college.edu',
      'priya.sharma@college.edu',
      'rohit.verma@college.edu',
      'sneha.reddy@college.edu',
      'karan.singh@college.edu'
    ];

    const regMap = {}; // key: `${eventId}_${userId}` -> regId

    // Register 4 students for HackNova (eventIds[0])
    for (let i = 0; i < 4; i++) {
      const uEmail = studentEmails[i];
      const uId = userIds[uEmail];
      const evId = eventIds[0];
      const ticket = generateTicketCode('HN');
      const res = await db.query(
        `INSERT INTO registrations (event_id, user_id, ticket_code, status) VALUES (?, ?, ?, ?)`,
        [evId, uId, ticket, 'registered']
      );
      regMap[`${evId}_${uId}`] = res.insertId;
    }
    await db.query(`UPDATE events SET current_registrations = 4 WHERE id = ?`, [eventIds[0]]);

    // Register 3 students for Cultural Fest (eventIds[1])
    for (let i = 1; i < 4; i++) {
      const uEmail = studentEmails[i];
      const uId = userIds[uEmail];
      const evId = eventIds[1];
      const ticket = generateTicketCode('RR');
      const res = await db.query(
        `INSERT INTO registrations (event_id, user_id, ticket_code, status) VALUES (?, ?, ?, ?)`,
        [evId, uId, ticket, 'registered']
      );
      regMap[`${evId}_${uId}`] = res.insertId;
    }
    await db.query(`UPDATE events SET current_registrations = 3 WHERE id = ?`, [eventIds[1]]);

    // Register all 5 students for the completed bootcamp (eventIds[5])
    for (let i = 0; i < 5; i++) {
      const uEmail = studentEmails[i];
      const uId = userIds[uEmail];
      const evId = eventIds[5];
      const ticket = generateTicketCode('BC');
      const res = await db.query(
        `INSERT INTO registrations (event_id, user_id, ticket_code, status) VALUES (?, ?, ?, ?)`,
        [evId, uId, ticket, 'registered']
      );
      regMap[`${evId}_${uId}`] = res.insertId;
    }
    await db.query(`UPDATE events SET current_registrations = 5 WHERE id = ?`, [eventIds[5]]);

    logger.info('Inserted student event registrations.');

    // 6. Insert Attendance for the Completed Bootcamp (eventIds[5])
    const organizerId = userIds['organizer@college.edu'];
    const completedEvId = eventIds[5];
    const attendanceData = [
      { email: 'student@college.edu', status: 'present', notes: 'Active in capstone build' },
      { email: 'priya.sharma@college.edu', status: 'present', notes: 'Completed deployment bonus' },
      { email: 'rohit.verma@college.edu', status: 'present', notes: 'Punctual, full attendance' },
      { email: 'sneha.reddy@college.edu', status: 'absent', notes: 'Excused medical absence' },
      { email: 'karan.singh@college.edu', status: 'present', notes: 'Presented project demo' }
    ];

    for (const att of attendanceData) {
      const uId = userIds[att.email];
      const regId = regMap[`${completedEvId}_${uId}`];
      await db.query(
        `INSERT INTO attendance (registration_id, event_id, user_id, status, marked_by, notes)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [regId, completedEvId, uId, att.status, organizerId, att.notes]
      );
    }
    logger.info('Inserted attendance records.');

    // 7. Insert Feedback for the Completed Bootcamp (eventIds[5])
    const feedbackData = [
      {
        email: 'student@college.edu',
        rating: 5,
        review: 'Exceptional hands-on workshop! Building and deploying the microservices architecture cleared so many conceptual doubts. The mentors were patient and knowledgeable.'
      },
      {
        email: 'priya.sharma@college.edu',
        rating: 5,
        review: 'The best technical bootcamp of this semester. The real-world deployment pipeline demo was worth every minute. Looking forward to advanced part 2!'
      },
      {
        email: 'rohit.verma@college.edu',
        rating: 4,
        review: 'Very practical session with great lab environment. Could have used 30 more minutes on Docker networking, but overall highly recommended.'
      },
      {
        email: 'karan.singh@college.edu',
        rating: 5,
        review: 'Great pacing, clear explanations, and interactive live coding. Kudos to the organizers!'
      }
    ];

    for (const fb of feedbackData) {
      const uId = userIds[fb.email];
      await db.query(
        `INSERT INTO feedback (event_id, user_id, rating, review) VALUES (?, ?, ?, ?)`,
        [completedEvId, uId, fb.rating, fb.review]
      );
    }
    logger.info('Inserted student feedback & ratings.');

    // 8. Insert Welcome Notifications for Students & Organizers
    const student1Id = userIds['student@college.edu'];
    await db.query(
      `INSERT INTO notifications (user_id, title, message, type, is_read) VALUES
       (?, ?, ?, ?, ?),
       (?, ?, ?, ?, ?)`,
      [
        student1Id,
        'Welcome to CampusPulse!',
        'Explore upcoming college hackathons, technical bootcamps, and cultural festivals right from your dashboard.',
        'info',
        0,
        student1Id,
        'Registration Confirmed: HackNova 2026',
        'Your registration for HackNova 2026 has been approved! View your digital ticket under My Events.',
        'success',
        0
      ]
    );

    logger.success('✅ Database seeding finished successfully!');
    logger.info('================================================================');
    logger.info('Sample Demo Credentials:');
    logger.info('Admin:     admin@college.edu     / Password123!');
    logger.info('Organizer: organizer@college.edu / Password123!');
    logger.info('Student:   student@college.edu   / Password123!');
    logger.info('================================================================');

    return true;
  } catch (err) {
    logger.error('Database seeding failed:', err);
    throw err;
  }
}

// Auto-run if executed directly
if (require.main === module) {
  runSeed()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { runSeed };
