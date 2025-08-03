// src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TripDetailPage from './pages/TripDetailPage';
import AccountManagementPage from './pages/AccountManagementPage';
import SettingsPage from './pages/SettingsPage';
import SignupPage from './pages/SignupPage'; // <-- NEW import for the Sign Up page
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SnackbarMessage from './components/SnackbarMessage';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} /> {/* <-- NEW sign-up route */}

        {/* Private routes (require authentication) */}
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/trip/:tripId" 
          element={
            <PrivateRoute>
              <TripDetailPage />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/account" 
          element={
            <PrivateRoute>
              <AccountManagementPage />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <PrivateRoute>
              <SettingsPage />
            </PrivateRoute>
          } 
        />

        {/* Catch-all route: if no match, go to /login */}
        <Route path="*" element={<LoginPage />} />
      </Routes>

      <Footer />
      <SnackbarMessage />
    </div>
  );
}

export default App;
