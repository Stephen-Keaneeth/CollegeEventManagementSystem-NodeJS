import React from 'react';
import { Calendar, Heart, Shield, Code, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                Campus<span className="text-brand-400">Pulse</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed mb-4">
              Modern full-stack college event management platform. Streamlining student registrations, digital badge passes, attendance tracking, and comprehensive feedback analytics for universities.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>All Systems Operational • MySQL & Node.js Engine</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/events" className="hover:text-white transition-colors">
                  All Campus Events
                </Link>
              </li>
              <li>
                <Link to="/events?category=hackathons-challenges" className="hover:text-white transition-colors">
                  Hackathons & Sprints
                </Link>
              </li>
              <li>
                <Link to="/events?category=cultural-arts" className="hover:text-white transition-colors">
                  Cultural Festivals
                </Link>
              </li>
              <li>
                <Link to="/events?category=workshops-bootcamps" className="hover:text-white transition-colors">
                  Technical Workshops
                </Link>
              </li>
            </ul>
          </div>

          {/* Demonstration Logins */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Demo Portals</h4>
            <ul className="space-y-2 text-xs">
              <li className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/50">
                <span className="block font-bold text-slate-200">Admin Account</span>
                <span className="text-brand-400">admin@college.edu</span>
              </li>
              <li className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/50">
                <span className="block font-bold text-slate-200">Organizer Account</span>
                <span className="text-brand-400">organizer@college.edu</span>
              </li>
              <li className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/50">
                <span className="block font-bold text-slate-200">Student Account</span>
                <span className="text-brand-400">student@college.edu</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} CampusPulse - College Event Management System. Built for academic demonstration.</p>
          <div className="flex items-center gap-1">
            <span>Powered by</span>
            <span className="font-semibold text-slate-300">React • Node.js • Express • MySQL • Chart.js</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
