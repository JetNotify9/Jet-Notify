// src/components/TripCard.js
import React from 'react';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import SegmentGraph from './SegmentGraph';

// Helper to format a single date from "MM/DD/YY" or "MM-DD-YY" to "Month D, YYYY"
const formatDate = (dateStr) => {
  const parts = dateStr.split(/[\/-]/);
  if (parts.length !== 3) return dateStr;
  let [month, day, year] = parts;
  if (year.length === 2) {
    year = "20" + year;
  }
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const mIndex = parseInt(month, 10) - 1;
  if (mIndex < 0 || mIndex > 11) return dateStr;
  return `${monthNames[mIndex]} ${parseInt(day, 10)}, ${year}`;
};

// Helper to format a date range (expects a "start - end" format)
const formatDateRange = (range) => {
  if (!range) return '';
  const dates = range.split(' - ');
  if (dates.length === 2) {
    return `${formatDate(dates[0])} - ${formatDate(dates[1])}`;
  }
  return range;
};

// Helper function to dynamically split and render flight leg details
const renderLegs = (detail) => {
  if (!detail) return null;
  const legs = detail.split(/(?=[A-Z]{3}-[A-Z]{3}:)/);
  return legs.map((leg, index) => (
    <p key={index} style={{ margin: 0 }}>{leg.trim()}</p>
  ));
};

// Helper function to split and render remaining seats info dynamically
const renderRemainingSeats = (data) => {
  if (!data) return null;
  const sections = data.split(/(?=[A-Z]{3}-[A-Z]{3}:)/);
  return sections.map((section, index) => (
    <p key={index} style={{ margin: 0 }}>{section.trim()}</p>
  ));
};

// Helper function to render grouped current offers, with cleanup and fallback
const renderGroupedOffers = (offers) => {
  if (!offers || offers.length === 0) {
    return <p>No Offers Available</p>;
  }
  // Filter out any incomplete/empty artifacts
  const validOffers = offers.filter(o => {
    if (!o.offerM || !o.offerN) return false;
    if (o.offerM.trim() === '-' || o.offerN.trim() === '-') return false;
    // ensure price and miles are numeric
    if (isNaN(parseFloat(o.offerO)) || isNaN(parseFloat(o.offerP))) return false;
    return true;
  });
  if (validOffers.length === 0) {
    return <p>No Offers Available</p>;
  }
  // Group by route
  const grouped = validOffers.reduce((acc, offer) => {
    const route = offer.offerM;
    if (!acc[route]) acc[route] = [];
    acc[route].push(offer);
    return acc;
  }, {});
  // Render each group with spacing between
  return Object.entries(grouped).map(([route, offs]) => (
    <div key={route} style={{ marginBottom: '12px' }}>
      <p style={{ margin: 0 }}>{route}</p>
      {offs.map((offer, i) => (
        <p key={i} style={{ margin: 0 }}>
          {offer.offerN} ${offer.offerO} {offer.offerP} miles
        </p>
      ))}
    </div>
  ));
};

// NEW: Helper function to render the detailed flight segments from Column AB
const renderFlightSegmentsDetailed = (segments) => {
  if (!segments || segments.length === 0) return null;
  return segments.map((seg, idx) => (
    <div key={idx} style={{ marginBottom: '10px' }}>
      <p style={{ margin: 0 }}>
        <strong>{seg.flightNumber}: {seg.route} ({seg.departureTime}-{seg.arrivalTime})</strong>
      </p>
      <p style={{ margin: 0 }}>
        {seg.aircraftName} ({seg.aircraftCode})
      </p>
      <p style={{ margin: 0 }}>
        {seg.duration}, {seg.distanceNm} nm
      </p>
    </div>
  ));
};

const TripCard = ({ trip }) => {
  const {
    confirmation,
    destination,
    dateRange,
    flightLegDetails,
    remainingSeats,
    currentOffers,
    upgradeOfferHistory,
    seatAvailabilityHistory,
    // NEW: the new property from the aggregator
    flightSegmentsDetailed,
  } = trip;

  const formattedDateRange = formatDateRange(dateRange);

  // Compute unique segments for the SegmentGraph
  const allSegments = new Set();
  if (upgradeOfferHistory) {
    upgradeOfferHistory.forEach(item => {
      if (item.route) allSegments.add(item.route);
    });
  }
  if (seatAvailabilityHistory) {
    Object.keys(seatAvailabilityHistory).forEach(route => {
      allSegments.add(route);
    });
  }

  // Determine the chart order: use the AB sequence if available, otherwise fallback
  const orderedSegments = flightSegmentsDetailed && flightSegmentsDetailed.length > 0
    ? flightSegmentsDetailed.map(seg => seg.route)
    : Array.from(allSegments);

  return (
    <Box
      sx={{
        border: '1px solid #ccc',
        padding: '15px',
        marginBottom: '15px',
        borderRadius: '4px',
        backgroundColor: '#fafafa',
      }}
    >
      {/* Header Section */}
      <Box sx={{ marginBottom: '10px' }}>
        <h3 style={{ marginBottom: 0 }}>{destination}</h3>
        <p style={{ marginTop: 0 }}>{formattedDateRange}</p>
        {/* NEW: Render detailed flight segments if available */}
        {renderFlightSegmentsDetailed(flightSegmentsDetailed)}
        {/* Retain the old flightLegDetails if needed */}
        {flightLegDetails && renderLegs(flightLegDetails)}
      </Box>

      {/* Current Offer Section */}
      <Box sx={{ marginBottom: '10px' }}>
        <h4>Current Offer</h4>
        {renderGroupedOffers(currentOffers)}
      </Box>

      {/* Remaining Seats Section */}
      <Box sx={{ marginBottom: '10px' }}>
        <h4>Remaining Seats</h4>
        {remainingSeats && renderRemainingSeats(remainingSeats)}
      </Box>

      {/* Combined History Graphs Section */}
      <Box sx={{ marginBottom: '10px' }}>
        <h4>Combined History Graphs</h4>
        {orderedSegments.map(segment => (
          <SegmentGraph
            key={segment}
            segment={segment}
            upgradeOfferHistory={upgradeOfferHistory}
            seatAvailabilityHistory={seatAvailabilityHistory}
          />
        ))}
      </Box>

      {/* View Details Link */}
      <Box sx={{ marginTop: '10px' }}>
        <Link to={`/trip/${confirmation}`}>View Details</Link>
      </Box>
    </Box>
  );
};

export default TripCard;
