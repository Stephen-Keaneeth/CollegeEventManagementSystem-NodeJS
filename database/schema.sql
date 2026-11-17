-- =====================================================================
-- College Event Management System (CampusPulse)
-- Database: MySQL 8.0+ / MariaDB 10.4+ Compatible Schema
-- =====================================================================

CREATE DATABASE IF NOT EXISTS college_events;
USE college_events;

-- Drop tables in reverse dependency order if resetting
DROP TABLE IF EXISTS feedback;
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS registrations;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS venues;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS users;

-- ---------------------------------------------------------------------
-- 1. Users Table
-- Supports roles: 'admin', 'organizer', 'student'
-- ---------------------------------------------------------------------
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

-- ---------------------------------------------------------------------
-- 2. Categories Table
-- e.g. Technical, Cultural, Sports, Workshops, Hackathons, Seminars
-- ---------------------------------------------------------------------
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(80) NOT NULL UNIQUE,
    slug VARCHAR(80) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(20) DEFAULT '#4F46E5',
    icon VARCHAR(50) DEFAULT 'Calendar',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 3. Venues Table
-- Tracks campus facilities, capacity, audio/visual features, and status
-- ---------------------------------------------------------------------
CREATE TABLE venues (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL UNIQUE,
    building VARCHAR(100) NOT NULL,
    capacity INT NOT NULL CHECK (capacity > 0),
    facilities TEXT,
    image_url VARCHAR(300) DEFAULT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 4. Events Table
-- Full event lifecycle: draft, pending_approval, published, completed, cancelled
-- ---------------------------------------------------------------------
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
    max_capacity INT NOT NULL CHECK (max_capacity > 0),
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
    INDEX idx_event_dates (start_time, end_time),
    INDEX idx_event_featured (is_featured)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 5. Registrations Table
-- Connects students to events with unique digital tickets & QR codes
-- ---------------------------------------------------------------------
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
    INDEX idx_reg_user (user_id),
    INDEX idx_reg_ticket (ticket_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 6. Attendance Table
-- Records check-in / present / absent per registration with timestamp
-- ---------------------------------------------------------------------
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
    INDEX idx_att_event (event_id),
    INDEX idx_att_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 7. Feedback & Ratings Table
-- 1-5 Star Ratings and textual reviews post-event
-- ---------------------------------------------------------------------
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

-- ---------------------------------------------------------------------
-- 8. Notifications Table
-- Real-time / In-app alerts for event updates, registration confirmation
-- ---------------------------------------------------------------------
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'success', 'warning', 'reminder') NOT NULL DEFAULT 'info',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notif_user (user_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
