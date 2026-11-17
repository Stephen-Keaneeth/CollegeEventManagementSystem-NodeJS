import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ text = 'Loading...', size = 'md' }) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 gap-3 text-slate-500">
      <Loader2 className={`${sizeClasses[size] || sizeClasses.md} animate-spin text-brand-600`} />
      {text && <p className="text-sm font-medium animate-pulse">{text}</p>}
    </div>
  );
}
