// src/pages/DashboardPage.js
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { fetchTripsAsObjects } from '../services/GoogleSheetsSyncService';
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
      fetchTripsAsObjects()
        .then((tripData) => {
          setTrips(tripData);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error loading trips:", err);
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
