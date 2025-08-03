// src/components/Navbar.js
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

function Navbar() {
  const { user } = useContext(AuthContext);

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 20px',
      backgroundColor: '#eee',
      color: '#333'
    }}>
      {/* Left side: App Name/Logo */}
      <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
        JetNotify
      </div>

      {/* Right side: Nav Links */}
      <div style={{ display: 'flex', gap: '15px' }}>
        {/* Show different links if user is logged in */}
        {user ? (
          <>
            <Link to="/dashboard" style={{ textDecoration: 'none', color: '#333' }}>
              Dashboard
            </Link>
            <Link to="/account" style={{ textDecoration: 'none', color: '#333' }}>
              Account
            </Link>
            {/* 
              If you have a logout page or function, link or call it here.
              For example, if you have a /logout route or an onClick logout handler:
            */}
            <Link to="/logout" style={{ textDecoration: 'none', color: '#333' }}>
              Logout
            </Link>
          </>
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
