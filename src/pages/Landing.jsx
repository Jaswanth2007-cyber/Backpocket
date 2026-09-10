import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Shield, HelpCircle, CheckCircle2, Clock, MapPin, Sparkles } from 'lucide-react';

export default function Landing() {
  return (
    <div className="max-w-2xl mx-auto py-4 sm:py-10 px-1">
      {/* Hero Card with subtle college watermark placeholder in the card itself */}
      <div className="card bg-base-100/95 backdrop-blur-md border border-base-200 shadow-md p-6 sm:p-10 text-center relative overflow-hidden">
        {/* Subtle gray monogram/crest placeholder shape in background */}
        <div
          className="absolute -right-12 -bottom-12 opacity-[0.06] text-base-content pointer-events-none select-none"
          aria-hidden="true"
        >
          <svg width="260" height="260" viewBox="0 0 200 200" fill="currentColor">
            <path d="M100 10 L170 40 V100 C170 150 100 190 100 190 C100 190 30 150 30 100 V40 L100 10 Z" />
          </svg>
        </div>

        {/* Central Logo / Monogram Icon */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-sm transition-transform hover:scale-105">
          <HelpCircle size={32} />
        </div>

        {/* App name / Title */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3 border border-primary/20">
          <Sparkles size={12} />
          <span>Backpocket Campus Registry</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-base-content tracking-tight mb-3">
          Campus Lost &amp; Found
        </h1>

        {/* Short one-line description of what the app does */}
        <p className="text-sm sm:text-base text-base-content/75 mb-8 max-w-md mx-auto leading-relaxed">
          Report, search, and reclaim lost personal items safely across student halls, libraries, and campus buildings.
        </p>

        {/* Two clear entry points: Find an Item (/search) & Staff Login (/staff/login) */}
        {/* Mobile-first: stacks vertically at 375px with 100% tap-target coverage */}
        <div className="flex flex-col gap-3 max-w-xs sm:max-w-sm mx-auto w-full">
          <Link
            to="/search"
            className="btn btn-primary btn-md sm:btn-lg w-full gap-2 shadow-sm font-bold text-sm sm:text-base min-h-[44px]"
            id="find-item-button"
          >
            <Search size={18} />
            <span>Find an Item</span>
          </Link>

          <Link
            to="/staff/login"
            className="btn btn-outline btn-secondary btn-md sm:btn-lg w-full gap-2 font-semibold text-sm sm:text-base min-h-[44px]"
            id="staff-login-button"
          >
            <Shield size={18} />
            <span>Staff Login</span>
          </Link>
        </div>
      </div>

      {/* Quick Info Grid - Responsive cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
        <div className="card bg-base-100/90 border border-base-200 p-4 text-center shadow-xs">
          <Clock size={20} className="text-primary mx-auto mb-1.5" />
          <h2 className="text-xs sm:text-sm font-bold text-base-content mb-0.5">Instant Cataloging</h2>
          <p className="text-[11px] sm:text-xs text-base-content/60">New finds logged by staff on duty within minutes.</p>
        </div>

        <div className="card bg-base-100/90 border border-base-200 p-4 text-center shadow-xs">
          <MapPin size={20} className="text-accent mx-auto mb-1.5" />
          <h2 className="text-xs sm:text-sm font-bold text-base-content mb-0.5">Location Tracking</h2>
          <p className="text-[11px] sm:text-xs text-base-content/60">Identifies specific halls, rooms, and quad benches.</p>
        </div>

        <div className="card bg-base-100/90 border border-base-200 p-4 text-center shadow-xs">
          <CheckCircle2 size={20} className="text-success mx-auto mb-1.5" />
          <h2 className="text-xs sm:text-sm font-bold text-base-content mb-0.5">In-Person Claim</h2>
          <p className="text-[11px] sm:text-xs text-base-content/60">Verified pickup at the Central Student Information Desk.</p>
        </div>
      </div>
    </div>
  );
}
