import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  PlusCircle,
  Users,
  CheckCircle2,
  Star,
  Clock,
  ArrowRight,
  Sparkles,
  ClipboardCheck,
  Edit,
  ExternalLink
} from 'lucide-react';
import { dashboardApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function OrganizerDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrganizerData() {
      try {
        const res = await dashboardApi.getOrganizerStats();
        setData(res?.data || null);
      } catch (err) {
        console.error('Failed to load organizer dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOrganizerData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner text="Loading organizer hub..." size="lg" />
      </div>
    );
  }

  const stats = data?.stats || {};
  const events = data?.events || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-brand-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md text-brand-300 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Event Organizer Hub
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Organizer Portal: {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Create, schedule, track registrations, and manage live student check-ins.
          </p>
        </div>

        <Link
          to="/organizer/events/new"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-lg shadow-brand-500/25 transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4" /> Schedule New Event
        </Link>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Events"
          value={stats.total_events || 0}
          subtitle={`${stats.published_events || 0} published`}
          icon={Calendar}
          color="indigo"
        />
        <StatCard
          title="Total Registrations"
          value={stats.total_registrations || 0}
          subtitle={`Across ${stats.total_capacity || 0} capacity`}
          icon={Users}
          color="sky"
        />
        <StatCard
          title="Students Checked-In"
          value={stats.present_count || 0}
          subtitle={`${stats.absent_count || 0} marked absent`}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Average Rating"
          value={stats.avg_rating ? `${stats.avg_rating} / 5` : 'N/A'}
          subtitle={`From ${stats.total_reviews || 0} reviews`}
          icon={Star}
          color="amber"
        />
      </div>

      {/* Organizer's Events Table */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Your Coordinated Events</h2>
            <p className="text-xs text-slate-500">Manage attendees, live attendance, and status</p>
          </div>
          <Link
            to="/organizer/events/new"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700"
          >
            + Create Event
          </Link>
        </div>

        {events.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Event Title</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Venue</th>
                  <th className="py-3 px-4">Registrations</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {events.map((ev) => {
                  const percentage = Math.min(
                    100,
                    Math.round((ev.current_registrations / ev.max_capacity) * 100)
                  );

                  return (
                    <tr key={ev.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        <Link to={`/events/${ev.id}`} className="hover:text-brand-600">
                          {ev.title}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {new Date(ev.start_time).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{ev.venue_name}</td>
                      <td className="py-3.5 px-4">
                        <div className="w-32">
                          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                            <span>{ev.current_registrations} / {ev.max_capacity}</span>
                            <span className="font-semibold">{percentage}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-brand-600 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            ev.status === 'published'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ev.status === 'completed'
                              ? 'bg-slate-800 text-slate-200'
                              : ev.status === 'cancelled'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {ev.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            to={`/organizer/attendance/${ev.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors"
                          >
                            <ClipboardCheck className="w-3.5 h-3.5" /> Attendance
                          </Link>
                          <Link
                            to={`/events/${ev.id}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-6">
            You haven't scheduled any events yet.{' '}
            <Link to="/organizer/events/new" className="text-brand-600 font-semibold underline">
              Create your first event!
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
