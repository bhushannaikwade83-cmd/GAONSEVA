import React from 'react';
import { Box, Typography } from '@mui/material';

const ManageHomeNavbar = () => {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        नेव्हबार संपादन
      </Typography>
      <Typography variant="body1">
        येथे होमपेजवरील नेव्हबारशी संबंधित माहिती संपादित करा.
      </Typography>
    </Box>
  );
};

export default ManageHomeNavbar;



