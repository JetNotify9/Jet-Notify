// src/pages/DashboardPage.js
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { initGapiClient, startPolling, fetchTripsAsObjects } from '../services/GoogleSheetsSyncService';
import TripCard from '../components/TripCard';
import AddItineraryForm from '../components/AddItineraryForm';


const DashboardPage = () => {
  const { user } = useContext(AuthContext);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      setLoading(true);
      initGapiClient()
        .then(() => {
          startPolling("Sheet1!A1:AB1000"); // Start polling (optional)
          return fetchTripsAsObjects("Sheet1!A1:AB1000");
        })
        .then((tripData) => {
          setTrips(tripData);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching trip data:", err);
          setError("Failed to load trip data. Please try again later.");
          setLoading(false);
        });
    }
  }, [user]);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Dashboard</h2>
      {user ? (
  <>
-   {error && <p style={{ color: 'red' }}>{error}</p>}
+   {/* 1) Add-Itinerary form goes here */}
+   <AddItineraryForm onNewTrips={setTrips} />
+
+   {/* 2) Any error message */}
+   {error && <p style={{ color: 'red' }}>{error}</p>}

    {/* 3) The list of trips */}
    {trips.length > 0 ? (
      trips.map(trip => <TripCard key={trip.confirmation} trip={trip} />)
    ) : (
      !loading && <p>No trips found.</p>
    )}
  </>
) : (
  <p>Please log in to see your dashboard.</p>
)}

    </div>
  );
};

export default DashboardPage;
