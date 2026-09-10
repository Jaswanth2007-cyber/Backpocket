import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  PlusCircle,
  Package,
  CheckCircle,
  Trash2,
  AlertTriangle,
  Upload,
  Image as ImageIcon,
  X,
  RefreshCw,
  Clock,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import { compressImage } from '../utils/imageCompressor';
import CategoryBadge from '../components/CategoryBadge';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { suggestCategoryFromImage } from '../services/autoTagger';

const CATEGORIES = ['Electronics', 'ID Cards', 'Bags', 'Books', 'Other'];
const DRAFT_STORAGE_KEY = 'backpocket_staff_item_draft';

export default function StaffDashboard() {
  // Form State (restored from sessionStorage for mid-flow refresh resilience)
  const [description, setDescription] = useState(() => {
    try {
      const saved = sessionStorage.getItem(DRAFT_STORAGE_KEY);
      return saved ? JSON.parse(saved).description || '' : '';
    } catch {
      return '';
    }
  });

  const [location, setLocation] = useState(() => {
    try {
      const saved = sessionStorage.getItem(DRAFT_STORAGE_KEY);
      return saved ? JSON.parse(saved).location || '' : '';
    } catch {
      return '';
    }
  });

  const [category, setCategory] = useState(() => {
    try {
      const saved = sessionStorage.getItem(DRAFT_STORAGE_KEY);
      return saved ? JSON.parse(saved).category || '' : '';
    } catch {
      return '';
    }
  });

  const [photoUrl, setPhotoUrl] = useState(() => {
    try {
      const saved = sessionStorage.getItem(DRAFT_STORAGE_KEY);
      return saved ? JSON.parse(saved).photoUrl || '' : '';
    } catch {
      return '';
    }
  });

  const [photoFileName, setPhotoFileName] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [aiTagStatus, setAiTagStatus] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  // Active items list state
  const [items, setItems] = useState([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [itemsError, setItemsError] = useState(null);

  // Deletion modal state
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Action in-flight tracker for individual items (collected/deleting)
  const [updatingId, setUpdatingId] = useState(null);

  const fileInputRef = useRef(null);

  // Save form draft to sessionStorage whenever fields change
  useEffect(() => {
    try {
      sessionStorage.setItem(
        DRAFT_STORAGE_KEY,
        JSON.stringify({ description, location, category, photoUrl })
      );
    } catch (e) {
      console.warn('Unable to persist draft to sessionStorage', e);
    }
  }, [description, location, category, photoUrl]);

  // Fetch active items (status === 'available') sorted newest-first
  const fetchActiveItems = useCallback(async () => {
    setIsLoadingItems(true);
    setItemsError(null);
    try {
      // json-server allows sorting: _sort=dateAdded&_order=desc
      const data = await api.getItems({ status: 'available', _sort: 'dateAdded', _order: 'desc' });
      // Extra client-side sort fallback just in case json-server sorting params differ
      const sorted = Array.isArray(data)
        ? [...data].sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
        : [];
      setItems(sorted);
    } catch (err) {
      setItemsError(err.message || 'Failed to load active items. Please verify the mock API is running.');
    } finally {
      setIsLoadingItems(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveItems();
  }, [fetchActiveItems]);

  // Handle Photo selection & client-side compression + non-blocking auto-tagging
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoFileName(file.name);
    setIsCompressing(true);
    setAiTagStatus({ loading: true });
    try {
      const compressedData = await compressImage(file);
      setPhotoUrl(compressedData);
      setIsCompressing(false);

      // Non-blocking auto-tag suggestion (Prompt 10: never blocks or breaks form)
      suggestCategoryFromImage(compressedData, file.name)
        .then((res) => {
          if (res && res.success) {
            setAiTagStatus({
              loading: false,
              success: true,
              category: res.suggestedCategory,
              label: res.rawLabel,
            });
            // Pre-fill (but don't lock) the category dropdown so staff can override it
            setCategory(res.suggestedCategory);
          } else {
            setAiTagStatus({
              loading: false,
              failed: true,
              reason: res?.reason || 'Tag suggestion unavailable',
            });
          }
        })
        .catch(() => {
          setAiTagStatus({
            loading: false,
            failed: true,
            reason: 'Tag suggestion unavailable',
          });
        });
    } catch (err) {
      alert(`Image processing failed: ${err.message}`);
      setIsCompressing(false);
      setAiTagStatus(null);
    }
  };

  const removePhoto = () => {
    setPhotoUrl('');
    setPhotoFileName('');
    setAiTagStatus(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Form Validation
  const validateForm = () => {
    const errors = {};
    if (!description.trim()) {
      errors.description = 'Description is required';
    }
    if (!location.trim()) {
      errors.location = 'Location found is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const lastSubmitTimeRef = useRef(0);

  // Submit Handler with flight state & duplicate submission guard
  const handleSubmit = async (e) => {
    e.preventDefault();

    const now = Date.now();
    // Guard against rapid duplicate clicks (both state and timestamp debounce)
    if (isSubmitting || isCompressing || (now - lastSubmitTimeRef.current < 1200)) {
      return;
    }
    lastSubmitTimeRef.current = now;

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const newItem = {
      id: `item-${Date.now()}`,
      description: description.trim(),
      location: location.trim(),
      category: category || undefined,
      photoUrl: photoUrl || undefined,
      dateAdded: new Date().toISOString(),
      status: 'available',
    };

    try {
      const created = await api.createItem(newItem);
      setSubmitSuccess(created || newItem);

      // Clear form inputs and draft storage
      setDescription('');
      setLocation('');
      setCategory('');
      setPhotoUrl('');
      setPhotoFileName('');
      setFormErrors({});
      try {
        sessionStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch (e) {
        console.warn(e);
      }

      // Refresh items list smoothly without full page reload
      fetchActiveItems();
    } catch (err) {
      setSubmitError(
        err.message || 'Failed to submit item to server. Please verify your connection.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mark Item Collected
  const handleMarkCollected = async (item) => {
    if (updatingId) return;
    setUpdatingId(item.id);
    try {
      await api.updateItem(item.id, { status: 'collected' });
      // Remove from active available list immediately
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (err) {
      alert(`Failed to update item: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  // Confirm Delete
  const confirmDelete = async () => {
    if (!itemToDelete || isDeleting) return;
    setIsDeleting(true);
    try {
      await api.deleteItem(itemToDelete.id);
      setItems((prev) => prev.filter((i) => i.id !== itemToDelete.id));
      setItemToDelete(null);
    } catch (err) {
      alert(`Failed to delete item: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-base-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content tracking-tight">
            Staff Management Console
          </h1>
          <p className="text-xs sm:text-sm text-base-content/60">
            Log newly turned-in property and maintain inventory of uncollected items.
          </p>
        </div>
        <div className="badge badge-primary badge-outline font-semibold gap-1 self-start sm:self-auto">
          Authorized Staff Session
        </div>
      </div>

      {/* Part 1: Add Found Item Form / Success View */}
      <div className="card bg-base-100 border border-base-200 shadow-md overflow-hidden">
        <div className="bg-primary/5 px-6 py-4 border-b border-base-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-base-content flex items-center gap-2">
            <PlusCircle size={20} className="text-primary" />
            <span>Add Found Item</span>
          </h2>
          <span className="text-xs text-base-content/50">* marks required fields</span>
        </div>

        <div className="p-6">
          {submitSuccess ? (
            /* Distinct Success State (Prompt 4: not just a toast, an actual success screen or clear state) */
            <div className="text-center py-6 px-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-success/10 text-success mx-auto flex items-center justify-center border border-success/20">
                <CheckCircle size={36} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-base-content">Item Successfully Logged!</h3>
                <p className="text-sm text-base-content/70 max-w-md mx-auto mt-1">
                  The item has been cataloged as <span className="font-semibold text-success">available</span> and is immediately discoverable on public search.
                </p>
              </div>

              <div className="bg-base-200/60 p-4 rounded-xl max-w-md mx-auto text-left text-xs space-y-1.5 border border-base-200">
                <p><span className="font-semibold text-base-content/70">ID:</span> <code className="font-mono">{submitSuccess.id}</code></p>
                <p><span className="font-semibold text-base-content/70">Location:</span> {submitSuccess.location}</p>
                <p className="break-words line-clamp-2"><span className="font-semibold text-base-content/70">Description:</span> {submitSuccess.description}</p>
                {submitSuccess.category && (
                  <p><span className="font-semibold text-base-content/70">Category:</span> {submitSuccess.category}</p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setSubmitSuccess(null)}
                  className="btn btn-primary gap-2 shadow-sm font-semibold"
                >
                  <PlusCircle size={16} />
                  <span>Log Another Found Item</span>
                </button>
              </div>
            </div>
          ) : (
            /* Add Item Form */
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {submitError && (
                <ErrorMessage
                  message={submitError}
                  onRetry={handleSubmit}
                  retryLabel="Retry Submission"
                />
              )}

              {/* Draft auto-save indicator (Prompt 8 Scenario 2) */}
              {(description || location || photoUrl) && (
                <div className="flex items-center justify-between text-xs bg-base-200/80 px-3 py-2 rounded-lg border border-base-300">
                  <span className="text-base-content/70 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    Draft auto-saved in browser
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setDescription('');
                      setLocation('');
                      setCategory('');
                      setPhotoUrl('');
                      setPhotoFileName('');
                      setFormErrors({});
                      try {
                        sessionStorage.removeItem(DRAFT_STORAGE_KEY);
                      } catch (e) {
                        console.warn(e);
                      }
                    }}
                    className="text-error hover:underline font-semibold"
                  >
                    Clear Draft
                  </button>
                </div>
              )}

              {/* Location (required) */}
              <div className="form-control w-full">
                <label className="label pb-1" htmlFor="itemLocation">
                  <span className="label-text font-semibold text-sm">
                    Location Found <span className="text-error">*</span>
                  </span>
                </label>
                <input
                  id="itemLocation"
                  type="text"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    if (formErrors.location) {
                      setFormErrors((prev) => ({ ...prev, location: undefined }));
                    }
                  }}
                  placeholder="e.g. Science Building Rm 204 or Student Union Bench"
                  className={`input input-bordered w-full text-sm ${
                    formErrors.location ? 'input-error ring-1 ring-error' : 'focus:input-primary'
                  }`}
                  disabled={isSubmitting}
                  required
                />
                {formErrors.location && (
                  <label className="label pt-1">
                    <span className="label-text-alt text-error font-medium">{formErrors.location}</span>
                  </label>
                )}
              </div>

              {/* Description (required, handles 400+ characters gracefully) */}
              <div className="form-control w-full">
                <div className="flex justify-between items-center pb-1">
                  <label className="label-text font-semibold text-sm" htmlFor="itemDescription">
                    Description <span className="text-error">*</span>
                  </label>
                  <span className={`text-[11px] font-mono ${description.length > 400 ? 'text-warning font-bold' : 'text-base-content/50'}`}>
                    {description.length} chars
                  </span>
                </div>
                <textarea
                  id="itemDescription"
                  rows={3}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (formErrors.description) {
                      setFormErrors((prev) => ({ ...prev, description: undefined }));
                    }
                  }}
                  placeholder="Provide distinct details: color, brand, stickers, identifiable markings, contents..."
                  className={`textarea textarea-bordered w-full text-sm leading-relaxed ${
                    formErrors.description ? 'textarea-error ring-1 ring-error' : 'focus:textarea-primary'
                  }`}
                  style={{ wordBreak: 'break-word' }}
                  disabled={isSubmitting}
                  required
                />
                {formErrors.description && (
                  <label className="label pt-1">
                    <span className="label-text-alt text-error font-medium">{formErrors.description}</span>
                  </label>
                )}
                {description.length > 400 && (
                  <label className="label pt-0.5">
                    <span className="label-text-alt text-base-content/60 text-[11px]">
                      Note: Long descriptions wrap gracefully across card views and search previews.
                    </span>
                  </label>
                )}
              </div>

              {/* Category & Photo row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category Dropdown (optional) */}
                <div className="form-control w-full">
                  <label className="label pb-1" htmlFor="itemCategory">
                    <span className="label-text font-semibold text-sm flex items-center justify-between w-full">
                      <span>Category (optional)</span>
                      {aiTagStatus?.loading && (
                        <span className="text-[11px] text-primary flex items-center gap-1 font-normal">
                          <span className="loading loading-spinner loading-xs" />
                          Analyzing photo...
                        </span>
                      )}
                    </span>
                  </label>
                  <select
                    id="itemCategory"
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      if (aiTagStatus?.success) {
                        setAiTagStatus(null);
                      }
                    }}
                    className="select select-bordered w-full text-sm focus:select-primary"
                    disabled={isSubmitting}
                  >
                    <option value="">Select a category...</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>

                  {/* Non-blocking Auto-Tag feedback (Prompt 10) */}
                  {aiTagStatus?.success && (
                    <label className="label pt-1">
                      <span className="label-text-alt text-success font-medium flex items-center gap-1">
                        <Sparkles size={12} className="shrink-0" />
                        AI suggested: "{aiTagStatus.category}" (override anytime)
                      </span>
                    </label>
                  )}
                  {aiTagStatus?.failed && (
                    <label className="label pt-1">
                      <span className="label-text-alt text-base-content/40 text-[11px]">
                        Tag suggestion unavailable (optional)
                      </span>
                    </label>
                  )}
                </div>

                {/* Photo Upload with Client-Side Compression */}
                <div className="form-control w-full">
                  <label className="label pb-1">
                    <span className="label-text font-semibold text-sm flex items-center justify-between w-full">
                      <span>Photo (optional)</span>
                      <span className="text-[11px] font-normal text-base-content/50">Auto-compressed &lt;1MB</span>
                    </span>
                  </label>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
                    accept="image/*"
                    className="hidden"
                    id="photoUploadInput"
                    disabled={isSubmitting || isCompressing}
                  />

                  {photoUrl ? (
                    <div className="flex items-center gap-3 p-2 bg-base-200 rounded-lg border border-base-300">
                      <img
                        src={photoUrl}
                        alt="Upload preview"
                        className="w-12 h-12 rounded object-cover border border-base-300 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate text-base-content">
                          {photoFileName || 'Image attached'}
                        </p>
                        <p className="text-[10px] text-success font-semibold flex items-center gap-1">
                          <CheckCircle size={10} /> Compressed &amp; Ready
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="btn btn-ghost btn-xs btn-circle text-error"
                        title="Remove photo"
                        aria-label="Remove photo"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor="photoUploadInput"
                      className={`btn btn-outline border-base-300 hover:border-primary w-full gap-2 text-xs font-semibold justify-center h-11 ${
                        isCompressing ? 'loading' : ''
                      }`}
                    >
                      {isCompressing ? (
                        <span>Optimizing image...</span>
                      ) : (
                        <>
                          <Upload size={14} />
                          <span>Choose or capture photo</span>
                        </>
                      )}
                    </label>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || isCompressing}
                  className="btn btn-primary w-full sm:w-auto px-8 gap-2 font-bold shadow-sm"
                >
                  {isSubmitting ? (
                    <>
                      <span className="loading loading-spinner loading-sm" />
                      <span>Submitting to Database...</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle size={16} />
                      <span>Save &amp; Publish Item</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Part 2: Active Items List & Management */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Package size={20} className="text-primary" />
            <h2 className="text-lg sm:text-xl font-bold text-base-content">
              Active Inventory
            </h2>
            {!isLoadingItems && !itemsError && (
              <span className="badge badge-neutral text-xs font-semibold">
                {items.length} {items.length === 1 ? 'item' : 'items'} currently listed
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={fetchActiveItems}
            disabled={isLoadingItems}
            className="btn btn-ghost btn-sm gap-1.5 self-start sm:self-auto text-xs"
            title="Refresh list from mock API"
          >
            <RefreshCw size={13} className={isLoadingItems ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {/* State 1: Loading Skeleton */}
        {isLoadingItems && <LoadingSkeleton count={3} type="card" />}

        {/* State 2: Error with Retry Button */}
        {!isLoadingItems && itemsError && (
          <ErrorMessage
            message={itemsError}
            onRetry={fetchActiveItems}
            retryLabel="Retry Loading Inventory"
          />
        )}

        {/* State 3: Empty State */}
        {!isLoadingItems && !itemsError && items.length === 0 && (
          <EmptyState
            title="Nothing reported yet"
            message="Nothing reported yet."
          />
        )}

        {/* List of Active Items */}
        {!isLoadingItems && !itemsError && items.length > 0 && (
          <div className="space-y-3">
            {items.map((item) => {
              const formattedDate = new Date(item.dateAdded).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={item.id}
                  className="card bg-base-100 border border-base-200 shadow-xs hover:shadow-sm transition-shadow p-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center"
                >
                  {/* Item Details */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {item.photoUrl ? (
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-base-200 border border-base-200 shrink-0">
                        <img
                          src={item.photoUrl}
                          alt={item.description}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-base-200 text-base-content/40 flex items-center justify-center border border-base-200 shrink-0">
                        <ImageIcon size={22} />
                      </div>
                    )}

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {item.category && <CategoryBadge category={item.category} size="xs" />}
                        <span className="badge badge-xs badge-outline text-[10px] text-base-content/60 font-mono">
                          {item.id}
                        </span>
                      </div>

                      <p
                        className="text-sm font-semibold text-base-content leading-snug break-words"
                        style={{ wordBreak: 'break-word' }}
                      >
                        {item.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-base-content/60 pt-0.5">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} className="shrink-0 text-primary" />
                          <span className="truncate">{item.location}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} className="shrink-0" />
                          <span>{formattedDate}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions (Mark Collected & Delete) */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-base-200 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleMarkCollected(item)}
                      disabled={updatingId === item.id}
                      className="btn btn-sm btn-outline btn-success gap-1.5 flex-1 sm:flex-initial"
                      title="Mark item as collected by owner"
                    >
                      {updatingId === item.id ? (
                        <span className="loading loading-spinner loading-xs" />
                      ) : (
                        <CheckCircle size={14} />
                      )}
                      <span>Mark Collected</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setItemToDelete(item)}
                      disabled={updatingId === item.id}
                      className="btn btn-sm btn-ghost text-error hover:bg-error/10 gap-1.5"
                      title="Permanently delete item"
                    >
                      <Trash2 size={14} />
                      <span className="sm:hidden">Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Modal for Delete (Prompt 5: no accidental deletes) */}
      {itemToDelete && (
        <div className="modal modal-open bg-black/50 backdrop-blur-xs" role="dialog" aria-modal="true">
          <div className="modal-box max-w-md bg-base-100 border border-base-200 shadow-2xl">
            <div className="flex items-center gap-3 text-error mb-3">
              <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center">
                <AlertTriangle size={20} />
              </div>
              <h3 className="font-bold text-lg text-base-content">Delete Item?</h3>
            </div>
            <p className="text-sm text-base-content/75 mb-3 leading-relaxed">
              Are you sure you want to permanently delete this item? This action cannot be undone.
            </p>
            <div className="bg-base-200 p-3 rounded-lg text-xs space-y-1 mb-6 border border-base-300">
              <p className="font-semibold text-base-content line-clamp-2">{itemToDelete.description}</p>
              <p className="text-base-content/60">Location: {itemToDelete.location}</p>
            </div>
            <div className="modal-action flex justify-end gap-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setItemToDelete(null)}
                className="btn btn-sm btn-ghost"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDelete}
                className="btn btn-sm btn-error text-white gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <span className="loading loading-spinner loading-xs" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
