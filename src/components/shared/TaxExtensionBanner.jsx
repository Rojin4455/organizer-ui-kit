import React from 'react';
import { Alert, Box, Button } from '@mui/material';
import { Description as DescriptionIcon, ChevronRight } from '@mui/icons-material';

export const TaxExtensionBanner = ({ onNavigate, onClose }) => {
  const handleClick = () => {
    if (onNavigate) {
      onNavigate();
    } else {
      window.open('https://api.leadconnectorhq.com/widget/form/8wLjUj6fcD8BpHvxdpPz', '_blank');
    }
  };

  return (
    <Box sx={{ 
      position: 'sticky', 
      top: 0, 
      zIndex: 10,
      mb: 3,
      px: { xs: 1, sm: 0 }
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
          },
          '& .MuiAlert-icon': {
            alignItems: { xs: 'flex-start', sm: 'center' },
            paddingTop: { xs: '12px', sm: '16px' }
          }
        }}
        onClose={onClose || undefined}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between', 
          width: '100%', 
          gap: { xs: 2, sm: 2 },
        }}>
          <Box sx={{ flex: 1, width: '100%' }}>
            <Box 
              component="span" 
              sx={{ 
                fontSize: { xs: '0.75rem', sm: '0.875rem' }, 
                display: 'block', 
                lineHeight: 1.6,
                wordBreak: 'break-word'
              }}
            >
              Do you need an Extension? Due dates for Multi Member LLCs and S Corps are March 15h. Single Member LLCs and C Corps are April 15th- Fill out this form to place an extension with us -{' '}
              <Box
                component="span"
                onClick={handleClick}
                sx={{
                  color: '#3b82f6',
                  fontWeight: 600,
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  display: 'inline-block',
                  '&:hover': {
                    color: '#1d4ed8',
                  }
                }}
              >
                CLICK HERE
              </Box>
            </Box>
          </Box>
          <Button
            variant="contained"
            endIcon={<ChevronRight />}
            onClick={handleClick}
            sx={{
              ml: { xs: 0, sm: 2 },
              whiteSpace: 'nowrap',
              minWidth: { xs: '100%', sm: 'auto' },
              width: { xs: '100%', sm: 'auto' },
              fontSize: { xs: '0.875rem', sm: '1rem' },
              py: { xs: 1, sm: 1.5 }
            }}
          >
            Request Extension
          </Button>
        </Box>
      </Alert>
    </Box>
  );
};

