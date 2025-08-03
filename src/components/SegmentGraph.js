// src/components/SegmentGraph.js
import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';

Chart.register(...registerables);

/**
 * Returns a color based on a string key.
 */
const getColorForKey = (key) => {
  const colors = {
    'Delta One® Suites': 'rgba(75, 192, 192, 1)',
    'Delta Premium Select': 'rgba(54, 162, 235, 1)',
    'D1S': 'rgba(62, 15, 107, 1)',
    'D1': 'rgba(156, 21, 177, 1)',
    'PS': 'rgba(158, 27, 82, 1)',
    'FC': 'rgba(190, 18, 96, 1)',
    'C+': 'rgba(11, 111, 193, 1)',
    'MC': 'rgba(62, 90, 184, 1)',
    'BE': 'rgba(92, 117, 172, 1)',
    default: 'rgba(201, 203, 207, 1)',
  };
  return colors[key] || colors.default;
};

/**
 * Returns true if the dataset array has at least one valid numeric y-value.
 */
const hasRealNumericData = (datasets) => {
  return datasets.some(ds =>
    ds.data.some(point => point.y !== null && !isNaN(point.y))
  );
};

const SegmentGraph = ({ segment, upgradeOfferHistory, seatAvailabilityHistory }) => {
  // ---------------------------
  // 1) Process Upgrade Offer Price History
  // ---------------------------
  const upgradeData = upgradeOfferHistory.filter(item => item.route === segment);
  const upgradeGroupsValid = {};
  const upgradeGroupsInvalid = {};

  upgradeData.forEach(item => {
    const date = new Date(item.timestamp);
    const priceStr = item.price;
    const priceNumber = parseFloat(priceStr.replace('$', '').replace(/,/g, ''));
    if (isNaN(priceNumber)) {
      // Invalid or missing price
      if (!upgradeGroupsInvalid[item.service]) {
        upgradeGroupsInvalid[item.service] = [];
      }
      upgradeGroupsInvalid[item.service].push({ x: date, y: null });
    } else {
      if (!upgradeGroupsValid[item.service]) {
        upgradeGroupsValid[item.service] = [];
      }
      upgradeGroupsValid[item.service].push({ x: date, y: priceNumber });
    }
  });

  const upgradeDatasets = [];
  Object.keys(upgradeGroupsValid).forEach(service => {
    const dataPoints = upgradeGroupsValid[service].sort((a, b) => a.x - b.x);
    upgradeDatasets.push({
      label: service,
      data: dataPoints,
      borderColor: getColorForKey(service),
      backgroundColor: getColorForKey(service),
      fill: false,
      stepped: true,
      borderDash: [],
    });
  });
  Object.keys(upgradeGroupsInvalid).forEach(service => {
    const dataPoints = upgradeGroupsInvalid[service].sort((a, b) => a.x - b.x);
    upgradeDatasets.push({
      label: service + ' (No Data)',
      data: dataPoints,
      borderColor: getColorForKey(service),
      backgroundColor: getColorForKey(service),
      fill: false,
      stepped: true,
      borderDash: [2, 2],
    });
  });

  const upgradeChartData = { datasets: upgradeDatasets };
  const upgradeChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          displayFormats: { day: 'MMM d' },
          tooltipFormat: 'MMM d',
        },
        ticks: { maxTicksLimit: 4 },
        title: { display: true, text: 'Date' },
      },
      y: {
        title: { display: true, text: 'Price ($)' },
      },
    },
    plugins: { legend: { position: 'bottom' } },
  };

  // ---------------------------
  // 2) Process Seat Availability History
  // ---------------------------
  const seatRawLines = seatAvailabilityHistory[segment] || [];
  const seatGroupsValid = {};
  const seatGroupsInvalid = {};

  seatRawLines.forEach(line => {
    // Extract timestamp from the end of the line.
    const timestampMatch = line.match(/\(([^)]+)\)$/);
    if (!timestampMatch) return;
    const timestampStr = timestampMatch[1].trim();
    const date = new Date(timestampStr);

    // Remove the timestamp part from the line, parse seat data.
    const dataPart = line.replace(/\([^)]+\)$/, '').trim();
    // Example: "D1: 18/34, PS: 0/21, C+: 2/24, MC: 137/203"
    const parts = dataPart.split(',');
    parts.forEach(part => {
      const [funcKeyRaw, valuesRaw] = part.split(':');
      if (!funcKeyRaw || !valuesRaw) return;
      const funcKey = funcKeyRaw.trim();
      const [numStr] = valuesRaw.split('/');
      const numerator = parseFloat(numStr.trim());

      if (!isNaN(numerator)) {
        if (!seatGroupsValid[funcKey]) seatGroupsValid[funcKey] = [];
        seatGroupsValid[funcKey].push({ x: date, y: numerator });
      } else {
        if (!seatGroupsInvalid[funcKey]) seatGroupsInvalid[funcKey] = [];
        seatGroupsInvalid[funcKey].push({ x: date, y: null });
      }
    });
  });

  const seatDatasets = [];
  Object.keys(seatGroupsValid).forEach(funcKey => {
    const dataPoints = seatGroupsValid[funcKey].sort((a, b) => a.x - b.x);
    seatDatasets.push({
      label: funcKey,
      data: dataPoints,
      borderColor: getColorForKey(funcKey),
      backgroundColor: getColorForKey(funcKey),
      fill: false,
      stepped: true,
      borderDash: [],
    });
  });
  Object.keys(seatGroupsInvalid).forEach(funcKey => {
    const dataPoints = seatGroupsInvalid[funcKey].sort((a, b) => a.x - b.x);
    seatDatasets.push({
      label: funcKey + ' (No Data)',
      data: dataPoints,
      borderColor: getColorForKey(funcKey),
      backgroundColor: getColorForKey(funcKey),
      fill: false,
      stepped: true,
      borderDash: [2, 2],
    });
  });

  const seatChartData = { datasets: seatDatasets };
  const seatChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          displayFormats: { day: 'MMM d' },
          tooltipFormat: 'MMM d',
        },
        ticks: { maxTicksLimit: 4 },
        title: { display: true, text: 'Date' },
      },
      y: {
        title: { display: true, text: 'Seats Available' },
      },
    },
    plugins: { legend: { position: 'bottom' } },
  };

  // ---------------------------
  // 3) Split Seat Availability into MC and Others
  // ---------------------------
  const mcDatasets = seatDatasets.filter(ds => ds.label.startsWith('MC'));
  const otherDatasets = seatDatasets.filter(ds => !ds.label.startsWith('MC'));
  const mcChartData = { datasets: mcDatasets };
  const otherSeatChartData = { datasets: otherDatasets };

  // ---------------------------
  // 4) Avoid Phantom Graphs
  // ---------------------------
  if (!segment || !segment.trim()) {
    return null;
  }
  const hasRealUpgradeData = hasRealNumericData(upgradeDatasets);
  const hasRealSeatData = hasRealNumericData(seatDatasets);
  if (!hasRealUpgradeData && !hasRealSeatData) {
    return null;
  }

  // ---------------------------
  // 5) Render the Graphs
  // ---------------------------
  return (
    <div style={{ marginBottom: '30px' }}>
      <h4>
        {segment} Graph
        {hasRealSeatData ? 's' : ''}
      </h4>

      {hasRealSeatData ? (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ width: '48%', height: '400px' }}>
            <h5>Upgrade Offer Price History</h5>
            <Line data={upgradeChartData} options={upgradeChartOptions} />
          </div>
          <div style={{ width: '48%' }}>
            <h5>Seat Availability History (Other Classes)</h5>
            <div style={{ height: '190px' }}>
              <Line data={otherSeatChartData} options={seatChartOptions} />
            </div>
            <h5>Seat Availability History (MC)</h5>
            <div style={{ height: '190px' }}>
              <Line data={mcChartData} options={seatChartOptions} />
            </div>
          </div>
        </div>
      ) : (
        <div style={{ width: '100%', height: '400px' }}>
          <h5>Upgrade Offer Price History</h5>
          <Line data={upgradeChartData} options={upgradeChartOptions} />
        </div>
      )}
    </div>
  );
};

export default SegmentGraph;
