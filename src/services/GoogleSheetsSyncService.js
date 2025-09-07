// src/services/GoogleSheetsSyncService.js
// Full replacement (drop-in). Uses httpsCallable to call `getTrips` and `addTrip`.
// This ensures the Firebase client library includes the current user's ID token
// with the request so the callable function (which requires auth) accepts it.
//
// NOTE: we explicitly target the us-central1 region (where getTrips is deployed)
// to avoid region mismatches. If you prefer a different region, change the
// 'us-central1' string to the region of your functions deployment.

/* eslint-disable no-console */
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../firebase';
import { aggregateTripData } from '../components/tripAggregator';

// Use the same region as your Cloud Function.
const functions = getFunctions(app, 'us-central1');

/**
 * Fetches trips for the signed-in user and returns objects the UI expects.
 * - Calls the getTrips callable (which returns raw sheet rows: arrays).
 * - Runs those rows through aggregateTripData() to build rich trip objects,
 *   including parsing complex array-like data stored inside single cells.
 */
export const fetchTripsAsObjects = async (userEmail) => {
  const getTripsFn = httpsCallable(functions, 'getTrips');

  // Pass email if your server uses it (server also checks auth token).
  const payload = userEmail ? { email: userEmail } : {};

  let data;
  try {
    const response = await getTripsFn(payload);
    data = response?.data;
  } catch (err) {
    console.error('[getTrips] ERROR', { message: err?.message, stack: err?.stack });
    throw new Error(`Failed to fetch trips: ${err?.message || String(err)}`);
  }

  // Accept either { trips: [...] } or a bare array, or { rows: [...] }.
  let rows = [];
  if (Array.isArray(data?.trips)) {
    rows = data.trips;
  } else if (Array.isArray(data)) {
    rows = data;
  } else if (Array.isArray(data?.rows)) {
    rows = data.rows;
  }

  // Important: run your local aggregator to produce the rich objects TripCard expects.
  // This preserves your previous behavior and correctly handles array-in-a-cell columns.
  try {
    const trips = aggregateTripData(rows);
    return trips;
  } catch (e) {
    console.error('[fetchTripsAsObjects] aggregateTripData failed; returning raw rows', e?.message);
    // As a fallback, return rows so the UI can at least render something.
    return rows;
  }
};

/**
 * Adds a trip via callable.
 * Keep as-is; no change to behavior.
 */
export const addTrip = async (tripData) => {
  if (!tripData) {
    throw new Error('Trip data is required to add a trip.');
  }

  const addTripFn = httpsCallable(functions, 'addTrip');

  try {
    const response = await addTripFn({ trip: tripData });
    return response.data;
  } catch (err) {
    console.error('[addTrip] ERROR', { message: err?.message, stack: err?.stack });
    throw new Error(`Failed to add trip: ${err?.message || String(err)}`);
  }
};
