import React from 'react';

const FormInput = ({ label, type, value, onChange, error, helperText }) => (
  <div style={{ margin: '10px 0' }}>
    <label>{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      style={{ display: 'block', width: '100%', padding: '8px' }}
    />
    {error && <p style={{ color: 'red' }}>{helperText}</p>}
  </div>
);

export default FormInput;
