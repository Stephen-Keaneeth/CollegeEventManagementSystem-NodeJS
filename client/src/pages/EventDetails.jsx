import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Star,
  CheckCircle2,
  XCircle,
  Share2,
  ArrowLeft,
  Mail,
  Phone,
  AlertCircle,
  Building,
  Sparkles,
  Ticket,
  MessageSquare
} from 'lucide-react';
import { eventsApi, registrationsApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import TicketModal from '../components/common/TicketModal';
import FeedbackModal from '../components/common/FeedbackModal';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Modals state
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const fetchEventDetails = async () => {
    try {
      const res = await eventsApi.getById(id);
      setEvent(res?.data?.event || null);
    } catch (err) {
      toast.error('Failed to load event details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const handleRegister = async () => {
    if (!isAuthenticated) {
      toast.info('Please sign in to register for this event.');
      navigate('/login', { state: { from: `/events/${id}` } });
      return;
    }

    try {
      setIsRegistering(true);
      await registrationsApi.register(id);
      toast.success('Registration successful! Your digital pass is ready.');

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      await fetchEventDetails();
      setShowTicketModal(true);
    } catch (err) {
      toast.error(err.message || 'Registration failed.');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!window.confirm('Are you sure you want to cancel your registration for this event? Your seat will be freed up for other students.')) {
      return;
    }

    try {
      setIsCancelling(true);
      await registrationsApi.cancel(id);
      toast.success('Your registration has been cancelled.');
      await fetchEventDetails();
    } catch (err) {
      toast.error(err.message || 'Failed to cancel registration.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.short_description,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.info('Event link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner text="Loading event details..." size="lg" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Event Not Found</h2>
        <p className="mt-2 text-sm text-slate-500">The event you are looking for may have been removed or archived.</p>
        <Link to="/events" className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to Events
        </Link>
      </div>
    );
  }

  const startDate = new Date(event.start_time);
  const endDate = new Date(event.end_time);
  const deadlineDate = new Date(event.registration_deadline);

  const formattedDate = startDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedStartTime = startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const formattedEndTime = endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const formattedDeadline = deadlineDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  const percentageFilled = Math.min(100, Math.round((event.current_registrations / event.max_capacity) * 100));
  const isFull = event.current_registrations >= event.max_capacity;
  const isPastDeadline = new Date() > deadlineDate;

  // Prepare ticket details for TicketModal
  const userTicket = event.user_registration
    ? {
        ...event.user_registration,
        event_title: event.title,
        start_time: event.start_time,
        venue_name: event.venue_name,
        category_name: event.category_name,
        student_name: user?.name,
        roll_number: user?.roll_number,
        department: user?.department,
        attendance_status: event.user_attendance?.status || 'unmarked'
      }
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/events"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Events Catalog
        </Link>
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-xs"
        >
          <Share2 className="w-3.5 h-3.5" /> Share
        </button>
      </div>

      {/* Main Hero Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden">
        <div className="relative aspect-[21/9] sm:aspect-[24/9] w-full bg-slate-900 overflow-hidden">
          <img
            src={event.banner_image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1400&q=80'}
            alt={event.title}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Badges on Banner */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <span
              className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm backdrop-blur-md"
              style={{ backgroundColor: event.category_color }}
            >
              {event.category_name}
            </span>

            {event.is_featured && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-amber-950 shadow-sm flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-950" /> Featured Event
              </span>
            )}
          </div>

          {/* Title on Banner Bottom */}
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight max-w-4xl leading-tight">
              {event.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl line-clamp-2">
              {event.short_description}
            </p>
          </div>
        </div>

        {/* Quick Highlights Bar */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Date & Time</p>
              <p className="text-xs font-bold text-slate-800">{formattedDate}</p>
              <p className="text-[11px] text-slate-500">{formattedStartTime} - {formattedEndTime}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Campus Venue</p>
              <p className="text-xs font-bold text-slate-800">{event.venue_name}</p>
              <p className="text-[11px] text-slate-500">{event.venue_building}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Organizer</p>
              <p className="text-xs font-bold text-slate-800">{event.organizer_name}</p>
              <p className="text-[11px] text-slate-500">{event.organizer_department || 'Faculty'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Description, Prerequisites, Agenda, Venue, Reviews */}
        <div className="lg:col-span-2 space-y-8">
          {/* About Event */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-xl font-bold text-slate-900">About the Event</h2>
            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {event.description}
            </div>

            {event.prerequisites && (
              <div className="mt-6 p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-1 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" /> Prerequisites & Requirements
                </h4>
                <p className="text-xs text-amber-800 leading-relaxed">{event.prerequisites}</p>
              </div>
            )}
          </div>

          {/* Schedule / Agenda Timeline */}
          {event.schedule_agenda && Array.isArray(event.schedule_agenda) && event.schedule_agenda.length > 0 && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-brand-600" /> Event Itinerary & Schedule
              </h2>

              <div className="relative pl-6 border-l-2 border-brand-200 space-y-6 my-4">
                {event.schedule_agenda.map((slot, index) => (
                  <div key={index} className="relative group">
                    {/* Timeline bullet */}
                    <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-brand-600 border-2 border-white shadow-xs" />
                    <div>
                      <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                        {slot.time}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">{slot.title}</h4>
                      {slot.speaker && (
                        <p className="text-xs text-slate-500">Speaker: {slot.speaker}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Venue Information Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-5 h-5 text-indigo-600" /> Venue & Campus Location
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
                <span className="text-slate-500 block mb-1">Building & Wing</span>
                <span className="font-bold text-slate-900 text-sm">{event.venue_building}</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
                <span className="text-slate-500 block mb-1">Hall Seating Capacity</span>
                <span className="font-bold text-slate-900 text-sm">{event.venue_capacity} seats</span>
              </div>
            </div>
            {event.venue_facilities && (
              <div className="text-xs text-slate-600 pt-2">
                <strong className="text-slate-800">Available AV & Facilities: </strong>
                {event.venue_facilities}
              </div>
            )}
          </div>

          {/* Student Reviews & Feedback */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-500" /> Student Reviews & Ratings
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verified attendee feedback from participating students.
                </p>
              </div>

              {event.is_registered && event.status === 'completed' && (
                <button
                  onClick={() => setShowFeedbackModal(true)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 transition-colors"
                >
                  {event.user_feedback ? 'Edit Your Review' : '+ Leave Feedback'}
                </button>
              )}
            </div>

            {event.reviews && event.reviews.length > 0 ? (
              <div className="space-y-4">
                {event.reviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center">
                          {rev.user_name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">{rev.user_name}</p>
                          <p className="text-[10px] text-slate-400">{rev.department || 'Student'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              rev.rating >= s ? 'fill-amber-400 text-amber-500' : 'text-slate-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{rev.review}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                No student reviews yet. Reviews open once the event completes!
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Registration / Pass Box */}
        <div className="space-y-6">
          <div className="sticky top-24 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-lg space-y-5">
            {/* Registration Status Banner */}
            {event.is_registered ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-sm text-emerald-900">You are Registered!</p>
                  <p className="mt-0.5 text-emerald-700">Your seat is reserved. Bring your digital pass or QR ticket to check in.</p>
                </div>
              </div>
            ) : event.status !== 'published' ? (
              <div className="p-4 rounded-2xl bg-slate-100 text-slate-700 text-xs text-center font-medium">
                This event is currently <span className="font-bold uppercase">{event.status}</span>.
              </div>
            ) : isFull ? (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs text-center font-bold">
                Sold Out! Maximum capacity reached.
              </div>
            ) : isPastDeadline ? (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs text-center font-bold">
                Registration Deadline Has Passed.
              </div>
            ) : null}

            {/* Capacity Progress Bar */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                <span className="font-medium">Registered Attendees</span>
                <span className="font-bold text-slate-900">
                  {event.current_registrations} / {event.max_capacity}
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    percentageFilled >= 90
                      ? 'bg-rose-500'
                      : percentageFilled >= 70
                      ? 'bg-amber-500'
                      : 'bg-brand-600'
                  }`}
                  style={{ width: `${percentageFilled}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {event.max_capacity - event.current_registrations} spots remaining
              </p>
            </div>

            {/* Deadline Notice */}
            <div className="text-xs text-slate-600 border-t border-b border-slate-100 py-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Registration Closes:</span>
                <span className="font-semibold text-slate-800">{formattedDeadline}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Admission Fee:</span>
                <span className="font-bold text-emerald-600">Free / College Funded</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-1">
              {event.is_registered ? (
                <>
                  <button
                    onClick={() => setShowTicketModal(true)}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/20 transition-colors"
                  >
                    <Ticket className="w-4 h-4" /> View Digital Event Pass
                  </button>

                  {event.status === 'completed' && (
                    <button
                      onClick={() => setShowFeedbackModal(true)}
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                      <MessageSquare className="w-4 h-4 text-amber-500" />
                      {event.user_feedback ? 'Update Review' : 'Rate & Review Event'}
                    </button>
                  )}

                  <button
                    onClick={handleCancelRegistration}
                    disabled={isCancelling}
                    className="w-full text-center py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    {isCancelling ? 'Cancelling...' : 'Cancel Registration'}
                  </button>
                </>
              ) : event.status === 'published' && !isFull && !isPastDeadline ? (
                <button
                  onClick={handleRegister}
                  disabled={isRegistering}
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-500/25 transition-all hover:-translate-y-0.5 disabled:opacity-60"
                >
                  <Sparkles className="w-4 h-4" />
                  {isRegistering ? 'Reserving Seat...' : 'Register for Event'}
                </button>
              ) : null}
            </div>

            {/* Organizer Contact Info */}
            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-700 block">Questions or Assistance?</span>
              {event.contact_email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <a href={`mailto:${event.contact_email}`} className="text-brand-600 hover:underline">
                    {event.contact_email}
                  </a>
                </div>
              )}
              {event.contact_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{event.contact_phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Pass Modal */}
      {userTicket && (
        <TicketModal
          ticket={userTicket}
          isOpen={showTicketModal}
          onClose={() => setShowTicketModal(false)}
        />
      )}

      {/* Feedback Modal */}
      <FeedbackModal
        event={event}
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        onSuccess={fetchEventDetails}
        initialFeedback={event.user_feedback}
      />
    </div>
  );
}
