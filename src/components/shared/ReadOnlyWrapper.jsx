import React from 'react';
import { Box } from '@mui/material';

export const ReadOnlyWrapper = ({ children, readOnly = false }) => {
  if (!readOnly) {
    return children;
  }

  // Apply read-only styles to all form inputs
  const readOnlyStyles = {
    '& .MuiTextField-root': {
      '& .MuiInputBase-input': {
        color: '#374151',
        backgroundColor: '#f9fafb',
        cursor: 'default',
      },
      '& .MuiInputBase-root': {
        backgroundColor: '#f9fafb',
        '& fieldset': {
          borderColor: '#e5e7eb',
        },
        '&:hover fieldset': {
          borderColor: '#e5e7eb',
        },
        '&.Mui-focused fieldset': {
          borderColor: '#e5e7eb',
        },
      },
      '& .MuiInputLabel-root': {
        color: '#6b7280',
        '&.Mui-focused': {
          color: '#6b7280',
        },
      },
    },
    '& .MuiFormControlLabel-root': {
      '& .MuiCheckbox-root': {
        color: '#6b7280',
        '&.Mui-checked': {
          color: '#6b7280',
        },
      },
      '& .MuiRadio-root': {
        color: '#6b7280',
        '&.Mui-checked': {
          color: '#6b7280',
        },
      },
      '& .MuiSwitch-root': {
        '& .MuiSwitch-thumb': {
          backgroundColor: '#9ca3af',
        },
        '& .MuiSwitch-track': {
          backgroundColor: '#d1d5db',
        },
      },
    },
    '& .MuiSelect-root': {
      backgroundColor: '#f9fafb',
      color: '#374151',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#e5e7eb',
      },
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: '#e5e7eb',
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: '#e5e7eb',
      },
    },
    '& .MuiButton-root': {
      display: 'none', // Hide action buttons in read-only mode
    },
    '& button': {
      display: 'none', // Hide all buttons
    },
  };

  return (
    <Box sx={readOnlyStyles}>
      {React.cloneElement(children, {
        ...children.props,
        // Override onChange to prevent any data changes
        onChange: () => {},
        // Pass through data but prevent modifications
        ...(children.props.data && { data: { ...children.props.data } }),
        // Disable all inputs at the component level
        disabled: true,
        readOnly: true,
      })}
    </Box>
  );
};