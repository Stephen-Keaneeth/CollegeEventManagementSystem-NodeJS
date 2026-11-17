import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Ticket,
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Star,
  QrCode,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { registrationsApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import TicketModal from '../../components/common/TicketModal';
import FeedbackModal from '../../components/common/FeedbackModal';

export default function MyRegistrations() {
  const { user } = useAuth();
  const toast = useToast();

  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  // Modals state
  const [activeTicket, setActiveTicket] = useState(null);
  const [feedbackEvent, setFeedbackEvent] = useState(null);

  const fetchRegistrations = async () => {
    try {
      const res = await registrationsApi.getMyEvents();
      setRegistrations(res?.data?.registrations || []);
    } catch (err) {
      toast.error('Failed to load your event registrations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleCancelRegistration = async (eventId, title) => {
    if (!window.confirm(`Are you sure you want to cancel your registration for "${title}"?`)) {
      return;
    }

    try {
      setCancellingId(eventId);
      await registrationsApi.cancel(eventId);
      toast.success('Registration cancelled.');
      await fetchRegistrations();
    } catch (err) {
      toast.error(err.message || 'Failed to cancel registration.');
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner text="Loading your event tickets..." size="lg" />
      </div>
    );
  }

  const activeRegistrations = registrations.filter((r) => r.registration_status === 'registered');
  const cancelledRegistrations = registrations.filter((r) => r.registration_status === 'cancelled');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 mb-2">
            <Ticket className="w-3.5 h-3.5" /> Digital Access Passes
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Registered Events
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Access your admission QR codes, view venue details, and track your attendance.
          </p>
        </div>

        <Link
          to="/events"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 transition-colors shadow-sm shrink-0"
        >
          Discover More Events <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Active Passes Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Ticket className="w-5 h-5 text-brand-600" /> Active Event Passes ({activeRegistrations.length})
        </h2>

        {activeRegistrations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeRegistrations.map((item) => {
              const startDate = new Date(item.start_time);
              const formattedDate = startDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              });
              const formattedTime = startDate.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
              });
              const isPast = new Date() > new Date(item.end_time);

              return (
                <div
                  key={item.registration_id}
                  className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white shadow-xs"
                        style={{ backgroundColor: item.category_color || '#4F46E5' }}
                      >
                        {item.category_name}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                        {item.ticket_code}
                      </span>
                    </div>

                    <Link to={`/events/${item.event_id}`}>
                      <h3 className="font-bold text-slate-900 hover:text-brand-600 transition-colors text-base line-clamp-1 mb-2">
                        {item.title}
                      </h3>
                    </Link>

                    <div className="space-y-1.5 text-xs text-slate-500 mb-4">
                      <p className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {formattedDate} • {formattedTime}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {item.venue_name} ({item.venue_building})
                      </p>
                    </div>

                    {/* Attendance / Event State Badge */}
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Attendance:</span>
                      <span
                        className={`font-bold uppercase tracking-wider text-[11px] px-2 py-0.5 rounded-full ${
                          item.attendance_status === 'present'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {item.attendance_status === 'present' ? 'Verified Present' : 'Ready / Registered'}
                      </span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() =>
                        setActiveTicket({
                          ...item,
                          event_title: item.title,
                          student_name: user?.name,
                          roll_number: user?.roll_number,
                          department: user?.department,
                        })
                      }
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 transition-colors shadow-xs"
                    >
                      <QrCode className="w-3.5 h-3.5" /> Show QR Pass
                    </button>

                    {item.event_status === 'completed' ? (
                      <button
                        onClick={() =>
                          setFeedbackEvent({
                            id: item.event_id,
                            title: item.title,
                            user_feedback: item.my_rating
                              ? { rating: item.my_rating, review: item.my_review }
                              : null,
                          })
                        }
                        className="py-2 px-3 rounded-xl text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors flex items-center gap-1"
                      >
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        {item.my_rating ? 'Rated' : 'Review'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleCancelRegistration(item.event_id, item.title)}
                        disabled={cancellingId === item.event_id}
                        className="py-2 px-3 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="You don't have any active registrations"
            description="Explore our campus calendar to sign up for coding hackathons, guest lectures, and cultural events!"
            actionLabel="Discover Events"
            onAction={() => (window.location.href = '/events')}
          />
        )}
      </div>

      {/* Modals */}
      <TicketModal
        ticket={activeTicket}
        isOpen={!!activeTicket}
        onClose={() => setActiveTicket(null)}
      />

      <FeedbackModal
        event={feedbackEvent}
        isOpen={!!feedbackEvent}
        onClose={() => setFeedbackEvent(null)}
        onSuccess={fetchRegistrations}
        initialFeedback={feedbackEvent?.user_feedback}
      />
    </div>
  );
}
