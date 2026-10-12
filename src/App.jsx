import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Bookings from './pages/Bookings';
import Therapists from './pages/Therapists';
import Enquiries from './pages/Enquiries';
import Plans from './pages/Plans';
import Profile from './pages/Profile';
import Reports from './pages/Reports';

// Protected Route Guard
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('neuravia_admin_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Router>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected Admin Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="reports" element={<Reports />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="therapists" element={<Therapists />} />
          <Route path="enquiries" element={<Enquiries />} />
          <Route path="plans" element={<Plans />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
