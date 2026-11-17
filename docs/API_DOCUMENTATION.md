# CampusPulse REST API Documentation

CampusPulse exposes a comprehensive, role-guarded RESTful API designed with standard HTTP verbs, status codes, and unified JSON envelope responses.

---

## 1. Authentication & Security Overview

- **Token Type:** JSON Web Token (JWT)
- **Header Format:** `Authorization: Bearer <JWT_TOKEN>`
- **Token Expiry:** 7 Days (configurable in `.env`)
- **Roles:** `student`, `organizer`, `admin`
- **Standard Success Response Shape:**
```json
{
  "success": true,
  "message": "Human readable message",
  "data": { ... }
}
```
- **Standard Error Response Shape:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": null
}
```

---

## 2. API Endpoints Reference

### 2.1 Authentication (`/api/auth`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register student or organizer account |
| `POST` | `/api/auth/login` | Public | Sign in with email and password, returns JWT |
| `GET` | `/api/auth/me` | Authenticated | Retrieve authenticated user profile |
| `PUT` | `/api/auth/profile` | Authenticated | Update name, department, roll number, phone, bio |
| `PUT` | `/api/auth/change-password` | Authenticated | Update account password |

#### Request Example: `POST /api/auth/register`
```json
{
  "name": "Aarav Patel",
  "email": "aarav.patel@college.edu",
  "password": "Password123!",
  "role": "student",
  "department": "Computer Science & Engineering",
  "roll_number": "CS21B042",
  "phone": "+91 98765 43210"
}
```

---

### 2.2 Events (`/api/events`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/events` | Public | List events with category, venue, date, search filters |
| `GET` | `/api/events/:id` | Public | Get single event details with schedule, venue, reviews |
| `POST` | `/api/events` | Organizer, Admin | Create and schedule a new event |
| `PUT` | `/api/events/:id` | Creator, Admin | Update event details, agenda, and capacities |
| `PATCH` | `/api/events/:id/status` | Creator, Admin | Change status (`draft`, `published`, `completed`, `cancelled`) |
| `DELETE` | `/api/events/:id` | Creator, Admin | Delete event |
| `POST` | `/api/events/upload-banner` | Organizer, Admin | Upload banner image file (multipart/form-data) |

#### Query Parameters for `GET /api/events`:
- `search`: Keyword string matched against title and description.
- `category`: Category slug (e.g. `hackathons-challenges`) or category ID.
- `venue`: Venue ID filter.
- `timeframe`: `upcoming`, `past`, `today`, or `all`.
- `featured`: `true` or `false`.
- `organizer_id`: Filter events coordinated by specific organizer.

---

### 2.3 Registrations (`/api/registrations`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/registrations/:eventId` | Authenticated | Register current user for an event and receive digital ticket |
| `DELETE` | `/api/registrations/:eventId` | Authenticated | Cancel current user's registration before event starts |
| `GET` | `/api/registrations/my-events` | Authenticated | Get user's registered events with tickets and attendance status |
| `GET` | `/api/registrations/ticket/:ticketCode` | Public | Verify digital pass details by ticket code |
| `GET` | `/api/registrations/event/:eventId` | Organizer, Admin | View attendee roster for an event |

#### Registration Flow Safeguards:
1. Validates that event status is `published`.
2. Validates that current timestamp is before `registration_deadline`.
3. Validates that `current_registrations < max_capacity` (rejects with 400 when full).
4. Prevents duplicate registrations (rejects with 409 Conflict).
5. Generates unique readable ticket code (e.g. `CP-A7E9-82F1`).
6. Atomically updates event registration counters.

---

### 2.4 Attendance Tracking (`/api/attendance`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/attendance/event/:eventId` | Organizer, Admin | Get attendance sheet with present/absent summary |
| `POST` | `/api/attendance/mark` | Organizer, Admin | Mark individual student attendance (`present` / `absent`) |
| `POST` | `/api/attendance/bulk-mark` | Organizer, Admin | Bulk mark multiple attendees as present |
| `GET` | `/api/attendance/export/:eventId` | Organizer, Admin | Export attendee attendance records for CSV report |

#### Request Example: `POST /api/attendance/mark`
```json
{
  "registration_id": 8,
  "status": "present",
  "notes": "Verified at Auditorium entrance"
}
```

---

### 2.5 Feedback & Ratings (`/api/feedback`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/feedback/:eventId` | Registered Student | Submit 1-5 star rating and written review |
| `GET` | `/api/feedback/event/:eventId` | Public | Get all reviews, average rating, star distribution |
| `GET` | `/api/feedback/my-feedback` | Authenticated | List all reviews submitted by the current student |

---

### 2.6 Dashboards & Visualizations (`/api/dashboard`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/dashboard/admin` | Admin | Campus-wide KPI counters, Chart.js datasets, approvals |
| `GET` | `/api/dashboard/organizer` | Organizer, Admin | Organizer's events summary, turnout rates, ratings |
| `GET` | `/api/dashboard/student` | Student, All | Registered schedule, attendance history, pending reviews |

---

### 2.7 Campus Venues (`/api/venues`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/venues` | Public | List campus facilities, capacities, AV equipment |
| `POST` | `/api/venues` | Admin | Create a new campus venue |
| `PUT` | `/api/venues/:id` | Admin | Update venue capacity or facilities |
| `DELETE` | `/api/venues/:id` | Admin | Delete venue (if unreferenced) |

---

### 2.8 Categories (`/api/categories`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/categories` | Public | List all categories with active event count |
| `POST` | `/api/categories` | Admin | Create a new category |
| `PUT` | `/api/categories/:id` | Admin | Update category details and badge color |
| `DELETE` | `/api/categories/:id` | Admin | Delete unreferenced category |

---

### 2.9 User Administration (`/api/users`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/users` | Admin | List all registered accounts with role and search filters |
| `PATCH` | `/api/users/:id/role` | Admin | Promote or demote user (`student`, `organizer`, `admin`) |
| `PATCH` | `/api/users/:id/status` | Admin | Deactivate or activate user account |
