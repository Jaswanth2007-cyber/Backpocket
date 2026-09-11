import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Search, LogOut, Compass } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const isSearch = location.pathname === '/search';
  const isStaff = location.pathname.startsWith('/staff');

  return (
    <header className="sticky top-0 z-50 bg-base-100/90 backdrop-blur border-b border-base-200">
      <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 text-primary font-bold text-lg hover:opacity-90 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-primary text-primary-content flex items-center justify-center shadow-sm">
            <Compass size={18} />
          </div>
          <span className="tracking-tight text-base-content font-extrabold">Backpocket</span>
          <span className="badge badge-primary badge-sm font-semibold hidden sm:inline-flex">Campus L&amp;F</span>
        </Link>

        {/* Navigation Actions */}
        <nav className="flex items-center gap-1.5 sm:gap-2" aria-label="Main Navigation">
          <Link
            to="/search"
            className={`btn btn-sm ${isSearch ? 'btn-primary' : 'btn-ghost text-base-content'} gap-1.5`}
          >
            <Search size={15} />
            <span>Search</span>
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/staff/dashboard"
                className={`btn btn-sm ${isStaff ? 'btn-primary' : 'btn-outline btn-primary'} gap-1.5`}
              >
                <Shield size={15} />
                <span>Dashboard</span>
              </Link>
              <button
                type="button"
                onClick={logout}
                className="btn btn-sm btn-ghost text-error"
                title="Log out"
                aria-label="Log out of staff session"
              >
                <LogOut size={15} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <Link
              to="/staff/login"
              className={`btn btn-sm ${isStaff ? 'btn-primary' : 'btn-outline btn-primary'} gap-1.5`}
            >
              <Shield size={15} />
              <span>Staff Login</span>
            </Link>
          )}

          {/* Theme Mode Toggle (Sun/Moon) */}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
