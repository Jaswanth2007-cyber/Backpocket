import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorMessage({
  message = 'Unable to connect to the Lost & Found service.',
  onRetry,
  retryLabel = 'Try Again',
}) {
  return (
    <div
      role="alert"
      className="alert alert-error shadow-sm border border-error/20 flex flex-col sm:flex-row items-center justify-between p-4 gap-3 my-4"
    >
      <div className="flex items-center gap-3 text-center sm:text-left">
        <AlertCircle className="shrink-0 text-error" size={24} />
        <div>
          <h4 className="font-bold text-sm">Connection or Request Error</h4>
          <p className="text-xs opacity-90">{message}</p>
        </div>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="btn btn-sm btn-outline border-error text-error hover:bg-error hover:text-white shrink-0 gap-1.5"
        >
          <RefreshCw size={14} />
          {retryLabel}
        </button>
      )}
    </div>
  );
}
