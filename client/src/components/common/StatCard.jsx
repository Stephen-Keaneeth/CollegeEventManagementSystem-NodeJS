import React from 'react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'indigo',
}) {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      badge: 'text-indigo-700 bg-indigo-50',
    },
    emerald: {
      bg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      badge: 'text-emerald-700 bg-emerald-50',
    },
    amber: {
      bg: 'bg-amber-50 text-amber-600 border-amber-100',
      badge: 'text-amber-700 bg-amber-50',
    },
    rose: {
      bg: 'bg-rose-50 text-rose-600 border-rose-100',
      badge: 'text-rose-700 bg-rose-50',
    },
    sky: {
      bg: 'bg-sky-50 text-sky-600 border-sky-100',
      badge: 'text-sky-700 bg-sky-50',
    },
    purple: {
      bg: 'bg-purple-50 text-purple-600 border-purple-100',
      badge: 'text-purple-700 bg-purple-50',
    },
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl border ${scheme.bg}`}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{subtitle}</span>
          {trend && (
            <span className={`font-semibold px-2 py-0.5 rounded-full ${scheme.badge}`}>
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
