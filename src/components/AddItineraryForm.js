// src/components/AddItineraryForm.js
import React, { useState } from 'react';
import { appendTripData, fetchTripsAsObjects } from '../services/GoogleSheetsSyncService';

const AddItineraryForm = ({ onNewTrips }) => {
  // Adjust these to match your Sheet’s columns:
  const [confirmation, setConfirmation] = useState('');
  const [destination, setDestination] = useState('');
  const [dateRange, setDateRange] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Build the row in the same order as your sheet:
    const newRow = [confirmation, destination, dateRange /*, other fields if any */];

    try {
      // 1) Append to the Sheet
      await appendTripData(newRow, 'Sheet1!A1:AB1');
      // 2) Re-fetch all trips and inform parent
      const updated = await fetchTripsAsObjects('Sheet1!A1:AB1000');
      onNewTrips(updated);
      // 3) Clear the form
      setConfirmation('');
      setDestination('');
      setDateRange('');
    } catch (err) {
      alert('There was an error adding your itinerary. See the console for details.');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
      <h3>Add New Itinerary</h3>

      <div>
        <label>Confirmation #: </label>
        <input
          type="text"
          value={confirmation}
          onChange={e => setConfirmation(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Destination: </label>
        <input
          type="text"
          value={destination}
          onChange={e => setDestination(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Date Range: </label>
        <input
          type="text"
          value={dateRange}
          onChange={e => setDateRange(e.target.value)}
          placeholder="e.g. 2025-08-01 to 2025-08-05"
          required
        />
      </div>

      <button type="submit">Add Itinerary</button>
    </form>
  );
};

export default AddItineraryForm;
