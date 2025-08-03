import React from 'react';

const ModalDialog = ({ open, title, children, onClose, onConfirm }) => {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{ background: '#fff', padding: '20px', borderRadius: '5px', width: '300px' }}>
        <h3>{title}</h3>
        <div>{children}</div>
        <div style={{ marginTop: '10px', textAlign: 'right' }}>
          <button onClick={onClose} style={{ marginRight: '10px' }}>Cancel</button>
          <button onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
};

export default ModalDialog;
