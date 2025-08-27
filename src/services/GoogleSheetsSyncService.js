// src/services/GoogleSheetsSyncService.js
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../firebase';

// Initialize the Cloud Functions client
const functions = getFunctions(app);

/**
 * Fetch trips for a given user email via the getTrips Cloud Function.
 * @param {string} userEmail - The email of the user whose trips to fetch.
 * @returns {Promise<Array>} An array of trip objects.
 */
export const fetchTripsAsObjects = async (userEmail) => {
  if (!userEmail) {
    throw new Error('User email is required to fetch trips.');
  }

  // Invoke the Gen 2 callable function, which automatically sends auth token
  const getTripsFn = httpsCallable(functions, 'getTrips');
  const response = await getTripsFn({ email: userEmail });

  // The Cloud Function returns { trips: [...] }
  return response.data.trips || [];
};

/**
 * Add a new trip record via the addTrip Cloud Function.
 * @param {Object} tripData - The trip details to add.
 * @returns {Promise<Object>} The result of the addTrip function.
 */
export const addTrip = async (tripData) => {
  if (!tripData) {
    throw new Error('Trip data is required to add a trip.');
  }

  const addTripFn = httpsCallable(functions, 'addTripToSheet');
  const response = await addTripFn({ trip: tripData });
  return response.data;
};
