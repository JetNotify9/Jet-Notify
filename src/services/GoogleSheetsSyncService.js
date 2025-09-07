// src/services/GoogleSheetsSyncService.js
/* eslint-disable no-console */
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../firebase';
import { aggregateTripData } from '../components/tripAggregator';

// Use the same region as your Cloud Function.
const functions = getFunctions(app, 'us-central1');

/**
 * Fetch trips for the signed-in user.
 * Server returns raw rows; we aggregate to objects for the UI.
 */
export const fetchTripsAsObjects = async (userEmail) => {
  const getTripsFn = httpsCallable(functions, 'getTrips');
  const payload = userEmail ? { email: userEmail } : {};
  let data;

  try {
    const res = await getTripsFn(payload);
    data = res?.data;
  } catch (err) {
    console.error('[getTrips] ERROR', { message: err?.message, stack: err?.stack });
    throw new Error(`Failed to fetch trips: ${err?.message || String(err)}`);
  }

  let rows = [];
  if (Array.isArray(data?.trips)) rows = data.trips;
  else if (Array.isArray(data)) rows = data;
  else if (Array.isArray(data?.rows)) rows = data.rows;

  try {
    return aggregateTripData(rows);
  } catch (e) {
    console.error('[fetchTripsAsObjects] aggregateTripData failed; returning raw rows', e?.message);
    return rows;
  }
};

/**
 * Add a trip.
 * Minimal + safe: only send confirmation; server derives first/last/email from the ID token.
 */
export const addTrip = async (tripData) => {
  const confirmation =
    tripData?.confirmation ??
    (tripData?.trip && tripData.trip.confirmation) ??
    null;

  if (!confirmation) {
    throw new Error('A confirmation code is required to add a trip.');
  }

  const addTripFn = httpsCallable(functions, 'addTrip');

  try {
    const response = await addTripFn({ trip: { confirmation } });
    return response.data;
  } catch (err) {
    console.error('[addTrip] ERROR', { message: err?.message, stack: err?.stack });
    throw new Error(`Failed to add trip: ${err?.message || String(err)}`);
  }
};
