// src/services/GoogleSheetsSyncService.js
// Full replacement (drop-in). Uses httpsCallable to call `getTrips` and `addTrip`.
// Ensures the Firebase client library includes the current user's ID token
// so the callable function (which requires auth) accepts it.

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

  // Pass email if the server (admin) flow needs it; server also checks auth token.
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

  // Run local aggregator so TripCard gets the rich objects it expects.
  try {
    const trips = aggregateTripData(rows);
    return trips;
  } catch (e) {
    console.error('[fetchTripsAsObjects] aggregateTripData failed; returning raw rows', e?.message);
    return rows;
  }
};

/**
 * Adds a trip via callable.
 * Minimal change: we now only send `confirmation`.
 * The server derives first/last/email from the verified user token, and ignores
 * any client-supplied destination/dateRange to prevent tampering.
 */
export const addTrip = async (tripData) => {
  // Support both { confirmation } and { trip: { confirmation } } shapes
  const confirmation =
    tripData?.confirmation ??
    (tripData?.trip && tripData.trip.confirmation) ??
    null;

  if (!confirmation) {
    throw new Error('A confirmation code is required to add a trip.');
  }

  const addTripFn = httpsCallable(functions, 'addTrip');

  try {
    // Only send confirmation; identity comes from the server-side token
    const response = await addTripFn({ trip: { confirmation } });
    return response.data;
  } catch (err) {
    console.error('[addTrip] ERROR', { message: err?.message, stack: err?.stack });
    throw new Error(`Failed to add trip: ${err?.message || String(err)}`);
  }
};
