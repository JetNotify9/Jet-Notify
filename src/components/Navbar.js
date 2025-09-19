// src/components/Navbar.js
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      // After logging out, return to login page
      navigate('/login');
    } catch (err) {
      // Soft-fail to console; UI already has SnackbarMessage in the app
      // and AccountManagementPage exposes auth actions if needed.
      console.error('Logout failed:', err);
    }
  };

  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 20px',
        backgroundColor: '#eee',
        color: '#333'
      }}
    >
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#333', fontWeight: 700 }}>
          JetNotify
        </Link>
        {user && (
          <>
            <Link to="/dashboard" style={{ textDecoration: 'none', color: '#333' }}>
              Dashboard
            </Link>
            <Link to="/settings" style={{ textDecoration: 'none', color: '#333' }}>
              Settings
            </Link>
            <Link to="/account" style={{ textDecoration: 'none', color: '#333' }}>
              Account
            </Link>
          </>
        )}
      </div>

      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        {user ? (
          <button
            type="button"
            onClick={handleLogout}
            style={{
              cursor: 'pointer',
              border: '1px solid #333',
              padding: '6px 12px',
              background: 'transparent',
              borderRadius: '6px'
            }}
          >
            Logout
          </button>
        ) : (
          <>
            <Link to="/login" style={{ textDecoration: 'none', color: '#333' }}>
              Login
            </Link>
            <Link to="/signup" style={{ textDecoration: 'none', color: '#333' }}>
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
