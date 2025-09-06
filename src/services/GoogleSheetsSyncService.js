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

// Use the same region as your Cloud Function (logs show us-central1).
// This ensures the callable client hits the right function endpoint.
const functions = getFunctions(app, 'us-central1');

/**
 * Fetch trips for a given user email via the getTrips Cloud Function.
 * If your Cloud Function returns { trips: [...] } it will pick that; otherwise
 * it will try to return the whole data object returned from the function.
 *
 * @param {string} userEmail - email to filter by (function uses context.auth but may accept admin filter)
 * @returns {Promise<Array>} - array of trip objects (or throws)
 */
export const fetchTripsAsObjects = async (userEmail) => {
  // Basic param validation:
  if (!userEmail) {
    throw new Error('User email is required to fetch trips.');
  }

  // Prepare callable
  const getTripsFn = httpsCallable(functions, 'getTrips');

  try {
    // For callable functions, the Firebase SDK automatically sends
    // the current user's ID token. The server-side function will
    // see the auth info in `context.auth`.
    //
    // Pass the email (if your function expects it). The server code
    // will check context.auth; passing email is optional depending on server logic.
    const payload = { email: userEmail };

    const response = await getTripsFn(payload);

    // The cloud function should return a structure. Common patterns:
    // - response.data = { trips: [...] }
    // - response.data = [...] (direct list)
    // Normalize both:
    const data = response?.data;

    if (!data) {
      // Unexpected but handle gracefully
      throw new Error('getTrips returned empty response.');
    }

    // If server returned { trips: [...] } prefer that
    if (Array.isArray(data.trips)) {
      return data.trips;
    }

    // If it returned a list directly, return it
    if (Array.isArray(data)) {
      return data;
    }

    // If it returned an object containing rows or similar, attempt to extract best match
    if (Array.isArray(data.rows)) {
      return data.rows;
    }

    // If we get here, return the data as-is (caller can inspect)
    return data;
  } catch (err) {
    // If cloud function throws an HttpsError('unauthenticated', ...) it means user is not signed in
    // or the token wasn't sent/accepted. Provide a helpful message for debugging.
    const message = err?.message || String(err);
    console.error('[fetchTripsAsObjects] ERROR', { message, stack: err?.stack });
    // Re-throw with a clear message for the UI to show
    throw new Error(`Failed to fetch trips: ${message}`);
  }
};

/**
 * Add a new trip via addTrip callable function (this existed already).
 * @param {Object} tripData
 * @returns {Promise<any>}
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
