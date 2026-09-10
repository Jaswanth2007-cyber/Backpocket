import React from 'react';

export default function LoadingSkeleton({ count = 3, type = 'card' }) {
  return (
    <div className="flex flex-col gap-4 w-full" aria-busy="true" aria-label="Loading items">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="card bg-base-100 border border-base-200 shadow-sm p-4 flex flex-row items-center gap-4"
        >
          {type === 'card' && (
            <div className="skeleton w-20 h-20 rounded-lg shrink-0" />
          )}
          <div className="flex flex-col gap-2.5 flex-1">
            <div className="skeleton h-5 w-2/5 rounded" />
            <div className="skeleton h-4 w-4/5 rounded" />
            <div className="skeleton h-3.5 w-1/4 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
