import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Star, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function EventCard({ event, onRegister, isRegistering = false }) {
  const {
    id,
    title,
    short_description,
    category_name,
    category_color = '#4F46E5',
    venue_name,
    start_time,
    max_capacity,
    current_registrations = 0,
    status,
    is_featured,
    banner_image,
    is_registered,
    avg_rating,
    feedback_count,
  } = event;

  const startDate = new Date(start_time);
  const formattedDate = startDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const formattedTime = startDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  const percentageFilled = Math.min(100, Math.round((current_registrations / max_capacity) * 100));
  const isFull = current_registrations >= max_capacity;

  const fallbackImage = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1">
      {/* Banner / Header */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
        <img
          src={banner_image || fallbackImage}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            e.target.src = fallbackImage;
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-black/20" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span
            className="px-2.5 py-1 rounded-full text-xs font-semibold text-white shadow-sm backdrop-blur-md"
            style={{ backgroundColor: category_color }}
          >
            {category_name}
          </span>

          <div className="flex items-center gap-1.5">
            {is_featured && (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-400 text-amber-950 shadow-sm flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-950" /> Featured
              </span>
            )}
            {status !== 'published' && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider ${
                status === 'completed'
                  ? 'bg-slate-800 text-slate-200'
                  : status === 'cancelled'
                  ? 'bg-rose-500 text-white'
                  : 'bg-amber-500 text-white'
              }`}>
                {status}
              </span>
            )}
          </div>
        </div>

        {/* Date Tag Floating on Bottom-Left */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2 text-white text-xs font-medium bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg">
          <Calendar className="w-3.5 h-3.5 text-brand-300" />
          <span>{formattedDate} • {formattedTime}</span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{venue_name}</span>
            </div>

            {feedback_count > 0 && (
              <div className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                <span>{avg_rating}</span>
                <span className="text-slate-400 font-normal">({feedback_count})</span>
              </div>
            )}
          </div>

          <Link to={`/events/${id}`}>
            <h3 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1 text-lg mb-1.5">
              {title}
            </h3>
          </Link>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
            {short_description}
          </p>
        </div>

        {/* Footer info: Capacity + Actions */}
        <div className="pt-3 border-t border-slate-100 flex flex-col gap-3">
          {/* Capacity Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                {current_registrations} / {max_capacity} registered
              </span>
              <span className="font-semibold text-slate-700">{percentageFilled}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
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
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-2 pt-1">
            <Link
              to={`/events/${id}`}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              Details <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {is_registered ? (
              <span className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Registered
              </span>
            ) : status === 'published' && !isFull && onRegister ? (
              <button
                onClick={() => onRegister(id)}
                disabled={isRegistering}
                className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-xl text-white bg-brand-600 hover:bg-brand-700 transition-colors shadow-sm disabled:opacity-60"
              >
                {isRegistering ? 'Registering...' : 'Register'}
              </button>
            ) : isFull ? (
              <span className="px-3 py-2 text-xs font-medium rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
                Sold Out
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
