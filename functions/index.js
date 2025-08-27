const functions = require('firebase-functions');
const { google } = require("googleapis");
const sheets = google.sheets("v4");

exports.getTrips = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Request not authenticated.');
  }
  const userEmail = context.auth.token.email;
  const isAdmin = context.auth.token.admin === true;

  try {
    const authClient = await google.auth.getClient({
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    google.options({ auth: authClient });

    const spreadsheetId = functions.config().google.sheet_id;
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A1:AB1000'
    });
    const rows = res.data.values || [];

    let filteredRows = [];
    if (isAdmin && data.email) {
      filteredRows = rows.filter(row => row[3] === data.email);
    } else if (!isAdmin) {
      filteredRows = rows.filter(row => row[3] === userEmail);
    } else {
      filteredRows = rows;
    }

    const userConfirms = new Set(filteredRows.map(row => row[0]));
    const resultRows = rows.filter(row => userConfirms.has(row[0]));
    return resultRows;

  } catch (err) {
    console.error("Error reading sheet:", err);
    throw new functions.https.HttpsError('internal', 'Unable to retrieve trips data');
  }
});

exports.addTrip = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be signed in to add trips.');
    }
    const userEmail = context.auth.token.email || "";
    const { confirmation, destination, dateRange } = data;
    if (!confirmation || !destination || !dateRange) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing trip fields.');
    }
  
    try {
      const authClient = await google.auth.getClient({
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
      });
      google.options({ auth: authClient });
  
      const spreadsheetId = functions.config().google.sheet_id;
      const newRow = [
        confirmation, "", "", userEmail, destination, "", ""
      ];
      if (typeof dateRange === 'string' && dateRange.includes('-')) {
        const parts = dateRange.split('-').map(s => s.trim());
        newRow[5] = parts[0];
        newRow[6] = parts[1] || "";
      } else {
        newRow[5] = dateRange;
      }
  
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Sheet1!A1:AB1',
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: { values: [newRow] }
      });
      return { success: true };
  
    } catch (err) {
      console.error("Error appending to sheet:", err);
      throw new functions.https.HttpsError('internal', 'Failed to add trip');
    }
  });
  