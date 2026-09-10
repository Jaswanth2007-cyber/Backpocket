import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import CollegeWatermark from './components/CollegeWatermark';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import StaffLogin from './pages/StaffLogin';
import StaffDashboard from './pages/StaffDashboard';
import Search from './pages/Search';
import ItemDetail from './pages/ItemDetail';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="relative min-h-screen flex flex-col bg-base-200/50 text-base-content font-sans antialiased selection:bg-primary/20 selection:text-primary">
          {/* Subtle collegiate watermark background element */}
          <CollegeWatermark />

          {/* Persistent Navbar */}
          <Navbar />

          {/* Main Content Area */}
          <main className="relative z-10 flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/search" element={<Search />} />
              <Route path="/item/:id" element={<ItemDetail />} />
              <Route path="/staff/login" element={<StaffLogin />} />

              {/* Protected staff dashboard */}
              <Route
                path="/staff/dashboard"
                element={
                  <ProtectedRoute>
                    <StaffDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="relative z-10 border-t border-base-200 bg-base-100/80 py-4 text-center text-xs text-base-content/50">
            <p>Campus Lost &amp; Found System • Central Student Office</p>
          </footer>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
