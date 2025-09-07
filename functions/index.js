// functions/index.js

// 1) Imports (Gen-2 callable)
const { onCall } = require('firebase-functions/v2/https');
const functions = require('firebase-functions');
const { google } = require('googleapis');
const sheets = google.sheets('v4');
const { defineString } = require('firebase-functions/params');

// 2) Parametrized config (Gen-2: replaces functions.config())
const GOOGLE_SHEET_ID = defineString('GOOGLE_SHEET_ID');

// Utility: extract first/last name from auth token safely (no client input)
function extractNamesFromAuth(auth) {
  const t = auth?.token || {};
  // Prefer standard OIDC-style claims if present
  let first = t.given_name || t.givenName || '';
  let last = t.family_name || t.familyName || '';
  if (!first && !last) {
    // Fallback to display name
    const name = t.name || '';
    if (name) {
      const parts = String(name).trim().split(/\s+/);
      first = parts[0] || '';
      last = parts.length > 1 ? parts.slice(1).join(' ') : '';
    }
  }
  return { firstName: first, lastName: last };
}

/**
 * Callable: getTrips
 * - Requires auth (request.auth)
 * - Reads rows from Sheet1!A1:AB1000
 * - Filters by email in column D (row[3]); admins can pass data.email to view others
 * - Returns { trips: [...] } (raw rows; frontend aggregates to objects)
 */
exports.getTrips = onCall(
  {
    region: 'us-central1',
    callableOptions: {
      // ensure the function will accept Firebase Auth ID tokens
    }
  },
  async (request) => {
    const { data, auth } = request;

    if (!auth) {
      // Emulator/prod will surface this as UNAUTHENTICATED
      throw new functions.https.HttpsError('unauthenticated', 'Request not authenticated.');
    }

    // Gen-2 parameter value
    const spreadsheetId = GOOGLE_SHEET_ID.value();

    const emailFromToken = auth.token?.email || null;
    const isAdmin = auth.token?.admin === true;
    const emailFromData = data?.email || null;

    console.log('[getTrips] start', {
      hasAuth: !!auth,
      emailFromToken,
      emailFromData,
      isAdmin,
      spreadsheetIdPresent: !!spreadsheetId,
    });

    if (!spreadsheetId) {
      console.error('[getTrips] missing GOOGLE_SHEET_ID parameter');
      throw new functions.https.HttpsError('internal', 'Server missing sheet configuration.');
    }

    try {
      const authClient = await google.auth.getClient({
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
      google.options({ auth: authClient });

      const readRes = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Sheet1!A1:AB1000',
      });
      const rows = readRes.data.values || [];
      console.log('[getTrips] rowsRead', rows.length);

      let filterEmail = null;
      if (isAdmin && emailFromData) {
        filterEmail = emailFromData;
      } else if (!isAdmin) {
        filterEmail = emailFromToken;
      }

      let filteredRows = [];
      if (filterEmail) {
        filteredRows = rows.filter((row) => row[3] === filterEmail);
        console.log('[getTrips] filteredByEmail', {
          filterEmail,
          matched: filteredRows.length,
        });
      } else {
        filteredRows = rows;
        console.log('[getTrips] adminNoFilterAllRows', filteredRows.length);
      }

      const userConfirms = new Set(filteredRows.map((r) => r[0]));
      const resultRows = rows.filter((r) => userConfirms.has(r[0]));
      console.log('[getTrips] resultRows', resultRows.length);

      return { trips: resultRows };
    } catch (err) {
      console.error('[getTrips] ERROR', {
        message: err?.message,
        code: err?.code,
        stack: err?.stack,
      });
      throw new functions.https.HttpsError('internal', 'Unable to retrieve trips data');
    }
  }
);

/**
 * Callable: addTrip
 * - Requires auth
 * - Appends a row to Sheet1 with:
 *   A: confirmation
 *   B: first name (from user profile claims; server-derived)
 *   C: last name  (from user profile claims; server-derived)
 *   D: email      (from user profile claims; server-derived)
 *   E/F/G: intentionally left blank (Destination + Date Range removed)
 * - Ignores any client-supplied destination/dateRange to prevent tampering.
 */
exports.addTrip = onCall(
  {
    region: 'us-central1',
    callableOptions: {
      allowUnauthenticated: false
    }
  },
  async (request) => {
    const { data, auth } = request;

    if (!auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be signed in to add trips.');
    }

    const spreadsheetId = GOOGLE_SHEET_ID.value();
    if (!spreadsheetId) {
      console.error('[addTrip] missing GOOGLE_SHEET_ID parameter');
      throw new functions.https.HttpsError('internal', 'Server missing sheet configuration.');
    }

    // Identity strictly from verified token (cannot be tampered by client)
    const userEmail = auth.token?.email || '';
    const { firstName, lastName } = extractNamesFromAuth(auth);

    // Accept only confirmation from client payload (ignore destination/dateRange)
    // Support both { trip: { confirmation } } and { confirmation } shapes.
    const body = (data && typeof data === 'object') ? (data.trip || data) : {};
    const confirmation = body?.confirmation;

    console.log('[addTrip] start', {
      userEmail,
      hasConfirmation: !!confirmation,
      firstNamePresent: !!firstName,
      lastNamePresent: !!lastName,
    });

    if (!confirmation) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing confirmation.');
    }

    try {
      const authClient = await google.auth.getClient({
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
      google.options({ auth: authClient });

      // Row shape:
      // [ A: confirmation, B: firstName, C: lastName, D: email, E: '', F: '', G: '' ]
      const newRow = [confirmation, firstName || '', lastName || '', userEmail, '', '', ''];

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Sheet1!A1:AB1',
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: { values: [newRow] },
      });

      console.log('[addTrip] appended', newRow);
      return { success: true };
    } catch (err) {
      console.error('[addTrip] ERROR', {
        message: err?.message,
        code: err?.code,
        stack: err?.stack,
      });
      throw new functions.https.HttpsError('internal', 'Failed to add trip');
    }
  }
);
