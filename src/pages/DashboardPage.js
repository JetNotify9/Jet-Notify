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
    // When a user is present, fetch their trips
    let mounted = true;
    const loadTrips = async () => {
      if (!user || !user.email) {
        setTrips([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const fetched = await fetchTripsAsObjects(user.email);
        if (mounted) {
          // normalize: ensure array
          setTrips(Array.isArray(fetched) ? fetched : []);
        }
      } catch (err) {
        console.error('Error fetching trips:', err);
        if (mounted) setError(err.message || 'Failed to fetch trips.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadTrips();
    // if user changes (login/logout), refetch
    return () => { mounted = false; };
  }, [user]);

  return (
    <div style={{ padding: 20 }}>
      <h2>Your Trips</h2>

      {!user ? (
        <p>Please log in to see your dashboard.</p>
      ) : (
        <>
          <AddItineraryForm
            onNewTrips={() => {
              // re-fetch after someone adds a trip
              // simple approach: trigger effect by calling fetch again
              (async () => {
                try {
                  setLoading(true);
                  const fetched = await fetchTripsAsObjects(user.email);
                  setTrips(Array.isArray(fetched) ? fetched : []);
                } catch (err) {
                  console.error(err);
                  setError(err.message || 'Failed to refresh trips.');
                } finally {
                  setLoading(false);
                }
              })();
            }}
          />

          {loading && <p>Loading trips…</p>}
          {error && <p style={{ color: 'red' }}>Error: {error}</p>}

          {!loading && trips && trips.length > 0 ? (
            trips.map((trip) => <TripCard key={trip.confirmation || trip.id || JSON.stringify(trip)} trip={trip} />)
          ) : (
            !loading && <p>No trips found.</p>
          )}
        </>
      )}
    </div>
  );
};

export default DashboardPage;
