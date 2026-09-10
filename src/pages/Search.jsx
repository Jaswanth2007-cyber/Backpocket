import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search as SearchIcon,
  X,
  MapPin,
  Calendar,
  PackageSearch,
  Inbox,
  ArrowRight,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import CategoryBadge from '../components/CategoryBadge';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';

const CATEGORIES = ['All', 'Electronics', 'ID Cards', 'Bags', 'Books', 'Other'];
const SEARCH_STORAGE_KEY = 'backpocket_search_filters';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Read initial values from URL params first, then localStorage fallback
  const initialQuery = () => {
    const fromUrl = searchParams.get('q');
    if (fromUrl !== null) return fromUrl;
    try {
      const saved = localStorage.getItem(SEARCH_STORAGE_KEY);
      return saved ? JSON.parse(saved).q || '' : '';
    } catch {
      return '';
    }
  };

  const initialCategory = () => {
    const fromUrl = searchParams.get('category');
    if (fromUrl !== null) return fromUrl;
    try {
      const saved = localStorage.getItem(SEARCH_STORAGE_KEY);
      return saved ? JSON.parse(saved).category || 'All' : 'All';
    } catch {
      return 'All';
    }
  };

  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Synchronize state with URL parameters and localStorage
  useEffect(() => {
    const params = {};
    if (query.trim()) params.q = query.trim();
    if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;
    setSearchParams(params, { replace: true });

    try {
      localStorage.setItem(
        SEARCH_STORAGE_KEY,
        JSON.stringify({ q: query, category: selectedCategory })
      );
    } catch (e) {
      console.warn('Unable to persist search params to localStorage', e);
    }
  }, [query, selectedCategory, setSearchParams]);

  // Fetch only "available" items from mock API
  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // json-server query for available items sorted newest-first
      const data = await api.getItems({ status: 'available', _sort: 'dateAdded', _order: 'desc' });
      const sorted = Array.isArray(data)
        ? [...data].sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
        : [];
      setItems(sorted);
    } catch (err) {
      setError(
        err.message || 'Unable to connect to the items database. Please check your connection.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Filter items client-side against query (matches description & location) and category
  const filteredItems = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    return items.filter((item) => {
      // Ensure only available items match (defense-in-depth)
      if (item.status !== 'available') return false;

      // Category filter
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }

      // Keyword match on description and location
      if (trimmed) {
        const descMatch = (item.description || '').toLowerCase().includes(trimmed);
        const locMatch = (item.location || '').toLowerCase().includes(trimmed);
        return descMatch || locMatch;
      }

      return true;
    });
  }, [items, query, selectedCategory]);

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content tracking-tight mb-1">
          Search Lost &amp; Found
        </h1>
        <p className="text-xs sm:text-sm text-base-content/60">
          Browse verified items turned into campus facilities. Filter by keyword or category.
        </p>
      </div>

      {/* Search Bar & Category Filter Chips */}
      <div className="card bg-base-100 border border-base-200 shadow-sm p-4 sm:p-5 space-y-4">
        {/* Search input with clear button */}
        <div className="relative">
          <SearchIcon
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40 pointer-events-none"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by keyword, item description, or location found..."
            className="input input-bordered w-full pl-10 pr-10 text-sm sm:text-base focus:input-primary"
            aria-label="Search items by description or location"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
              aria-label="Clear search input"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Category Filter Chips */}
        <div>
          <label className="text-xs font-semibold text-base-content/60 block mb-2 uppercase tracking-wider">
            Filter by Category
          </label>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`btn btn-xs sm:btn-sm rounded-full transition-all ${
                    isSelected
                      ? 'btn-primary font-bold shadow-xs'
                      : 'btn-ghost bg-base-200/80 hover:bg-base-200 text-base-content/80 font-normal border-transparent'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results Header / Summary */}
      {!isLoading && !error && (
        <div className="flex items-center justify-between px-1 text-xs text-base-content/60">
          <span>
            Showing <strong className="text-base-content">{filteredItems.length}</strong> available{' '}
            {filteredItems.length === 1 ? 'item' : 'items'}
          </span>
          {(query || selectedCategory !== 'All') && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSelectedCategory('All');
              }}
              className="text-primary hover:underline font-medium"
            >
              Reset filters
            </button>
          )}
        </div>
      )}

      {/* State 1: Loading Skeleton */}
      {isLoading && <LoadingSkeleton count={4} type="card" />}

      {/* State 2: Error with Retry Button */}
      {!isLoading && error && (
        <ErrorMessage message={error} onRetry={fetchItems} retryLabel="Retry Connection" />
      )}

      {/* State 3: Distinct Empty States */}
      {!isLoading && !error && items.length === 0 && (
        /* Message for zero total items ever */
        <EmptyState
          icon={Inbox}
          title="No items cataloged"
          message="Nothing reported yet — check back soon."
        />
      )}

      {!isLoading && !error && items.length > 0 && filteredItems.length === 0 && (
        /* Distinct message when filter/search combination yields zero results */
        <EmptyState
          icon={PackageSearch}
          title="No items match your search"
          message="No items match your search — try a different keyword or filter."
          action={
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSelectedCategory('All');
              }}
              className="btn btn-sm btn-outline btn-primary"
            >
              Clear Search &amp; Filters
            </button>
          }
        />
      )}

      {/* Results Grid / List */}
      {!isLoading && !error && filteredItems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => {
            // Truncate description preview to 60 characters with an ellipsis
            const previewText =
              item.description.length > 60
                ? `${item.description.slice(0, 60)}…`
                : item.description;

            const formattedDate = new Date(item.dateAdded).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/item/${item.id}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(`/item/${item.id}`);
                  }
                }}
                className="card bg-base-100 border border-base-200 hover:border-primary/40 hover:shadow-md transition-all p-4 flex flex-row gap-3.5 items-start cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary group"
              >
                {/* Photo / Thumbnail */}
                {item.photoUrl ? (
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-base-200 border border-base-200 shrink-0">
                    <img
                      src={item.photoUrl}
                      alt={item.description}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-base-200 text-base-content/40 flex items-center justify-center border border-base-200 shrink-0">
                    <ImageIcon size={26} />
                  </div>
                )}

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between h-full space-y-1.5">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      {item.category ? (
                        <CategoryBadge category={item.category} size="xs" />
                      ) : (
                        <span className="badge badge-xs badge-ghost text-base-content/50">Uncategorized</span>
                      )}
                      <span className="text-[11px] text-base-content/50 font-mono">
                        {item.id}
                      </span>
                    </div>

                    <p
                      className="text-sm font-semibold text-base-content group-hover:text-primary transition-colors leading-snug break-words"
                      title={item.description}
                    >
                      {previewText}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1 pt-1 text-xs text-base-content/60">
                    <span className="flex items-center gap-1 truncate">
                      <MapPin size={12} className="shrink-0 text-primary" />
                      <span className="truncate">{item.location}</span>
                    </span>
                    <div className="flex items-center justify-between text-[11px] text-base-content/50">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} className="shrink-0" />
                        <span>{formattedDate}</span>
                      </span>
                      <span className="flex items-center gap-0.5 text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Details</span>
                        <ArrowRight size={11} />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
