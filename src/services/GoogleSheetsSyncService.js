// src/services/GoogleSheetsSyncService.js

import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';

// Fetch trips by calling your Cloud Function "getTrips"
export const fetchTripsAsObjects = async () => {
  const getTrips = httpsCallable(functions, 'getTrips');
  const result = await getTrips();
  // result.data should contain whatever your function returns
  return result.data.trips;
};

// Add a new trip by calling your Cloud Function "addTrip"
export const addTripToSheet = async (tripData) => {
  const addTrip = httpsCallable(functions, 'addTrip');
  const result = await addTrip(tripData);
  return result.data;
};
