import React from 'react';
import { Line } from 'react-chartjs-2';

const PriceGraph = ({ data, label }) => {
  const chartData = {
    labels: data.map(point => point.date),
    datasets: [{
      label,
      data: data.map(point => point.price),
      fill: false,
      tension: 0.1,
    }]
  };

  return <Line data={chartData} />;
};

export default PriceGraph;
