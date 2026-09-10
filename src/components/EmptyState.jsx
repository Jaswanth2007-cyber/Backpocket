import React from 'react';
import { PackageSearch } from 'lucide-react';

export default function EmptyState({
  title = 'No items found',
  message = 'Nothing reported yet — check back soon.',
  action,
  icon: Icon = PackageSearch,
}) {
  return (
    <div className="card bg-base-100 border border-dashed border-base-300 p-8 sm:p-12 text-center my-6 flex flex-col items-center justify-center shadow-sm">
      <div className="w-14 h-14 rounded-full bg-base-200 text-base-content/60 flex items-center justify-center mb-3">
        <Icon size={28} strokeWidth={1.75} />
      </div>
      <h3 className="text-lg font-bold text-base-content mb-1">{title}</h3>
      <p className="text-sm text-base-content/70 max-w-sm mb-4 leading-relaxed">{message}</p>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
