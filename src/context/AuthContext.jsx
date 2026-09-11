import React, { createContext, useContext, useState } from 'react';

const AUTH_STORAGE_KEY = 'campus_lost_found_staff_auth';
const VALID_STAFF_CODE = 'STAFF2026';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const login = async (code) => {
    // Real validation of code; returns a promise to support async UI flow
    if (code.trim() === VALID_STAFF_CODE) {
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, 'true');
      } catch (e) {
        console.error('Failed to write to localStorage', e);
      }
      setIsAuthenticated(true);
      return { success: true };
    }
    return { success: false, error: 'Incorrect code — try again' };
  };

  const logout = () => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear localStorage', e);
    }
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
