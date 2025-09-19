// src/pages/LoginPage.js
import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const LoginPage = () => {
  const { login, signup } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (isSignUp) {
        await signup(email, password);
      } else {
        await login(email, password);
      }
      // ⬇️ On success, go straight to dashboard; HashRouter will render at /#/dashboard
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err?.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '40px auto', padding: 20, border: '1px solid #ddd', borderRadius: 8 }}>
      <h2 style={{ marginTop: 0 }}>{isSignUp ? 'Sign Up' : 'Log In'}</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>
            Email:{' '}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%' }}
              required
            />
          </label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>
            Password:{' '}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%' }}
              required
            />
          </label>
        </div>
        {error && <p style={{ color: 'red', marginTop: 8 }}>{error}</p>}
        <button type="submit" style={{ marginTop: 8 }}>
          {isSignUp ? 'Sign Up' : 'Log In'}
        </button>
      </form>

      <button onClick={() => setIsSignUp(!isSignUp)} style={{ marginTop: 14 }}>
        {isSignUp ? 'Have an account? Log In' : "Don't have an account? Sign Up"}
      </button>
    </div>
  );
};

export default LoginPage;
