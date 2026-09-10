import React from 'react';

const CATEGORY_STYLES = {
  'Electronics': 'badge-info text-info-content bg-blue-100 text-blue-800 border-blue-200',
  'ID Cards': 'badge-secondary text-secondary-content bg-purple-100 text-purple-800 border-purple-200',
  'Bags': 'badge-success text-success-content bg-emerald-100 text-emerald-800 border-emerald-200',
  'Books': 'badge-warning text-warning-content bg-amber-100 text-amber-800 border-amber-200',
  'Other': 'badge-neutral text-neutral-content bg-slate-100 text-slate-700 border-slate-200',
};

export default function CategoryBadge({ category, size = 'sm' }) {
  if (!category) return null;
  const styleClass = CATEGORY_STYLES[category] || 'badge-ghost bg-slate-100 text-slate-700 border-slate-200';
  const sizeClass = size === 'xs' ? 'badge-xs text-[10px] px-1.5' : 'badge-sm';

  return (
    <span className={`badge ${styleClass} ${sizeClass} font-semibold shrink-0`}>
      {category}
    </span>
  );
}
