import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Ticket,
  CheckCircle2,
  Clock,
  Star,
  ArrowRight,
  Sparkles,
  MapPin,
  MessageSquare
} from 'lucide-react';
import { dashboardApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import TicketModal from '../../components/common/TicketModal';
import FeedbackModal from '../../components/common/FeedbackModal';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Active Modals
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedEventForFeedback, setSelectedEventForFeedback] = useState(null);

  const loadStudentDashboard = async () => {
    try {
      const res = await dashboardApi.getStudentStats();
      setData(res?.data || null);
    } catch (err) {
      console.error('Failed to load student dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner text="Loading student portal..." size="lg" />
      </div>
    );
  }

  const stats = data?.stats || {};
  const schedule = data?.upcoming_schedule || [];
  const pendingFeedback = data?.pending_feedback || [];
  const participation = data?.past_participation || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-600 via-indigo-600 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md text-brand-100 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Student Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-xs sm:text-sm text-brand-100 mt-1">
            {user?.department} • Roll No: {user?.roll_number || 'N/A'}
          </p>
        </div>

        <Link
          to="/events"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold text-brand-900 bg-white hover:bg-brand-50 shadow-sm transition-all shrink-0"
        >
          Discover More Events <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Registered"
          value={stats.total_registered || 0}
          subtitle="Events booked"
          icon={Ticket}
          color="indigo"
        />
        <StatCard
          title="Upcoming Schedule"
          value={stats.upcoming_count || 0}
          subtitle="Future events on calendar"
          icon={Calendar}
          color="sky"
        />
        <StatCard
          title="Events Attended"
          value={stats.attended_count || 0}
          subtitle="Verified check-ins"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Pending Feedback"
          value={stats.pending_feedback_count || 0}
          subtitle="Reviews waiting"
          icon={Star}
          color="amber"
        />
      </div>

      {/* Pending Reviews Callout (if any) */}
      {pendingFeedback.length > 0 && (
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700 shrink-0">
              <Star className="w-5 h-5 fill-amber-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900">
                You have {pendingFeedback.length} event{pendingFeedback.length > 1 ? 's' : ''} awaiting review!
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                Share your rating and thoughts on "{pendingFeedback[0].title}" to help organizers improve future sessions.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedEventForFeedback(pendingFeedback[0])}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-sm transition-colors shrink-0"
          >
            Review Now
          </button>
        </div>
      )}

      {/* Upcoming Schedule Grid */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-600" /> Your Upcoming Event Schedule
            </h2>
            <p className="text-xs text-slate-500">Reserved seats with digital access passes</p>
          </div>
          <Link
            to="/student/my-events"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700"
          >
            View all passes →
          </Link>
        </div>

        {schedule.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schedule.map((item) => (
              <div
                key={item.ticket_code}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white"
                      style={{ backgroundColor: item.category_color || '#4F46E5' }}
                    >
                      {item.category_name}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      {item.ticket_code}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm line-clamp-1 mb-2">
                    {item.title}
                  </h3>

                  <div className="space-y-1 text-xs text-slate-500 mb-4">
                    <p className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(item.start_time).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {item.venue_name}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200/60 flex items-center gap-2">
                  <button
                    onClick={() =>
                      setSelectedTicket({
                        ...item,
                        event_title: item.title,
                        student_name: user?.name,
                        roll_number: user?.roll_number,
                        department: user?.department,
                      })
                    }
                    className="flex-1 py-2 px-3 text-xs font-bold text-center rounded-xl bg-brand-600 text-white hover:bg-brand-700 transition-colors shadow-xs"
                  >
                    View QR Pass
                  </button>
                  <Link
                    to={`/events/${item.event_id}`}
                    className="py-2 px-3 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl">
            You don't have any upcoming registered events.{' '}
            <Link to="/events" className="text-brand-600 font-semibold underline">
              Browse events to register!
            </Link>
          </div>
        )}
      </div>

      {/* Past Participation History */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Attendance & Participation Log
        </h2>

        {participation.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Event Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Ticket Code</th>
                  <th className="py-3 px-4">Attendance</th>
                  <th className="py-3 px-4">Feedback Given</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {participation.map((row) => (
                  <tr key={row.ticket_code} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-800">{row.title}</td>
                    <td className="py-3.5 px-4 text-slate-600">{row.category_name}</td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-700">{row.ticket_code}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                        Present
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {row.rating ? (
                        <div className="flex items-center gap-1 font-semibold text-amber-600">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                          <span>{row.rating} / 5</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedEventForFeedback(row)}
                          className="text-brand-600 hover:underline font-semibold"
                        >
                          + Leave Rating
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-6">
            No completed attended events recorded yet.
          </p>
        )}
      </div>

      {/* Modals */}
      <TicketModal
        ticket={selectedTicket}
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
      />

      <FeedbackModal
        event={selectedEventForFeedback}
        isOpen={!!selectedEventForFeedback}
        onClose={() => setSelectedEventForFeedback(null)}
        onSuccess={loadStudentDashboard}
      />
    </div>
  );
}
