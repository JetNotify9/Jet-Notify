import React from 'react';
import Box from '@mui/material/Box';

const SnackbarMessage = () => (
  <Box sx={{ position: 'fixed', bottom: '10px', left: '10px', backgroundColor: '#eee', padding: '10px' }}>
    <p>Snackbar message (placeholder)</p>
  </Box>
);

export default SnackbarMessage;
