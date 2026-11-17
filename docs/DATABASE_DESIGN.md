# CampusPulse Database Architecture & Schema Design

## 1. Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    users ||--o{ events : "organizes"
    users ||--o{ registrations : "registers"
    users ||--o{ attendance : "marked_attendance"
    users ||--o{ feedback : "submits"
    users ||--o{ notifications : "receives"
    
    categories ||--o{ events : "categorizes"
    venues ||--o{ events : "hosts"
    
    events ||--o{ registrations : "has_registrations"
    events ||--o{ attendance : "tracks"
    events ||--o{ feedback : "receives_reviews"
    
    registrations ||--|| attendance : "generates_record"

    users {
        int id PK
        string name
        string email UK
        string password
        string role "admin | organizer | student"
        string department
        string roll_number
        string phone
        string avatar_url
        boolean is_active
        timestamp created_at
    }

    categories {
        int id PK
        string name UK
        string slug UK
        string description
        string color
        string icon
    }

    venues {
        int id PK
        string name UK
        string building
        int capacity
        string facilities
        string image_url
        boolean is_active
    }

    events {
        int id PK
        string title
        string short_description
        text description
        int category_id FK
        int venue_id FK
        int organizer_id FK
        datetime start_time
        datetime end_time
        datetime registration_deadline
        int max_capacity
        int current_registrations
        string status "draft | pending_approval | published | completed | cancelled"
        boolean is_featured
        string banner_image
        text prerequisites
        json schedule_agenda
        string contact_email
        string contact_phone
    }

    registrations {
        int id PK
        int event_id FK
        int user_id FK
        string ticket_code UK
        string status "registered | cancelled"
        timestamp registered_at
        timestamp cancelled_at
    }

    attendance {
        int id PK
        int registration_id FK,UK
        int event_id FK
        int user_id FK
        string status "present | absent"
        int marked_by FK
        timestamp marked_at
        string notes
    }

    feedback {
        int id PK
        int event_id FK
        int user_id FK
        int rating "1 to 5"
        text review
        timestamp created_at
    }

    notifications {
        int id PK
        int user_id FK
        string title
        text message
        string type "info | success | warning | reminder"
        boolean is_read
        timestamp created_at
    }
```

---

## 2. Table Specifications & Indexes

### 2.1 `users` Table
- **Primary Key:** `id` (AUTO_INCREMENT)
- **Unique Keys:** `email`
- **Indexes:** `idx_user_role` (`role`), `idx_user_email` (`email`)
- **Roles:**
  - `admin`: Full platform governance, user activation, venue management, and event approvals.
  - `organizer`: Event authoring, attendee management, and live attendance tracking.
  - `student`: Event browsing, registration, ticket passes, and feedback review submission.

### 2.2 `events` Table
- **Primary Key:** `id` (AUTO_INCREMENT)
- **Foreign Keys:**
  - `category_id` -> `categories(id)` ON DELETE RESTRICT
  - `venue_id` -> `venues(id)` ON DELETE RESTRICT
  - `organizer_id` -> `users(id)` ON DELETE CASCADE
- **Indexes:** `idx_event_status` (`status`), `idx_event_dates` (`start_time`, `end_time`), `idx_event_featured` (`is_featured`)
- **Capacity Integrity:** `max_capacity` is constrained to not exceed `venues.capacity`.

### 2.3 `registrations` Table
- **Primary Key:** `id` (AUTO_INCREMENT)
- **Foreign Keys:**
  - `event_id` -> `events(id)` ON DELETE CASCADE
  - `user_id` -> `users(id)` ON DELETE CASCADE
- **Unique Constraint:** `uq_event_user` (`event_id`, `user_id`) prevents double bookings.
- **Ticket Code:** Unique, human-readable identifier (e.g. `CP-8A19-4821`) used for QR code generation and entrance verification.

### 2.4 `attendance` Table
- **Primary Key:** `id` (AUTO_INCREMENT)
- **Foreign Keys:**
  - `registration_id` -> `registrations(id)` ON DELETE CASCADE (Unique)
  - `event_id` -> `events(id)` ON DELETE CASCADE
  - `user_id` -> `users(id)` ON DELETE CASCADE
  - `marked_by` -> `users(id)` ON DELETE RESTRICT
- **Statuses:** `present` or `absent` with exact check-in timestamp.

### 2.5 `feedback` Table
- **Primary Key:** `id` (AUTO_INCREMENT)
- **Foreign Keys:**
  - `event_id` -> `events(id)` ON DELETE CASCADE
  - `user_id` -> `users(id)` ON DELETE CASCADE
- **Unique Constraint:** `uq_feedback_event_user` (`event_id`, `user_id`) ensures one review per student per event.
- **Rating Check:** `CHECK (rating >= 1 AND rating <= 5)`.

---

## 3. Dual-Engine Storage Architecture

CampusPulse features a dual-engine database layer (`server/src/database/db.js`):
1. **Production MySQL 8.0+ / MariaDB 10.4+:**
   - Full ACID transactional compliance.
   - InnoDB engine with utf8mb4 collation.
   - Connection pooling via `mysql2/promise`.
2. **Built-in Node.js v22+ SQLite Engine:**
   - Automatically activates when MySQL service is offline or unreachable on `localhost:3306`.
   - Requires zero installation or external binaries.
   - Executes identical relational schemas, foreign key cascades, and queries.
