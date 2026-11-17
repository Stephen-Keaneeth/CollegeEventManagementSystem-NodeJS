# CampusPulse - Modern Full-Stack College Event Management System

[![Node.js Version](https://img.shields.io/badge/Node.js-v18%2B%20%7C%20v22%2B%20%7C%20v24-green.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![Database](https://img.shields.io/badge/Database-MySQL%20%2F%20SQLite-orange.svg)](https://www.mysql.com/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Tests Status](https://img.shields.io/badge/Tests-14%2F14%20Passed%20(100%25)-brightgreen.svg)](docs/TESTING_REPORT.md)

**CampusPulse** is a complete, modern, production-grade full-stack College Event Management System built to simplify how universities and colleges organize, schedule, manage, and conduct academic, cultural, technical, and athletic events.

Built with a **React 18 frontend**, **Node.js & Express.js backend**, and **MySQL persistent storage** (with automatic zero-config fallback to SQLite), CampusPulse provides dedicated, tailored experiences for **Administrators**, **Event Organizers**, and **Students**.

---

## 🌟 Key Highlights & Real-World Features

### 🎓 1. Student Experience
- **Interactive Event Catalog:** Search by keywords, filter by category tags (*Technical, Hackathons, Cultural, Workshops, Sports, Seminars*), filter by campus venues, or timeframe (*Upcoming, Today, Completed*).
- **Instant 1-Click Registration:** Reserve seats with real-time capacity progress bars.
- **Digital E-Passes with QR Code:** Automatically generates a unique, scannable digital admission pass (e.g. `CP-A7E9-82F1`) with QR code representation, printable or savable directly on devices.
- **Participation History & Badges:** Track attended events and check-in verifications under *My Event Passes*.
- **Post-Event Ratings & Reviews:** Submit interactive 1 to 5 star ratings and reviews for completed events.
- **Registration Cancellation:** Free up seats before deadlines if unable to attend.

### 📋 2. Event Organizer Experience
- **Event Scheduling Studio:** Multi-step event creation with venue selection, capacity quota validation against venue limits, banner presets, and prerequisites.
- **Dynamic Agenda Builder:** Build structured itineraries with time-slotted milestones (e.g., *Check-in, Keynote, Mentorship, Final Pitch*).
- **Live Attendance Tracker:** Real-time check-in sheet with one-click *Present* / *Absent* toggle buttons and *Mark All Present* bulk action.
- **CSV Export:** Download complete attendance logs with student roll numbers, departments, ticket codes, and check-in timestamps.
- **Performance Analytics:** View turnout percentage, capacity fill rates, and student review averages.

### 🛡️ 3. Administrator Console
- **Platform Analytics & Visualizations (Chart.js):**
  - *Doughnut Chart:* Distribution of events across categories.
  - *Bar Chart:* Student registration demand vs. venue capacity across top events.
  - *Attendance Chart:* Checked-in vs. absent turnouts.
- **Event Proposal Governance:** Review, approve, reject, or feature events proposed across campus.
- **Campus User Management:** Manage student, organizer, and admin accounts; promote/demote user roles; activate or deactivate accounts.
- **Campus Venues & Facilities:** Manage auditoriums, seminar halls, computing labs, and sports arenas with equipment and capacity configurations.

---

## 🔑 Ready-to-Use Sample Demo Credentials

For immediate evaluation and demonstration, the database includes pre-seeded accounts. The login screen also features **1-Click Demo Buttons** to instantly pre-fill credentials:

| Role | Email | Password | Access Scope |
|---|---|---|---|
| **Administrator** | `admin@college.edu` | `Password123!` | Full admin console, approvals, user management, venue manager |
| **Event Organizer** | `organizer@college.edu` | `Password123!` | Organizer hub, event creation, live attendance tracker, exports |
| **Student** | `student@college.edu` | `Password123!` | Event browsing, 1-click registration, QR digital passes, reviews |
| **Student (Alt)** | `priya.sharma@college.edu` | `Password123!` | Additional student account with participation history |

---

## 🏗️ System Architecture & Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                       Client (React 18)                     │
│  Vite • Tailwind CSS • Lucide Icons • Chart.js • QRCode     │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST APIs (JSON / JWT)
┌──────────────────────────────▼──────────────────────────────┐
│                    Server (Express.js / Node.js)            │
│  Router • JWT & BCrypt • RBAC • Multer • Error Handling     │
└──────────────────────────────┬──────────────────────────────┘
                               │ Dual Database Adapter
                 ┌─────────────┴─────────────┐
                 ▼                           ▼
        ┌──────────────────┐        ┌──────────────────┐
        │  MySQL 8.0+ /    │        │  Node.js SQLite  │
        │  MariaDB Pool    │        │  Zero-Config     │
        │  (Production)    │        │  (Self-Hosted)   │
        └──────────────────┘        └──────────────────┘
```

- **Frontend:**
  - React 18 + Vite
  - Tailwind CSS (Modern university SaaS aesthetic, clean typography, responsive mobile drawer)
  - Chart.js & `react-chartjs-2` (Interactive analytics visualizations)
  - `qrcode.react` (Digital admission passes)
  - `canvas-confetti` (Registration celebrations)
  - Lucide React (Clean vector iconography)
- **Backend:**
  - Node.js & Express.js
  - JWT (`jsonwebtoken`) & `bcryptjs` password hashing
  - Role-based authorization middleware (`requireAuth`, `requireRole`)
  - Multer banner image upload support
  - Integrated testing suite (Named Pipe / Domain Socket)
- **Database:**
  - **MySQL 8.0+ / MariaDB** (Primary target: `database/schema.sql` & `database/seed.sql`)
  - **Built-in Node.js v22+ SQLite Engine** (Automatic fallback if local MySQL is inactive, ensuring 100% immediate out-of-the-box runnability)

---

## 🚀 Quick Start & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) v18.0.0 or higher (Node v20, v22, or v24 recommended)
- Optional: MySQL / MariaDB (XAMPP, WAMP, or standalone MySQL service)

---

### Step 1: Clone or Navigate to Directory
```bash
cd CollegeEventManager
```

---

### Step 2: Install Dependencies
Install dependencies for both backend and frontend:
```bash
# Option A: From root
npm run install:all

# Option B: Individually
cd server && npm install
cd ../client && npm install
```

---

### Step 3: Database Setup

#### Option A: Running with MySQL (Recommended for Production / College Submissions)
1. Ensure your MySQL service is started (e.g., via XAMPP Control Panel or MySQL service).
2. Create the database and import schema + seed:
   ```bash
   mysql -u root -p < database/schema.sql
   mysql -u root -p < database/seed.sql
   ```
3. In `server/.env`, verify your MySQL credentials:
   ```env
   DB_ENGINE=mysql
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=college_events
   ```

#### Option B: Running with Zero-Config Built-in SQLite (Default Fallback)
If MySQL is not currently running on your machine, CampusPulse automatically detects this and initializes the built-in SQLite engine with the exact same schema and seed data! You can also explicitly seed it anytime:
```bash
cd server
npm run seed
```

---

### Step 4: Run the Application

#### Development Mode (Concurrent Terminals)

**Terminal 1 (Backend Server):**
```bash
cd server
npm start
# Server listens on http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
# Vite client runs on http://localhost:5173
```

Open your browser at **`http://localhost:5173`**!

#### Production Mode (Single Port Serving)
The client frontend is pre-built into `client/dist`. The Express server automatically serves both the backend REST APIs and the frontend application from a single port!
```bash
cd server
npm start
```
Visit **`http://localhost:5000`** in your browser to access the complete application!

---

## 🧪 Automated Testing

CampusPulse includes a comprehensive automated test suite verifying all 14 core functional workflows:
```bash
cd server
npm test
```

### Verified Test Workflows:
1. API Health Check (`/api/health`)
2. Administrator Authentication & JWT generation
3. Organizer Authentication
4. Student Authentication
5. Public Event Catalog Retrieval
6. Event Search & Filters
7. Student Event Registration & Seat Decrement
8. Duplicate Registration Prevention (409 Conflict)
9. Student "My Events" Portfolio retrieval
10. Organizer Attendance Sheet access
11. Attendance Check-In Marking (Present / Absent)
12. 5-Star Rating & Review submission
13. Administrator Dashboard & Chart.js Metrics
14. Organizer Performance & Turnout Analytics

---

## 📂 Project Structure

```
CollegeEventManager/
├── client/                          # React 18 Frontend
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── api/                     # HTTP client & endpoint service modules
│   │   ├── components/
│   │   │   ├── charts/              # Chart.js components (Category, Attendance, Capacity)
│   │   │   ├── common/              # ProtectedRoute, EventCard, TicketModal, FeedbackModal
│   │   │   └── layout/              # Navbar, Footer, Mobile Drawer
│   │   ├── context/                 # AuthContext (JWT) & ToastContext (Alerts)
│   │   ├── pages/                   # Application views
│   │   │   ├── admin/               # AdminDashboard, UserManagement, VenuesManagement
│   │   │   ├── organizer/           # OrganizerDashboard, CreateEvent, AttendanceTracker
│   │   │   ├── student/             # StudentDashboard, MyRegistrations
│   │   │   ├── Home.jsx             # Public landing page & highlights
│   │   │   ├── Events.jsx           # Filterable event catalog
│   │   │   ├── EventDetails.jsx     # Event view, itinerary, booking, reviews
│   │   │   ├── Login.jsx            # Sign in with 1-click demo buttons
│   │   │   ├── Register.jsx         # Account registration
│   │   │   └── Profile.jsx          # User profile & security settings
│   │   ├── App.jsx                  # React Router configuration
│   │   ├── index.css                # Tailwind CSS & design tokens
│   │   └── main.jsx                 # React root entry
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                          # Node.js & Express Backend
│   ├── src/
│   │   ├── config/                  # Environment & database configuration
│   │   ├── database/                # Dual-engine DB adapter, schema & seeders
│   │   ├── middleware/              # Auth guard (JWT), role guard, uploads, error handler
│   │   ├── routes/                  # Express REST routes (Auth, Events, Regs, Attendance, etc.)
│   │   ├── utils/                   # Helpers, ticket generator, logger
│   │   └── server.js                # Express app listener & static hosting
│   ├── tests/
│   │   └── api.test.js              # Integration test suite (14 test cases)
│   ├── uploads/                     # Event banner uploads directory
│   ├── .env.example
│   └── package.json
│
├── database/                        # Database Assets
│   ├── schema.sql                   # MySQL DDL table creation script
│   └── seed.sql                     # Realistic MySQL sample dataset
│
├── docs/                            # Detailed Technical Documentation
│   ├── API_DOCUMENTATION.md         # Full REST API endpoint specification
│   ├── DATABASE_DESIGN.md           # Mermaid ERD & data dictionary
│   └── TESTING_REPORT.md            # Test cases and execution results
│
├── package.json                     # Root runner scripts
└── README.md                        # Master project documentation
```

---

## 📜 Academic Demonstration Guide

When presenting or grading this project:
1. **Login Page (`/login`):** Use the 1-click demo buttons (*Student*, *Organizer*, *Admin*) for instant access without retyping credentials.
2. **Explore Catalog (`/events`):** Test live search, category pills, timeframe filters, and venue filtering.
3. **Event Booking:** Open an event (e.g. *HackNova 2026*), click **Register**, view the celebratory confetti, and inspect the generated **Digital QR Pass**.
4. **Organizer Hub (`/organizer`):** Open the **Live Attendance Tracker** for any event to test 1-click check-in (*Present* / *Absent*) and click **Export CSV** to download a real spreadsheet.
5. **Admin Console (`/admin`):** Review the interactive Chart.js graphs, approve pending event submissions, and manage user accounts.
6. **Reviews & Feedback:** View ratings submitted by students on completed events.

---

## 📄 License
This project was developed for the College Web Development PBL (Project-Based Learning) curriculum. Open-source under the ISC License.
