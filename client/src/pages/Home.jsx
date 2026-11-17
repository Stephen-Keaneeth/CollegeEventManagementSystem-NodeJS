import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Sparkles,
  ArrowRight,
  Shield,
  Users,
  Award,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Clock,
  QrCode
} from 'lucide-react';
import { eventsApi, categoriesApi } from '../api';
import EventCard from '../components/common/EventCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function Home() {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [eventsRes, catsRes] = await Promise.all([
          eventsApi.getAll({ featured: true, limit: 3 }),
          categoriesApi.getAll(),
        ]);
        setFeaturedEvents(eventsRes?.data?.events || []);
        setCategories(catsRes?.data?.categories || []);
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadHomeData();
  }, []);

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-28">
        {/* Background gradient decorative shapes */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-brand-500/20 to-purple-500/20 blur-3xl -z-10 rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Announcement pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold mb-6 shadow-xs animate-fade-in">
            <Sparkles className="w-4 h-4 text-brand-600" />
            <span>Spring 2026 Campus Events Now Live!</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
            Where Campus Energy Meets{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">
              Seamless Organization
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            The all-in-one platform for our college community. Discover hackathons, workshops, and cultural nights. Register with instant digital passes, track attendance live, and review events.
          </p>

          {/* Action buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              to="/events"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-500/25 transition-all hover:-translate-y-0.5"
            >
              Explore All Events <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm transition-all"
            >
              Sign In to Your Portal
            </Link>
          </div>

          {/* Live Quick Counters */}
          <div className="mt-14 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-xs text-left">
            <div>
              <p className="text-2xl font-black text-slate-900">50+</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Annual Events</p>
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">4,500+</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Active Students</p>
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">96.4%</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Attendance Rate</p>
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">4.9 / 5.0</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Student Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600 mb-1">
              <Sparkles className="w-4 h-4" /> Handpicked Highlights
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Featured Campus Events
            </h2>
          </div>
          <Link
            to="/events"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
          >
            Browse all events <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Fetching highlighted events..." />
        ) : featuredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
            No featured events currently scheduled. Check the full catalog!
          </div>
        )}
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Explore by Event Category
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            From technical bootcamps to athletics tournaments, find what matches your campus passion.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/events?category=${cat.slug}`}
              className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all text-center flex flex-col items-center justify-between group hover:-translate-y-1"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white mb-3 shadow-xs group-hover:scale-110 transition-transform"
                style={{ backgroundColor: cat.color || '#4F46E5' }}
              >
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1 group-hover:text-brand-600 transition-colors">
                {cat.name}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                {cat.event_count || 0} active
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="bg-gradient-to-b from-slate-900 to-indigo-950 py-16 sm:py-20 text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-300">
              Modern Architecture
            </span>
            <h2 className="text-3xl font-extrabold text-white mt-1">
              Built Specifically for College Needs
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center mb-4">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Digital Event Passes</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Students receive unique, scannable QR ticket codes immediately upon registration. Printable or savable directly on phones.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">1-Click Live Attendance</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Organizers track student check-ins in real time with bulk attendance marking, attendance percentages, and CSV export.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Visual Analytics & Feedback</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Interactive Chart.js visualizations for administrators, organizers and students. Post-event 1-5 star reviews and ratings.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
