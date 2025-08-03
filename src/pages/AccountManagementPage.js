// src/pages/AccountManagementPage.js
import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const AccountManagementPage = () => {
  const {
    user,
    logout,
    updateEmail,
    updatePassword,
    deleteAccount,
    updateName,
  } = useContext(AuthContext);

  // Existing states for email and password updates
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // NEW: State for first and last name update; prepopulate from user.displayName
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Feedback messages
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  // On mount, if user.displayName exists, split it into first and last name
  useEffect(() => {
    if (user && user.displayName) {
      const names = user.displayName.split(' ');
      setFirstName(names[0] || '');
      setLastName(names.slice(1).join(' ') || '');
    }
  }, [user]);

  const handleUpdateName = async (e) => {
    e.preventDefault();
    clearMessages();
    try {
      await updateName(firstName, lastName);
      setSuccess('Name updated successfully!');
    } catch (err) {
      setError(`Failed to update name: ${err.message}`);
    }
  };

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    clearMessages();
    try {
      await updateEmail(newEmail);
      setSuccess('Email updated successfully!');
      setNewEmail('');
    } catch (err) {
      setError(`Failed to update email: ${err.message}`);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    clearMessages();
    try {
      await updatePassword(newPassword);
      setSuccess('Password updated successfully!');
      setNewPassword('');
    } catch (err) {
      setError(`Failed to update password: ${err.message}`);
    }
  };

  const handleDeleteAccount = async () => {
    clearMessages();
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }
    try {
      await deleteAccount();
      setSuccess('Account deleted successfully!');
    } catch (err) {
      setError(`Failed to delete account: ${err.message}`);
    }
  };

  if (!user) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>Account Management</h2>
        <p>No user is logged in.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Account Management</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      <p><strong>Logged in as:</strong> {user.email}</p>
      {user.displayName && (
        <p><strong>Name:</strong> {user.displayName}</p>
      )}

      <hr />

      {/* NEW: Update Name Section */}
      <form onSubmit={handleUpdateName} style={{ marginBottom: '20px' }}>
        <h3>Update Name</h3>
        <div>
          <label>
            First Name:
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              style={{ marginLeft: '10px' }}
              required
            />
          </label>
        </div>
        <div style={{ marginTop: '10px' }}>
          <label>
            Last Name:
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              style={{ marginLeft: '10px' }}
              required
            />
          </label>
        </div>
        <button type="submit" style={{ marginTop: '10px' }}>Update Name</button>
      </form>

      {/* Existing: Update Email Section */}
      <form onSubmit={handleUpdateEmail} style={{ marginBottom: '20px' }}>
        <h3>Update Email</h3>
        <label>
          New Email:
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            style={{ marginLeft: '10px' }}
            required
          />
        </label>
        <br />
        <button type="submit" style={{ marginTop: '10px' }}>Update Email</button>
      </form>

      {/* Existing: Update Password Section */}
      <form onSubmit={handleUpdatePassword} style={{ marginBottom: '20px' }}>
        <h3>Update Password</h3>
        <label>
          New Password:
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={{ marginLeft: '10px' }}
            required
          />
        </label>
        <br />
        <button type="submit" style={{ marginTop: '10px' }}>Update Password</button>
      </form>

      {/* Existing: Delete Account Section */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Delete Account</h3>
        <button onClick={handleDeleteAccount} style={{ backgroundColor: 'red', color: 'white' }}>
          Delete Account
        </button>
      </div>

      {/* Existing: Log Out Section */}
      <div>
        <h3>Log Out</h3>
        <button onClick={logout}>Log Out</button>
      </div>
    </div>
  );
};

export default AccountManagementPage;
