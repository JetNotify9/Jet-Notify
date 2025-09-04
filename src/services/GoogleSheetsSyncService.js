// src/services/GoogleSheetsSyncService.js
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../firebase';

// initialize functions client
const functions = getFunctions(app);

/**
 * Fetch trips for a given user email via the getTrips Cloud Function.
 * If your Cloud Function returns { trips: [...] } it will pick that; otherwise it will try data directly.
 * @param {string} userEmail
 * @returns {Promise<Array>}
 */
export const fetchTripsAsObjects = async (userEmail) => {
  if (!userEmail) {
    throw new Error('User email is required to fetch trips.');
  }

  // Call the callable function 'getTrips'
  const getTripsFn = httpsCallable(functions, 'getTrips');
  // pass email as part of the payload (the function should use context.auth but this is helpful)
  const response = await getTripsFn({ email: userEmail });

  // firebase callable returns an object with .data
  const payload = response.data;
  // Common shapes: { trips: [...] } or an array directly
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.trips)) return payload.trips;
  // fallback: try to return payload.data if that is an array
  if (Array.isArray(payload.data)) return payload.data;
  // otherwise return empty and let caller handle shape
  return payload;
};

/**
 * Add a new trip via addTrip callable function (if you use it)
 * @param {Object} tripData
 */
export const addTrip = async (tripData) => {
  if (!tripData) {
    throw new Error('Trip data is required to add a trip.');
  }
  const addTripFn = httpsCallable(functions, 'addTrip');
  const response = await addTripFn({ trip: tripData });
  return response.data;
};
