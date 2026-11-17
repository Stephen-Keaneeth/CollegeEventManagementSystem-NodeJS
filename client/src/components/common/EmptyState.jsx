import React from 'react';
import { CalendarX } from 'lucide-react';

export default function EmptyState({
  icon: Icon = CalendarX,
  title = 'No items found',
  description = 'There are no records matching your current filter criteria.',
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 my-4">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-brand-600 hover:bg-brand-700 transition-colors shadow-sm"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
