import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Search,
  Filter,
  Calendar,
  MapPin,
  Sparkles,
  X,
  CheckCircle2,
  SlidersHorizontal
} from 'lucide-react';
import { eventsApi, categoriesApi, venuesApi, registrationsApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import EventCard from '../components/common/EventCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import TicketModal from '../components/common/TicketModal';

export default function Events() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, isStudent } = useAuth();
  const toast = useToast();

  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registeringId, setRegisteringId] = useState(null);

  // Active Ticket Modal
  const [activeTicket, setActiveTicket] = useState(null);

  // Filters state from URL or defaults
  const searchTerm = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || '';
  const selectedVenue = searchParams.get('venue') || '';
  const selectedTimeframe = searchParams.get('timeframe') || 'upcoming';

  useEffect(() => {
    async function loadFilters() {
      try {
        const [catsRes, venuesRes] = await Promise.all([
          categoriesApi.getAll(),
          venuesApi.getAll(),
        ]);
        setCategories(catsRes?.data?.categories || []);
        setVenues(venuesRes?.data?.venues || []);
      } catch (err) {
        console.error('Failed to load filter options:', err);
      }
    }
    loadFilters();
  }, []);

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      try {
        const params = {
          search: searchTerm,
          category: selectedCategory,
          venue: selectedVenue,
          timeframe: selectedTimeframe === 'all' ? undefined : selectedTimeframe,
        };
        const res = await eventsApi.getAll(params);
        setEvents(res?.data?.events || []);
      } catch (err) {
        toast.error('Failed to load events.');
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, [searchTerm, selectedCategory, selectedVenue, selectedTimeframe]);

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const handleRegister = async (eventId) => {
    if (!isAuthenticated) {
      toast.info('Please sign in or register to book an event seat.');
      return;
    }

    try {
      setRegisteringId(eventId);
      const res = await registrationsApi.register(eventId);
      toast.success(res.message || 'Registration confirmed!');

      // Celebrate with confetti!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      // Update event in local state
      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId
            ? {
                ...e,
                is_registered: true,
                current_registrations: e.current_registrations + 1,
              }
            : e
        )
      );

      // Fetch ticket for modal
      if (res.data?.ticket_code) {
        const ticketRes = await registrationsApi.getTicket(res.data.ticket_code);
        setActiveTicket(ticketRes?.data?.ticket);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to complete registration.');
    } finally {
      setRegisteringId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-brand-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md text-brand-200 mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Campus Directory
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Explore All Campus Events
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-300">
            Browse upcoming workshops, hackathons, guest lectures, and cultural nights. Book your seat with instant digital badge passes.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => updateFilter('search', e.target.value)}
              placeholder="Search events by title, keyword, or topic..."
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-800 placeholder:text-slate-400"
            />
            {searchTerm && (
              <button
                onClick={() => updateFilter('search', '')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Venue Selector */}
          <div className="w-full md:w-56">
            <select
              value={selectedVenue}
              onChange={(e) => updateFilter('venue', e.target.value)}
              className="w-full py-2.5 px-3 text-sm rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              <option value="">All Campus Venues</option>
              {venues.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          {/* Timeframe Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
            {[
              { id: 'upcoming', label: 'Upcoming' },
              { id: 'today', label: 'Today' },
              { id: 'past', label: 'Completed' },
              { id: 'all', label: 'All' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => updateFilter('timeframe', tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedTimeframe === tab.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 no-scrollbar border-t border-slate-100">
          <button
            onClick={() => updateFilter('category', '')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-colors ${
              !selectedCategory
                ? 'bg-brand-600 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateFilter('category', cat.slug)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-colors ${
                selectedCategory === cat.slug
                  ? 'bg-brand-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Events Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong className="text-slate-800">{events.length}</strong> event
          {events.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Events Grid */}
      {loading ? (
        <LoadingSpinner text="Searching and loading events..." />
      ) : events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onRegister={handleRegister}
              isRegistering={registeringId === event.id}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No events match your search"
          description="Try clearing filters or search terms to see available campus events."
          actionLabel="Clear All Filters"
          onAction={() => setSearchParams({})}
        />
      )}

      {/* Ticket Pass Modal */}
      <TicketModal
        ticket={activeTicket}
        isOpen={!!activeTicket}
        onClose={() => setActiveTicket(null)}
      />
    </div>
  );
}
