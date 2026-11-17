import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Calendar, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, Sparkles } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e, customEmail = null, customPassword = null) => {
    if (e) e.preventDefault();
    const loginEmail = customEmail || email;
    const loginPassword = customPassword || password;

    if (!loginEmail || !loginPassword) {
      toast.error('Please enter your email and password.');
      return;
    }

    try {
      setLoading(true);
      const user = await login(loginEmail, loginPassword);
      toast.success(`Welcome back, ${user.name}!`);

      // Determine redirect path
      if (from) {
        navigate(from, { replace: true });
      } else if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (user.role === 'organizer') {
        navigate('/organizer', { replace: true });
      } else {
        navigate('/student', { replace: true });
      }
    } catch (err) {
      toast.error(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const fillAndLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    handleSubmit(null, demoEmail, demoPassword);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden animate-slide-up">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-brand-600 to-indigo-700 p-8 text-white text-center">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-black tracking-tight">CampusPulse Portal</h2>
          <p className="text-xs text-brand-100 mt-1">Sign in with your college account credentials</p>
        </div>

        {/* Form Container */}
        <div className="p-8 space-y-6">
          {/* Quick Demo Logins Pill Bar */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" /> 1-Click Demo Accounts:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillAndLogin('student@college.edu', 'Password123!')}
                className="py-1.5 px-2 rounded-xl text-[11px] font-bold bg-white text-slate-700 border border-slate-200 shadow-2xs hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200 transition-all text-center"
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => fillAndLogin('organizer@college.edu', 'Password123!')}
                className="py-1.5 px-2 rounded-xl text-[11px] font-bold bg-white text-slate-700 border border-slate-200 shadow-2xs hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200 transition-all text-center"
              >
                Organizer
              </button>
              <button
                type="button"
                onClick={() => fillAndLogin('admin@college.edu', 'Password123!')}
                className="py-1.5 px-2 rounded-xl text-[11px] font-bold bg-white text-slate-700 border border-slate-200 shadow-2xs hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200 transition-all text-center"
              >
                Admin
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">College Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@college.edu"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/25 transition-all disabled:opacity-60 mt-2"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            New to CampusPulse?{' '}
            <Link to="/register" className="font-bold text-brand-600 hover:text-brand-700">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
