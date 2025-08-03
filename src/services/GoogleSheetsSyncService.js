// src/services/GoogleSheetsSyncService.js

// Import the aggregator function from the tripAggregator file.
import { aggregateTripData } from '../components/tripAggregator';

// Your API key from Google Cloud Console
const API_KEY = process.env.REACT_APP_GOOGLE_SHEETS_API_KEY;
// Discovery document for the Google Sheets API (v4)
const DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];
// Your Google Sheet ID (from the URL of your sheet)
const SPREADSHEET_ID = process.env.REACT_APP_SHEET_ID;

// In-memory cache to store the sheet data
let cachedData = null;
let lastFetched = 0;
const CACHE_DURATION = 5 * 60 * 1000; // Cache duration: 5 minutes

/**
 * Initializes the gapi client.
 * Returns a Promise that resolves once the client is initialized.
 */
export const initGapiClient = () => {
  return new Promise((resolve, reject) => {
    if (!window.gapi) {
      return reject(new Error("gapi not loaded"));
    }
    window.gapi.load("client", async () => {
      try {
        await window.gapi.client.init({
          apiKey: API_KEY,
          discoveryDocs: DISCOVERY_DOCS,
        });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
};

/**
 * Fetches data from the specified range in your Google Sheet.
 * Includes simple retry logic: retries up to `retries` times with a delay.
 *
 * @param {string} range - The A1 notation range (e.g., "Sheet1!A1:AB1000").
 * @param {number} retries - Number of attempts before failing (default: 3).
 * @param {number} delay - Delay between retries in milliseconds (default: 1000).
 * @returns {Promise<Array>} - Resolves with an array of rows.
 */
export const getSheetData = async (range, retries = 3, delay = 1000) => {
  if (!window.gapi || !window.gapi.client) {
    throw new Error("gapi client not initialized");
  }
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await window.gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: range,
      });
      return response.result.values; // Each row is an array
    } catch (error) {
      if (attempt < retries - 1) {
        console.warn(`Attempt ${attempt + 1} failed. Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        console.error("All attempts to fetch sheet data failed:", error);
        throw error;
      }
    }
  }
};

/**
 * Fetches sheet data, using cached data if it’s still fresh.
 *
 * @param {string} range - The A1 notation range.
 * @returns {Promise<Array>} - Resolves with the sheet data.
 */
export const fetchSheetData = async (range) => {
  const now = Date.now();
  if (cachedData && now - lastFetched < CACHE_DURATION) {
    return cachedData;
  }
  const data = await getSheetData(range);
  cachedData = data;
  lastFetched = now;
  return data;
};

/**
 * Starts a polling mechanism to automatically update the cached sheet data.
 *
 * @param {string} range - The A1 notation range.
 * @param {number} interval - Polling interval in milliseconds (default: CACHE_DURATION).
 */
export const startPolling = (range, interval = CACHE_DURATION) => {
  setInterval(async () => {
    try {
      const data = await getSheetData(range);
      cachedData = data;
      lastFetched = Date.now();
      console.log("Sheet data updated via polling.");
    } catch (error) {
      console.error("Polling error:", error);
    }
  }, interval);
};

/**
 * Fetches sheet data and returns an array of aggregated trip objects.
 *
 * @param {string} range - The A1 notation range.
 * @returns {Promise<Array>} - Resolves with an array of trip objects.
 */
export const fetchTripsAsObjects = async (range) => {
  // Fetch raw sheet data (array of arrays)
  const rows = await fetchSheetData(range);
  // Process the rows using the aggregator function to create trip objects
  return aggregateTripData(rows);
};

/**
 * Appends a new row to your Google Sheet.
 *
 * @param {Array<string>} values – an array of cell values, in the same order as your sheet’s columns.
 * @param {string} range – e.g. "Sheet1!A1:AB1" (the target columns; only the start row matters for append).
 */
export const appendTripData = async (values, range) => {
  // ensure the client is initialized
  await window.gapi.client.init({ 
    apiKey: API_KEY, 
    discoveryDocs: DISCOVERY_DOCS 
  });
  return window.gapi.client.sheets.spreadsheets.values
    .append({
      spreadsheetId: SPREADSHEET_ID,
      range: range,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: { values: [values] },
    })
    .then(response => {
      console.log('Append response', response);
      return response;
    })
    .catch(err => {
      console.error('Error appending data:', err);
      throw err;
    });
};
