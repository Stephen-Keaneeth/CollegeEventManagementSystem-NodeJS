import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

// Student Portal Pages
import StudentDashboard from './pages/student/StudentDashboard';
import MyRegistrations from './pages/student/MyRegistrations';

// Organizer Portal Pages
import OrganizerDashboard from './pages/organizer/OrganizerDashboard';
import CreateEvent from './pages/organizer/CreateEvent';
import AttendanceTracker from './pages/organizer/AttendanceTracker';

// Admin Portal Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import VenuesManagement from './pages/admin/VenuesManagement';

export default function App() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800">
      <Navbar />

      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Authenticated User Route */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Student Portal Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student', 'admin', 'organizer']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/my-events"
            element={
              <ProtectedRoute allowedRoles={['student', 'admin', 'organizer']}>
                <MyRegistrations />
              </ProtectedRoute>
            }
          />

          {/* Organizer Portal Routes */}
          <Route
            path="/organizer"
            element={
              <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                <OrganizerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/events/new"
            element={
              <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                <CreateEvent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/events/edit/:id"
            element={
              <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                <CreateEvent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/attendance/:eventId"
            element={
              <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                <AttendanceTracker />
              </ProtectedRoute>
            }
          />

          {/* Admin Portal Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/venues"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <VenuesManagement />
              </ProtectedRoute>
            }
          />

          {/* Fallback 404 Route */}
          <Route
            path="*"
            element={
              <div className="max-w-md mx-auto px-4 py-24 text-center">
                <h1 className="text-6xl font-black text-brand-600 mb-2">404</h1>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Page Not Found</h2>
                <p className="text-xs text-slate-500 mb-6">
                  The page you requested does not exist or may have been relocated.
                </p>
                <a
                  href="/"
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold"
                >
                  Return to Home
                </a>
              </div>
            }
          />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
