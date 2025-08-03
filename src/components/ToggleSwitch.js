import React from 'react';

const ToggleSwitch = ({ label, checked, onChange }) => (
  <div style={{ margin: '10px 0' }}>
    <label>
      {label}
      <input type="checkbox" checked={checked} onChange={onChange} />
    </label>
  </div>
);

export default ToggleSwitch;
