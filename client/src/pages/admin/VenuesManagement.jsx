import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building,
  Plus,
  Users,
  MapPin,
  Trash2,
  ArrowLeft,
  X,
  Sparkles,
  Check
} from 'lucide-react';
import { venuesApi } from '../../api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function VenuesManagement() {
  const toast = useToast();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New venue form
  const [newVenue, setNewVenue] = useState({
    name: '',
    building: '',
    capacity: 200,
    facilities: 'Audio system, Projector, HVAC',
    image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
  });

  const fetchVenues = async () => {
    try {
      const res = await venuesApi.getAll();
      setVenues(res.data.venues || []);
    } catch (err) {
      toast.error('Failed to load campus venues.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  const handleCreateVenue = async (e) => {
    e.preventDefault();
    if (!newVenue.name || !newVenue.building || !newVenue.capacity) {
      toast.error('Venue name, building and capacity are required.');
      return;
    }

    try {
      setSubmitting(true);
      await venuesApi.create(newVenue);
      toast.success(`Venue "${newVenue.name}" added successfully!`);
      setShowAddModal(false);
      setNewVenue({
        name: '',
        building: '',
        capacity: 200,
        facilities: 'Audio system, Projector, HVAC',
        image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
      });
      await fetchVenues();
    } catch (err) {
      toast.error(err.message || 'Failed to create venue.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteVenue = async (venue) => {
    if (venue.total_events > 0) {
      toast.error('Cannot delete venue with active or past event records.');
      return;
    }

    if (!window.confirm(`Delete venue "${venue.name}"?`)) {
      return;
    }

    try {
      await venuesApi.delete(venue.id);
      toast.success(`Venue "${venue.name}" deleted.`);
      await fetchVenues();
    } catch (err) {
      toast.error(err.message || 'Failed to delete venue.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner text="Loading campus venue directory..." size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-brand-600 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Overview
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Building className="w-7 h-7 text-indigo-600" />
            Campus Venues & Facilities
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage auditoriums, seminar halls, computing labs, and sports arenas.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Campus Venue
        </button>
      </div>

      {/* Venues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {venues.map((venue) => (
          <div
            key={venue.id}
            className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-[16/9] w-full bg-slate-100 overflow-hidden">
                <img
                  src={venue.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'}
                  alt={venue.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-lg text-white font-mono text-xs font-bold flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-brand-300" /> {venue.capacity} Capacity
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-base font-bold text-slate-900 mb-1">{venue.name}</h3>
                <p className="text-xs text-slate-500 mb-3 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {venue.building}
                </p>

                {venue.facilities && (
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <strong className="text-slate-800">Facilities: </strong>
                    {venue.facilities}
                  </p>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                <strong>{venue.total_events || 0}</strong> events hosted
              </span>
              <button
                onClick={() => handleDeleteVenue(venue)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Delete Venue"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Venue Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-6 bg-gradient-to-r from-brand-600 to-indigo-700 text-white flex items-center justify-between">
              <h3 className="text-lg font-bold">Add Campus Venue</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVenue} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Venue Name *</label>
                <input
                  type="text"
                  required
                  value={newVenue.name}
                  onChange={(e) => setNewVenue({ ...newVenue, name: e.target.value })}
                  placeholder="e.g. Sir C.V. Raman Seminar Hall"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Building Location *</label>
                  <input
                    type="text"
                    required
                    value={newVenue.building}
                    onChange={(e) => setNewVenue({ ...newVenue, building: e.target.value })}
                    placeholder="e.g. Science Wing, 3rd Floor"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Max Seating Capacity *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newVenue.capacity}
                    onChange={(e) => setNewVenue({ ...newVenue, capacity: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">AV & Facilities</label>
                <textarea
                  rows={3}
                  value={newVenue.facilities}
                  onChange={(e) => setNewVenue({ ...newVenue, facilities: e.target.value })}
                  placeholder="Laser Projector, Dual Mics, Surround Audio, Central AC..."
                  className="w-full p-3 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all"
                >
                  {submitting ? 'Creating...' : 'Save Venue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
