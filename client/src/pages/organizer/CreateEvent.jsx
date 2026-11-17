import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Image,
  Plus,
  Trash2,
  ArrowLeft,
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { eventsApi, categoriesApi, venuesApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const PRESET_BANNERS = [
  {
    name: 'Hackathon & Tech',
    url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Cultural Festival',
    url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Hands-on Bootcamp',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Sports & Tournament',
    url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Distinguished Keynote',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
  },
];

export default function CreateEvent() {
  const { id } = useParams(); // If id exists, it's edit mode!
  const isEditMode = Boolean(id);

  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const [categories, setCategories] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [venueId, setVenueId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [registrationDeadline, setRegistrationDeadline] = useState('');
  const [maxCapacity, setMaxCapacity] = useState(100);
  const [status, setStatus] = useState('published');
  const [bannerImage, setBannerImage] = useState(PRESET_BANNERS[0].url);
  const [prerequisites, setPrerequisites] = useState('');
  const [agenda, setAgenda] = useState([
    { time: '09:00 AM', title: 'Registration & Welcome' },
    { time: '10:00 AM', title: 'Main Session Begins' },
  ]);

  useEffect(() => {
    async function initData() {
      try {
        const [catsRes, venuesRes] = await Promise.all([
          categoriesApi.getAll(),
          venuesApi.getAll(),
        ]);
        const catList = catsRes?.data?.categories || [];
        const venList = venuesRes?.data?.venues || [];

        setCategories(catList);
        setVenues(venList);

        if (catList.length > 0 && !categoryId) setCategoryId(catList[0].id);
        if (venList.length > 0 && !venueId) setVenueId(venList[0].id);

        // If Edit Mode, fetch existing event
        if (isEditMode) {
          const eventRes = await eventsApi.getById(id);
          const ev = eventRes.data.event;
          setTitle(ev.title);
          setShortDescription(ev.short_description || '');
          setDescription(ev.description);
          setCategoryId(ev.category_id);
          setVenueId(ev.venue_id);
          setStatus(ev.status);
          setMaxCapacity(ev.max_capacity);
          setBannerImage(ev.banner_image || PRESET_BANNERS[0].url);
          setPrerequisites(ev.prerequisites || '');

          if (ev.start_time) setStartTime(ev.start_time.slice(0, 16));
          if (ev.end_time) setEndTime(ev.end_time.slice(0, 16));
          if (ev.registration_deadline) setRegistrationDeadline(ev.registration_deadline.slice(0, 16));
          if (ev.schedule_agenda && Array.isArray(ev.schedule_agenda)) {
            setAgenda(ev.schedule_agenda);
          }
        } else {
          // Defaults for new event
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 7);
          tomorrow.setHours(10, 0, 0, 0);

          const end = new Date(tomorrow);
          end.setHours(16, 0, 0, 0);

          const deadline = new Date(tomorrow);
          deadline.setDate(deadline.getDate() - 2);
          deadline.setHours(23, 59, 0, 0);

          setStartTime(tomorrow.toISOString().slice(0, 16));
          setEndTime(end.toISOString().slice(0, 16));
          setRegistrationDeadline(deadline.toISOString().slice(0, 16));
        }
      } catch (err) {
        toast.error('Failed to load initial event form data.');
      } finally {
        setLoading(false);
      }
    }

    initData();
  }, [id, isEditMode]);

  const addAgendaItem = () => {
    setAgenda([...agenda, { time: '', title: '' }]);
  };

  const updateAgendaItem = (index, field, value) => {
    const updated = [...agenda];
    updated[index][field] = value;
    setAgenda(updated);
  };

  const removeAgendaItem = (index) => {
    setAgenda(agenda.filter((_, i) => i !== index));
  };

  const selectedVenueObj = venues.find((v) => v.id === parseInt(venueId, 10));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description || !categoryId || !venueId || !startTime || !endTime || !registrationDeadline) {
      toast.error('Please fill in all required event fields.');
      return;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    const deadline = new Date(registrationDeadline);

    if (end <= start) {
      toast.error('End time must be after start time.');
      return;
    }

    if (deadline >= start) {
      toast.error('Registration deadline must be before event start time.');
      return;
    }

    if (selectedVenueObj && parseInt(maxCapacity, 10) > selectedVenueObj.capacity) {
      toast.error(`Event capacity cannot exceed venue capacity (${selectedVenueObj.capacity}).`);
      return;
    }

    const payload = {
      title: title.trim(),
      short_description: shortDescription.trim() || title.slice(0, 120),
      description: description.trim(),
      category_id: parseInt(categoryId, 10),
      venue_id: parseInt(venueId, 10),
      start_time: startTime,
      end_time: endTime,
      registration_deadline: registrationDeadline,
      max_capacity: parseInt(maxCapacity, 10),
      status,
      banner_image: bannerImage,
      prerequisites: prerequisites.trim(),
      schedule_agenda: agenda.filter((a) => a.time && a.title),
    };

    try {
      setSubmitting(true);
      if (isEditMode) {
        await eventsApi.update(id, payload);
        toast.success('Event updated successfully!');
        navigate(`/events/${id}`);
      } else {
        const res = await eventsApi.create(payload);
        toast.success('Event created and published!');
        navigate(`/events/${res.data.id}`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save event.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner text="Preparing event builder..." size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/organizer"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-brand-600"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Organizer Hub
        </Link>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-brand-600 to-indigo-700 p-8 text-white">
          <div className="flex items-center gap-2 text-brand-200 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" /> Event Management Studio
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {isEditMode ? 'Edit Campus Event' : 'Create & Schedule New Campus Event'}
          </h1>
          <p className="text-xs sm:text-sm text-brand-100 mt-1">
            Publish event details, assign campus venues, define agendas, and manage attendee quotas.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              1. General Details
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Event Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. HackNova 2026: 36-Hour National College Hackathon"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Catchy Summary / Subtitle *
              </label>
              <input
                type="text"
                required
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Brief 1-2 sentence overview shown on cards and search results"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Category *</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Publishing Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                >
                  <option value="published">Published (Live & Open)</option>
                  <option value="draft">Draft (Saved Privately)</option>
                  {isEditMode && <option value="completed">Completed (Archived for Feedback)</option>}
                  {isEditMode && <option value="cancelled">Cancelled</option>}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Event Description *
              </label>
              <textarea
                rows={5}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed agenda, rules, speaker profiles, judging criteria, and instructions..."
                className="w-full p-4 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Section 2: Venue & Capacity */}
          <div className="pt-6 border-t border-slate-200 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              2. Venue & Seat Capacity
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Campus Venue *
                </label>
                <select
                  value={venueId}
                  onChange={(e) => setVenueId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                >
                  {venues.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.capacity} max seats)
                    </option>
                  ))}
                </select>
                {selectedVenueObj && (
                  <p className="text-[11px] text-slate-500 mt-1">
                    Building: {selectedVenueObj.building} • Facilities: {selectedVenueObj.facilities}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Max Registration Quota *
                </label>
                <input
                  type="number"
                  min={1}
                  max={selectedVenueObj?.capacity || 2000}
                  value={maxCapacity}
                  onChange={(e) => setMaxCapacity(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Cannot exceed venue capacity ({selectedVenueObj?.capacity || 'N/A'})
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Schedule Timing */}
          <div className="pt-6 border-t border-slate-200 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              3. Dates & Registration Deadline
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  End Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Registration Deadline *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={registrationDeadline}
                  onChange={(e) => setRegistrationDeadline(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Banner Image Selector */}
          <div className="pt-6 border-t border-slate-200 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              4. Event Banner
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {PRESET_BANNERS.map((preset) => (
                <button
                  type="button"
                  key={preset.name}
                  onClick={() => setBannerImage(preset.url)}
                  className={`p-1.5 rounded-xl border-2 transition-all overflow-hidden text-left ${
                    bannerImage === preset.url
                      ? 'border-brand-600 ring-2 ring-brand-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="w-full h-16 object-cover rounded-lg mb-1"
                  />
                  <p className="text-[10px] font-bold text-slate-700 truncate">{preset.name}</p>
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Or Custom Banner Image URL
              </label>
              <input
                type="url"
                value={bannerImage}
                onChange={(e) => setBannerImage(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          {/* Section 5: Dynamic Itinerary Builder */}
          <div className="pt-6 border-t border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                5. Schedule & Agenda Slots
              </h3>
              <button
                type="button"
                onClick={addAgendaItem}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Slot
              </button>
            </div>

            <div className="space-y-3">
              {agenda.map((slot, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <input
                    type="text"
                    value={slot.time}
                    onChange={(e) => updateAgendaItem(index, 'time', e.target.value)}
                    placeholder="e.g. 10:00 AM"
                    className="w-36 px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                  <input
                    type="text"
                    value={slot.title}
                    onChange={(e) => updateAgendaItem(index, 'title', e.target.value)}
                    placeholder="Slot Title / Description"
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => removeAgendaItem(index)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 6: Prerequisites */}
          <div className="pt-6 border-t border-slate-200 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              6. Prerequisites & Instructions
            </h3>

            <div>
              <textarea
                rows={2}
                value={prerequisites}
                onChange={(e) => setPrerequisites(e.target.value)}
                placeholder="What should students bring? e.g. College ID, Laptop, Team size (2-4), chargers..."
                className="w-full p-3.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-slate-200 flex items-center justify-end gap-3">
            <Link
              to="/organizer"
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/25 transition-all disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              {submitting ? 'Saving Event...' : isEditMode ? 'Update Event' : 'Publish Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
