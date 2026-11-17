import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Calendar,
  Users,
  CheckCircle2,
  Star,
  Layers,
  ArrowRight,
  Sparkles,
  Building,
  Check,
  X,
  Clock
} from 'lucide-react';
import { dashboardApi, eventsApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import CategoryDoughnut from '../../components/charts/CategoryDoughnut';
import AttendanceBarChart from '../../components/charts/AttendanceBarChart';
import CapacityUtilizationBar from '../../components/charts/CapacityUtilizationBar';

export default function AdminDashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);

  const loadAdminDashboard = async () => {
    try {
      const res = await dashboardApi.getAdminStats();
      setData(res?.data || null);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminDashboard();
  }, []);

  const handleApproveEvent = async (eventId, title) => {
    try {
      setApprovingId(eventId);
      await eventsApi.changeStatus(eventId, 'published');
      toast.success(`Event "${title}" approved and published!`);
      await loadAdminDashboard();
    } catch (err) {
      toast.error(err.message || 'Failed to approve event.');
    } finally {
      setApprovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner text="Compiling university analytics..." size="lg" />
      </div>
    );
  }

  const stats = data?.stats || {};
  const charts = data?.charts || {};
  const pendingEvents = data?.pending_events || [];
  const recentRegistrations = data?.recent_registrations || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md text-brand-300 mb-2">
            <Shield className="w-3.5 h-3.5" /> Dean & Administrator Console
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            CampusPulse Central Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Real-time analytics across all departments, event proposals, student turnouts, and campus venues.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/users"
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-200 bg-white/10 hover:bg-white/20 transition-colors"
          >
            Manage Users
          </Link>
          <Link
            to="/admin/venues"
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-md transition-colors"
          >
            Manage Venues
          </Link>
        </div>
      </div>

      {/* Primary KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Events"
          value={stats.total_events || 0}
          subtitle={`${stats.published_events || 0} published • ${stats.pending_events || 0} pending`}
          icon={Calendar}
          color="indigo"
        />
        <StatCard
          title="Registrations"
          value={stats.total_registrations || 0}
          subtitle={`Across ${stats.total_students || 0} students`}
          icon={Users}
          color="sky"
        />
        <StatCard
          title="Turnout (Present)"
          value={stats.present_count || 0}
          subtitle={`${stats.absent_count || 0} marked absent`}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Campus Rating"
          value={stats.overall_avg_rating ? `${stats.overall_avg_rating} / 5` : 'N/A'}
          subtitle={`From ${stats.total_reviews || 0} student reviews`}
          icon={Star}
          color="amber"
        />
      </div>

      {/* Visual Analytics Graphs Grid (Chart.js) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown (Doughnut) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Events by Category</h3>
            <p className="text-xs text-slate-500 mb-4">Distribution across college activities</p>
          </div>
          <CategoryDoughnut data={charts.category_distribution || []} />
        </div>

        {/* Top Events Capacity Utilization (Bar) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Registration Demand vs Capacity</h3>
            <p className="text-xs text-slate-500 mb-4">Top student-enrolled events across campus</p>
          </div>
          <CapacityUtilizationBar events={charts.top_events || []} />
        </div>
      </div>

      {/* Lower Row: Pending Event Proposals & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Approvals */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" /> Pending Event Approvals ({pendingEvents.length})
            </h3>
          </div>

          {pendingEvents.length > 0 ? (
            <div className="space-y-3">
              {pendingEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                      {ev.category_name}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm truncate mt-1">{ev.title}</h4>
                    <p className="text-xs text-slate-500">
                      By {ev.organizer_name} • {new Date(ev.start_time).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleApproveEvent(ev.id, ev.title)}
                      disabled={approvingId === ev.id}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-colors flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve
                    </button>
                    <Link
                      to={`/events/${ev.id}`}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl">
              All event proposals have been reviewed. No pending approvals!
            </div>
          )}
        </div>

        {/* Recent Registrations Log */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" /> Recent Student Signups
          </h3>

          {recentRegistrations.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {recentRegistrations.map((reg) => (
                <div key={reg.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-800">{reg.student_name}</p>
                    <p className="text-slate-500 text-[11px] truncate max-w-[200px]">{reg.event_title}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                      {reg.ticket_code}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(reg.registered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl">
              No recent registrations recorded.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
