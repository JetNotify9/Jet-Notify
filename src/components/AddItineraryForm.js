// src/components/AddItineraryForm.js
import React, { useState } from 'react';
import { addTrip, fetchTripsAsObjects } from '../services/GoogleSheetsSyncService';

const AddItineraryForm = ({ onNewTrips }) => {
  // Only need confirmation now; server derives identity from the auth token.
  const [confirmation, setConfirmation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      // Send only confirmation; the server will fill B/C/D from the user profile.
      await addTrip({ confirmation });

      // Optionally refresh trips for the current user (server filters by token).
      if (typeof onNewTrips === 'function') {
        const trips = await fetchTripsAsObjects(); // no email needed; token is used server-side
        onNewTrips(trips);
      }

      setConfirmation('');
    } catch (err) {
      setError(err?.message || 'Failed to add trip');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
      <div style={{ marginBottom: 8 }}>
        <label htmlFor="confirmation" style={{ display: 'block', fontWeight: 600 }}>
          Confirmation
        </label>
        <input
          id="confirmation"
          type="text"
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          placeholder="e.g. ABC123"
          required
        />
      </div>

      <button type="submit" disabled={submitting}>
        {submitting ? 'Adding…' : 'Add Itinerary'}
      </button>

      {error && (
        <p style={{ color: 'red', marginTop: 8 }}>
          {error}
        </p>
      )}
    </form>
  );
};

export default AddItineraryForm;
