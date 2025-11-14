import React from 'react';
import { Alert, AlertTitle, Box, Button } from '@mui/material';
import { Description as DescriptionIcon, ChevronRight } from '@mui/icons-material';

export const EngagementLetterBanner = ({ onNavigate, onClose }) => {
  return (
    <Box sx={{ 
      position: 'sticky', 
      top: 0, 
      zIndex: 1000,
      mb: 3
    }}>
      <Alert
        severity="info"
        icon={<DescriptionIcon />}
        sx={{
          backgroundColor: '#eff6ff',
          border: '1px solid #3b82f6',
          borderRadius: 2,
          '& .MuiAlert-message': {
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }
        }}
        onClose={onClose}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <Box>
            <AlertTitle sx={{ mb: 0.5, fontWeight: 600 }}>Action Required: Tax Engagement Letter</AlertTitle>
            <Box component="span" sx={{ fontSize: '0.875rem' }}>
              Please review and sign your Tax Engagement Letter to proceed with your tax preparation.
            </Box>
          </Box>
          <Button
            variant="contained"
            endIcon={<ChevronRight />}
            onClick={onNavigate}
            sx={{
              ml: 2,
              whiteSpace: 'nowrap',
              minWidth: 'auto'
            }}
          >
            Review & Sign
          </Button>
        </Box>
      </Alert>
    </Box>
  );
};
