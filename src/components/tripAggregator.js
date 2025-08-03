// src/components/tripAggregator.js
import { AIRCRAFT_DESIGNATORS } from '../data/aircraftDesignators';

/**
 * Converts a decimal-hour float to a string like "5h 16m".
 * E.g. 5.27 => 5h 16m (since 0.27 * 60 ~ 16).
 */
function formatHours(decimalHours) {
  const hours = Math.floor(decimalHours);
  const minutes = Math.round((decimalHours - hours) * 60);
  return `${hours}h ${minutes}m`;
}

/**
 * Parses a single line of flight info from Column AB.
 * Example input:
 *   "DL0014: ATL-FRA, 9:10a-11:26a, 5.27 hours, 2167 nm, 3M2, -25"
 * Returns an object with structured data.
 */
function parseFlightSegmentLine(line) {
  // Split by commas first:
  const parts = line.split(',').map(p => p.trim());
  if (parts.length < 5) {
    return null;
  }

  // Part 0: "DL0014: ATL-FRA"
  const flightNumberAndRoute = parts[0].split(':').map(p => p.trim());
  if (flightNumberAndRoute.length < 2) {
    return null;
  }
  const flightNumber = flightNumberAndRoute[0];
  const route = flightNumberAndRoute[1];

  // Part 1: "9:10a-11:26a"
  const timeRange = parts[1];
  const [departureTime, arrivalTime] = timeRange.split('-').map(p => p.trim());

  // Part 2: "5.27 hours"
  const hourString = parts[2].replace('hours', '').trim();
  const decimalHours = parseFloat(hourString) || 0;
  const formattedDuration = formatHours(decimalHours);

  // Part 3: "2167 nm"
  const distanceString = parts[3].replace('nm', '').trim();
  const distanceNm = parseInt(distanceString, 10) || 0;

  // Part 4: "3M2" (the aircraft code)
  const aircraftCode = parts[4];

  // Look up the full aircraft name in our dictionary
  const aircraftName = AIRCRAFT_DESIGNATORS[aircraftCode] || 'Unknown Aircraft';

  return {
    flightNumber,
    route,
    departureTime,
    arrivalTime,
    duration: formattedDuration,
    distanceNm,
    aircraftCode,
    aircraftName,
  };
}

export function aggregateTripData(rows) {
  if (!rows || rows.length === 0) return [];

  // Group rows by confirmation number (Column A, index 0)
  const groups = {};
  rows.forEach((row) => {
    const confirmation = row[0] || "";
    if (!confirmation) return;
    if (!groups[confirmation]) {
      groups[confirmation] = [];
    }
    groups[confirmation].push(row);
  });

  const trips = Object.keys(groups).map((confirmation) => {
    const group = groups[confirmation];
    // Determine the header row: first row with non-empty Column E (index 4)
    const headerRow = group.find((row) => row[4] && row[4].trim() !== "") || group[0];

    // Extract header fields
    const destination = headerRow[4] || "";
    const dateRange = `${headerRow[5] || ""} - ${headerRow[6] || ""}`;
    const flightLegDetails = headerRow[10] || "";
    const remainingSeats = headerRow[25] || "";

    // Build current offers array from all rows (Columns M, N, O, P: indexes 12-15)
    const currentOffers = group.map((row) => ({
      offerM: row[12] || "",
      offerN: row[13] || "",
      offerO: row[14] || "",
      offerP: row[15] || "",
    }));

    // Aggregate upgrade offer history from all rows (Column X, index 23)
    let upgradeOfferHistory = [];
    group.forEach((row) => {
      let raw = row[23] || "";
      if (typeof raw === "string" && raw.trim() !== "") {
        const lines = raw.split('\n').filter(line => line.trim() !== "");
        const offers = lines.map((line) => {
          const regex = /\((.*?)\)/g;
          const matches = [];
          let match;
          while ((match = regex.exec(line)) !== null) {
            matches.push(match[1].trim());
          }
          return {
            route: matches[0] || "",
            service: matches[1] || "",
            price: matches[2] || "",
            amount: matches[3] || "",
            timestamp: matches[4] || "",
          };
        });
        upgradeOfferHistory.push(...offers);
      }
    });

    // Parse seat availability history from header row (Column AA, index 26)
    let seatAvailabilityHistoryRaw = (headerRow[26] || "").replace(/\r/g, "");
    let seatAvailabilityHistory = {};
    if (seatAvailabilityHistoryRaw.trim() !== "") {
      const lines = seatAvailabilityHistoryRaw
        .split('\n')
        .map(line => line.trim())
        .filter(line => line !== "");
      let currentRoute = "";
      lines.forEach(line => {
        if (line.endsWith(":")) {
          currentRoute = line.slice(0, -1).trim();
          seatAvailabilityHistory[currentRoute] = [];
        } else if (currentRoute) {
          seatAvailabilityHistory[currentRoute].push(line);
        }
      });
      if (Object.keys(seatAvailabilityHistory).length === 0) {
        seatAvailabilityHistory["All Data"] = [seatAvailabilityHistoryRaw];
      }
    }

    // NEW: Parse the flight segment details from Column AB (index 27)
    let flightSegmentsDetailed = [];
    const rawFlightSegments = headerRow[27] || "";
    const lines = rawFlightSegments.split('\n').map(l => l.trim()).filter(l => l !== "");
    lines.forEach(line => {
      const parsed = parseFlightSegmentLine(line);
      if (parsed) {
        flightSegmentsDetailed.push(parsed);
      }
    });

    return {
      confirmation,
      destination,
      dateRange,
      flightLegDetails,
      remainingSeats,
      currentOffers,
      upgradeOfferHistory,
      seatAvailabilityHistory,
      // NEW property
      flightSegmentsDetailed,
    };
  });

  return trips;
}
