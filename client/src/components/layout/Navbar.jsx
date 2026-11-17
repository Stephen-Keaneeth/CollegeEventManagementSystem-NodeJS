import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  PlusCircle,
  LayoutDashboard,
  Ticket,
  LogOut,
  User,
  Menu,
  X,
  Shield,
  Layers,
  Sparkles,
  ChevronDown
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout, isAdmin, isOrganizer, isStudent } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-slate-900 tracking-tight flex items-center gap-1">
                Campus<span className="text-brand-600">Pulse</span>
              </span>
              <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-600 -mt-1">
                College Events
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              to="/events"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/events')
                  ? 'text-brand-600 bg-brand-50 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Explore Events
            </Link>

            {/* Role specific shortcuts */}
            {isAuthenticated && isStudent && (
              <>
                <Link
                  to="/student"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive('/student')
                      ? 'text-brand-600 bg-brand-50 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
                <Link
                  to="/student/my-events"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive('/student/my-events')
                      ? 'text-brand-600 bg-brand-50 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Ticket className="w-4 h-4" /> My Passes
                </Link>
              </>
            )}

            {isAuthenticated && isOrganizer && (
              <>
                <Link
                  to="/organizer"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive('/organizer')
                      ? 'text-brand-600 bg-brand-50 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" /> Organizer Hub
                </Link>
                <Link
                  to="/organizer/events/new"
                  className="px-3.5 py-1.5 rounded-lg text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  <PlusCircle className="w-4 h-4" /> Create Event
                </Link>
              </>
            )}

            {isAuthenticated && isAdmin && (
              <Link
                to="/admin"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  location.pathname.startsWith('/admin')
                    ? 'text-brand-600 bg-brand-50 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Shield className="w-4 h-4 text-brand-600" /> Admin Console
              </Link>
            )}
          </div>

          {/* User Auth Menu / Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-bold text-slate-800 leading-tight">{user.name}</p>
                    <span className="text-[10px] uppercase font-semibold text-brand-600 tracking-wide">
                      {user.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 animate-fade-in z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-xs font-bold text-slate-900 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-slate-100 text-slate-700">
                        {user.role}
                      </span>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-400" /> My Profile
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Shield className="w-4 h-4 text-slate-400" /> Admin Dashboard
                      </Link>
                    )}

                    {isOrganizer && (
                      <Link
                        to="/organizer"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-400" /> Organizer Dashboard
                      </Link>
                    )}

                    {isStudent && (
                      <Link
                        to="/student"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-400" /> Student Portal
                      </Link>
                    )}

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-slate-800" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 animate-slide-up">
          <Link
            to="/events"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-800 hover:bg-slate-100"
          >
            Explore Events
          </Link>

          {isAuthenticated ? (
            <>
              {isStudent && (
                <>
                  <Link
                    to="/student"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-800 hover:bg-slate-100"
                  >
                    Student Dashboard
                  </Link>
                  <Link
                    to="/student/my-events"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-800 hover:bg-slate-100"
                  >
                    My Event Passes
                  </Link>
                </>
              )}

              {isOrganizer && (
                <>
                  <Link
                    to="/organizer"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-800 hover:bg-slate-100"
                  >
                    Organizer Dashboard
                  </Link>
                  <Link
                    to="/organizer/events/new"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-sm font-semibold text-brand-600 hover:bg-brand-50"
                  >
                    + Create New Event
                  </Link>
                </>
              )}

              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-sm font-medium text-brand-700 bg-brand-50"
                >
                  Admin Console
                </Link>
              )}

              <Link
                to="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-800 hover:bg-slate-100"
              >
                My Profile ({user.name})
              </Link>

              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl text-sm font-semibold text-slate-800 bg-slate-100"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-600"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
