import React from 'react';
import { Box, Typography, Paper, Alert } from '@mui/material';

export const BusinessReview = ({ data }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Business Tax Organizer Summary
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Business Name: {data.basicInfo?.businessName || 'Not provided'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Entity Type: {data.basicInfo?.entityType || 'Not selected'}
        </Typography>
      </Paper>

      <Alert severity="info">
        Please review all information before submitting your business tax organizer.
      </Alert>
    </Box>
  );
};