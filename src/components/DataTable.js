import React from 'react';

const DataTable = ({ rows }) => (
  <table border="1" cellPadding="5" cellSpacing="0" style={{ width: '100%', margin: '20px 0' }}>
    <thead>
      <tr>
        <th>Date</th>
        <th>Price</th>
        <th>Source</th>
        <th>% Change</th>
      </tr>
    </thead>
    <tbody>
      {rows.map((row, index) => (
        <tr key={index}>
          <td>{row.date}</td>
          <td>{row.price}</td>
          <td>{row.source}</td>
          <td>{row.percentageChange}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default DataTable;
