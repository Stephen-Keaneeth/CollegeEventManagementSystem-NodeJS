import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  Shield,
  UserCheck,
  UserX,
  ArrowLeft,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { usersApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const toast = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await usersApi.getAll({
        role: roleFilter || undefined,
        search: searchTerm || undefined,
      });
      setUsers(res.data.users || []);
    } catch (err) {
      toast.error('Failed to load user accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, searchTerm]);

  const handleChangeRole = async (targetUser, newRole) => {
    if (targetUser.id === currentUser.id) {
      toast.error('You cannot change your own role.');
      return;
    }

    try {
      setUpdatingId(targetUser.id);
      await usersApi.changeRole(targetUser.id, newRole);
      toast.success(`Role for ${targetUser.name} changed to ${newRole}`);
      await fetchUsers();
    } catch (err) {
      toast.error(err.message || 'Failed to update role.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleStatus = async (targetUser) => {
    if (targetUser.id === currentUser.id) {
      toast.error('You cannot deactivate your own account.');
      return;
    }

    const nextStatus = !targetUser.is_active;
    const actionWord = nextStatus ? 'activate' : 'deactivate';

    if (!window.confirm(`Are you sure you want to ${actionWord} the account for ${targetUser.name}?`)) {
      return;
    }

    try {
      setUpdatingId(targetUser.id);
      await usersApi.toggleStatus(targetUser.id, nextStatus);
      toast.success(`User ${targetUser.name} has been ${actionWord}d.`);
      await fetchUsers();
    } catch (err) {
      toast.error(err.message || 'Failed to toggle account status.');
    } finally {
      setUpdatingId(null);
    }
  };

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
            <Users className="w-7 h-7 text-brand-600" />
            Campus User & Role Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage student registrations, event organizer privileges, and account security.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users by name, email, roll number, or department..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {['', 'student', 'organizer', 'admin'].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`flex-1 sm:flex-none px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors ${
                roleFilter === role
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {role ? role : 'All Roles'}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Loading users directory..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Department / ID</th>
                  <th className="py-3 px-4">Activity</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-right">Role Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const isSelf = u.id === currentUser.id;

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {u.avatar_url ? (
                              <img src={u.avatar_url} alt={u.name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              u.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <div>{u.name} {isSelf && <span className="text-[10px] text-brand-600 font-bold">(You)</span>}</div>
                            <div className="text-[11px] text-slate-400 font-normal">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : u.role === 'organizer'
                              ? 'bg-brand-100 text-brand-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        <div>{u.department || 'N/A'}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{u.roll_number || 'No ID'}</div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        {u.role === 'student' ? (
                          <span>{u.total_registrations || 0} registrations</span>
                        ) : (
                          <span>{u.events_organized || 0} events created</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            u.is_active
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {u.is_active ? 'Active' : 'Deactivated'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {!isSelf ? (
                          <div className="inline-flex items-center gap-2">
                            <select
                              value={u.role}
                              onChange={(e) => handleChangeRole(u, e.target.value)}
                              disabled={updatingId === u.id}
                              className="py-1 px-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none"
                            >
                              <option value="student">Student</option>
                              <option value="organizer">Organizer</option>
                              <option value="admin">Admin</option>
                            </select>

                            <button
                              onClick={() => handleToggleStatus(u)}
                              disabled={updatingId === u.id}
                              className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                u.is_active
                                  ? 'text-rose-600 hover:bg-rose-50'
                                  : 'text-emerald-600 hover:bg-emerald-50'
                              }`}
                              title={u.is_active ? 'Deactivate Account' : 'Reactivate Account'}
                            >
                              {u.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">Logged in</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
