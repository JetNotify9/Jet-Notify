// src/pages/LoginPage.js
import React, { useContext, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const LoginPage = () => {
  const { login, signup } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        await signup(email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>{isSignUp ? "Sign Up" : "Login"}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label><br />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label>Password:</label><br />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">{isSignUp ? "Sign Up" : "Log In"}</button>
      </form>
      <button onClick={() => setIsSignUp(!isSignUp)} style={{ marginTop: '10px' }}>
        {isSignUp ? "Have an account? Log In" : "Don't have an account? Sign Up"}
      </button>
    </div>
  );
};

export default LoginPage;
