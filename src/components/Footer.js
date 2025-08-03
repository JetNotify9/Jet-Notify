import React from 'react';
import Box from '@mui/material/Box';

const Footer = () => (
  <Box sx={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f0f0f0', marginTop: '2rem' }}>
    <p>© {new Date().getFullYear()} JetNotify. All rights reserved.</p>
  </Box>
);

export default Footer;
