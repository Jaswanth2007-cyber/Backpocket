import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Building,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../services/api';
import CategoryBadge from '../components/CategoryBadge';
import ErrorMessage from '../components/ErrorMessage';

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isNotAvailable, setIsNotAvailable] = useState(false);

  const fetchItem = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setIsNotAvailable(false);

    try {
      const data = await api.getItem(id);

      // Rule: If item doesn't exist OR item's status is "collected", show "Item not found or already collected"
      if (!data || data.status === 'collected') {
        setIsNotAvailable(true);
        setItem(null);
      } else {
        setItem(data);
      }
    } catch (err) {
      // 404 or connection error
      if (err.message && err.message.includes('404')) {
        setIsNotAvailable(true);
      } else {
        setError(err.message || 'Failed to fetch item details.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  return (
    <div className="max-w-2xl mx-auto py-4 sm:py-8 space-y-6">
      {/* Back button */}
      <div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn btn-ghost btn-sm gap-1.5 text-base-content/70 hover:text-base-content"
        >
          <ArrowLeft size={16} />
          <span>Back to Results</span>
        </button>
      </div>

      {/* State 1: Loading Skeleton */}
      {isLoading && (
        <div className="card bg-base-100 border border-base-200 p-6 space-y-4">
          <div className="skeleton h-64 w-full rounded-xl" />
          <div className="skeleton h-6 w-1/3 rounded" />
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-4 w-5/6 rounded" />
          <div className="skeleton h-4 w-1/2 rounded" />
        </div>
      )}

      {/* State 2: Error State */}
      {!isLoading && error && (
        <ErrorMessage
          message={error}
          onRetry={fetchItem}
          retryLabel="Retry Loading Item"
        />
      )}

      {/* State 3: Not Found or Already Collected (Prompt 7) */}
      {!isLoading && !error && isNotAvailable && (
        <div className="card bg-base-100 border border-dashed border-base-300 p-8 sm:p-12 text-center shadow-sm">
          <div className="w-14 h-14 rounded-full bg-warning/15 text-warning mx-auto flex items-center justify-center mb-4">
            <AlertCircle size={28} />
          </div>
          <h2 className="text-xl font-bold text-base-content mb-2">
            Item not found or already collected
          </h2>
          <p className="text-sm text-base-content/70 max-w-md mx-auto mb-6 leading-relaxed">
            This item may have already been safely claimed by its owner, removed from campus storage, or the item ID does not exist.
          </p>
          <div className="flex justify-center gap-3">
            <Link to="/search" className="btn btn-primary btn-sm gap-1.5">
              <span>Browse Active Items</span>
            </Link>
          </div>
        </div>
      )}

      {/* State 4: Item Found & Displayed */}
      {!isLoading && !error && item && (
        <div className="card bg-base-100 border border-base-200 shadow-md overflow-hidden">
          {/* Item Photo if present - strictly reserves aspect ratio to prevent CLS */}
          {item.photoUrl ? (
            <div className="w-full aspect-[16/9] sm:aspect-[2/1] max-h-96 bg-base-200 overflow-hidden flex items-center justify-center border-b border-base-200">
              <img
                src={item.photoUrl}
                alt={item.description}
                className="w-full h-full object-contain"
                loading="eager"
              />
            </div>
          ) : (
            <div className="w-full aspect-[16/9] sm:aspect-[2/1] max-h-48 bg-base-200/50 flex flex-col items-center justify-center text-base-content/40 border-b border-base-200">
              <ImageIcon size={40} strokeWidth={1.5} className="mb-1" />
              <span className="text-xs">No photograph provided</span>
            </div>
          )}

          <div className="p-6 sm:p-8 space-y-6">
            {/* Header / Badges */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-base-200 pb-4">
              <div className="flex items-center gap-2">
                {item.category && <CategoryBadge category={item.category} size="sm" />}
                <span className="badge badge-outline text-xs font-mono text-base-content/60">
                  ID: {item.id}
                </span>
              </div>
              <span className="badge badge-success badge-sm gap-1 text-white font-semibold">
                <CheckCircle2 size={12} />
                Available to Claim
              </span>
            </div>

            {/* Description (Full, non-truncated, wraps gracefully for 400+ characters) */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-2">
                Item Description
              </h2>
              <p
                className="text-base sm:text-lg text-base-content leading-relaxed whitespace-pre-wrap break-words max-h-[480px] overflow-y-auto"
                dir="auto"
                style={{ wordBreak: 'break-word' }}
              >
                {item.description}
              </p>
            </div>

            {/* Meta Grid: Location & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-base-200/50 p-4 rounded-xl border border-base-200">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin size={16} />
                </div>
                <div>
                  <span className="text-xs text-base-content/60 block font-medium">Found At Location</span>
                  <span className="text-sm font-semibold text-base-content break-words" dir="auto">{item.location}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <Calendar size={16} />
                </div>
                <div>
                  <span className="text-xs text-base-content/60 block font-medium">Date &amp; Time Logged</span>
                  <span className="text-sm font-semibold text-base-content">
                    {new Date(item.dateAdded).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* In-Person Collection Notice (Prompt 7 exact requirement) */}
            <div className="alert bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
              <Building size={20} className="text-primary shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-base-content/80 leading-relaxed">
                <p className="font-bold text-base-content mb-0.5">Found this item? Visit the office to collect it.</p>
                <p className="text-base-content/70">
                  Please bring your Student ID or a government-issued photo ID to the Central Campus Security &amp; Information Desk (Student Union, Rm 101, Mon–Fri 8am–6pm) to claim this item.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
