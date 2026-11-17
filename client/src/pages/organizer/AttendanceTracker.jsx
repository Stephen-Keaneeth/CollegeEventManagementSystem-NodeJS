import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ClipboardCheck,
  Search,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  Users,
  Sparkles,
  FileSpreadsheet
} from 'lucide-react';
import { attendanceApi } from '../../api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AttendanceTracker() {
  const { eventId } = useParams();
  const toast = useToast();

  const [eventData, setEventData] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [isBulkMarking, setIsBulkMarking] = useState(false);

  const fetchAttendanceSheet = async () => {
    try {
      const res = await attendanceApi.getEventAttendance(eventId);
      setEventData({ id: res.data.event_id, title: res.data.event_title });
      setAttendees(res.data.attendees || []);
      setSummary(res.data.summary || {});
    } catch (err) {
      toast.error('Failed to load attendance sheet.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceSheet();
  }, [eventId]);

  const handleMarkStatus = async (registrationId, status) => {
    try {
      setUpdatingId(registrationId);
      await attendanceApi.markSingle(registrationId, status);
      toast.success(`Marked as ${status}`);

      // Optimistic update
      setAttendees((prev) =>
        prev.map((a) =>
          a.registration_id === registrationId
            ? { ...a, attendance_status: status, marked_at: new Date().toISOString() }
            : a
        )
      );

      // Re-fetch summary stats
      const res = await attendanceApi.getEventAttendance(eventId);
      setSummary(res.data.summary || {});
    } catch (err) {
      toast.error(err.message || 'Failed to update attendance.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleBulkMarkPresent = async () => {
    const unmarkedOrAbsent = attendees
      .filter((a) => a.attendance_status !== 'present')
      .map((a) => a.registration_id);

    if (unmarkedOrAbsent.length === 0) {
      toast.info('All attendees are already marked present.');
      return;
    }

    if (!window.confirm(`Mark all ${unmarkedOrAbsent.length} remaining registered attendees as Present?`)) {
      return;
    }

    try {
      setIsBulkMarking(true);
      await attendanceApi.bulkMark(eventId, unmarkedOrAbsent, 'present');
      toast.success(`Successfully marked ${unmarkedOrAbsent.length} students as Present!`);
      await fetchAttendanceSheet();
    } catch (err) {
      toast.error(err.message || 'Bulk mark failed.');
    } finally {
      setIsBulkMarking(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      const res = await attendanceApi.exportCsv(eventId);
      const records = res.data.records || [];

      // Convert to CSV string
      const headers = ['Ticket Code', 'Student Name', 'Email', 'Roll Number', 'Department', 'Phone', 'Registration Date', 'Attendance Status', 'Checked-In Timestamp'];
      const rows = records.map((r) => [
        `"${r.ticket_code}"`,
        `"${r.student_name}"`,
        `"${r.email}"`,
        `"${r.roll_number || ''}"`,
        `"${r.department || ''}"`,
        `"${r.phone || ''}"`,
        `"${r.registered_at}"`,
        `"${r.attendance_status}"`,
        `"${r.marked_at || ''}"`,
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Attendance_${eventData?.title?.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Attendance CSV downloaded!');
    } catch (err) {
      toast.error('Failed to export CSV report.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner text="Loading event attendance registry..." size="lg" />
      </div>
    );
  }

  const filteredAttendees = attendees.filter((a) => {
    const q = searchTerm.toLowerCase();
    return (
      a.student_name.toLowerCase().includes(q) ||
      a.student_email.toLowerCase().includes(q) ||
      (a.roll_number && a.roll_number.toLowerCase().includes(q)) ||
      (a.ticket_code && a.ticket_code.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/organizer"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-brand-600 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Organizer Portal
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <ClipboardCheck className="w-7 h-7 text-brand-600" />
            Live Attendance Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Event: <strong className="text-slate-800">{eventData?.title}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleBulkMarkPresent}
            disabled={isBulkMarking || attendees.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-colors disabled:opacity-60"
          >
            <CheckCircle2 className="w-4 h-4" /> Mark All Present
          </button>
          <button
            onClick={handleExportCsv}
            disabled={attendees.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-sm transition-colors disabled:opacity-60"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Export CSV
          </button>
        </div>
      </div>

      {/* Summary Stat Pills */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Total Registered</span>
          <span className="text-2xl font-black text-slate-900">{summary.total_registered || 0}</span>
          <span className="text-[11px] text-slate-500 block mt-1">Confirmed signups</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200/80 shadow-xs bg-emerald-50/20">
          <span className="text-xs font-semibold text-emerald-700 block mb-1">Checked In (Present)</span>
          <span className="text-2xl font-black text-emerald-600">{summary.present_count || 0}</span>
          <span className="text-[11px] font-semibold text-emerald-700 block mt-1">
            {summary.attendance_rate || 0}% turnout
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-200/80 shadow-xs bg-rose-50/20">
          <span className="text-xs font-semibold text-rose-700 block mb-1">Marked Absent</span>
          <span className="text-2xl font-black text-rose-600">{summary.absent_count || 0}</span>
          <span className="text-[11px] text-rose-600 block mt-1">Did not check in</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Unmarked</span>
          <span className="text-2xl font-black text-amber-600">{summary.unmarked_count || 0}</span>
          <span className="text-[11px] text-slate-500 block mt-1">Awaiting check-in</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter attendees by student name, roll number, email, or ticket code..."
          className="w-full text-xs sm:text-sm bg-transparent border-none focus:outline-none text-slate-800 placeholder:text-slate-400"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 px-2"
          >
            Clear
          </button>
        )}
      </div>

      {/* Attendees Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Roll Number</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Ticket Code</th>
                <th className="py-3 px-4">Check-In Status</th>
                <th className="py-3 px-4 text-right">Quick Mark Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAttendees.length > 0 ? (
                filteredAttendees.map((att) => {
                  const isPresent = att.attendance_status === 'present';
                  const isAbsent = att.attendance_status === 'absent';
                  const isBusy = updatingId === att.registration_id;

                  return (
                    <tr key={att.registration_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        <div>{att.student_name}</div>
                        <div className="text-[11px] text-slate-400 font-normal">{att.student_email}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700">{att.roll_number || 'N/A'}</td>
                      <td className="py-3.5 px-4 text-slate-600">{att.department || 'N/A'}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700 bg-slate-50/50">
                        {att.ticket_code}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isPresent
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : isAbsent
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {isPresent ? 'Present' : isAbsent ? 'Absent' : 'Unmarked'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleMarkStatus(att.registration_id, 'present')}
                            disabled={isBusy || isPresent}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              isPresent
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            onClick={() => handleMarkStatus(att.registration_id, 'absent')}
                            disabled={isBusy || isAbsent}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              isAbsent
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-700'
                            }`}
                          >
                            Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-xs text-slate-400">
                    No matching attendees found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
