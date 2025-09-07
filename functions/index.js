// functions/index.js

// 1) Import the v2 onCall handler, so we can enable Firebase ID–token auth in Gen2
const { onCall } = require('firebase-functions/v2/https');
const functions = require('firebase-functions');
const { google } = require('googleapis');
const sheets = google.sheets('v4');

/**
 * Callable: getTrips
 * - Requires auth (context.auth)
 * - Reads rows from Sheet1!A1:AB1000
 * - Filters by email in column D (row[3]); admins can pass data.email to view others
 * - Returns { trips: [...] }
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

    const spreadsheetId = functions.config().google?.sheet_id;
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
      console.error('[getTrips] missing functions.config().google.sheet_id');
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
 * - Appends a row to Sheet1 with: confirmation, "", "", userEmail, destination, start, end
 */
exports.addTrip = onCall(
  {
    region: 'us-central1',
    callableOptions: {
      allowUnauthenticated: false
    }
  },
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be signed in to add trips.');
    }

    const spreadsheetId = functions.config().google?.sheet_id;
    if (!spreadsheetId) {
      console.error('[addTrip] missing functions.config().google.sheet_id');
      throw new functions.https.HttpsError('internal', 'Server missing sheet configuration.');
    }

    const userEmail = context.auth.token?.email || '';
    const { confirmation, destination, dateRange } = data || {};

    console.log('[addTrip] start', {
      userEmail,
      hasConfirmation: !!confirmation,
      hasDestination: !!destination,
      dateRange,
    });

    if (!confirmation || !destination || !dateRange) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing trip fields.');
    }

    try {
      const authClient = await google.auth.getClient({
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
      google.options({ auth: authClient });

      const newRow = [confirmation, '', '', userEmail, destination, '', ''];
      if (typeof dateRange === 'string' && dateRange.includes('-')) {
        const parts = dateRange.split('-').map((s) => s.trim());
        newRow[5] = parts[0];
        newRow[6] = parts[1] || '';
      } else {
        newRow[5] = dateRange;
      }

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
